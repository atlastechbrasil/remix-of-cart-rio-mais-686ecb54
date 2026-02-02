import { useState } from "react";
import {
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NovoLancamentoDialog } from "@/components/financeiro/NovoLancamentoDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const transactions = [
  {
    id: 1,
    data: "29/01/2024",
    descricao: "Registro de Imóvel - Matrícula 45.678",
    tipo: "receita",
    categoria: "Registro",
    valor: 2450,
    status: "pago",
    statusConciliacao: "conciliado",
    responsavel: "Maria Santos",
  },
  {
    id: 2,
    data: "29/01/2024",
    descricao: "Pagamento Fornecedor - Papel A4",
    tipo: "despesa",
    categoria: "Material",
    valor: 380,
    status: "pago",
    statusConciliacao: "conciliado",
    responsavel: "Carlos Oliveira",
  },
  {
    id: 3,
    data: "28/01/2024",
    descricao: "Averbação - Matrícula 12.345",
    tipo: "receita",
    categoria: "Averbação",
    valor: 185,
    status: "pago",
    statusConciliacao: "pendente",
    responsavel: "Ana Costa",
  },
  {
    id: 4,
    data: "28/01/2024",
    descricao: "Energia Elétrica - Janeiro",
    tipo: "despesa",
    categoria: "Utilidades",
    valor: 890,
    status: "pendente",
    statusConciliacao: "divergente",
    responsavel: "Sistema",
  },
  {
    id: 5,
    data: "27/01/2024",
    descricao: "Certidão de Matrícula - Lote 123",
    tipo: "receita",
    categoria: "Certidão",
    valor: 85,
    status: "pago",
    statusConciliacao: "conciliado",
    responsavel: "Pedro Lima",
  },
  {
    id: 6,
    data: "27/01/2024",
    descricao: "Aluguel do Imóvel",
    tipo: "despesa",
    categoria: "Infraestrutura",
    valor: 4500,
    status: "agendado",
    statusConciliacao: "pendente",
    responsavel: "Sistema",
  },
  {
    id: 7,
    data: "26/01/2024",
    descricao: "Busca de Matrícula (50 unidades)",
    tipo: "receita",
    categoria: "Busca",
    valor: 750,
    status: "pago",
    statusConciliacao: "conciliado",
    responsavel: "Lucia Ferreira",
  },
  {
    id: 8,
    data: "26/01/2024",
    descricao: "Folha de Pagamento",
    tipo: "despesa",
    categoria: "Pessoal",
    valor: 18500,
    status: "pago",
    statusConciliacao: "conciliado",
    responsavel: "RH",
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const statusStyles = {
  pago: "bg-success/10 text-success border-success/20",
  pendente: "bg-warning/10 text-warning border-warning/20",
  agendado: "bg-info/10 text-info border-info/20",
  cancelado: "bg-destructive/10 text-destructive border-destructive/20",
};

const conciliacaoIcons = {
  conciliado: <CheckCircle2 className="w-3.5 h-3.5 text-success" />,
  pendente: <Clock className="w-3.5 h-3.5 text-warning" />,
  divergente: <AlertTriangle className="w-3.5 h-3.5 text-destructive" />,
};

export default function Lancamentos() {
  const [activeTab, setActiveTab] = useState("todas");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = transactions.filter((t) => {
    if (activeTab === "receitas" && t.tipo !== "receita") return false;
    if (activeTab === "despesas" && t.tipo !== "despesa") return false;
    if (searchTerm && !t.descricao.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const totalReceitas = transactions
    .filter((t) => t.tipo === "receita")
    .reduce((acc, t) => acc + t.valor, 0);

  const totalDespesas = transactions
    .filter((t) => t.tipo === "despesa")
    .reduce((acc, t) => acc + t.valor, 0);

  return (
    <MainLayout>
      <PageHeader title="Lançamentos" description="Controle de receitas e despesas">
        <NovoLancamentoDialog />
      </PageHeader>

      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-success">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-success" />
                Total de Receitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(totalReceitas)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-destructive">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-destructive" />
                Total de Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(totalDespesas)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saldo do Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(totalReceitas - totalDespesas)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="todas">Todas</TabsTrigger>
                  <TabsTrigger value="receitas">Receitas</TabsTrigger>
                  <TabsTrigger value="despesas">Despesas</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar transação..."
                    className="pl-9 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select defaultValue="todos">
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Conciliação</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.data}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "p-1.5 rounded-full",
                            transaction.tipo === "receita"
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"
                          )}
                        >
                          {transaction.tipo === "receita" ? (
                            <ArrowDownLeft className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                        </div>
                        <span className="truncate max-w-xs">
                          {transaction.descricao}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.categoria}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.responsavel}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusStyles[transaction.status as keyof typeof statusStyles]}
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        {conciliacaoIcons[transaction.statusConciliacao as keyof typeof conciliacaoIcons]}
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold",
                        transaction.tipo === "receita"
                          ? "text-success"
                          : "text-destructive"
                      )}
                    >
                      {transaction.tipo === "receita" ? "+" : "-"}
                      {formatCurrency(transaction.valor)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
