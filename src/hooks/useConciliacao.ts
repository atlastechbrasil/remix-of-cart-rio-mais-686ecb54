import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Types based on database schema
export type StatusConciliacao = "pendente" | "conciliado" | "divergente";
export type TipoConta = "corrente" | "poupanca" | "investimento";
export type TipoTransacao = "credito" | "debito";
export type TipoLancamento = "receita" | "despesa";
export type StatusLancamento = "pago" | "pendente" | "agendado" | "cancelado";

export interface ContaBancaria {
  id: string;
  user_id: string;
  banco: string;
  agencia: string;
  conta: string;
  tipo: TipoConta;
  saldo: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Extrato {
  id: string;
  user_id: string;
  conta_id: string;
  arquivo: string;
  periodo_inicio: string;
  periodo_fim: string;
  total_lancamentos: number;
  status: string;
  created_at: string;
  conta_bancaria?: ContaBancaria;
}

export interface ExtratoItem {
  id: string;
  extrato_id: string;
  user_id: string;
  data_transacao: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  saldo_parcial: number | null;
  status_conciliacao: StatusConciliacao;
  lancamento_vinculado_id: string | null;
  created_at: string;
}

export interface Lancamento {
  id: string;
  user_id: string;
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

export interface Conciliacao {
  id: string;
  user_id: string;
  extrato_item_id: string;
  lancamento_id: string;
  diferenca: number;
  observacao: string | null;
  conciliado_em: string;
  created_at: string;
}

// Hook para Contas Bancárias
export function useContasBancarias() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["contas-bancarias", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas_bancarias")
        .select("*")
        .order("banco", { ascending: true });

      if (error) throw error;
      return data as ContaBancaria[];
    },
    enabled: !!user,
  });
}

export function useCreateContaBancaria() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (conta: Omit<ContaBancaria, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("contas_bancarias")
        .insert({ ...conta, user_id: user!.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
      toast.success("Conta bancária criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar conta bancária: " + error.message);
    },
  });
}

export function useUpdateContaBancaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContaBancaria> & { id: string }) => {
      const { data, error } = await supabase
        .from("contas_bancarias")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
      toast.success("Conta bancária atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar conta bancária: " + error.message);
    },
  });
}

export function useDeleteContaBancaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contas_bancarias")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
      toast.success("Conta bancária removida!");
    },
    onError: (error) => {
      toast.error("Erro ao remover conta bancária: " + error.message);
    },
  });
}

