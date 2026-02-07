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
      "border-2",
      isComplete && "border-success/50 bg-success/5",
      hasIssues && !isComplete && "border-warning/50 bg-warning/5",
      isFechado && "border-primary/50 bg-primary/5"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base font-medium capitalize">
              {getDateLabel()}
            </CardTitle>
          </div>
          {isFechado ? (
            <Badge className="bg-primary/10 text-primary border-primary/30">
              <FileCheck className="w-3 h-3 mr-1" />
              Fechado
            </Badge>
          ) : isComplete ? (
            <Badge className="bg-success/10 text-success border-success/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completo
            </Badge>
          ) : hasIssues ? (
            <Badge className="bg-warning/10 text-warning border-warning/30">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Pendências
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Clock className="w-3 h-3 mr-1" />
              Em andamento
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso da conciliação</span>
            <span className="font-medium">{Math.round(progressValue)}%</span>
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
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-success/10">
            <CheckCircle2 className="w-5 h-5 text-success mx-auto mb-1" />
            <p className="text-2xl font-bold text-success">{stats.conciliados}</p>
            <p className="text-xs text-muted-foreground">Conciliados</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-warning/10">
            <Clock className="w-5 h-5 text-warning mx-auto mb-1" />
            <p className="text-2xl font-bold text-warning">{stats.pendentes}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-destructive/10">
            <AlertTriangle className="w-5 h-5 text-destructive mx-auto mb-1" />
            <p className="text-2xl font-bold text-destructive">{stats.divergentes}</p>
            <p className="text-xs text-muted-foreground">Divergentes</p>
          </div>
        </div>

        {/* Values Summary */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Extrato:</span>
            <span className="font-medium">{formatCurrency(stats.valorTotalExtrato)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Lançamentos:</span>
            <span className="font-medium">{formatCurrency(stats.valorTotalLancamentos)}</span>
          </div>
          {stats.diferencaValores !== 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Diferença:</span>
              <span className={cn(
                "font-medium",
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
