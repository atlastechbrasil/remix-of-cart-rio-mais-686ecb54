import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type {
  ResumoFinanceiro,
  DadosPorCategoria,
  LancamentoRelatorio,
  ProdutividadeResponsavel,
  DadosConciliacao,
} from "@/types/relatorios";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (dateStr: string) => {
  return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
};

interface ExportData {
  titulo: string;
  subtitulo?: string;
  periodo?: string;
  resumo?: ResumoFinanceiro;
  receitasPorCategoria?: DadosPorCategoria[];
  despesasPorCategoria?: DadosPorCategoria[];
  produtividade?: ProdutividadeResponsavel[];
  conciliacao?: DadosConciliacao;
  lancamentos?: LancamentoRelatorio[];
}

// ==================== PDF EXPORT ====================

export async function exportToPDF(data: ExportData): Promise<void> {
  const doc = new jsPDF();
  let yPos = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // Título
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(data.titulo, pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  // Subtítulo / Período
  if (data.subtitulo || data.periodo) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(data.subtitulo || data.periodo || "", pageWidth / 2, yPos, { align: "center" });
    yPos += 10;
  }

  // Data de geração
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, margin, yPos);
  doc.setTextColor(0);
  yPos += 10;

  // Resumo Financeiro
  if (data.resumo) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo Financeiro", margin, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [["Descrição", "Valor"]],
      body: [
        ["Total de Receitas", formatCurrency(data.resumo.totalReceitas)],
        ["Total de Despesas", formatCurrency(data.resumo.totalDespesas)],
        ["Saldo", formatCurrency(data.resumo.saldo)],
        ["Quantidade de Lançamentos", data.resumo.quantidadeLancamentos.toString()],
      ],
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin },
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Receitas por Categoria
  if (data.receitasPorCategoria && data.receitasPorCategoria.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Receitas por Categoria", margin, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [["Categoria", "Valor", "Qtd", "%"]],
      body: data.receitasPorCategoria.map((item) => [
        item.categoria,
        formatCurrency(item.valor),
        item.quantidade.toString(),
        `${item.porcentagem.toFixed(1)}%`,
      ]),
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: margin, right: margin },
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Despesas por Categoria
  if (data.despesasPorCategoria && data.despesasPorCategoria.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Despesas por Categoria", margin, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [["Categoria", "Valor", "Qtd", "%"]],
      body: data.despesasPorCategoria.map((item) => [
        item.categoria,
        formatCurrency(item.valor),
        item.quantidade.toString(),
        `${item.porcentagem.toFixed(1)}%`,
      ]),
      theme: "striped",
      headStyles: { fillColor: [239, 68, 68] },
      margin: { left: margin, right: margin },
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Produtividade
  if (data.produtividade && data.produtividade.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Produtividade por Responsável", margin, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [["Responsável", "Lançamentos", "Receitas", "Despesas", "Total"]],
      body: data.produtividade.map((item) => [
        item.responsavel,
        item.quantidadeLancamentos.toString(),
        formatCurrency(item.totalReceitas),
        formatCurrency(item.totalDespesas),
        formatCurrency(item.valorTotal),
      ]),
      theme: "striped",
      headStyles: { fillColor: [168, 85, 247] },
      margin: { left: margin, right: margin },
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Conciliação
  if (data.conciliacao) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Status de Conciliação", margin, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [["Status", "Quantidade", "Valor"]],
      body: [
        ["Conciliados", data.conciliacao.conciliados.toString(), formatCurrency(data.conciliacao.valorConciliado)],
        ["Pendentes", data.conciliacao.pendentes.toString(), formatCurrency(data.conciliacao.valorPendente)],
        ["Divergentes", data.conciliacao.divergentes.toString(), "-"],
        ["% Conciliado", `${data.conciliacao.percentualConciliado.toFixed(1)}%`, "-"],
      ],
      theme: "striped",
      headStyles: { fillColor: [249, 115, 22] },
      margin: { left: margin, right: margin },
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Lançamentos
  if (data.lancamentos && data.lancamentos.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Detalhamento de Lançamentos", margin, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [["Data", "Descrição", "Categoria", "Tipo", "Valor", "Status"]],
      body: data.lancamentos.map((item) => [
        formatDate(item.data),
        item.descricao.substring(0, 30) + (item.descricao.length > 30 ? "..." : ""),
        item.categoria || "-",
        item.tipo === "receita" ? "Receita" : "Despesa",
        formatCurrency(item.valor),
        item.statusConciliacao,
      ]),
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 8 },
    });
  }

  // Salvar PDF
  const fileName = `${data.titulo.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
}

// ==================== EXCEL EXPORT ====================

export async function exportToExcel(data: ExportData): Promise<void> {
  const workbook = XLSX.utils.book_new();

  // Aba de Resumo
  if (data.resumo) {
    const resumoData = [
      ["Relatório", data.titulo],
      ["Período", data.periodo || "-"],
      ["Gerado em", format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })],
      [],
      ["RESUMO FINANCEIRO"],
      ["Total de Receitas", data.resumo.totalReceitas],
      ["Total de Despesas", data.resumo.totalDespesas],
      ["Saldo", data.resumo.saldo],
      ["Quantidade de Lançamentos", data.resumo.quantidadeLancamentos],
    ];

    const resumoSheet = XLSX.utils.aoa_to_sheet(resumoData);
    XLSX.utils.book_append_sheet(workbook, resumoSheet, "Resumo");
  }

  // Aba de Receitas por Categoria
  if (data.receitasPorCategoria && data.receitasPorCategoria.length > 0) {
    const receitasData = [
      ["Categoria", "Valor", "Quantidade", "Porcentagem"],
      ...data.receitasPorCategoria.map((item) => [item.categoria, item.valor, item.quantidade, item.porcentagem]),
    ];

    const receitasSheet = XLSX.utils.aoa_to_sheet(receitasData);
    XLSX.utils.book_append_sheet(workbook, receitasSheet, "Receitas por Categoria");
  }

  // Aba de Despesas por Categoria
  if (data.despesasPorCategoria && data.despesasPorCategoria.length > 0) {
    const despesasData = [
      ["Categoria", "Valor", "Quantidade", "Porcentagem"],
      ...data.despesasPorCategoria.map((item) => [item.categoria, item.valor, item.quantidade, item.porcentagem]),
    ];

    const despesasSheet = XLSX.utils.aoa_to_sheet(despesasData);
    XLSX.utils.book_append_sheet(workbook, despesasSheet, "Despesas por Categoria");
  }

  // Aba de Produtividade
  if (data.produtividade && data.produtividade.length > 0) {
    const prodData = [
      ["Responsável", "Lançamentos", "Receitas", "Despesas", "Total"],
      ...data.produtividade.map((item) => [
        item.responsavel,
        item.quantidadeLancamentos,
        item.totalReceitas,
        item.totalDespesas,
        item.valorTotal,
      ]),
    ];

    const prodSheet = XLSX.utils.aoa_to_sheet(prodData);
    XLSX.utils.book_append_sheet(workbook, prodSheet, "Produtividade");
  }

  // Aba de Conciliação
  if (data.conciliacao) {
    const concData = [
      ["Status", "Quantidade", "Valor"],
      ["Conciliados", data.conciliacao.conciliados, data.conciliacao.valorConciliado],
      ["Pendentes", data.conciliacao.pendentes, data.conciliacao.valorPendente],
      ["Divergentes", data.conciliacao.divergentes, 0],
      [],
      ["% Conciliado", data.conciliacao.percentualConciliado],
    ];

    const concSheet = XLSX.utils.aoa_to_sheet(concData);
    XLSX.utils.book_append_sheet(workbook, concSheet, "Conciliação");
  }

  // Aba de Lançamentos
  if (data.lancamentos && data.lancamentos.length > 0) {
    const lancData = [
      ["Data", "Descrição", "Categoria", "Tipo", "Valor", "Status", "Conciliação", "Responsável"],
      ...data.lancamentos.map((item) => [
        formatDate(item.data),
        item.descricao,
        item.categoria || "-",
        item.tipo === "receita" ? "Receita" : "Despesa",
        item.valor,
        item.status,
        item.statusConciliacao,
        item.responsavel || "-",
      ]),
    ];

    const lancSheet = XLSX.utils.aoa_to_sheet(lancData);
    XLSX.utils.book_append_sheet(workbook, lancSheet, "Lançamentos");
  }

  // Salvar arquivo
  const fileName = `${data.titulo.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

// ==================== PRINT ====================

export function printReport(elementId: string, titulo: string): void {
  const printContent = document.getElementById(elementId);
  if (!printContent) {
    console.error("Elemento para impressão não encontrado");
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    console.error("Não foi possível abrir janela de impressão");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${titulo}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          max-width: 1000px;
          margin: 0 auto;
        }
        h1, h2, h3 {
          color: #1f2937;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th, td {
          border: 1px solid #e5e7eb;
          padding: 8px 12px;
          text-align: left;
        }
        th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin: 10px 0;
        }
        .text-green { color: #22c55e; }
        .text-red { color: #ef4444; }
        .text-muted { color: #6b7280; }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        .generated-at {
          font-size: 12px;
          color: #6b7280;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${titulo}</h1>
        <span class="generated-at">Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
      </div>
      ${printContent.innerHTML}
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}
