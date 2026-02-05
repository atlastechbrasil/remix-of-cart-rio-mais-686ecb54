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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useUpdateProfile,
  useUpdateCartorioUsuario,
  useDeleteCartorioUsuario,
  useAddCartorioVinculo,
  type UsuarioAgregado,
} from "@/hooks/useUsuarios";
import { useCartorios } from "@/hooks/useCartorios";
import { Loader2, Trash2, Plus, Building2, Key, User, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type AppRole = Database["public"]["Enums"]["app_role"];

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  financeiro: "Financeiro",
  operacional: "Operacional",
};

interface EditarUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: UsuarioAgregado | null;
}

export function EditarUsuarioDialog({
  open,
  onOpenChange,
  usuario,
}: EditarUsuarioDialogProps) {
  const [activeTab, setActiveTab] = useState("info");
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Password reset
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  // Novo vínculo
  const [novoCartorioId, setNovoCartorioId] = useState("");
  const [novoRole, setNovoRole] = useState<AppRole>("operacional");

  const updateProfile = useUpdateProfile();
  const updateVinculo = useUpdateCartorioUsuario();
  const deleteVinculo = useDeleteCartorioUsuario();
  const addVinculo = useAddCartorioVinculo();
  const { data: cartorios = [] } = useCartorios();

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || "");
      setCargo(usuario.cargo || "");
      setActiveTab("info");
      setNovoCartorioId("");
      setNovoRole("operacional");
    }
  }, [usuario]);

  const handleSaveInfo = async () => {
    if (!usuario) return;
    
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({
        userId: usuario.user_id,
        nome: nome.trim(),
        cargo: cargo.trim(),
      });
      toast.success("Informações atualizadas!");
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!usuario?.email) {
      toast.error("E-mail do usuário não disponível");
      return;
    }

    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(usuario.email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;
      toast.success("E-mail de redefinição de senha enviado!");
    } catch (error: any) {
      toast.error("Erro ao enviar e-mail: " + error.message);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleUpdateVinculoRole = async (vinculoId: string, newRole: AppRole) => {
    try {
      await updateVinculo.mutateAsync({ id: vinculoId, role: newRole });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleToggleVinculoAtivo = async (vinculoId: string, ativo: boolean) => {
    try {
      await updateVinculo.mutateAsync({ id: vinculoId, ativo: !ativo });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteVinculo = async (vinculoId: string, cartorioNome: string) => {
    if (!confirm(`Remover vínculo com "${cartorioNome}"?`)) return;
    
    try {
      await deleteVinculo.mutateAsync(vinculoId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleAddVinculo = async () => {
    if (!usuario || !novoCartorioId) {
      toast.error("Selecione um cartório");
      return;
    }

    // Verificar se já existe vínculo
    if (usuario.cartorios.some((c) => c.cartorio_id === novoCartorioId)) {
      toast.error("Usuário já está vinculado a este cartório");
      return;
    }

    try {
      await addVinculo.mutateAsync({
        userId: usuario.user_id,
        cartorioId: novoCartorioId,
        role: novoRole,
      });
      setNovoCartorioId("");
      setNovoRole("operacional");
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Cartórios disponíveis (não vinculados)
  const cartoriosDisponiveis = cartorios.filter(
    (c) => !usuario?.cartorios.some((uc) => uc.cartorio_id === c.id)
  );

  if (!usuario) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            {usuario.nome || usuario.email || "Usuário"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info" className="gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Informações</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="cartorios" className="gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cartórios</span>
              <span className="sm:hidden">Cart.</span>
            </TabsTrigger>
            <TabsTrigger value="senha" className="gap-1.5">
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Senha</span>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            {/* Tab: Informações Básicas */}
            <TabsContent value="info" className="space-y-4 m-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nome">Nome Completo</Label>
                  <Input
                    id="edit-nome"
                    placeholder="Digite o nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-cargo">Cargo</Label>
                  <Input
                    id="edit-cargo"
                    placeholder="Ex: Gerente Financeiro"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    value={usuario.email || "Não disponível"}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    O e-mail não pode ser alterado.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSaveInfo}
                  disabled={isSaving || updateProfile.isPending}
                >
                  {(isSaving || updateProfile.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Salvar Informações
                </Button>
              </div>
            </TabsContent>

            {/* Tab: Cartórios */}
            <TabsContent value="cartorios" className="space-y-4 m-0">
              {/* Vínculos existentes */}
              <div className="space-y-2">
                <Label>Cartórios Vinculados ({usuario.cartorios.length})</Label>
                <div className="space-y-2">
                  {usuario.cartorios.map((vinculo) => (
                    <div
                      key={vinculo.id}
                      className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">{vinculo.cartorio_nome}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Select
                          value={vinculo.role}
                          onValueChange={(v) => handleUpdateVinculoRole(vinculo.id, v as AppRole)}
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
                          variant={vinculo.ativo ? "secondary" : "outline"}
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleToggleVinculoAtivo(vinculo.id, vinculo.ativo)}
                        >
                          {vinculo.ativo ? "Ativo" : "Inativo"}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteVinculo(vinculo.id, vinculo.cartorio_nome)}
                          disabled={usuario.cartorios.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adicionar novo vínculo */}
              {cartoriosDisponiveis.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <Label>Adicionar a outro cartório</Label>
                  <div className="flex items-center gap-2">
                    <Select value={novoCartorioId} onValueChange={setNovoCartorioId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione o cartório" />
                      </SelectTrigger>
                      <SelectContent>
                        {cartoriosDisponiveis.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={novoRole} onValueChange={(v) => setNovoRole(v as AppRole)}>
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
                      size="icon"
                      onClick={handleAddVinculo}
                      disabled={!novoCartorioId || addVinculo.isPending}
                    >
                      {addVinculo.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {cartoriosDisponiveis.length === 0 && (
                <p className="text-sm text-muted-foreground pt-4 border-t">
                  Este usuário já está vinculado a todos os cartórios disponíveis.
                </p>
              )}
            </TabsContent>

            {/* Tab: Senha */}
            <TabsContent value="senha" className="space-y-4 m-0">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <h4 className="font-medium mb-2">Redefinição de Senha</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Envie um e-mail para o usuário com um link para redefinir a senha.
                    O link será enviado para: <strong>{usuario.email || "N/A"}</strong>
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleResetPassword}
                    disabled={isResettingPassword || !usuario.email}
                  >
                    {isResettingPassword && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    <Key className="w-4 h-4 mr-2" />
                    Enviar E-mail de Redefinição
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>
                    Por motivos de segurança, não é possível definir uma nova senha
                    diretamente. O usuário receberá um link seguro para criar uma nova senha.
                  </p>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
