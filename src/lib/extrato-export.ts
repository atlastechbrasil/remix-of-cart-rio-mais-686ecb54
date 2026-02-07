import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface ExtratoExportData {
  arquivo: string;
  banco: string;
  conta: string;
  agencia?: string;
  periodoInicio: string;
  periodoFim: string;
  dataImportacao: string;
  status: string;
}

export interface ExtratoItemExport {
  data_transacao: string;
  descricao: string;
  valor: number;
  tipo: "credito" | "debito";
  status_conciliacao: "pendente" | "conciliado" | "divergente";
}

export interface ExtratoExportStats {
  totalCreditos: number;
  totalDebitos: number;
  saldoPeriodo: number;
  totalItens: number;
  itensConciliados: number;
  itensPendentes: number;
  itensDivergentes: number;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pendente: "Pendente",
    conciliado: "Conciliado",
    divergente: "Divergente",
  };
  return labels[status] || status;
};

// ==================== CSV Export ====================

export function exportExtratoToCSV(
  extrato: ExtratoExportData,
  itens: ExtratoItemExport[],
  stats: ExtratoExportStats
): void {
  const headers = ["Data", "Descrição", "Tipo", "Valor", "Status"];
  
  const rows = itens.map((item) => [
    formatDate(item.data_transacao),
    item.descricao.replace(/;/g, ","), // Escape semicolons
    item.tipo === "credito" ? "Crédito" : "Débito",
    formatCurrency(Math.abs(item.valor)),
    getStatusLabel(item.status_conciliacao),
  ]);

  // Add summary rows
  const summaryRows = [
    [],
    ["RESUMO FINANCEIRO"],
    ["Total Créditos", formatCurrency(stats.totalCreditos)],
    ["Total Débitos", formatCurrency(stats.totalDebitos)],
    ["Saldo do Período", formatCurrency(stats.saldoPeriodo)],
    [],
    ["RESUMO DE CONCILIAÇÃO"],
    ["Total de Itens", stats.totalItens.toString()],
    ["Conciliados", stats.itensConciliados.toString()],
    ["Pendentes", stats.itensPendentes.toString()],
    ["Divergentes", stats.itensDivergentes.toString()],
  ];

  const csvContent = [
    `Extrato Bancário - ${extrato.banco}`,
    `Conta: ${extrato.conta}`,
    `Período: ${formatDate(extrato.periodoInicio)} a ${formatDate(extrato.periodoFim)}`,
    `Arquivo: ${extrato.arquivo}`,
    `Exportado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
    "",
    headers.join(";"),
    ...rows.map((row) => row.join(";")),
    ...summaryRows.map((row) => row.join(";")),
  ].join("\n");

  // Add BOM for UTF-8
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  
  downloadBlob(blob, `extrato_${extrato.banco}_${formatDate(extrato.periodoInicio)}.csv`);
}

// ==================== PDF Export ====================

export function exportExtratoToPDF(
  extrato: ExtratoExportData,
  itens: ExtratoItemExport[],
  stats: ExtratoExportStats
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(37, 99, 235); // Primary blue
  doc.rect(0, 0, pageWidth, 35, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("FINCART", 14, 15);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Extrato Bancário", 14, 25);
  
  doc.setFontSize(10);
  doc.text(`Exportado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, pageWidth - 14, 25, { align: "right" });

  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Extrato Info Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 42, pageWidth - 28, 35, 3, 3, "F");
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Informações do Extrato", 20, 52);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  const infoY = 60;
  doc.text(`Banco: ${extrato.banco}`, 20, infoY);
  doc.text(`Conta: ${extrato.conta}`, 80, infoY);
  doc.text(`Período: ${formatDate(extrato.periodoInicio)} a ${formatDate(extrato.periodoFim)}`, 140, infoY);
  
  doc.text(`Arquivo: ${extrato.arquivo}`, 20, infoY + 8);
  doc.text(`Status: ${extrato.status}`, 140, infoY + 8);

  // Financial Summary Cards
  const cardY = 85;
  const cardWidth = (pageWidth - 42) / 4;
  const cardHeight = 20;
  
  // Credits Card
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(14, cardY, cardWidth, cardHeight, 2, 2, "F");
  doc.setTextColor(22, 163, 74);
  doc.setFontSize(8);
  doc.text("Créditos", 16, cardY + 7);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(stats.totalCreditos), 16, cardY + 15);
  
  // Debits Card
  doc.setFillColor(254, 226, 226);
  doc.roundedRect(14 + cardWidth + 4, cardY, cardWidth, cardHeight, 2, 2, "F");
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Débitos", 18 + cardWidth, cardY + 7);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(stats.totalDebitos), 18 + cardWidth, cardY + 15);
  
  // Balance Card
  doc.setFillColor(219, 234, 254);
  doc.roundedRect(14 + (cardWidth + 4) * 2, cardY, cardWidth, cardHeight, 2, 2, "F");
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Saldo", 22 + cardWidth * 2, cardY + 7);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(stats.saldoPeriodo), 22 + cardWidth * 2, cardY + 15);
  
  // Reconciled Card
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(14 + (cardWidth + 4) * 3, cardY, cardWidth, cardHeight, 2, 2, "F");
  doc.setTextColor(75, 85, 99);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Conciliados", 26 + cardWidth * 3, cardY + 7);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const percentConciliado = stats.totalItens > 0 
    ? Math.round((stats.itensConciliados / stats.totalItens) * 100) 
    : 0;
  doc.text(`${stats.itensConciliados}/${stats.totalItens} (${percentConciliado}%)`, 26 + cardWidth * 3, cardY + 15);

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Transactions Table
  const tableData = itens.map((item) => [
    formatDate(item.data_transacao),
    item.descricao.length > 50 ? item.descricao.substring(0, 47) + "..." : item.descricao,
    item.tipo === "credito" ? "Crédito" : "Débito",
    formatCurrency(Math.abs(item.valor)),
    getStatusLabel(item.status_conciliacao),
  ]);

  autoTable(doc, {
    startY: 115,
    head: [["Data", "Descrição", "Tipo", "Valor", "Status"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 20 },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 25 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  doc.save(`extrato_${extrato.banco}_${formatDate(extrato.periodoInicio)}.pdf`);
}

// ==================== Excel Export ====================

export function exportExtratoToExcel(
  extrato: ExtratoExportData,
  itens: ExtratoItemExport[],
  stats: ExtratoExportStats
): void {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Transactions
  const transactionsData = [
    ["Extrato Bancário - FINCART"],
    [],
    ["Banco", extrato.banco],
    ["Conta", extrato.conta],
    ["Período", `${formatDate(extrato.periodoInicio)} a ${formatDate(extrato.periodoFim)}`],
    ["Arquivo", extrato.arquivo],
    ["Exportado em", format(new Date(), "dd/MM/yyyy HH:mm")],
    [],
    ["Data", "Descrição", "Tipo", "Valor", "Status"],
    ...itens.map((item) => [
      formatDate(item.data_transacao),
      item.descricao,
      item.tipo === "credito" ? "Crédito" : "Débito",
      Math.abs(item.valor),
      getStatusLabel(item.status_conciliacao),
    ]),
  ];

  const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionsData);
  
  // Set column widths
  transactionsSheet["!cols"] = [
    { wch: 12 },
    { wch: 50 },
    { wch: 10 },
    { wch: 15 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Lançamentos");

  // Sheet 2: Summary
  const summaryData = [
    ["Resumo do Extrato"],
    [],
    ["RESUMO FINANCEIRO"],
    ["Total de Créditos", stats.totalCreditos],
    ["Total de Débitos", stats.totalDebitos],
    ["Saldo do Período", stats.saldoPeriodo],
    [],
    ["RESUMO DE CONCILIAÇÃO"],
    ["Total de Itens", stats.totalItens],
    ["Itens Conciliados", stats.itensConciliados],
    ["Itens Pendentes", stats.itensPendentes],
    ["Itens Divergentes", stats.itensDivergentes],
    ["Percentual Conciliado", `${stats.totalItens > 0 ? Math.round((stats.itensConciliados / stats.totalItens) * 100) : 0}%`],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet["!cols"] = [{ wch: 25 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo");

  // Generate and download
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  
  downloadBlob(blob, `extrato_${extrato.banco}_${formatDate(extrato.periodoInicio)}.xlsx`);
}

// ==================== Helper ====================

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
