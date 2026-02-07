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

// Interface para usuários agregados (usado na listagem global de super admins)
export interface UsuarioAgregado {
  user_id: string;
  nome: string | null;
  email: string;
  avatar_url: string | null;
  cargo: string | null;
  created_at: string;
  // Cartórios vinculados
  cartorios: Array<{
    id: string; // ID do vínculo (cartorio_usuarios.id)
    cartorio_id: string;
    cartorio_nome: string;
    role: AppRole;
    ativo: boolean;
  }>;
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

// Hook para listar TODOS os usuários de TODOS os cartórios (somente super admins)
// Agrupado por user_id para evitar duplicação
export function useAllUsuarios() {
  const { isSuperAdmin } = useTenant();

  return useQuery({
    queryKey: ["all-usuarios"],
    queryFn: async (): Promise<UsuarioAgregado[]> => {
      // Buscar todos os vínculos (RLS garante que só super admin pode ver todos)
      const { data: vinculos, error: vinculosError } = await supabase
        .from("cartorio_usuarios")
        .select("*")
        .order("created_at", { ascending: false });

      if (vinculosError) throw vinculosError;
      if (!vinculos || vinculos.length === 0) return [];

      // Buscar profiles dos usuários
      const userIds = [...new Set(vinculos.map((v) => v.user_id))];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, nome, avatar_url, cargo, created_at")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Buscar emails dos usuários via função security definer
      const { data: emailsData, error: emailsError } = await supabase
        .rpc("get_user_emails", { user_ids: userIds });

      if (emailsError) {
        console.warn("Erro ao buscar emails:", emailsError.message);
      }

      // Mapear emails por user_id
      const emailsMap = new Map<string, string>();
      if (emailsData) {
        for (const item of emailsData) {
          emailsMap.set(item.user_id, item.email);
        }
      }

      // Buscar nomes dos cartórios
      const cartorioIds = [...new Set(vinculos.map((v) => v.cartorio_id))];

      const { data: cartorios, error: cartoriosError } = await supabase
        .from("cartorios")
        .select("id, nome")
        .in("id", cartorioIds);

      if (cartoriosError) throw cartoriosError;

      // Agrupar por user_id
      const usuariosMap = new Map<string, UsuarioAgregado>();

      for (const vinculo of vinculos) {
        const profile = profiles?.find((p) => p.user_id === vinculo.user_id);
        const cartorio = cartorios?.find((c) => c.id === vinculo.cartorio_id);

        if (!usuariosMap.has(vinculo.user_id)) {
          usuariosMap.set(vinculo.user_id, {
            user_id: vinculo.user_id,
            nome: profile?.nome || null,
            email: emailsMap.get(vinculo.user_id) || "",
            avatar_url: profile?.avatar_url || null,
            cargo: profile?.cargo || null,
            created_at: profile?.created_at || vinculo.created_at,
            cartorios: [],
          });
        }

        const usuario = usuariosMap.get(vinculo.user_id)!;
        usuario.cartorios.push({
          id: vinculo.id,
          cartorio_id: vinculo.cartorio_id,
          cartorio_nome: cartorio?.nome || "Cartório não encontrado",
          role: vinculo.role,
          ativo: vinculo.ativo,
        });
      }

      // Converter para array e ordenar por data de criação
      return Array.from(usuariosMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: isSuperAdmin,
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

// Hook para listar perfis de acesso globais
export function usePerfisAcesso() {
  return useQuery({
    queryKey: ["perfis-acesso"],
    queryFn: async (): Promise<PerfilAcesso[]> => {
      const { data, error } = await supabase
        .from("perfis_acesso")
        .select("*")
        .is("cartorio_id", null) // Perfis globais
        .order("nome");

      if (error) throw error;
      return (data || []).map((p) => ({
        ...p,
        permissoes: (p.permissoes as Record<string, Record<string, boolean>>) || {},
      }));
    },
  });
}

// Hook para criar perfil de acesso global
export function useCreatePerfilAcesso() {
  const queryClient = useQueryClient();

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
      const { data, error } = await supabase
        .from("perfis_acesso")
        .insert({
          cartorio_id: null, // Perfil global
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

// Hook para atualizar profile de um usuário
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      nome,
      cargo,
    }: {
      userId: string;
      nome?: string;
      cargo?: string;
    }) => {
      const updates: Record<string, unknown> = {};
      if (nome !== undefined) updates.nome = nome;
      if (cargo !== undefined) updates.cargo = cargo;

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .maybeSingle();


      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartorio-usuarios"] });
      queryClient.invalidateQueries({ queryKey: ["all-usuarios"] });
      toast.success("Perfil atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar perfil: " + error.message);
    },
  });
}

// Hook para adicionar vínculo de usuário a um cartório específico
export function useAddCartorioVinculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      cartorioId,
      role,
    }: {
      userId: string;
      cartorioId: string;
      role: AppRole;
    }) => {
      const { data, error } = await supabase
        .from("cartorio_usuarios")
        .insert({
          user_id: userId,
          cartorio_id: cartorioId,
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
      queryClient.invalidateQueries({ queryKey: ["all-usuarios"] });
      toast.success("Usuário vinculado ao cartório!");
    },
    onError: (error) => {
      toast.error("Erro ao vincular usuário: " + error.message);
    },
  });
}
