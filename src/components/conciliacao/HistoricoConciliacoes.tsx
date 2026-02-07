import { useState } from "react";
import { format, parseISO, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Search, Filter, Loader2, Eye, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useConciliacaoHistory } from "@/hooks/useConciliacaoAdvanced";
import type { ConciliacaoDetalhada, StatusConciliacao } from "@/types/conciliacao";

interface HistoricoConciliacoesProps {
  onViewDetails?: (conciliacao: ConciliacaoDetalhada) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Math.abs(value));
};

type PeriodoFiltro = "7dias" | "30dias" | "esteMes" | "mesAnterior" | "customizado";

export function HistoricoConciliacoes({ onViewDetails }: HistoricoConciliacoesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [periodoFiltro, setPeriodoFiltro] = useState<PeriodoFiltro>("30dias");
  const [statusFiltro, setStatusFiltro] = useState<StatusConciliacao | "todos">("todos");
  const [dataInicio, setDataInicio] = useState<Date>(subDays(new Date(), 30));
  const [dataFim, setDataFim] = useState<Date>(new Date());

  const { data: conciliacoes, isLoading } = useConciliacaoHistory({
    dataInicio,
    dataFim,
  });

  const handlePeriodoChange = (periodo: PeriodoFiltro) => {
    setPeriodoFiltro(periodo);
    const hoje = new Date();
    
    switch (periodo) {
      case "7dias":
        setDataInicio(subDays(hoje, 7));
        setDataFim(hoje);
        break;
      case "30dias":
        setDataInicio(subDays(hoje, 30));
        setDataFim(hoje);
        break;
      case "esteMes":
        setDataInicio(startOfMonth(hoje));
        setDataFim(endOfMonth(hoje));
        break;
      case "mesAnterior":
        const mesAnterior = subDays(startOfMonth(hoje), 1);
        setDataInicio(startOfMonth(mesAnterior));
        setDataFim(endOfMonth(mesAnterior));
        break;
    }
  };

  // Filter conciliacoes
  const filteredConciliacoes = (conciliacoes || []).filter((c) => {
    // Status filter
    if (statusFiltro !== "todos") {
      const isDivergente = Number(c.diferenca || 0) !== 0;
      const status = isDivergente ? "divergente" : "conciliado";
      if (status !== statusFiltro) return false;
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchExtrato = c.extrato_item?.descricao?.toLowerCase().includes(term);
      const matchLancamento = c.lancamento?.descricao?.toLowerCase().includes(term);
      const matchCategoria = c.lancamento?.categoria?.toLowerCase().includes(term);
      if (!matchExtrato && !matchLancamento && !matchCategoria) return false;
    }

    return true;
  });

  const periodoLabels: Record<PeriodoFiltro, string> = {
    "7dias": "Últimos 7 dias",
    "30dias": "Últimos 30 dias",
    "esteMes": "Este mês",
    "mesAnterior": "Mês anterior",
    "customizado": "Personalizado",
  };

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Period Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Calendar className="w-4 h-4 mr-2" />
              {periodoLabels[periodoFiltro]}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Período</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handlePeriodoChange("7dias")}>
              Últimos 7 dias
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePeriodoChange("30dias")}>
              Últimos 30 dias
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePeriodoChange("esteMes")}>
              Este mês
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePeriodoChange("mesAnterior")}>
              Mês anterior
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              {statusFiltro === "todos" ? "Todos" : statusFiltro === "conciliado" ? "Conciliados" : "Divergentes"}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setStatusFiltro("todos")}>
              Todos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFiltro("conciliado")}>
              Conciliados
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFiltro("divergente")}>
              Divergentes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filteredConciliacoes.length} registro(s) encontrado(s)</span>
        <span>
          {format(dataInicio, "dd/MM/yyyy")} - {format(dataFim, "dd/MM/yyyy")}
        </span>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredConciliacoes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Nenhuma conciliação encontrada.</p>
          <p className="text-xs mt-1">Ajuste os filtros para ver mais resultados.</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {filteredConciliacoes.map((c) => {
              const isDivergente = Number(c.diferenca || 0) !== 0;
              
              return (
                <div
                  key={c.id}
                  className={cn(
                    "p-4 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer",
                    isDivergente ? "border-l-4 border-l-destructive" : "border-l-4 border-l-success"
                  )}
                  onClick={() => onViewDetails?.(c)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            isDivergente
                              ? "bg-destructive/10 text-destructive"
                              : "bg-success/10 text-success"
                          )}
                        >
                          {isDivergente ? "Divergente" : "Conciliado"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(c.conciliado_em), "dd/MM/yyyy HH:mm")}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Extrato</p>
                          <p className="truncate">{c.extrato_item?.descricao || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Lançamento</p>
                          <p className="truncate">{c.lancamento?.descricao || "-"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-medium">
                        {formatCurrency(Number(c.extrato_item?.valor || 0))}
                      </p>
                      {isDivergente && (
                        <p className="text-xs text-destructive">
                          Dif: {formatCurrency(Number(c.diferenca || 0))}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
