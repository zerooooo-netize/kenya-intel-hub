import { sources } from "@/data/mockData";
import KenyaMap from "./KenyaMap";

const IntelligenceFeed = () => {
  return (
    <div className="glass rounded-2xl p-6 lg:col-span-2 relative overflow-hidden">
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-semibold tracking-[0.22em] text-success uppercase">Live · last 15 min</span>
          </div>
          <h3 className="font-display font-semibold text-xl tracking-tight">Real-time intelligence feed</h3>
          <p className="text-xs text-muted-foreground mt-1">Signals streaming across all 47 counties</p>
        </div>
        <select className="text-xs bg-secondary/70 border border-border/60 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40">
          <option>All Counties</option>
          <option>Nairobi Metro</option>
          <option>Coast Region</option>
          <option>Western & Nyanza</option>
          <option>Rift Valley</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5">
        {/* Sources list */}
        <ul className="space-y-2.5 order-2 md:order-1">
          {sources.map((s) => (
            <li key={s.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/40 transition-smooth group cursor-pointer">
              <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-sm font-bold text-white shadow-md`}>
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{s.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{s.desc}</div>
              </div>
              <div className="h-2 w-2 rounded-full bg-success animate-pulse-slow" />
            </li>
          ))}
        </ul>

        {/* Kenya Map */}
        <div className="order-1 md:order-2 h-[360px] relative rounded-xl overflow-hidden border border-border/40 grid-bg">
          <KenyaMap />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Low Activity</span>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-accent/50" />
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="h-2 w-2 rounded-full bg-primary-glow" />
            </div>
            <span>High Activity</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceFeed;
