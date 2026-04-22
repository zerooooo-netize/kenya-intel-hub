import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

const schema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(72),
  fullName: z.string().min(1).max(100).optional(),
});

const Auth = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) nav("/", { replace: true });
  }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, fullName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created. You're in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back, Commander.");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-hero">
      {/* Editorial side panel */}
      <div className="hidden lg:flex relative overflow-hidden flex-col justify-between p-12 border-r border-border/40">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: "radial-gradient(hsl(265 95% 70%) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-primary grid place-items-center font-display font-bold text-primary-foreground shadow-glow">Z</div>
          <div>
            <div className="font-display font-bold text-xl tracking-wide">ZERO</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Intelligence</div>
          </div>
        </div>

        <div className="relative max-w-md">
          <div className="text-[11px] font-semibold tracking-[0.3em] text-primary uppercase mb-4">A New Era of Intelligence</div>
          <h2 className="font-display font-bold text-5xl leading-[1.05] tracking-tight">
            Real-time clarity for<br/>
            <span className="font-editorial italic font-medium text-gradient">mission-driven</span> teams.
          </h2>
          <p className="text-muted-foreground mt-5 leading-relaxed">
            ZERO unifies social, news, and OSINT signals into one premium command surface — designed for Kenya's campaigns, brands, and policymakers.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-4 text-center">
          {[
            { v: "24.8M", l: "Mentions / day" },
            { v: "385", l: "Live sources" },
            { v: "47", l: "Counties tracked" },
          ].map((s) => (
            <div key={s.l} className="glass rounded-xl p-3">
              <div className="font-display font-bold text-2xl text-gradient">{s.v}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-7">
          <div className="lg:hidden flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center font-display font-bold text-primary-foreground shadow-glow">Z</div>
            <div>
              <div className="font-display font-bold text-xl">ZERO</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Secure Access</div>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold tracking-[0.3em] text-primary uppercase mb-3">Secure Access</div>
            <h1 className="font-display font-bold text-4xl tracking-tight leading-tight">
              {mode === "login" ? <>Welcome back, <span className="font-editorial italic font-medium text-gradient">Commander.</span></> : <>Join the <span className="font-editorial italic font-medium text-gradient">mission.</span></>}
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              {mode === "login" ? "Sign in to continue your intelligence operations." : "Create your account in seconds — first user becomes admin."}
            </p>
          </div>

          <div className="flex gap-2 p-1 rounded-xl bg-secondary/50 border border-border/60">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm rounded-lg transition-smooth font-medium ${
                  mode === m ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fn">Full name</Label>
                <Input id="fn" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="em">Email</Label>
              <Input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw">Password</Label>
              <div className="relative">
                <Input
                  id="pw"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-gradient-primary hover:opacity-90 h-11 font-semibold">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground justify-center pt-4 border-t border-border/40">
            <ShieldCheck className="h-3 w-3 text-success" /> First user becomes admin · Row-level security enforced
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
