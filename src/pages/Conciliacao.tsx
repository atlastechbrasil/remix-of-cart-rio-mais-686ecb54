import { useState, useMemo } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  Filter,
  Calendar,
  RefreshCw,
  Link2,
  Loader2,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useContasBancarias,
  useExtratoItensByConta,
  useLancamentos,
  useVincularConciliacao,
  useDesvincularConciliacao,
  ExtratoItem,
  Lancamento,
} from "@/hooks/useConciliacao";
import { format, parseISO } from "date-fns";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Math.abs(value));
};

const statusStyles = {
  conciliado: "conciliado",
  pendente: "pendente",
  divergente: "divergente",
};

const statusLabels = {
  conciliado: "Conciliado",
  pendente: "Pendente",
  divergente: "Divergente",
};

// Componente de item reutilizável para extrato e lançamento
interface ItemCardProps {
  id: string;
  descricao: string;
  data: string;
  valor: number;
  tipo: "credito" | "debito" | "receita" | "despesa";
  status: string;
  categoria?: string | null;
  isSelected: boolean;
  isSelectable: boolean;
  onSelect: () => void;
}

function ItemCard({
  descricao,
  data,
  valor,
  tipo,
  status,
  categoria,
  isSelected,
  isSelectable,
  onSelect,
}: ItemCardProps) {
  const isPositive = tipo === "credito" || tipo === "receita";

  return (
    <div
      onClick={() => isSelectable && onSelect()}
      className={cn(
        "p-3 rounded-lg border transition-all",
        isSelectable ? "cursor-pointer" : "cursor-default opacity-60",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : isSelectable
          ? "hover:bg-muted/50"
          : ""
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{descricao}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(parseISO(data), "dd/MM/yyyy")}
            {categoria && ` • ${categoria}`}
          </p>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "text-sm font-semibold",
              isPositive ? "text-success" : "text-destructive"
            )}
          >
            {isPositive ? "+" : "-"}
            {formatCurrency(valor)}
          </p>
          <Badge
            variant="outline"
            className={cn("text-xs mt-1", statusStyles[status as keyof typeof statusStyles])}
          >
            {statusLabels[status as keyof typeof statusLabels]}
          </Badge>
        </div>
      </div>
    </div>
  );
}

// Lista de extratos
interface ExtratoListProps {
  items: ExtratoItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  isLoading: boolean;
  contaInfo?: { banco: string; agencia: string; conta: string };
}

function ExtratoList({ items, selectedId, onSelect, isLoading, contaInfo }: ExtratoListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b bg-muted/30">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary" />
          Extrato Bancário
        </h3>
        {contaInfo && (
          <p className="text-xs text-muted-foreground mt-1">
            {contaInfo.banco} - Ag: {contaInfo.agencia} / CC: {contaInfo.conta}
          </p>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length > 0 ? (
            items.map((item) => (
              <div key={item.id}>
                <ItemCard
                  id={item.id}
                  descricao={item.descricao}
                  data={item.data_transacao}
                  valor={Number(item.valor)}
                  tipo={item.tipo as "credito" | "debito" | "receita" | "despesa"}
                  status={item.status_conciliacao}
                  isSelected={selectedId === item.id}
                  isSelectable={item.status_conciliacao === "pendente"}
                  onSelect={() => onSelect(selectedId === item.id ? null : item.id)}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhum item de extrato encontrado.</p>
              <p className="text-xs mt-1">Importe um extrato para esta conta.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Lista de lançamentos
interface LancamentoListProps {
  items: Lancamento[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function LancamentoList({ items, selectedId, onSelect }: LancamentoListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b bg-muted/30">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          Lançamentos do Sistema
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {items.length} lançamentos pendentes
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {items.length > 0 ? (
            items.map((item) => (
              <div key={item.id}>
                <ItemCard
                  id={item.id}
                  descricao={item.descricao}
                  data={item.data}
                  valor={Number(item.valor)}
                  tipo={item.tipo as "credito" | "debito" | "receita" | "despesa"}
                  status={item.status_conciliacao}
                  categoria={item.categoria}
                  isSelected={selectedId === item.id}
                  isSelectable={true}
                  onSelect={() => onSelect(selectedId === item.id ? null : item.id)}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhum lançamento pendente.</p>
              <p className="text-xs mt-1">Todos os lançamentos foram conciliados.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default function Conciliacao() {
  const isMobile = useIsMobile();
  const { data: contas, isLoading: loadingContas } = useContasBancarias();
  const { data: lancamentos, isLoading: loadingLancamentos } = useLancamentos();
  const vincular = useVincularConciliacao();

  const [selectedContaId, setSelectedContaId] = useState<string | undefined>();
  const [selectedExtrato, setSelectedExtrato] = useState<string | null>(null);
  const [selectedLancamento, setSelectedLancamento] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<string>("extrato");

  const { data: extratoItens, isLoading: loadingExtrato } = useExtratoItensByConta(selectedContaId);

  const contaAtiva = contas?.find((c) => c.id === selectedContaId);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const itens = extratoItens || [];
    const conciliados = itens.filter((i) => i.status_conciliacao === "conciliado").length;
    const pendentes = itens.filter((i) => i.status_conciliacao === "pendente").length;
    const divergentes = itens.filter((i) => i.status_conciliacao === "divergente").length;
    const total = itens.length;

    return {
      conciliados,
      pendentes,
      divergentes,
      taxaConciliacao: total > 0 ? Math.round((conciliados / total) * 100) : 0,
    };
  }, [extratoItens]);

  // Filtrar lançamentos pendentes
  const lancamentosPendentes = useMemo(() => {
    return (lancamentos || []).filter((l) => l.status_conciliacao === "pendente");
  }, [lancamentos]);

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

  const isLoading = loadingContas || loadingLancamentos;

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
        description="Compare extratos bancários com lançamentos do sistema"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
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
          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="sm:inline">Período</span>
            </Button>
            <Button className="flex-1 sm:flex-none">
              <RefreshCw className="w-4 h-4 mr-2" />
              <span className="sm:inline">Atualizar</span>
            </Button>
          </div>
        </div>
      </PageHeader>

      <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
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
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                  <Button
                    size="sm"
                    disabled={!selectedExtrato || !selectedLancamento || vincular.isPending}
                    onClick={handleVincular}
                    className="flex-1 sm:flex-none"
                  >
                    {vincular.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Link2 className="w-4 h-4 mr-2" />
                    )}
                    <span className="hidden sm:inline">Vincular Selecionados</span>
                    <span className="sm:hidden">Vincular</span>
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
                          items={extratoItens || []}
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
                      items={extratoItens || []}
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
