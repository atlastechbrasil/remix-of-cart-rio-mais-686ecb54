// Tipos para filtros de relatório
export interface FiltrosRelatorio {
  dataInicio: Date | null;
  dataFim: Date | null;
  tipoLancamento: "receita" | "despesa" | "todos";
  statusConciliacao: "pendente" | "conciliado" | "divergente" | "todos";
  categoria: string | null;
  responsavel: string | null;
}

// Dados agregados para resumo financeiro
export interface ResumoFinanceiro {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  quantidadeLancamentos: number;
  quantidadeReceitas: number;
  quantidadeDespesas: number;
}

// Dados para gráfico de receitas/despesas por categoria
export interface DadosPorCategoria {
  categoria: string;
  valor: number;
  quantidade: number;
  porcentagem: number;
}

// Dados para evolução mensal
export interface EvolucaoMensal {
  mes: string;
  mesAbreviado: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

// Dados de produtividade por responsável
export interface ProdutividadeResponsavel {
  responsavel: string;
  quantidadeLancamentos: number;
  totalReceitas: number;
  totalDespesas: number;
  valorTotal: number;
}

// Dados de conciliação
export interface DadosConciliacao {
  totalItens: number;
  conciliados: number;
  pendentes: number;
  divergentes: number;
  percentualConciliado: number;
  valorConciliado: number;
  valorPendente: number;
}

// Lançamento para tabela de relatório
export interface LancamentoRelatorio {
  id: string;
  data: string;
  descricao: string;
  categoria: string | null;
  tipo: "receita" | "despesa";
  valor: number;
  status: string;
  statusConciliacao: string;
  responsavel: string | null;
}

// Opções de exportação
export type FormatoExportacao = "pdf" | "excel" | "print";

export interface OpcoesExportacao {
  formato: FormatoExportacao;
  titulo: string;
  incluirGraficos?: boolean;
  incluirResumo?: boolean;
  incluirDetalhamento?: boolean;
  orientacao?: "portrait" | "landscape";
}

// Tipos de relatórios disponíveis
export type TipoRelatorio =
  | "financeiro-mensal"
  | "produtividade"
  | "receitas-por-categoria"
  | "despesas-por-categoria"
  | "conciliacao"
  | "comparativo"
  | "lancamentos";

export interface RelatorioConfig {
  id: TipoRelatorio;
  titulo: string;
  descricao: string;
  tipo: "financeiro" | "operacional" | "gerencial";
}

// Período rápido
export type PeriodoRapido =
  | "hoje"
  | "esta-semana"
  | "este-mes"
  | "ultimo-mes"
  | "este-trimestre"
  | "este-ano"
  | "customizado";

export interface DadosRelatorio {
  resumo: ResumoFinanceiro;
  receitasPorCategoria: DadosPorCategoria[];
  despesasPorCategoria: DadosPorCategoria[];
  evolucaoMensal: EvolucaoMensal[];
  produtividade: ProdutividadeResponsavel[];
  conciliacao: DadosConciliacao;
  lancamentos: LancamentoRelatorio[];
}
