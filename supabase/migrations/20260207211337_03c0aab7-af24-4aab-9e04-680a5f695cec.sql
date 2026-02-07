-- Tornar perfis de acesso globais (independentes de cartório)

-- 1. Remover a constraint de cartorio_id (tornar nullable)
ALTER TABLE public.perfis_acesso ALTER COLUMN cartorio_id DROP NOT NULL;

-- 2. Atualizar RLS policies para acesso global
-- Remover policies existentes
DROP POLICY IF EXISTS "Admins podem gerenciar perfis do seu cartório" ON public.perfis_acesso;
DROP POLICY IF EXISTS "Usuários podem ver perfis do seu cartório" ON public.perfis_acesso;

-- 3. Criar nova policy: Super admins podem ver e gerenciar todos os perfis
CREATE POLICY "Super admins podem gerenciar todos os perfis"
  ON public.perfis_acesso
  FOR ALL
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- 4. Criar policy: Usuários autenticados podem ver perfis globais (onde cartorio_id é null)
CREATE POLICY "Usuários podem ver perfis globais"
  ON public.perfis_acesso
  FOR SELECT
  USING (
    cartorio_id IS NULL 
    OR public.user_can_access_cartorio(auth.uid(), cartorio_id)
  );

-- 5. Migrar perfis existentes para globais (remover cartorio_id)
UPDATE public.perfis_acesso SET cartorio_id = NULL;