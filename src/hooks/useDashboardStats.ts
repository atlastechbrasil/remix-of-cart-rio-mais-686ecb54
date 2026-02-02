import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface DashboardStats {
  saldoTotal: number;
  totalConciliados: number;
  totalPendentes: number;
  totalDivergentes: number;
  trendSaldo: number;
  trendConciliados: number;
  trendPendentes: number;
  trendDivergentes: number;
}

export interface DivergenciaItem {
  id: string;
  descricao: string;
  valorExtrato: number;
  valorSistema: number | null;
  diferenca: number;
  data: string;
  conta: string;
  tipo: "valor" | "ausente_sistema" | "ausente_extrato";
}

export interface TransacaoRecente {
  id: string;
  descricao: string;
  tipo: "receita" | "despesa";
  valor: number;
  data: string;
  dataFormatada: string;
  status: "conciliado" | "pendente" | "divergente";
}

export interface ConciliacaoSemana {
  semana: string;
  conciliados: number;
  pendentes: number;
  divergentes: number;
}

export interface SaldoMensal {
  mes: string;
  saldo: number;
}

// Hook para estatísticas principais
export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      // Buscar saldo total das contas bancárias ativas
      const { data: contas, error: contasError } = await supabase
        .from("contas_bancarias")
        .select("saldo")
        .eq("ativo", true);

      if (contasError) throw contasError;

      const saldoTotal = contas?.reduce((acc, conta) => acc + Number(conta.saldo), 0) || 0;

      // Buscar lançamentos por status de conciliação
      const { data: lancamentos, error: lancamentosError } = await supabase
        .from("lancamentos")
        .select("status_conciliacao");

      if (lancamentosError) throw lancamentosError;

      const totalConciliados = lancamentos?.filter(l => l.status_conciliacao === "conciliado").length || 0;
      const totalPendentes = lancamentos?.filter(l => l.status_conciliacao === "pendente").length || 0;
      const totalDivergentes = lancamentos?.filter(l => l.status_conciliacao === "divergente").length || 0;

      // Buscar dados do mês anterior para calcular trends
      const mesAnteriorInicio = format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd");
      const mesAnteriorFim = format(endOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd");

      const { data: lancamentosMesAnterior } = await supabase
        .from("lancamentos")
        .select("status_conciliacao")
        .gte("data", mesAnteriorInicio)
        .lte("data", mesAnteriorFim);

      const conciliadosMesAnterior = lancamentosMesAnterior?.filter(l => l.status_conciliacao === "conciliado").length || 1;
      const pendentesMesAnterior = lancamentosMesAnterior?.filter(l => l.status_conciliacao === "pendente").length || 1;
      const divergentesMesAnterior = lancamentosMesAnterior?.filter(l => l.status_conciliacao === "divergente").length || 1;

      return {
        saldoTotal,
        totalConciliados,
        totalPendentes,
        totalDivergentes,
        trendSaldo: 0, // Calcular baseado em histórico quando disponível
        trendConciliados: conciliadosMesAnterior > 0 ? ((totalConciliados - conciliadosMesAnterior) / conciliadosMesAnterior) * 100 : 0,
        trendPendentes: pendentesMesAnterior > 0 ? ((totalPendentes - pendentesMesAnterior) / pendentesMesAnterior) * 100 : 0,
        trendDivergentes: divergentesMesAnterior > 0 ? ((totalDivergentes - divergentesMesAnterior) / divergentesMesAnterior) * 100 : 0,
      };
    },
    enabled: !!user,
  });
}

// Hook para transações recentes
export function useRecentTransactions(limit: number = 5) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["recent-transactions", user?.id, limit],
    queryFn: async (): Promise<TransacaoRecente[]> => {
      const { data, error } = await supabase
        .from("lancamentos")
        .select("id, descricao, tipo, valor, data, status_conciliacao")
        .order("data", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      const hoje = new Date();
      const ontem = new Date(hoje);
      ontem.setDate(ontem.getDate() - 1);

      return (data || []).map((item) => {
        const dataItem = new Date(item.data);
        let dataFormatada: string;

        if (format(dataItem, "yyyy-MM-dd") === format(hoje, "yyyy-MM-dd")) {
          dataFormatada = "Hoje";
        } else if (format(dataItem, "yyyy-MM-dd") === format(ontem, "yyyy-MM-dd")) {
          dataFormatada = "Ontem";
        } else {
          dataFormatada = format(dataItem, "dd/MM/yyyy", { locale: ptBR });
        }

        return {
          id: item.id,
          descricao: item.descricao,
          tipo: item.tipo as "receita" | "despesa",
          valor: Number(item.valor),
          data: item.data,
          dataFormatada,
          status: item.status_conciliacao as "conciliado" | "pendente" | "divergente",
        };
      });
    },
    enabled: !!user,
  });
}

