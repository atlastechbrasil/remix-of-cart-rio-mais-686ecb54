import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ProdutividadeResponsavel } from "@/types/relatorios";

interface ProdutividadeChartProps {
  data: ProdutividadeResponsavel[];
  isLoading?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
};

export function ProdutividadeChart({ data, isLoading }: ProdutividadeChartProps) {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Produtividade por Responsável</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível para o período selecionado
          </div>
        </CardContent>
      </Card>
    );
  }

  // Limitar a 10 responsáveis para melhor visualização
  const topData = data.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Produtividade por Responsável</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Quantidade de lançamentos e valores por responsável
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis
                type="number"
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: isMobile ? 9 : 11 }}
              />
              <YAxis
                type="category"
                dataKey="responsavel"
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                width={isMobile ? 80 : 120}
                tick={{ fontSize: isMobile ? 10 : 12 }}
                tickFormatter={(value) => (value.length > 15 ? value.substring(0, 15) + "..." : value)}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === "quantidadeLancamentos" ? value : formatCurrency(value),
                  name === "quantidadeLancamentos" ? "Lançamentos" : "Valor Total",
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend
                formatter={(value) =>
                  value === "quantidadeLancamentos" ? "Lançamentos" : "Valor Total"
                }
              />
              <Bar
                dataKey="quantidadeLancamentos"
                fill="hsl(var(--chart-1))"
                radius={[0, 4, 4, 0]}
                name="quantidadeLancamentos"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lista complementar para mobile */}
        <div className="mt-4 space-y-2 sm:hidden">
          {topData.slice(0, 5).map((item) => (
            <div key={item.responsavel} className="flex items-center justify-between text-sm border-b pb-2">
              <span className="truncate max-w-[140px] font-medium">{item.responsavel}</span>
              <div className="text-right">
                <span className="text-muted-foreground">{item.quantidadeLancamentos} lanç.</span>
                <span className="ml-2 font-medium">{formatCurrency(item.valorTotal)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
