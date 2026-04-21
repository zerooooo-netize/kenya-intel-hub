import { Activity, AlertTriangle, BarChart3, Bot, Brain, Building2, ChevronRight, Database, Eye, FileText, Globe2, Home, LayoutDashboard, LifeBuoy, Lock, Network, Radar, Search, Settings, Shield, Sparkles, Users, Zap } from "lucide-react";

export type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  active?: boolean;
};

export const mainModules: NavItem[] = [
  { label: "Recon Bot", icon: Radar },
  { label: "Vulnerability Bot", icon: Shield },
  { label: "Identity Bot", icon: Eye },
  { label: "Threat Intel Bot", icon: AlertTriangle },
  { label: "Brand Protection", icon: Lock },
  { label: "Deep Dive Bot", icon: Brain },
];

export const platformNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Reports", icon: FileText },
  { label: "Alerts", icon: Activity, badge: "13" },
  { label: "Watchlist", icon: Eye },
  { label: "Data Explorer", icon: Database },
  { label: "Integrations", icon: Network },
];

export const systemNav: NavItem[] = [
  { label: "Settings", icon: Settings },
  { label: "Team", icon: Users },
  { label: "Billing", icon: Building2 },
];

// KPI metrics — Kenya-tailored
export const kpis = [
  { label: "Mentions Analyzed", value: "24.8M", delta: "+18.4%", trend: "up", color: "primary",
    spark: [12, 18, 14, 22, 19, 28, 26, 34, 31, 42, 38, 48] },
  { label: "Threat Score", value: "72", suffix: "/100", delta: "High Risk", trend: "warn", color: "destructive",
    spark: [40, 45, 42, 50, 48, 55, 60, 58, 64, 68, 70, 72] },
  { label: "Narratives Detected", value: "128", delta: "+27.3%", trend: "up", color: "accent",
    spark: [20, 28, 24, 36, 32, 44, 48, 56, 62, 70, 88, 128] },
  { label: "Influence Reach", value: "2.4B", delta: "+32.1%", trend: "up", color: "accent",
    spark: [10, 14, 22, 28, 36, 44, 58, 72, 88, 110, 140, 180] },
  { label: "Data Sources", value: "385", delta: "Active", trend: "neutral", color: "success",
    spark: [200, 220, 240, 260, 280, 300, 320, 340, 350, 365, 378, 385] },
];

export const sources = [
  { name: "X (Twitter)", desc: "12.4M mentions", icon: "𝕏", color: "from-slate-300 to-slate-500" },
  { name: "News Sites", desc: "Nation, Standard, Citizen — 6.8M articles", icon: "📰", color: "from-blue-400 to-cyan-400" },
  { name: "Facebook", desc: "8.1M posts", icon: "f", color: "from-blue-500 to-blue-700" },
  { name: "TikTok Kenya", desc: "3.6M videos", icon: "♪", color: "from-pink-400 to-fuchsia-500" },
  { name: "YouTube", desc: "2.7M videos", icon: "▶", color: "from-red-500 to-rose-600" },
  { name: "Dark Web", desc: "1.8K leak signals", icon: "🕸", color: "from-orange-400 to-red-500" },
  { name: "Blogs & Forums", desc: "4.1M posts", icon: "✎", color: "from-emerald-400 to-teal-500" },
];

export const aiInsights = [
  { type: "negative", text: "Negative sentiment rising around your top competitor in Nairobi & Mombasa counties." },
  { type: "trend", text: "A coordinated narrative is trending around Hustler Fund policy changes." },
  { type: "alert", text: "New impersonation accounts detected targeting your brand on TikTok Kenya." },
  { type: "opportunity", text: "Viral opportunity detected for tonight's Citizen TV debate." },
];

export const alerts = [
  { sev: "high", title: "Brand impersonation detected", time: "2m ago" },
  { sev: "medium", title: "Data leak detected on dark web", time: "15m ago" },
  { sev: "high", title: "Spike in negative sentiment", time: "28m ago" },
  { sev: "low", title: "New competitor ad campaign", time: "1h ago" },
];

export const sentiment = [
  { name: "Positive", value: 68, color: "hsl(150 85% 55%)" },
  { name: "Neutral", value: 21, color: "hsl(38 95% 60%)" },
  { name: "Negative", value: 11, color: "hsl(0 85% 62%)" },
];

export const narratives = [
  { label: "Economic Reform", value: 38, dir: "up" },
  { label: "Education Policy", value: 24, dir: "up" },
  { label: "Healthcare Access (SHA/SHIF)", value: 18, dir: "up" },
  { label: "Corruption Allegations", value: 12, dir: "down" },
  { label: "Infrastructure & Roads", value: 8, dir: "up" },
];

export const competitors = [
  { name: "Your Campaign", value: 42, color: "hsl(265 95% 66%)" },
  { name: "Competitor A", value: 28, color: "hsl(205 100% 60%)" },
  { name: "Competitor B", value: 18, color: "hsl(150 85% 55%)" },
  { name: "Others", value: 12, color: "hsl(230 15% 62%)" },
];

// Kenya counties — major hotspots with coordinates [lng, lat]
export const kenyaHotspots = [
  { name: "Nairobi", coords: [36.8219, -1.2921] as [number, number], intensity: 100, mentions: "8.4M" },
  { name: "Mombasa", coords: [39.6682, -4.0435] as [number, number], intensity: 78, mentions: "3.2M" },
  { name: "Kisumu", coords: [34.7617, -0.0917] as [number, number], intensity: 72, mentions: "2.8M" },
  { name: "Nakuru", coords: [36.0667, -0.3031] as [number, number], intensity: 65, mentions: "2.1M" },
  { name: "Eldoret", coords: [35.2698, 0.5143] as [number, number], intensity: 58, mentions: "1.7M" },
  { name: "Nyeri", coords: [36.9476, -0.4201] as [number, number], intensity: 48, mentions: "1.2M" },
  { name: "Kakamega", coords: [34.7519, 0.2827] as [number, number], intensity: 45, mentions: "980K" },
  { name: "Garissa", coords: [39.6583, -0.4569] as [number, number], intensity: 38, mentions: "640K" },
  { name: "Machakos", coords: [37.2634, -1.5177] as [number, number], intensity: 42, mentions: "820K" },
  { name: "Kericho", coords: [35.2832, -0.3689] as [number, number], intensity: 35, mentions: "510K" },
  { name: "Meru", coords: [37.6559, 0.0463] as [number, number], intensity: 40, mentions: "720K" },
  { name: "Thika", coords: [37.0833, -1.0333] as [number, number], intensity: 50, mentions: "1.4M" },
];

// Live feed time-series for the headline chart
export const reachSeries = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  reach: Math.round(80 + Math.sin(i / 3) * 40 + i * 8 + Math.random() * 25),
  mentions: Math.round(50 + Math.cos(i / 4) * 30 + i * 5 + Math.random() * 20),
}));
