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

    const { bookingId } = await req.json();
    if (!bookingId) throw new Error("Missing bookingId");

    // Fetch the booking row
    const { data: booking, error: dbError } = await supabase
      .from("bookings")
      .select("calendly_event_uri, zoom_join_url")
      .eq("id", bookingId)
      .single();

    if (dbError) throw dbError;
    if (!booking) throw new Error("Booking not found");

    if (!booking.calendly_event_uri) {
      throw new Error("No calendly_event_uri associated with this booking");
    }

    const calendlyToken = Deno.env.get("CALENDLY_PERSONAL_ACCESS_TOKEN");
    if (!calendlyToken) {
       throw new Error("CALENDLY_PERSONAL_ACCESS_TOKEN not set");
    }

    // Call calendly API
    const calendlyRes = await fetch(booking.calendly_event_uri, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${calendlyToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!calendlyRes.ok) {
      const errData = await calendlyRes.json();
      throw new Error(`Failed to fetch event from Calendly: ${JSON.stringify(errData)}`);
    }

    const eventData = await calendlyRes.json();
    const payload = eventData.resource;

    const joinUrl = payload?.location?.join_url || payload?.location?.location || null;

    if (!joinUrl) {
      throw new Error("Calendly event does not have a join_url or location generated yet.");
    }

    // Save back to database
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ zoom_join_url: joinUrl })
      .eq("id", bookingId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, zoom_join_url: joinUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("sync-calendly-booking error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
