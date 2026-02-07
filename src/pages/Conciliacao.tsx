import { useState, useMemo, useRef, useCallback } from "react";
import { subDays, addDays } from "date-fns";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  RefreshCw,
  Link2,
  Loader2,
  Search,
  Sparkles,
  Lightbulb,
  Keyboard,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useContasBancarias,
  useVincularConciliacao,
} from "@/hooks/useConciliacao";
import {
  useExtratoItensByDate,
  useLancamentosByDate,
  useConciliacaoStatsByDate,
  usePendentesCountByDate,
  useConciliacoesByDate,
} from "@/hooks/useConciliacaoAdvanced";
import { useFiltrosConciliacao } from "@/hooks/useFiltrosConciliacao";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ExtratoList } from "@/components/conciliacao/ExtratoList";
import { LancamentoList } from "@/components/conciliacao/LancamentoList";
import { FiltroDataConciliacao } from "@/components/conciliacao/FiltroDataConciliacao";
import { FiltrosAvancadosConciliacao } from "@/components/conciliacao/FiltrosAvancadosConciliacao";
import { ConciliacaoTabs, TabsContent as ConciliacaoTabsContent } from "@/components/conciliacao/ConciliacaoTabs";
import { ListaConciliados } from "@/components/conciliacao/ListaConciliados";
import { ListaDivergencias } from "@/components/conciliacao/ListaDivergencias";
import { DetalhesConciliacaoDialog } from "@/components/conciliacao/DetalhesConciliacaoDialog";
import { EditarConciliacaoDialog } from "@/components/conciliacao/EditarConciliacaoDialog";
import { ResumoDiaConciliacao } from "@/components/conciliacao/ResumoDiaConciliacao";
import { FechamentoDiaDialog } from "@/components/conciliacao/FechamentoDiaDialog";
import { HistoricoConciliacoes } from "@/components/conciliacao/HistoricoConciliacoes";
import { SugestoesConciliacaoDialog } from "@/components/conciliacao/SugestoesConciliacaoDialog";
import { AutoConciliacaoDialog } from "@/components/conciliacao/AutoConciliacaoDialog";
import { useDesvincularConciliacao } from "@/hooks/useConciliacao";
import { getBestMatch } from "@/lib/conciliacao-matcher";
import type { PresetPeriodo, ConciliacaoTabValue, ConciliacaoDetalhada, ExtratoItem } from "@/types/conciliacao";

