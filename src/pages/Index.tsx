import {
  Landmark,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRightLeft,
  Calendar,
  TrendingUp,
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

const Index = () => {
  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        description="Visão geral da conciliação bancária"
      >
        <div className="flex items-center gap-2">
          <Select defaultValue="janeiro">
            <SelectTrigger className="w-36">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="janeiro">Janeiro 2024</SelectItem>
              <SelectItem value="fevereiro">Fevereiro 2024</SelectItem>
              <SelectItem value="marco">Março 2024</SelectItem>
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
            value="R$ 260.811,25"
            icon={Landmark}
            variant="primary"
            trend={{ value: 8.5, isPositive: true }}
          />
          <StatCard
            title="Lançamentos Conciliados"
            value="342"
            icon={CheckCircle2}
            variant="success"
            trend={{ value: 12.2, isPositive: true }}
          />
          <StatCard
            title="Pendentes de Conciliação"
            value="16"
            icon={Clock}
            variant="warning"
            trend={{ value: 5.8, isPositive: false }}
          />
          <StatCard
            title="Divergências Identificadas"
            value="3"
            icon={AlertTriangle}
            variant="destructive"
            trend={{ value: 2.1, isPositive: false }}
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
