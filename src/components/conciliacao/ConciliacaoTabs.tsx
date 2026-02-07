import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ConciliacaoTabValue, ConciliacaoStats } from "@/types/conciliacao";

interface ConciliacaoTabsProps {
  value: ConciliacaoTabValue;
  onValueChange: (value: ConciliacaoTabValue) => void;
  stats: ConciliacaoStats;
  children: React.ReactNode;
}

export function ConciliacaoTabs({
  value,
  onValueChange,
  stats,
  children,
}: ConciliacaoTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onValueChange(v as ConciliacaoTabValue)}
      className="w-full"
    >
      <TabsList className="w-full grid grid-cols-4 h-auto p-1">
        <TabsTrigger
          value="pendentes"
          className={cn(
            "flex flex-col sm:flex-row items-center gap-1 py-2 px-2 sm:px-4",
            "data-[state=active]:bg-warning/10 data-[state=active]:text-warning"
          )}
        >
          <span className="text-xs sm:text-sm">Pendentes</span>
          <Badge
            variant="secondary"
            className={cn(
              "h-5 min-w-[20px] px-1.5 text-xs",
              value === "pendentes" && "bg-warning/20 text-warning"
            )}
          >
            {stats.pendentes}
          </Badge>
        </TabsTrigger>

        <TabsTrigger
          value="conciliados"
          className={cn(
            "flex flex-col sm:flex-row items-center gap-1 py-2 px-2 sm:px-4",
            "data-[state=active]:bg-success/10 data-[state=active]:text-success"
          )}
        >
          <span className="text-xs sm:text-sm">Conciliados</span>
          <Badge
            variant="secondary"
            className={cn(
              "h-5 min-w-[20px] px-1.5 text-xs",
              value === "conciliados" && "bg-success/20 text-success"
            )}
          >
            {stats.conciliados}
          </Badge>
        </TabsTrigger>

        <TabsTrigger
          value="divergentes"
          className={cn(
            "flex flex-col sm:flex-row items-center gap-1 py-2 px-2 sm:px-4",
            "data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive"
          )}
        >
          <span className="text-xs sm:text-sm">Divergentes</span>
          <Badge
            variant="secondary"
            className={cn(
              "h-5 min-w-[20px] px-1.5 text-xs",
              value === "divergentes" && "bg-destructive/20 text-destructive"
            )}
          >
            {stats.divergentes}
          </Badge>
        </TabsTrigger>

        <TabsTrigger
          value="historico"
          className="flex flex-col sm:flex-row items-center gap-1 py-2 px-2 sm:px-4"
        >
          <span className="text-xs sm:text-sm">Histórico</span>
        </TabsTrigger>
      </TabsList>

      {children}
    </Tabs>
  );
}

// Export TabsContent for use in parent component
export { TabsContent };
