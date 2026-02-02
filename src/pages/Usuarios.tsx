import { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Shield,
  Mail,
  Phone,
  Edit,
  Trash2,
  UserCheck,
  UserX,
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

const usuarios = [
  {
    id: 1,
    nome: "João da Silva",
    email: "joao.silva@cartorio.com",
    telefone: "(11) 99999-0001",
    perfil: "administrador",
    status: "ativo",
    ultimoAcesso: "Hoje, 14:30",
  },
  {
    id: 2,
    nome: "Maria Santos",
    email: "maria.santos@cartorio.com",
    telefone: "(11) 99999-0002",
    perfil: "financeiro",
    status: "ativo",
    ultimoAcesso: "Hoje, 11:45",
  },
  {
    id: 3,
    nome: "Carlos Oliveira",
    email: "carlos.oliveira@cartorio.com",
    telefone: "(11) 99999-0003",
    perfil: "operacional",
    status: "ativo",
    ultimoAcesso: "Ontem, 18:20",
  },
  {
    id: 4,
    nome: "Ana Costa",
    email: "ana.costa@cartorio.com",
    telefone: "(11) 99999-0004",
    perfil: "operacional",
    status: "ativo",
    ultimoAcesso: "Hoje, 09:15",
  },
  {
    id: 5,
    nome: "Pedro Lima",
    email: "pedro.lima@cartorio.com",
    telefone: "(11) 99999-0005",
    perfil: "financeiro",
    status: "inativo",
    ultimoAcesso: "15/01/2024",
  },
  {
    id: 6,
    nome: "Lucia Ferreira",
    email: "lucia.ferreira@cartorio.com",
    telefone: "(11) 99999-0006",
    perfil: "operacional",
    status: "ativo",
    ultimoAcesso: "Hoje, 10:30",
  },
];

const perfis = [
  {
    nome: "Administrador",
    descricao: "Acesso total ao sistema, incluindo configurações e usuários",
    permissoes: ["Dashboard", "Financeiro", "Atos", "Repasses", "Relatórios", "Usuários", "Configurações"],
    cor: "bg-primary/10 text-primary border-primary/20",
  },
  {
    nome: "Financeiro",
    descricao: "Acesso às funções financeiras e relatórios",
    permissoes: ["Dashboard", "Financeiro", "Repasses", "Relatórios"],
    cor: "bg-success/10 text-success border-success/20",
  },
  {
    nome: "Operacional",
    descricao: "Acesso ao registro de atos e consultas básicas",
    permissoes: ["Dashboard", "Atos", "Relatórios (limitado)"],
    cor: "bg-info/10 text-info border-info/20",
  },
];

const perfilStyles = {
  administrador: "bg-primary/10 text-primary border-primary/20",
  financeiro: "bg-success/10 text-success border-success/20",
  operacional: "bg-info/10 text-info border-info/20",
};

export default function Usuarios() {
  const [searchTerm, setSearchTerm] = useState("");

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <PageHeader title="Usuários e Perfis" description="Gerenciamento de acessos ao sistema">
        <Button className="gap-2">
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

            {/* User Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsuarios.map((usuario) => (
                <Card key={usuario.id} className="hover:border-primary/20 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(usuario.nome)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">{usuario.nome}</h3>
                          <Badge
                            variant="outline"
                            className={perfilStyles[usuario.perfil as keyof typeof perfilStyles]}
                          >
                            {usuario.perfil}
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
                          {usuario.status === "ativo" ? (
                            <DropdownMenuItem className="text-warning">
                              <UserX className="w-4 h-4 mr-2" />
                              Desativar
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-success">
                              <UserCheck className="w-4 h-4 mr-2" />
                              Ativar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{usuario.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{usuario.telefone}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          usuario.status === "ativo"
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {usuario.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Último acesso: {usuario.ultimoAcesso}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="perfis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {perfis.map((perfil) => (
                <Card key={perfil.nome}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={perfil.cor}>
                        <Shield className="w-3 h-3 mr-1" />
                        {perfil.nome}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </div>
                    <CardTitle className="text-base mt-2">{perfil.nome}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{perfil.descricao}</p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Permissões
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {perfil.permissoes.map((permissao) => (
                          <Badge key={permissao} variant="secondary" className="text-xs">
                            {permissao}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
