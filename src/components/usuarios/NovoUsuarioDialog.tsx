import * as React from "react";
import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCartorioUsuario } from "@/hooks/useUsuarios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface NovoUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoUsuarioDialog({ open, onOpenChange }: NovoUsuarioDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("operacional");
  const [isSearching, setIsSearching] = useState(false);
  const [foundUserId, setFoundUserId] = useState<string | null>(null);
  const [foundUserName, setFoundUserName] = useState<string | null>(null);

  const createUsuario = useCreateCartorioUsuario();

  const handleSearchUser = async () => {
    if (!email.trim()) {
      toast.error("Digite um e-mail para buscar");
      return;
    }

    setIsSearching(true);
    setFoundUserId(null);
    setFoundUserName(null);

    try {
      // Buscar usuário pelo profile (que contém o user_id)
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, nome")
        .limit(10);

      if (error) throw error;

      // Como não temos acesso direto ao email via profiles, 
      // precisamos de uma abordagem diferente
      // Por enquanto, informamos ao usuário que precisa do ID ou ajustar a busca
      
      toast.info("Para adicionar um usuário, ele precisa já ter uma conta no sistema. Use o ID do usuário se souber.");
      
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      toast.error("Erro ao buscar usuário");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Por simplicidade, vamos permitir adicionar pelo ID do usuário
    // Em uma implementação mais completa, seria necessário uma edge function
    if (!email.trim()) {
      toast.error("Digite o ID do usuário");
      return;
    }

    try {
      await createUsuario.mutateAsync({
        userId: email.trim(), // Usando o campo como ID por enquanto
        role,
      });
      
      setEmail("");
      setRole("operacional");
      setFoundUserId(null);
      setFoundUserName(null);
      onOpenChange(false);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleClose = () => {
    setEmail("");
    setRole("operacional");
    setFoundUserId(null);
    setFoundUserName(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Usuário ao Cartório</DialogTitle>
          <DialogDescription>
            Informe o ID do usuário (UUID) que deseja vincular a este cartório.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">ID do Usuário (UUID)</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                placeholder="Ex: 12345678-1234-1234-1234-123456789012"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              O usuário precisa ter uma conta no sistema. Peça o UUID ao administrador.
            </p>
          </div>

          {foundUserName && (
            <div className="p-3 bg-success/10 rounded-md">
              <p className="text-sm text-success">
                Usuário encontrado: <strong>{foundUserName}</strong>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Perfil de Acesso</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="operacional">Operacional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createUsuario.isPending}>
              {createUsuario.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
