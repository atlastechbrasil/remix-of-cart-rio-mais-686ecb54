import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";

export type SearchResultType = 
  | "lancamento" 
  | "conta_bancaria" 
  | "extrato" 
  | "cartorio" 
  | "usuario";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  route: string;
}

interface SearchState {
  results: SearchResult[];
  isSearching: boolean;
  error: string | null;
}

export function useGlobalSearch() {
  const { cartorioAtivo, isSuperAdmin } = useTenant();
  const { user } = useAuth();
  const [state, setState] = useState<SearchState>({
    results: [],
    isSearching: false,
    error: null,
  });

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 2 || !user) {
      setState({ results: [], isSearching: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, isSearching: true, error: null }));

    try {
      const searchTerm = `%${query.toLowerCase()}%`;
      const results: SearchResult[] = [];

      // Search Lançamentos
      const lancamentosQuery = supabase
        .from("lancamentos")
        .select("id, descricao, categoria, valor, tipo, data")
        .or(`descricao.ilike.${searchTerm},categoria.ilike.${searchTerm}`)
        .limit(5);

      if (cartorioAtivo && !isSuperAdmin) {
        lancamentosQuery.eq("cartorio_id", cartorioAtivo.id);
      }

      const { data: lancamentos } = await lancamentosQuery;
      
      if (lancamentos) {
        lancamentos.forEach(l => {
          const valor = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
          }).format(l.valor);
          
          results.push({
            id: l.id,
            type: "lancamento",
            title: l.descricao,
            subtitle: `${l.tipo === "receita" ? "+" : "-"}${valor} • ${l.categoria || "Sem categoria"}`,
            route: `/lancamentos?id=${l.id}`,
          });
        });
      }

      // Search Contas Bancárias
      const contasQuery = supabase
        .from("contas_bancarias")
        .select("id, banco, agencia, conta, tipo")
        .or(`banco.ilike.${searchTerm},conta.ilike.${searchTerm},agencia.ilike.${searchTerm}`)
        .eq("ativo", true)
        .limit(5);

      if (cartorioAtivo && !isSuperAdmin) {
        contasQuery.eq("cartorio_id", cartorioAtivo.id);
      }

      const { data: contas } = await contasQuery;
      
      if (contas) {
        contas.forEach(c => {
          results.push({
            id: c.id,
            type: "conta_bancaria",
            title: `${c.banco} - ${c.conta}`,
            subtitle: `Ag. ${c.agencia} • ${c.tipo}`,
            route: `/contas?id=${c.id}`,
          });
        });
      }

      // Search Extratos
      const extratosQuery = supabase
        .from("extratos")
        .select("id, arquivo, periodo_inicio, periodo_fim, total_lancamentos")
        .ilike("arquivo", searchTerm)
        .limit(5);

      if (cartorioAtivo && !isSuperAdmin) {
        extratosQuery.eq("cartorio_id", cartorioAtivo.id);
      }

      const { data: extratos } = await extratosQuery;
      
      if (extratos) {
        extratos.forEach(e => {
          results.push({
            id: e.id,
            type: "extrato",
            title: e.arquivo,
            subtitle: `${e.total_lancamentos} itens`,
            route: `/extratos?id=${e.id}`,
          });
        });
      }

      // Search Cartórios (only for super admins)
      if (isSuperAdmin) {
        const { data: cartorios } = await supabase
          .from("cartorios")
          .select("id, nome, cnpj, email")
          .or(`nome.ilike.${searchTerm},cnpj.ilike.${searchTerm},email.ilike.${searchTerm}`)
          .eq("ativo", true)
          .limit(5);

        if (cartorios) {
          cartorios.forEach(c => {
            results.push({
              id: c.id,
              type: "cartorio",
              title: c.nome,
              subtitle: c.cnpj || c.email || undefined,
              route: `/cartorios?id=${c.id}`,
            });
          });
        }
      }

      setState({ results, isSearching: false, error: null });
    } catch (error) {
      console.error("Erro na busca global:", error);
      setState({ results: [], isSearching: false, error: "Erro ao buscar" });
    }
  }, [user, cartorioAtivo, isSuperAdmin]);

  const clearResults = useCallback(() => {
    setState({ results: [], isSearching: false, error: null });
  }, []);

  return {
    ...state,
    search,
    clearResults,
  };
}
