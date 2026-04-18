import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://onlinecascpractice.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { meeting_id } = await req.json();
    if (!meeting_id) {
      return new Response(JSON.stringify({ error: "meeting_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user profile email
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .single();

    const userEmail = profile?.email || user.email;

    // Check if user is admin
    const { data: isAdminResult } = await supabaseAdmin.rpc("get_user_role", {
      user_uuid: user.id,
    });
    const isAdmin = isAdminResult === "admin";

    // Get meeting
    const { data: meeting, error: meetingError } = await supabaseAdmin
      .from("meetings")
      .select("*")
      .eq("id", meeting_id)
      .single();

    if (meetingError || !meeting) {
      return new Response(JSON.stringify({ error: "Meeting not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authorization check
    const isTeacher = meeting.teacher_email === userEmail;
    const isStudent = meeting.student_email === userEmail;

    if (!isAdmin && !isTeacher && !isStudent) {
      return new Response(JSON.stringify({ error: "Access denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check recording availability
    if (meeting.recording_status !== "available" || !meeting.zoom_play_url) {
      return new Response(JSON.stringify({ error: "Recording not available" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiry (admins bypass expiry)
    if (!isAdmin && meeting.recording_access_expires) {
      const expiresAt = new Date(meeting.recording_access_expires);
      if (new Date() > expiresAt) {
        return new Response(JSON.stringify({ error: "Recording access expired" }), {
          status: 410,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Return the play URL for the frontend to use in a secure player
    // The frontend will use this URL in a video element
    return new Response(
      JSON.stringify({
        play_url: meeting.zoom_play_url,
        meeting_time: meeting.meeting_time,
        expires_at: meeting.recording_access_expires,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Stream error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
