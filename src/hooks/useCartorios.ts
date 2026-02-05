import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";

export interface Cartorio {
  id: string;
  nome: string;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Hook para listar todos os cartórios (apenas super admins)
export function useCartorios() {
  const { isSuperAdmin } = useTenant();

  return useQuery({
    queryKey: ["cartorios"],
    queryFn: async (): Promise<Cartorio[]> => {
      const { data, error } = await supabase
        .from("cartorios")
        .select("*")
        .order("nome");

      if (error) throw error;
      return data || [];
    },
    enabled: isSuperAdmin,
  });
}

// Hook para criar cartório
export function useCreateCartorio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartorio: {
      nome: string;
      cnpj?: string;
      email?: string;
      telefone?: string;
      endereco?: string;
    }) => {
      const { data, error } = await supabase
        .from("cartorios")
        .insert({
          nome: cartorio.nome,
          cnpj: cartorio.cnpj || null,
          email: cartorio.email || null,
          telefone: cartorio.telefone || null,
          endereco: cartorio.endereco || null,
          ativo: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartorios"] });
      queryClient.invalidateQueries({ queryKey: ["user-cartorios"] });
      toast.success("Cartório criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar cartório: " + error.message);
    },
  });
}

// Hook para atualizar cartório
export function useUpdateCartorio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      nome?: string;
      cnpj?: string | null;
      email?: string | null;
      telefone?: string | null;
      endereco?: string | null;
      ativo?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("cartorios")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartorios"] });
      queryClient.invalidateQueries({ queryKey: ["user-cartorios"] });
      toast.success("Cartório atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar cartório: " + error.message);
    },
  });
}

// Hook para deletar cartório
export function useDeleteCartorio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cartorios")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartorios"] });
      queryClient.invalidateQueries({ queryKey: ["user-cartorios"] });
      toast.success("Cartório removido com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao remover cartório: " + error.message);
    },
  });
}
