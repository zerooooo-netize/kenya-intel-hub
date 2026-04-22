import { ResponsiveContainer, Area, AreaChart } from "recharts";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  suffix?: string;
  delta: string;
  trend: "up" | "down" | "warn" | "neutral";
  color: string;
  spark: number[];
}

const trendIcons = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  warn: ArrowUpRight,
  neutral: Minus,
};

const colorMap: Record<string, { stroke: string; fill: string; text: string }> = {
  primary: { stroke: "hsl(265 95% 66%)", fill: "hsl(265 95% 66%)", text: "text-primary" },
  accent: { stroke: "hsl(205 100% 60%)", fill: "hsl(205 100% 60%)", text: "text-accent" },
  destructive: { stroke: "hsl(0 85% 62%)", fill: "hsl(0 85% 62%)", text: "text-destructive" },
  success: { stroke: "hsl(150 85% 55%)", fill: "hsl(150 85% 55%)", text: "text-success" },
};

const KpiCard = ({ label, value, suffix, delta, trend, color, spark }: KpiCardProps) => {
  const Icon = trendIcons[trend];
  const c = colorMap[color] ?? colorMap.primary;
  const trendColor =
    trend === "up" ? "text-success" :
    trend === "warn" || trend === "down" ? "text-destructive" :
    "text-muted-foreground";

  const data = spark.map((v, i) => ({ i, v }));
  const gradId = `grad-${label.replace(/\s/g, "")}`;

  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden group hover:border-primary/40 transition-smooth animate-fade-in">
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-20 blur-3xl group-hover:opacity-40 transition-opacity"
           style={{ background: c.stroke }} />

      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full" style={{ background: c.stroke }} />
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">{label}</div>
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="font-display text-[34px] font-bold tracking-tight leading-none">{value}</span>
          {suffix && <span className="text-sm text-muted-foreground font-medium">{suffix}</span>}
        </div>
        <div className={`mt-2 flex items-center gap-1.5 text-[11px] font-medium ${trendColor}`}>
          <Icon className="h-3.5 w-3.5" />
          <span className="font-mono">{delta}</span>
          <span className="text-muted-foreground/70 ml-1">vs 24h</span>
        </div>

        <div className="mt-3 h-12 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.fill} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={c.fill} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={c.stroke} strokeWidth={2} fill={`url(#${gradId})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