// Hook para divergências
export function useDivergencias() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["divergencias", user?.id],
    queryFn: async (): Promise<DivergenciaItem[]> => {
      // Buscar conciliações com diferença
      const { data: conciliacoes, error: conciliacoesError } = await supabase
        .from("conciliacoes")
        .select(`
          id,
          diferenca,
          conciliado_em,
          extrato_item_id,
          lancamento_id
        `)
        .neq("diferenca", 0)
        .order("conciliado_em", { ascending: false })
        .limit(5);

      if (conciliacoesError) throw conciliacoesError;

      // Buscar itens de extrato não conciliados
      const { data: itensPendentes, error: itensError } = await supabase
        .from("extrato_itens")
        .select(`
          id,
          descricao,
          valor,
          tipo,
          data_transacao,
          extrato_id
        `)
        .eq("status_conciliacao", "divergente")
        .order("data_transacao", { ascending: false })
        .limit(5);

      if (itensError) throw itensError;

      const divergencias: DivergenciaItem[] = [];

      // Processar conciliações com diferença
      for (const conc of conciliacoes || []) {
        const { data: extratoItem } = await supabase
          .from("extrato_itens")
          .select("descricao, valor, data_transacao, extrato_id")
          .eq("id", conc.extrato_item_id)
          .maybeSingle();

        const { data: lancamento } = await supabase
          .from("lancamentos")
          .select("valor")
          .eq("id", conc.lancamento_id)
          .maybeSingle();

        const { data: extrato } = await supabase
          .from("extratos")
          .select("conta_id")
          .eq("id", extratoItem?.extrato_id || "")
          .maybeSingle();

        const { data: conta } = await supabase
          .from("contas_bancarias")
          .select("banco")
          .eq("id", extrato?.conta_id || "")
          .maybeSingle();

        if (extratoItem) {
          divergencias.push({
            id: conc.id,
            descricao: extratoItem.descricao,
            valorExtrato: Number(extratoItem.valor),
            valorSistema: lancamento ? Number(lancamento.valor) : null,
            diferenca: Number(conc.diferenca),
            data: format(new Date(extratoItem.data_transacao), "dd/MM/yyyy", { locale: ptBR }),
            conta: conta?.banco || "—",
            tipo: "valor",
          });
        }
      }

      // Adicionar itens divergentes sem conciliação
      for (const item of itensPendentes || []) {
        const { data: extrato } = await supabase
          .from("extratos")
          .select("conta_id")
          .eq("id", item.extrato_id)
          .maybeSingle();

        const { data: conta } = await supabase
          .from("contas_bancarias")
          .select("banco")
          .eq("id", extrato?.conta_id || "")
          .maybeSingle();

        divergencias.push({
          id: item.id,
          descricao: item.descricao,
          valorExtrato: Number(item.valor),
          valorSistema: null,
          diferenca: Number(item.valor),
          data: format(new Date(item.data_transacao), "dd/MM/yyyy", { locale: ptBR }),
          conta: conta?.banco || "—",
          tipo: "ausente_sistema",
        });
      }

      return divergencias.slice(0, 5);
    },
    enabled: !!user,
  });
}

// Hook para dados do gráfico de conciliação por semana
export function useConciliacaoSemanal() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conciliacao-semanal", user?.id],
    queryFn: async (): Promise<ConciliacaoSemana[]> => {
      const hoje = new Date();
      const semanas: ConciliacaoSemana[] = [];

      for (let i = 3; i >= 0; i--) {
        const dataReferencia = addWeeks(hoje, -i);
        const inicioSemana = startOfWeek(dataReferencia, { weekStartsOn: 0 });
        const fimSemana = endOfWeek(dataReferencia, { weekStartsOn: 0 });

        const { data: lancamentos } = await supabase
          .from("lancamentos")
          .select("status_conciliacao")
          .gte("data", format(inicioSemana, "yyyy-MM-dd"))
          .lte("data", format(fimSemana, "yyyy-MM-dd"));

        semanas.push({
          semana: `Sem ${4 - i}`,
          conciliados: lancamentos?.filter(l => l.status_conciliacao === "conciliado").length || 0,
          pendentes: lancamentos?.filter(l => l.status_conciliacao === "pendente").length || 0,
          divergentes: lancamentos?.filter(l => l.status_conciliacao === "divergente").length || 0,
        });
      }

      return semanas;
    },
    enabled: !!user,
  });
}

// Hook para evolução do saldo
export function useSaldoEvolution() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["saldo-evolution", user?.id],
    queryFn: async (): Promise<SaldoMensal[]> => {
      // Buscar saldo atual das contas
      const { data: contas, error: contasError } = await supabase
        .from("contas_bancarias")
        .select("saldo")
        .eq("ativo", true);

      if (contasError) throw contasError;

      const saldoAtual = contas?.reduce((acc, conta) => acc + Number(conta.saldo), 0) || 0;

      // Buscar lançamentos dos últimos 12 meses para calcular evolução
      const hoje = new Date();
      const meses: SaldoMensal[] = [];

      for (let i = 11; i >= 0; i--) {
        const dataReferencia = subMonths(hoje, i);
        const inicioMes = startOfMonth(dataReferencia);
        const fimMes = endOfMonth(dataReferencia);

        const { data: lancamentos } = await supabase
          .from("lancamentos")
          .select("tipo, valor")
          .gte("data", format(inicioMes, "yyyy-MM-dd"))
          .lte("data", format(fimMes, "yyyy-MM-dd"));

        // Calcular variação do mês
        const receitasMes = lancamentos?.filter(l => l.tipo === "receita").reduce((acc, l) => acc + Number(l.valor), 0) || 0;
        const despesasMes = lancamentos?.filter(l => l.tipo === "despesa").reduce((acc, l) => acc + Number(l.valor), 0) || 0;
        const variacaoMes = receitasMes - despesasMes;

        // Calcular saldo estimado baseado na variação
        const mesesAFrente = 11 - i;
        const saldoEstimado = saldoAtual - (variacaoMes * mesesAFrente * 0.1); // Simplificação

        meses.push({
          mes: format(dataReferencia, "MMM", { locale: ptBR }).charAt(0).toUpperCase() + 
               format(dataReferencia, "MMM", { locale: ptBR }).slice(1),
          saldo: Math.max(0, saldoEstimado + variacaoMes),
        });
      }

      // Ajustar o último mês para ser o saldo atual
      if (meses.length > 0) {
        meses[meses.length - 1].saldo = saldoAtual;
      }

      return meses;
    },
    enabled: !!user,
  });
}
