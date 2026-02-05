import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Filter, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCategorias, useResponsaveis, getDateRangeForPeriod } from "@/hooks/useRelatorios";
import type { FiltrosRelatorio, PeriodoRapido } from "@/types/relatorios";

interface FiltrosRelatorioProps {
  filtros: FiltrosRelatorio;
  onFiltrosChange: (filtros: FiltrosRelatorio) => void;
}

const periodosRapidos: { value: PeriodoRapido; label: string }[] = [
  { value: "hoje", label: "Hoje" },
  { value: "esta-semana", label: "Esta semana" },
  { value: "este-mes", label: "Este mês" },
  { value: "ultimo-mes", label: "Último mês" },
  { value: "este-trimestre", label: "Este trimestre" },
  { value: "este-ano", label: "Este ano" },
];

export function FiltrosRelatorio({ filtros, onFiltrosChange }: FiltrosRelatorioProps) {
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data: categorias = [] } = useCategorias();
  const { data: responsaveis = [] } = useResponsaveis();

  const handlePeriodoRapido = (periodo: PeriodoRapido) => {
    const { inicio, fim } = getDateRangeForPeriod(periodo);
    onFiltrosChange({ ...filtros, dataInicio: inicio, dataFim: fim });
  };

  const handleLimpar = () => {
    onFiltrosChange({
      dataInicio: null,
      dataFim: null,
      tipoLancamento: "todos",
      statusConciliacao: "todos",
      categoria: null,
      responsavel: null,
    });
  };

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.dataInicio || filtros.dataFim) count++;
    if (filtros.tipoLancamento !== "todos") count++;
    if (filtros.statusConciliacao !== "todos") count++;
    if (filtros.categoria) count++;
    if (filtros.responsavel) count++;
    return count;
  };

  const filtrosAtivos = contarFiltrosAtivos();

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Período Rápido */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Período Rápido</label>
        <div className="flex flex-wrap gap-2">
          {periodosRapidos.map((periodo) => (
            <Button
              key={periodo.value}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handlePeriodoRapido(periodo.value)}
            >
              {periodo.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Data Início */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Data Início</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !filtros.dataInicio && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filtros.dataInicio ? format(filtros.dataInicio, "PPP", { locale: ptBR }) : "Selecione"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filtros.dataInicio || undefined}
              onSelect={(date) => onFiltrosChange({ ...filtros, dataInicio: date || null })}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Data Fim */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Data Fim</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !filtros.dataFim && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filtros.dataFim ? format(filtros.dataFim, "PPP", { locale: ptBR }) : "Selecione"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filtros.dataFim || undefined}
              onSelect={(date) => onFiltrosChange({ ...filtros, dataFim: date || null })}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Tipo de Lançamento */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo</label>
        <Select
          value={filtros.tipoLancamento}
          onValueChange={(value) =>
            onFiltrosChange({ ...filtros, tipoLancamento: value as FiltrosRelatorio["tipoLancamento"] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo de lançamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="receita">Receitas</SelectItem>
            <SelectItem value="despesa">Despesas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status de Conciliação */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Conciliação</label>
        <Select
          value={filtros.statusConciliacao}
          onValueChange={(value) =>
            onFiltrosChange({ ...filtros, statusConciliacao: value as FiltrosRelatorio["statusConciliacao"] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Status de conciliação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="conciliado">Conciliados</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="divergente">Divergentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categoria */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Categoria</label>
        <Select
          value={filtros.categoria || "todas"}
          onValueChange={(value) =>
            onFiltrosChange({ ...filtros, categoria: value === "todas" ? null : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Responsável */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Responsável</label>
        <Select
          value={filtros.responsavel || "todos"}
          onValueChange={(value) =>
            onFiltrosChange({ ...filtros, responsavel: value === "todos" ? null : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {responsaveis.map((resp) => (
              <SelectItem key={resp} value={resp}>
                {resp}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Limpar Filtros */}
      <Button variant="outline" className="w-full" onClick={handleLimpar}>
        <RotateCcw className="w-4 h-4 mr-2" />
        Limpar Filtros
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {filtrosAtivos > 0 && (
              <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {filtrosAtivos}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtros do Relatório</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
          {filtrosAtivos > 0 && (
            <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
              {filtrosAtivos}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <FilterContent />
      </PopoverContent>
    </Popover>
  );
}
