import { useState } from "react";
import {
  Landmark,
  MoreHorizontal,
  TrendingUp,
  RefreshCw,
  Upload,
  Settings2,
  Loader2,
  Edit,
  Trash2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useContasBancarias, useDeleteContaBancaria, ContaBancaria } from "@/hooks/useConciliacao";
import { format } from "date-fns";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const bancoLogos: Record<string, string> = {
  "Banco do Brasil": "BB",
  "Itaú Unibanco": "Itaú",
  "Caixa Econômica Federal": "CEF",
  "Santander": "SAN",
  "Bradesco": "Brad",
  "Nubank": "NU",
  "Banco Inter": "Inter",
  "C6 Bank": "C6",
  "Sicoob": "Sic",
  "Sicredi": "Sicr",
};

const tipoLabels: Record<string, string> = {
  corrente: "Corrente",
  poupanca: "Poupança",
  investimento: "Investimento",
};

export default function ContasBancarias() {
  const { data: contas, isLoading } = useContasBancarias();
  const deleteConta = useDeleteContaBancaria();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const contasAtivas = contas?.filter((c) => c.ativo) || [];
  const totalSaldo = contasAtivas.reduce((acc, c) => acc + Number(c.saldo), 0);

  const handleDelete = () => {
    if (deleteId) {
      deleteConta.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

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
                {contasAtivas.length} conta{contasAtivas.length !== 1 ? "s" : ""} ativa{contasAtivas.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Total de Contas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning">{contas?.length || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">
                cadastradas no sistema
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Média por Conta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(contasAtivas.length > 0 ? totalSaldo / contasAtivas.length : 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                entre contas ativas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Contas */}
        {contas && contas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {contas.map((conta) => (
              <Card
                key={conta.id}
                className={cn(
                  "transition-all hover:shadow-md",
                  !conta.ativo && "opacity-60"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {bancoLogos[conta.banco] || conta.banco.substring(0, 3).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{conta.banco}</p>
                        <p className="text-xs text-muted-foreground">
                          Ag: {conta.agencia} / {conta.conta}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(conta.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(Number(conta.saldo))}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {tipoLabels[conta.tipo] || conta.tipo}
                        </Badge>
                        {!conta.ativo && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            Inativa
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Atualizado: {format(new Date(conta.updated_at), "dd/MM/yyyy HH:mm")}
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
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Landmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma conta cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Cadastre sua primeira conta bancária para começar a conciliação.
              </p>
              <NovaContaDialog />
            </CardContent>
          </Card>
        )}

        {/* Tabela de Contas */}
        {contas && contas.length > 0 && (
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
                  {contas.map((conta) => (
                    <TableRow key={conta.id}>
                      <TableCell className="font-medium">{conta.banco}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {conta.agencia} / {conta.conta}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tipoLabels[conta.tipo] || conta.tipo}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(Number(conta.saldo))}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(conta.updated_at), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            conta.ativo
                              ? "conciliado"
                              : "text-muted-foreground"
                          }
                        >
                          {conta.ativo ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(conta.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta conta bancária? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteConta.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
