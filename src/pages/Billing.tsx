import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Loader2, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";

const TIERS = [
  {
    key: "free", name: "Free", price: "KSh 0", priceUsd: 0, icon: Sparkles,
    features: ["1 monitored brand", "100 mentions/day", "Basic alerts", "Recon Bot only"],
  },
  {
    key: "pro", name: "Pro", price: "KSh 4,900", priceUsd: 39, icon: Zap, popular: true,
    features: ["10 brands", "10K mentions/day", "All 6 bots", "Realtime alerts", "PDF reports", "Email + Slack delivery"],
  },
  {
    key: "business", name: "Business", price: "KSh 24,900", priceUsd: 199, icon: Crown,
    features: ["Unlimited brands", "Unlimited mentions", "Dark web monitoring", "AI briefing builder", "Team seats", "API access", "Priority support"],
  },
];

const Billing = () => {
  const [tier, setTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setLoading(false); return; }
    const { data } = await supabase.from("subscribers").select("subscription_tier, subscribed").eq("user_id", u.user.id).maybeSingle();
    setTier(data?.subscription_tier ?? "free");
    setLoading(false);
  };

  const subscribe = async (newTier: string) => {
    if (newTier === "free") return;
    setBusy(newTier);
    try {
      // Stripe Checkout edge function (gracefully degrades when STRIPE_SECRET_KEY missing)
      const { data, error } = await supabase.functions.invoke("create-checkout", { body: { tier: newTier } });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        toast.message("Stripe not configured", { description: "Admin must add STRIPE_SECRET_KEY to enable live billing." });
      }
    } catch (e: any) {
      toast.error(e.message ?? "Checkout failed");
    } finally {
      setBusy(null);
    }
  };

  const manage = async () => {
    setBusy("manage");
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      else toast.message("No active subscription to manage.");
    } catch (e: any) {
      toast.error(e.message ?? "Portal failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">Billing & Plans</h1>
            <p className="text-muted-foreground text-sm mt-1">Choose the right tier for your campaign or organization.</p>
          </div>
          {!loading && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/40 text-primary capitalize">Current: {tier}</Badge>
              <Button variant="outline" size="sm" onClick={manage} disabled={busy === "manage"}>
                {busy === "manage" ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null} Manage
              </Button>
            </div>
          )}
        </header>

        <div className="grid md:grid-cols-3 gap-4">
          {TIERS.map((t) => {
            const Icon = t.icon;
            const isCurrent = tier === t.key;
            return (
              <Card key={t.key} className={`glass border-border/60 relative ${t.popular ? "ring-1 ring-primary/40" : ""}`}>
                {t.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-gradient-primary text-primary-foreground px-3 py-0.5 rounded-full shadow-glow">
                    Most popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-5 w-5 text-primary" /> {t.name}
                  </CardTitle>
                  <div className="text-3xl font-display font-bold mt-2">{t.price}<span className="text-xs text-muted-foreground font-normal"> /mo</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${t.popular ? "bg-gradient-primary" : ""}`}
                    variant={t.popular ? "default" : "outline"}
                    disabled={isCurrent || busy === t.key || t.key === "free"}
                    onClick={() => subscribe(t.key)}
                  >
                    {busy === t.key ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isCurrent ? "Current plan" : t.key === "free" ? "Free forever" : `Upgrade to ${t.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="glass border-border/60">
          <CardContent className="p-4 text-xs text-muted-foreground">
            Secure billing via Stripe. Cancel anytime. KSh prices indicative — Stripe charges in USD at current FX.
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default Billing;
