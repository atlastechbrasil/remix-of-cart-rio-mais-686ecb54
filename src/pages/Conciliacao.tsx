import { useState, useMemo } from "react";
import { subDays } from "date-fns";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  Filter,
  RefreshCw,
  Link2,
  Loader2,
  Search,
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
} from "@/hooks/useConciliacaoAdvanced";
import { ExtratoList } from "@/components/conciliacao/ExtratoList";
import { LancamentoList } from "@/components/conciliacao/LancamentoList";
import { FiltroDataConciliacao } from "@/components/conciliacao/FiltroDataConciliacao";
import type { PresetPeriodo } from "@/types/conciliacao";

export default function Conciliacao() {
  const isMobile = useIsMobile();
  const { data: contas, isLoading: loadingContas } = useContasBancarias();
  const vincular = useVincularConciliacao();

  // State
  const [selectedContaId, setSelectedContaId] = useState<string | undefined>();
  const [dataSelecionada, setDataSelecionada] = useState<Date>(subDays(new Date(), 1)); // Default: yesterday
  const [presetPeriodo, setPresetPeriodo] = useState<PresetPeriodo>("ontem");
  const [selectedExtrato, setSelectedExtrato] = useState<string | null>(null);
  const [selectedLancamento, setSelectedLancamento] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<string>("extrato");
  const [searchTerm, setSearchTerm] = useState("");

  // Data hooks with date filter
  const { data: extratoItens, isLoading: loadingExtrato } = useExtratoItensByDate(
    selectedContaId,
    dataSelecionada
  );
  const { data: lancamentos, isLoading: loadingLancamentos } = useLancamentosByDate(
    dataSelecionada
  );
  
  const stats = useConciliacaoStatsByDate(selectedContaId, dataSelecionada);
  const pendentesCount = usePendentesCountByDate(selectedContaId, dataSelecionada);

  const contaAtiva = contas?.find((c) => c.id === selectedContaId);

  // Filter items by search term
  const filteredExtratoItens = useMemo(() => {
    if (!extratoItens) return [];
    if (!searchTerm) return extratoItens;
    const term = searchTerm.toLowerCase();
    return extratoItens.filter(
      (item) =>
        item.descricao.toLowerCase().includes(term) ||
        String(item.valor).includes(term)
    );
  }, [extratoItens, searchTerm]);

  const filteredLancamentos = useMemo(() => {
    if (!lancamentos) return [];
    if (!searchTerm) return lancamentos;
    const term = searchTerm.toLowerCase();
    return lancamentos.filter(
      (item) =>
        item.descricao.toLowerCase().includes(term) ||
        item.categoria?.toLowerCase().includes(term) ||
        String(item.valor).includes(term)
    );
  }, [lancamentos, searchTerm]);

  // Filter for pending only in the matching panel
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
          {/* Account Selector */}
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

        {/* KPIs de Conciliação */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
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

          <Card>
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

          <Card>
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
          /* Painel de Conciliação */
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-lg">Comparativo de Lançamentos</CardTitle>
                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative flex-1 sm:w-48">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 h-9"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
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
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Mobile: Tabs */}
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
                          onSelect={setSelectedExtrato}
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

                  {/* Selection summary */}
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
                /* Desktop: Resizable panels */
                <ResizablePanelGroup direction="horizontal" className="min-h-[500px] rounded-lg border">
                  <ResizablePanel defaultSize={50} minSize={30}>
                    <ExtratoList
                      items={filteredExtratoItens}
                      selectedId={selectedExtrato}
                      onSelect={setSelectedExtrato}
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
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
