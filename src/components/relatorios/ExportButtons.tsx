import { useState } from "react";
import { Download, Printer, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { exportToPDF, exportToExcel, printReport } from "@/lib/export-utils";
import type {
  ResumoFinanceiro,
  DadosPorCategoria,
  LancamentoRelatorio,
  ProdutividadeResponsavel,
  DadosConciliacao,
  EvolucaoMensal,
} from "@/types/relatorios";

interface ExportButtonsProps {
  titulo: string;
  periodo?: string;
  resumo?: ResumoFinanceiro;
  receitasPorCategoria?: DadosPorCategoria[];
  despesasPorCategoria?: DadosPorCategoria[];
  evolucaoMensal?: EvolucaoMensal[];
  produtividade?: ProdutividadeResponsavel[];
  conciliacao?: DadosConciliacao;
  lancamentos?: LancamentoRelatorio[];
  printElementId?: string;
  disabled?: boolean;
}

export function ExportButtons({
  titulo,
  periodo,
  resumo,
  receitasPorCategoria,
  despesasPorCategoria,
  evolucaoMensal,
  produtividade,
  conciliacao,
  lancamentos,
  printElementId,
  disabled,
}: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState<"pdf" | "excel" | null>(null);

  const handleExportPDF = async () => {
    try {
      setIsExporting("pdf");
      await exportToPDF({
        titulo,
        periodo,
        resumo,
        receitasPorCategoria,
        despesasPorCategoria,
        evolucaoMensal,
        produtividade,
        conciliacao,
        lancamentos,
      });
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF");
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting("excel");
      await exportToExcel({
        titulo,
        periodo,
        resumo,
        receitasPorCategoria,
        despesasPorCategoria,
        evolucaoMensal,
        produtividade,
        conciliacao,
        lancamentos,
      });
      toast.success("Excel exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar Excel:", error);
      toast.error("Erro ao exportar Excel");
    } finally {
      setIsExporting(null);
    }
  };

  const handlePrint = () => {
    if (printElementId) {
      printReport(printElementId, titulo);
    } else {
      window.print();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || !!isExporting}>
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting === "pdf"}>
          <FileText className="w-4 h-4 mr-2" />
          Exportar PDF
          {isExporting === "pdf" && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel} disabled={isExporting === "excel"}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Exportar Excel
          {isExporting === "excel" && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
