import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: "primary" | "attendance" | "fees" | "performance" | "default";
  trend?: { value: number; label: string };
  className?: string;
  "data-ocid"?: string;
}

const iconColorMap = {
  primary: "bg-primary/10 text-primary",
  attendance: "bg-attendance text-[oklch(var(--chart-1))]",
  fees: "bg-fees text-[oklch(var(--chart-2))]",
  performance: "bg-performance text-[oklch(var(--chart-3))]",
  default: "bg-muted text-muted-foreground",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "default",
  trend,
  className,
  "data-ocid": dataOcid,
}: StatCardProps) {
  return (
    <div
      data-ocid={dataOcid}
      className={cn(
        "rounded-xl border bg-card shadow-card p-5 flex flex-col gap-4 transition-smooth hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground truncate">
          {title}
        </p>
        <div
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
            iconColorMap[iconColor],
          )}
        >
          <Icon className="w-4.5 h-4.5" size={18} />
        </div>
      </div>

      <div>
        <p className="text-2xl font-display font-semibold text-foreground leading-none">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "font-medium",
              trend.value >= 0
                ? "text-[oklch(var(--chart-1))]"
                : "text-destructive",
            )}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
