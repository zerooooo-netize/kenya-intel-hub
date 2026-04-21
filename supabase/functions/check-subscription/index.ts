import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    if (!STRIPE_KEY) {
      await admin.from("subscribers").upsert({
        user_id: user.id, email: user.email, subscribed: false, subscription_tier: "free",
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      return new Response(JSON.stringify({ subscribed: false, tier: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const Stripe = (await import("https://esm.sh/stripe@14.21.0")).default;
    const stripe = new Stripe(STRIPE_KEY, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    let subscribed = false;
    let tier = "free";
    let endsAt: string | null = null;

    if (customers.data.length > 0) {
      const subs = await stripe.subscriptions.list({ customer: customers.data[0].id, status: "active", limit: 1 });
      if (subs.data.length > 0) {
        subscribed = true;
        const amount = subs.data[0].items.data[0].price.unit_amount ?? 0;
        tier = amount >= 19900 ? "business" : "pro";
        endsAt = new Date(subs.data[0].current_period_end * 1000).toISOString();
      }
    }

    await admin.from("subscribers").upsert({
      user_id: user.id, email: user.email,
      stripe_customer_id: customers.data[0]?.id ?? null,
      subscribed, subscription_tier: tier, subscription_end: endsAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    return new Response(JSON.stringify({ subscribed, tier, ends_at: endsAt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
