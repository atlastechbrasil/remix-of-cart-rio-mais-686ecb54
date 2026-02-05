import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import type { DadosPorCategoria } from "@/types/relatorios";

interface ReceitasPorCategoriaChartProps {
  data: DadosPorCategoria[];
  isLoading?: boolean;
  titulo?: string;
  tipo?: "receita" | "despesa";
}

const COLORS_RECEITAS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const COLORS_DESPESAS = [
  "hsl(0 84% 60%)",
  "hsl(15 90% 55%)",
  "hsl(30 95% 50%)",
  "hsl(45 95% 55%)",
  "hsl(60 85% 50%)",
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
};

export function ReceitasPorCategoriaChart({
  data,
  isLoading,
  titulo = "Receitas por Categoria",
  tipo = "receita",
}: ReceitasPorCategoriaChartProps) {
  const isMobile = useIsMobile();
  const COLORS = tipo === "receita" ? COLORS_RECEITAS : COLORS_DESPESAS;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
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
          <CardTitle className="text-base sm:text-lg">{titulo}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível para o período selecionado
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 40 : 60}
                outerRadius={isMobile ? 70 : 100}
                paddingAngle={2}
                dataKey="valor"
                nameKey="categoria"
                label={
                  isMobile
                    ? false
                    : ({ categoria, porcentagem }) => `${categoria}: ${porcentagem.toFixed(1)}%`
                }
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Detalhamento para mobile */}
        <div className="mt-4 space-y-2 sm:hidden">
          {data.slice(0, 5).map((item, index) => (
            <div key={item.categoria} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="truncate max-w-[120px]">{item.categoria}</span>
              </div>
              <div className="text-right">
                <span className="font-medium">{formatCurrency(item.valor)}</span>
                <span className="text-muted-foreground ml-2">({item.porcentagem.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
