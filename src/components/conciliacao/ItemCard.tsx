import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ItemCardProps } from "@/types/conciliacao";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Math.abs(value));
};

const statusStyles = {
  conciliado: "bg-success/10 text-success border-success/30",
  pendente: "bg-warning/10 text-warning border-warning/30",
  divergente: "bg-destructive/10 text-destructive border-destructive/30",
};

const statusLabels = {
  conciliado: "Conciliado",
  pendente: "Pendente",
  divergente: "Divergente",
};

export function ItemCard({
  descricao,
  data,
  valor,
  tipo,
  status,
  categoria,
  isSelected,
  isSelectable,
  onSelect,
  onViewDetails,
}: ItemCardProps) {
  const isPositive = tipo === "credito" || tipo === "receita";

  return (
    <div
      onClick={() => isSelectable && onSelect()}
      className={cn(
        "p-3 rounded-lg border transition-all overflow-hidden",
        isSelectable ? "cursor-pointer" : "cursor-default opacity-60",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : isSelectable
          ? "hover:bg-muted/50"
          : ""
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-2 break-words">{descricao}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(parseISO(data), "dd/MM/yyyy")}
            {categoria && ` • ${categoria}`}
          </p>
        </div>
        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1 shrink-0">
          <p
            className={cn(
              "text-sm font-semibold whitespace-nowrap",
              isPositive ? "text-success" : "text-destructive"
            )}
          >
            {isPositive ? "+" : "-"}
            {formatCurrency(valor)}
          </p>
          <Badge
            variant="outline"
            className={cn("text-xs shrink-0", statusStyles[status])}
          >
            {statusLabels[status]}
          </Badge>
        </div>
      </div>
      {onViewDetails && status !== "pendente" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          className="mt-2 text-xs text-primary hover:underline"
        >
          Ver detalhes
        </button>
      )}
    </div>
  );
}
