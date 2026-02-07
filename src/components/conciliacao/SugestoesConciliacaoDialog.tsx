import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Lightbulb,
  Check,
  Loader2,
  TrendingUp,
  ArrowRightLeft,
  Calendar,
  FileText,
  Target,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  findMatchSuggestions,
  getScoreBgClass,
  getMatchQuality,
} from "@/lib/conciliacao-matcher";
import type { ExtratoItem, Lancamento, SugestaoConciliacao } from "@/types/conciliacao";

interface SugestoesConciliacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extratoItem: ExtratoItem | null;
  lancamentos: Lancamento[];
  onSelectSugestao: (lancamento: Lancamento) => void;
  isVinculando?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function SugestaoCard({
  sugestao,
  onSelect,
  isSelecting,
}: {
  sugestao: SugestaoConciliacao;
  onSelect: () => void;
  isSelecting: boolean;
}) {
  const { lancamento, score, motivos } = sugestao;
  const quality = getMatchQuality(score);

  return (
    <div className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={getScoreBgClass(score)}>
              <Target className="w-3 h-3 mr-1" />
              {score}%
            </Badge>
            <span className="text-xs text-muted-foreground capitalize">
              {quality === "excellent"
                ? "Excelente"
                : quality === "good"
                ? "Bom"
                : quality === "fair"
                ? "Razoável"
                : "Baixo"}
            </span>
          </div>

          <p className="font-medium text-sm truncate" title={lancamento.descricao}>
            {lancamento.descricao}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(lancamento.data), "dd/MM/yyyy", { locale: ptBR })}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {formatCurrency(lancamento.valor)}
            </span>
            {lancamento.categoria && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {lancamento.categoria}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
            {motivos.map((motivo, idx) => (
              <Badge key={idx} variant="outline" className="text-xs font-normal">
                {motivo}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          size="sm"
          onClick={onSelect}
          disabled={isSelecting}
          className="flex-shrink-0"
        >
          {isSelecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

function DialogContentInner({
  extratoItem,
  suggestions,
  onSelectSugestao,
  isVinculando,
}: {
  extratoItem: ExtratoItem | null;
  suggestions: SugestaoConciliacao[];
  onSelectSugestao: (lancamento: Lancamento) => void;
  isVinculando: boolean;
}) {
  if (!extratoItem) return null;

  return (
    <div className="space-y-4">
      {/* Selected extrato item info */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground mb-1">Item do extrato selecionado:</p>
        <p className="font-medium text-sm truncate">{extratoItem.descricao}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span>{format(new Date(extratoItem.data_transacao), "dd/MM/yyyy")}</span>
          <span
            className={
              extratoItem.tipo === "credito" ? "text-success" : "text-destructive"
            }
          >
            {extratoItem.tipo === "credito" ? "+" : "-"}
            {formatCurrency(Math.abs(extratoItem.valor))}
          </span>
        </div>
      </div>

      <Separator />

      {/* Suggestions list */}
      <div>
        <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-warning" />
          Sugestões de correspondência ({suggestions.length})
        </h4>

        {suggestions.length > 0 ? (
          <ScrollArea className="h-[300px] pr-2">
            <div className="space-y-2">
              {suggestions.map((sugestao) => (
                <div key={sugestao.lancamento.id}>
                  <SugestaoCard
                    sugestao={sugestao}
                    onSelect={() => onSelectSugestao(sugestao.lancamento)}
                    isSelecting={isVinculando}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ArrowRightLeft className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma sugestão encontrada</p>
            <p className="text-xs mt-1">
              Não há lançamentos compatíveis para este item do extrato.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SugestoesConciliacaoDialog({
  open,
  onOpenChange,
  extratoItem,
  lancamentos,
  onSelectSugestao,
  isVinculando = false,
}: SugestoesConciliacaoDialogProps) {
  const isMobile = useIsMobile();

  // Calculate suggestions
  const suggestions = extratoItem
    ? findMatchSuggestions(extratoItem, lancamentos)
    : [];

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-warning" />
              Sugestões de Match
            </DrawerTitle>
            <DrawerDescription>
              Lançamentos que podem corresponder ao item do extrato
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <DialogContentInner
              extratoItem={extratoItem}
              suggestions={suggestions}
              onSelectSugestao={onSelectSugestao}
              isVinculando={isVinculando}
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
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-warning" />
            Sugestões de Match
          </DialogTitle>
          <DialogDescription>
            Lançamentos que podem corresponder ao item do extrato
          </DialogDescription>
        </DialogHeader>
        <DialogContentInner
          extratoItem={extratoItem}
          suggestions={suggestions}
          onSelectSugestao={onSelectSugestao}
          isVinculando={isVinculando}
        />
      </DialogContent>
    </Dialog>
  );
}
