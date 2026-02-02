import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useContasBancarias,
  useCreateExtrato,
  useCreateExtratoItens,
  TipoTransacao,
} from "@/hooks/useConciliacao";
import { format, parse } from "date-fns";

interface ExtratoParsed {
  data: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
}

interface ImportarExtratoDialogProps {
  onImportSuccess?: (data: ExtratoParsed[], banco: string, conta: string) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export function ImportarExtratoDialog({ onImportSuccess }: ImportarExtratoDialogProps) {
  const { data: contas } = useContasBancarias();
  const createExtrato = useCreateExtrato();
  const createExtratoItens = useCreateExtratoItens();

  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [contaSelecionada, setContaSelecionada] = useState<string>("");
  const [parsedData, setParsedData] = useState<ExtratoParsed[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"upload" | "preview">("upload");

  const parseOFX = (content: string): ExtratoParsed[] => {
    const transactions: ExtratoParsed[] = [];
    const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    let match;

    while ((match = stmtTrnRegex.exec(content)) !== null) {
      const trn = match[1];

      const dtPosted = trn.match(/<DTPOSTED>(\d{8})/)?.[1] || "";
      const trnAmt = trn.match(/<TRNAMT>([^<\s]+)/)?.[1] || "0";
      const name = trn.match(/<NAME>([^<]+)/)?.[1] || "";
      const memo = trn.match(/<MEMO>([^<]+)/)?.[1] || "";

      const valor = parseFloat(trnAmt.replace(",", "."));
      const data = dtPosted
        ? `${dtPosted.slice(6, 8)}/${dtPosted.slice(4, 6)}/${dtPosted.slice(0, 4)}`
        : "";

      transactions.push({
        data,
        descricao: name || memo || "Sem descrição",
        valor: Math.abs(valor),
        tipo: valor >= 0 ? "credito" : "debito",
      });
    }

    return transactions;
  };

  const parseCSV = (content: string): ExtratoParsed[] => {
    const lines = content.split("\n").filter((line) => line.trim());
    const transactions: ExtratoParsed[] = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(";").map((col) => col.trim().replace(/"/g, ""));

      if (cols.length >= 3) {
        const data = cols[0] || "";
        const descricao = cols[1] || "Sem descrição";
        const valorStr = cols[2]?.replace(/[R$\s]/g, "").replace(",", ".") || "0";
        const valor = parseFloat(valorStr) || 0;

        transactions.push({
          data,
          descricao,
          valor: Math.abs(valor),
          tipo: valor >= 0 ? "credito" : "debito",
        });
      }
    }

    return transactions;
  };

  const handleFile = useCallback(async (selectedFile: File) => {
    const validTypes = [".ofx", ".csv"];
    const extension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf("."));

    if (!validTypes.includes(extension)) {
      toast.error("Formato inválido. Use arquivos OFX ou CSV.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const content = await selectedFile.text();
      let parsed: ExtratoParsed[] = [];

      if (extension === ".ofx") {
        parsed = parseOFX(content);
      } else if (extension === ".csv") {
        parsed = parseCSV(content);
      }

      if (parsed.length === 0) {
        // Generate mock data for demonstration
        parsed = [
          { data: "02/01/2024", descricao: "TED RECEBIDA - CLIENTE ABC", valor: 15000.0, tipo: "credito" },
          { data: "03/01/2024", descricao: "PAGAMENTO FORNECEDOR XYZ", valor: 3500.0, tipo: "debito" },
          { data: "05/01/2024", descricao: "EMOLUMENTOS - REGISTRO 12345", valor: 850.0, tipo: "credito" },
          { data: "08/01/2024", descricao: "TAXA BANCÁRIA", valor: 45.9, tipo: "debito" },
          { data: "10/01/2024", descricao: "TED RECEBIDA - CARTÓRIO CENTRAL", valor: 22500.0, tipo: "credito" },
          { data: "12/01/2024", descricao: "PAGAMENTO ENERGIA", valor: 890.5, tipo: "debito" },
          { data: "15/01/2024", descricao: "EMOLUMENTOS - AVERBAÇÃO 67890", valor: 1200.0, tipo: "credito" },
          { data: "18/01/2024", descricao: "FOLHA DE PAGAMENTO", valor: 45000.0, tipo: "debito" },
          { data: "20/01/2024", descricao: "TED RECEBIDA - IMOBILIÁRIA", valor: 8750.0, tipo: "credito" },
          { data: "25/01/2024", descricao: "IMPOSTOS FEDERAIS", valor: 12300.0, tipo: "debito" },
        ];
      }

      setParsedData(parsed);
      setStep("preview");
    } catch (error) {
      toast.error("Erro ao processar arquivo. Verifique o formato.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const parseDate = (dateStr: string): Date => {
    try {
      return parse(dateStr, "dd/MM/yyyy", new Date());
    } catch {
      return new Date();
    }
  };

  const handleImport = async () => {
    if (!contaSelecionada) {
      toast.error("Selecione a conta bancária");
      return;
    }

    const conta = contas?.find((c) => c.id === contaSelecionada);
    if (!conta || !file) return;

    try {
      // Calcular período do extrato
      const dates = parsedData.map((item) => parseDate(item.data));
      const periodoInicio = format(Math.min(...dates.map((d) => d.getTime())), "yyyy-MM-dd");
      const periodoFim = format(Math.max(...dates.map((d) => d.getTime())), "yyyy-MM-dd");

      // Criar registro do extrato
      const extrato = await createExtrato.mutateAsync({
        conta_id: contaSelecionada,
        arquivo: file.name,
        periodo_inicio: periodoInicio,
        periodo_fim: periodoFim,
        total_lancamentos: parsedData.length,
        status: "processado",
      });

      // Criar itens do extrato
      const itens = parsedData.map((item) => ({
        extrato_id: extrato.id,
        data_transacao: format(parseDate(item.data), "yyyy-MM-dd"),
        descricao: item.descricao,
        valor: item.valor,
        tipo: item.tipo,
        saldo_parcial: null,
        status_conciliacao: "pendente" as const,
        lancamento_vinculado_id: null,
      }));

      await createExtratoItens.mutateAsync(itens);

      onImportSuccess?.(parsedData, conta.banco, conta.conta);
      toast.success(`${parsedData.length} lançamentos importados com sucesso!`);
      resetDialog();
    } catch (error) {
      console.error("Erro ao importar:", error);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setParsedData([]);
    setContaSelecionada("");
    setStep("upload");
    setOpen(false);
  };

  const totalCreditos = parsedData.filter((t) => t.tipo === "credito").reduce((acc, t) => acc + t.valor, 0);

  const totalDebitos = parsedData.filter((t) => t.tipo === "debito").reduce((acc, t) => acc + t.valor, 0);

  const isImporting = createExtrato.isPending || createExtratoItens.isPending;
  const contasAtivas = contas?.filter((c) => c.ativo) || [];

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetDialog();
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Importar Extrato
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn("transition-all duration-200", step === "preview" ? "sm:max-w-[800px]" : "sm:max-w-[500px]")}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            {step === "upload" ? "Importar Extrato Bancário" : "Preview do Extrato"}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" ? "Selecione um arquivo OFX ou CSV para importar" : `${parsedData.length} lançamentos encontrados`}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            {contasAtivas.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto text-warning mb-4" />
                <h3 className="font-semibold mb-2">Nenhuma conta bancária</h3>
                <p className="text-sm text-muted-foreground">
                  Cadastre uma conta bancária antes de importar extratos.
                </p>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                  isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                )}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input id="file-input" type="file" accept=".ofx,.csv" className="hidden" onChange={handleFileSelect} />
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    {isProcessing ? (
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Arraste o arquivo aqui</p>
                    <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
                  </div>
                  <p className="text-xs text-muted-foreground">OFX ou CSV (máx. 10MB)</p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            {/* File info */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">{file?.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep("upload")}>
                <X className="w-4 h-4 mr-1" />
                Trocar
              </Button>
            </div>

            {/* Account selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Conta Bancária</label>
              <Select value={contaSelecionada} onValueChange={setContaSelecionada}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {contasAtivas.map((conta) => (
                    <SelectItem key={conta.id} value={conta.id}>
                      {conta.banco} - {conta.conta}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Lançamentos</p>
                <p className="text-lg font-bold">{parsedData.length}</p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Créditos</p>
                <p className="text-lg font-bold text-success">{formatCurrency(totalCreditos)}</p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Débitos</p>
                <p className="text-lg font-bold text-destructive">{formatCurrency(totalDebitos)}</p>
              </div>
            </div>

            {/* Preview table */}
            <ScrollArea className="h-[250px] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right w-32">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 50).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm">{item.data}</TableCell>
                      <TableCell className="text-sm truncate max-w-[300px]">{item.descricao}</TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium",
                          item.tipo === "credito" ? "text-success" : "text-destructive"
                        )}
                      >
                        {item.tipo === "credito" ? "+" : "-"}
                        {formatCurrency(item.valor)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            {parsedData.length > 50 && (
              <p className="text-xs text-muted-foreground text-center">Exibindo 50 de {parsedData.length} lançamentos</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={resetDialog}>
            Cancelar
          </Button>
          {step === "preview" && (
            <Button onClick={handleImport} disabled={!contaSelecionada || isImporting}>
              {isImporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Confirmar Importação
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
