import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Plus, FileText } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  matricula: z.string().min(1, "Informe a matrícula"),
  tipo: z.string().min(1, "Selecione o tipo de registro"),
  livro: z.string().min(1, "Informe o livro"),
  folha: z.string().min(1, "Informe a folha"),
  parteTransmitente: z.string().optional(),
  parteAdquirente: z.string().optional(),
  descricaoImovel: z.string().optional(),
  valor: z.string().optional(),
  taxa: z.string().optional(),
  responsavel: z.string().min(1, "Selecione o responsável"),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const tiposRegistro = [
  { value: "registro", label: "Registro" },
  { value: "averbacao", label: "Averbação" },
  { value: "cancelamento", label: "Cancelamento" },
  { value: "certidao", label: "Certidão" },
  { value: "busca", label: "Busca" },
  { value: "prenotacao", label: "Prenotação" },
];

const livros = [
  { value: "2-R", label: "Livro 2-R (Registro Geral)" },
  { value: "2-AV", label: "Livro 2-AV (Averbações)" },
  { value: "3-AUX", label: "Livro 3 Auxiliar" },
  { value: "4-IND", label: "Livro 4 (Indicador Real)" },
  { value: "5-IND", label: "Livro 5 (Indicador Pessoal)" },
];

const responsaveis = [
  { value: "dr_carlos", label: "Dr. Carlos" },
  { value: "dra_ana", label: "Dra. Ana" },
  { value: "dra_lucia", label: "Dra. Lucia" },
  { value: "escrevente_paula", label: "Escrevente Paula" },
  { value: "escrevente_marcos", label: "Escrevente Marcos" },
];

interface NovoRegistroDialogProps {
  onRegistroCriado?: (registro: FormData) => void;
}

export function NovoRegistroDialog({ onRegistroCriado }: NovoRegistroDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      matricula: "",
      tipo: "",
      livro: "",
      folha: "",
      parteTransmitente: "",
      parteAdquirente: "",
      descricaoImovel: "",
      valor: "",
      taxa: "",
      responsavel: "",
      observacoes: "",
    },
  });

  const tipoSelecionado = form.watch("tipo");

  const onSubmit = (data: FormData) => {
    console.log("Novo registro:", data);
    toast.success("Registro criado com sucesso!");
    onRegistroCriado?.(data);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Registro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Novo Registro de Imóvel
          </DialogTitle>
          <DialogDescription>
            Cadastre um novo registro, averbação ou certidão.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Linha 1: Matrícula e Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="matricula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matrícula *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 45.678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Registro *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tiposRegistro.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Linha 2: Livro e Folha */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="livro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Livro *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o livro" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {livros.map((livro) => (
                          <SelectItem key={livro.value} value={livro.value}>
                            {livro.label}
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
                name="folha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Folha *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 245" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Partes (condicional) */}
            {(tipoSelecionado === "registro" || tipoSelecionado === "averbacao") && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="parteTransmitente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transmitente</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do transmitente" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Quem transmite o imóvel
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parteAdquirente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adquirente</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do adquirente" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Quem adquire o imóvel
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Descrição do Imóvel */}
            <FormField
              control={form.control}
              name="descricaoImovel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Imóvel</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Apartamento 101, Bloco A, Condomínio Exemplo..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Linha: Valor, Taxa e Responsável */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do Ato</FormLabel>
                    <FormControl>
                      <Input placeholder="R$ 0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa</FormLabel>
                    <FormControl>
                      <Input placeholder="R$ 0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsavel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {responsaveis.map((resp) => (
                          <SelectItem key={resp.value} value={resp.value}>
                            {resp.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Observações */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Criar Registro</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
