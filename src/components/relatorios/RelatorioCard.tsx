import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface RelatorioCardProps {
  titulo: string;
  descricao: string;
  tipo: string;
  icon: LucideIcon;
  onGerar: () => void;
  onExport?: () => void;
  onPrint?: () => void;
}

export function RelatorioCard({
  titulo,
  descricao,
  tipo,
  icon: Icon,
  onGerar,
  onExport,
  onPrint,
}: RelatorioCardProps) {
  return (
    <Card className="cursor-pointer hover:border-primary/30 hover:shadow-md transition-all">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-start justify-between">
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex gap-1">
            {onExport && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onExport();
                }}
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            )}
            {onPrint && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 hidden sm:flex"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrint();
                }}
              >
                <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            )}
          </div>
        </div>
        <CardTitle className="text-sm sm:text-base mt-2 sm:mt-3">{titulo}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">{descricao}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground capitalize">{tipo}</span>
          <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm" onClick={onGerar}>
            Gerar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
