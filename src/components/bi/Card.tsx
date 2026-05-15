import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function BiCard({
  title,
  subtitle,
  action,
  children,
  className,
  accent,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  accent?: "default" | "danger" | "warning" | "success";
}) {
  const accentBar = {
    default: "bg-primary/30",
    danger: "bg-danger",
    warning: "bg-warning",
    success: "bg-success",
  }[accent ?? "default"];

  return (
    <section
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-elegant)]",
        className
      )}
    >
      <span className={cn("absolute left-0 top-5 h-8 w-1 rounded-r-full", accentBar)} />
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="font-display text-sm font-semibold tracking-tight">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Kpi({
  label,
  value,
  unit,
  delta,
  trend,
  tone = "default",
  icon,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  tone?: "default" | "danger" | "warning" | "success";
  icon?: ReactNode;
}) {
  const toneClass = {
    default: "text-foreground",
    danger: "text-danger",
    warning: "text-warning",
    success: "text-success",
  }[tone];
  const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-muted-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={`font-display text-3xl font-semibold tracking-tight ${toneClass}`}>{value}</span>
        {unit && <span className="text-xs font-medium text-muted-foreground">{unit}</span>}
      </div>
      {delta && <div className={`mt-1 text-xs font-medium ${trendColor}`}>{delta}</div>}
    </div>
  );
}

export function RiskBadge({ risk }: { risk: "low" | "medium" | "high" }) {
  const map = {
    low: { label: "Baixo", cls: "bg-success/15 text-success border-success/30" },
    medium: { label: "Moderado", cls: "bg-warning/15 text-warning border-warning/40" },
    high: { label: "Alto", cls: "bg-danger/15 text-danger border-danger/30" },
  }[risk];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${map.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {map.label}
    </span>
  );
}
