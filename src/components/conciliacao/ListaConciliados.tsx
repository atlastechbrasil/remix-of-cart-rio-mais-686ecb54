import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link2Off, Eye, MoreHorizontal, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useDesvincularConciliacao } from "@/hooks/useConciliacao";
import type { ConciliacaoDetalhada } from "@/types/conciliacao";

interface ListaConciliadosProps {
  conciliacoes: ConciliacaoDetalhada[];
  isLoading?: boolean;
  onViewDetails?: (conciliacao: ConciliacaoDetalhada) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Math.abs(value));
};

export function ListaConciliados({
  conciliacoes,
  isLoading = false,
  onViewDetails,
}: ListaConciliadosProps) {
  const [confirmDesvincular, setConfirmDesvincular] = useState<ConciliacaoDetalhada | null>(null);
  const desvincular = useDesvincularConciliacao();

  const handleDesvincular = () => {
    if (confirmDesvincular) {
      desvincular.mutate(
        {
          extratoItemId: confirmDesvincular.extrato_item_id,
          lancamentoId: confirmDesvincular.lancamento_id,
        },
        {
          onSuccess: () => setConfirmDesvincular(null),
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!conciliacoes || conciliacoes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">Nenhum item conciliado neste período.</p>
        <p className="text-xs mt-1">Os itens conciliados aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-[450px]">
        <div className="space-y-3 p-1">
          {conciliacoes.map((conciliacao) => (
            <div
              key={conciliacao.id}
              className="border rounded-lg p-4 bg-success/5 border-success/20 hover:bg-success/10 transition-colors"
            >
              {/* Header with date and actions */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    Conciliado
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(parseISO(conciliacao.conciliado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onViewDetails && (
                      <DropdownMenuItem onClick={() => onViewDetails(conciliacao)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver detalhes
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => setConfirmDesvincular(conciliacao)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Link2Off className="w-4 h-4 mr-2" />
                      Desvincular
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Paired Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Extrato Item */}
                <div className="bg-background/50 rounded-md p-3 border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Extrato Bancário</p>
                  <p className="text-sm font-medium truncate">
                    {conciliacao.extrato_item?.descricao || "Item não encontrado"}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {conciliacao.extrato_item?.data_transacao
                        ? format(parseISO(conciliacao.extrato_item.data_transacao), "dd/MM/yyyy")
                        : "-"}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        conciliacao.extrato_item?.tipo === "credito" ? "text-success" : "text-destructive"
                      )}
                    >
                      {conciliacao.extrato_item?.tipo === "credito" ? "+" : "-"}
                      {formatCurrency(Number(conciliacao.extrato_item?.valor || 0))}
                    </span>
                  </div>
                </div>

                {/* Lancamento */}
                <div className="bg-background/50 rounded-md p-3 border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Lançamento do Sistema</p>
                  <p className="text-sm font-medium truncate">
                    {conciliacao.lancamento?.descricao || "Lançamento não encontrado"}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {conciliacao.lancamento?.data
                        ? format(parseISO(conciliacao.lancamento.data), "dd/MM/yyyy")
                        : "-"}
                      {conciliacao.lancamento?.categoria && ` • ${conciliacao.lancamento.categoria}`}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        conciliacao.lancamento?.tipo === "receita" ? "text-success" : "text-destructive"
                      )}
                    >
                      {conciliacao.lancamento?.tipo === "receita" ? "+" : "-"}
                      {formatCurrency(Number(conciliacao.lancamento?.valor || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Observation if exists */}
              {conciliacao.observacao && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    <strong>Observação:</strong> {conciliacao.observacao}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Confirm Desvincular Dialog */}
      <AlertDialog open={!!confirmDesvincular} onOpenChange={() => setConfirmDesvincular(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desvincular conciliação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá desfazer a conciliação entre o item do extrato e o lançamento.
              Ambos voltarão ao status "Pendente" e poderão ser conciliados novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={desvincular.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDesvincular}
              disabled={desvincular.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {desvincular.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Link2Off className="w-4 h-4 mr-2" />
              )}
              Desvincular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
