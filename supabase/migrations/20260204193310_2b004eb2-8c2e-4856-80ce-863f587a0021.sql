-- Adicionar peterson@atlastechbrasil.com como super_admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users
WHERE email = 'peterson@atlastechbrasil.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.users.id AND ur.role = 'super_admin'
  );