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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePerfisAcesso } from "@/hooks/useUsuarios";
import { useCartorios } from "@/hooks/useCartorios";
import { useTenant } from "@/contexts/TenantContext";
import { Loader2, Eye, EyeOff, Building2, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type AppRole = Database["public"]["Enums"]["app_role"];

interface CartorioVinculo {
  cartorioId: string;
  cartorioNome: string;
  role: AppRole;
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  financeiro: "Financeiro",
  operacional: "Operacional",
};

interface NovoUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoUsuarioDialog({ open, onOpenChange }: NovoUsuarioDialogProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [cargo, setCargo] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Cartórios selecionados
  const [vinculos, setVinculos] = useState<CartorioVinculo[]>([]);
  const [cartorioSelecionado, setCartorioSelecionado] = useState("");
  const [roleSelecionado, setRoleSelecionado] = useState<AppRole>("operacional");

  const { cartorioAtivo, isSuperAdmin } = useTenant();
  const { data: cartorios = [] } = useCartorios();
  const { data: perfis = [] } = usePerfisAcesso();

  // Cartórios disponíveis para adicionar
  const cartoriosDisponiveis = cartorios.filter(
    (c) => !vinculos.some((v) => v.cartorioId === c.id)
  );

  const resetForm = () => {
    setNome("");
    setEmail("");
    setSenha("");
    setConfirmarSenha("");
    setCargo("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setVinculos([]);
    setCartorioSelecionado("");
    setRoleSelecionado("operacional");
  };

  // Quando abre o dialog, adicionar cartório ativo por padrão (para não-super-admins)
  React.useEffect(() => {
    if (open && cartorioAtivo && !isSuperAdmin && vinculos.length === 0) {
      setVinculos([{
        cartorioId: cartorioAtivo.id,
        cartorioNome: cartorioAtivo.nome,
        role: "operacional",
      }]);
    }
  }, [open, cartorioAtivo, isSuperAdmin]);

  const handleAddVinculo = () => {
    if (!cartorioSelecionado) return;
    
    const cartorio = cartorios.find((c) => c.id === cartorioSelecionado);
    if (!cartorio) return;

    setVinculos([
      ...vinculos,
      {
        cartorioId: cartorio.id,
        cartorioNome: cartorio.nome,
        role: roleSelecionado,
      },
    ]);
    setCartorioSelecionado("");
    setRoleSelecionado("operacional");
  };

  const handleRemoveVinculo = (cartorioId: string) => {
    setVinculos(vinculos.filter((v) => v.cartorioId !== cartorioId));
  };

  const handleUpdateVinculoRole = (cartorioId: string, newRole: AppRole) => {
    setVinculos(
      vinculos.map((v) =>
        v.cartorioId === cartorioId ? { ...v, role: newRole } : v
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!nome.trim()) {
      toast.error("O nome é obrigatório");
      return;
    }

    if (!email.trim()) {
      toast.error("O e-mail é obrigatório");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Digite um e-mail válido");
      return;
    }

    if (senha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (senha !== confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (vinculos.length === 0) {
      toast.error("Selecione pelo menos um cartório");
      return;
    }

    setIsCreating(true);

    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome: nome.trim(),
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          toast.error("Este e-mail já está cadastrado no sistema");
        } else {
          toast.error("Erro ao criar usuário: " + authError.message);
        }
        return;
      }

      if (!authData.user) {
        toast.error("Erro ao criar usuário: nenhum usuário retornado");
        return;
      }

      // Atualizar o profile com o cargo se fornecido
      if (cargo.trim()) {
        await supabase
          .from("profiles")
          .update({ cargo: cargo.trim() })
          .eq("user_id", authData.user.id);
      }

      // Vincular aos cartórios selecionados
      for (const vinculo of vinculos) {
        const { error: vinculoError } = await supabase
          .from("cartorio_usuarios")
          .insert({
            user_id: authData.user.id,
            cartorio_id: vinculo.cartorioId,
            role: vinculo.role,
            ativo: true,
          });

        if (vinculoError) {
          console.error("Erro ao vincular cartório:", vinculoError);
        }
      }

      toast.success("Usuário criado e vinculado com sucesso!");
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      toast.error("Erro ao criar usuário: " + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo usuário e definir seus acessos.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <form id="novo-usuario-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Informações básicas */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  placeholder="Digite o nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha *</Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                  <div className="relative">
                    <Input
                      id="confirmarSenha"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repita a senha"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  placeholder="Ex: Gerente Financeiro"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                />
              </div>
            </div>

            {/* Seção de Cartórios */}
            <div className="space-y-3 pt-4 border-t">
              <Label>Cartórios e Perfis de Acesso *</Label>
              
              {/* Vínculos adicionados */}
              {vinculos.length > 0 && (
                <div className="space-y-2">
                  {vinculos.map((vinculo) => (
                    <div
                      key={vinculo.cartorioId}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-lg border bg-muted/30"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">{vinculo.cartorioNome}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Select
                          value={vinculo.role}
                          onValueChange={(v) => handleUpdateVinculoRole(vinculo.cartorioId, v as AppRole)}
                        >
                          <SelectTrigger className="h-8 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="financeiro">Financeiro</SelectItem>
                            <SelectItem value="operacional">Operacional</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveVinculo(vinculo.cartorioId)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionar cartório */}
              {isSuperAdmin && cartoriosDisponiveis.length > 0 && (
                <div className="flex items-center gap-2">
                  <Select value={cartorioSelecionado} onValueChange={setCartorioSelecionado}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione um cartório" />
                    </SelectTrigger>
                    <SelectContent>
                      {cartoriosDisponiveis.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={roleSelecionado} onValueChange={(v) => setRoleSelecionado(v as AppRole)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="operacional">Operacional</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddVinculo}
                    disabled={!cartorioSelecionado}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {isSuperAdmin && cartoriosDisponiveis.length === 0 && vinculos.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Todos os cartórios foram adicionados.
                </p>
              )}

              {!isSuperAdmin && vinculos.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  O usuário será vinculado ao cartório atual. Super administradores podem adicionar a múltiplos cartórios.
                </p>
              )}

              {vinculos.length === 0 && (
                <p className="text-xs text-destructive">
                  Adicione pelo menos um cartório para o usuário.
                </p>
              )}
            </div>

            {/* Perfis de acesso disponíveis (informativo) */}
            {perfis.length > 0 && (
              <div className="space-y-2 pt-2">
                <Label className="text-xs text-muted-foreground">Perfis disponíveis no cartório</Label>
                <div className="flex flex-wrap gap-1.5">
                  {perfis.map((perfil) => (
                    <Badge key={perfil.id} variant="secondary" className="text-xs">
                      {perfil.nome}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Perfis personalizados podem ser atribuídos após a criação do usuário.
                </p>
              </div>
            )}
          </form>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t mt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="novo-usuario-form"
            disabled={isCreating || vinculos.length === 0}
          >
            {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Criar Usuário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
