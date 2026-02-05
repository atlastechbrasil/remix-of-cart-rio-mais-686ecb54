import { TrendingUp, TrendingDown, DollarSign, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ResumoFinanceiro, DadosConciliacao } from "@/types/relatorios";

interface IndicadoresResumoProps {
  resumo?: ResumoFinanceiro;
  conciliacao?: DadosConciliacao;
  isLoading?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function IndicadoresResumo({ resumo, conciliacao, isLoading }: IndicadoresResumoProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const indicadores = [
    {
      titulo: "Total Receitas",
      valor: formatCurrency(resumo?.totalReceitas || 0),
      icone: TrendingUp,
      cor: "text-green-500",
      bg: "bg-green-500/10",
      subvalor: `${resumo?.quantidadeReceitas || 0} lançamentos`,
    },
    {
      titulo: "Total Despesas",
      valor: formatCurrency(resumo?.totalDespesas || 0),
      icone: TrendingDown,
      cor: "text-red-500",
      bg: "bg-red-500/10",
      subvalor: `${resumo?.quantidadeDespesas || 0} lançamentos`,
    },
    {
      titulo: "Saldo",
      valor: formatCurrency(resumo?.saldo || 0),
      icone: DollarSign,
      cor: (resumo?.saldo || 0) >= 0 ? "text-blue-500" : "text-red-500",
      bg: (resumo?.saldo || 0) >= 0 ? "bg-blue-500/10" : "bg-red-500/10",
      subvalor: `${resumo?.quantidadeLancamentos || 0} total`,
    },
    {
      titulo: "Conciliado",
      valor: `${(conciliacao?.percentualConciliado || 0).toFixed(1)}%`,
      icone: conciliacao && conciliacao.percentualConciliado >= 80 ? CheckCircle : AlertCircle,
      cor: conciliacao && conciliacao.percentualConciliado >= 80 ? "text-green-500" : "text-amber-500",
      bg: conciliacao && conciliacao.percentualConciliado >= 80 ? "bg-green-500/10" : "bg-amber-500/10",
      subvalor: `${conciliacao?.conciliados || 0} de ${conciliacao?.totalItens || 0}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {indicadores.map((ind) => (
        <Card key={ind.titulo} className="overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                {ind.titulo}
              </span>
              <div className={cn("p-1.5 sm:p-2 rounded-lg", ind.bg)}>
                <ind.icone className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", ind.cor)} />
              </div>
            </div>
            <p className={cn("text-lg sm:text-2xl font-bold", ind.cor)}>{ind.valor}</p>
            <p className="text-xs text-muted-foreground mt-1">{ind.subvalor}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