// Hook para Extratos
export function useExtratos() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["extratos", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extratos")
        .select(`
          *,
          conta_bancaria:contas_bancarias(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (Extrato & { conta_bancaria: ContaBancaria })[];
    },
    enabled: !!user,
  });
}

export function useCreateExtrato() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (extrato: Omit<Extrato, "id" | "user_id" | "created_at">) => {
      const { data, error } = await supabase
        .from("extratos")
        .insert({ ...extrato, user_id: user!.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extratos"] });
      toast.success("Extrato importado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao importar extrato: " + error.message);
    },
  });
}

// Hook para Itens de Extrato
export function useExtratoItens(extratoId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["extrato-itens", extratoId, user?.id],
    queryFn: async () => {
      let query = supabase
        .from("extrato_itens")
        .select("*")
        .order("data_transacao", { ascending: false });

      if (extratoId) {
        query = query.eq("extrato_id", extratoId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ExtratoItem[];
    },
    enabled: !!user,
  });
}

export function useExtratoItensByConta(contaId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["extrato-itens-conta", contaId, user?.id],
    queryFn: async () => {
      const { data: extratos, error: extratosError } = await supabase
        .from("extratos")
        .select("id")
        .eq("conta_id", contaId!);

      if (extratosError) throw extratosError;

      if (!extratos || extratos.length === 0) return [];

      const extratoIds = extratos.map((e) => e.id);

      const { data, error } = await supabase
        .from("extrato_itens")
        .select("*")
        .in("extrato_id", extratoIds)
        .order("data_transacao", { ascending: false });

      if (error) throw error;
      return data as ExtratoItem[];
    },
    enabled: !!user && !!contaId,
  });
}

export function useCreateExtratoItens() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (itens: Omit<ExtratoItem, "id" | "user_id" | "created_at">[]) => {
      const itensComUser = itens.map((item) => ({ ...item, user_id: user!.id }));
      const { data, error } = await supabase
        .from("extrato_itens")
        .insert(itensComUser)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extrato-itens"] });
      queryClient.invalidateQueries({ queryKey: ["extrato-itens-conta"] });
    },
    onError: (error) => {
      toast.error("Erro ao importar itens do extrato: " + error.message);
    },
  });
}

// Hook para Lançamentos
export function useLancamentos() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["lancamentos", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lancamentos")
        .select("*")
        .order("data", { ascending: false });

      if (error) throw error;
      return data as Lancamento[];
    },
    enabled: !!user,
  });
}

export function useCreateLancamento() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (lancamento: Omit<Lancamento, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("lancamentos")
        .insert({ ...lancamento, user_id: user!.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lancamentos"] });
      toast.success("Lançamento criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar lançamento: " + error.message);
    },
  });
}

export function useUpdateLancamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lancamento> & { id: string }) => {
      const { data, error } = await supabase
        .from("lancamentos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lancamentos"] });
      toast.success("Lançamento atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar lançamento: " + error.message);
    },
  });
}

export function useDeleteLancamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("lancamentos")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lancamentos"] });
      toast.success("Lançamento removido!");
    },
    onError: (error) => {
      toast.error("Erro ao remover lançamento: " + error.message);
    },
  });
}

// Hook para Conciliação
export function useConciliacoes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conciliacoes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conciliacoes")
        .select("*")
        .order("conciliado_em", { ascending: false });

      if (error) throw error;
      return data as Conciliacao[];
    },
    enabled: !!user,
  });
}

export function useVincularConciliacao() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      extratoItemId,
      lancamentoId,
      diferenca = 0,
      observacao,
    }: {
      extratoItemId: string;
      lancamentoId: string;
      diferenca?: number;
      observacao?: string;
    }) => {
      // Criar registro de conciliação
      const { error: conciliacaoError } = await supabase
        .from("conciliacoes")
        .insert({
          user_id: user!.id,
          extrato_item_id: extratoItemId,
          lancamento_id: lancamentoId,
          diferenca,
          observacao,
        });

      if (conciliacaoError) throw conciliacaoError;

      // Atualizar status do item do extrato
      const { error: extratoError } = await supabase
        .from("extrato_itens")
        .update({
          status_conciliacao: diferenca !== 0 ? "divergente" : "conciliado",
          lancamento_vinculado_id: lancamentoId,
        })
        .eq("id", extratoItemId);

      if (extratoError) throw extratoError;

      // Atualizar status do lançamento
      const { error: lancamentoError } = await supabase
        .from("lancamentos")
        .update({
          status_conciliacao: diferenca !== 0 ? "divergente" : "conciliado",
          extrato_item_vinculado_id: extratoItemId,
        })
        .eq("id", lancamentoId);

      if (lancamentoError) throw lancamentoError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conciliacoes"] });
      queryClient.invalidateQueries({ queryKey: ["extrato-itens"] });
      queryClient.invalidateQueries({ queryKey: ["extrato-itens-conta"] });
      queryClient.invalidateQueries({ queryKey: ["lancamentos"] });
      toast.success("Itens conciliados com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao conciliar itens: " + error.message);
    },
  });
}

export function useDesvincularConciliacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      extratoItemId,
      lancamentoId,
    }: {
      extratoItemId: string;
      lancamentoId: string;
    }) => {
      // Remover registro de conciliação
      const { error: conciliacaoError } = await supabase
        .from("conciliacoes")
        .delete()
        .eq("extrato_item_id", extratoItemId)
        .eq("lancamento_id", lancamentoId);

      if (conciliacaoError) throw conciliacaoError;

      // Atualizar status do item do extrato
      const { error: extratoError } = await supabase
        .from("extrato_itens")
        .update({
          status_conciliacao: "pendente",
          lancamento_vinculado_id: null,
        })
        .eq("id", extratoItemId);

      if (extratoError) throw extratoError;

      // Atualizar status do lançamento
      const { error: lancamentoError } = await supabase
        .from("lancamentos")
        .update({
          status_conciliacao: "pendente",
          extrato_item_vinculado_id: null,
        })
        .eq("id", lancamentoId);

      if (lancamentoError) throw lancamentoError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conciliacoes"] });
      queryClient.invalidateQueries({ queryKey: ["extrato-itens"] });
      queryClient.invalidateQueries({ queryKey: ["extrato-itens-conta"] });
      queryClient.invalidateQueries({ queryKey: ["lancamentos"] });
      toast.success("Conciliação desfeita!");
    },
    onError: (error) => {
      toast.error("Erro ao desfazer conciliação: " + error.message);
    },
  });
}

// Estatísticas de conciliação
export function useConciliacaoStats(contaId?: string) {
  const { data: extratoItens } = useExtratoItensByConta(contaId);
  const { data: lancamentos } = useLancamentos();

  const stats = {
    conciliados: 0,
    pendentes: 0,
    divergentes: 0,
    taxaConciliacao: 0,
    totalExtrato: extratoItens?.length || 0,
    totalLancamentos: lancamentos?.length || 0,
  };

  if (extratoItens) {
    stats.conciliados = extratoItens.filter((i) => i.status_conciliacao === "conciliado").length;
    stats.pendentes = extratoItens.filter((i) => i.status_conciliacao === "pendente").length;
    stats.divergentes = extratoItens.filter((i) => i.status_conciliacao === "divergente").length;
    stats.taxaConciliacao = stats.totalExtrato > 0 
      ? Math.round((stats.conciliados / stats.totalExtrato) * 100) 
      : 0;
  }

  return stats;
}
