import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Table2,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useExtratoItens } from "@/hooks/useConciliacao";
import { toast } from "sonner";
import {
  exportExtratoToCSV,
  exportExtratoToPDF,
  exportExtratoToExcel,
  type ExtratoExportData,
  type ExtratoItemExport,
  type ExtratoExportStats,
} from "@/lib/extrato-export";
import { cn } from "@/lib/utils";

interface ExtratoData {
  id: string;
  arquivo: string;
  conta_bancaria: { banco: string; agencia?: string; conta: string } | null;
  periodo_inicio: string;
  periodo_fim: string;
  total_lancamentos: number;
  status: string;
  created_at: string;
}

interface DownloadExtratoDialogProps {
  extrato: ExtratoData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ExportFormat = "csv" | "pdf" | "xlsx";

const formatOptions: {
  value: ExportFormat;
  label: string;
  description: string;
  icon: typeof FileText;
}[] = [
  {
    value: "pdf",
    label: "PDF",
    description: "Documento formatado com resumo visual",
    icon: FileText,
  },
  {
    value: "xlsx",
    label: "Excel",
    description: "Planilha editável com múltiplas abas",
    icon: Table2,
  },
  {
    value: "csv",
    label: "CSV",
    description: "Arquivo de texto simples para importação",
    icon: FileSpreadsheet,
  },
];

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export function DownloadExtratoDialog({
  extrato,
  open,
  onOpenChange,
}: DownloadExtratoDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const { data: itens, isLoading } = useExtratoItens(extrato?.id);

  const stats = useMemo((): ExtratoExportStats => {
    if (!itens || itens.length === 0) {
      return {
        totalCreditos: 0,
        totalDebitos: 0,
        saldoPeriodo: 0,
        totalItens: 0,
        itensConciliados: 0,
        itensPendentes: 0,
        itensDivergentes: 0,
      };
    }

    const creditos = itens.filter((i) => i.tipo === "credito");
    const debitos = itens.filter((i) => i.tipo === "debito");
    const conciliados = itens.filter((i) => i.status_conciliacao === "conciliado");
    const pendentes = itens.filter((i) => i.status_conciliacao === "pendente");
    const divergentes = itens.filter((i) => i.status_conciliacao === "divergente");

    const totalCreditos = creditos.reduce((acc, i) => acc + Math.abs(Number(i.valor)), 0);
    const totalDebitos = debitos.reduce((acc, i) => acc + Math.abs(Number(i.valor)), 0);

    return {
      totalCreditos,
      totalDebitos,
      saldoPeriodo: totalCreditos - totalDebitos,
      totalItens: itens.length,
      itensConciliados: conciliados.length,
      itensPendentes: pendentes.length,
      itensDivergentes: divergentes.length,
    };
  }, [itens]);

  const handleExport = async () => {
    if (!extrato || !itens) return;

    setIsExporting(true);

    try {
      const exportData: ExtratoExportData = {
        arquivo: extrato.arquivo,
        banco: extrato.conta_bancaria?.banco || "N/A",
        conta: extrato.conta_bancaria?.conta || "N/A",
        agencia: extrato.conta_bancaria?.agencia,
        periodoInicio: extrato.periodo_inicio,
        periodoFim: extrato.periodo_fim,
        dataImportacao: extrato.created_at,
        status: extrato.status,
      };

      const exportItens: ExtratoItemExport[] = itens.map((item) => ({
        data_transacao: item.data_transacao,
        descricao: item.descricao,
        valor: Number(item.valor),
        tipo: item.tipo as "credito" | "debito",
        status_conciliacao: item.status_conciliacao as "pendente" | "conciliado" | "divergente",
      }));

      // Small delay for UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      switch (selectedFormat) {
        case "csv":
          exportExtratoToCSV(exportData, exportItens, stats);
          break;
        case "pdf":
          exportExtratoToPDF(exportData, exportItens, stats);
          break;
        case "xlsx":
          exportExtratoToExcel(exportData, exportItens, stats);
          break;
      }

      toast.success("Extrato exportado com sucesso!");
      onOpenChange(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erro ao exportar extrato. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!extrato) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Baixar Extrato
          </DialogTitle>
          <DialogDescription>
            Escolha o formato para exportar o extrato bancário
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Info */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{extrato.arquivo}</p>
                  <p className="text-xs text-muted-foreground">
                    {extrato.conta_bancaria?.banco} • {extrato.total_lancamentos} lançamentos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Format Selection */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Formato de exportação</p>
            <div className="grid gap-2">
              {formatOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedFormat === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedFormat(option.value)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-md",
                      isSelected ? "bg-primary/10" : "bg-muted"
                    )}>
                      <Icon className={cn(
                        "w-4 h-4",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Export Preview */}
          <div className="space-y-2">
            <p className="text-sm font-medium">O arquivo incluirá</p>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-xs text-muted-foreground">Lançamentos</p>
                  <p className="font-medium">{stats.totalItens}</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-xs text-muted-foreground">Créditos</p>
                  <p className="font-medium text-success">{formatCurrency(stats.totalCreditos)}</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-xs text-muted-foreground">Débitos</p>
                  <p className="font-medium text-destructive">{formatCurrency(stats.totalDebitos)}</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-xs text-muted-foreground">Saldo</p>
                  <p className={cn(
                    "font-medium",
                    stats.saldoPeriodo >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {formatCurrency(stats.saldoPeriodo)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isLoading || isExporting || !itens?.length}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Baixar {selectedFormat.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
