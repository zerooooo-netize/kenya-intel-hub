import { ChevronRight, LayoutDashboard, Radar, Shield, Eye, AlertTriangle, Lock, Brain, Settings, Users, Map, FileText, Activity, Database, CreditCard, Megaphone } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const main = [
  { label: "Recon Bot", icon: Radar, to: "/bots/recon" },
  { label: "Vulnerability Bot", icon: Shield, to: "/bots/vulnerability" },
  { label: "Identity Bot", icon: Eye, to: "/bots/identity" },
  { label: "Threat Intel Bot", icon: AlertTriangle, to: "/bots/threat_intel" },
  { label: "Brand Protection", icon: Lock, to: "/bots/brand_protection" },
  { label: "Deep Dive Bot", icon: Brain, to: "/bots/deep_dive" },
];
const platform = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { label: "Political Map", icon: Map, to: "/political-map" },
  { label: "Reports", icon: FileText, to: "/reports" },
  { label: "Alerts", icon: Activity, to: "/alerts" },
  { label: "Data Explorer", icon: Database, to: "/data-explorer" },
  { label: "Billing", icon: CreditCard, to: "/billing" },
  { label: "Campaign Profile", icon: Megaphone, to: "/onboarding" },
];

const Sidebar = () => {
  const { isAdmin } = useAuth();
  const system = [
    ...(isAdmin ? [{ label: "Admin Panel", icon: Settings, to: "/admin" }] : []),
    { label: "Team", icon: Users, to: "/team" },
  ];

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="relative">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center font-display font-bold text-primary-foreground shadow-glow">
            Z
          </div>
          <div className="absolute -inset-1 rounded-xl bg-gradient-primary opacity-30 blur-md -z-10" />
        </div>
        <div className="leading-tight">
          <div className="font-display font-bold text-lg tracking-wide">ZERO</div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Intelligence</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        <NavSection title="Main Modules" items={main} />
        <NavSection title="Platform" items={platform} />
        <NavSection title="System" items={system} />
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="glass rounded-xl p-3 flex items-center gap-3">
          <div className="relative">
            <div className="h-2.5 w-2.5 rounded-full bg-success" />
            <div className="absolute inset-0 rounded-full bg-success animate-ping-slow" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold">System Status</div>
            <div className="text-[11px] text-success">Operational</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const NavSection = ({ title, items }: { title: string; items: any[] }) => {
  const loc = useLocation();
  return (
    <div>
      <div className="px-3 mb-2 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {title}
      </div>
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = loc.pathname === item.to;
          return (
            <li key={item.label}>
              <NavLink
                to={item.to}
                className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-smooth relative ${
                  active
                    ? "bg-gradient-primary text-primary-foreground shadow-glow font-semibold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/20 text-primary">
                    {item.badge}
                  </span>
                )}
                {!active && <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
