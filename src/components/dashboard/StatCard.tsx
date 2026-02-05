import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
  isLoading = false,
}: StatCardProps) {
  const iconStyles = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };

  if (isLoading) {
    return (
      <div className="stat-card animate-fade-in">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-11 w-11 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold text-foreground truncate">{value}</p>
          {trend && trend.value !== 0 && (
            <div className="flex items-center gap-1 mt-1 sm:mt-2 flex-wrap">
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-success flex-shrink-0" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-destructive flex-shrink-0" />
              )}
              <span
                className={cn(
                  "text-xs sm:text-sm font-medium",
                  trend.isPositive ? "text-success" : "text-destructive"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value.toFixed(1)}%
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">vs mês anterior</span>
            </div>
          )}
        </div>
        <div className={cn("p-2 sm:p-3 rounded-lg flex-shrink-0", iconStyles[variant])}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );
}
