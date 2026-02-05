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
  EvolucaoMensal,
} from "@/types/relatorios";

// Brand colors (HSL converted to RGB for PDF)
const BRAND_COLORS = {
  primary: { r: 37, g: 99, b: 235 },      // Blue 600
  primaryLight: { r: 59, g: 130, b: 246 }, // Blue 500
  secondary: { r: 100, g: 116, b: 139 },   // Slate 500
  success: { r: 34, g: 197, b: 94 },       // Green 500
  danger: { r: 239, g: 68, b: 68 },        // Red 500
  warning: { r: 249, g: 115, b: 22 },      // Orange 500
  purple: { r: 168, g: 85, b: 247 },       // Purple 500
  dark: { r: 15, g: 23, b: 42 },           // Slate 900
  muted: { r: 100, g: 116, b: 139 },       // Slate 500
  background: { r: 248, g: 250, b: 252 },  // Slate 50
  white: { r: 255, g: 255, b: 255 },
};

const CHART_COLORS = [
  { r: 37, g: 99, b: 235 },    // Blue
  { r: 34, g: 197, b: 94 },    // Green
  { r: 249, g: 115, b: 22 },   // Orange
  { r: 168, g: 85, b: 247 },   // Purple
  { r: 236, g: 72, b: 153 },   // Pink
  { r: 14, g: 165, b: 233 },   // Sky
];

