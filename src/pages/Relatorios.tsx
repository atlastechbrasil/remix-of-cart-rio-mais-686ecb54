import { useState, useMemo } from "react";
import {
  TrendingUp,
  Users,
  PieChart,
  BarChart3,
  FileText,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FiltrosRelatorio } from "@/components/relatorios/FiltrosRelatorio";
import { IndicadoresResumo } from "@/components/relatorios/IndicadoresResumo";
import { ReceitasPorCategoriaChart } from "@/components/relatorios/ReceitasPorCategoriaChart";
import { EvolucaoMensalChart } from "@/components/relatorios/EvolucaoMensalChart";
import { ProdutividadeChart } from "@/components/relatorios/ProdutividadeChart";
import { RelatorioCard } from "@/components/relatorios/RelatorioCard";
import { ExportButtons } from "@/components/relatorios/ExportButtons";
import { TabelaLancamentos } from "@/components/relatorios/TabelaLancamentos";
import {
  useResumoFinanceiro,
  useDadosPorCategoria,
  useEvolucaoMensal,
  useProdutividade,
  useDadosConciliacao,
  useLancamentosRelatorio,
} from "@/hooks/useRelatorios";
import type { FiltrosRelatorio as FiltrosRelatorioType } from "@/types/relatorios";

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
    descricao: "Análise de lançamentos por responsável e período",
    icon: Users,
    tipo: "operacional",
  },
  {
    id: "receitas-por-categoria",
    titulo: "Receitas por Categoria",
    descricao: "Detalhamento das receitas agrupadas por categoria",
    icon: PieChart,
    tipo: "financeiro",
  },
  {
    id: "despesas-por-categoria",
    titulo: "Despesas por Categoria",
    descricao: "Detalhamento das despesas agrupadas por categoria",
    icon: BarChart3,
    tipo: "financeiro",
  },
  {
    id: "conciliacao",
    titulo: "Relatório de Conciliação",
    descricao: "Status de conciliação e divergências encontradas",
    icon: CheckCircle,
    tipo: "operacional",
  },
  {
    id: "lancamentos",
    titulo: "Lista de Lançamentos",
    descricao: "Lista completa de lançamentos do período selecionado",
    icon: FileText,
    tipo: "operacional",
  },
  {
    id: "comparativo",
    titulo: "Comparativo Mensal",
    descricao: "Análise comparativa de evolução ao longo dos meses",
    icon: Calendar,
    tipo: "gerencial",
  },
];

