import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Printer,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { exportFechamentoPDF, exportFechamentoExcel } from "@/lib/conciliacao-export";
import { toast } from "sonner";
import type { ConciliacaoStats, ConciliacaoDetalhada } from "@/types/conciliacao";

interface FechamentoDiaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Date;
  stats: ConciliacaoStats;
  conciliacoes: ConciliacaoDetalhada[];
  onConfirm: () => void;
  isConfirming?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

function FechamentoContent({
  data,
  stats,
  conciliacoes,
  onConfirm,
  onExportPDF,
  onExportExcel,
  onPrint,
  isConfirming,
}: {
  data: Date;
  stats: ConciliacaoStats;
  conciliacoes: ConciliacaoDetalhada[];
  onConfirm: () => void;
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  onPrint?: () => void;
  isConfirming?: boolean;
}) {
  const getDateLabel = () => {
    if (isToday(data)) return "Hoje";
    if (isYesterday(data)) return "Ontem";
    return format(data, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const totalItens = stats.conciliados + stats.pendentes + stats.divergentes;
  const canClose = stats.pendentes === 0;
  const conciliadosSemDivergencia = conciliacoes.filter(c => Number(c.diferenca || 0) === 0);
  const conciliadosComDivergencia = conciliacoes.filter(c => Number(c.diferenca || 0) !== 0);

  return (
    <ScrollArea className="max-h-[70vh]">
      <div className="space-y-6 p-1">
        {/* Date Header */}
        <div className="text-center">
          <Badge variant="outline" className="text-base py-1.5 px-4 capitalize">
            {getDateLabel()}
          </Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
            <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-3xl font-bold text-success">{stats.conciliados}</p>
            <p className="text-sm text-muted-foreground">Conciliados</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-warning/10 border border-warning/20">
            <Clock className="w-6 h-6 text-warning mx-auto mb-2" />
            <p className="text-3xl font-bold text-warning">{stats.pendentes}</p>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-6 h-6 text-destructive mx-auto mb-2" />
            <p className="text-3xl font-bold text-destructive">{stats.divergentes}</p>
            <p className="text-sm text-muted-foreground">Divergentes</p>
          </div>
        </div>

        <Separator />

        {/* Financial Summary */}
        <div className="space-y-3">
          <h4 className="font-semibold">Resumo Financeiro</h4>
          
          <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total do Extrato:</span>
              <span className="font-medium">{formatCurrency(stats.valorTotalExtrato)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total de Lançamentos:</span>
              <span className="font-medium">{formatCurrency(stats.valorTotalLancamentos)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Diferença Total:</span>
              <span className={cn(
                "font-bold text-lg",
                stats.diferencaValores === 0 ? "text-success" :
                stats.diferencaValores > 0 ? "text-success" : "text-destructive"
              )}>
                {stats.diferencaValores === 0 ? "R$ 0,00" : 
                  (stats.diferencaValores > 0 ? "+" : "") + formatCurrency(stats.diferencaValores)}
              </span>
            </div>
          </div>
        </div>

        {/* Divergences Warning */}
        {conciliadosComDivergencia.length > 0 && (
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-warning">
                  {conciliadosComDivergencia.length} conciliação(ões) com divergência
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Estas conciliações possuem diferença de valores entre extrato e lançamento.
                  Verifique se as justificativas foram adicionadas.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Warning */}
        {stats.pendentes > 0 && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">
                  {stats.pendentes} item(ns) pendente(s)
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Todos os itens devem ser conciliados antes de fechar o dia.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Export Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" onClick={onExportPDF}>
            <Download className="w-4 h-4 mr-1" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={onExportExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-1" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className="w-4 h-4 mr-1" />
            Imprimir
          </Button>
        </div>

        <Separator />

        {/* Confirmation */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            Ao confirmar o fechamento, o dia será marcado como revisado e não poderá ser alterado
            sem aprovação de um administrador.
          </p>
          
          <Button 
            onClick={onConfirm} 
            className="w-full"
            disabled={!canClose || isConfirming}
          >
            {isConfirming ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileCheck className="w-4 h-4 mr-2" />
            )}
            {canClose ? "Confirmar Fechamento" : "Resolva os Pendentes"}
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}

export function FechamentoDiaDialog({
  open,
  onOpenChange,
  data,
  stats,
  conciliacoes,
  onConfirm,
  isConfirming,
}: FechamentoDiaDialogProps) {
  const isMobile = useIsMobile();

  const handleExportPDF = () => {
    try {
      exportFechamentoPDF({ data, stats, conciliacoes });
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar PDF");
      console.error(error);
    }
  };

  const handleExportExcel = () => {
    try {
      exportFechamentoExcel({ data, stats, conciliacoes });
      toast.success("Excel exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar Excel");
      console.error(error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Fechamento do Dia</DrawerTitle>
            <DrawerDescription>
              Revise e confirme a conciliação
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <FechamentoContent
              data={data}
              stats={stats}
              conciliacoes={conciliacoes}
              onConfirm={onConfirm}
              onExportPDF={handleExportPDF}
              onExportExcel={handleExportExcel}
              onPrint={handlePrint}
              isConfirming={isConfirming}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Fechamento do Dia</DialogTitle>
          <DialogDescription>
            Revise e confirme a conciliação
          </DialogDescription>
        </DialogHeader>
        <FechamentoContent
          data={data}
          stats={stats}
          conciliacoes={conciliacoes}
          onConfirm={onConfirm}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          onPrint={handlePrint}
          isConfirming={isConfirming}
        />
      </DialogContent>
    </Dialog>
  );
}
