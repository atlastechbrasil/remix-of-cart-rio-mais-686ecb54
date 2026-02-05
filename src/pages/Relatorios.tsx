import { useState } from "react";
import {
  Download,
  FileText,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Printer,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

const relatoriosDisponiveis = [
  {
    id: "financeiro-mensal",
    titulo: "Relatório Financeiro Mensal",
    descricao: "Resumo completo de receitas, despesas e saldo do período",
    icon: TrendingUp,
    tipo: "financeiro",
  },
  {
    id: "produtividade",
    titulo: "Relatório de Produtividade",
    descricao: "Análise de atos realizados por colaborador e período",
    icon: Users,
    tipo: "operacional",
  },
  {
    id: "receitas-por-ato",
    titulo: "Receitas por Tipo de Ato",
    descricao: "Detalhamento das receitas agrupadas por tipo de ato",
    icon: PieChart,
    tipo: "financeiro",
  },
  {
    id: "repasses-periodo",
    titulo: "Repasses do Período",
    descricao: "Valores repassados a entidades e órgãos reguladores",
    icon: BarChart3,
    tipo: "financeiro",
  },
  {
    id: "atos-periodo",
    titulo: "Atos do Período",
    descricao: "Lista completa de atos realizados no período selecionado",
    icon: FileText,
    tipo: "operacional",
  },
  {
    id: "comparativo",
    titulo: "Comparativo Mensal",
    descricao: "Análise comparativa entre períodos",
    icon: Calendar,
    tipo: "gerencial",
  },
];

const receitasPorAto = [
  { nome: "Escritura", valor: 85000, porcentagem: 45.8 },
  { nome: "Procuração", valor: 45000, porcentagem: 24.3 },
  { nome: "Testamento", valor: 22500, porcentagem: 12.1 },
  { nome: "Inventário", valor: 18000, porcentagem: 9.7 },
  { nome: "Outros", valor: 15000, porcentagem: 8.1 },
];

const produtividadeMensal = [
  { colaborador: "Dr. Carlos", atos: 145, receita: 42500 },
  { colaborador: "Dra. Ana", atos: 132, receita: 38000 },
  { colaborador: "Dra. Lucia", atos: 128, receita: 35500 },
  { colaborador: "Pedro Lima", atos: 98, receita: 28000 },
  { colaborador: "Paula Santos", atos: 245, receita: 12000 },
];

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function Relatorios() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const isMobile = useIsMobile();

  return (
    <MainLayout>
      <PageHeader title="Relatórios" description="Análises e relatórios gerenciais">
        <Select defaultValue="janeiro">
          <SelectTrigger className="w-32 sm:w-40">
            <Calendar className="w-4 h-4 mr-1 sm:mr-2" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="janeiro">Janeiro 2024</SelectItem>
            <SelectItem value="dezembro">Dezembro 2023</SelectItem>
            <SelectItem value="trimestre">4º Trimestre 2023</SelectItem>
            <SelectItem value="anual">Ano 2023</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
        <Tabs defaultValue="gerar" className="space-y-4 sm:space-y-6">
          {/* Scrollable tabs for mobile */}
          <ScrollArea className="w-full">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="gerar" className="flex-1 sm:flex-none text-xs sm:text-sm">
                Gerar Relatório
              </TabsTrigger>
              <TabsTrigger value="receitas" className="flex-1 sm:flex-none text-xs sm:text-sm">
                Receitas por Ato
              </TabsTrigger>
              <TabsTrigger value="produtividade" className="flex-1 sm:flex-none text-xs sm:text-sm">
                Produtividade
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" className="sm:hidden" />
          </ScrollArea>

          <TabsContent value="gerar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {relatoriosDisponiveis.map((relatorio) => (
                <Card
                  key={relatorio.id}
                  className="cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
                  onClick={() => setSelectedReport(relatorio.id)}
                >
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex items-start justify-between">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary">
                        <relatorio.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 hidden sm:flex">
                          <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-sm sm:text-base mt-2 sm:mt-3">{relatorio.titulo}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">{relatorio.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground capitalize">
                        {relatorio.tipo}
                      </span>
                      <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm">
                        Gerar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="receitas">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Distribuição por Tipo de Ato</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={receitasPorAto}
                          cx="50%"
                          cy="50%"
                          innerRadius={isMobile ? 40 : 60}
                          outerRadius={isMobile ? 70 : 100}
                          paddingAngle={2}
                          dataKey="valor"
                          nameKey="nome"
                          label={isMobile ? false : ({ nome, porcentagem }) => `${nome}: ${porcentagem}%`}
                        >
                          {receitasPorAto.map((_, index) => (
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Detalhamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {receitasPorAto.map((item, index) => (
                      <div key={item.nome} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS[index] }}
                          />
                          <span className="font-medium text-sm sm:text-base">{item.nome}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm sm:text-base">{formatCurrency(item.valor)}</p>
                          <p className="text-xs text-muted-foreground">{item.porcentagem}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="produtividade">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Produtividade por Colaborador</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Quantidade de atos e receita gerada no período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={produtividadeMensal} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                      <XAxis
                        type="number"
                        className="text-xs fill-muted-foreground"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="colaborador"
                        className="text-xs fill-muted-foreground"
                        tickLine={false}
                        axisLine={false}
                        width={isMobile ? 70 : 100}
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          name === "atos" ? value : formatCurrency(value),
                          name === "atos" ? "Atos" : "Receita",
                        ]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="atos" name="Atos" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
