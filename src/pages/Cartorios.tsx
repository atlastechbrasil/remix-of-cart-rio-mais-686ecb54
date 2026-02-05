import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Building2, Pencil, Trash2, Users } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { useCartorios, useUpdateCartorio, useDeleteCartorio } from "@/hooks/useCartorios";
import { NovoCartorioDialog } from "@/components/cartorios/NovoCartorioDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigate } from "react-router-dom";
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
import { ResponsiveTable, type Column } from "@/components/ui/responsive-table";
import { useIsMobile } from "@/hooks/use-mobile";

interface Cartorio {
  id: string;
  nome: string;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  ativo: boolean;
}

export default function Cartorios() {
  const { isSuperAdmin, isLoading: tenantLoading } = useTenant();
  const { data: cartorios, isLoading } = useCartorios();
  const updateCartorio = useUpdateCartorio();
  const deleteCartorio = useDeleteCartorio();
  const isMobile = useIsMobile();

  const [novoDialogOpen, setNovoDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCartorioId, setSelectedCartorioId] = useState<string | null>(null);

  // Redirect non-super admins
  if (!tenantLoading && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleToggleStatus = async (id: string, ativo: boolean) => {
    await updateCartorio.mutateAsync({ id, ativo: !ativo });
  };

  const handleDelete = async () => {
    if (selectedCartorioId) {
      await deleteCartorio.mutateAsync(selectedCartorioId);
      setDeleteDialogOpen(false);
      setSelectedCartorioId(null);
    }
  };

  const confirmDelete = (id: string) => {
    setSelectedCartorioId(id);
    setDeleteDialogOpen(true);
  };

  const columns: Column<Cartorio>[] = [
    {
      key: "nome",
      header: "Nome",
      render: (item) => <span className="font-medium">{item.nome}</span>,
    },
    {
      key: "cnpj",
      header: "CNPJ",
      hideOnMobile: true,
      render: (item) => (
        <span className="text-muted-foreground">{item.cnpj || "—"}</span>
      ),
    },
    {
      key: "email",
      header: "E-mail",
      render: (item) => (
        <span className="text-muted-foreground truncate">{item.email || "—"}</span>
      ),
    },
    {
      key: "telefone",
      header: "Telefone",
      hideOnMobile: true,
      render: (item) => (
        <span className="text-muted-foreground">{item.telefone || "—"}</span>
      ),
    },
    {
      key: "ativo",
      header: "Status",
      render: (item) => (
        <Badge variant={item.ativo ? "default" : "secondary"}>
          {item.ativo ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
  ];

  const renderActions = (cartorio: Cartorio) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Pencil className="w-4 h-4 mr-2" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Users className="w-4 h-4 mr-2" />
          Gerenciar Usuários
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToggleStatus(cartorio.id, cartorio.ativo)}>
          {cartorio.ativo ? "Desativar" : "Ativar"}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => confirmDelete(cartorio.id)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const cartoriosData = (cartorios || []) as Cartorio[];

  return (
    <MainLayout>
      <PageHeader
        title="Cartórios"
        description="Gerencie os cartórios cadastrados no sistema"
      />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Cartórios</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-12" /> : cartorios?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <Building2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  cartorios?.filter((c) => c.ativo).length || 0
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inativos</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  cartorios?.filter((c) => !c.ativo).length || 0
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Button onClick={() => setNovoDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Novo Cartório</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>

        {/* Table / Cards */}
        <Card>
          <CardContent className="p-3 sm:p-6">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <ResponsiveTable
                data={cartoriosData}
                columns={columns}
                keyExtractor={(item) => item.id}
                renderActions={renderActions}
                emptyMessage="Nenhum cartório cadastrado"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <NovoCartorioDialog open={novoDialogOpen} onOpenChange={setNovoDialogOpen} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cartório</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cartório? Esta ação não pode ser desfeita
              e todos os dados associados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
