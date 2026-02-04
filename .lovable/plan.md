# Plano: Multi-Tenancy e Gestão de Usuários

## Status: ✅ IMPLEMENTADO

## Resumo

Implementada funcionalidade completa de multi-tenancy com isolamento de dados por cartório, incluindo:
- Contexto global de tenant (`TenantContext`)
- Seletor de cartório no sidebar
- Tela de usuários com dados reais do banco
- Hooks atualizados para filtrar por `cartorio_id`

## Implementações Realizadas

### 1. Super Administradores ✅
- Migration SQL executada para peterson@atlastechbrasil.com
- alex@atlastechbrasil.com já tinha role configurado

### 2. TenantContext ✅
Criado `src/contexts/TenantContext.tsx`:
- Estado: `cartorioAtivo`, `cartorios`, `isSuperAdmin`, `isLoading`
- Função `setCartorioAtivo(id)` persiste no campo `cartorio_ativo_id` em `profiles`
- Super admins veem todos os cartórios
- Usuários comuns veem apenas cartórios vinculados

### 3. CartorioSelector ✅
Criado `src/components/layout/CartorioSelector.tsx`:
- Dropdown integrado ao AppSidebar
- Mostra badge "Super Admin" para super admins
- Suporta estado colapsado do sidebar

### 4. Hooks Atualizados ✅
Modificados para filtrar por `cartorio_id`:
- `useConciliacao.ts`: todas as queries e mutations
- `useDashboardStats.ts`: todas as estatísticas

### 5. Tela de Usuários ✅
Refatorada `src/pages/Usuarios.tsx`:
- Dados reais de `cartorio_usuarios` e `perfis_acesso`
- Cards de usuários com role, status e ações
- Tabs: Usuários e Perfis de Acesso

### 6. Dialogs de Gerenciamento ✅
- `NovoUsuarioDialog`: adicionar usuário por UUID
- `NovoPerfilDialog`: criar perfil com permissões granulares

## Arquivos Criados
- `src/contexts/TenantContext.tsx`
- `src/components/layout/CartorioSelector.tsx`
- `src/hooks/useUsuarios.ts`
- `src/components/usuarios/NovoUsuarioDialog.tsx`
- `src/components/usuarios/NovoPerfilDialog.tsx`

## Arquivos Modificados
- `src/App.tsx` - TenantProvider adicionado
- `src/components/layout/AppSidebar.tsx` - CartorioSelector e badge
- `src/hooks/useConciliacao.ts` - filtro por cartorio_id
- `src/hooks/useDashboardStats.ts` - filtro por cartorio_id
- `src/pages/Usuarios.tsx` - dados reais

## Próximos Passos (Opcionais)
- [ ] Busca de usuários por e-mail (requer edge function)
- [ ] Hook `usePermissoes` para controle granular de UI
- [ ] Edição de usuários e perfis existentes
