import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import KpiCard from "@/components/KpiCard";
import IntelligenceFeed from "@/components/IntelligenceFeed";
import SentimentOverview from "@/components/SentimentOverview";
import TopNarratives from "@/components/TopNarratives";
import CompetitorOverview from "@/components/CompetitorOverview";
import AIInsightSummary from "@/components/AIInsightSummary";
import ActiveAlerts from "@/components/ActiveAlerts";
import QuickActions from "@/components/QuickActions";
import NexoraAICard from "@/components/NexoraAICard";
import TrustBar from "@/components/TrustBar";
import { kpis } from "@/data/mockData";
import { Plus } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex bg-gradient-hero">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />

        <main className="flex-1 p-4 lg:p-8 space-y-7 overflow-x-hidden">
          {/* Welcome Hero */}
          <section className="relative rounded-3xl glass p-7 lg:p-10 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: "radial-gradient(hsl(265 95% 70%) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="absolute right-0 top-0 h-full w-1/2 opacity-50 pointer-events-none">
              <div className="absolute top-1/2 right-12 -translate-y-1/2 h-72 w-72 rounded-full bg-gradient-to-br from-primary/40 via-accent/30 to-transparent blur-3xl animate-pulse-slow" />
              <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full opacity-60">
                <defs>
                  <radialGradient id="globe">
                    <stop offset="0%" stopColor="hsl(265 95% 66%)" stopOpacity="0.5" />
                    <stop offset="70%" stopColor="hsl(205 100% 60%)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <circle cx="280" cy="200" r="140" fill="url(#globe)" />
                {Array.from({ length: 8 }).map((_, i) => (
                  <ellipse key={i} cx="280" cy="200" rx="140" ry={20 + i * 18}
                    fill="none" stroke="hsl(265 95% 66% / 0.3)" strokeWidth="0.5" />
                ))}
                {Array.from({ length: 30 }).map((_, i) => {
                  const a = (i / 30) * Math.PI * 2;
                  return (
                    <circle key={i} cx={280 + Math.cos(a) * 140} cy={200 + Math.sin(a) * 140}
                      r="1.5" fill="hsl(265 95% 80%)" />
                  );
                })}
              </svg>
            </div>

            <div className="relative flex items-end justify-between flex-wrap gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-px w-10 bg-gradient-to-r from-primary to-transparent" />
                  <span className="text-[10px] font-semibold tracking-[0.3em] text-primary uppercase">Mission Control · Live</span>
                </div>
                <h1 className="font-display font-bold text-4xl lg:text-[56px] tracking-tight leading-[1.02]">
                  Welcome back,<br/>
                  <span className="font-editorial italic font-medium text-gradient">Commander.</span>
                </h1>
                <p className="text-muted-foreground mt-4 text-sm lg:text-base leading-relaxed max-w-xl">
                  Real-time intelligence. Smarter decisions. Mission advantage —
                  <span className="text-foreground/80"> built for Kenya & East Africa.</span>
                </p>
              </div>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow hover:opacity-90 transition-smooth">
                <Plus className="h-4 w-4" /> Add Widget
              </button>
            </div>
          </section>

          {/* KPI grid */}
          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {kpis.map((kpi) => (
              <KpiCard key={kpi.label} {...(kpi as any)} />
            ))}
          </section>

          {/* Main 3-col layout */}
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <IntelligenceFeed />
            <div className="lg:col-span-1 space-y-4">
              <AIInsightSummary />
            </div>
            <div className="lg:col-span-1 space-y-4">
              <ActiveAlerts />
              <QuickActions />
            </div>
          </section>

          {/* Bottom row */}
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <SentimentOverview />
            <TopNarratives />
            <CompetitorOverview />
            <NexoraAICard />
          </section>

          <TrustBar />

          <footer className="text-center text-xs text-muted-foreground pt-4 pb-2">
            ZERO Intelligence · Compliant OSINT · Built for Kenya & East Africa
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Index;
