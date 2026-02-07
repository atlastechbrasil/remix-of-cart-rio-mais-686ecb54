-- Função security definer para buscar emails de usuários
-- Apenas super admins podem usar esta função

CREATE OR REPLACE FUNCTION public.get_user_emails(user_ids uuid[])
RETURNS TABLE (user_id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o usuário que chama é super admin
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado: apenas super admins podem acessar emails de usuários';
  END IF;

  RETURN QUERY
  SELECT au.id AS user_id, au.email::text
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$$;

-- Conceder permissão para usuários autenticados chamarem a função
GRANT EXECUTE ON FUNCTION public.get_user_emails(uuid[]) TO authenticated;