// Matching algorithm for bank reconciliation
// Scores range from 0-100, higher = better match

import type { ExtratoItem, Lancamento, SugestaoConciliacao } from "@/types/conciliacao";
import { differenceInDays, parseISO } from "date-fns";

interface MatcherConfig {
  toleranciaValor: number; // Percentage tolerance for value matching (e.g., 0.05 = 5%)
  toleranciaDias: number; // Days tolerance for date matching
  pesoValor: number; // Weight for value score (0-1)
  pesoData: number; // Weight for date score (0-1)
  pesoDescricao: number; // Weight for description score (0-1)
  scoreMinimo: number; // Minimum score to be considered a match
}

const DEFAULT_CONFIG: MatcherConfig = {
  toleranciaValor: 0.01, // 1% tolerance
  toleranciaDias: 3, // 3 days tolerance
  pesoValor: 0.5, // 50% weight
  pesoData: 0.3, // 30% weight
  pesoDescricao: 0.2, // 20% weight
  scoreMinimo: 50, // Minimum 50% match
};

/**
 * Normalize a value for comparison
 * Converts extrato item value (which can be negative for debits) to absolute
 */
function normalizeValue(value: number): number {
  return Math.abs(value);
}

/**
 * Calculate value match score (0-100)
 * Perfect match = 100, within tolerance = partial score, outside tolerance = 0
 */
function calculateValueScore(
  extratoValue: number,
  lancamentoValue: number,
  tolerancia: number
): number {
  const normalizedExtrato = normalizeValue(extratoValue);
  const normalizedLancamento = normalizeValue(lancamentoValue);

  if (normalizedExtrato === 0 && normalizedLancamento === 0) {
    return 100;
  }

  // Exact match
  if (normalizedExtrato === normalizedLancamento) {
    return 100;
  }

  const difference = Math.abs(normalizedExtrato - normalizedLancamento);
  const maxValue = Math.max(normalizedExtrato, normalizedLancamento);
  const percentDiff = difference / maxValue;

  // Within tolerance
  if (percentDiff <= tolerancia) {
    // Scale from 100 (exact match) to 70 (at tolerance limit)
    return Math.round(100 - (percentDiff / tolerancia) * 30);
  }

  // Within 2x tolerance - still a partial score
  if (percentDiff <= tolerancia * 2) {
    return Math.round(70 - ((percentDiff - tolerancia) / tolerancia) * 40);
  }

  // Outside tolerance but still somewhat close
  if (percentDiff <= 0.2) {
    return Math.round(30 - (percentDiff - tolerancia * 2) * 100);
  }

  return 0;
}

/**
 * Calculate date match score (0-100)
 * Same day = 100, within tolerance = partial score
 */
function calculateDateScore(
  extratoDate: string,
  lancamentoDate: string,
  toleranciaDias: number
): number {
  const extDate = parseISO(extratoDate);
  const lancDate = parseISO(lancamentoDate);
  const daysDiff = Math.abs(differenceInDays(extDate, lancDate));

  // Same day
  if (daysDiff === 0) {
    return 100;
  }

  // Within tolerance
  if (daysDiff <= toleranciaDias) {
    return Math.round(100 - (daysDiff / toleranciaDias) * 50);
  }

  // Up to 2x tolerance
  if (daysDiff <= toleranciaDias * 2) {
    return Math.round(50 - ((daysDiff - toleranciaDias) / toleranciaDias) * 30);
  }

  // Up to a week
  if (daysDiff <= 7) {
    return 20;
  }

  // Up to 2 weeks
  if (daysDiff <= 14) {
    return 10;
  }

  return 0;
}

/**
 * Calculate description similarity score (0-100)
 * Uses normalized word matching
 */
function calculateDescriptionScore(
  extratoDesc: string,
  lancamentoDesc: string
): number {
  const normalizeDesc = (text: string): string[] => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9\s]/g, "") // Remove special chars
      .split(/\s+/)
      .filter((word) => word.length > 2); // Filter short words
  };

  const extratoWords = normalizeDesc(extratoDesc);
  const lancamentoWords = normalizeDesc(lancamentoDesc);

  if (extratoWords.length === 0 || lancamentoWords.length === 0) {
    return 0;
  }

  // Count matching words
  let matches = 0;
  for (const word of extratoWords) {
    if (lancamentoWords.some((lw) => lw.includes(word) || word.includes(lw))) {
      matches++;
    }
  }

  // Calculate score based on match percentage
  const matchPercent = matches / Math.max(extratoWords.length, lancamentoWords.length);
  return Math.round(matchPercent * 100);
}

/**
 * Check if transaction types are compatible
 * credito (extrato) should match receita (lancamento)
 * debito (extrato) should match despesa (lancamento)
 */
function isTypeCompatible(
  extratoTipo: "credito" | "debito",
  lancamentoTipo: "receita" | "despesa"
): boolean {
  return (
    (extratoTipo === "credito" && lancamentoTipo === "receita") ||
    (extratoTipo === "debito" && lancamentoTipo === "despesa")
  );
}

/**
 * Generate match reasons based on scores
 */
