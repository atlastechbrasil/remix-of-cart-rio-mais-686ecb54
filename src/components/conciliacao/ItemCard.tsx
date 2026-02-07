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
        "p-3 rounded-lg border transition-all",
        isSelectable ? "cursor-pointer" : "cursor-default opacity-60",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : isSelectable
          ? "hover:bg-muted/50"
          : ""
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{descricao}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(parseISO(data), "dd/MM/yyyy")}
            {categoria && ` • ${categoria}`}
          </p>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "text-sm font-semibold",
              isPositive ? "text-success" : "text-destructive"
            )}
          >
            {isPositive ? "+" : "-"}
            {formatCurrency(valor)}
          </p>
          <Badge
            variant="outline"
            className={cn("text-xs mt-1", statusStyles[status])}
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
