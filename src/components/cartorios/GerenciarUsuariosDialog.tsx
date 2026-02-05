import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Users, UserPlus, Trash2, Shield, Loader2, Search } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface GerenciarUsuariosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartorioId: string | null;
  cartorioNome?: string;
}

interface UsuarioVinculado {
  id: string;
  user_id: string;
  role: AppRole;
  ativo: boolean;
  nome: string | null;
}

interface UsuarioDisponivel {
  user_id: string;
  nome: string | null;
}

const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Administrador",
  financeiro: "Financeiro",
  operacional: "Operacional",
};

export function GerenciarUsuariosDialog({
  open,
  onOpenChange,
  cartorioId,
  cartorioNome,
}: GerenciarUsuariosDialogProps) {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("operacional");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UsuarioVinculado | null>(null);

  // Fetch users linked to this cartório
  const { data: usuarios, isLoading } = useQuery({
    queryKey: ["cartorio-usuarios", cartorioId],
    queryFn: async () => {
      if (!cartorioId) return [];

      const { data, error } = await supabase
        .from("cartorio_usuarios")
        .select(`
          id,
          user_id,
          role,
          ativo
        `)
        .eq("cartorio_id", cartorioId)
        .eq("ativo", true);

      if (error) throw error;

      // Get user details from profiles
      const userIds = data.map((u) => u.user_id);
      
      if (userIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, nome")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      return data.map((u) => ({
        ...u,
        nome: profilesMap.get(u.user_id)?.nome || null,
      })) as UsuarioVinculado[];
    },
    enabled: !!cartorioId && open,
  });

  // Fetch all available users (not yet linked to this cartório)
  const { data: usuariosDisponiveis } = useQuery({
    queryKey: ["usuarios-disponiveis", cartorioId],
    queryFn: async () => {
      if (!cartorioId) return [];

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, nome")
        .order("nome");

      if (profilesError) throw profilesError;

      // Get users already linked to this cartório
      const { data: linkedUsers, error: linkedError } = await supabase
        .from("cartorio_usuarios")
        .select("user_id")
        .eq("cartorio_id", cartorioId)
        .eq("ativo", true);

      if (linkedError) throw linkedError;

      const linkedUserIds = new Set(linkedUsers?.map((u) => u.user_id) || []);

      // Filter out already linked users
      return (profiles || [])
        .filter((p) => !linkedUserIds.has(p.user_id))
        .map((p) => ({
          user_id: p.user_id,
          nome: p.nome,
        })) as UsuarioDisponivel[];
    },
    enabled: !!cartorioId && open,
  });

  // Add user to cartório
  const addUserMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      if (!cartorioId) throw new Error("Cartório não selecionado");

      // Check if user already has an inactive link
      const { data: existing } = await supabase
        .from("cartorio_usuarios")
        .select("id, ativo")
        .eq("cartorio_id", cartorioId)
        .eq("user_id", userId)
        .single();

      if (existing) {
        if (existing.ativo) {
          throw new Error("Usuário já está vinculado a este cartório");
        }
        // Reactivate existing link
        const { error } = await supabase
          .from("cartorio_usuarios")
          .update({ ativo: true, role })
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        // Create new link
        const { error } = await supabase.from("cartorio_usuarios").insert({
          cartorio_id: cartorioId,
          user_id: userId,
          role,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartorio-usuarios", cartorioId] });
      queryClient.invalidateQueries({ queryKey: ["usuarios-disponiveis", cartorioId] });
      toast.success("Usuário adicionado com sucesso!");
      setSelectedUserId("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao adicionar usuário");
    },
  });

  // Update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ vinculoId, role }: { vinculoId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("cartorio_usuarios")
        .update({ role })
        .eq("id", vinculoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartorio-usuarios", cartorioId] });
      toast.success("Função atualizada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar função");
    },
  });

  // Remove user from cartório (soft delete)
  const removeUserMutation = useMutation({
    mutationFn: async (vinculoId: string) => {
      const { error } = await supabase
        .from("cartorio_usuarios")
        .update({ ativo: false })
        .eq("id", vinculoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartorio-usuarios", cartorioId] });
      queryClient.invalidateQueries({ queryKey: ["usuarios-disponiveis", cartorioId] });
      toast.success("Usuário removido do cartório");
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    },
    onError: () => {
      toast.error("Erro ao remover usuário");
    },
  });

  const handleAddUser = async () => {
    if (!selectedUserId) {
      toast.error("Selecione um usuário");
      return;
    }

    await addUserMutation.mutateAsync({
      userId: selectedUserId,
      role: selectedRole,
    });
  };

  const confirmRemoveUser = (usuario: UsuarioVinculado) => {
    setUserToDelete(usuario);
    setDeleteConfirmOpen(true);
  };

  // Filter available users by search term
  const filteredUsuariosDisponiveis = (usuariosDisponiveis || []).filter((u) => {
    if (!searchTerm.trim()) return true;
    const nome = u.nome?.toLowerCase() || "";
    const id = u.user_id.toLowerCase();
    const search = searchTerm.toLowerCase();
    return nome.includes(search) || id.includes(search);
  });

  const content = (
    <div className="space-y-6">
      {/* Add User Section */}
      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-2 text-sm font-medium">
          <UserPlus className="w-4 h-4" />
          Adicionar Usuário
        </div>
        
        <div className="grid gap-3">
          {/* Search and Select User */}
          <div className="space-y-2">
            <Label>Buscar usuário</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Selecionar usuário</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {filteredUsuariosDisponiveis.length === 0 ? (
                  <div className="px-2 py-4 text-sm text-center text-muted-foreground">
                    Nenhum usuário disponível
                  </div>
                ) : (
                  filteredUsuariosDisponiveis.slice(0, 20).map((u) => (
                    <SelectItem key={u.user_id} value={u.user_id}>
                      {u.nome || `Usuário (${u.user_id.substring(0, 8)}...)`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {filteredUsuariosDisponiveis.length > 20 && (
              <p className="text-xs text-muted-foreground">
                Mostrando 20 de {filteredUsuariosDisponiveis.length} usuários. Use a busca para filtrar.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Função</Label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="operacional">Operacional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            onClick={handleAddUser}
            disabled={addUserMutation.isPending || !selectedUserId}
            className="w-full"
          >
            {addUserMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adicionando...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar ao Cartório
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Users className="w-4 h-4" />
          Usuários Vinculados ({usuarios?.length || 0})
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : !usuarios || usuarios.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>Nenhum usuário vinculado a este cartório</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {isMobile ? (
              // Mobile card view
              <div className="space-y-3">
                {usuarios.map((usuario) => (
                  <div
                    key={usuario.id}
                    className="p-3 border rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{usuario.nome || "Usuário"}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                          ID: {usuario.user_id.substring(0, 8)}...
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => confirmRemoveUser(usuario)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <Select
                        value={usuario.role}
                        onValueChange={(role) =>
                          updateRoleMutation.mutate({ vinculoId: usuario.id, role: role as AppRole })
                        }
                      >
                        <SelectTrigger className="h-8 flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="financeiro">Financeiro</SelectItem>
                          <SelectItem value="operacional">Operacional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop table view
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{usuario.nome || "Usuário"}</p>
                          <p className="text-xs text-muted-foreground">
                            ID: {usuario.user_id.substring(0, 8)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={usuario.role}
                          onValueChange={(role) =>
                            updateRoleMutation.mutate({ vinculoId: usuario.id, role: role as AppRole })
                          }
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="financeiro">Financeiro</SelectItem>
                            <SelectItem value="operacional">Operacional</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => confirmRemoveUser(usuario)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover{" "}
              <strong>{userToDelete?.nome || "este usuário"}</strong> deste cartório?
              O usuário perderá acesso aos dados do cartório.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && removeUserMutation.mutate(userToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeUserMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Remover"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gerenciar Usuários
            </DrawerTitle>
            <DrawerDescription>
              {cartorioNome || "Cartório selecionado"}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciar Usuários
          </DialogTitle>
          <DialogDescription>
            {cartorioNome || "Cartório selecionado"}
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