export default function Relatorios() {
  const hoje = new Date();
  const [filtros, setFiltros] = useState<FiltrosRelatorioType>({
    dataInicio: startOfMonth(hoje),
    dataFim: endOfMonth(hoje),
    tipoLancamento: "todos",
    statusConciliacao: "todos",
    categoria: null,
    responsavel: null,
  });

  const [activeTab, setActiveTab] = useState("visao-geral");

  // Queries
  const { data: resumo, isLoading: isLoadingResumo } = useResumoFinanceiro(filtros);
  const { data: receitasPorCategoria, isLoading: isLoadingReceitas } = useDadosPorCategoria(filtros, "receita");
  const { data: despesasPorCategoria, isLoading: isLoadingDespesas } = useDadosPorCategoria(filtros, "despesa");
  const { data: evolucaoMensal, isLoading: isLoadingEvolucao } = useEvolucaoMensal(filtros);
  const { data: produtividade, isLoading: isLoadingProdutividade } = useProdutividade(filtros);
  const { data: conciliacao, isLoading: isLoadingConciliacao } = useDadosConciliacao(filtros);
  const { data: lancamentos, isLoading: isLoadingLancamentos } = useLancamentosRelatorio(filtros);

  const periodoTexto = useMemo(() => {
    if (filtros.dataInicio && filtros.dataFim) {
      return `${format(filtros.dataInicio, "dd/MM/yyyy", { locale: ptBR })} a ${format(filtros.dataFim, "dd/MM/yyyy", { locale: ptBR })}`;
    }
    return "Período não definido";
  }, [filtros.dataInicio, filtros.dataFim]);

  const handleGerarRelatorio = (id: string) => {
    switch (id) {
      case "financeiro-mensal":
      case "lancamentos":
        setActiveTab("lancamentos");
        break;
      case "produtividade":
        setActiveTab("produtividade");
        break;
      case "receitas-por-categoria":
      case "despesas-por-categoria":
        setActiveTab("categorias");
        break;
      case "comparativo":
        setActiveTab("evolucao");
        break;
      case "conciliacao":
        setActiveTab("visao-geral");
        break;
      default:
        setActiveTab("visao-geral");
    }
  };

  return (
    <MainLayout>
      <PageHeader title="Relatórios" description="Análises e relatórios gerenciais">
        <div className="flex items-center gap-2">
          <FiltrosRelatorio filtros={filtros} onFiltrosChange={setFiltros} />
          <ExportButtons
            titulo="Relatório Financeiro"
            periodo={periodoTexto}
            resumo={resumo}
            receitasPorCategoria={receitasPorCategoria}
            despesasPorCategoria={despesasPorCategoria}
            produtividade={produtividade}
            conciliacao={conciliacao}
            lancamentos={lancamentos}
            disabled={isLoadingResumo}
          />
        </div>
      </PageHeader>

      <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Período selecionado */}
        <div className="text-sm text-muted-foreground">
          Período: <span className="font-medium text-foreground">{periodoTexto}</span>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Scrollable tabs for mobile */}
          <ScrollArea className="w-full">
            <TabsList className="w-full sm:w-auto inline-flex">
              <TabsTrigger value="visao-geral" className="flex-1 sm:flex-none text-xs sm:text-sm">
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="categorias" className="flex-1 sm:flex-none text-xs sm:text-sm">
                Por Categoria
              </TabsTrigger>
              <TabsTrigger value="evolucao" className="flex-1 sm:flex-none text-xs sm:text-sm">
                Evolução
              </TabsTrigger>
              <TabsTrigger value="produtividade" className="flex-1 sm:flex-none text-xs sm:text-sm">
                Produtividade
              </TabsTrigger>
              <TabsTrigger value="lancamentos" className="flex-1 sm:flex-none text-xs sm:text-sm">
                Lançamentos
              </TabsTrigger>
              <TabsTrigger value="gerar" className="flex-1 sm:flex-none text-xs sm:text-sm">
                Gerar Relatório
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" className="sm:hidden" />
          </ScrollArea>

          {/* Tab: Visão Geral */}
          <TabsContent value="visao-geral" className="space-y-4 sm:space-y-6">
            <IndicadoresResumo
              resumo={resumo}
              conciliacao={conciliacao}
              isLoading={isLoadingResumo || isLoadingConciliacao}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <ReceitasPorCategoriaChart
                data={receitasPorCategoria || []}
                isLoading={isLoadingReceitas}
                titulo="Receitas por Categoria"
                tipo="receita"
              />
              <ReceitasPorCategoriaChart
                data={despesasPorCategoria || []}
                isLoading={isLoadingDespesas}
                titulo="Despesas por Categoria"
                tipo="despesa"
              />
            </div>

            <EvolucaoMensalChart data={evolucaoMensal || []} isLoading={isLoadingEvolucao} />
          </TabsContent>

          {/* Tab: Por Categoria */}
          <TabsContent value="categorias" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <ReceitasPorCategoriaChart
                data={receitasPorCategoria || []}
                isLoading={isLoadingReceitas}
                titulo="Receitas por Categoria"
                tipo="receita"
              />
              <ReceitasPorCategoriaChart
                data={despesasPorCategoria || []}
                isLoading={isLoadingDespesas}
                titulo="Despesas por Categoria"
                tipo="despesa"
              />
            </div>

            {/* Detalhamento em cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DetailCard
                titulo="Detalhamento de Receitas"
                dados={receitasPorCategoria || []}
                isLoading={isLoadingReceitas}
                tipo="receita"
              />
              <DetailCard
                titulo="Detalhamento de Despesas"
                dados={despesasPorCategoria || []}
                isLoading={isLoadingDespesas}
                tipo="despesa"
              />
            </div>
          </TabsContent>

          {/* Tab: Evolução */}
          <TabsContent value="evolucao" className="space-y-4 sm:space-y-6">
            <EvolucaoMensalChart data={evolucaoMensal || []} isLoading={isLoadingEvolucao} />
          </TabsContent>

          {/* Tab: Produtividade */}
          <TabsContent value="produtividade" className="space-y-4 sm:space-y-6">
            <ProdutividadeChart data={produtividade || []} isLoading={isLoadingProdutividade} />
          </TabsContent>

          {/* Tab: Lançamentos */}
          <TabsContent value="lancamentos" className="space-y-4 sm:space-y-6">
            <TabelaLancamentos lancamentos={lancamentos || []} isLoading={isLoadingLancamentos} maxRows={100} />
          </TabsContent>

          {/* Tab: Gerar Relatório */}
          <TabsContent value="gerar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {relatoriosDisponiveis.map((relatorio) => (
                <div key={relatorio.id}>
                  <RelatorioCard
                    titulo={relatorio.titulo}
                    descricao={relatorio.descricao}
                    tipo={relatorio.tipo}
                    icon={relatorio.icon}
                    onGerar={() => handleGerarRelatorio(relatorio.id)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

// Componente auxiliar para detalhamento
function DetailCard({
  titulo,
  dados,
  isLoading,
  tipo,
}: {
  titulo: string;
  dados: { categoria: string; valor: number; quantidade: number; porcentagem: number }[];
  isLoading: boolean;
  tipo: "receita" | "despesa";
}) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const corClasse = tipo === "receita" ? "text-primary" : "text-destructive";

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4">
        <div className="h-40 flex items-center justify-center">
          <span className="text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!dados || dados.length === 0) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-4">{titulo}</h3>
        <div className="h-32 flex items-center justify-center text-muted-foreground">
          Nenhum dado disponível
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium mb-4">{titulo}</h3>
      <div className="space-y-3">
        {dados.map((item) => (
          <div key={item.categoria} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate max-w-[150px]">{item.categoria}</span>
              <span className="text-xs text-muted-foreground">({item.quantidade})</span>
            </div>
            <div className="text-right">
              <p className={`font-bold text-sm ${corClasse}`}>{formatCurrency(item.valor)}</p>
              <p className="text-xs text-muted-foreground">{item.porcentagem.toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
