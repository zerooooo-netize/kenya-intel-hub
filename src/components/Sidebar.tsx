import { ChevronRight } from "lucide-react";
import { mainModules, platformNav, systemNav } from "@/data/mockData";

const Sidebar = () => {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
      {/* Logo */}
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
        <NavSection title="Main Modules" items={mainModules} />
        <NavSection title="Platform" items={platformNav} />
        <NavSection title="System" items={systemNav} />
      </nav>

      {/* Status footer */}
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
          <button className="text-[10px] text-muted-foreground hover:text-foreground">View</button>
        </div>
      </div>
    </aside>
  );
};

const NavSection = ({ title, items }: { title: string; items: typeof mainModules }) => (
  <div>
    <div className="px-3 mb-2 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
      {title}
    </div>
    <ul className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.label}>
            <button
              className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-smooth relative ${
                item.active
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
              {!item.active && <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
          </li>
        );
      })}
    </ul>
  </div>
);

export default Sidebar;
