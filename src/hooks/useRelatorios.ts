import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import type {
  FiltrosRelatorio,
  ResumoFinanceiro,
  DadosPorCategoria,
  EvolucaoMensal,
  ProdutividadeResponsavel,
  DadosConciliacao,
  LancamentoRelatorio,
  PeriodoRapido,
} from "@/types/relatorios";

export function getDateRangeForPeriod(periodo: PeriodoRapido): { inicio: Date; fim: Date } {
  const hoje = new Date();

  switch (periodo) {
    case "hoje":
      return { inicio: hoje, fim: hoje };
    case "esta-semana":
      return { inicio: startOfWeek(hoje, { locale: ptBR }), fim: endOfWeek(hoje, { locale: ptBR }) };
    case "este-mes":
      return { inicio: startOfMonth(hoje), fim: endOfMonth(hoje) };
    case "ultimo-mes":
      const mesAnterior = subMonths(hoje, 1);
      return { inicio: startOfMonth(mesAnterior), fim: endOfMonth(mesAnterior) };
    case "este-trimestre":
      const trimestre = Math.floor(hoje.getMonth() / 3);
      const inicioTrimestre = new Date(hoje.getFullYear(), trimestre * 3, 1);
      const fimTrimestre = new Date(hoje.getFullYear(), (trimestre + 1) * 3, 0);
      return { inicio: inicioTrimestre, fim: fimTrimestre };
    case "este-ano":
      return { inicio: startOfYear(hoje), fim: endOfYear(hoje) };
    default:
      return { inicio: startOfMonth(hoje), fim: endOfMonth(hoje) };
  }
}

export function useResumoFinanceiro(filtros: FiltrosRelatorio) {
  const { cartorioAtivo } = useTenant();

  return useQuery({
    queryKey: ["relatorio-resumo", cartorioAtivo?.id, filtros],
    queryFn: async (): Promise<ResumoFinanceiro> => {
      let query = supabase.from("lancamentos").select("tipo, valor, status");

      if (cartorioAtivo?.id) {
        query = query.eq("cartorio_id", cartorioAtivo.id);
      }

      if (filtros.dataInicio) {
        query = query.gte("data", format(filtros.dataInicio, "yyyy-MM-dd"));
      }
      if (filtros.dataFim) {
        query = query.lte("data", format(filtros.dataFim, "yyyy-MM-dd"));
      }
      if (filtros.tipoLancamento !== "todos") {
        query = query.eq("tipo", filtros.tipoLancamento);
      }
      if (filtros.statusConciliacao !== "todos") {
        query = query.eq("status_conciliacao", filtros.statusConciliacao);
      }
      if (filtros.categoria) {
        query = query.eq("categoria", filtros.categoria);
      }

      const { data, error } = await query;
      if (error) throw error;

      const lancamentos = data || [];
      const receitas = lancamentos.filter((l) => l.tipo === "receita");
      const despesas = lancamentos.filter((l) => l.tipo === "despesa");

      const totalReceitas = receitas.reduce((acc, l) => acc + Number(l.valor), 0);
      const totalDespesas = despesas.reduce((acc, l) => acc + Number(l.valor), 0);

      return {
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
        quantidadeLancamentos: lancamentos.length,
        quantidadeReceitas: receitas.length,
        quantidadeDespesas: despesas.length,
      };
    },
    enabled: true,
  });
}

export function useDadosPorCategoria(filtros: FiltrosRelatorio, tipo: "receita" | "despesa") {
  const { cartorioAtivo } = useTenant();

  return useQuery({
    queryKey: ["relatorio-categoria", cartorioAtivo?.id, filtros, tipo],
    queryFn: async (): Promise<DadosPorCategoria[]> => {
      let query = supabase.from("lancamentos").select("categoria, valor").eq("tipo", tipo);

      if (cartorioAtivo?.id) {
        query = query.eq("cartorio_id", cartorioAtivo.id);
      }

      if (filtros.dataInicio) {
        query = query.gte("data", format(filtros.dataInicio, "yyyy-MM-dd"));
      }
      if (filtros.dataFim) {
        query = query.lte("data", format(filtros.dataFim, "yyyy-MM-dd"));
      }
      if (filtros.statusConciliacao !== "todos") {
        query = query.eq("status_conciliacao", filtros.statusConciliacao);
      }

      const { data, error } = await query;
      if (error) throw error;

      const lancamentos = data || [];
      const agrupado = lancamentos.reduce(
        (acc, l) => {
          const cat = l.categoria || "Sem categoria";
          if (!acc[cat]) {
            acc[cat] = { valor: 0, quantidade: 0 };
          }
          acc[cat].valor += Number(l.valor);
          acc[cat].quantidade += 1;
          return acc;
        },
        {} as Record<string, { valor: number; quantidade: number }>
      );

      const total = Object.values(agrupado).reduce((acc, v) => acc + v.valor, 0);

      return Object.entries(agrupado)
        .map(([categoria, dados]) => ({
          categoria,
          valor: dados.valor,
          quantidade: dados.quantidade,
          porcentagem: total > 0 ? (dados.valor / total) * 100 : 0,
        }))
        .sort((a, b) => b.valor - a.valor);
    },
  });
}

