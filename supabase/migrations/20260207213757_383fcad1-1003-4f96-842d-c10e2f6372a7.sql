-- Função para super admins atualizarem perfis de outros usuários
CREATE OR REPLACE FUNCTION public.update_user_profile(
  target_user_id uuid,
  new_nome text DEFAULT NULL,
  new_cargo text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
BEGIN
  -- Verificar se o usuário que chama é super admin
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado: apenas super admins podem atualizar perfis de outros usuários';
  END IF;

  -- Atualizar o perfil
  UPDATE public.profiles
  SET 
    nome = COALESCE(new_nome, nome),
    cargo = COALESCE(new_cargo, cargo),
    updated_at = now()
  WHERE user_id = target_user_id;

  -- Retornar o perfil atualizado
  SELECT row_to_json(p) INTO result
  FROM public.profiles p
  WHERE p.user_id = target_user_id;

  RETURN result;
END;
$$;