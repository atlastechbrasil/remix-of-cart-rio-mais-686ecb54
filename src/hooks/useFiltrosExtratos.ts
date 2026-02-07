import { useState, useMemo, useCallback } from "react";
import { isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";

export type StatusExtrato = "todos" | "processado" | "conciliado" | "erro";

export interface FiltrosExtratos {
  contaId: string | null;
  periodo: DateRange | undefined;
  status: StatusExtrato;
  busca: string;
}

export interface ExtratoComFiltro {
  id: string;
  arquivo: string;
  conta_id: string;
  conta_bancaria: { banco: string; conta: string } | null;
  periodo_inicio: string;
  periodo_fim: string;
  total_lancamentos: number;
  status: string;
  created_at: string;
}

const filtrosIniciais: FiltrosExtratos = {
  contaId: null,
  periodo: undefined,
  status: "todos",
  busca: "",
};

export function useFiltrosExtratos() {
  const [filtros, setFiltros] = useState<FiltrosExtratos>(filtrosIniciais);

  const setContaId = useCallback((contaId: string | null) => {
    setFiltros((prev) => ({ ...prev, contaId }));
  }, []);

  const setPeriodo = useCallback((periodo: DateRange | undefined) => {
    setFiltros((prev) => ({ ...prev, periodo }));
  }, []);

  const setStatus = useCallback((status: StatusExtrato) => {
    setFiltros((prev) => ({ ...prev, status }));
  }, []);

  const setBusca = useCallback((busca: string) => {
    setFiltros((prev) => ({ ...prev, busca }));
  }, []);

  const limparFiltros = useCallback(() => {
    setFiltros(filtrosIniciais);
  }, []);

  const temFiltrosAtivos = useMemo(() => {
    return (
      filtros.contaId !== null ||
      filtros.periodo !== undefined ||
      filtros.status !== "todos" ||
      filtros.busca.trim() !== ""
    );
  }, [filtros]);

  const aplicarFiltros = useCallback(
    (extratos: ExtratoComFiltro[]): ExtratoComFiltro[] => {
      return extratos.filter((extrato) => {
        // Filtro por conta
        if (filtros.contaId && extrato.conta_id !== filtros.contaId) {
          return false;
        }

        // Filtro por status
        if (filtros.status !== "todos" && extrato.status !== filtros.status) {
          return false;
        }

        // Filtro por busca (nome do arquivo ou banco)
        if (filtros.busca.trim()) {
          const termoBusca = filtros.busca.toLowerCase();
          const matchArquivo = extrato.arquivo.toLowerCase().includes(termoBusca);
          const matchBanco = extrato.conta_bancaria?.banco.toLowerCase().includes(termoBusca);
          const matchConta = extrato.conta_bancaria?.conta.toLowerCase().includes(termoBusca);
          
          if (!matchArquivo && !matchBanco && !matchConta) {
            return false;
          }
        }

        // Filtro por período (baseado na data de importação)
        if (filtros.periodo?.from) {
          const dataImportacao = parseISO(extrato.created_at);
          const inicio = startOfDay(filtros.periodo.from);
          const fim = filtros.periodo.to 
            ? endOfDay(filtros.periodo.to) 
            : endOfDay(filtros.periodo.from);
          
          if (!isWithinInterval(dataImportacao, { start: inicio, end: fim })) {
            return false;
          }
        }

        return true;
      });
    },
    [filtros]
  );

  return {
    filtros,
    setContaId,
    setPeriodo,
    setStatus,
    setBusca,
    limparFiltros,
    temFiltrosAtivos,
    aplicarFiltros,
  };
}
