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
  Building2,
  ShieldX,
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTenant } from "@/contexts/TenantContext";
import {
  useCartorioUsuarios,
  useAllUsuarios,
  usePerfisAcesso,
  useUpdateCartorioUsuario,
  useDeleteCartorioUsuario,
  useDeletePerfilAcesso,
  type UsuarioCartorio,
  type UsuarioAgregado,
  type PerfilAcesso,
} from "@/hooks/useUsuarios";
import { NovoUsuarioDialog } from "@/components/usuarios/NovoUsuarioDialog";
import { NovoPerfilDialog } from "@/components/usuarios/NovoPerfilDialog";
import { EditarPerfilDialog } from "@/components/usuarios/EditarPerfilDialog";
import { EditarUsuarioDialog } from "@/components/usuarios/EditarUsuarioDialog";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [editarUsuarioOpen, setEditarUsuarioOpen] = useState(false);
  const [editarPerfilOpen, setEditarPerfilOpen] = useState(false);
  const [usuarioParaEditar, setUsuarioParaEditar] = useState<UsuarioAgregado | null>(null);
  const [perfilParaEditar, setPerfilParaEditar] = useState<PerfilAcesso | null>(null);
  const isMobile = useIsMobile();

  const { cartorioAtivo, isSuperAdmin, isLoading: tenantLoading } = useTenant();
  
  // Super admins veem todos os usuários; admins de cartório veem só os do seu cartório
  const { data: allUsuarios = [], isLoading: loadingAllUsuarios } = useAllUsuarios();
  const { data: cartorioUsuarios = [], isLoading: loadingCartorioUsuarios } = useCartorioUsuarios();
  
  const loadingUsuarios = isSuperAdmin ? loadingAllUsuarios : loadingCartorioUsuarios;
  
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

  // Filtrar usuários agregados (super admin)
  const filteredAllUsuarios = allUsuarios.filter(
    (u) =>
      u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.cartorios.some((c) => c.cartorio_nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filtrar usuários do cartório (admin normal)
  const filteredCartorioUsuarios = cartorioUsuarios.filter(
    (u) =>
      u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Tela de carregamento inicial
  if (tenantLoading) {
    return (
      <MainLayout>
        <PageHeader title="Usuários e Perfis" description="Gerenciamento de acessos ao sistema" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  // Bloquear acesso para usuários que não são super admin nem admin do cartório
  // Por enquanto, apenas super admins têm acesso a esta tela
  if (!isSuperAdmin) {
    return (
      <MainLayout>
        <PageHeader title="Usuários e Perfis" description="Gerenciamento de acessos ao sistema" />
        <div className="flex-1 p-6 flex flex-col items-center justify-center gap-4">
          <div className="p-4 rounded-full bg-destructive/10">
            <ShieldX className="w-12 h-12 text-destructive" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground max-w-md">
              Você não tem permissão para acessar esta página. 
              Apenas super administradores podem gerenciar usuários do sistema.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Usuários e Perfis"
        description={isMobile ? undefined : (isSuperAdmin ? "Gerenciamento global de usuários do sistema" : `Gerenciamento de acessos - ${cartorioAtivo?.nome || ""}`)}
      >
        <Button className="gap-2" onClick={() => setNovoUsuarioOpen(true)}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Usuário</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </PageHeader>

      <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
        <Tabs defaultValue="usuarios">
          {/* Scrollable tabs for mobile */}
          <ScrollArea className="w-full">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="usuarios" className="flex-1 sm:flex-none">
                Usuários {isSuperAdmin ? `(${filteredAllUsuarios.length})` : `(${filteredCartorioUsuarios.length})`}
              </TabsTrigger>
              <TabsTrigger value="perfis" className="flex-1 sm:flex-none">
                Perfis de Acesso
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" className="sm:hidden" />
          </ScrollArea>

          <TabsContent value="usuarios" className="space-y-4 mt-4">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={isSuperAdmin ? "Buscar por nome, e-mail ou cartório..." : "Buscar por nome ou e-mail..."}
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

            {/* Renderização para Super Admins - Usuários Agregados */}
            {isSuperAdmin && !loadingUsuarios && (
              <>
                {filteredAllUsuarios.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      {searchTerm ? "Nenhum usuário encontrado." : "Nenhum usuário cadastrado no sistema."}
                    </p>
                    <Button onClick={() => setNovoUsuarioOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Usuário
                    </Button>
                  </div>
                )}

                {filteredAllUsuarios.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredAllUsuarios.map((usuario) => (
                      <Card key={usuario.user_id} className="hover:border-primary/20 transition-colors">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                                <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm sm:text-base">
                                  {getInitials(usuario.nome, usuario.email)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                                  {usuario.nome || "Usuário sem nome"}
                                </h3>
                                {usuario.cargo && (
                                  <p className="text-xs text-muted-foreground truncate">{usuario.cargo}</p>
                                )}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setUsuarioParaEditar(usuario);
                                    setEditarUsuarioOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Cartórios vinculados */}
                          <div className="mt-3 sm:mt-4 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Cartórios ({usuario.cartorios.length})
                            </p>
                            <div className="space-y-1.5">
                              {usuario.cartorios.map((vinculo) => (
                                <div
                                  key={vinculo.id}
                                  className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                    <span className="text-xs truncate">{vinculo.cartorio_nome}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <Badge
                                      variant="outline"
                                      className={cn("text-[10px] px-1.5 py-0", roleStyles[vinculo.role] || roleStyles.operacional)}
                                    >
                                      {roleLabels[vinculo.role] || vinculo.role}
                                    </Badge>
                                    <span
                                      className={cn(
                                        "w-2 h-2 rounded-full",
                                        vinculo.ativo ? "bg-success" : "bg-muted-foreground"
                                      )}
                                      title={vinculo.ativo ? "Ativo" : "Inativo"}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Cadastrado em {new Date(usuario.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Renderização para Admins de Cartório - Usuários Simples */}
            {!isSuperAdmin && !loadingUsuarios && (
              <>
                {filteredCartorioUsuarios.length === 0 && (
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

                {filteredCartorioUsuarios.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredCartorioUsuarios.map((usuario) => (
                      <Card key={usuario.id} className="hover:border-primary/20 transition-colors">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                                <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm sm:text-base">
                                  {getInitials(usuario.nome, usuario.email)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                                  {usuario.nome || "Usuário sem nome"}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={cn("text-xs", roleStyles[usuario.role] || roleStyles.operacional)}
                                >
                                  {roleLabels[usuario.role] || usuario.role}
                                </Badge>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
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

                          <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                            {usuario.email && (
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">{usuario.email}</span>
                              </div>
                            )}
                            {usuario.cargo && (
                              <div className="text-xs sm:text-sm text-muted-foreground">
                                Cargo: {usuario.cargo}
                              </div>
                            )}
                          </div>

                          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border flex items-center justify-between">
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
                              {new Date(usuario.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="perfis" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button className="gap-2" onClick={() => setNovoPerfilOpen(true)}>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Perfil</span>
                <span className="sm:hidden">Novo</span>
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

            {/* Perfis Cards - Responsive grid */}
            {!loadingPerfis && perfis.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {perfis.map((perfil) => (
                  <Card key={perfil.id}>
                    <CardHeader className="pb-3 sm:pb-4">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/20"
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          {perfil.nome}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 sm:px-3"
                            onClick={() => {
                              setPerfilParaEditar(perfil);
                              setEditarPerfilOpen(true);
                            }}
                          >
                            <span className="hidden sm:inline">Editar</span>
                            <Edit className="w-4 h-4 sm:hidden" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-destructive hover:text-destructive"
                            onClick={() => handleDeletePerfil(perfil)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-sm sm:text-base mt-2">{perfil.nome}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
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
      <EditarPerfilDialog
        open={editarPerfilOpen}
        onOpenChange={setEditarPerfilOpen}
        perfil={perfilParaEditar}
      />
      <EditarUsuarioDialog
        open={editarUsuarioOpen}
        onOpenChange={setEditarUsuarioOpen}
        usuario={usuarioParaEditar}
      />
    </MainLayout>
  );
}