export function useEvolucaoMensal(filtros: FiltrosRelatorio, meses: number = 12) {
  const { cartorioAtivo } = useTenant();

  return useQuery({
    queryKey: ["relatorio-evolucao", cartorioAtivo?.id, filtros, meses],
    queryFn: async (): Promise<EvolucaoMensal[]> => {
      const hoje = new Date();
      const dataInicio = subMonths(startOfMonth(hoje), meses - 1);

      let query = supabase
        .from("lancamentos")
        .select("data, tipo, valor")
        .gte("data", format(dataInicio, "yyyy-MM-dd"))
        .lte("data", format(hoje, "yyyy-MM-dd"));

      if (cartorioAtivo?.id) {
        query = query.eq("cartorio_id", cartorioAtivo.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      const lancamentos = data || [];

      // Agrupar por mês
      const mesesMap = new Map<string, { receitas: number; despesas: number }>();

      for (let i = 0; i < meses; i++) {
        const mes = subMonths(hoje, meses - 1 - i);
        const chave = format(mes, "yyyy-MM");
        mesesMap.set(chave, { receitas: 0, despesas: 0 });
      }

      lancamentos.forEach((l) => {
        const chave = l.data.substring(0, 7); // yyyy-MM
        const dados = mesesMap.get(chave);
        if (dados) {
          if (l.tipo === "receita") {
            dados.receitas += Number(l.valor);
          } else {
            dados.despesas += Number(l.valor);
          }
        }
      });

      return Array.from(mesesMap.entries()).map(([chave, dados]) => {
        const [ano, mes] = chave.split("-");
        const dataRef = new Date(Number(ano), Number(mes) - 1);
        return {
          mes: format(dataRef, "MMMM yyyy", { locale: ptBR }),
          mesAbreviado: format(dataRef, "MMM", { locale: ptBR }),
          receitas: dados.receitas,
          despesas: dados.despesas,
          saldo: dados.receitas - dados.despesas,
        };
      });
    },
  });
}

export function useProdutividade(filtros: FiltrosRelatorio) {
  const { cartorioAtivo } = useTenant();

  return useQuery({
    queryKey: ["relatorio-produtividade", cartorioAtivo?.id, filtros],
    queryFn: async (): Promise<ProdutividadeResponsavel[]> => {
      let query = supabase.from("lancamentos").select("responsavel, tipo, valor");

      if (cartorioAtivo?.id) {
        query = query.eq("cartorio_id", cartorioAtivo.id);
      }

      if (filtros.dataInicio) {
        query = query.gte("data", format(filtros.dataInicio, "yyyy-MM-dd"));
      }
      if (filtros.dataFim) {
        query = query.lte("data", format(filtros.dataFim, "yyyy-MM-dd"));
      }
      if (filtros.tipoLancamento !== "todos") {
        query = query.eq("tipo", filtros.tipoLancamento);
      }

      const { data, error } = await query;
      if (error) throw error;

      const lancamentos = data || [];
      const agrupado = lancamentos.reduce(
        (acc, l) => {
          const resp = l.responsavel || "Não atribuído";
          if (!acc[resp]) {
            acc[resp] = { quantidade: 0, receitas: 0, despesas: 0 };
          }
          acc[resp].quantidade += 1;
          if (l.tipo === "receita") {
            acc[resp].receitas += Number(l.valor);
          } else {
            acc[resp].despesas += Number(l.valor);
          }
          return acc;
        },
        {} as Record<string, { quantidade: number; receitas: number; despesas: number }>
      );

      return Object.entries(agrupado)
        .map(([responsavel, dados]) => ({
          responsavel,
          quantidadeLancamentos: dados.quantidade,
          totalReceitas: dados.receitas,
          totalDespesas: dados.despesas,
          valorTotal: dados.receitas + dados.despesas,
        }))
        .sort((a, b) => b.valorTotal - a.valorTotal);
    },
  });
}

export function useDadosConciliacao(filtros: FiltrosRelatorio) {
  const { cartorioAtivo } = useTenant();

  return useQuery({
    queryKey: ["relatorio-conciliacao", cartorioAtivo?.id, filtros],
    queryFn: async (): Promise<DadosConciliacao> => {
      let query = supabase.from("lancamentos").select("status_conciliacao, valor");

      if (cartorioAtivo?.id) {
        query = query.eq("cartorio_id", cartorioAtivo.id);
      }

      if (filtros.dataInicio) {
        query = query.gte("data", format(filtros.dataInicio, "yyyy-MM-dd"));
      }
      if (filtros.dataFim) {
        query = query.lte("data", format(filtros.dataFim, "yyyy-MM-dd"));
      }

      const { data, error } = await query;
      if (error) throw error;

      const lancamentos = data || [];

      const conciliados = lancamentos.filter((l) => l.status_conciliacao === "conciliado");
      const pendentes = lancamentos.filter((l) => l.status_conciliacao === "pendente");
      const divergentes = lancamentos.filter((l) => l.status_conciliacao === "divergente");

      const valorConciliado = conciliados.reduce((acc, l) => acc + Number(l.valor), 0);
      const valorPendente = pendentes.reduce((acc, l) => acc + Number(l.valor), 0);

      return {
        totalItens: lancamentos.length,
        conciliados: conciliados.length,
        pendentes: pendentes.length,
        divergentes: divergentes.length,
        percentualConciliado: lancamentos.length > 0 ? (conciliados.length / lancamentos.length) * 100 : 0,
        valorConciliado,
        valorPendente,
      };
    },
  });
}

export function useLancamentosRelatorio(filtros: FiltrosRelatorio) {
  const { cartorioAtivo } = useTenant();

  return useQuery({
    queryKey: ["relatorio-lancamentos", cartorioAtivo?.id, filtros],
    queryFn: async (): Promise<LancamentoRelatorio[]> => {
      let query = supabase
        .from("lancamentos")
        .select("id, data, descricao, categoria, tipo, valor, status, status_conciliacao, responsavel")
        .order("data", { ascending: false });

      if (cartorioAtivo?.id) {
        query = query.eq("cartorio_id", cartorioAtivo.id);
      }

      if (filtros.dataInicio) {
        query = query.gte("data", format(filtros.dataInicio, "yyyy-MM-dd"));
      }
      if (filtros.dataFim) {
        query = query.lte("data", format(filtros.dataFim, "yyyy-MM-dd"));
      }
      if (filtros.tipoLancamento !== "todos") {
        query = query.eq("tipo", filtros.tipoLancamento);
      }
      if (filtros.statusConciliacao !== "todos") {
        query = query.eq("status_conciliacao", filtros.statusConciliacao);
      }
      if (filtros.categoria) {
        query = query.eq("categoria", filtros.categoria);
      }
      if (filtros.responsavel) {
        query = query.eq("responsavel", filtros.responsavel);
      }

      const { data, error } = await query.limit(500);
      if (error) throw error;

      return (data || []).map((l) => ({
        id: l.id,
        data: l.data,
        descricao: l.descricao,
        categoria: l.categoria,
        tipo: l.tipo as "receita" | "despesa",
        valor: Number(l.valor),
        status: l.status,
        statusConciliacao: l.status_conciliacao,
        responsavel: l.responsavel,
      }));
    },
  });
}

export function useCategorias() {
  const { cartorioAtivo } = useTenant();

  return useQuery({
    queryKey: ["categorias-lancamentos", cartorioAtivo?.id],
    queryFn: async () => {
      let query = supabase.from("lancamentos").select("categoria");

      if (cartorioAtivo?.id) {
        query = query.eq("cartorio_id", cartorioAtivo.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      const categorias = [...new Set((data || []).map((l) => l.categoria).filter(Boolean))];
      return categorias.sort() as string[];
    },
  });
}

export function useResponsaveis() {
  const { cartorioAtivo } = useTenant();

  return useQuery({
    queryKey: ["responsaveis-lancamentos", cartorioAtivo?.id],
    queryFn: async () => {
      let query = supabase.from("lancamentos").select("responsavel");

      if (cartorioAtivo?.id) {
        query = query.eq("cartorio_id", cartorioAtivo.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      const responsaveis = [...new Set((data || []).map((l) => l.responsavel).filter(Boolean))];
      return responsaveis.sort() as string[];
    },
  });
}
