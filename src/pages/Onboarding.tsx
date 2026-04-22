import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Target, MapPin, Megaphone } from "lucide-react";
import {
  ASPIRED_POSITIONS, KENYA_COUNTIES, KENYA_PARTIES, SUGGESTED_TOPICS, AspiredPosition,
} from "@/data/kenyaCounties";

type Step = 1 | 2 | 3 | 4;

const Onboarding = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const { profile, refresh } = useCandidateProfile();

  const [step, setStep] = useState<Step>(1);
  const [busy, setBusy] = useState(false);
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState<AspiredPosition | "">("");
  const [party, setParty] = useState("");
  const [county, setCounty] = useState("");
  const [constituency, setConstituency] = useState("");
  const [ward, setWard] = useState("");
  const [slogan, setSlogan] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [facebook, setFacebook] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPosition((profile.aspired_position as AspiredPosition) ?? "");
      setParty(profile.party ?? "");
      setCounty(profile.county ?? "");
      setConstituency(profile.constituency ?? "");
      setWard(profile.ward ?? "");
      setSlogan(profile.campaign_slogan ?? "");
      setTopics(profile.campaign_topics ?? []);
      setBio(profile.bio ?? "");
      setWebsite(profile.website ?? "");
      const handles = profile.social_handles ?? {};
      setTwitter(handles.twitter ?? "");
      setFacebook(handles.facebook ?? "");
    }
  }, [profile]);

  const positionMeta = useMemo(
    () => ASPIRED_POSITIONS.find((p) => p.value === position),
    [position]
  );

  const toggleTopic = (t: string) => {
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const addCustomTopic = () => {
    const t = customTopic.trim();
    if (!t) return;
    if (!topics.includes(t)) setTopics([...topics, t]);
    setCustomTopic("");
  };

  const canNext: Record<Step, boolean> = {
    1: fullName.trim().length > 1 && !!position,
    2: positionMeta?.scope === "National" ? true : !!county,
    3: topics.length > 0,
    4: true,
  };

  const save = async (markOnboarded: boolean) => {
    if (!user) return;
    setBusy(true);
    try {
      const payload = {
        user_id: user.id,
        full_name: fullName.trim(),
        aspired_position: position as AspiredPosition,
        party: party || null,
        county: county || null,
        constituency: constituency || null,
        ward: ward || null,
        campaign_slogan: slogan || null,
        campaign_topics: topics,
        bio: bio || null,
        website: website || null,
        social_handles: { twitter, facebook },
        onboarded: markOnboarded,
      };
      const { error } = await supabase
        .from("candidate_profiles")
        .upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
      await refresh();
      if (markOnboarded) {
        toast.success("Campaign profile complete. Welcome to ZERO.");
        nav("/", { replace: true });
      } else {
        toast.success("Progress saved.");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Could not save profile");
    } finally {
      setBusy(false);
    }
  };

  const next = () => setStep((s) => (s < 4 ? ((s + 1) as Step) : s));
  const back = () => setStep((s) => (s > 1 ? ((s - 1) as Step) : s));

  const stepMeta = [
    { n: 1, label: "Identity", icon: Target },
    { n: 2, label: "Geography", icon: MapPin },
    { n: 3, label: "Issues", icon: Megaphone },
    { n: 4, label: "Brand", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero p-6 lg:p-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-11 w-11 rounded-2xl bg-gradient-primary grid place-items-center font-display font-bold text-primary-foreground shadow-glow">Z</div>
          <div>
            <div className="font-display font-bold text-xl tracking-wide">ZERO</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Campaign Onboarding</div>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-10">
          {stepMeta.map((s, i) => {
            const Icon = s.icon;
            const active = step === s.n;
            const done = step > s.n;
            return (
              <div key={s.n} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-10 w-10 rounded-full grid place-items-center border-2 transition-smooth ${
                      done
                        ? "bg-success border-success text-success-foreground"
                        : active
                        ? "bg-gradient-primary border-transparent text-primary-foreground shadow-glow"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div className={`text-[10px] uppercase tracking-wider mt-2 ${active ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                    {s.label}
                  </div>
                </div>
                {i < stepMeta.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${step > s.n ? "bg-success" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="glass rounded-2xl border border-border/60 p-8 space-y-6">
          {step === 1 && (
            <>
              <div>
                <div className="text-[10px] font-semibold tracking-[0.3em] text-primary uppercase mb-2">Step 1 · Identity</div>
                <h2 className="font-display font-bold text-3xl">Who are you running as?</h2>
                <p className="text-muted-foreground text-sm mt-2">Your name and aspired seat shape every brief, scan, and alert ZERO produces.</p>
              </div>
              <div className="space-y-2">
                <Label>Full name (as on ballot)</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Hon. Jane Doe" maxLength={120} />
              </div>
              <div className="space-y-2">
                <Label>Aspired position</Label>
                <Select value={position} onValueChange={(v) => setPosition(v as AspiredPosition)}>
                  <SelectTrigger><SelectValue placeholder="Select a seat" /></SelectTrigger>
                  <SelectContent>
                    {ASPIRED_POSITIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <span className="font-medium">{p.label}</span>
                        <span className="text-muted-foreground ml-2 text-xs">· {p.scope}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Party affiliation</Label>
                <Select value={party} onValueChange={setParty}>
                  <SelectTrigger><SelectValue placeholder="Select party" /></SelectTrigger>
                  <SelectContent>
                    {KENYA_PARTIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <div className="text-[10px] font-semibold tracking-[0.3em] text-primary uppercase mb-2">Step 2 · Geography</div>
                <h2 className="font-display font-bold text-3xl">Where will you be on the ballot?</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  {positionMeta?.scope === "National"
                    ? "National race — county and constituency are optional context."
                    : `Required for ${positionMeta?.label ?? "your seat"}.`}
                </p>
              </div>
              <div className="space-y-2">
                <Label>County {positionMeta?.scope !== "National" && <span className="text-destructive">*</span>}</Label>
                <Select value={county} onValueChange={setCounty}>
                  <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {KENYA_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {(positionMeta?.scope === "Constituency" || positionMeta?.scope === "Ward") && (
                <div className="space-y-2">
                  <Label>Constituency</Label>
                  <Input value={constituency} onChange={(e) => setConstituency(e.target.value)} placeholder="e.g. Westlands" maxLength={80} />
                </div>
              )}
              {positionMeta?.scope === "Ward" && (
                <div className="space-y-2">
                  <Label>Ward</Label>
                  <Input value={ward} onChange={(e) => setWard(e.target.value)} placeholder="e.g. Parklands/Highridge" maxLength={80} />
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <div className="text-[10px] font-semibold tracking-[0.3em] text-primary uppercase mb-2">Step 3 · Issues</div>
                <h2 className="font-display font-bold text-3xl">What are your campaign topics?</h2>
                <p className="text-muted-foreground text-sm mt-2">Pick at least one. ZERO tunes the AI engine, scrapers, and alerts to what matters to your race.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TOPICS.map((t) => {
                  const on = topics.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTopic(t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-smooth ${
                        on
                          ? "bg-gradient-primary border-transparent text-primary-foreground shadow-glow"
                          : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Input
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Add custom topic"
                  maxLength={60}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTopic())}
                />
                <Button type="button" variant="secondary" onClick={addCustomTopic}>Add</Button>
              </div>
              {topics.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Selected ({topics.length})</Label>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {topics.map((t) => (
                      <Badge key={t} variant="secondary" className="cursor-pointer" onClick={() => toggleTopic(t)}>
                        {t} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <div className="text-[10px] font-semibold tracking-[0.3em] text-primary uppercase mb-2">Step 4 · Brand</div>
                <h2 className="font-display font-bold text-3xl">Tell ZERO about your brand.</h2>
                <p className="text-muted-foreground text-sm mt-2">Optional — used to personalize briefings and brand-protection scans.</p>
              </div>
              <div className="space-y-2">
                <Label>Campaign slogan</Label>
                <Input value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="e.g. A County That Works" maxLength={140} />
              </div>
              <div className="space-y-2">
                <Label>Short bio</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={500} placeholder="One paragraph that defines your candidacy." />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label>X / Twitter handle</Label>
                  <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@handle" maxLength={60} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Facebook page</Label>
                  <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="facebook.com/page" maxLength={200} />
                </div>
              </div>
            </>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <Button type="button" variant="ghost" onClick={back} disabled={step === 1 || busy}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div className="flex gap-2">
              {step < 4 && (
                <Button type="button" variant="outline" onClick={() => save(false)} disabled={busy}>
                  Save draft
                </Button>
              )}
              {step < 4 ? (
                <Button type="button" onClick={next} disabled={!canNext[step] || busy} className="bg-gradient-primary">
                  Continue <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button type="button" onClick={() => save(true)} disabled={busy} className="bg-gradient-primary">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Finish <Check className="h-4 w-4 ml-1" /></>}
                </Button>
              )}
            </div>
          </div>
        </div>

        {profile?.onboarded && (
          <div className="text-center mt-6">
            <button onClick={() => nav("/")} className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
              Skip and go to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
