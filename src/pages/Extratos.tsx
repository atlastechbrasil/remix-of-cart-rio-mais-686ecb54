import { useMemo } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  Download,
  Loader2,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImportarExtratoDialog } from "@/components/extratos/ImportarExtratoDialog";
import { FiltrosExtratos } from "@/components/extratos/FiltrosExtratos";
import { useExtratos, useContasBancarias } from "@/hooks/useConciliacao";
import { useFiltrosExtratos } from "@/hooks/useFiltrosExtratos";
import { format, parseISO } from "date-fns";
import { ResponsiveTable, type Column } from "@/components/ui/responsive-table";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExtratoItem {
  id: string;
  arquivo: string;
  conta_id: string;
  conta_bancaria: { banco: string; conta: string } | null;
  periodo_inicio: string;
  periodo_fim: string;
  total_lancamentos: number;
  status: string;
  created_at: string;
}

const statusStyles: Record<string, string> = {
  processado: "pendente",
  conciliado: "conciliado",
  erro: "divergente",
};

const statusLabels: Record<string, string> = {
  processado: "Em Processamento",
  conciliado: "Conciliado",
  erro: "Com Erros",
};

export default function Extratos() {
  const { data: extratos, isLoading: loadingExtratos } = useExtratos();
  const { data: contas } = useContasBancarias();
  const isMobile = useIsMobile();

  const {
    filtros,
    setContaId,
    setPeriodo,
    setStatus,
    setBusca,
    limparFiltros,
    temFiltrosAtivos,
    aplicarFiltros,
  } = useFiltrosExtratos();

  const handleImportSuccess = () => {
    // O hook já invalida o cache automaticamente
  };

  // Aplicar filtros aos extratos
  const extratosData = useMemo(() => {
    const data = (extratos || []) as ExtratoItem[];
    return aplicarFiltros(data);
  }, [extratos, aplicarFiltros]);

  // Estatísticas baseadas nos dados filtrados
  const stats = useMemo(() => ({
    total: extratosData.length,
    conciliados: extratosData.filter((e) => e.status === "conciliado").length,
    processando: extratosData.filter((e) => e.status === "processado").length,
    erros: extratosData.filter((e) => e.status === "erro").length,
  }), [extratosData]);

  if (loadingExtratos) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const contasFormatadas = (contas || []).map((c) => ({
    id: c.id,
    banco: c.banco,
    conta: c.conta,
  }));

  const columns: Column<ExtratoItem>[] = [
    {
      key: "arquivo",
      header: "Arquivo",
      render: (item) => (
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="font-medium text-sm truncate">{item.arquivo}</span>
        </div>
      ),
    },
    {
      key: "conta_bancaria",
      header: "Banco / Conta",
      render: (item) => (
        <div>
          <p className="font-medium text-sm">{item.conta_bancaria?.banco || "N/A"}</p>
          <p className="text-xs text-muted-foreground">{item.conta_bancaria?.conta || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "periodo",
      header: "Período",
      hideOnMobile: true,
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {format(parseISO(item.periodo_inicio), "dd/MM/yyyy")} -{" "}
          {format(parseISO(item.periodo_fim), "dd/MM/yyyy")}
        </span>
      ),
    },
    {
      key: "total_lancamentos",
      header: "Lançamentos",
      className: "text-center",
      render: (item) => <span className="font-medium">{item.total_lancamentos}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge variant="outline" className={statusStyles[item.status] || ""}>
          {statusLabels[item.status] || item.status}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Importado em",
      hideOnMobile: true,
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {format(parseISO(item.created_at), "dd/MM/yyyy HH:mm")}
        </span>
      ),
    },
  ];

  const renderActions = (item: ExtratoItem) => (
    <>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Eye className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Download className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
        <Trash2 className="w-4 h-4" />
      </Button>
    </>
  );

  return (
    <MainLayout>
      <PageHeader
        title="Importação de Extratos"
        description="Importe e gerencie extratos bancários OFX e CSV"
      >
        <ImportarExtratoDialog onImportSuccess={handleImportSuccess} />
      </PageHeader>

      <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Filtros Avançados */}
        <FiltrosExtratos
          contas={contasFormatadas}
          contaId={filtros.contaId}
          periodo={filtros.periodo}
          status={filtros.status}
          busca={filtros.busca}
          temFiltrosAtivos={temFiltrosAtivos}
          onContaChange={setContaId}
          onPeriodoChange={setPeriodo}
          onStatusChange={setStatus}
          onBuscaChange={setBusca}
          onLimparFiltros={limparFiltros}
        />

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                  <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Importados</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Conciliados</p>
                  <p className="text-lg sm:text-2xl font-bold text-success">
                    {stats.conciliados}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-warning/10">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Processando</p>
                  <p className="text-lg sm:text-2xl font-bold text-warning">
                    {stats.processando}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-destructive/10">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Com Erros</p>
                  <p className="text-lg sm:text-2xl font-bold text-destructive">
                    {stats.erros}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Importações */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">
                Histórico de Importações
                {temFiltrosAtivos && (
                  <Badge variant="secondary" className="ml-2">
                    {extratosData.length} resultado{extratosData.length !== 1 && "s"}
                  </Badge>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            {extratosData.length > 0 ? (
              <ResponsiveTable
                data={extratosData}
                columns={columns}
                keyExtractor={(item) => item.id}
                renderActions={renderActions}
              />
            ) : (
              <div className="py-8 sm:py-12 text-center">
                <FileSpreadsheet className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-4" />
                {temFiltrosAtivos ? (
                  <>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">
                      Nenhum extrato encontrado
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Tente ajustar os filtros para encontrar o que procura.
                    </p>
                    <Button variant="outline" onClick={limparFiltros}>
                      Limpar Filtros
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">
                      Nenhum extrato importado
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Importe seu primeiro extrato bancário para iniciar a conciliação.
                    </p>
                    <ImportarExtratoDialog onImportSuccess={handleImportSuccess} />
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
