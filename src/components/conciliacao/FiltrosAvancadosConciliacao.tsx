import { useState } from "react";
import {
  Filter,
  X,
  Check,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import type {
  ConciliacaoFiltros,
  StatusConciliacao,
  TipoLancamento,
  TipoTransacao,
} from "@/types/conciliacao";

interface FiltrosAvancadosConciliacaoProps {
  filtros: ConciliacaoFiltros;
  onToggleStatus: (status: StatusConciliacao) => void;
  onToggleTipoLancamento: (tipo: TipoLancamento) => void;
  onToggleTipoTransacao: (tipo: TipoTransacao) => void;
  onSetValorRange: (min?: number, max?: number) => void;
  onLimpar: () => void;
  contadorAtivos: number;
}

export function FiltrosAvancadosConciliacao({
  filtros,
  onToggleStatus,
  onToggleTipoLancamento,
  onToggleTipoTransacao,
  onSetValorRange,
  onLimpar,
  contadorAtivos,
}: FiltrosAvancadosConciliacaoProps) {
  const [valorMinLocal, setValorMinLocal] = useState<string>(
    filtros.valorMinimo?.toString() || ""
  );
  const [valorMaxLocal, setValorMaxLocal] = useState<string>(
    filtros.valorMaximo?.toString() || ""
  );

  const handleValorChange = () => {
    const min = valorMinLocal ? parseFloat(valorMinLocal) : undefined;
    const max = valorMaxLocal ? parseFloat(valorMaxLocal) : undefined;
    onSetValorRange(min, max);
  };

  const handleLimpar = () => {
    setValorMinLocal("");
    setValorMaxLocal("");
    onLimpar();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
          {contadorAtivos > 0 && (
            <Badge
              variant="default"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {contadorAtivos}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros Avançados
          </SheetTitle>
          <SheetDescription>
            Filtre os itens de extrato e lançamentos
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Status de Conciliação
            </Label>
            <div className="flex flex-wrap gap-2">
              <Toggle
                pressed={filtros.status?.includes("pendente")}
                onPressedChange={() => onToggleStatus("pendente")}
                size="sm"
                className="data-[state=on]:bg-warning/20 data-[state=on]:text-warning"
              >
                <Clock className="w-4 h-4 mr-1" />
                Pendente
              </Toggle>
              <Toggle
                pressed={filtros.status?.includes("conciliado")}
                onPressedChange={() => onToggleStatus("conciliado")}
                size="sm"
                className="data-[state=on]:bg-success/20 data-[state=on]:text-success"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Conciliado
              </Toggle>
              <Toggle
                pressed={filtros.status?.includes("divergente")}
                onPressedChange={() => onToggleStatus("divergente")}
                size="sm"
                className="data-[state=on]:bg-destructive/20 data-[state=on]:text-destructive"
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Divergente
              </Toggle>
            </div>
          </div>

          <Separator />

          {/* Tipo Transação (Extrato) */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Tipo de Transação (Extrato)
            </Label>
            <div className="flex flex-wrap gap-2">
              <Toggle
                pressed={filtros.tipoTransacao?.includes("credito")}
                onPressedChange={() => onToggleTipoTransacao("credito")}
                size="sm"
                className="data-[state=on]:bg-success/20 data-[state=on]:text-success"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Crédito
              </Toggle>
              <Toggle
                pressed={filtros.tipoTransacao?.includes("debito")}
                onPressedChange={() => onToggleTipoTransacao("debito")}
                size="sm"
                className="data-[state=on]:bg-destructive/20 data-[state=on]:text-destructive"
              >
                <TrendingDown className="w-4 h-4 mr-1" />
                Débito
              </Toggle>
            </div>
          </div>

          <Separator />

          {/* Tipo Lançamento (Sistema) */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Tipo de Lançamento (Sistema)
            </Label>
            <div className="flex flex-wrap gap-2">
              <Toggle
                pressed={filtros.tipoLancamento?.includes("receita")}
                onPressedChange={() => onToggleTipoLancamento("receita")}
                size="sm"
                className="data-[state=on]:bg-success/20 data-[state=on]:text-success"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Receita
              </Toggle>
              <Toggle
                pressed={filtros.tipoLancamento?.includes("despesa")}
                onPressedChange={() => onToggleTipoLancamento("despesa")}
                size="sm"
                className="data-[state=on]:bg-destructive/20 data-[state=on]:text-destructive"
              >
                <TrendingDown className="w-4 h-4 mr-1" />
                Despesa
              </Toggle>
            </div>
          </div>

          <Separator />

          {/* Valor Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Faixa de Valor (R$)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Mínimo"
                value={valorMinLocal}
                onChange={(e) => setValorMinLocal(e.target.value)}
                onBlur={handleValorChange}
                className="flex-1"
                min={0}
                step={0.01}
              />
              <span className="text-muted-foreground">até</span>
              <Input
                type="number"
                placeholder="Máximo"
                value={valorMaxLocal}
                onChange={(e) => setValorMaxLocal(e.target.value)}
                onBlur={handleValorChange}
                className="flex-1"
                min={0}
                step={0.01}
              />
            </div>
            {(valorMinLocal || valorMaxLocal) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setValorMinLocal("");
                  setValorMaxLocal("");
                  onSetValorRange(undefined, undefined);
                }}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Limpar valores
              </Button>
            )}
          </div>
        </div>

        <SheetFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleLimpar}
            className="w-full sm:w-auto"
            disabled={contadorAtivos === 0}
          >
            <X className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
          <SheetClose asChild>
            <Button className="w-full sm:w-auto">
              <Check className="w-4 h-4 mr-2" />
              Aplicar
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
