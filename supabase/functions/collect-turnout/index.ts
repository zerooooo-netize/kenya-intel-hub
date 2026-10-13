// Background job: collects official 2022 presidential turnout from IEBC.
// National figure comes from the IEBC declaration (Form 34C, 15 Aug 2022).
// County figures are parsed from IEBC's published county totals PDF and only
// marked verified when the parsed totals reconcile with the national declaration.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { extractText, getDocumentProxy } from "npm:unpdf@0.12.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ELECTION = "2022-presidential";
const JOB = "collect-turnout";
const SOURCE_URL = "https://www.iebc.or.ke/uploads/resources/QLTlLJx0Vr.pdf";
const SOURCE_TITLE = "IEBC Form 34C county totals, 2022 presidential election";
const PUBLISHED = "2022-08-15";
// Published by IEBC: 14,326,751 ballots cast of 22,120,458 registered voters.
const NATIONAL = { registered: 22120458, cast: 14326751 };
const MIN_INTERVAL_MS = 60 * 60 * 1000;

const COUNTIES = ["Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta","Garissa","Wajir","Mandera","Marsabit","Isiolo","Meru","Tharaka Nithi","Embu","Kitui","Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga","Murang'a","Kiambu","Turkana","West Pokot","Samburu","Trans Nzoia","Uasin Gishu","Elgeyo Marakwet","Nandi","Baringo","Laikipia","Nakuru","Narok","Kajiado","Kericho","Bomet","Kakamega","Vihiga","Bungoma","Busia","Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira","Nairobi"];
const pct = (cast: number, reg: number) => Math.round((cast / reg) * 10000) / 100;
const num = (s: string) => Number(s.replace(/,/g, ""));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  // Single-flight + minimum interval guard.
  const { data: last } = await db.from("job_runs").select("status, started_at").eq("job", JOB).order("started_at", { ascending: false }).limit(1).maybeSingle();
  if (last && Date.now() - new Date(last.started_at).getTime() < (last.status === "running" ? 10 * 60 * 1000 : MIN_INTERVAL_MS)) {
    return json({ skipped: true, reason: "A run happened in the last hour." });
  }
  const { data: run } = await db.from("job_runs").insert({ job: JOB }).select("id").single();
  const finish = (status: string, message: string) => db.from("job_runs").update({ status, message, finished_at: new Date().toISOString() }).eq("id", run!.id);

  // National declaration (always stored, cited).
  await db.from("turnout_results").upsert({
    election: ELECTION, scope: "national", county: "", registered_voters: NATIONAL.registered, votes_cast: NATIONAL.cast,
    turnout_pct: pct(NATIONAL.cast, NATIONAL.registered), source_title: "IEBC presidential declaration (Form 34C)", source_url: SOURCE_URL,
    published_on: PUBLISHED, verified: true, verification_note: "Matches IEBC declaration of 15 Aug 2022.", fetched_at: new Date().toISOString(),
  }, { onConflict: "election,scope,county" });

  try {
    const res = await fetch(SOURCE_URL, { headers: { "User-Agent": "ZERO turnout collector" }, signal: AbortSignal.timeout(40000) });
    if (!res.ok) throw new Error(`IEBC returned ${res.status}`);
    const pdf = await getDocumentProxy(new Uint8Array(await res.arrayBuffer()));
    const { text } = await extractText(pdf, { mergePages: true });
    const flat = (text as string).replace(/\s+/g, " ");
    const re = /(\d{3}) ([A-Z' \-]+?) COUNTY TOTAL ([\d,]+) [\d,]+ [\d,]+ [\d,]+ [\d,]+ ([\d,]+) ([\d,]+)/g;
    const rows: { county: string; registered: number; cast: number }[] = [];
    for (const m of flat.matchAll(re)) {
      const code = Number(m[1]);
      if (code < 1 || code > 47) continue;
      rows.push({ county: COUNTIES[code - 1], registered: num(m[3]), cast: num(m[4]) + num(m[5]) });
    }
    const unique = new Map(rows.map((r) => [r.county, r]));
    const regSum = [...unique.values()].reduce((s, r) => s + r.registered, 0);
    const castSum = [...unique.values()].reduce((s, r) => s + r.cast, 0);
    // County totals exclude diaspora/prisons, so they must be slightly below the national totals.
    const reconciles = unique.size === 47 && regSum <= NATIONAL.registered && regSum > NATIONAL.registered * 0.99 && castSum <= NATIONAL.cast && castSum > NATIONAL.cast * 0.99
      && [...unique.values()].every((r) => r.cast > 0 && r.cast <= r.registered);
    if (!reconciles) {
      await finish("unverified", `Parsed ${unique.size}/47 counties; totals did not reconcile with the national declaration. County data left unavailable.`);
      return json({ ok: false, counties: unique.size });
    }
    const now = new Date().toISOString();
    await db.from("turnout_results").upsert([...unique.values()].map((r) => ({
      election: ELECTION, scope: "county", county: r.county, registered_voters: r.registered, votes_cast: r.cast, turnout_pct: pct(r.cast, r.registered),
      source_title: SOURCE_TITLE, source_url: SOURCE_URL, published_on: PUBLISHED, verified: true,
      verification_note: "Valid votes + rejected ballots ÷ registered voters; county totals reconcile with national declaration.", fetched_at: now,
    })), { onConflict: "election,scope,county" });
    await finish("success", "Collected 47 counties; reconciled with national declaration.");
    return json({ ok: true, counties: 47 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    await finish("failed", `Could not read IEBC source: ${message}. County data left unavailable.`);
    return json({ ok: false, error: message });
  }
});