export default function Conciliacao() {
  const isMobile = useIsMobile();
  const { data: contas, isLoading: loadingContas } = useContasBancarias();
  const vincular = useVincularConciliacao();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // State
  const [selectedContaId, setSelectedContaId] = useState<string | undefined>();
  const [dataSelecionada, setDataSelecionada] = useState<Date>(subDays(new Date(), 1));
  const [presetPeriodo, setPresetPeriodo] = useState<PresetPeriodo>("ontem");
  const [selectedExtrato, setSelectedExtrato] = useState<string | null>(null);
  const [selectedLancamento, setSelectedLancamento] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<string>("extrato");
  const [mainTab, setMainTab] = useState<ConciliacaoTabValue>("pendentes");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog states
  const [detailsConciliacao, setDetailsConciliacao] = useState<ConciliacaoDetalhada | null>(null);
  const [editConciliacao, setEditConciliacao] = useState<ConciliacaoDetalhada | null>(null);
  const [showFechamentoDialog, setShowFechamentoDialog] = useState(false);
  const [showSugestoesDialog, setShowSugestoesDialog] = useState(false);
  const [showAutoDialog, setShowAutoDialog] = useState(false);
  const [selectedExtratoItem, setSelectedExtratoItem] = useState<ExtratoItem | null>(null);
  
  const desvincular = useDesvincularConciliacao();
  
  // Advanced filters hook
  const {
    filtros,
    toggleStatus,
    toggleTipoLancamento,
    toggleTipoTransacao,
    setValorRange,
    limparFiltros,
    filtrarExtratoItens,
    filtrarLancamentos,
    contadorAtivos: filtrosAtivos,
  } = useFiltrosConciliacao();

  // Data hooks with date filter
  const { data: extratoItens, isLoading: loadingExtrato } = useExtratoItensByDate(
    selectedContaId,
    dataSelecionada
  );
  const { data: lancamentos, isLoading: loadingLancamentos } = useLancamentosByDate(
    dataSelecionada
  );
  const { data: conciliacoes, isLoading: loadingConciliacoes } = useConciliacoesByDate(
    dataSelecionada
  );
  
  const stats = useConciliacaoStatsByDate(selectedContaId, dataSelecionada);
  const pendentesCount = usePendentesCountByDate(selectedContaId, dataSelecionada);

  const contaAtiva = contas?.find((c) => c.id === selectedContaId);

  // Filter conciliations by status
  const conciliadosList = useMemo(() => {
    return (conciliacoes || []).filter(
      (c) => c.extrato_item?.status_conciliacao === "conciliado" && Number(c.diferenca || 0) === 0
    );
  }, [conciliacoes]);

  const divergentesList = useMemo(() => {
    return (conciliacoes || []).filter(
      (c) => c.extrato_item?.status_conciliacao === "divergente" || Number(c.diferenca || 0) !== 0
    );
  }, [conciliacoes]);

  // Apply advanced filters + search
  const filteredExtratoItens = useMemo(() => {
    if (!extratoItens) return [];
    return filtrarExtratoItens(extratoItens, searchTerm);
  }, [extratoItens, searchTerm, filtrarExtratoItens]);

  const filteredLancamentos = useMemo(() => {
    if (!lancamentos) return [];
    return filtrarLancamentos(lancamentos, searchTerm);
  }, [lancamentos, searchTerm, filtrarLancamentos]);

  const lancamentosPendentes = useMemo(() => {
    return filteredLancamentos.filter((l) => l.status_conciliacao === "pendente");
  }, [filteredLancamentos]);

  const handleVincular = () => {
    if (selectedExtrato && selectedLancamento) {
      const extratoItem = extratoItens?.find((e) => e.id === selectedExtrato);
      const lancamento = lancamentos?.find((l) => l.id === selectedLancamento);

      if (extratoItem && lancamento) {
        const diferenca = Math.abs(Number(extratoItem.valor)) - Number(lancamento.valor);

        vincular.mutate(
          {
            extratoItemId: selectedExtrato,
            lancamentoId: selectedLancamento,
            diferenca,
          },
          {
            onSuccess: () => {
              setSelectedExtrato(null);
              setSelectedLancamento(null);
            },
          }
        );
      }
    }
  };

  const handleViewDetails = (conciliacao: ConciliacaoDetalhada) => {
    setDetailsConciliacao(conciliacao);
  };

  const handleEditConciliacao = (conciliacao: ConciliacaoDetalhada) => {
    setDetailsConciliacao(null);
    setEditConciliacao(conciliacao);
  };

  const handleDesvincularFromDetails = () => {
    if (detailsConciliacao) {
      setDetailsConciliacao(null);
      desvincular.mutate({
        extratoItemId: detailsConciliacao.extrato_item_id,
        lancamentoId: detailsConciliacao.lancamento_id,
      });
    }
  };

  const handleFechamento = () => {
    setShowFechamentoDialog(true);
  };

  const handleConfirmFechamento = () => {
    // TODO: Implement fechamento logic (mark day as closed in database)
    setShowFechamentoDialog(false);
  };

  // Handle opening suggestions dialog when selecting an extrato item
  const handleExtratoSelect = (id: string | null) => {
    setSelectedExtrato(id);
    if (id && lancamentosPendentes.length > 0) {
      const item = extratoItens?.find((e) => e.id === id);
      if (item) {
        setSelectedExtratoItem(item);
        // Check if there's a good match suggestion
        const bestMatch = getBestMatch(item, lancamentosPendentes);
        if (bestMatch && bestMatch.score >= 80) {
          // Auto-select the best match if confidence is high
          setSelectedLancamento(bestMatch.lancamento.id);
        }
      }
    } else {
      setSelectedExtratoItem(null);
    }
  };

  // Handle selecting a suggestion from the dialog
  const handleSelectSugestao = (lancamento: { id: string }) => {
    setSelectedLancamento(lancamento.id);
    setShowSugestoesDialog(false);
  };

  // Handle auto-conciliacao
  const handleAutoConciliacao = async (
    matches: Array<{ extratoItem: ExtratoItem; lancamento: { id: string; valor: number } }>
  ) => {
    for (const match of matches) {
      const diferenca =
        Math.abs(Number(match.extratoItem.valor)) - Number(match.lancamento.valor);

      await new Promise<void>((resolve, reject) => {
        vincular.mutate(
          {
            extratoItemId: match.extratoItem.id,
            lancamentoId: match.lancamento.id,
            diferenca,
          },
          {
            onSuccess: () => resolve(),
            onError: (err) => reject(err),
          }
        );
      });
    }
  };

  // Keyboard shortcuts handlers
  const handleFocusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedExtrato(null);
    setSelectedLancamento(null);
    setSelectedExtratoItem(null);
  }, []);

  const handleNextDay = useCallback(() => {
    setDataSelecionada((prev) => addDays(prev, 1));
    setPresetPeriodo("customizado");
  }, []);

  const handlePrevDay = useCallback(() => {
    setDataSelecionada((prev) => subDays(prev, 1));
    setPresetPeriodo("customizado");
  }, []);

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    onFocusSearch: handleFocusSearch,
    onVincular: handleVincular,
    onClearSelection: handleClearSelection,
    onNextDay: handleNextDay,
    onPrevDay: handlePrevDay,
    onOpenSugestoes: () => setShowSugestoesDialog(true),
    onOpenAutoMatch: () => setShowAutoDialog(true),
    isVincularEnabled: !!(selectedExtrato && selectedLancamento && !vincular.isPending),
    isSugestoesEnabled: !!selectedExtrato,
    isAutoEnabled: stats.pendentes > 0,
  });

  const isLoading = loadingContas;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Conciliação Bancária"
        description="Fechamento diário - Compare extratos bancários com lançamentos do sistema"
      >
        <div className="flex flex-col gap-3">
          <Select value={selectedContaId} onValueChange={setSelectedContaId}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Selecione uma conta" />
            </SelectTrigger>
            <SelectContent>
              {contas?.filter((c) => c.ativo).map((conta) => (
                <SelectItem key={conta.id} value={conta.id}>
                  {conta.banco} - {conta.conta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Date Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <FiltroDataConciliacao
                dataSelecionada={dataSelecionada}
                onDataChange={setDataSelecionada}
                preset={presetPeriodo}
                onPresetChange={setPresetPeriodo}
                pendentesCount={pendentesCount}
              />
              <Button variant="outline" size="sm" className="self-start">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setMainTab("conciliados")}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Conciliados</p>
                  <p className="text-lg sm:text-2xl font-bold text-success">{stats.conciliados}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setMainTab("pendentes")}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-warning/10">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-lg sm:text-2xl font-bold text-warning">{stats.pendentes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setMainTab("divergentes")}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-destructive/10">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Divergentes</p>
                  <p className="text-lg sm:text-2xl font-bold text-destructive">{stats.divergentes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                  <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Taxa</p>
                  <p className="text-lg sm:text-2xl font-bold text-primary">{stats.taxaConciliacao}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {!selectedContaId ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ArrowRightLeft className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Selecione uma conta bancária</h3>
              <p className="text-muted-foreground">
                Escolha uma conta no menu acima para iniciar a conciliação.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Resumo do Dia - Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <ResumoDiaConciliacao
                data={dataSelecionada}
                stats={stats}
                onFechamento={handleFechamento}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-lg">Conciliação do Dia</CardTitle>
                {mainTab === "pendentes" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 sm:w-40">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        ref={searchInputRef}
                        placeholder="Buscar... (Ctrl+F)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 h-9"
                      />
                    </div>
                    <FiltrosAvancadosConciliacao
                      filtros={filtros}
                      onToggleStatus={toggleStatus}
                      onToggleTipoLancamento={toggleTipoLancamento}
                      onToggleTipoTransacao={toggleTipoTransacao}
                      onSetValorRange={setValorRange}
                      onLimpar={limparFiltros}
                      contadorAtivos={filtrosAtivos}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAutoDialog(true)}
                      disabled={stats.pendentes === 0}
                      className="hidden sm:flex"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Auto
                    </Button>
                    {selectedExtrato && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSugestoesDialog(true)}
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Sugestões</span>
                      </Button>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            disabled={!selectedExtrato || !selectedLancamento || vincular.isPending}
                            onClick={handleVincular}
                            className="flex-shrink-0"
                          >
                            {vincular.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Link2 className="w-4 h-4 mr-2" />
                            )}
                            <span className="hidden sm:inline">Vincular</span>
                            <span className="sm:hidden">OK</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>Vincular itens selecionados <kbd className="ml-1 px-1 py-0.5 bg-muted rounded text-[10px]">Enter</kbd></p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {!isMobile && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8">
                              <Keyboard className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-left">
                            <p className="font-semibold mb-1">Atalhos de Teclado</p>
                            <div className="text-xs space-y-0.5">
                              <p><kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+F</kbd> Buscar</p>
                              <p><kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> Vincular</p>
                              <p><kbd className="px-1 py-0.5 bg-muted rounded">Esc</kbd> Limpar seleção</p>
                              <p><kbd className="px-1 py-0.5 bg-muted rounded">←</kbd> <kbd className="px-1 py-0.5 bg-muted rounded">→</kbd> Navegar dias</p>
                              <p><kbd className="px-1 py-0.5 bg-muted rounded">S</kbd> Sugestões</p>
                              <p><kbd className="px-1 py-0.5 bg-muted rounded">A</kbd> Auto-match</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ConciliacaoTabs value={mainTab} onValueChange={setMainTab} stats={stats}>
                {/* Tab: Pendentes */}
                <ConciliacaoTabsContent value="pendentes" className="mt-4">
                  {isMobile ? (
                    <div className="space-y-4">
                      <Tabs value={mobileTab} onValueChange={setMobileTab}>
                        <TabsList className="w-full grid grid-cols-2">
                          <TabsTrigger value="extrato" className="relative">
                            Extrato
                            {selectedExtrato && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                            )}
                          </TabsTrigger>
                          <TabsTrigger value="lancamentos" className="relative">
                            Lançamentos
                            {selectedLancamento && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                            )}
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="extrato" className="mt-4">
                          <div className="border rounded-lg h-[400px]">
                            <ExtratoList
                              items={filteredExtratoItens}
                              selectedId={selectedExtrato}
                              onSelect={handleExtratoSelect}
                              isLoading={loadingExtrato}
                              contaInfo={contaAtiva ? {
                                banco: contaAtiva.banco,
                                agencia: contaAtiva.agencia,
                                conta: contaAtiva.conta,
                              } : undefined}
                            />
                          </div>
                        </TabsContent>
                        <TabsContent value="lancamentos" className="mt-4">
                          <div className="border rounded-lg h-[400px]">
                            <LancamentoList
                              items={lancamentosPendentes}
                              selectedId={selectedLancamento}
                              onSelect={setSelectedLancamento}
                              isLoading={loadingLancamentos}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>

                      {(selectedExtrato || selectedLancamento) && (
                        <div className="p-3 bg-muted/50 rounded-lg text-sm">
                          <p className="text-muted-foreground">
                            {selectedExtrato && selectedLancamento
                              ? "✓ Ambos selecionados - clique em Vincular"
                              : selectedExtrato
                              ? "Extrato selecionado - selecione um lançamento"
                              : "Lançamento selecionado - selecione um extrato"}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <ResizablePanelGroup direction="horizontal" className="min-h-[450px] rounded-lg border">
                      <ResizablePanel defaultSize={50} minSize={30}>
                        <ExtratoList
                          items={filteredExtratoItens}
                          selectedId={selectedExtrato}
                          onSelect={handleExtratoSelect}
                          isLoading={loadingExtrato}
                          contaInfo={contaAtiva ? {
                            banco: contaAtiva.banco,
                            agencia: contaAtiva.agencia,
                            conta: contaAtiva.conta,
                          } : undefined}
                        />
                      </ResizablePanel>
                      <ResizableHandle withHandle />
                      <ResizablePanel defaultSize={50} minSize={30}>
                        <LancamentoList
                          items={lancamentosPendentes}
                          selectedId={selectedLancamento}
                          onSelect={setSelectedLancamento}
                          isLoading={loadingLancamentos}
                        />
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  )}
                </ConciliacaoTabsContent>

                {/* Tab: Conciliados */}
                <ConciliacaoTabsContent value="conciliados" className="mt-4">
                  <ListaConciliados
                    conciliacoes={conciliadosList}
                    isLoading={loadingConciliacoes}
                    onViewDetails={handleViewDetails}
                  />
                </ConciliacaoTabsContent>

                {/* Tab: Divergentes */}
                <ConciliacaoTabsContent value="divergentes" className="mt-4">
                  <ListaDivergencias
                    conciliacoes={divergentesList}
                    isLoading={loadingConciliacoes}
                    onViewDetails={handleViewDetails}
                  />
                </ConciliacaoTabsContent>

                {/* Tab: Histórico */}
                <ConciliacaoTabsContent value="historico" className="mt-4">
                  <HistoricoConciliacoes onViewDetails={handleViewDetails} />
                </ConciliacaoTabsContent>
              </ConciliacaoTabs>
            </CardContent>
          </Card>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <DetalhesConciliacaoDialog
        conciliacao={detailsConciliacao}
        open={!!detailsConciliacao}
        onOpenChange={(open) => !open && setDetailsConciliacao(null)}
        onEdit={() => detailsConciliacao && handleEditConciliacao(detailsConciliacao)}
        onDesvincular={handleDesvincularFromDetails}
      />

      <EditarConciliacaoDialog
        conciliacao={editConciliacao}
        open={!!editConciliacao}
        onOpenChange={(open) => !open && setEditConciliacao(null)}
      />

      <FechamentoDiaDialog
        open={showFechamentoDialog}
        onOpenChange={setShowFechamentoDialog}
        data={dataSelecionada}
        stats={stats}
        conciliacoes={conciliacoes || []}
        onConfirm={handleConfirmFechamento}
      />

      <SugestoesConciliacaoDialog
        open={showSugestoesDialog}
        onOpenChange={setShowSugestoesDialog}
        extratoItem={selectedExtratoItem}
        lancamentos={lancamentosPendentes}
        onSelectSugestao={handleSelectSugestao}
        isVinculando={vincular.isPending}
      />

      <AutoConciliacaoDialog
        open={showAutoDialog}
        onOpenChange={setShowAutoDialog}
        extratoItens={filteredExtratoItens}
        lancamentos={lancamentosPendentes}
        onConfirm={handleAutoConciliacao}
      />
    </MainLayout>
  );
}
