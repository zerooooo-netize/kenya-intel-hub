import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { sentiment } from "@/data/mockData";

const SentimentOverview = () => {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-display font-semibold text-lg">Sentiment Overview</h3>
          <p className="text-xs text-muted-foreground">Last 7 days · Kenya-wide</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1fr] items-center gap-4 mt-4">
        <div className="relative h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sentiment}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {sentiment.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="font-display text-3xl font-bold text-success">68%</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Positive</div>
          </div>
        </div>

        <ul className="space-y-2.5">
          {sentiment.map((s) => (
            <li key={s.name} className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-muted-foreground truncate">{s.name}</span>
              </div>
              <span className="font-mono font-semibold">{s.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SentimentOverview;