const CHART_COLORS_EXPENSE = [
  { r: 239, g: 68, b: 68 },    // Red
  { r: 249, g: 115, b: 22 },   // Orange
  { r: 234, g: 179, b: 8 },    // Yellow
  { r: 236, g: 72, b: 153 },   // Pink
  { r: 168, g: 85, b: 247 },   // Purple
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatCurrencyShort = (value: number) => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1)}K`;
  }
  return formatCurrency(value);
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
  evolucaoMensal?: EvolucaoMensal[];
  produtividade?: ProdutividadeResponsavel[];
  conciliacao?: DadosConciliacao;
  lancamentos?: LancamentoRelatorio[];
}

// ==================== PDF HELPER FUNCTIONS ====================

function setColor(doc: jsPDF, color: { r: number; g: number; b: number }) {
  doc.setTextColor(color.r, color.g, color.b);
}

function setFillColor(doc: jsPDF, color: { r: number; g: number; b: number }) {
  doc.setFillColor(color.r, color.g, color.b);
}

function setDrawColor(doc: jsPDF, color: { r: number; g: number; b: number }) {
  doc.setDrawColor(color.r, color.g, color.b);
}

function drawRoundedRect(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: boolean = true
) {
  doc.roundedRect(x, y, w, h, r, r, fill ? "F" : "S");
}

function addHeader(doc: jsPDF, titulo: string, periodo?: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header background with gradient effect
  setFillColor(doc, BRAND_COLORS.primary);
  doc.rect(0, 0, pageWidth, 45, "F");
  
  // Lighter overlay for gradient effect
  setFillColor(doc, BRAND_COLORS.primaryLight);
  doc.rect(0, 0, pageWidth, 22, "F");
  
  // Logo placeholder with text
  setColor(doc, BRAND_COLORS.white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("FINCART", 14, 18);
  
  // Subtitle
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Gestão Financeira", 14, 25);
  
  // Report title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, 14, 38);
  
  // Period badge
  if (periodo) {
    const periodoText = `Período: ${periodo}`;
    const textWidth = doc.getTextWidth(periodoText);
    const badgeX = pageWidth - textWidth - 24;
    
    setFillColor(doc, BRAND_COLORS.white);
    drawRoundedRect(doc, badgeX - 6, 30, textWidth + 12, 10, 2);
    
    setColor(doc, BRAND_COLORS.primary);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(periodoText, badgeX, 37);
  }
  
  return 55; // Return Y position after header
}

function addFooter(doc: jsPDF, pageNumber: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Footer line
  setDrawColor(doc, BRAND_COLORS.secondary);
  doc.setLineWidth(0.5);
  doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
  
  // Footer text
  setColor(doc, BRAND_COLORS.muted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, pageHeight - 8);
  doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: "right" });
  doc.text("FINCART - Sistema de Gestão Financeira", pageWidth / 2, pageHeight - 8, { align: "center" });
}

function addSectionTitle(doc: jsPDF, title: string, yPos: number, color: { r: number; g: number; b: number } = BRAND_COLORS.primary) {
  // Section indicator bar
  setFillColor(doc, color);
  doc.rect(14, yPos - 4, 3, 10, "F");
  
  // Title
  setColor(doc, BRAND_COLORS.dark);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, yPos + 3);
  
  return yPos + 12;
}

function drawPieChart(
  doc: jsPDF,
  data: DadosPorCategoria[],
  centerX: number,
  centerY: number,
  radius: number,
  colors: { r: number; g: number; b: number }[],
  title: string
) {
  if (!data || data.length === 0) return;
  
  // Title
  setColor(doc, BRAND_COLORS.dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(title, centerX, centerY - radius - 8, { align: "center" });
  
  // Draw pie slices
  let startAngle = -Math.PI / 2; // Start from top
  const total = data.reduce((sum, item) => sum + item.valor, 0);
  
  data.slice(0, 5).forEach((item, index) => {
    const sliceAngle = (item.valor / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;
    const color = colors[index % colors.length];
    
    // Draw slice using lines (approximation)
    setFillColor(doc, color);
    
    // Create arc path manually
    const steps = 20;
    const points: [number, number][] = [[centerX, centerY]];
    
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (sliceAngle * i) / steps;
      points.push([
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius,
      ]);
    }
    
    // Draw filled polygon
    doc.setFillColor(color.r, color.g, color.b);
    const path = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(" ") + " Z";
    
    // Simple approach: draw triangular slices
    for (let i = 0; i < steps; i++) {
      const angle1 = startAngle + (sliceAngle * i) / steps;
      const angle2 = startAngle + (sliceAngle * (i + 1)) / steps;
      
      doc.triangle(
        centerX,
        centerY,
        centerX + Math.cos(angle1) * radius,
        centerY + Math.sin(angle1) * radius,
        centerX + Math.cos(angle2) * radius,
        centerY + Math.sin(angle2) * radius,
        "F"
      );
    }
    
    startAngle = endAngle;
  });
  
  // Draw center circle (donut effect)
  setFillColor(doc, BRAND_COLORS.white);
  doc.circle(centerX, centerY, radius * 0.5, "F");
  
  // Center text
  setColor(doc, BRAND_COLORS.dark);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrencyShort(total), centerX, centerY + 2, { align: "center" });
  
  // Legend
  const legendX = centerX + radius + 10;
  let legendY = centerY - (data.slice(0, 5).length * 7) / 2;
  
  data.slice(0, 5).forEach((item, index) => {
    const color = colors[index % colors.length];
    
    // Color box
    setFillColor(doc, color);
    doc.rect(legendX, legendY - 3, 6, 6, "F");
    
    // Label
    setColor(doc, BRAND_COLORS.dark);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    const label = item.categoria.length > 15 ? item.categoria.substring(0, 15) + "..." : item.categoria;
    doc.text(`${label} (${item.porcentagem.toFixed(0)}%)`, legendX + 9, legendY + 1);
    
    legendY += 10;
  });
}

function drawBarChart(
  doc: jsPDF,
  data: ProdutividadeResponsavel[],
  x: number,
  y: number,
  width: number,
  height: number,
  title: string
) {
  if (!data || data.length === 0) return;
  
  // Title
  setColor(doc, BRAND_COLORS.dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(title, x + width / 2, y, { align: "center" });
  
  const chartY = y + 10;
  const chartHeight = height - 20;
  const barCount = Math.min(data.length, 5);
  const barWidth = (width - 20) / barCount;
  const maxValue = Math.max(...data.slice(0, 5).map((d) => d.quantidadeLancamentos));
  
  // Draw bars
  data.slice(0, 5).forEach((item, index) => {
    const barHeight = (item.quantidadeLancamentos / maxValue) * (chartHeight - 15);
    const barX = x + 10 + index * barWidth + 5;
    const barY = chartY + chartHeight - barHeight - 10;
    
    // Bar
    setFillColor(doc, CHART_COLORS[index % CHART_COLORS.length]);
    drawRoundedRect(doc, barX, barY, barWidth - 10, barHeight, 2);
    
    // Value on top
    setColor(doc, BRAND_COLORS.dark);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(item.quantidadeLancamentos.toString(), barX + (barWidth - 10) / 2, barY - 3, { align: "center" });
    
    // Label below
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    const label = item.responsavel.length > 10 ? item.responsavel.substring(0, 10) + "..." : item.responsavel;
    doc.text(label, barX + (barWidth - 10) / 2, chartY + chartHeight - 2, { align: "center" });
  });
}

function drawAreaChart(
  doc: jsPDF,
  data: EvolucaoMensal[],
  x: number,
  y: number,
  width: number,
  height: number,
  title: string
) {
  if (!data || data.length === 0) return;
  
  // Title
  setColor(doc, BRAND_COLORS.dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(title, x + width / 2, y, { align: "center" });
  
  const chartY = y + 15;
  const chartHeight = height - 35;
  const chartWidth = width - 20;
  const chartX = x + 10;
  
  const maxValue = Math.max(...data.map((d) => Math.max(d.receitas, d.despesas)));
  const pointCount = data.length;
  const pointSpacing = chartWidth / (pointCount - 1 || 1);
  
  // Draw grid lines
  setDrawColor(doc, { r: 226, g: 232, b: 240 });
  doc.setLineWidth(0.2);
  for (let i = 0; i <= 4; i++) {
    const gridY = chartY + (chartHeight * i) / 4;
    doc.line(chartX, gridY, chartX + chartWidth, gridY);
  }
  
  // Draw receitas line
  setDrawColor(doc, BRAND_COLORS.success);
  doc.setLineWidth(1.5);
  for (let i = 0; i < pointCount - 1; i++) {
    const x1 = chartX + i * pointSpacing;
    const y1 = chartY + chartHeight - (data[i].receitas / maxValue) * chartHeight;
    const x2 = chartX + (i + 1) * pointSpacing;
    const y2 = chartY + chartHeight - (data[i + 1].receitas / maxValue) * chartHeight;
    doc.line(x1, y1, x2, y2);
  }
  
  // Draw despesas line
  setDrawColor(doc, BRAND_COLORS.danger);
  for (let i = 0; i < pointCount - 1; i++) {
    const x1 = chartX + i * pointSpacing;
    const y1 = chartY + chartHeight - (data[i].despesas / maxValue) * chartHeight;
    const x2 = chartX + (i + 1) * pointSpacing;
    const y2 = chartY + chartHeight - (data[i + 1].despesas / maxValue) * chartHeight;
    doc.line(x1, y1, x2, y2);
  }
  
  // Draw points and labels
  data.forEach((item, index) => {
    const px = chartX + index * pointSpacing;
    
    // Receita point
    const ryR = chartY + chartHeight - (item.receitas / maxValue) * chartHeight;
    setFillColor(doc, BRAND_COLORS.success);
    doc.circle(px, ryR, 2, "F");
    
    // Despesa point
    const ryD = chartY + chartHeight - (item.despesas / maxValue) * chartHeight;
    setFillColor(doc, BRAND_COLORS.danger);
    doc.circle(px, ryD, 2, "F");
    
    // Month label
    setColor(doc, BRAND_COLORS.muted);
    doc.setFontSize(6);
    doc.text(item.mesAbreviado, px, chartY + chartHeight + 8, { align: "center" });
  });
  
  // Legend
  const legendY = chartY + chartHeight + 15;
  
  setFillColor(doc, BRAND_COLORS.success);
  doc.rect(chartX, legendY, 8, 4, "F");
  setColor(doc, BRAND_COLORS.dark);
  doc.setFontSize(7);
  doc.text("Receitas", chartX + 10, legendY + 3);
  
  setFillColor(doc, BRAND_COLORS.danger);
  doc.rect(chartX + 45, legendY, 8, 4, "F");
  doc.text("Despesas", chartX + 55, legendY + 3);
}

function addKPICard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  color: { r: number; g: number; b: number }
) {
  // Card background
  setFillColor(doc, BRAND_COLORS.background);
  drawRoundedRect(doc, x, y, width, 28, 3);
  
  // Color indicator
  setFillColor(doc, color);
  doc.rect(x, y, 4, 28, "F");
  
  // Label
  setColor(doc, BRAND_COLORS.muted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(label, x + 10, y + 10);
  
  // Value
  setColor(doc, BRAND_COLORS.dark);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(value, x + 10, y + 22);
}

// ==================== PDF EXPORT ====================

export async function exportToPDF(data: ExportData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  
  let yPos = addHeader(doc, data.titulo, data.periodo);
  
  // KPI Cards Row
  if (data.resumo) {
    const cardWidth = (contentWidth - 15) / 4;
    
    addKPICard(doc, margin, yPos, cardWidth, "Total Receitas", formatCurrency(data.resumo.totalReceitas), BRAND_COLORS.success);
    addKPICard(doc, margin + cardWidth + 5, yPos, cardWidth, "Total Despesas", formatCurrency(data.resumo.totalDespesas), BRAND_COLORS.danger);
    addKPICard(doc, margin + (cardWidth + 5) * 2, yPos, cardWidth, "Saldo", formatCurrency(data.resumo.saldo), BRAND_COLORS.primary);
    addKPICard(doc, margin + (cardWidth + 5) * 3, yPos, cardWidth, "Lançamentos", data.resumo.quantidadeLancamentos.toString(), BRAND_COLORS.purple);
    
    yPos += 38;
  }
  
  // Charts Row - Pie Charts
  if ((data.receitasPorCategoria && data.receitasPorCategoria.length > 0) || 
      (data.despesasPorCategoria && data.despesasPorCategoria.length > 0)) {
    
    // Check for page break
    if (yPos > pageHeight - 100) {
      doc.addPage();
      yPos = 20;
    }
    
    yPos = addSectionTitle(doc, "Distribuição por Categoria", yPos);
    
    const chartAreaWidth = contentWidth / 2;
    
    if (data.receitasPorCategoria && data.receitasPorCategoria.length > 0) {
      drawPieChart(
        doc,
        data.receitasPorCategoria,
        margin + chartAreaWidth / 4,
        yPos + 45,
        25,
        CHART_COLORS,
        "Receitas"
      );
    }
    
    if (data.despesasPorCategoria && data.despesasPorCategoria.length > 0) {
      drawPieChart(
        doc,
        data.despesasPorCategoria,
        margin + chartAreaWidth + chartAreaWidth / 4,
        yPos + 45,
        25,
        CHART_COLORS_EXPENSE,
        "Despesas"
      );
    }
    
    yPos += 95;
  }
  
  // Evolution Chart
  if (data.evolucaoMensal && data.evolucaoMensal.length > 0) {
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 20;
    }
    
    yPos = addSectionTitle(doc, "Evolução Mensal", yPos);
    
    drawAreaChart(doc, data.evolucaoMensal, margin, yPos, contentWidth, 55, "");
    
    yPos += 65;
  }
  
  // Productivity Chart
  if (data.produtividade && data.produtividade.length > 0) {
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 20;
    }
    
    yPos = addSectionTitle(doc, "Produtividade por Responsável", yPos, BRAND_COLORS.purple);
    
    drawBarChart(doc, data.produtividade, margin, yPos, contentWidth, 55, "");
    
    yPos += 65;
  }
  
  // Resumo Financeiro Table
  if (data.resumo) {
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }
    
    yPos = addSectionTitle(doc, "Resumo Financeiro Detalhado", yPos);

    autoTable(doc, {
      startY: yPos,
      head: [["Indicador", "Valor"]],
      body: [
        ["Total de Receitas", formatCurrency(data.resumo.totalReceitas)],
        ["Total de Despesas", formatCurrency(data.resumo.totalDespesas)],
        ["Saldo do Período", formatCurrency(data.resumo.saldo)],
        ["Quantidade de Receitas", data.resumo.quantidadeReceitas.toString()],
        ["Quantidade de Despesas", data.resumo.quantidadeDespesas.toString()],
        ["Total de Lançamentos", data.resumo.quantidadeLancamentos.toString()],
      ],
      theme: "plain",
      headStyles: {
        fillColor: [BRAND_COLORS.primary.r, BRAND_COLORS.primary.g, BRAND_COLORS.primary.b],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [BRAND_COLORS.background.r, BRAND_COLORS.background.g, BRAND_COLORS.background.b],
      },
      margin: { left: margin, right: margin },
      tableWidth: "auto",
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Receitas por Categoria Table
  if (data.receitasPorCategoria && data.receitasPorCategoria.length > 0) {
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    yPos = addSectionTitle(doc, "Receitas por Categoria", yPos, BRAND_COLORS.success);

    autoTable(doc, {
      startY: yPos,
      head: [["Categoria", "Valor", "Qtd", "Participação"]],
      body: data.receitasPorCategoria.map((item) => [
        item.categoria,
        formatCurrency(item.valor),
        item.quantidade.toString(),
        `${item.porcentagem.toFixed(1)}%`,
      ]),
      theme: "plain",
      headStyles: {
        fillColor: [BRAND_COLORS.success.r, BRAND_COLORS.success.g, BRAND_COLORS.success.b],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: {
        fillColor: [BRAND_COLORS.background.r, BRAND_COLORS.background.g, BRAND_COLORS.background.b],
      },
      margin: { left: margin, right: margin },
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Despesas por Categoria Table
  if (data.despesasPorCategoria && data.despesasPorCategoria.length > 0) {
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    yPos = addSectionTitle(doc, "Despesas por Categoria", yPos, BRAND_COLORS.danger);

    autoTable(doc, {
      startY: yPos,
      head: [["Categoria", "Valor", "Qtd", "Participação"]],
      body: data.despesasPorCategoria.map((item) => [
        item.categoria,
        formatCurrency(item.valor),
        item.quantidade.toString(),
        `${item.porcentagem.toFixed(1)}%`,
      ]),
      theme: "plain",
      headStyles: {
        fillColor: [BRAND_COLORS.danger.r, BRAND_COLORS.danger.g, BRAND_COLORS.danger.b],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: {
        fillColor: [BRAND_COLORS.background.r, BRAND_COLORS.background.g, BRAND_COLORS.background.b],
      },
      margin: { left: margin, right: margin },
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Produtividade Table
  if (data.produtividade && data.produtividade.length > 0) {
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    yPos = addSectionTitle(doc, "Produtividade Detalhada", yPos, BRAND_COLORS.purple);

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
      theme: "plain",
      headStyles: {
        fillColor: [BRAND_COLORS.purple.r, BRAND_COLORS.purple.g, BRAND_COLORS.purple.b],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: {
        fillColor: [BRAND_COLORS.background.r, BRAND_COLORS.background.g, BRAND_COLORS.background.b],
      },
      margin: { left: margin, right: margin },
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Conciliação Table
  if (data.conciliacao) {
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    yPos = addSectionTitle(doc, "Status de Conciliação", yPos, BRAND_COLORS.warning);

    autoTable(doc, {
      startY: yPos,
      head: [["Status", "Quantidade", "Valor"]],
      body: [
        ["Conciliados", data.conciliacao.conciliados.toString(), formatCurrency(data.conciliacao.valorConciliado)],
        ["Pendentes", data.conciliacao.pendentes.toString(), formatCurrency(data.conciliacao.valorPendente)],
        ["Divergentes", data.conciliacao.divergentes.toString(), "-"],
        ["Percentual Conciliado", `${data.conciliacao.percentualConciliado.toFixed(1)}%`, "-"],
      ],
      theme: "plain",
      headStyles: {
        fillColor: [BRAND_COLORS.warning.r, BRAND_COLORS.warning.g, BRAND_COLORS.warning.b],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: {
        fillColor: [BRAND_COLORS.background.r, BRAND_COLORS.background.g, BRAND_COLORS.background.b],
      },
      margin: { left: margin, right: margin },
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Lançamentos Table
  if (data.lancamentos && data.lancamentos.length > 0) {
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    yPos = addSectionTitle(doc, "Detalhamento de Lançamentos", yPos);

    autoTable(doc, {
      startY: yPos,
      head: [["Data", "Descrição", "Categoria", "Tipo", "Valor", "Status"]],
      body: data.lancamentos.slice(0, 50).map((item) => [
        formatDate(item.data),
        item.descricao.length > 35 ? item.descricao.substring(0, 35) + "..." : item.descricao,
        item.categoria || "-",
        item.tipo === "receita" ? "Receita" : "Despesa",
        formatCurrency(item.valor),
        item.statusConciliacao,
      ]),
      theme: "plain",
      headStyles: {
        fillColor: [BRAND_COLORS.primary.r, BRAND_COLORS.primary.g, BRAND_COLORS.primary.b],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: {
        fillColor: [BRAND_COLORS.background.r, BRAND_COLORS.background.g, BRAND_COLORS.background.b],
      },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 28 },
        5: { cellWidth: 22 },
      },
    });
    
    // Note if there are more entries
    if (data.lancamentos.length > 50) {
      const lastY = (doc as any).lastAutoTable.finalY + 5;
      setColor(doc, BRAND_COLORS.muted);
      doc.setFontSize(8);
      doc.text(`* Exibindo 50 de ${data.lancamentos.length} lançamentos`, margin, lastY);
    }
  }

  // Add footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  // Save PDF
  const fileName = `${data.titulo.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd_HHmm")}.pdf`;
  doc.save(fileName);
}

