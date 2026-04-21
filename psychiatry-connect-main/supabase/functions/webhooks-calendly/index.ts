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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const event = body.event;

    if (event !== "invitee.created") {
      return new Response(JSON.stringify({ message: "Event ignored" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = body.payload;
    const meetingId = payload?.event?.uuid || payload?.scheduled_event?.uri?.split("/").pop() || payload?.uri?.split("/").pop() || crypto.randomUUID();
    const studentEmail = payload?.email || payload?.invitee?.email;
    const teacherEmail = payload?.event?.event_memberships?.[0]?.user_email ||
      payload?.scheduled_event?.event_memberships?.[0]?.user_email;
    const meetingTime = payload?.event?.start_time || payload?.scheduled_event?.start_time;
    const scheduledEventUri = payload?.scheduled_event?.uri || payload?.event?.uri || null;
    const joinUrl = payload?.scheduled_event?.location?.join_url
      || payload?.scheduled_event?.location?.location
      || payload?.event?.location?.join_url
      || payload?.event?.location?.location
      || null;

    const { error } = await supabase.from("meetings").upsert(
      {
        meeting_id: meetingId,
        teacher_email: teacherEmail,
        student_email: studentEmail,
        meeting_time: meetingTime,
        meeting_status: "scheduled",
        recording_status: "pending",
      },
      { onConflict: "meeting_id" }
    );

    if (error) {
      console.error("DB error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (studentEmail) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", studentEmail)
        .maybeSingle();

      if (profileError) {
        console.error("Profile lookup error:", profileError);
      }

      if (profile) {
        const { data: candidateBookings, error: bookingLookupError } = await supabase
          .from("bookings")
          .select("id, calendly_event_uri, created_at")
          .eq("candidate_id", profile.id)
          .in("status", ["pending", "confirmed"])
          .order("created_at", { ascending: false })
          .limit(10);

        if (bookingLookupError) {
          console.error("Booking lookup error:", bookingLookupError);
        }

        const bookingToUpdate = (candidateBookings ?? []).find((booking: any) => !booking.calendly_event_uri) || candidateBookings?.[0];

        if (bookingToUpdate) {
          const bookingUpdate: Record<string, string> = {
            status: "confirmed",
          };

          if (meetingTime) {
            bookingUpdate.scheduled_at = meetingTime;
          }

          if (scheduledEventUri) {
            bookingUpdate.calendly_event_uri = scheduledEventUri;
          }

          if (joinUrl) {
            bookingUpdate.zoom_join_url = joinUrl;
          }

          const { error: bookingUpdateError } = await supabase
            .from("bookings")
            .update(bookingUpdate)
            .eq("id", bookingToUpdate.id);

          if (bookingUpdateError) {
            console.error("Booking update error:", bookingUpdateError);
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
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
