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
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdatePerfilAcesso, type PerfilAcesso } from "@/hooks/useUsuarios";
import { Loader2 } from "lucide-react";

interface EditarPerfilDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perfil: PerfilAcesso | null;
}

const MODULOS = [
  { id: "dashboard", label: "Dashboard", permissoes: ["view"] },
  { id: "conciliacao", label: "Conciliação", permissoes: ["view", "create", "edit", "delete"] },
  { id: "contas", label: "Contas Bancárias", permissoes: ["view", "create", "edit", "delete"] },
  { id: "extratos", label: "Extratos", permissoes: ["view", "create", "delete"] },
  { id: "lancamentos", label: "Lançamentos", permissoes: ["view", "create", "edit", "delete"] },
  { id: "registros", label: "Registros", permissoes: ["view", "create", "edit", "delete"] },
  { id: "repasses", label: "Repasses", permissoes: ["view", "create", "edit"] },
  { id: "relatorios", label: "Relatórios", permissoes: ["view", "export"] },
  { id: "usuarios", label: "Usuários", permissoes: ["view", "manage"] },
  { id: "configuracoes", label: "Configurações", permissoes: ["view", "edit"] },
];

const PERMISSAO_LABELS: Record<string, string> = {
  view: "Visualizar",
  create: "Criar",
  edit: "Editar",
  delete: "Excluir",
  export: "Exportar",
  manage: "Gerenciar",
};

export function EditarPerfilDialog({ open, onOpenChange, perfil }: EditarPerfilDialogProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [permissoes, setPermissoes] = useState<Record<string, Record<string, boolean>>>({});

  const updatePerfil = useUpdatePerfilAcesso();

  // Preencher dados quando o perfil mudar
  useEffect(() => {
    if (perfil) {
      setNome(perfil.nome);
      setDescricao(perfil.descricao || "");
      setPermissoes(perfil.permissoes || {});
    }
  }, [perfil]);

  const togglePermissao = (modulo: string, permissao: string) => {
    setPermissoes((prev) => ({
      ...prev,
      [modulo]: {
        ...prev[modulo],
        [permissao]: !prev[modulo]?.[permissao],
      },
    }));
  };

  const toggleAllModulo = (modulo: string, permissoesModulo: string[]) => {
    const currentPerms = permissoes[modulo] || {};
    const allEnabled = permissoesModulo.every((p) => currentPerms[p]);

    setPermissoes((prev) => ({
      ...prev,
      [modulo]: permissoesModulo.reduce(
        (acc, p) => ({ ...acc, [p]: !allEnabled }),
        {} as Record<string, boolean>
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!perfil || !nome.trim()) return;

    try {
      await updatePerfil.mutateAsync({
        id: perfil.id,
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        permissoes,
      });

      onOpenChange(false);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!perfil) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil de Acesso</DialogTitle>
          <DialogDescription>
            Atualize as permissões deste perfil de acesso.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Perfil</Label>
              <Input
                id="nome"
                placeholder="Ex: Gerente Financeiro"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                placeholder="Breve descrição do perfil"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Permissões por Módulo</Label>
            <div className="border rounded-lg divide-y">
              {MODULOS.map((modulo) => (
                <div key={modulo.id} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{modulo.label}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAllModulo(modulo.id, modulo.permissoes)}
                    >
                      {modulo.permissoes.every((p) => permissoes[modulo.id]?.[p])
                        ? "Desmarcar todos"
                        : "Marcar todos"}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {modulo.permissoes.map((perm) => (
                      <div key={perm} className="flex items-center gap-2">
                        <Checkbox
                          id={`edit-${modulo.id}-${perm}`}
                          checked={permissoes[modulo.id]?.[perm] || false}
                          onCheckedChange={() => togglePermissao(modulo.id, perm)}
                        />
                        <Label
                          htmlFor={`edit-${modulo.id}-${perm}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {PERMISSAO_LABELS[perm] || perm}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updatePerfil.isPending || !nome.trim()}>
              {updatePerfil.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
