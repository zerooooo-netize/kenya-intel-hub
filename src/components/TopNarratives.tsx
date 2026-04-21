import { TrendingDown, TrendingUp } from "lucide-react";
import { narratives } from "@/data/mockData";

const TopNarratives = () => {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-lg">Top Narratives</h3>
          <p className="text-xs text-muted-foreground">Trending topics across Kenya</p>
        </div>
      </div>

      <ul className="space-y-3">
        {narratives.map((n, idx) => (
          <li key={n.label} className="group">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono text-[10px] text-muted-foreground w-4">{idx + 1}</span>
                <span className="text-sm truncate">{n.label}</span>
              </div>
              <div className={`flex items-center gap-1 text-xs font-mono font-semibold shrink-0 ${n.dir === "up" ? "text-success" : "text-destructive"}`}>
                {n.dir === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {n.value}%
              </div>
            </div>
            <div className="h-1.5 bg-secondary/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-accent rounded-full transition-all duration-700"
                style={{ width: `${n.value * 2}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopNarratives;
