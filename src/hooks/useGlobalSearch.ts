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
      const searchTerm = `%${query}%`;
      const results: SearchResult[] = [];

      // Search Lançamentos - using textSearch or simple ilike
      let lancamentosQuery = supabase
        .from("lancamentos")
        .select("id, descricao, categoria, valor, tipo, data, cartorio_id")
        .ilike("descricao", searchTerm)
        .limit(5);

      if (cartorioAtivo && !isSuperAdmin) {
        lancamentosQuery = lancamentosQuery.eq("cartorio_id", cartorioAtivo.id);
      }

      const { data: lancamentos, error: lancamentosError } = await lancamentosQuery;
      
      if (lancamentosError) {
        console.error("Erro ao buscar lançamentos:", lancamentosError);
      }
      
      if (lancamentos && lancamentos.length > 0) {
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

      // Also search by categoria
      let lancamentosByCategoriaQuery = supabase
        .from("lancamentos")
        .select("id, descricao, categoria, valor, tipo, data, cartorio_id")
        .ilike("categoria", searchTerm)
        .limit(5);

      if (cartorioAtivo && !isSuperAdmin) {
        lancamentosByCategoriaQuery = lancamentosByCategoriaQuery.eq("cartorio_id", cartorioAtivo.id);
      }

      const { data: lancamentosByCategoria } = await lancamentosByCategoriaQuery;
      
      if (lancamentosByCategoria && lancamentosByCategoria.length > 0) {
        lancamentosByCategoria.forEach(l => {
          // Avoid duplicates
          if (!results.find(r => r.id === l.id)) {
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
          }
        });
      }

      // Search Contas Bancárias
      let contasQuery = supabase
        .from("contas_bancarias")
        .select("id, banco, agencia, conta, tipo, cartorio_id")
        .ilike("banco", searchTerm)
        .eq("ativo", true)
        .limit(5);

      if (cartorioAtivo && !isSuperAdmin) {
        contasQuery = contasQuery.eq("cartorio_id", cartorioAtivo.id);
      }

      const { data: contas, error: contasError } = await contasQuery;
      
      if (contasError) {
        console.error("Erro ao buscar contas:", contasError);
      }
      
      if (contas && contas.length > 0) {
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
      let extratosQuery = supabase
        .from("extratos")
        .select("id, arquivo, periodo_inicio, periodo_fim, total_lancamentos, cartorio_id")
        .ilike("arquivo", searchTerm)
        .limit(5);

      if (cartorioAtivo && !isSuperAdmin) {
        extratosQuery = extratosQuery.eq("cartorio_id", cartorioAtivo.id);
      }

      const { data: extratos, error: extratosError } = await extratosQuery;
      
      if (extratosError) {
        console.error("Erro ao buscar extratos:", extratosError);
      }
      
      if (extratos && extratos.length > 0) {
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
        const { data: cartorios, error: cartoriosError } = await supabase
          .from("cartorios")
          .select("id, nome, cnpj, email")
          .ilike("nome", searchTerm)
          .eq("ativo", true)
          .limit(5);

        if (cartoriosError) {
          console.error("Erro ao buscar cartórios:", cartoriosError);
        }

        if (cartorios && cartorios.length > 0) {
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

      console.log("Busca global - query:", query, "resultados:", results.length);
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