function generateMotivos(
  valorScore: number,
  dataScore: number,
  descricaoScore: number,
  tipoCompativel: boolean
): string[] {
  const motivos: string[] = [];

  if (valorScore === 100) {
    motivos.push("Valor exato");
  } else if (valorScore >= 70) {
    motivos.push("Valor muito próximo");
  } else if (valorScore >= 50) {
    motivos.push("Valor similar");
  }

  if (dataScore === 100) {
    motivos.push("Mesma data");
  } else if (dataScore >= 70) {
    motivos.push("Data próxima");
  } else if (dataScore >= 50) {
    motivos.push("Data similar");
  }

  if (descricaoScore >= 50) {
    motivos.push("Descrição similar");
  }

  if (tipoCompativel) {
    motivos.push("Tipo compatível");
  }

  return motivos;
}

/**
 * Find matching suggestions for an extrato item
 */
export function findMatchSuggestions(
  extratoItem: ExtratoItem,
  lancamentos: Lancamento[],
  config: Partial<MatcherConfig> = {}
): SugestaoConciliacao[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const suggestions: SugestaoConciliacao[] = [];

  // Only consider pending lancamentos
  const pendentes = lancamentos.filter((l) => l.status_conciliacao === "pendente");

  for (const lancamento of pendentes) {
    // Type compatibility check
    const tipoCompativel = isTypeCompatible(
      extratoItem.tipo as "credito" | "debito",
      lancamento.tipo as "receita" | "despesa"
    );

    // If types are not compatible, skip (but could still show with low score if needed)
    if (!tipoCompativel) {
      continue;
    }

    // Calculate individual scores
    const valorScore = calculateValueScore(
      extratoItem.valor,
      lancamento.valor,
      cfg.toleranciaValor
    );
    const dataScore = calculateDateScore(
      extratoItem.data_transacao,
      lancamento.data,
      cfg.toleranciaDias
    );
    const descricaoScore = calculateDescriptionScore(
      extratoItem.descricao,
      lancamento.descricao
    );

    // Calculate weighted total score
    const totalScore = Math.round(
      valorScore * cfg.pesoValor +
        dataScore * cfg.pesoData +
        descricaoScore * cfg.pesoDescricao
    );

    // Only include if above minimum score
    if (totalScore >= cfg.scoreMinimo) {
      suggestions.push({
        lancamento,
        score: totalScore,
        motivos: generateMotivos(valorScore, dataScore, descricaoScore, tipoCompativel),
      });
    }
  }

  // Sort by score descending
  return suggestions.sort((a, b) => b.score - a.score);
}

/**
 * Find perfect matches for auto-reconciliation (100% confidence)
 * These are matches where value is exact and date is same day
 */
export function findPerfectMatches(
  extratoItens: ExtratoItem[],
  lancamentos: Lancamento[]
): Array<{ extratoItem: ExtratoItem; lancamento: Lancamento }> {
  const matches: Array<{ extratoItem: ExtratoItem; lancamento: Lancamento }> = [];
  const usedLancamentos = new Set<string>();
  const usedExtratos = new Set<string>();

  // Only consider pending items
  const pendingExtratos = extratoItens.filter(
    (e) => e.status_conciliacao === "pendente"
  );
  const pendingLancamentos = lancamentos.filter(
    (l) => l.status_conciliacao === "pendente"
  );

  for (const extrato of pendingExtratos) {
    if (usedExtratos.has(extrato.id)) continue;

    for (const lancamento of pendingLancamentos) {
      if (usedLancamentos.has(lancamento.id)) continue;

      // Check type compatibility
      const tipoCompativel = isTypeCompatible(
        extrato.tipo as "credito" | "debito",
        lancamento.tipo as "receita" | "despesa"
      );
      if (!tipoCompativel) continue;

      // Check exact value match
      if (normalizeValue(extrato.valor) !== normalizeValue(lancamento.valor)) {
        continue;
      }

      // Check same date (or very close)
      const daysDiff = Math.abs(
        differenceInDays(parseISO(extrato.data_transacao), parseISO(lancamento.data))
      );
      if (daysDiff > 1) continue;

      // Perfect match found
      matches.push({ extratoItem: extrato, lancamento });
      usedLancamentos.add(lancamento.id);
      usedExtratos.add(extrato.id);
      break;
    }
  }

  return matches;
}

/**
 * Get the best match for an extrato item (if any)
 */
export function getBestMatch(
  extratoItem: ExtratoItem,
  lancamentos: Lancamento[],
  config: Partial<MatcherConfig> = {}
): SugestaoConciliacao | null {
  const suggestions = findMatchSuggestions(extratoItem, lancamentos, config);
  return suggestions.length > 0 ? suggestions[0] : null;
}

/**
 * Calculate match quality level for UI display
 */
export function getMatchQuality(score: number): "excellent" | "good" | "fair" | "poor" {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "fair";
  return "poor";
}

/**
 * Get color class for score display
 */
export function getScoreColorClass(score: number): string {
  if (score >= 90) return "text-success";
  if (score >= 75) return "text-primary";
  if (score >= 60) return "text-warning";
  return "text-muted-foreground";
}

/**
 * Get background color class for score badge
 */
export function getScoreBgClass(score: number): string {
  if (score >= 90) return "bg-success/10 text-success";
  if (score >= 75) return "bg-primary/10 text-primary";
  if (score >= 60) return "bg-warning/10 text-warning";
  return "bg-muted text-muted-foreground";
}
