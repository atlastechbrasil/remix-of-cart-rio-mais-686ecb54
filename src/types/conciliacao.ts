// Types for Bank Reconciliation (Conciliação Bancária)

export type StatusConciliacao = "pendente" | "conciliado" | "divergente";
export type TipoConta = "corrente" | "poupanca" | "investimento";
export type TipoTransacao = "credito" | "debito";
export type TipoLancamento = "receita" | "despesa";
export type StatusLancamento = "pago" | "pendente" | "agendado" | "cancelado";

// Filters for advanced queries
export interface ConciliacaoFiltros {
  dataInicio?: Date;
  dataFim?: Date;
  status?: StatusConciliacao[];
  contaId?: string;
  busca?: string;
  tipoLancamento?: TipoLancamento[];
  tipoTransacao?: TipoTransacao[];
  valorMinimo?: number;
  valorMaximo?: number;
}

// Quick date filter presets
export type PresetPeriodo = 
  | "hoje" 
  | "ontem" 
  | "ultimos7dias" 
  | "esteMes" 
  | "mesAnterior" 
  | "customizado";

export interface PeriodoSelecionado {
  preset: PresetPeriodo;
  dataInicio: Date;
  dataFim: Date;
}

// Bank Account
export interface ContaBancaria {
  id: string;
  user_id: string;
  cartorio_id?: string | null;
  banco: string;
  agencia: string;
  conta: string;
  tipo: TipoConta;
  saldo: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Bank Statement
export interface Extrato {
  id: string;
  user_id: string;
  cartorio_id?: string | null;
  conta_id: string;
  arquivo: string;
  periodo_inicio: string;
  periodo_fim: string;
  total_lancamentos: number;
  status: string;
  created_at: string;
  conta_bancaria?: ContaBancaria;
}

// Bank Statement Item
export interface ExtratoItem {
  id: string;
  extrato_id: string;
  user_id: string;
  cartorio_id?: string | null;
  data_transacao: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  saldo_parcial: number | null;
  status_conciliacao: StatusConciliacao;
  lancamento_vinculado_id: string | null;
  created_at: string;
}

// System Transaction/Entry
export interface Lancamento {
  id: string;
  user_id: string;
  cartorio_id?: string | null;
  data: string;
  descricao: string;
  tipo: TipoLancamento;
  categoria: string | null;
  valor: number;
  status: StatusLancamento;
  status_conciliacao: StatusConciliacao;
  extrato_item_vinculado_id: string | null;
  responsavel: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

// Reconciliation Record
export interface Conciliacao {
  id: string;
  user_id: string;
  cartorio_id?: string | null;
  extrato_item_id: string;
  lancamento_id: string;
  diferenca: number;
  observacao: string | null;
  conciliado_em: string;
  created_at: string;
}

// Detailed reconciliation with related data
export interface ConciliacaoDetalhada extends Conciliacao {
  extrato_item: ExtratoItem;
  lancamento: Lancamento;
  conta_bancaria?: ContaBancaria;
}

// Daily closing summary
export interface FechamentoDiario {
  data: string;
  totalConciliados: number;
  totalPendentes: number;
  totalDivergentes: number;
  valorConciliado: number;
  valorPendente: number;
  valorDivergente: number;
  diferencaTotal: number;
  percentualConciliado: number;
}

// Match suggestion with confidence score
export interface SugestaoConciliacao {
  lancamento: Lancamento;
  score: number; // 0-100 (match confidence)
  motivos: string[];
}

// Reconciliation statistics
export interface ConciliacaoStats {
  conciliados: number;
  pendentes: number;
  divergentes: number;
  taxaConciliacao: number;
  totalExtrato: number;
  totalLancamentos: number;
  valorTotalExtrato: number;
  valorTotalLancamentos: number;
  diferencaValores: number;
}

// Item card props (for reusable component)
export interface ItemCardProps {
  id: string;
  descricao: string;
  data: string;
  valor: number;
  tipo: "credito" | "debito" | "receita" | "despesa";
  status: StatusConciliacao;
  categoria?: string | null;
  isSelected: boolean;
  isSelectable: boolean;
  onSelect: () => void;
  onViewDetails?: () => void;
}

// Extrato list props
export interface ExtratoListProps {
  items: ExtratoItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  isLoading: boolean;
  contaInfo?: { banco: string; agencia: string; conta: string };
  showAllStatuses?: boolean;
  onItemClick?: (item: ExtratoItem) => void;
}

// Lancamento list props
export interface LancamentoListProps {
  items: Lancamento[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  isLoading?: boolean;
  showAllStatuses?: boolean;
  onItemClick?: (item: Lancamento) => void;
}

// Filter component props
export interface FiltroDataProps {
  dataSelecionada: Date;
  onDataChange: (data: Date) => void;
  preset: PresetPeriodo;
  onPresetChange: (preset: PresetPeriodo) => void;
  pendentesCount?: number;
}

// Tab types for status navigation
export type ConciliacaoTabValue = "pendentes" | "conciliados" | "divergentes" | "historico";
