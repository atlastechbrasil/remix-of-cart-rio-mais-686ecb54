import {
  Landmark,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ConciliacaoChart } from "@/components/dashboard/ConciliacaoChart";
import { SaldoEvolutionChart } from "@/components/dashboard/SaldoEvolutionChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { DivergenciasWidget } from "@/components/dashboard/DivergenciasWidget";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboardStats } from "@/hooks/useDashboardStats";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const Index = () => {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        description="Visão geral da conciliação bancária"
      >
        <div className="flex items-center gap-2">
          <Select defaultValue="atual">
            <SelectTrigger className="w-36">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="atual">Mês Atual</SelectItem>
              <SelectItem value="anterior">Mês Anterior</SelectItem>
              <SelectItem value="trimestre">Último Trimestre</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            Exportar
          </Button>
        </div>
      </PageHeader>

      <div className="flex-1 p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Saldo Bancário Total"
            value={formatCurrency(stats?.saldoTotal || 0)}
            icon={Landmark}
            variant="primary"
            trend={stats?.trendSaldo ? { value: stats.trendSaldo, isPositive: stats.trendSaldo > 0 } : undefined}
            isLoading={isLoading}
          />
          <StatCard
            title="Lançamentos Conciliados"
            value={String(stats?.totalConciliados || 0)}
            icon={CheckCircle2}
            variant="success"
            trend={stats?.trendConciliados ? { value: stats.trendConciliados, isPositive: stats.trendConciliados > 0 } : undefined}
            isLoading={isLoading}
          />
          <StatCard
            title="Pendentes de Conciliação"
            value={String(stats?.totalPendentes || 0)}
            icon={Clock}
            variant="warning"
            trend={stats?.trendPendentes ? { value: Math.abs(stats.trendPendentes), isPositive: stats.trendPendentes < 0 } : undefined}
            isLoading={isLoading}
          />
          <StatCard
            title="Divergências Identificadas"
            value={String(stats?.totalDivergentes || 0)}
            icon={AlertTriangle}
            variant="destructive"
            trend={stats?.trendDivergentes ? { value: Math.abs(stats.trendDivergentes), isPositive: stats.trendDivergentes < 0 } : undefined}
            isLoading={isLoading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SaldoEvolutionChart />
          <ConciliacaoChart />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentTransactions />
          </div>
          <DivergenciasWidget />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
