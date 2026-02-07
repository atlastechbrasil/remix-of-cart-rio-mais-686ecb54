import { useState, useMemo } from "react";
import { Loader2, AlertTriangle, Trash2, FileSpreadsheet } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useExtratoItens, useDeleteExtrato } from "@/hooks/useConciliacao";
import { format, parseISO } from "date-fns";

interface ExtratoItem {
  id: string;
  arquivo: string;
  conta_id: string;
  conta_bancaria: { banco: string; agencia?: string; conta: string } | null;
  periodo_inicio: string;
  periodo_fim: string;
  total_lancamentos: number;
  status: string;
  created_at: string;
}

interface ExcluirExtratoDialogProps {
  extrato: ExtratoItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ExcluirExtratoDialog({
  extrato,
  open,
  onOpenChange,
  onSuccess,
}: ExcluirExtratoDialogProps) {
  const [confirmaConciliados, setConfirmaConciliados] = useState(false);
  
  const { data: itens, isLoading: loadingItens } = useExtratoItens(
    open && extrato ? extrato.id : undefined
  );
  
  const deleteExtrato = useDeleteExtrato();

  // Calcular estatísticas dos itens
  const stats = useMemo(() => {
    if (!itens) return { total: 0, conciliados: 0, pendentes: 0, divergentes: 0 };
    
    return {
      total: itens.length,
      conciliados: itens.filter((i) => i.status_conciliacao === "conciliado").length,
      pendentes: itens.filter((i) => i.status_conciliacao === "pendente").length,
      divergentes: itens.filter((i) => i.status_conciliacao === "divergente").length,
    };
  }, [itens]);

  const temConciliados = stats.conciliados > 0 || stats.divergentes > 0;
  const podeExcluir = !temConciliados || confirmaConciliados;

  const handleDelete = async () => {
    if (!extrato || !podeExcluir) return;

    try {
      await deleteExtrato.mutateAsync(extrato.id);
      onOpenChange(false);
      setConfirmaConciliados(false);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmaConciliados(false);
    }
    onOpenChange(newOpen);
  };

  if (!extrato) return null;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-lg">
              Excluir Extrato
            </AlertDialogTitle>
          </div>
          
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {/* Info do extrato */}
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm text-foreground">
                    {extrato.arquivo}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span>{extrato.conta_bancaria?.banco}</span>
                  <span className="mx-1">•</span>
                  <span>
                    {format(parseISO(extrato.periodo_inicio), "dd/MM/yyyy")} -{" "}
                    {format(parseISO(extrato.periodo_fim), "dd/MM/yyyy")}
                  </span>
                </div>
              </div>

              {/* Loading */}
              {loadingItens ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Estatísticas dos itens */}
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-2">
                      Serão excluídos permanentemente:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {stats.total} lançamento{stats.total !== 1 && "s"}
                      </Badge>
                      {stats.pendentes > 0 && (
                        <Badge variant="outline" className="pendente">
                          {stats.pendentes} pendente{stats.pendentes !== 1 && "s"}
                        </Badge>
                      )}
                      {stats.conciliados > 0 && (
                        <Badge variant="outline" className="conciliado">
                          {stats.conciliados} conciliado{stats.conciliados !== 1 && "s"}
                        </Badge>
                      )}
                      {stats.divergentes > 0 && (
                        <Badge variant="outline" className="divergente">
                          {stats.divergentes} divergente{stats.divergentes !== 1 && "s"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Warning para itens conciliados */}
                  {temConciliados && (
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 space-y-3">
                      <div className="flex gap-2">
                        <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-warning">
                            Atenção: Existem itens conciliados
                          </p>
                          <p className="text-muted-foreground text-xs mt-1">
                            Ao excluir, os vínculos de conciliação serão desfeitos e os
                            lançamentos associados voltarão ao status "pendente".
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Checkbox
                          id="confirma-conciliados"
                          checked={confirmaConciliados}
                          onCheckedChange={(checked) =>
                            setConfirmaConciliados(checked === true)
                          }
                        />
                        <Label
                          htmlFor="confirma-conciliados"
                          className="text-xs cursor-pointer"
                        >
                          Entendo e desejo excluir mesmo assim
                        </Label>
                      </div>
                    </div>
                  )}

                  {/* Aviso de ação irreversível */}
                  <p className="text-xs text-muted-foreground">
                    Esta ação é irreversível. O extrato e todos os seus lançamentos
                    serão removidos permanentemente.
                  </p>
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={deleteExtrato.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!podeExcluir || loadingItens || deleteExtrato.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteExtrato.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Extrato
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
