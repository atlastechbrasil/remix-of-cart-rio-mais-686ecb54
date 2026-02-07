import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  FileCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ConciliacaoStats } from "@/types/conciliacao";

interface ResumoDiaConciliacaoProps {
  data: Date;
  stats: ConciliacaoStats;
  onFechamento?: () => void;
  isFechado?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export function ResumoDiaConciliacao({
  data,
  stats,
  onFechamento,
  isFechado = false,
}: ResumoDiaConciliacaoProps) {
  const getDateLabel = () => {
    if (isToday(data)) return "Hoje";
    if (isYesterday(data)) return "Ontem";
    return format(data, "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

  const totalItens = stats.conciliados + stats.pendentes + stats.divergentes;
  const progressValue = totalItens > 0 ? (stats.conciliados / totalItens) * 100 : 0;
  const isComplete = stats.pendentes === 0 && stats.divergentes === 0;
  const hasIssues = stats.divergentes > 0;

  return (
    <Card className={cn(
      "border-2 overflow-hidden",
      isComplete && "border-success/50 bg-success/5",
      hasIssues && !isComplete && "border-warning/50 bg-warning/5",
      isFechado && "border-primary/50 bg-primary/5"
    )}>
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
            <CardTitle className="text-sm sm:text-base font-medium capitalize truncate">
              {getDateLabel()}
            </CardTitle>
          </div>
          {isFechado ? (
            <Badge className="bg-primary/10 text-primary border-primary/30 shrink-0 text-[10px] sm:text-xs">
              <FileCheck className="w-3 h-3 mr-1" />
              Fechado
            </Badge>
          ) : isComplete ? (
            <Badge className="bg-success/10 text-success border-success/30 shrink-0 text-[10px] sm:text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completo
            </Badge>
          ) : hasIssues ? (
            <Badge className="bg-warning/10 text-warning border-warning/30 shrink-0 text-[10px] sm:text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Pendências
            </Badge>
          ) : (
            <Badge variant="secondary" className="shrink-0 text-[10px] sm:text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Em andamento
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
        {/* Progress Bar */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
            <span className="text-muted-foreground truncate">Progresso</span>
            <span className="font-medium shrink-0">{Math.round(progressValue)}%</span>
          </div>
          <Progress 
            value={progressValue} 
            className={cn(
              "h-2",
              isComplete && "[&>div]:bg-success",
              hasIssues && !isComplete && "[&>div]:bg-warning"
            )}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <div className="text-center p-1.5 sm:p-2 rounded-lg bg-success/10 overflow-hidden">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success mx-auto mb-0.5" />
            <p className="text-sm sm:text-lg font-bold text-success">{stats.conciliados}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight">Concil.</p>
          </div>
          <div className="text-center p-1.5 sm:p-2 rounded-lg bg-warning/10 overflow-hidden">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warning mx-auto mb-0.5" />
            <p className="text-sm sm:text-lg font-bold text-warning">{stats.pendentes}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight">Pend.</p>
          </div>
          <div className="text-center p-1.5 sm:p-2 rounded-lg bg-destructive/10 overflow-hidden">
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive mx-auto mb-0.5" />
            <p className="text-sm sm:text-lg font-bold text-destructive">{stats.divergentes}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight">Diverg.</p>
          </div>
        </div>

        {/* Values Summary */}
        <div className="space-y-1.5 sm:space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between gap-1 text-[10px] sm:text-xs">
            <span className="text-muted-foreground">Extrato:</span>
            <span className="font-medium text-right">{formatCurrency(stats.valorTotalExtrato)}</span>
          </div>
          <div className="flex items-center justify-between gap-1 text-[10px] sm:text-xs">
            <span className="text-muted-foreground">Lançam.:</span>
            <span className="font-medium text-right">{formatCurrency(stats.valorTotalLancamentos)}</span>
          </div>
          {stats.diferencaValores !== 0 && (
            <div className="flex items-center justify-between gap-1 text-[10px] sm:text-xs">
              <span className="text-muted-foreground">Diferença:</span>
              <span className={cn(
                "font-medium text-right",
                stats.diferencaValores > 0 ? "text-success" : "text-destructive"
              )}>
                {stats.diferencaValores > 0 ? "+" : ""}{formatCurrency(stats.diferencaValores)}
              </span>
            </div>
          )}
        </div>

        {/* Fechamento Button */}
        {onFechamento && !isFechado && (
          <Button 
            onClick={onFechamento} 
            className="w-full"
            variant={isComplete ? "default" : "outline"}
            disabled={stats.pendentes > 0}
          >
            <FileCheck className="w-4 h-4 mr-2" />
            {isComplete ? "Confirmar Fechamento do Dia" : "Fechar Dia"}
          </Button>
        )}

        {stats.pendentes > 0 && !isFechado && (
          <p className="text-xs text-center text-muted-foreground">
            Concilie todos os itens pendentes para fechar o dia
          </p>
        )}
      </CardContent>
    </Card>
  );
}
