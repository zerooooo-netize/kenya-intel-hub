import { FileText, Megaphone, Target, Users } from "lucide-react";

const actions = [
  { label: "Generate Report", icon: FileText },
  { label: "Craft Narrative", icon: Target },
  { label: "Press Briefing", icon: Megaphone },
  { label: "Competitor Compare", icon: Users },
];

const QuickActions = () => {
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="font-display font-semibold text-lg mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary/60 border border-border/60 hover:border-primary/50 hover:bg-secondary transition-smooth text-left group"
            >
              <Icon className="h-4 w-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium truncate">{a.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
