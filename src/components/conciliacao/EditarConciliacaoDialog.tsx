import * as React from "react";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Save, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUpdateConciliacao } from "@/hooks/useConciliacaoAdvanced";
import type { ConciliacaoDetalhada } from "@/types/conciliacao";

interface EditarConciliacaoDialogProps {
  conciliacao: ConciliacaoDetalhada | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Math.abs(value));
};

function EditForm({
  conciliacao,
  onSubmit,
  isPending,
}: {
  conciliacao: ConciliacaoDetalhada;
  onSubmit: (observacao: string) => void;
  isPending: boolean;
}) {
  const [observacao, setObservacao] = useState(conciliacao.observacao || "");

  const extratoItem = conciliacao.extrato_item;
  const lancamento = conciliacao.lancamento;
  const diferenca = Number(conciliacao.diferenca || 0);
  const isDivergente = diferenca !== 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(observacao);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Summary */}
      <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn(
              isDivergente
                ? "bg-destructive/10 text-destructive border-destructive/30"
                : "bg-success/10 text-success border-success/30"
            )}
          >
            {isDivergente ? "Divergente" : "Conciliado"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {format(parseISO(conciliacao.conciliado_em), "dd/MM/yyyy", { locale: ptBR })}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Extrato</p>
            <p className="font-medium truncate">{extratoItem?.descricao || "-"}</p>
            <p
              className={cn(
                "font-semibold",
                extratoItem?.tipo === "credito" ? "text-success" : "text-destructive"
              )}
            >
              {formatCurrency(Number(extratoItem?.valor || 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Lançamento</p>
            <p className="font-medium truncate">{lancamento?.descricao || "-"}</p>
            <p
              className={cn(
                "font-semibold",
                lancamento?.tipo === "receita" ? "text-success" : "text-destructive"
              )}
            >
              {formatCurrency(Number(lancamento?.valor || 0))}
            </p>
          </div>
        </div>

        {isDivergente && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Diferença:</span>
              <span
                className={cn(
                  "font-bold",
                  diferenca > 0 ? "text-success" : "text-destructive"
                )}
              >
                {diferenca > 0 ? "+" : ""}
                {formatCurrency(diferenca)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Observation Field */}
      <div className="space-y-2">
        <Label htmlFor="observacao">
          Observação / Justificativa
          {isDivergente && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Textarea
          id="observacao"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder={
            isDivergente
              ? "Explique a razão da divergência de valores..."
              : "Adicione uma observação sobre esta conciliação (opcional)"
          }
          rows={4}
          className="resize-none"
        />
        {isDivergente && (
          <p className="text-xs text-muted-foreground">
            É recomendado adicionar uma justificativa para divergências de valores.
          </p>
        )}
      </div>

      {/* Submit Button (for mobile drawer) */}
      <div className="sm:hidden">
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
}

export function EditarConciliacaoDialog({
  conciliacao,
  open,
  onOpenChange,
  onSuccess,
}: EditarConciliacaoDialogProps) {
  const isMobile = useIsMobile();
  const updateConciliacao = useUpdateConciliacao();

  const handleSubmit = (observacao: string) => {
    if (!conciliacao) return;

    updateConciliacao.mutate(
      {
        id: conciliacao.id,
        observacao: observacao || null,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  if (!conciliacao) return null;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Editar Conciliação</DrawerTitle>
            <DrawerDescription>
              Altere a observação ou justificativa
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <EditForm
              conciliacao={conciliacao}
              onSubmit={handleSubmit}
              isPending={updateConciliacao.isPending}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Conciliação</DialogTitle>
          <DialogDescription>
            Altere a observação ou justificativa
          </DialogDescription>
        </DialogHeader>
        <EditForm
          conciliacao={conciliacao}
          onSubmit={handleSubmit}
          isPending={updateConciliacao.isPending}
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateConciliacao.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="edit-conciliacao-form"
            disabled={updateConciliacao.isPending}
            onClick={() => {
              const form = document.querySelector("form");
              form?.requestSubmit();
            }}
          >
            {updateConciliacao.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
