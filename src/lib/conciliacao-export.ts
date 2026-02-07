import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { ConciliacaoStats, ConciliacaoDetalhada } from "@/types/conciliacao";

interface ExportData {
  data: Date;
  stats: ConciliacaoStats;
  conciliacoes: ConciliacaoDetalhada[];
  cartorioNome?: string;
  contaInfo?: { banco: string; agencia: string; conta: string };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export function exportFechamentoPDF({
  data,
  stats,
  conciliacoes,
  cartorioNome = "Sistema FinCart",
  contaInfo,
}: ExportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO DE CONCILIAÇÃO BANCÁRIA", pageWidth / 2, 20, {
    align: "center",
  });

  // Subtitle
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(cartorioNome, pageWidth / 2, 28, { align: "center" });

  // Date
  const dateLabel = format(data, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  doc.setFontSize(11);
  doc.text(`Data: ${dateLabel}`, pageWidth / 2, 36, { align: "center" });

  // Account info
  if (contaInfo) {
    doc.text(
      `Conta: ${contaInfo.banco} - Ag: ${contaInfo.agencia} / CC: ${contaInfo.conta}`,
      pageWidth / 2,
      44,
      { align: "center" }
    );
  }

  // Separator
  doc.setLineWidth(0.5);
  doc.line(14, 50, pageWidth - 14, 50);

  // Stats Summary
  let yPos = 60;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo da Conciliação", 14, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Stats table
  autoTable(doc, {
    startY: yPos,
    head: [["Status", "Quantidade", "Percentual"]],
    body: [
      ["Conciliados", stats.conciliados.toString(), `${stats.taxaConciliacao}%`],
      ["Pendentes", stats.pendentes.toString(), "-"],
      ["Divergentes", stats.divergentes.toString(), "-"],
      ["Total", (stats.conciliados + stats.pendentes + stats.divergentes).toString(), "100%"],
    ],
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
    tableWidth: "auto",
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Financial Summary
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo Financeiro", 14, yPos);
  yPos += 10;

  autoTable(doc, {
    startY: yPos,
    head: [["Descrição", "Valor"]],
    body: [
      ["Total do Extrato", formatCurrency(stats.valorTotalExtrato)],
      ["Total de Lançamentos", formatCurrency(stats.valorTotalLancamentos)],
      ["Diferença", formatCurrency(stats.diferencaValores)],
    ],
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
    tableWidth: "auto",
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Conciliações list (if any)
  if (conciliacoes.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Detalhamento das Conciliações", 14, yPos);
    yPos += 10;

    const conciliacoesData = conciliacoes.map((c) => [
      format(new Date(c.conciliado_em), "dd/MM HH:mm"),
      c.extrato_item?.descricao?.substring(0, 30) || "-",
      c.lancamento?.descricao?.substring(0, 30) || "-",
      formatCurrency(Math.abs(c.extrato_item?.valor || 0)),
      formatCurrency(c.diferenca || 0),
      c.diferenca !== 0 ? "Divergente" : "OK",
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Data/Hora", "Extrato", "Lançamento", "Valor", "Diferença", "Status"]],
      body: conciliacoesData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
      },
    });
  }

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Página ${i} de ${pageCount} | Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")} | FINCART`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Save
  const fileName = `conciliacao_${format(data, "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
}

export function exportFechamentoExcel({
  data,
  stats,
  conciliacoes,
  cartorioNome = "Sistema FinCart",
  contaInfo,
}: ExportData) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Resumo
  const resumoData = [
    ["RELATÓRIO DE CONCILIAÇÃO BANCÁRIA"],
    [cartorioNome],
    [`Data: ${format(data, "dd/MM/yyyy")}`],
    contaInfo
      ? [`Conta: ${contaInfo.banco} - Ag: ${contaInfo.agencia} / CC: ${contaInfo.conta}`]
      : [],
    [],
    ["RESUMO DA CONCILIAÇÃO"],
    ["Status", "Quantidade", "Percentual"],
    ["Conciliados", stats.conciliados, `${stats.taxaConciliacao}%`],
    ["Pendentes", stats.pendentes, "-"],
    ["Divergentes", stats.divergentes, "-"],
    ["Total", stats.conciliados + stats.pendentes + stats.divergentes, "100%"],
    [],
    ["RESUMO FINANCEIRO"],
    ["Descrição", "Valor"],
    ["Total do Extrato", stats.valorTotalExtrato],
    ["Total de Lançamentos", stats.valorTotalLancamentos],
    ["Diferença", stats.diferencaValores],
  ];

  const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
  XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

  // Sheet 2: Detalhamento
  if (conciliacoes.length > 0) {
    const detalheData = [
      [
        "Data/Hora",
        "Extrato - Descrição",
        "Extrato - Valor",
        "Lançamento - Descrição",
        "Lançamento - Valor",
        "Diferença",
        "Status",
        "Observação",
      ],
      ...conciliacoes.map((c) => [
        format(new Date(c.conciliado_em), "dd/MM/yyyy HH:mm"),
        c.extrato_item?.descricao || "-",
        Math.abs(c.extrato_item?.valor || 0),
        c.lancamento?.descricao || "-",
        c.lancamento?.valor || 0,
        c.diferenca || 0,
        c.diferenca !== 0 ? "Divergente" : "Conciliado",
        c.observacao || "",
      ]),
    ];

    const wsDetalhe = XLSX.utils.aoa_to_sheet(detalheData);
    XLSX.utils.book_append_sheet(wb, wsDetalhe, "Detalhamento");
  }

  // Save
  const fileName = `conciliacao_${format(data, "yyyy-MM-dd")}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
