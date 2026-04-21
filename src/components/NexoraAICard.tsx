import { ArrowRight, Sparkles } from "lucide-react";

const NexoraAICard = () => {
  return (
    <div className="relative rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-primary/30 via-primary/10 to-accent/20 border border-primary/40 shadow-glow group">
      <div className="absolute -right-8 -top-8 h-40 w-40 bg-gradient-primary opacity-30 blur-3xl rounded-full group-hover:opacity-50 transition-opacity" />
      <div className="absolute right-2 bottom-2 opacity-30">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary-glow to-accent flex items-center justify-center animate-float">
          <Sparkles className="h-10 w-10 text-primary-foreground" />
        </div>
      </div>

      <div className="relative max-w-[60%]">
        <div className="text-[10px] font-bold tracking-[0.2em] text-primary-glow uppercase">ZERO AI</div>
        <h4 className="font-display font-bold text-xl mt-2 leading-tight">
          Your strategic co-pilot for smarter campaigns.
        </h4>
        <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/30 hover:bg-primary/50 backdrop-blur-sm border border-primary/50 text-sm font-semibold transition-smooth">
          Ask ZERO AI <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default NexoraAICard;
