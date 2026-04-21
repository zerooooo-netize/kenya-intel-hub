import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { competitors } from "@/data/mockData";

const CompetitorOverview = () => {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-display font-semibold text-lg">Share of Voice</h3>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Live</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Competitor analysis · 30 days</p>

      <div className="grid grid-cols-[1fr_1fr] items-center gap-4">
        <div className="relative h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={competitors}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {competitors.map((c) => <Cell key={c.name} fill={c.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="font-display text-2xl font-bold text-gradient">42%</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">You</div>
          </div>
        </div>

        <ul className="space-y-2.5">
          {competitors.map((c) => (
            <li key={c.name} className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                <span className="text-muted-foreground truncate text-xs">{c.name}</span>
              </div>
              <span className="font-mono font-semibold text-xs">{c.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CompetitorOverview;
