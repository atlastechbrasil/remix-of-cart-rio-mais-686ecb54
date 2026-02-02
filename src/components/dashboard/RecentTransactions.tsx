import { ArrowUpRight, ArrowDownLeft, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRecentTransactions } from "@/hooks/useDashboardStats";
import { Link } from "react-router-dom";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const statusIcons = {
  conciliado: <CheckCircle2 className="w-3.5 h-3.5 text-success" />,
  pendente: <Clock className="w-3.5 h-3.5 text-warning" />,
  divergente: <AlertTriangle className="w-3.5 h-3.5 text-destructive" />,
};

export function RecentTransactions() {
  const { data: transactions, isLoading } = useRecentTransactions(5);

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Transações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Transações Recentes
          </CardTitle>
          <Link
            to="/lancamentos"
            className="text-sm text-primary hover:underline font-medium"
          >
            Ver todas
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">Nenhuma transação encontrada</p>
            <Link to="/lancamentos" className="text-primary hover:underline text-sm mt-2">
              Criar lançamento
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          Transações Recentes
        </CardTitle>
        <Link
          to="/lancamentos"
          className="text-sm text-primary hover:underline font-medium"
        >
          Ver todas
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-full",
                    transaction.tipo === "receita"
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {transaction.tipo === "receita" ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {transaction.descricao}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.dataFormatada}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      transaction.tipo === "receita"
                        ? "text-success"
                        : "text-destructive"
                    )}
                  >
                    {transaction.tipo === "receita" ? "+" : "-"}
                    {formatCurrency(transaction.valor)}
                  </p>
                </div>
                {statusIcons[transaction.status]}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
