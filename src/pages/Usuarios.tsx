import { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Shield,
  Mail,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useTenant } from "@/contexts/TenantContext";
import {
  useCartorioUsuarios,
  usePerfisAcesso,
  useUpdateCartorioUsuario,
  useDeleteCartorioUsuario,
  useDeletePerfilAcesso,
  type UsuarioCartorio,
  type PerfilAcesso,
} from "@/hooks/useUsuarios";
import { NovoUsuarioDialog } from "@/components/usuarios/NovoUsuarioDialog";
import { NovoPerfilDialog } from "@/components/usuarios/NovoPerfilDialog";

const roleStyles: Record<string, string> = {
  super_admin: "bg-destructive/10 text-destructive border-destructive/20",
  admin: "bg-primary/10 text-primary border-primary/20",
  financeiro: "bg-success/10 text-success border-success/20",
  operacional: "bg-info/10 text-info border-info/20",
};

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Administrador",
  financeiro: "Financeiro",
  operacional: "Operacional",
};

export default function Usuarios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [novoUsuarioOpen, setNovoUsuarioOpen] = useState(false);
  const [novoPerfilOpen, setNovoPerfilOpen] = useState(false);

  const { cartorioAtivo, isSuperAdmin } = useTenant();
  const { data: usuarios = [], isLoading: loadingUsuarios } = useCartorioUsuarios();
  const { data: perfis = [], isLoading: loadingPerfis } = usePerfisAcesso();
  const updateUsuario = useUpdateCartorioUsuario();
  const deleteUsuario = useDeleteCartorioUsuario();
  const deletePerfil = useDeletePerfilAcesso();

  const getInitials = (nome: string | null, email?: string) => {
    if (nome) {
      return nome
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    }
    return email?.substring(0, 2).toUpperCase() || "U";
  };

  const filteredUsuarios = usuarios.filter(
    (u) =>
      (u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleToggleAtivo = (usuario: UsuarioCartorio) => {
    updateUsuario.mutate({
      id: usuario.id,
      ativo: !usuario.ativo,
    });
  };

  const handleDeleteUsuario = (usuario: UsuarioCartorio) => {
    if (confirm(`Remover ${usuario.nome || "usuário"} do cartório?`)) {
      deleteUsuario.mutate(usuario.id);
    }
  };

  const handleDeletePerfil = (perfil: PerfilAcesso) => {
    if (confirm(`Excluir perfil "${perfil.nome}"?`)) {
      deletePerfil.mutate(perfil.id);
    }
  };

  if (!cartorioAtivo) {
    return (
      <MainLayout>
        <PageHeader title="Usuários e Perfis" description="Gerenciamento de acessos ao sistema" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <p className="text-muted-foreground">Selecione um cartório para gerenciar usuários.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader title="Usuários e Perfis" description={`Gerenciamento de acessos - ${cartorioAtivo.nome}`}>
        <Button className="gap-2" onClick={() => setNovoUsuarioOpen(true)}>
          <Plus className="w-4 h-4" />
          Novo Usuário
        </Button>
      </PageHeader>

      <div className="flex-1 p-6 space-y-6">
        <Tabs defaultValue="usuarios">
          <TabsList>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="perfis">Perfis de Acesso</TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios" className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou e-mail..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Loading */}
            {loadingUsuarios && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {/* Empty State */}
            {!loadingUsuarios && filteredUsuarios.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Nenhum usuário encontrado." : "Nenhum usuário vinculado a este cartório."}
                </p>
                <Button onClick={() => setNovoUsuarioOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Usuário
                </Button>
              </div>
            )}

            {/* User Cards */}
            {!loadingUsuarios && filteredUsuarios.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsuarios.map((usuario) => (
                  <Card key={usuario.id} className="hover:border-primary/20 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {getInitials(usuario.nome, usuario.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {usuario.nome || "Usuário sem nome"}
                            </h3>
                            <Badge
                              variant="outline"
                              className={roleStyles[usuario.role] || roleStyles.operacional}
                            >
                              {roleLabels[usuario.role] || usuario.role}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="w-4 h-4 mr-2" />
                              Alterar Perfil
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {usuario.ativo ? (
                              <DropdownMenuItem
                                className="text-warning"
                                onClick={() => handleToggleAtivo(usuario)}
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                Desativar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-success"
                                onClick={() => handleToggleAtivo(usuario)}
                              >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Ativar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteUsuario(usuario)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-4 space-y-2">
                        {usuario.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{usuario.email}</span>
                          </div>
                        )}
                        {usuario.cargo && (
                          <div className="text-sm text-muted-foreground">
                            Cargo: {usuario.cargo}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            usuario.ativo
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {usuario.ativo ? "Ativo" : "Inativo"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Desde: {new Date(usuario.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="perfis" className="space-y-4">
            <div className="flex justify-end">
              <Button className="gap-2" onClick={() => setNovoPerfilOpen(true)}>
                <Plus className="w-4 h-4" />
                Novo Perfil
              </Button>
            </div>

            {/* Loading */}
            {loadingPerfis && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {/* Empty State */}
            {!loadingPerfis && perfis.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Nenhum perfil de acesso configurado.</p>
                <Button onClick={() => setNovoPerfilOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Perfil
                </Button>
              </div>
            )}

            {/* Perfis Cards */}
            {!loadingPerfis && perfis.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {perfis.map((perfil) => (
                  <Card key={perfil.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={`bg-${perfil.cor || "primary"}/10 text-${perfil.cor || "primary"} border-${perfil.cor || "primary"}/20`}
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          {perfil.nome}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeletePerfil(perfil)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-base mt-2">{perfil.nome}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {perfil.descricao || "Sem descrição"}
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Permissões
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(perfil.permissoes || {}).map(([modulo, perms]) => {
                            const hasAny = Object.values(perms as Record<string, boolean>).some(Boolean);
                            if (!hasAny) return null;
                            return (
                              <Badge key={modulo} variant="secondary" className="text-xs">
                                {modulo}
                              </Badge>
                            );
                          })}
                          {(!perfil.permissoes || Object.keys(perfil.permissoes).length === 0) && (
                            <span className="text-xs text-muted-foreground">Nenhuma permissão definida</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <NovoUsuarioDialog open={novoUsuarioOpen} onOpenChange={setNovoUsuarioOpen} />
      <NovoPerfilDialog open={novoPerfilOpen} onOpenChange={setNovoPerfilOpen} />
    </MainLayout>
  );
}
