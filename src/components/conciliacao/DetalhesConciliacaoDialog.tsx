import * as React from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Link2,
  ArrowRight,
  Calendar,
  DollarSign,
  FileText,
  User,
  Clock,
  Edit,
  Link2Off,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ConciliacaoDetalhada } from "@/types/conciliacao";

interface DetalhesConciliacaoDialogProps {
  conciliacao: ConciliacaoDetalhada | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onDesvincular?: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Math.abs(value));
};

function DetailRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-muted">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-medium", className)}>{value}</p>
      </div>
    </div>
  );
}

function ConciliacaoContent({
  conciliacao,
  onEdit,
  onDesvincular,
}: {
  conciliacao: ConciliacaoDetalhada;
  onEdit?: () => void;
  onDesvincular?: () => void;
}) {
  const extratoItem = conciliacao.extrato_item;
  const lancamento = conciliacao.lancamento;
  const diferenca = Number(conciliacao.diferenca || 0);
  const isDivergente = diferenca !== 0;

  return (
    <ScrollArea className="max-h-[70vh]">
      <div className="space-y-6 p-1">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn(
              "text-sm py-1 px-3",
              isDivergente
                ? "bg-destructive/10 text-destructive border-destructive/30"
                : "bg-success/10 text-success border-success/30"
            )}
          >
            {isDivergente ? "Divergente" : "Conciliado"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {format(parseISO(conciliacao.conciliado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </span>
        </div>

        {/* Paired Items Visual */}
        <div className="flex flex-col md:flex-row items-stretch gap-3">
          {/* Extrato */}
          <div className="flex-1 p-4 rounded-lg border-2 border-secondary/50 bg-secondary/5">
            <p className="text-xs font-medium text-secondary-foreground/70 mb-2">
              Extrato Bancário
            </p>
            <p className="font-medium truncate">{extratoItem?.descricao || "-"}</p>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-muted-foreground">
                {extratoItem?.data_transacao
                  ? format(parseISO(extratoItem.data_transacao), "dd/MM/yyyy")
                  : "-"}
              </p>
              <p
                className={cn(
                  "text-lg font-bold",
                  extratoItem?.tipo === "credito" ? "text-success" : "text-destructive"
                )}
              >
                {extratoItem?.tipo === "credito" ? "+" : "-"}
                {formatCurrency(Number(extratoItem?.valor || 0))}
              </p>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <div className="p-2 rounded-full bg-primary/10">
              <Link2 className="w-5 h-5 text-primary" />
            </div>
          </div>

          {/* Lançamento */}
          <div className="flex-1 p-4 rounded-lg border-2 border-primary/50 bg-primary/5">
            <p className="text-xs font-medium text-primary/70 mb-2">
              Lançamento do Sistema
            </p>
            <p className="font-medium truncate">{lancamento?.descricao || "-"}</p>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-muted-foreground">
                {lancamento?.data
                  ? format(parseISO(lancamento.data), "dd/MM/yyyy")
                  : "-"}
                {lancamento?.categoria && ` • ${lancamento.categoria}`}
              </p>
              <p
                className={cn(
                  "text-lg font-bold",
                  lancamento?.tipo === "receita" ? "text-success" : "text-destructive"
                )}
              >
                {lancamento?.tipo === "receita" ? "+" : "-"}
                {formatCurrency(Number(lancamento?.valor || 0))}
              </p>
            </div>
          </div>
        </div>

        {/* Difference if divergent */}
        {isDivergente && (
          <div
            className={cn(
              "p-4 rounded-lg border-2 border-dashed",
              diferenca > 0
                ? "bg-success/5 border-success/30"
                : "bg-destructive/5 border-destructive/30"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Diferença de valores:</span>
              <span
                className={cn(
                  "text-xl font-bold",
                  diferenca > 0 ? "text-success" : "text-destructive"
                )}
              >
                {diferenca > 0 ? "+" : ""}
                {formatCurrency(diferenca)}
              </span>
            </div>
          </div>
        )}

        <Separator />

        {/* Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Detalhes</h4>

          <DetailRow
            icon={Calendar}
            label="Data da Conciliação"
            value={format(parseISO(conciliacao.conciliado_em), "dd 'de' MMMM 'de' yyyy, HH:mm", {
              locale: ptBR,
            })}
          />

          {lancamento?.responsavel && (
            <DetailRow icon={User} label="Responsável" value={lancamento.responsavel} />
          )}

          {lancamento?.categoria && (
            <DetailRow icon={FileText} label="Categoria" value={lancamento.categoria} />
          )}

          {lancamento?.status && (
            <DetailRow
              icon={Clock}
              label="Status do Lançamento"
              value={
                <Badge variant="outline" className="capitalize">
                  {lancamento.status}
                </Badge>
              }
            />
          )}
        </div>

        {/* Observation */}
        {conciliacao.observacao && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Observação</h4>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {conciliacao.observacao}
              </p>
            </div>
          </>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          {onEdit && (
            <Button variant="outline" className="flex-1" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar Observação
            </Button>
          )}
          {onDesvincular && (
            <Button
              variant="outline"
              className="flex-1 text-destructive hover:text-destructive"
              onClick={onDesvincular}
            >
              <Link2Off className="w-4 h-4 mr-2" />
              Desvincular
            </Button>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}

export function DetalhesConciliacaoDialog({
  conciliacao,
  open,
  onOpenChange,
  onEdit,
  onDesvincular,
}: DetalhesConciliacaoDialogProps) {
  const isMobile = useIsMobile();

  if (!conciliacao) return null;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Detalhes da Conciliação</DrawerTitle>
            <DrawerDescription>
              Visualize os detalhes do par conciliado
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <ConciliacaoContent
              conciliacao={conciliacao}
              onEdit={onEdit}
              onDesvincular={onDesvincular}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Conciliação</DialogTitle>
          <DialogDescription>
            Visualize os detalhes do par conciliado
          </DialogDescription>
        </DialogHeader>
        <ConciliacaoContent
          conciliacao={conciliacao}
          onEdit={onEdit}
          onDesvincular={onDesvincular}
        />
      </DialogContent>
    </Dialog>
  );
}
