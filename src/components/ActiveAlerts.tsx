import { alerts } from "@/data/mockData";

const sevColor: Record<string, string> = {
  high: "bg-destructive shadow-[0_0_8px_hsl(var(--destructive))]",
  medium: "bg-warning shadow-[0_0_8px_hsl(var(--warning))]",
  low: "bg-success shadow-[0_0_8px_hsl(var(--success))]",
};

const sevLabel: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const ActiveAlerts = () => {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-display font-semibold text-lg">Active Alerts</h3>
        <button className="text-xs text-primary hover:text-primary-glow transition-smooth font-medium">View All →</button>
      </div>

      <ul className="space-y-3">
        {alerts.map((a, i) => (
          <li key={i} className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-secondary/40 transition-smooth cursor-pointer group">
            <div className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${sevColor[a.sev]}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold capitalize text-foreground/90">{sevLabel[a.sev]}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{a.time}</span>
              </div>
              <p className="text-sm mt-0.5 leading-snug">{a.title}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActiveAlerts;
