import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ItemCard } from "./ItemCard";
import type { LancamentoListProps } from "@/types/conciliacao";

export function LancamentoList({
  items,
  selectedId,
  onSelect,
  isLoading = false,
  showAllStatuses = false,
  onItemClick,
}: LancamentoListProps) {
  const filteredItems = showAllStatuses
    ? items
    : items.filter((i) => i.status_conciliacao === "pendente");

  const pendentesCount = items.filter((i) => i.status_conciliacao === "pendente").length;

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b bg-muted/30">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          Lançamentos do Sistema
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {pendentesCount} pendentes de {items.length} lançamentos
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.id}>
                <ItemCard
                  id={item.id}
                  descricao={item.descricao}
                  data={item.data}
                  valor={Number(item.valor)}
                  tipo={item.tipo as "receita" | "despesa"}
                  status={item.status_conciliacao}
                  categoria={item.categoria}
                  isSelected={selectedId === item.id}
                  isSelectable={item.status_conciliacao === "pendente"}
                  onSelect={() => onSelect(selectedId === item.id ? null : item.id)}
                  onViewDetails={onItemClick ? () => onItemClick(item) : undefined}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhum lançamento pendente.</p>
              <p className="text-xs mt-1">Todos os lançamentos foram conciliados.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
