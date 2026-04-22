import { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  highlight?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: ReactNode;
};

const PageHeader = ({ eyebrow, title, highlight, description, icon: Icon, actions }: Props) => (
  <header className="relative overflow-hidden rounded-3xl glass px-6 py-7 lg:px-9 lg:py-9">
    <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
    <div className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

    <div className="relative flex items-end justify-between gap-6 flex-wrap">
      <div className="min-w-0">
        {eyebrow && (
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-gradient-to-r from-primary to-transparent" />
            <span className="text-[10px] font-semibold tracking-[0.28em] text-primary uppercase">
              {eyebrow}
            </span>
          </div>
        )}
        <h1 className="font-display text-3xl lg:text-[40px] font-bold tracking-tight leading-[1.05] flex items-center gap-3">
          {Icon && (
            <span className="hidden sm:grid h-11 w-11 place-items-center rounded-2xl bg-gradient-primary shadow-glow shrink-0">
              <Icon className="h-5 w-5 text-primary-foreground" />
            </span>
          )}
          <span className="min-w-0">
            {title}
            {highlight && <> <span className="font-editorial italic font-medium text-gradient">{highlight}</span></>}
          </span>
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm lg:text-[15px] mt-3 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  </header>
);

export default PageHeader;
