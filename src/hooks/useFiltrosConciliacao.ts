import { useState, useMemo, useCallback } from "react";
import type {
  ConciliacaoFiltros,
  ExtratoItem,
  Lancamento,
  StatusConciliacao,
  TipoLancamento,
  TipoTransacao,
} from "@/types/conciliacao";

export interface FiltrosState extends ConciliacaoFiltros {
  ativo: boolean;
  contadorAtivos: number;
}

const FILTROS_INICIAIS: ConciliacaoFiltros = {
  status: [],
  tipoLancamento: [],
  tipoTransacao: [],
  valorMinimo: undefined,
  valorMaximo: undefined,
  busca: "",
};

export function useFiltrosConciliacao() {
  const [filtros, setFiltros] = useState<ConciliacaoFiltros>(FILTROS_INICIAIS);

  // Count active filters
  const contadorAtivos = useMemo(() => {
    let count = 0;
    if (filtros.status && filtros.status.length > 0) count++;
    if (filtros.tipoLancamento && filtros.tipoLancamento.length > 0) count++;
    if (filtros.tipoTransacao && filtros.tipoTransacao.length > 0) count++;
    if (filtros.valorMinimo !== undefined) count++;
    if (filtros.valorMaximo !== undefined) count++;
    return count;
  }, [filtros]);

  const ativo = contadorAtivos > 0;

  // Update individual filter
  const setFiltro = useCallback(
    <K extends keyof ConciliacaoFiltros>(key: K, value: ConciliacaoFiltros[K]) => {
      setFiltros((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Toggle status filter
  const toggleStatus = useCallback((status: StatusConciliacao) => {
    setFiltros((prev) => {
      const currentStatus = prev.status || [];
      const newStatus = currentStatus.includes(status)
        ? currentStatus.filter((s) => s !== status)
        : [...currentStatus, status];
      return { ...prev, status: newStatus };
    });
  }, []);

  // Toggle tipo lancamento filter
  const toggleTipoLancamento = useCallback((tipo: TipoLancamento) => {
    setFiltros((prev) => {
      const currentTipo = prev.tipoLancamento || [];
      const newTipo = currentTipo.includes(tipo)
        ? currentTipo.filter((t) => t !== tipo)
        : [...currentTipo, tipo];
      return { ...prev, tipoLancamento: newTipo };
    });
  }, []);

  // Toggle tipo transacao filter
  const toggleTipoTransacao = useCallback((tipo: TipoTransacao) => {
    setFiltros((prev) => {
      const currentTipo = prev.tipoTransacao || [];
      const newTipo = currentTipo.includes(tipo)
        ? currentTipo.filter((t) => t !== tipo)
        : [...currentTipo, tipo];
      return { ...prev, tipoTransacao: newTipo };
    });
  }, []);

  // Set value range
  const setValorRange = useCallback((min?: number, max?: number) => {
    setFiltros((prev) => ({
      ...prev,
      valorMinimo: min,
      valorMaximo: max,
    }));
  }, []);

  // Clear all filters
  const limparFiltros = useCallback(() => {
    setFiltros(FILTROS_INICIAIS);
  }, []);

  // Filter extrato items
  const filtrarExtratoItens = useCallback(
    (items: ExtratoItem[], searchTerm: string = ""): ExtratoItem[] => {
      return items.filter((item) => {
        // Search term filter
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchesSearch =
            item.descricao.toLowerCase().includes(term) ||
            String(Math.abs(item.valor)).includes(term);
          if (!matchesSearch) return false;
        }

        // Status filter
        if (filtros.status && filtros.status.length > 0) {
          if (!filtros.status.includes(item.status_conciliacao)) {
            return false;
          }
        }

        // Tipo transacao filter
        if (filtros.tipoTransacao && filtros.tipoTransacao.length > 0) {
          if (!filtros.tipoTransacao.includes(item.tipo as TipoTransacao)) {
            return false;
          }
        }

        // Valor range filter
        const valorAbs = Math.abs(item.valor);
        if (filtros.valorMinimo !== undefined && valorAbs < filtros.valorMinimo) {
          return false;
        }
        if (filtros.valorMaximo !== undefined && valorAbs > filtros.valorMaximo) {
          return false;
        }

        return true;
      });
    },
    [filtros]
  );

  // Filter lancamentos
  const filtrarLancamentos = useCallback(
    (items: Lancamento[], searchTerm: string = ""): Lancamento[] => {
      return items.filter((item) => {
        // Search term filter
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchesSearch =
            item.descricao.toLowerCase().includes(term) ||
            item.categoria?.toLowerCase().includes(term) ||
            String(item.valor).includes(term);
          if (!matchesSearch) return false;
        }

        // Status filter
        if (filtros.status && filtros.status.length > 0) {
          if (!filtros.status.includes(item.status_conciliacao)) {
            return false;
          }
        }

        // Tipo lancamento filter
        if (filtros.tipoLancamento && filtros.tipoLancamento.length > 0) {
          if (!filtros.tipoLancamento.includes(item.tipo as TipoLancamento)) {
            return false;
          }
        }

        // Valor range filter
        if (filtros.valorMinimo !== undefined && item.valor < filtros.valorMinimo) {
          return false;
        }
        if (filtros.valorMaximo !== undefined && item.valor > filtros.valorMaximo) {
          return false;
        }

        return true;
      });
    },
    [filtros]
  );

  return {
    filtros,
    setFiltro,
    toggleStatus,
    toggleTipoLancamento,
    toggleTipoTransacao,
    setValorRange,
    limparFiltros,
    filtrarExtratoItens,
    filtrarLancamentos,
    ativo,
    contadorAtivos,
  };
}
