import { AlertTriangle, ArrowRight, Sparkles, TrendingUp, Zap } from "lucide-react";
import { aiInsights } from "@/data/mockData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  negative: AlertTriangle,
  trend: TrendingUp,
  alert: Zap,
  opportunity: Sparkles,
};

const colorMap: Record<string, string> = {
  negative: "text-destructive bg-destructive/10",
  trend: "text-warning bg-warning/10",
  alert: "text-primary bg-primary/10",
  opportunity: "text-success bg-success/10",
};

const AIInsightSummary = () => {
  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 h-32 w-32 bg-primary/20 rounded-full blur-3xl -z-0" />

      <div className="relative">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg">AI Insight Summary</h3>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4 ml-9">Updated 2 min ago · powered by ZERO AI</p>

        <ul className="space-y-3">
          {aiInsights.map((insight, i) => {
            const Icon = iconMap[insight.type];
            return (
              <li key={i} className="flex gap-3 group cursor-pointer">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${colorMap[insight.type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm leading-snug pt-1 text-foreground/90 group-hover:text-foreground transition-smooth">
                  {insight.text}
                </p>
              </li>
            );
          })}
        </ul>

        <button className="mt-5 w-full h-10 rounded-xl bg-gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-glow hover:opacity-90 transition-smooth">
          View Full Insights <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AIInsightSummary;
