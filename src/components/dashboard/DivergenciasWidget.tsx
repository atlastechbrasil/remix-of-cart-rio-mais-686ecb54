import { AlertTriangle, ArrowRight, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDivergencias } from "@/hooks/useDashboardStats";
import { Link, useNavigate } from "react-router-dom";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Math.abs(value));
};

export function DivergenciasWidget() {
  const { data: divergencias, isLoading } = useDivergencias();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Divergências Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg border">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-32 mb-2" />
                <Skeleton className="h-3 w-40" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!divergencias || divergencias.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Divergências
          </CardTitle>
          <Link
            to="/conciliacao"
            className="text-sm text-primary hover:underline font-medium"
          >
            Ver conciliação
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mb-2 text-success opacity-70" />
            <p className="text-sm font-medium text-success">Tudo conciliado!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Nenhuma divergência encontrada
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          Divergências Recentes
        </CardTitle>
        <Link
          to="/conciliacao"
          className="text-sm text-primary hover:underline font-medium"
        >
          Ver todas
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {divergencias.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg border border-destructive/20 bg-destructive/5"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.descricao}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.conta} • {item.data}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7"
                  onClick={() => navigate("/conciliacao")}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Extrato:</span>
                <span className="font-medium">{formatCurrency(item.valorExtrato)}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-muted-foreground">Sistema:</span>
                <span className="font-medium">
                  {item.valorSistema ? formatCurrency(item.valorSistema) : "—"}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className={cn(
                  "text-xs font-medium",
                  item.diferenca > 0 ? "text-success" : "text-destructive"
                )}>
                  Diferença: {item.diferenca > 0 ? "+" : ""}{formatCurrency(item.diferenca)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
