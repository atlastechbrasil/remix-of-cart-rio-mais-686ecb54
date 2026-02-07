import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Sparkles,
  Check,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { findPerfectMatches } from "@/lib/conciliacao-matcher";
import type { ExtratoItem, Lancamento } from "@/types/conciliacao";

interface AutoConciliacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extratoItens: ExtratoItem[];
  lancamentos: Lancamento[];
  onConfirm: (
    matches: Array<{ extratoItem: ExtratoItem; lancamento: Lancamento }>
  ) => Promise<void>;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

interface MatchListItemProps {
  extratoItem: ExtratoItem;
  lancamento: Lancamento;
  onRemove?: () => void;
}

function MatchListItem({ extratoItem, lancamento, onRemove }: MatchListItemProps) {
  return (
    <div className="p-3 border rounded-lg bg-muted/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0 space-y-3">
          {/* Extrato */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="text-xs shrink-0">
                Extrato
              </Badge>
              <span
                className={`text-sm font-medium shrink-0 ${
                  extratoItem.tipo === "credito" ? "text-success" : "text-destructive"
                }`}
              >
                {formatCurrency(Math.abs(extratoItem.valor))}
              </span>
            </div>
            <p className="text-sm break-words leading-snug">{extratoItem.descricao}</p>
          </div>

          {/* Lançamento */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="text-xs shrink-0">
                Sistema
              </Badge>
              <span className="text-sm font-medium shrink-0 text-primary">
                {formatCurrency(lancamento.valor)}
              </span>
            </div>
            <p className="text-sm break-words leading-snug">{lancamento.descricao}</p>
          </div>

          <div className="text-xs text-muted-foreground">
            {format(new Date(extratoItem.data_transacao), "dd/MM/yyyy", {
              locale: ptBR,
            })}
          </div>
        </div>

        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function DialogContentInner({
  matches,
  excludedMatches,
  onRemove,
  onConfirm,
  isProcessing,
  progress,
}: {
  matches: Array<{ extratoItem: ExtratoItem; lancamento: Lancamento }>;
  excludedMatches: Set<string>;
  onRemove: (extratoId: string) => void;
  onConfirm: () => void;
  isProcessing: boolean;
  progress: number;
}) {
  const activeMatches = matches.filter(
    (m) => !excludedMatches.has(m.extratoItem.id)
  );

  if (isProcessing) {
    return (
      <div className="py-8 text-center space-y-4">
        <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
        <div className="space-y-2">
          <p className="text-sm font-medium">Processando conciliações...</p>
          <Progress value={progress} className="w-48 mx-auto" />
          <p className="text-xs text-muted-foreground">
            {Math.round(progress)}% concluído
          </p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">Nenhum match perfeito encontrado</p>
        <p className="text-sm mt-1">
          Não há itens com valor e data exatos para auto-conciliar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Encontrados <span className="font-medium text-foreground">{activeMatches.length}</span>{" "}
          matches perfeitos
        </p>
        {excludedMatches.size > 0 && (
          <Badge variant="secondary">{excludedMatches.size} removidos</Badge>
        )}
      </div>

      <ScrollArea className="h-[300px] pr-2">
        <div className="space-y-2">
          {matches.map((match) => {
            const isExcluded = excludedMatches.has(match.extratoItem.id);
            if (isExcluded) return null;

            return (
              <div key={match.extratoItem.id}>
                <MatchListItem
                  extratoItem={match.extratoItem}
                  lancamento={match.lancamento}
                  onRemove={() => onRemove(match.extratoItem.id)}
                />
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg text-success">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <p className="text-sm">
          Valor e data exatos - estes itens serão conciliados automaticamente.
        </p>
      </div>
    </div>
  );
}

export function AutoConciliacaoDialog({
  open,
  onOpenChange,
  extratoItens,
  lancamentos,
  onConfirm,
}: AutoConciliacaoDialogProps) {
  const isMobile = useIsMobile();
  const [excludedMatches, setExcludedMatches] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Find perfect matches
  const matches = findPerfectMatches(extratoItens, lancamentos);
  const activeMatches = matches.filter(
    (m) => !excludedMatches.has(m.extratoItem.id)
  );

  const handleRemove = (extratoId: string) => {
    setExcludedMatches((prev) => new Set([...prev, extratoId]));
  };

  const handleConfirm = async () => {
    if (activeMatches.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate progress for each item
      for (let i = 0; i < activeMatches.length; i++) {
        setProgress(((i + 1) / activeMatches.length) * 100);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await onConfirm(activeMatches);
      onOpenChange(false);
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setExcludedMatches(new Set());
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isProcessing) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setExcludedMatches(new Set());
      }
    }
  };

  const Footer = () => (
    <div className="flex gap-2 justify-end">
      <Button
        variant="outline"
        onClick={() => handleOpenChange(false)}
        disabled={isProcessing}
      >
        Cancelar
      </Button>
      <Button
        onClick={handleConfirm}
        disabled={activeMatches.length === 0 || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <Check className="w-4 h-4 mr-2" />
            Conciliar {activeMatches.length} itens
          </>
        )}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-warning" />
              Auto-Conciliação
            </DrawerTitle>
            <DrawerDescription>
              Conciliar automaticamente itens com valor e data exatos
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-2">
            <DialogContentInner
              matches={matches}
              excludedMatches={excludedMatches}
              onRemove={handleRemove}
              onConfirm={handleConfirm}
              isProcessing={isProcessing}
              progress={progress}
            />
          </div>
          <DrawerFooter>
            <Footer />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-warning" />
            Auto-Conciliação
          </DialogTitle>
          <DialogDescription>
            Conciliar automaticamente itens com valor e data exatos
          </DialogDescription>
        </DialogHeader>
        <DialogContentInner
          matches={matches}
          excludedMatches={excludedMatches}
          onRemove={handleRemove}
          onConfirm={handleConfirm}
          isProcessing={isProcessing}
          progress={progress}
        />
        <DialogFooter>
          <Footer />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
