import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCreateLancamento, TipoLancamento, StatusLancamento } from "@/hooks/useConciliacao";

const lancamentoSchema = z.object({
  tipo: z.enum(["receita", "despesa"], {
    required_error: "Selecione o tipo de lançamento",
  }),
  descricao: z
    .string()
    .trim()
    .min(3, { message: "Descrição deve ter no mínimo 3 caracteres" })
    .max(200, { message: "Descrição deve ter no máximo 200 caracteres" }),
  valor: z
    .string()
    .trim()
    .min(1, { message: "Valor é obrigatório" })
    .refine(
      (val) => {
        const num = parseFloat(val.replace(/\./g, "").replace(",", "."));
        return !isNaN(num) && num > 0;
      },
      { message: "Valor deve ser maior que zero" }
    ),
  data: z.date({
    required_error: "Data é obrigatória",
  }),
  categoria: z.string().min(1, { message: "Categoria é obrigatória" }),
  responsavel: z.string().optional(),
  status: z.enum(["pago", "pendente", "agendado"], {
    required_error: "Status é obrigatório",
  }),
  observacoes: z
    .string()
    .max(500, { message: "Observação deve ter no máximo 500 caracteres" })
    .optional(),
});

type LancamentoFormData = z.infer<typeof lancamentoSchema>;

const categoriasReceita = [
  "Registro",
  "Averbação",
  "Certidão",
  "Busca",
  "Prenotação",
  "Outros Atos",
];

const categoriasDespesa = [
  "Pessoal",
  "Material",
  "Utilidades",
  "Infraestrutura",
  "Impostos",
  "Manutenção",
  "Outros",
];

interface NovoLancamentoDialogProps {
  trigger?: React.ReactNode;
}

export function NovoLancamentoDialog({ trigger }: NovoLancamentoDialogProps) {
  const [open, setOpen] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoLancamento>("receita");
  const createLancamento = useCreateLancamento();

  const form = useForm<LancamentoFormData>({
    resolver: zodResolver(lancamentoSchema),
    defaultValues: {
      tipo: "receita",
      descricao: "",
      valor: "",
      categoria: "",
      responsavel: "",
      status: "pendente",
      observacoes: "",
    },
  });

  const categorias = tipoSelecionado === "receita" ? categoriasReceita : categoriasDespesa;

  const formatCurrency = (value: string) => {
    let cleaned = value.replace(/[^\d,]/g, "");
    const parts = cleaned.split(",");
    if (parts.length > 2) {
      cleaned = parts[0] + "," + parts.slice(1).join("");
    }
    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = parts[0] + "," + parts[1].substring(0, 2);
    }
    return cleaned;
  };

  const onSubmit = (data: LancamentoFormData) => {
    const valorNumerico = parseFloat(data.valor.replace(/\./g, "").replace(",", "."));

    createLancamento.mutate(
      {
        tipo: data.tipo as TipoLancamento,
        descricao: data.descricao,
        valor: valorNumerico,
        data: format(data.data, "yyyy-MM-dd"),
        categoria: data.categoria,
        responsavel: data.responsavel || null,
        status: data.status as StatusLancamento,
        observacoes: data.observacoes || null,
        status_conciliacao: "pendente",
        extrato_item_vinculado_id: null,
      },
      {
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
      }
    );
  };

  const handleTipoChange = (tipo: TipoLancamento) => {
    setTipoSelecionado(tipo);
    form.setValue("tipo", tipo);
    form.setValue("categoria", "");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Lançamento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Lançamento Financeiro</DialogTitle>
          <DialogDescription>
            Preencha os dados para registrar uma nova receita ou despesa.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Tipo de Lançamento */}
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Lançamento</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => handleTipoChange(value as TipoLancamento)}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div
                        className={cn(
                          "flex-1 flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                          tipoSelecionado === "receita"
                            ? "border-success bg-success/5"
                            : "border-border hover:border-success/50"
                        )}
                        onClick={() => handleTipoChange("receita")}
                      >
                        <RadioGroupItem value="receita" id="receita" />
                        <Label htmlFor="receita" className="cursor-pointer flex-1">
                          <span className="font-medium text-success">Receita</span>
                          <p className="text-xs text-muted-foreground">
                            Entrada de valores
                          </p>
                        </Label>
                      </div>
                      <div
                        className={cn(
                          "flex-1 flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                          tipoSelecionado === "despesa"
                            ? "border-destructive bg-destructive/5"
                            : "border-border hover:border-destructive/50"
                        )}
                        onClick={() => handleTipoChange("despesa")}
                      >
                        <RadioGroupItem value="despesa" id="despesa" />
                        <Label htmlFor="despesa" className="cursor-pointer flex-1">
                          <span className="font-medium text-destructive">Despesa</span>
                          <p className="text-xs text-muted-foreground">
                            Saída de valores
                          </p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição e Valor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Registro de Imóvel - Matrícula 45.678"
                        {...field}
                        maxLength={200}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          R$
                        </span>
                        <Input
                          placeholder="0,00"
                          className="pl-10"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatCurrency(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Categoria e Responsável */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categorias.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="agendado">Agendado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Responsável */}
            <FormField
              control={form.control}
              name="responsavel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome do responsável"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Observação */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais sobre o lançamento..."
                      className="resize-none"
                      rows={3}
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createLancamento.isPending}
                className={cn(
                  tipoSelecionado === "receita"
                    ? "bg-success hover:bg-success/90"
                    : "bg-destructive hover:bg-destructive/90"
                )}
              >
                {createLancamento.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Registrar {tipoSelecionado === "receita" ? "Receita" : "Despesa"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
