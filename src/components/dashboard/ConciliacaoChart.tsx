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

const data = [
  { semana: "Sem 1", conciliados: 85, pendentes: 8, divergentes: 1 },
  { semana: "Sem 2", conciliados: 92, pendentes: 5, divergentes: 0 },
  { semana: "Sem 3", conciliados: 78, pendentes: 12, divergentes: 2 },
  { semana: "Sem 4", conciliados: 87, pendentes: 6, divergentes: 0 },
];

export function ConciliacaoChart() {
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
            <BarChart data={data}>
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
