import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://onlinecascpractice.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { booking_id, trainer_email, trainer_name, candidate_name, candidate_email, session_mode, session_type, stations } = await req.json();

    if (!trainer_email || !candidate_name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const modeLabel = session_mode === "one_on_one" ? "1:1" : "Group";
    const typeLabel = session_type === "mock" ? "Mock" : "Learning";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 20px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🔔 New Booking Notification</h1>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #1e293b;">Hello Dr. ${trainer_name || "Trainer"},</p>
          <p style="font-size: 15px; color: #475569;">A new session has been booked with you:</p>
          
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Candidate</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${candidate_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${candidate_email || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Session Type</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${modeLabel} ${typeLabel}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Stations</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${stations} station${stations !== 1 ? "s" : ""}</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 14px; color: #64748b;">The candidate will schedule a time via your Calendly link. You'll see the session in your trainer dashboard once scheduled.</p>
          
          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">Online CASC Practice Platform</p>
          </div>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Online CASC Practice <no-reply@onlinecascpractice.com>",
        to: [trainer_email],
        subject: `New ${modeLabel} ${typeLabel} Booking from ${candidate_name}`,
        html: emailHtml,
      }),
    });

    const resData = await res.json();

    if (!res.ok) {
      console.error("Resend error:", resData);
      return new Response(JSON.stringify({ error: "Failed to send email", details: resData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Notification sent to:", trainer_email, "for booking:", booking_id);

    return new Response(JSON.stringify({ success: true }), {
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
