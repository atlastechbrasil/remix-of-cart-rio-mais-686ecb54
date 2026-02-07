import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";
import { format, startOfDay, endOfDay } from "date-fns";
import type { 
  ExtratoItem, 
  Lancamento, 
  Conciliacao, 
  ConciliacaoDetalhada,
  ConciliacaoStats,
  ConciliacaoFiltros
} from "@/types/conciliacao";

// Hook for fetching bank statement items by date range
export function useExtratoItensByDate(contaId?: string, data?: Date) {
  const { user } = useAuth();
  const { cartorioAtivo } = useTenant();

  return useQuery({
    queryKey: ["extrato-itens-data", contaId, data?.toISOString(), user?.id, cartorioAtivo?.id],
    queryFn: async () => {
      if (!contaId || !data) return [];

      // First get extratos for the account
      const { data: extratos, error: extratosError } = await supabase
        .from("extratos")
        .select("id")
        .eq("conta_id", contaId);

      if (extratosError) throw extratosError;
      if (!extratos || extratos.length === 0) return [];

      const extratoIds = extratos.map((e) => e.id);
      const dateStr = format(data, "yyyy-MM-dd");

      let query = supabase
        .from("extrato_itens")
        .select("*")
        .in("extrato_id", extratoIds)
        .eq("data_transacao", dateStr)
        .order("data_transacao", { ascending: false });

      if (cartorioAtivo) {
        query = query.eq("cartorio_id", cartorioAtivo.id);
      }

      const { data: itens, error } = await query;
      if (error) throw error;
      return itens as ExtratoItem[];
    },
    enabled: !!user && !!contaId && !!data,
  });
}

// Hook for fetching transactions by date
export function useLancamentosByDate(data?: Date) {
  const { user } = useAuth();
  const { cartorioAtivo } = useTenant();

  return useQuery({
    queryKey: ["lancamentos-data", data?.toISOString(), user?.id, cartorioAtivo?.id],
    queryFn: async () => {
      if (!data) return [];

      const dateStr = format(data, "yyyy-MM-dd");

      let query = supabase
        .from("lancamentos")
        .select("*")
        .eq("data", dateStr)
        .order("data", { ascending: false });

      if (cartorioAtivo) {
        query = query.eq("cartorio_id", cartorioAtivo.id);
      }

      const { data: lancamentos, error } = await query;
      if (error) throw error;
      return lancamentos as Lancamento[];
    },
    enabled: !!user && !!data,
  });
}

// Hook for fetching detailed reconciliations by date
// Fetches conciliations where the extrato_item has the selected transaction date
export function useConciliacoesByDate(data?: Date) {
  const { user } = useAuth();
  const { cartorioAtivo } = useTenant();

  return useQuery({
    queryKey: ["conciliacoes-data", data?.toISOString(), user?.id, cartorioAtivo?.id],
    queryFn: async () => {
      if (!data) return [];

      const dateStr = format(data, "yyyy-MM-dd");

      // Fetch all conciliacoes with their related data
      let query = supabase
        .from("conciliacoes")
        .select(`
          *,
          extrato_item:extrato_itens(*),
          lancamento:lancamentos(*)
        `)
        .order("conciliado_em", { ascending: false });

      // Filter by cartorio - include records with matching cartorio_id OR null cartorio_id
      if (cartorioAtivo) {
        query = query.or(`cartorio_id.eq.${cartorioAtivo.id},cartorio_id.is.null`);
      }

      const { data: conciliacoes, error } = await query;
      if (error) throw error;

      // Filter by extrato_item's transaction date (the date the user selected)
      const filtered = (conciliacoes || []).filter((c) => {
        const extratoDate = c.extrato_item?.data_transacao;
        return extratoDate === dateStr;
      });

      return filtered as ConciliacaoDetalhada[];
    },
    enabled: !!user && !!data,
  });
}

// Hook for fetching reconciliation history with filters
export function useConciliacaoHistory(filtros?: ConciliacaoFiltros) {
  const { user } = useAuth();
  const { cartorioAtivo } = useTenant();

  return useQuery({
    queryKey: ["conciliacao-history", filtros, user?.id, cartorioAtivo?.id],
    queryFn: async () => {
      let query = supabase
        .from("conciliacoes")
        .select(`
          *,
          extrato_item:extrato_itens(*),
          lancamento:lancamentos(*)
        `)
        .order("conciliado_em", { ascending: false })
        .limit(100);

      if (cartorioAtivo) {
        query = query.eq("cartorio_id", cartorioAtivo.id);
      }

      if (filtros?.dataInicio) {
        query = query.gte("conciliado_em", startOfDay(filtros.dataInicio).toISOString());
      }

      if (filtros?.dataFim) {
        query = query.lte("conciliado_em", endOfDay(filtros.dataFim).toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ConciliacaoDetalhada[];
    },
    enabled: !!user,
  });
}

// Hook for updating a reconciliation
export function useUpdateConciliacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      observacao,
    }: {
      id: string;
      observacao?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("conciliacoes")
        .update({ observacao })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conciliacoes"] });
      queryClient.invalidateQueries({ queryKey: ["conciliacoes-data"] });
      queryClient.invalidateQueries({ queryKey: ["conciliacao-history"] });
      toast.success("Conciliação atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar conciliação: " + error.message);
    },
  });
}

// Hook for calculating stats by date
export function useConciliacaoStatsByDate(contaId?: string, data?: Date) {
  const { data: extratoItens } = useExtratoItensByDate(contaId, data);
  const { data: lancamentos } = useLancamentosByDate(data);

  const stats: ConciliacaoStats = {
    conciliados: 0,
    pendentes: 0,
    divergentes: 0,
    taxaConciliacao: 0,
    totalExtrato: extratoItens?.length || 0,
    totalLancamentos: lancamentos?.length || 0,
    valorTotalExtrato: 0,
    valorTotalLancamentos: 0,
    diferencaValores: 0,
  };

  if (extratoItens) {
    stats.conciliados = extratoItens.filter((i) => i.status_conciliacao === "conciliado").length;
    stats.pendentes = extratoItens.filter((i) => i.status_conciliacao === "pendente").length;
    stats.divergentes = extratoItens.filter((i) => i.status_conciliacao === "divergente").length;
    stats.taxaConciliacao = stats.totalExtrato > 0 
      ? Math.round((stats.conciliados / stats.totalExtrato) * 100) 
      : 0;
    stats.valorTotalExtrato = extratoItens.reduce((sum, i) => sum + Math.abs(Number(i.valor)), 0);
  }

  if (lancamentos) {
    stats.valorTotalLancamentos = lancamentos.reduce((sum, l) => sum + Number(l.valor), 0);
  }

  stats.diferencaValores = stats.valorTotalExtrato - stats.valorTotalLancamentos;

  return stats;
}

// Hook for pending items count by date (for badges)
export function usePendentesCountByDate(contaId?: string, data?: Date) {
  const { data: extratoItens } = useExtratoItensByDate(contaId, data);
  
  return extratoItens?.filter((i) => i.status_conciliacao === "pendente").length || 0;
}
