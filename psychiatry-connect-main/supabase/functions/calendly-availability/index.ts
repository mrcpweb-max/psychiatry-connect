import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const calendlyToken = Deno.env.get("CALENDLY_PERSONAL_ACCESS_TOKEN");
    if (!calendlyToken) {
      return new Response(JSON.stringify({ error: "Calendly token not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, availability_data } = await req.json();

    // Get current user info
    const userRes = await fetch("https://api.calendly.com/users/me", {
      headers: { Authorization: `Bearer ${calendlyToken}` },
    });
    const userData = await userRes.json();
    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch Calendly user" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userUri = userData.resource?.uri;

    if (action === "get_event_types") {
      const eventTypesRes = await fetch(
        `https://api.calendly.com/event_types?user=${encodeURIComponent(userUri)}&active=true`,
        { headers: { Authorization: `Bearer ${calendlyToken}` } }
      );
      const eventTypesData = await eventTypesRes.json();

      return new Response(JSON.stringify({
        event_types: eventTypesData.collection || [],
        user: {
          name: userData.resource?.name,
          scheduling_url: userData.resource?.scheduling_url,
          timezone: userData.resource?.timezone,
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_scheduled_events") {
      const now = new Date().toISOString();
      const eventsRes = await fetch(
        `https://api.calendly.com/scheduled_events?user=${encodeURIComponent(userUri)}&min_start_time=${now}&status=active&sort=start_time:asc&count=20`,
        { headers: { Authorization: `Bearer ${calendlyToken}` } }
      );
      const eventsData = await eventsRes.json();

      return new Response(JSON.stringify({
        events: eventsData.collection || [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_availability") {
      const availRes = await fetch(
        `https://api.calendly.com/user_availability_schedules?user=${encodeURIComponent(userUri)}`,
        { headers: { Authorization: `Bearer ${calendlyToken}` } }
      );
      const availData = await availRes.json();

      if (!availRes.ok) {
        return new Response(JSON.stringify({ error: "Failed to fetch availability", details: availData }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        schedules: availData.collection || [],
        user: {
          name: userData.resource?.name,
          scheduling_url: userData.resource?.scheduling_url,
          timezone: userData.resource?.timezone,
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "sync_to_calendly") {
      // Calendly API does not support programmatic creation/update of availability schedules.
      // Return the current schedules and the management URL for the trainer to update manually.
      const availRes = await fetch(
        `https://api.calendly.com/user_availability_schedules?user=${encodeURIComponent(userUri)}`,
        { headers: { Authorization: `Bearer ${calendlyToken}` } }
      );
      const availData = await availRes.json();

      return new Response(JSON.stringify({
        message: "Calendly availability can be managed via the Calendly dashboard. The platform availability has been saved locally.",
        calendly_management_url: "https://calendly.com/app/availability",
        current_schedules: availData.collection || [],
        platform_availability: availability_data || null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
