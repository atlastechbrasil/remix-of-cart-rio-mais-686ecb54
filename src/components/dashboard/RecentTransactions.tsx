import { ArrowUpRight, ArrowDownLeft, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const transactions = [
  {
    id: 1,
    description: "Registro de Imóvel - Matrícula 45.678",
    type: "receita",
    value: 2450,
    date: "Hoje, 14:30",
    status: "conciliado",
  },
  {
    id: 2,
    description: "Pagamento Fornecedor",
    type: "despesa",
    value: 1200,
    date: "Hoje, 11:45",
    status: "conciliado",
  },
  {
    id: 3,
    description: "Averbação - Matrícula 12.345",
    type: "receita",
    value: 185,
    date: "Hoje, 10:20",
    status: "pendente",
  },
  {
    id: 4,
    description: "Certidão de Matrícula",
    type: "receita",
    value: 85,
    date: "Ontem, 16:50",
    status: "conciliado",
  },
  {
    id: 5,
    description: "Energia Elétrica",
    type: "despesa",
    value: 890,
    date: "Ontem, 09:00",
    status: "divergente",
  },
];

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
  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          Transações Recentes
        </CardTitle>
        <a
          href="/lancamentos"
          className="text-sm text-primary hover:underline font-medium"
        >
          Ver todas
        </a>
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
                    transaction.type === "receita"
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {transaction.type === "receita" ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      transaction.type === "receita"
                        ? "text-success"
                        : "text-destructive"
                    )}
                  >
                    {transaction.type === "receita" ? "+" : "-"}
                    {formatCurrency(transaction.value)}
                  </p>
                </div>
                {statusIcons[transaction.status as keyof typeof statusIcons]}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
