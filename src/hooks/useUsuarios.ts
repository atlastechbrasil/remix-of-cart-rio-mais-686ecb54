import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export interface UsuarioCartorio {
  id: string;
  user_id: string;
  cartorio_id: string;
  role: AppRole;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  // Dados do profile
  nome: string | null;
  email: string;
  avatar_url: string | null;
  cargo: string | null;
}

export interface PerfilAcesso {
  id: string;
  cartorio_id: string;
  nome: string;
  descricao: string | null;
  cor: string | null;
  permissoes: Record<string, Record<string, boolean>>;
  created_at: string;
  updated_at: string;
}

// Hook para listar usuários do cartório ativo
export function useCartorioUsuarios() {
  const { cartorioAtivo } = useTenant();

  return useQuery({
    queryKey: ["cartorio-usuarios", cartorioAtivo?.id],
    queryFn: async (): Promise<UsuarioCartorio[]> => {
      if (!cartorioAtivo) return [];

      // Buscar vínculos do cartório
      const { data: vinculos, error: vinculosError } = await supabase
        .from("cartorio_usuarios")
        .select("*")
        .eq("cartorio_id", cartorioAtivo.id)
        .order("created_at", { ascending: false });

      if (vinculosError) throw vinculosError;
      if (!vinculos || vinculos.length === 0) return [];

      // Buscar profiles e dados dos usuários
      const userIds = vinculos.map((v) => v.user_id);

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, nome, avatar_url, cargo")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Mapear dados
      const usuarios: UsuarioCartorio[] = vinculos.map((vinculo) => {
        const profile = profiles?.find((p) => p.user_id === vinculo.user_id);
        return {
          id: vinculo.id,
          user_id: vinculo.user_id,
          cartorio_id: vinculo.cartorio_id,
          role: vinculo.role,
          ativo: vinculo.ativo,
          created_at: vinculo.created_at,
          updated_at: vinculo.updated_at,
          nome: profile?.nome || null,
          email: "", // Será preenchido se possível
          avatar_url: profile?.avatar_url || null,
          cargo: profile?.cargo || null,
        };
      });

      return usuarios;
    },
    enabled: !!cartorioAtivo,
  });
}

// Hook para criar vínculo de usuário com cartório
export function useCreateCartorioUsuario() {
  const queryClient = useQueryClient();
  const { cartorioAtivo } = useTenant();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: AppRole;
    }) => {
      if (!cartorioAtivo) throw new Error("Nenhum cartório selecionado");

      const { data, error } = await supabase
        .from("cartorio_usuarios")
        .insert({
          user_id: userId,
          cartorio_id: cartorioAtivo.id,
          role,
          ativo: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartorio-usuarios"] });
      toast.success("Usuário adicionado ao cartório!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar usuário: " + error.message);
    },
  });
}

// Hook para atualizar vínculo de usuário
export function useUpdateCartorioUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      role,
      ativo,
    }: {
      id: string;
      role?: AppRole;
      ativo?: boolean;
    }) => {
      const updates: Record<string, unknown> = {};
      if (role !== undefined) updates.role = role;
      if (ativo !== undefined) updates.ativo = ativo;

      const { data, error } = await supabase
        .from("cartorio_usuarios")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartorio-usuarios"] });
      toast.success("Usuário atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar usuário: " + error.message);
    },
  });
}

// Hook para remover vínculo de usuário
export function useDeleteCartorioUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cartorio_usuarios")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartorio-usuarios"] });
      toast.success("Usuário removido do cartório!");
    },
    onError: (error) => {
      toast.error("Erro ao remover usuário: " + error.message);
    },
  });
}

// Hook para listar perfis de acesso do cartório
export function usePerfisAcesso() {
  const { cartorioAtivo } = useTenant();

  return useQuery({
    queryKey: ["perfis-acesso", cartorioAtivo?.id],
    queryFn: async (): Promise<PerfilAcesso[]> => {
      if (!cartorioAtivo) return [];

      const { data, error } = await supabase
        .from("perfis_acesso")
        .select("*")
        .eq("cartorio_id", cartorioAtivo.id)
        .order("nome");

      if (error) throw error;
      return (data || []).map((p) => ({
        ...p,
        permissoes: (p.permissoes as Record<string, Record<string, boolean>>) || {},
      }));
    },
    enabled: !!cartorioAtivo,
  });
}

// Hook para criar perfil de acesso
export function useCreatePerfilAcesso() {
  const queryClient = useQueryClient();
  const { cartorioAtivo } = useTenant();

  return useMutation({
    mutationFn: async ({
      nome,
      descricao,
      cor,
      permissoes,
    }: {
      nome: string;
      descricao?: string;
      cor?: string;
      permissoes: Record<string, Record<string, boolean>>;
    }) => {
      if (!cartorioAtivo) throw new Error("Nenhum cartório selecionado");

      const { data, error } = await supabase
        .from("perfis_acesso")
        .insert({
          cartorio_id: cartorioAtivo.id,
          nome,
          descricao,
          cor,
          permissoes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perfis-acesso"] });
      toast.success("Perfil de acesso criado!");
    },
    onError: (error) => {
      toast.error("Erro ao criar perfil: " + error.message);
    },
  });
}

// Hook para atualizar perfil de acesso
export function useUpdatePerfilAcesso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      nome,
      descricao,
      cor,
      permissoes,
    }: {
      id: string;
      nome?: string;
      descricao?: string;
      cor?: string;
      permissoes?: Record<string, Record<string, boolean>>;
    }) => {
      const updates: Record<string, unknown> = {};
      if (nome !== undefined) updates.nome = nome;
      if (descricao !== undefined) updates.descricao = descricao;
      if (cor !== undefined) updates.cor = cor;
      if (permissoes !== undefined) updates.permissoes = permissoes;

      const { data, error } = await supabase
        .from("perfis_acesso")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perfis-acesso"] });
      toast.success("Perfil atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar perfil: " + error.message);
    },
  });
}

// Hook para deletar perfil de acesso
export function useDeletePerfilAcesso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("perfis_acesso")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perfis-acesso"] });
      toast.success("Perfil removido!");
    },
    onError: (error) => {
      toast.error("Erro ao remover perfil: " + error.message);
    },
  });
}

// Hook para verificar role do usuário atual no cartório
export function useCurrentUserRole() {
  const { user } = useAuth();
  const { cartorioAtivo, isSuperAdmin } = useTenant();

  return useQuery({
    queryKey: ["current-user-role", cartorioAtivo?.id, user?.id],
    queryFn: async (): Promise<AppRole | "super_admin" | null> => {
      if (isSuperAdmin) return "super_admin";
      if (!cartorioAtivo || !user) return null;

      const { data, error } = await supabase
        .from("cartorio_usuarios")
        .select("role")
        .eq("cartorio_id", cartorioAtivo.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.role || null;
    },
    enabled: !!user,
  });
}
