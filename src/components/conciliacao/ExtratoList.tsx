import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ItemCard } from "./ItemCard";
import type { ExtratoListProps } from "@/types/conciliacao";

export function ExtratoList({
  items,
  selectedId,
  onSelect,
  isLoading,
  contaInfo,
  showAllStatuses = false,
  onItemClick,
}: ExtratoListProps) {
  const filteredItems = showAllStatuses
    ? items
    : items.filter((i) => i.status_conciliacao === "pendente");

  const pendentesCount = items.filter((i) => i.status_conciliacao === "pendente").length;

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b bg-muted/30">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary" />
          Extrato Bancário
        </h3>
        {contaInfo && (
          <p className="text-xs text-muted-foreground mt-1">
            {contaInfo.banco} - Ag: {contaInfo.agencia} / CC: {contaInfo.conta}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">
          {pendentesCount} pendentes de {items.length} itens
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
                  data={item.data_transacao}
                  valor={Number(item.valor)}
                  tipo={item.tipo as "credito" | "debito"}
                  status={item.status_conciliacao}
                  isSelected={selectedId === item.id}
                  isSelectable={item.status_conciliacao === "pendente"}
                  onSelect={() => onSelect(selectedId === item.id ? null : item.id)}
                  onViewDetails={onItemClick ? () => onItemClick(item) : undefined}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhum item de extrato encontrado.</p>
              <p className="text-xs mt-1">Importe um extrato para esta conta.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
