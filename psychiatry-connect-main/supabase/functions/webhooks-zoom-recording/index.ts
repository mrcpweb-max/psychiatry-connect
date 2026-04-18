import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const event = body.event;

    // Handle Zoom URL validation challenge
    if (event === "endpoint.url_validation") {
      const plainToken = body.payload?.plainToken;
      const secret = Deno.env.get("ZOOM_WEBHOOK_SECRET_TOKEN") || "";
      
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(plainToken));
      const hashHex = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      return new Response(
        JSON.stringify({ plainToken, encryptedToken: hashHex }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (event !== "recording.completed") {
      return new Response(JSON.stringify({ message: "Event ignored" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = body.payload?.object;
    const zoomMeetingId = String(payload?.id || "");
    const hostEmail = payload?.host_email;
    const meetingStartTime = payload?.start_time;
    const recordingFiles = payload?.recording_files || [];

    const mainRecording = recordingFiles.find(
      (f: any) => f.recording_type === "shared_screen_with_speaker_view"
    ) || recordingFiles.find(
      (f: any) => f.recording_type === "active_speaker"
    ) || recordingFiles[0];

    if (!mainRecording) {
      return new Response(JSON.stringify({ message: "No recording files found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const playUrl = mainRecording.play_url;
    const downloadUrl = mainRecording.download_url;

    console.log("Zoom recording received. Meeting ID:", zoomMeetingId, "Host:", hostEmail, "Start:", meetingStartTime);

    // Strategy 1: Try matching by meeting_id (Zoom numeric ID stored as string)
    let meeting = null;
    if (zoomMeetingId) {
      const { data } = await supabase
        .from("meetings")
        .select("*")
        .eq("recording_status", "pending")
        .or(`meeting_id.eq.${zoomMeetingId}`)
        .order("meeting_time", { ascending: false })
        .limit(1)
        .maybeSingle();
      meeting = data;
    }

    // Strategy 2: Match by meeting time proximity (within 2 hours of any pending meeting)
    if (!meeting && meetingStartTime) {
      const startTime = new Date(meetingStartTime);
      const windowBefore = new Date(startTime.getTime() - 2 * 60 * 60 * 1000).toISOString();
      const windowAfter = new Date(startTime.getTime() + 2 * 60 * 60 * 1000).toISOString();
      
      const { data } = await supabase
        .from("meetings")
        .select("*")
        .eq("recording_status", "pending")
        .gte("meeting_time", windowBefore)
        .lte("meeting_time", windowAfter)
        .order("meeting_time", { ascending: false })
        .limit(1)
        .maybeSingle();
      meeting = data;
    }

    // Strategy 3: Fallback - match by teacher email and most recent pending
    if (!meeting && hostEmail) {
      const { data } = await supabase
        .from("meetings")
        .select("*")
        .eq("teacher_email", hostEmail)
        .eq("recording_status", "pending")
        .order("meeting_time", { ascending: false })
        .limit(1)
        .maybeSingle();
      meeting = data;
    }

    if (!meeting) {
      console.log("No matching meeting found. ZoomID:", zoomMeetingId, "Host:", hostEmail);
      // Store as unmatched for manual resolution
      return new Response(JSON.stringify({ message: "No matching meeting found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Matched meeting:", meeting.id, "for Zoom meeting:", zoomMeetingId);

    const recordingCreatedAt = new Date().toISOString();
    const recordingExpiresAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

    const { error } = await supabase
      .from("meetings")
      .update({
        zoom_play_url: playUrl,
        zoom_download_url: downloadUrl,
        recording_status: "available",
        recording_created_at: recordingCreatedAt,
        recording_access_expires: recordingExpiresAt.toISOString(),
        meeting_status: "completed",
      })
      .eq("id", meeting.id);

    if (error) {
      console.error("DB error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to find a matching booking by candidate and nearest session time to create a recording entry
    if (meeting.student_email) {
      // Find profile by email
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", meeting.student_email)
        .maybeSingle();

      if (profile) {
        const { data: candidateBookings, error: bookingsError } = await supabase
          .from("bookings")
          .select(`
            id,
            scheduled_at,
            created_at,
            recording_consent,
            status,
            trainer:trainers(email),
            recordings(id)
          `)
          .eq("candidate_id", profile.id)
          .eq("recording_consent", true)
          .in("status", ["pending", "confirmed", "completed"])
          .order("created_at", { ascending: false })
          .limit(20);

        if (bookingsError) {
          console.error("Booking lookup error:", bookingsError);
        }

        const meetingTimeMs = meeting.meeting_time
          ? new Date(meeting.meeting_time).getTime()
          : meetingStartTime
            ? new Date(meetingStartTime).getTime()
            : Date.now();

        const booking = (candidateBookings ?? [])
          .filter((candidateBooking: any) => {
            const hasRecording = Array.isArray(candidateBooking.recordings)
              ? candidateBooking.recordings.length > 0
              : Boolean(candidateBooking.recordings);

            if (hasRecording) return false;

            const trainerEmail = candidateBooking.trainer?.email;
            if (!hostEmail || !trainerEmail) return true;

            return trainerEmail === hostEmail || trainerEmail === meeting.teacher_email;
          })
          .map((candidateBooking: any) => {
            const referenceTime = candidateBooking.scheduled_at || candidateBooking.created_at;
            return {
              ...candidateBooking,
              diff: Math.abs(new Date(referenceTime).getTime() - meetingTimeMs),
              hasScheduledAt: Boolean(candidateBooking.scheduled_at),
            };
          })
          .sort((a: any, b: any) => {
            if (a.hasScheduledAt !== b.hasScheduledAt) {
              return a.hasScheduledAt ? -1 : 1;
            }

            return a.diff - b.diff;
          })[0];

        if (booking) {
          const { error: recordingError } = await supabase
            .from("recordings")
            .upsert({
              booking_id: booking.id,
              recording_url: playUrl,
              expiry_date: recordingExpiresAt.toISOString(),
              status: "active",
              updated_at: recordingCreatedAt,
            }, { onConflict: "booking_id" });

          if (recordingError) {
            console.error("Recording upsert error:", recordingError);
          } else {
            console.log("Created recording entry for booking:", booking.id);
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, matched_meeting: meeting.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
