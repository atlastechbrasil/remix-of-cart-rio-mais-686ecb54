import * as React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCartorio, type Cartorio } from "@/hooks/useCartorios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditarCartorioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartorio: Cartorio | null;
}

export function EditarCartorioDialog({ open, onOpenChange, cartorio }: EditarCartorioDialogProps) {
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");

  const updateCartorio = useUpdateCartorio();

  // Populate form when cartorio changes
  useEffect(() => {
    if (cartorio) {
      setNome(cartorio.nome || "");
      setCnpj(cartorio.cnpj || "");
      setEmail(cartorio.email || "");
      setTelefone(cartorio.telefone || "");
      setEndereco(cartorio.endereco || "");
    }
  }, [cartorio]);

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 14);
    }
    return numbers
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cartorio) return;

    if (!nome.trim()) {
      toast.error("O nome do cartório é obrigatório");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Digite um e-mail válido");
      return;
    }

    try {
      await updateCartorio.mutateAsync({
        id: cartorio.id,
        nome: nome.trim(),
        cnpj: cnpj.trim() || null,
        email: email.trim() || null,
        telefone: telefone.trim() || null,
        endereco: endereco.trim() || null,
      });

      onOpenChange(false);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Cartório</DialogTitle>
          <DialogDescription>
            Atualize os dados do cartório.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-nome">Nome do Cartório *</Label>
            <Input
              id="edit-nome"
              placeholder="Ex: 1º Cartório de Registro de Imóveis"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-cnpj">CNPJ</Label>
              <Input
                id="edit-cnpj"
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                maxLength={18}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-telefone">Telefone</Label>
              <Input
                id="edit-telefone"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                maxLength={15}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">E-mail</Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="contato@cartorio.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-endereco">Endereço</Label>
            <Textarea
              id="edit-endereco"
              placeholder="Rua, número, bairro, cidade - UF, CEP"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateCartorio.isPending}>
              {updateCartorio.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
