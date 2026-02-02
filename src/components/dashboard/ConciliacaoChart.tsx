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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useConciliacaoSemanal } from "@/hooks/useDashboardStats";

export function ConciliacaoChart() {
  const { data, isLoading } = useConciliacaoSemanal();

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Status de Conciliação por Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data || [];
  const hasData = chartData.some(d => d.conciliados > 0 || d.pendentes > 0 || d.divergentes > 0);

  if (!hasData) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Status de Conciliação por Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex flex-col items-center justify-center text-muted-foreground">
            <p className="text-sm">Nenhum dado de conciliação disponível</p>
            <p className="text-xs mt-1">Os dados aparecerão conforme lançamentos forem criados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Status de Conciliação por Semana
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="semana"
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                dataKey="conciliados"
                name="Conciliados"
                fill="hsl(var(--success))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="pendentes"
                name="Pendentes"
                fill="hsl(var(--warning))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="divergentes"
                name="Divergentes"
                fill="hsl(var(--destructive))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