// ==================== EXCEL EXPORT ====================

export async function exportToExcel(data: ExportData): Promise<void> {
  const workbook = XLSX.utils.book_new();

  // Aba de Resumo
  if (data.resumo) {
    const resumoData = [
      ["FINCART - Sistema de Gestão Financeira"],
      [],
      ["Relatório", data.titulo],
      ["Período", data.periodo || "-"],
      ["Gerado em", format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })],
      [],
      ["RESUMO FINANCEIRO"],
      ["Total de Receitas", data.resumo.totalReceitas],
      ["Total de Despesas", data.resumo.totalDespesas],
      ["Saldo", data.resumo.saldo],
      ["Quantidade de Receitas", data.resumo.quantidadeReceitas],
      ["Quantidade de Despesas", data.resumo.quantidadeDespesas],
      ["Total de Lançamentos", data.resumo.quantidadeLancamentos],
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

  // Aba de Evolução Mensal
  if (data.evolucaoMensal && data.evolucaoMensal.length > 0) {
    const evolucaoData = [
      ["Mês", "Receitas", "Despesas", "Saldo"],
      ...data.evolucaoMensal.map((item) => [item.mes, item.receitas, item.despesas, item.saldo]),
    ];

    const evolucaoSheet = XLSX.utils.aoa_to_sheet(evolucaoData);
    XLSX.utils.book_append_sheet(workbook, evolucaoSheet, "Evolução Mensal");
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
        * {
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          padding: 0;
          margin: 0;
          color: #1e293b;
          line-height: 1.5;
        }
        .print-header {
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          color: white;
          padding: 24px 32px;
          margin-bottom: 24px;
        }
        .print-header h1 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 700;
        }
        .print-header .subtitle {
          opacity: 0.9;
          font-size: 12px;
        }
        .print-header .meta {
          display: flex;
          justify-content: space-between;
          margin-top: 16px;
          font-size: 12px;
          opacity: 0.9;
        }
        .content {
          padding: 0 32px 32px;
        }
        h2 {
          color: #1e293b;
          font-size: 16px;
          font-weight: 600;
          margin: 24px 0 12px;
          padding-left: 12px;
          border-left: 3px solid #2563eb;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          font-size: 12px;
        }
        th, td {
          padding: 10px 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        th {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.5px;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .kpi-card {
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          border-left: 4px solid #2563eb;
        }
        .kpi-card.success { border-left-color: #22c55e; }
        .kpi-card.danger { border-left-color: #ef4444; }
        .kpi-card.purple { border-left-color: #a855f7; }
        .kpi-label {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 4px;
        }
        .kpi-value {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
        }
        .text-success { color: #22c55e; }
        .text-danger { color: #ef4444; }
        .footer {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 10px;
          color: #94a3b8;
        }
        @media print {
          body { padding: 0; }
          .print-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .kpi-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1>FINCART</h1>
        <div class="subtitle">Sistema de Gestão Financeira</div>
        <div class="meta">
          <span>${titulo}</span>
          <span>Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
        </div>
      </div>
      <div class="content">
        ${printContent.innerHTML}
      </div>
      <div class="footer">
        FINCART - Sistema de Gestão Financeira • Documento gerado automaticamente
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}
