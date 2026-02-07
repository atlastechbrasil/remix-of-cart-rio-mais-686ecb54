import { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImportarExtratoDialog } from "@/components/extratos/ImportarExtratoDialog";
import { FiltrosExtratos } from "@/components/extratos/FiltrosExtratos";
import { DetalhesExtratoDialog } from "@/components/extratos/DetalhesExtratoDialog";
import { DownloadExtratoDialog } from "@/components/extratos/DownloadExtratoDialog";
import { ExcluirExtratoDialog } from "@/components/extratos/ExcluirExtratoDialog";
import { ExcluirExtratosBatchDialog } from "@/components/extratos/ExcluirExtratosBatchDialog";
import { ExtratosTable, type ExtratoItem } from "@/components/extratos/ExtratosTable";
import { useExtratos, useContasBancarias } from "@/hooks/useConciliacao";
import { useFiltrosExtratos } from "@/hooks/useFiltrosExtratos";

export default function Extratos() {
  const { data: extratos, isLoading: loadingExtratos } = useExtratos();
  const { data: contas } = useContasBancarias();

  // Estado para dialogs
  const [selectedExtrato, setSelectedExtrato] = useState<ExtratoItem | null>(null);
  const [selectedExtratos, setSelectedExtratos] = useState<ExtratoItem[]>([]);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showExcluir, setShowExcluir] = useState(false);
  const [showExcluirBatch, setShowExcluirBatch] = useState(false);

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

  const handleViewDetails = (extrato: ExtratoItem) => {
    setSelectedExtrato(extrato);
    setShowDetalhes(true);
  };

  const handleDownload = (extrato: ExtratoItem) => {
    setSelectedExtrato(extrato);
    setShowDownload(true);
  };

  const handleDelete = (extrato: ExtratoItem) => {
    setSelectedExtrato(extrato);
    setShowExcluir(true);
  };

  const handleDeleteBatch = (extratos: ExtratoItem[]) => {
    setSelectedExtratos(extratos);
    setShowExcluirBatch(true);
  };

  // Aplicar filtros aos extratos
  const extratosData = useMemo(() => {
    const data = (extratos || []) as ExtratoItem[];
    return aplicarFiltros(data);
  }, [extratos, aplicarFiltros]);

  // Estatísticas baseadas nos dados filtrados
  const stats = useMemo(
    () => ({
      total: extratosData.length,
      conciliados: extratosData.filter((e) => e.status === "conciliado").length,
      processando: extratosData.filter((e) => e.status === "processado").length,
      erros: extratosData.filter((e) => e.status === "erro").length,
    }),
    [extratosData]
  );

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
              <ExtratosTable
                data={extratosData}
                onViewDetails={handleViewDetails}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onDeleteBatch={handleDeleteBatch}
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

      {/* Dialog de Detalhes */}
      <DetalhesExtratoDialog
        extrato={selectedExtrato}
        open={showDetalhes}
        onOpenChange={setShowDetalhes}
      />

      {/* Dialog de Download */}
      <DownloadExtratoDialog
        extrato={selectedExtrato}
        open={showDownload}
        onOpenChange={setShowDownload}
      />

      {/* Dialog de Exclusão Individual */}
      <ExcluirExtratoDialog
        extrato={selectedExtrato}
        open={showExcluir}
        onOpenChange={setShowExcluir}
      />

      {/* Dialog de Exclusão em Lote */}
      <ExcluirExtratosBatchDialog
        extratos={selectedExtratos}
        open={showExcluirBatch}
        onOpenChange={setShowExcluirBatch}
      />
    </MainLayout>
  );
}
