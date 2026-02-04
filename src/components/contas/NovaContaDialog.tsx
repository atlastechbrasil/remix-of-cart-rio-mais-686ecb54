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
import { Switch } from "@/components/ui/switch";
import { Plus, Landmark, Loader2 } from "lucide-react";
import { useCreateContaBancaria, TipoConta } from "@/hooks/useConciliacao";

const formSchema = z.object({
  banco: z.string().min(1, "Selecione o banco"),
  agencia: z.string().min(1, "Informe a agência").max(10, "Agência inválida"),
  conta: z.string().min(1, "Informe a conta").max(20, "Conta inválida"),
  tipo: z.enum(["corrente", "poupanca", "investimento"], {
    required_error: "Selecione o tipo de conta",
  }),
  saldoInicial: z.string().optional(),
  ativo: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

const bancos = [
  { codigo: "001", nome: "Banco do Brasil" },
  { codigo: "033", nome: "Santander" },
  { codigo: "104", nome: "Caixa Econômica Federal" },
  { codigo: "237", nome: "Bradesco" },
  { codigo: "341", nome: "Itaú Unibanco" },
  { codigo: "422", nome: "Banco Safra" },
  { codigo: "745", nome: "Citibank" },
  { codigo: "756", nome: "Sicoob" },
  { codigo: "748", nome: "Sicredi" },
  { codigo: "077", nome: "Banco Inter" },
  { codigo: "260", nome: "Nubank" },
  { codigo: "336", nome: "C6 Bank" },
];

const tiposConta: { value: TipoConta; label: string }[] = [
  { value: "corrente", label: "Conta Corrente" },
  { value: "poupanca", label: "Poupança" },
  { value: "investimento", label: "Investimento" },
];

export function NovaContaDialog() {
  const [open, setOpen] = useState(false);
  const createConta = useCreateContaBancaria();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      banco: "",
      agencia: "",
      conta: "",
      tipo: "corrente",
      saldoInicial: "",
      ativo: true,
    },
  });

  const onSubmit = (data: FormData) => {
    const saldoInicial = data.saldoInicial
      ? parseFloat(data.saldoInicial.replace(/\./g, "").replace(",", "."))
      : 0;

    createConta.mutate(
      {
        banco: data.banco,
        agencia: data.agencia,
        conta: data.conta,
        tipo: data.tipo,
        saldo: saldoInicial,
        ativo: data.ativo,
      },
      {
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-primary" />
            Nova Conta Bancária
          </DialogTitle>
          <DialogDescription>
            Cadastre uma nova conta bancária para realizar a conciliação.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="banco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banco</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o banco" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bancos.map((banco) => (
                        <SelectItem key={banco.codigo} value={banco.nome}>
                          {banco.codigo} - {banco.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="agencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agência</FormLabel>
                    <FormControl>
                      <Input placeholder="0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta</FormLabel>
                    <FormControl>
                      <Input placeholder="00000-0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Conta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tiposConta.map((tipo) => (
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

              <FormField
                control={form.control}
                name="saldoInicial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo Inicial</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="R$ 0,00"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Opcional
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Conta Ativa</FormLabel>
                    <FormDescription className="text-xs">
                      Contas inativas não aparecem na conciliação
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
              <Button type="submit" disabled={createConta.isPending}>
                {createConta.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Cadastrar Conta
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
