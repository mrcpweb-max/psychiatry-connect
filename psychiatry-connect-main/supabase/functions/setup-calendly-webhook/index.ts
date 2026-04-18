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
    const calendlyToken = Deno.env.get("CALENDLY_PERSONAL_ACCESS_TOKEN");
    if (!calendlyToken) {
      return new Response(JSON.stringify({ error: "CALENDLY_PERSONAL_ACCESS_TOKEN not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Get current user to find org URL
    const userRes = await fetch("https://api.calendly.com/users/me", {
      headers: { Authorization: `Bearer ${calendlyToken}` },
    });
    const userData = await userRes.json();
    
    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch Calendly user", details: userData }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userUri = userData.resource?.uri;
    const orgUri = userData.resource?.current_organization;

    console.log("User URI:", userUri);
    console.log("Org URI:", orgUri);

    // Step 2: Check existing webhooks and remove duplicates
    const existingRes = await fetch(
      `https://api.calendly.com/webhook_subscriptions?organization=${encodeURIComponent(orgUri)}&scope=organization`,
      { headers: { Authorization: `Bearer ${calendlyToken}` } }
    );
    const existingData = await existingRes.json();

    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/webhooks-calendly`;

    // Remove any existing webhooks pointing to our URL
    if (existingData.collection) {
      for (const hook of existingData.collection) {
        if (hook.callback_url === webhookUrl) {
          console.log("Removing existing webhook:", hook.uri);
          await fetch(hook.uri, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${calendlyToken}` },
          });
        }
      }
    }

    // Step 3: Create new webhook subscription
    const createRes = await fetch("https://api.calendly.com/webhook_subscriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${calendlyToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl,
        events: ["invitee.created", "invitee.canceled"],
        organization: orgUri,
        user: userUri,
        scope: "user",
      }),
    });

    const createData = await createRes.json();

    if (!createRes.ok) {
      return new Response(JSON.stringify({ 
        error: "Failed to create webhook", 
        details: createData,
        attempted_url: webhookUrl,
        user_uri: userUri,
        org_uri: orgUri,
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Calendly webhook registered successfully",
      webhook_url: webhookUrl,
      user_uri: userUri,
      org_uri: orgUri,
      webhook: createData.resource,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Setup error:", err);
    return new Response(JSON.stringify({ error: "Internal error", details: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
