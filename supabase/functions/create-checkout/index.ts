// Stripe Checkout session creator. Gracefully handles missing STRIPE_SECRET_KEY.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRICES: Record<string, number> = { pro: 3900, business: 19900 }; // cents USD

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { tier } = await req.json();
    if (!PRICES[tier]) {
      return new Response(JSON.stringify({ error: "Invalid tier" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_KEY) {
      return new Response(JSON.stringify({ url: null, message: "Stripe not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const Stripe = (await import("https://esm.sh/stripe@14.21.0")).default;
    const stripe = new Stripe(STRIPE_KEY, { apiVersion: "2023-10-16" });

    // Find or skip existing customer lookup (lightweight)
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customer = customers.data[0]?.id;

    const origin = req.headers.get("origin") ?? "https://app.zero.intel";
    const session = await stripe.checkout.sessions.create({
      customer: customer,
      customer_email: customer ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `ZERO Intelligence — ${tier.toUpperCase()}` },
            unit_amount: PRICES[tier],
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/billing?status=success`,
      cancel_url: `${origin}/billing?status=cancel`,
      metadata: { user_id: user.id, tier },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("checkout error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
