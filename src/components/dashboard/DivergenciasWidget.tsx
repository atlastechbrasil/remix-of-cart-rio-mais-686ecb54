import { AlertTriangle, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const divergencias = [
  {
    id: 1,
    descricao: "Energia Elétrica - Janeiro",
    valorExtrato: 890,
    valorSistema: 920,
    diferenca: -30,
    data: "28/01/2024",
    conta: "Banco do Brasil",
    tipo: "valor",
  },
  {
    id: 2,
    descricao: "Depósito não identificado",
    valorExtrato: 1250,
    valorSistema: null,
    diferenca: 1250,
    data: "26/01/2024",
    conta: "Itaú",
    tipo: "ausente_sistema",
  },
  {
    id: 3,
    descricao: "Taxa bancária duplicada",
    valorExtrato: 45,
    valorSistema: 22.5,
    diferenca: -22.5,
    data: "25/01/2024",
    conta: "Banco do Brasil",
    tipo: "valor",
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Math.abs(value));
};

export function DivergenciasWidget() {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          Divergências Recentes
        </CardTitle>
        <a
          href="/conciliacao"
          className="text-sm text-primary hover:underline font-medium"
        >
          Ver todas
        </a>
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
                <Button variant="ghost" size="sm" className="h-7">
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
