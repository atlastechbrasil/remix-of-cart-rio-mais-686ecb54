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
  Unlink,
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
import { cn } from "@/lib/utils";
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

export default function Conciliacao() {
  const { data: contas, isLoading: loadingContas } = useContasBancarias();
  const { data: lancamentos, isLoading: loadingLancamentos } = useLancamentos();
  const vincular = useVincularConciliacao();
  const desvincular = useDesvincularConciliacao();

  const [selectedContaId, setSelectedContaId] = useState<string | undefined>();
  const [selectedExtrato, setSelectedExtrato] = useState<string | null>(null);
  const [selectedLancamento, setSelectedLancamento] = useState<string | null>(null);

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
        <div className="flex items-center gap-2">
          <Select value={selectedContaId} onValueChange={setSelectedContaId}>
            <SelectTrigger className="w-56">
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
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Período
          </Button>
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </PageHeader>

      <div className="flex-1 p-6 space-y-6">
        {/* KPIs de Conciliação */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conciliados</p>
                  <p className="text-2xl font-bold text-success">{stats.conciliados}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold text-warning">{stats.pendentes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Divergentes</p>
                  <p className="text-2xl font-bold text-destructive">{stats.divergentes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ArrowRightLeft className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Conciliação</p>
                  <p className="text-2xl font-bold text-primary">{stats.taxaConciliacao}%</p>
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Comparativo de Lançamentos</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                  <Button
                    size="sm"
                    disabled={!selectedExtrato || !selectedLancamento || vincular.isPending}
                    onClick={handleVincular}
                  >
                    {vincular.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Link2 className="w-4 h-4 mr-2" />
                    )}
                    Vincular Selecionados
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResizablePanelGroup direction="horizontal" className="min-h-[500px] rounded-lg border">
                {/* Extrato Bancário */}
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className="h-full flex flex-col">
                    <div className="p-3 border-b bg-muted/30">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        Extrato Bancário
                      </h3>
                      {contaAtiva && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {contaAtiva.banco} - Ag: {contaAtiva.agencia} / CC: {contaAtiva.conta}
                        </p>
                      )}
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="p-2 space-y-1">
                        {loadingExtrato ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : extratoItens && extratoItens.length > 0 ? (
                          extratoItens.map((item) => (
                            <div
                              key={item.id}
                              onClick={() =>
                                item.status_conciliacao === "pendente" &&
                                setSelectedExtrato(selectedExtrato === item.id ? null : item.id)
                              }
                              className={cn(
                                "p-3 rounded-lg border transition-all",
                                item.status_conciliacao === "pendente"
                                  ? "cursor-pointer"
                                  : "cursor-default opacity-60",
                                selectedExtrato === item.id
                                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                                  : item.status_conciliacao === "pendente"
                                  ? "hover:bg-muted/50"
                                  : ""
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {item.descricao}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {format(parseISO(item.data_transacao), "dd/MM/yyyy")}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p
                                    className={cn(
                                      "text-sm font-semibold",
                                      item.tipo === "credito" ? "text-success" : "text-destructive"
                                    )}
                                  >
                                    {item.tipo === "credito" ? "+" : "-"}
                                    {formatCurrency(Number(item.valor))}
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className={cn("text-xs mt-1", statusStyles[item.status_conciliacao])}
                                  >
                                    {statusLabels[item.status_conciliacao]}
                                  </Badge>
                                </div>
                              </div>
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
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Lançamentos do Sistema */}
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className="h-full flex flex-col">
                    <div className="p-3 border-b bg-muted/30">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        Lançamentos do Sistema
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {lancamentosPendentes.length} lançamentos pendentes
                      </p>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="p-2 space-y-1">
                        {lancamentosPendentes.length > 0 ? (
                          lancamentosPendentes.map((item) => (
                            <div
                              key={item.id}
                              onClick={() =>
                                setSelectedLancamento(selectedLancamento === item.id ? null : item.id)
                              }
                              className={cn(
                                "p-3 rounded-lg border cursor-pointer transition-all",
                                selectedLancamento === item.id
                                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                                  : "hover:bg-muted/50"
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {item.descricao}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {format(parseISO(item.data), "dd/MM/yyyy")}
                                    {item.categoria && ` • ${item.categoria}`}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p
                                    className={cn(
                                      "text-sm font-semibold",
                                      item.tipo === "receita" ? "text-success" : "text-destructive"
                                    )}
                                  >
                                    {item.tipo === "receita" ? "+" : "-"}
                                    {formatCurrency(Number(item.valor))}
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className={cn("text-xs mt-1", statusStyles[item.status_conciliacao])}
                                  >
                                    {statusLabels[item.status_conciliacao]}
                                  </Badge>
                                </div>
                              </div>
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
                </ResizablePanel>
              </ResizablePanelGroup>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
