import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LancamentoRelatorio } from "@/types/relatorios";

interface TabelaLancamentosProps {
  lancamentos: LancamentoRelatorio[];
  isLoading?: boolean;
  maxRows?: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (dateStr: string) => {
  return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    conciliado: "default",
    pendente: "secondary",
    divergente: "destructive",
  };
  return variants[status] || "outline";
};

const getTipoBadge = (tipo: string) => {
  return tipo === "receita" ? "default" : "destructive";
};

export function TabelaLancamentos({ lancamentos, isLoading, maxRows = 50 }: TabelaLancamentosProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!lancamentos || lancamentos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Lançamentos do Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            Nenhum lançamento encontrado
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayLancamentos = lancamentos.slice(0, maxRows);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base sm:text-lg">Lançamentos do Período</CardTitle>
        <Badge variant="secondary">{lancamentos.length} registros</Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                <TableHead className="w-24">Tipo</TableHead>
                <TableHead className="text-right w-28">Valor</TableHead>
                <TableHead className="hidden md:table-cell w-28">Conciliação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayLancamentos.map((lanc) => (
                <TableRow key={lanc.id}>
                  <TableCell className="text-sm">{formatDate(lanc.data)}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">{lanc.descricao}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {lanc.categoria || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getTipoBadge(lanc.tipo)}
                      className={cn(
                        "text-xs",
                        lanc.tipo === "receita"
                          ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                          : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                      )}
                    >
                      {lanc.tipo === "receita" ? "Receita" : "Despesa"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium text-sm",
                      lanc.tipo === "receita" ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {formatCurrency(lanc.valor)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={getStatusBadge(lanc.statusConciliacao)} className="text-xs capitalize">
                      {lanc.statusConciliacao}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {lancamentos.length > maxRows && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Exibindo {maxRows} de {lancamentos.length} lançamentos
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
