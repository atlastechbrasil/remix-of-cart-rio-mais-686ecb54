import { useState } from "react";
import { format, subDays, addDays, startOfDay, endOfDay, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PresetPeriodo, FiltroDataProps } from "@/types/conciliacao";

const presetLabels: Record<PresetPeriodo, string> = {
  hoje: "Hoje",
  ontem: "Ontem",
  ultimos7dias: "Últimos 7 dias",
  esteMes: "Este mês",
  mesAnterior: "Mês anterior",
  customizado: "Personalizado",
};

interface FiltroDataConciliacaoProps extends Omit<FiltroDataProps, 'preset' | 'onPresetChange'> {
  preset?: PresetPeriodo;
  onPresetChange?: (preset: PresetPeriodo) => void;
}

export function FiltroDataConciliacao({
  dataSelecionada,
  onDataChange,
  preset = "ontem",
  onPresetChange,
  pendentesCount,
}: FiltroDataConciliacaoProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handlePresetClick = (newPreset: PresetPeriodo) => {
    let newDate: Date;
    
    switch (newPreset) {
      case "hoje":
        newDate = new Date();
        break;
      case "ontem":
        newDate = subDays(new Date(), 1);
        break;
      default:
        newDate = dataSelecionada;
    }
    
    onDataChange(startOfDay(newDate));
    onPresetChange?.(newPreset);
  };

  const handlePreviousDay = () => {
    onDataChange(subDays(dataSelecionada, 1));
    onPresetChange?.("customizado");
  };

  const handleNextDay = () => {
    const nextDay = addDays(dataSelecionada, 1);
    // Don't allow selecting future dates
    if (nextDay <= new Date()) {
      onDataChange(nextDay);
      onPresetChange?.("customizado");
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onDataChange(startOfDay(date));
      onPresetChange?.("customizado");
      setIsCalendarOpen(false);
    }
  };

  const getDateLabel = () => {
    if (isToday(dataSelecionada)) return "Hoje";
    if (isYesterday(dataSelecionada)) return "Ontem";
    return format(dataSelecionada, "dd 'de' MMMM", { locale: ptBR });
  };

  const canGoNext = addDays(dataSelecionada, 1) <= new Date();

  return (
    <div className="flex flex-col gap-3">
      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={preset === "ontem" ? "default" : "outline"}
          size="sm"
          onClick={() => handlePresetClick("ontem")}
          className="text-xs"
        >
          <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
          Ontem
          {preset === "ontem" && pendentesCount !== undefined && pendentesCount > 0 && (
            <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
              {pendentesCount}
            </Badge>
          )}
        </Button>
        <Button
          variant={preset === "hoje" ? "default" : "outline"}
          size="sm"
          onClick={() => handlePresetClick("hoje")}
          className="text-xs"
        >
          Hoje
        </Button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handlePreviousDay}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal min-w-[160px]",
                !dataSelecionada && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span className="flex-1">{getDateLabel()}</span>
              <span className="text-xs text-muted-foreground">
                {format(dataSelecionada, "dd/MM/yyyy")}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={dataSelecionada}
              onSelect={handleCalendarSelect}
              disabled={(date) => date > new Date()}
              initialFocus
              locale={ptBR}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handleNextDay}
          disabled={!canGoNext}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
