import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X, Filter, Search } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";
import type { StatusExtrato } from "@/hooks/useFiltrosExtratos";

interface ContaBancaria {
  id: string;
  banco: string;
  conta: string;
}

interface FiltrosExtratosProps {
  contas: ContaBancaria[];
  contaId: string | null;
  periodo: DateRange | undefined;
  status: StatusExtrato;
  busca: string;
  temFiltrosAtivos: boolean;
  onContaChange: (contaId: string | null) => void;
  onPeriodoChange: (periodo: DateRange | undefined) => void;
  onStatusChange: (status: StatusExtrato) => void;
  onBuscaChange: (busca: string) => void;
  onLimparFiltros: () => void;
}

const statusOptions: { value: StatusExtrato; label: string }[] = [
  { value: "todos", label: "Todos os Status" },
  { value: "processado", label: "Em Processamento" },
  { value: "conciliado", label: "Conciliado" },
  { value: "erro", label: "Com Erros" },
];

export function FiltrosExtratos({
  contas,
  contaId,
  periodo,
  status,
  busca,
  temFiltrosAtivos,
  onContaChange,
  onPeriodoChange,
  onStatusChange,
  onBuscaChange,
  onLimparFiltros,
}: FiltrosExtratosProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const formatPeriodo = () => {
    if (!periodo?.from) return "Período";
    if (!periodo.to) return format(periodo.from, "dd/MM/yyyy");
    return `${format(periodo.from, "dd/MM")} - ${format(periodo.to, "dd/MM/yyyy")}`;
  };

  const contaSelecionada = contas.find((c) => c.id === contaId);

  const filtrosCount = [
    contaId !== null,
    periodo !== undefined,
    status !== "todos",
    busca.trim() !== "",
  ].filter(Boolean).length;

  const FiltersContent = () => (
    <div className="flex flex-col gap-3">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por arquivo ou banco..."
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Filtro por Conta */}
        <Select
          value={contaId || "todas"}
          onValueChange={(value) => onContaChange(value === "todas" ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Conta Bancária">
              {contaSelecionada
                ? `${contaSelecionada.banco} - ${contaSelecionada.conta}`
                : "Todas as Contas"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as Contas</SelectItem>
            {contas.map((conta) => (
              <SelectItem key={conta.id} value={conta.id}>
                {conta.banco} - {conta.conta}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por Status */}
        <Select
          value={status}
          onValueChange={(value) => onStatusChange(value as StatusExtrato)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por Período */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal w-full",
                !periodo && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatPeriodo()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={periodo?.from}
              selected={periodo}
              onSelect={onPeriodoChange}
              numberOfMonths={isMobile ? 1 : 2}
              locale={ptBR}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Botão Limpar */}
      {temFiltrosAtivos && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onLimparFiltros}>
            <X className="w-4 h-4 mr-1" />
            Limpar Filtros
          </Button>
        </div>
      )}
    </div>
  );

  // Mobile: Collapsible
  if (isMobile) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-2">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {filtrosCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filtrosCount}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="mt-3">
          <Card>
            <CardContent className="p-4">
              <FiltersContent />
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Desktop: Inline
  return (
    <Card>
      <CardContent className="p-4">
        <FiltersContent />
      </CardContent>
    </Card>
  );
}
