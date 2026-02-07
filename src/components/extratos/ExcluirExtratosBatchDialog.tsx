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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDeleteExtrato } from "@/hooks/useConciliacao";
import { toast } from "sonner";

interface ExtratoItem {
  id: string;
  arquivo: string;
  total_lancamentos: number;
  status: string;
}

interface ExcluirExtratosBatchDialogProps {
  extratos: ExtratoItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ExcluirExtratosBatchDialog({
  extratos,
  open,
  onOpenChange,
  onSuccess,
}: ExcluirExtratosBatchDialogProps) {
  const [confirmaConciliados, setConfirmaConciliados] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);
  
  const deleteExtrato = useDeleteExtrato();

  // Calcular estatísticas
  const stats = useMemo(() => {
    const total = extratos.length;
    const totalLancamentos = extratos.reduce((acc, e) => acc + e.total_lancamentos, 0);
    const comConciliados = extratos.filter(
      (e) => e.status === "conciliado"
    ).length;

    return { total, totalLancamentos, comConciliados };
  }, [extratos]);

  const temConciliados = stats.comConciliados > 0;
  const podeExcluir = !temConciliados || confirmaConciliados;

  const handleDelete = async () => {
    if (!podeExcluir || extratos.length === 0) return;

    setIsDeleting(true);
    setDeletedCount(0);

    let successCount = 0;
    let errorCount = 0;

    for (const extrato of extratos) {
      try {
        await deleteExtrato.mutateAsync(extrato.id);
        successCount++;
        setDeletedCount(successCount);
      } catch (error) {
        errorCount++;
        console.error(`Erro ao excluir extrato ${extrato.arquivo}:`, error);
      }
    }

    setIsDeleting(false);

    if (errorCount === 0) {
      toast.success(`${successCount} extrato${successCount !== 1 ? "s" : ""} excluído${successCount !== 1 ? "s" : ""} com sucesso!`);
    } else {
      toast.warning(
        `${successCount} excluído${successCount !== 1 ? "s" : ""}, ${errorCount} com erro`
      );
    }

    onOpenChange(false);
    setConfirmaConciliados(false);
    onSuccess?.();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isDeleting) {
      setConfirmaConciliados(false);
      setDeletedCount(0);
    }
    if (!isDeleting) {
      onOpenChange(newOpen);
    }
  };

  if (extratos.length === 0) return null;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-lg">
              Excluir {stats.total} Extrato{stats.total !== 1 && "s"}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {/* Lista de extratos */}
              <ScrollArea className="max-h-[150px] rounded-lg border">
                <div className="p-2 space-y-1">
                  {extratos.map((extrato) => (
                    <div
                      key={extrato.id}
                      className="flex items-center gap-2 p-2 rounded bg-muted/50"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate flex-1">
                        {extrato.arquivo}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {extrato.total_lancamentos}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Resumo */}
              <div className="text-sm">
                <p className="text-muted-foreground mb-2">
                  Serão excluídos permanentemente:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {stats.total} extrato{stats.total !== 1 && "s"}
                  </Badge>
                  <Badge variant="outline">
                    {stats.totalLancamentos} lançamento
                    {stats.totalLancamentos !== 1 && "s"}
                  </Badge>
                </div>
              </div>

              {/* Warning para itens conciliados */}
              {temConciliados && (
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 space-y-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-warning">
                        {stats.comConciliados} extrato
                        {stats.comConciliados !== 1 && "s"} com itens conciliados
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Os vínculos de conciliação serão desfeitos e os
                        lançamentos voltarão ao status "pendente".
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                      id="confirma-conciliados-batch"
                      checked={confirmaConciliados}
                      onCheckedChange={(checked) =>
                        setConfirmaConciliados(checked === true)
                      }
                      disabled={isDeleting}
                    />
                    <Label
                      htmlFor="confirma-conciliados-batch"
                      className="text-xs cursor-pointer"
                    >
                      Entendo e desejo excluir mesmo assim
                    </Label>
                  </div>
                </div>
              )}

              {/* Progress */}
              {isDeleting && (
                <div className="text-sm text-center text-muted-foreground">
                  Excluindo {deletedCount} de {stats.total}...
                </div>
              )}

              {/* Aviso */}
              <p className="text-xs text-muted-foreground">
                Esta ação é irreversível.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!podeExcluir || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Todos
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
