import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Cartorio {
  id: string;
  nome: string;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  ativo: boolean;
}

interface TenantContextType {
  cartorioAtivo: Cartorio | null;
  cartorios: Cartorio[];
  isSuperAdmin: boolean;
  isLoading: boolean;
  setCartorioAtivo: (cartorioId: string) => Promise<void>;
  refreshCartorios: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartorioAtivo, setCartorioAtivoState] = useState<Cartorio | null>(null);
  const [cartorios, setCartorios] = useState<Cartorio[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se usuário é super admin
  const checkSuperAdmin = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .rpc("is_super_admin", { _user_id: userId });
    
    if (error) {
      console.error("Erro ao verificar super admin:", error);
      return false;
    }
    return data === true;
  }, []);

  // Carregar cartórios disponíveis
  const loadCartorios = useCallback(async (userId: string, superAdmin: boolean) => {
    try {
      let query = supabase.from("cartorios").select("*").eq("ativo", true);
      
      if (!superAdmin) {
        // Se não for super admin, buscar apenas cartórios vinculados
        const { data: userCartorios } = await supabase
          .rpc("get_user_cartorios", { _user_id: userId });
        
        if (userCartorios && userCartorios.length > 0) {
          query = query.in("id", userCartorios);
        } else {
          setCartorios([]);
          return [];
        }
      }

      const { data, error } = await query.order("nome");
      
      if (error) throw error;
      
      setCartorios(data || []);
      return data || [];
    } catch (error) {
      console.error("Erro ao carregar cartórios:", error);
      setCartorios([]);
      return [];
    }
  }, []);

  // Carregar cartório ativo do profile
  const loadCartorioAtivo = useCallback(async (userId: string, cartoriosDisponiveis: Cartorio[]) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("cartorio_ativo_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (profile?.cartorio_ativo_id) {
        const cartorio = cartoriosDisponiveis.find(c => c.id === profile.cartorio_ativo_id);
        if (cartorio) {
          setCartorioAtivoState(cartorio);
          return;
        }
      }

      // Se não tiver cartório ativo salvo, usar o primeiro disponível
      if (cartoriosDisponiveis.length > 0) {
        setCartorioAtivoState(cartoriosDisponiveis[0]);
        // Persistir no banco
        await supabase
          .from("profiles")
          .update({ cartorio_ativo_id: cartoriosDisponiveis[0].id })
          .eq("user_id", userId);
      }
    } catch (error) {
      console.error("Erro ao carregar cartório ativo:", error);
    }
  }, []);

  // Alternar cartório ativo
  const setCartorioAtivo = useCallback(async (cartorioId: string) => {
    if (!user) return;

    const cartorio = cartorios.find(c => c.id === cartorioId);
    if (!cartorio) {
      toast.error("Cartório não encontrado");
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ cartorio_ativo_id: cartorioId })
        .eq("user_id", user.id);

      if (error) throw error;

      setCartorioAtivoState(cartorio);
      toast.success(`Cartório alterado para ${cartorio.nome}`);
    } catch (error) {
      console.error("Erro ao alterar cartório:", error);
      toast.error("Erro ao alterar cartório");
    }
  }, [user, cartorios]);

  // Recarregar cartórios
  const refreshCartorios = useCallback(async () => {
    if (!user) return;
    const cartoriosLoaded = await loadCartorios(user.id, isSuperAdmin);
    await loadCartorioAtivo(user.id, cartoriosLoaded);
  }, [user, isSuperAdmin, loadCartorios, loadCartorioAtivo]);

  // Efeito principal de carregamento
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (!user) {
        setCartorioAtivoState(null);
        setCartorios([]);
        setIsSuperAdmin(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Verificar se é super admin
        const superAdmin = await checkSuperAdmin(user.id);
        if (isMounted) setIsSuperAdmin(superAdmin);

        // Carregar cartórios
        const cartoriosLoaded = await loadCartorios(user.id, superAdmin);

        // Carregar cartório ativo
        if (isMounted && cartoriosLoaded.length > 0) {
          await loadCartorioAtivo(user.id, cartoriosLoaded);
        }
      } catch (error) {
        console.error("Erro ao inicializar tenant:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [user, checkSuperAdmin, loadCartorios, loadCartorioAtivo]);

  return (
    <TenantContext.Provider
      value={{
        cartorioAtivo,
        cartorios,
        isSuperAdmin,
        isLoading,
        setCartorioAtivo,
        refreshCartorios,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
