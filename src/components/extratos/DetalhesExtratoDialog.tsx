import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import {
  FileSpreadsheet,
  Calendar,
  Building2,
  Hash,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useExtratoItens } from "@/hooks/useConciliacao";
import { cn } from "@/lib/utils";

interface ExtratoData {
  id: string;
  arquivo: string;
  conta_bancaria: { banco: string; agencia?: string; conta: string } | null;
  periodo_inicio: string;
  periodo_fim: string;
  total_lancamentos: number;
  status: string;
  created_at: string;
}

interface DetalhesExtratoDialogProps {
  extrato: ExtratoData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  processado: { label: "Em Processamento", variant: "secondary" },
  conciliado: { label: "Conciliado", variant: "default" },
  erro: { label: "Com Erros", variant: "destructive" },
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export function DetalhesExtratoDialog({
  extrato,
  open,
  onOpenChange,
}: DetalhesExtratoDialogProps) {
  const { data: itens, isLoading } = useExtratoItens(extrato?.id);

  const stats = useMemo(() => {
    if (!itens || itens.length === 0) {
      return {
        totalCreditos: 0,
        totalDebitos: 0,
        saldoPeriodo: 0,
        conciliados: 0,
        pendentes: 0,
        divergentes: 0,
        percentualConciliado: 0,
      };
    }

    const creditos = itens.filter((i) => i.tipo === "credito");
    const debitos = itens.filter((i) => i.tipo === "debito");
    const conciliados = itens.filter((i) => i.status_conciliacao === "conciliado");
    const pendentes = itens.filter((i) => i.status_conciliacao === "pendente");
    const divergentes = itens.filter((i) => i.status_conciliacao === "divergente");

    const totalCreditos = creditos.reduce((acc, i) => acc + Math.abs(Number(i.valor)), 0);
    const totalDebitos = debitos.reduce((acc, i) => acc + Math.abs(Number(i.valor)), 0);

    return {
      totalCreditos,
      totalDebitos,
      saldoPeriodo: totalCreditos - totalDebitos,
      conciliados: conciliados.length,
      pendentes: pendentes.length,
      divergentes: divergentes.length,
      percentualConciliado: itens.length > 0 ? Math.round((conciliados.length / itens.length) * 100) : 0,
    };
  }, [itens]);

  if (!extrato) return null;

  const statusInfo = statusConfig[extrato.status] || { label: extrato.status, variant: "outline" as const };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Detalhes do Extrato
          </DialogTitle>
          <DialogDescription>
            Visualize os detalhes e lançamentos do extrato importado
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Metadados */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Arquivo</p>
                    <p className="text-sm font-medium break-all">{extrato.arquivo}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Conta Bancária</p>
                    <p className="text-sm font-medium">
                      {extrato.conta_bancaria?.banco || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {extrato.conta_bancaria?.conta || ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Período</p>
                    <p className="text-sm font-medium">
                      {format(parseISO(extrato.periodo_inicio), "dd/MM/yyyy")} -{" "}
                      {format(parseISO(extrato.periodo_fim), "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total de Lançamentos</p>
                    <p className="text-sm font-medium">{extrato.total_lancamentos}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Importado em</p>
                    <p className="text-sm font-medium">
                      {format(parseISO(extrato.created_at), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={statusInfo.variant} className="mt-0.5">
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo Financeiro */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <div>
                    <p className="text-xs text-muted-foreground">Créditos</p>
                    <p className="text-sm font-bold text-success">
                      {formatCurrency(stats.totalCreditos)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  <div>
                    <p className="text-xs text-muted-foreground">Débitos</p>
                    <p className="text-sm font-bold text-destructive">
                      {formatCurrency(stats.totalDebitos)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Saldo Período</p>
                    <p className={cn(
                      "text-sm font-bold",
                      stats.saldoPeriodo >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {formatCurrency(stats.saldoPeriodo)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Conciliado</p>
                    <p className="text-xs font-medium">{stats.percentualConciliado}%</p>
                  </div>
                  <Progress value={stats.percentualConciliado} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {stats.conciliados} de {itens?.length || 0} itens
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status dos Itens */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {stats.conciliados} Conciliados
            </Badge>
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
              <Clock className="w-3 h-3 mr-1" />
              {stats.pendentes} Pendentes
            </Badge>
            {stats.divergentes > 0 && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                <AlertCircle className="w-3 h-3 mr-1" />
                {stats.divergentes} Divergentes
              </Badge>
            )}
          </div>

          <Separator />

          {/* Lista de Itens */}
          <div className="flex-1 min-h-0">
            <h4 className="text-sm font-medium mb-2">Lançamentos do Extrato</h4>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : itens && itens.length > 0 ? (
              <ScrollArea className="h-[200px] sm:h-[250px]">
                <div className="space-y-2 pr-4">
                  {itens.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(item.data_transacao), "dd/MM/yyyy")}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              item.status_conciliacao === "conciliado" && "bg-success/10 text-success",
                              item.status_conciliacao === "pendente" && "bg-warning/10 text-warning",
                              item.status_conciliacao === "divergente" && "bg-destructive/10 text-destructive"
                            )}
                          >
                            {item.status_conciliacao === "conciliado" && "Conciliado"}
                            {item.status_conciliacao === "pendente" && "Pendente"}
                            {item.status_conciliacao === "divergente" && "Divergente"}
                          </Badge>
                        </div>
                        <p className="text-sm truncate">{item.descricao}</p>
                      </div>
                      <div className={cn(
                        "text-sm font-medium ml-4 shrink-0",
                        item.tipo === "credito" ? "text-success" : "text-destructive"
                      )}>
                        {item.tipo === "credito" ? "+" : "-"}
                        {formatCurrency(Math.abs(Number(item.valor)))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum lançamento encontrado</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
