import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  Filter,
  Calendar,
  RefreshCw,
  Check,
  X,
  Eye,
  Link2,
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

// Mock data - Extrato bancário
const extratoItems = [
  { id: 1, data: "29/01/2024", descricao: "TED RECEBIDA - ESCRITURA 1245", valor: 2450, tipo: "credito", status: "pendente" },
  { id: 2, data: "29/01/2024", descricao: "PAG FORNECEDOR PAPEL A4", valor: -380, tipo: "debito", status: "conciliado" },
  { id: 3, data: "28/01/2024", descricao: "PIX RECEBIDO - PROCURACAO", valor: 185, tipo: "credito", status: "pendente" },
  { id: 4, data: "28/01/2024", descricao: "DEB AUT ENERGIA ELETRICA", valor: -890, tipo: "debito", status: "divergente" },
  { id: 5, data: "27/01/2024", descricao: "TED RECEBIDA - TESTAMENTO", valor: 850, tipo: "credito", status: "conciliado" },
  { id: 6, data: "27/01/2024", descricao: "PAG ALUGUEL JAN/2024", valor: -4500, tipo: "debito", status: "pendente" },
  { id: 7, data: "26/01/2024", descricao: "DIVERSOS RECEBIMENTOS", valor: 750, tipo: "credito", status: "pendente" },
  { id: 8, data: "26/01/2024", descricao: "FOLHA PAGAMENTO JAN", valor: -18500, tipo: "debito", status: "conciliado" },
];

// Mock data - Lançamentos do sistema
const lancamentoItems = [
  { id: 1, data: "29/01/2024", descricao: "Escritura de Compra e Venda - Lote 45", valor: 2450, tipo: "receita", status: "pendente" },
  { id: 2, data: "29/01/2024", descricao: "Pagamento Fornecedor - Papel A4", valor: 380, tipo: "despesa", status: "conciliado" },
  { id: 3, data: "28/01/2024", descricao: "Procuração Pública - Processo 12345", valor: 185, tipo: "receita", status: "pendente" },
  { id: 4, data: "28/01/2024", descricao: "Energia Elétrica - Janeiro", valor: 920, tipo: "despesa", status: "divergente" },
  { id: 5, data: "27/01/2024", descricao: "Testamento Público - Cliente João", valor: 850, tipo: "receita", status: "conciliado" },
  { id: 6, data: "27/01/2024", descricao: "Aluguel do Imóvel", valor: 4500, tipo: "despesa", status: "pendente" },
  { id: 7, data: "26/01/2024", descricao: "Reconhecimento de Firma (50 unidades)", valor: 750, tipo: "receita", status: "pendente" },
  { id: 8, data: "26/01/2024", descricao: "Folha de Pagamento", valor: 18500, tipo: "despesa", status: "conciliado" },
];

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
  const [selectedExtrato, setSelectedExtrato] = useState<number | null>(null);
  const [selectedLancamento, setSelectedLancamento] = useState<number | null>(null);

  const conciliadosCount = extratoItems.filter((i) => i.status === "conciliado").length;
  const pendentesCount = extratoItems.filter((i) => i.status === "pendente").length;
  const divergentesCount = extratoItems.filter((i) => i.status === "divergente").length;
  const taxaConciliacao = Math.round((conciliadosCount / extratoItems.length) * 100);

  return (
    <MainLayout>
      <PageHeader
        title="Conciliação Bancária"
        description="Compare extratos bancários com lançamentos do sistema"
      >
        <div className="flex items-center gap-2">
          <Select defaultValue="bb">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Conta Bancária" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bb">Banco do Brasil - 1234-5</SelectItem>
              <SelectItem value="itau">Itaú - 5678-9</SelectItem>
              <SelectItem value="caixa">Caixa - 9012-3</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Janeiro 2024
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
                  <p className="text-2xl font-bold text-success">{conciliadosCount}</p>
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
                  <p className="text-2xl font-bold text-warning">{pendentesCount}</p>
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
                  <p className="text-2xl font-bold text-destructive">{divergentesCount}</p>
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
                  <p className="text-2xl font-bold text-primary">{taxaConciliacao}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Painel de Conciliação */}
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
                  disabled={!selectedExtrato || !selectedLancamento}
                >
                  <Link2 className="w-4 h-4 mr-2" />
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
                    <p className="text-xs text-muted-foreground mt-1">
                      Banco do Brasil - Ag: 1234 / CC: 56789-0
                    </p>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                      {extratoItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedExtrato(selectedExtrato === item.id ? null : item.id)}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all",
                            selectedExtrato === item.id
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
                                {item.data}
                              </p>
                            </div>
                            <div className="text-right">
                              <p
                                className={cn(
                                  "text-sm font-semibold",
                                  item.valor > 0 ? "text-success" : "text-destructive"
                                )}
                              >
                                {item.valor > 0 ? "+" : "-"}
                                {formatCurrency(item.valor)}
                              </p>
                              <Badge
                                variant="outline"
                                className={cn("text-xs mt-1", statusStyles[item.status as keyof typeof statusStyles])}
                              >
                                {statusLabels[item.status as keyof typeof statusLabels]}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
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
                      Registros financeiros do FinCart
                    </p>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                      {lancamentoItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedLancamento(selectedLancamento === item.id ? null : item.id)}
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
                                {item.data}
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
                                {formatCurrency(item.valor)}
                              </p>
                              <Badge
                                variant="outline"
                                className={cn("text-xs mt-1", statusStyles[item.status as keyof typeof statusStyles])}
                              >
                                {statusLabels[item.status as keyof typeof statusLabels]}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
