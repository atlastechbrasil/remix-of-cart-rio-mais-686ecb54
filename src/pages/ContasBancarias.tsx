import {
  Landmark,
  MoreHorizontal,
  TrendingUp,
  RefreshCw,
  Upload,
  Settings2,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { NovaContaDialog } from "@/components/contas/NovaContaDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const contasBancarias = [
  {
    id: 1,
    banco: "Banco do Brasil",
    agencia: "1234",
    conta: "56789-0",
    tipo: "Corrente",
    saldo: 125420.50,
    ultimaAtualizacao: "29/01/2024 14:30",
    status: "ativo",
    pendentes: 5,
  },
  {
    id: 2,
    banco: "Itaú Unibanco",
    agencia: "5678",
    conta: "12345-6",
    tipo: "Corrente",
    saldo: 45890.75,
    ultimaAtualizacao: "29/01/2024 10:15",
    status: "ativo",
    pendentes: 2,
  },
  {
    id: 3,
    banco: "Caixa Econômica",
    agencia: "9012",
    conta: "34567-8",
    tipo: "Poupança",
    saldo: 89500.00,
    ultimaAtualizacao: "28/01/2024 16:45",
    status: "ativo",
    pendentes: 0,
  },
  {
    id: 4,
    banco: "Santander",
    agencia: "3456",
    conta: "78901-2",
    tipo: "Corrente",
    saldo: 12340.25,
    ultimaAtualizacao: "27/01/2024 09:00",
    status: "inativo",
    pendentes: 0,
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const bancoLogos: Record<string, string> = {
  "Banco do Brasil": "BB",
  "Itaú Unibanco": "Itaú",
  "Caixa Econômica": "CEF",
  "Santander": "SAN",
};

export default function ContasBancarias() {
  const totalSaldo = contasBancarias
    .filter((c) => c.status === "ativo")
    .reduce((acc, c) => acc + c.saldo, 0);

  const totalPendentes = contasBancarias.reduce((acc, c) => acc + c.pendentes, 0);

  return (
    <MainLayout>
      <PageHeader
        title="Contas Bancárias"
        description="Gerencie suas contas bancárias e saldos"
      >
        <NovaContaDialog />
      </PageHeader>

      <div className="flex-1 p-6 space-y-6">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Landmark className="w-4 h-4" />
                Saldo Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(totalSaldo)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {contasBancarias.filter((c) => c.status === "ativo").length} contas ativas
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Pendentes Conciliação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning">{totalPendentes}</p>
              <p className="text-xs text-muted-foreground mt-1">
                lançamentos a conciliar
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Variação Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">+12,5%</p>
              <p className="text-xs text-muted-foreground mt-1">
                vs. mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Contas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contasBancarias.map((conta) => (
            <Card
              key={conta.id}
              className={cn(
                "transition-all hover:shadow-md",
                conta.status === "inativo" && "opacity-60"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {bancoLogos[conta.banco]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{conta.banco}</p>
                      <p className="text-xs text-muted-foreground">
                        Ag: {conta.agencia} / {conta.conta}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(conta.saldo)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {conta.tipo}
                      </Badge>
                      {conta.pendentes > 0 && (
                        <Badge variant="outline" className="pendente text-xs">
                          {conta.pendentes} pendentes
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Atualizado: {conta.ultimaAtualizacao}
                    </p>
                    <Button variant="ghost" size="sm" className="h-7">
                      <Upload className="w-3 h-3 mr-1" />
                      Extrato
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabela de Contas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Todas as Contas</CardTitle>
              <Button variant="outline" size="sm">
                <Settings2 className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banco</TableHead>
                  <TableHead>Agência / Conta</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead>Última Atualização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contasBancarias.map((conta) => (
                  <TableRow key={conta.id}>
                    <TableCell className="font-medium">{conta.banco}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {conta.agencia} / {conta.conta}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{conta.tipo}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(conta.saldo)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {conta.ultimaAtualizacao}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          conta.status === "ativo"
                            ? "conciliado"
                            : "text-muted-foreground"
                        }
                      >
                        {conta.status}
                      </Badge>
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
