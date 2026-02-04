
# Plano: Implementar Multi-Tenancy e Tela de Usuarios com Dados Reais

## Resumo

Implementar a funcionalidade completa de multi-tenancy permitindo que administradores alternem entre cartorios, com isolamento de dados entre eles. Tambem substituir os dados mockados na tela de Usuarios por dados reais do banco de dados, incluindo gerenciamento de perfis de acesso personalizaveis.

---

## Parte 1: Configuracao de Super Administradores

### 1.1 Atribuir Role ao Peterson

Criar migracao SQL para:
- Adicionar o usuario peterson@atlastechbrasil.com como super_admin na tabela `user_roles`

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'peterson@atlastechbrasil.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## Parte 2: TenantContext - Gerenciamento Global do Cartorio Ativo

### 2.1 Criar o Contexto de Tenant

Criar `src/contexts/TenantContext.tsx` com:

**Estado gerenciado:**
- `cartorioAtivo`: O cartorio selecionado atualmente
- `cartorios`: Lista de cartorios disponiveis para o usuario
- `isSuperAdmin`: Se o usuario e super admin (acesso global)
- `isLoading`: Estado de carregamento

**Funcionalidades:**
- `setCartorioAtivo(id)`: Alterna o cartorio ativo e persiste no banco
- Carregamento automatico do `cartorio_ativo_id` do profile do usuario
- Super admins podem ver todos os cartorios
- Usuarios comuns veem apenas cartorios vinculados

### 2.2 Adicionar Provider na Arvore de Componentes

Envolver o app com `TenantProvider` em `App.tsx`, apos o `AuthProvider`.

---

## Parte 3: Seletor de Cartorio na Interface

### 3.1 Componente CartorioSelector

Criar `src/components/layout/CartorioSelector.tsx`:
- Dropdown/Select mostrando o cartorio ativo
- Lista de cartorios disponiveis
- Feedback visual do cartorio selecionado
- Apenas visivel para usuarios com acesso a multiplos cartorios

### 3.2 Integracao no Sidebar

Adicionar o `CartorioSelector` no `AppSidebar.tsx`:
- Posicionado abaixo do logo
- Mostra nome do cartorio atual
- Permite troca rapida para super admins

---

## Parte 4: Adaptar Hooks para Multi-Tenancy

### 4.1 Atualizar useConciliacao.ts

Modificar todos os hooks de dados para:
- Obter `cartorioAtivo` do `TenantContext`
- Incluir `cartorio_id` nas consultas
- Incluir `cartorio_id` nas insercoes

Exemplo de mudanca:
```typescript
// Antes
.from("lancamentos").select("*")

// Depois
.from("lancamentos").select("*").eq("cartorio_id", cartorioAtivoId)
```

### 4.2 Atualizar useDashboardStats.ts

Mesma logica - filtrar dados pelo cartorio ativo.

---

## Parte 5: Tela de Usuarios com Dados Reais

### 5.1 Criar Hook useUsuarios

Criar `src/hooks/useUsuarios.ts` com:

**Queries:**
- `useCartorioUsuarios()`: Lista usuarios do cartorio ativo
- `useCartorioUsuario(id)`: Detalhes de um usuario
- `usePerfisAcesso()`: Lista perfis de acesso do cartorio

**Mutations:**
- `useCreateCartorioUsuario()`: Vincular usuario ao cartorio
- `useUpdateCartorioUsuario()`: Atualizar role/status
- `useDeleteCartorioUsuario()`: Remover vinculo
- `useCreatePerfilAcesso()`: Criar novo perfil
- `useUpdatePerfilAcesso()`: Editar perfil
- `useDeletePerfilAcesso()`: Remover perfil

### 5.2 Refatorar Pagina Usuarios.tsx

Substituir dados mockados por dados reais:

**Aba Usuarios:**
- Buscar dados de `cartorio_usuarios` com join em `profiles` e `auth.users`
- Exibir nome, email, role, status (ativo/inativo)
- Acoes: editar, alterar perfil, ativar/desativar, excluir

**Aba Perfis de Acesso:**
- Buscar dados de `perfis_acesso` do cartorio ativo
- Criar perfis com permissoes granulares (JSON)
- Editar/excluir perfis existentes

### 5.3 Dialogs de Gerenciamento

Criar componentes:
- `NovoUsuarioDialog`: Convite/vinculacao de usuario
- `EditarUsuarioDialog`: Alteracao de dados e role
- `NovoPerfilDialog`: Criacao de perfil de acesso
- `EditarPerfilDialog`: Edicao de perfil

---

## Parte 6: Sistema de Permissoes

### 6.1 Hook usePermissoes

Criar `src/hooks/usePermissoes.ts`:
- `hasPermission(permissao)`: Verifica se usuario tem permissao especifica
- `getPermissoes()`: Retorna lista de permissoes do usuario

### 6.2 Estrutura de Permissoes

```typescript
const PERMISSOES = {
  dashboard: { view: true },
  conciliacao: { view: true, create: true, edit: true, delete: true },
  contas: { view: true, create: true, edit: true, delete: true },
  lancamentos: { view: true, create: true, edit: true, delete: true },
  usuarios: { view: true, manage: true },
  configuracoes: { view: true, edit: true },
  relatorios: { view: true, export: true }
}
```

---

## Arquitetura do Fluxo

```text
+-------------------+
|   AuthContext     |
|  (usuario atual)  |
+---------+---------+
          |
          v
+---------+---------+
|  TenantContext    |
| (cartorio ativo)  |
+---------+---------+
          |
    +-----+-----+
    |           |
    v           v
+-------+   +--------+
| Hooks |   |  RLS   |
| (API) |   |(banco) |
+-------+   +--------+
```

---

## Detalhes Tecnicos

### Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/contexts/TenantContext.tsx` | Contexto de multi-tenancy |
| `src/components/layout/CartorioSelector.tsx` | Seletor de cartorio |
| `src/hooks/useUsuarios.ts` | Hooks para usuarios e perfis |
| `src/hooks/usePermissoes.ts` | Verificacao de permissoes |
| `src/components/usuarios/NovoUsuarioDialog.tsx` | Dialog criar usuario |
| `src/components/usuarios/EditarUsuarioDialog.tsx` | Dialog editar usuario |
| `src/components/usuarios/NovoPerfilDialog.tsx` | Dialog criar perfil |
| `src/components/usuarios/EditarPerfilDialog.tsx` | Dialog editar perfil |

### Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/App.tsx` | Adicionar TenantProvider |
| `src/components/layout/AppSidebar.tsx` | Adicionar CartorioSelector |
| `src/hooks/useConciliacao.ts` | Filtrar por cartorio_id |
| `src/hooks/useDashboardStats.ts` | Filtrar por cartorio_id |
| `src/pages/Usuarios.tsx` | Usar dados reais |

### Migracao SQL

- Atribuir super_admin ao peterson@atlastechbrasil.com
- Garantir dados de seed para perfis_acesso padrao

---

## Ordem de Implementacao

1. Migracao SQL (super_admin para peterson)
2. TenantContext
3. CartorioSelector + integracao no Sidebar
4. Adaptar hooks existentes para multi-tenancy
5. Hook useUsuarios
6. Refatorar pagina Usuarios.tsx
7. Dialogs de gerenciamento
8. Hook usePermissoes (opcional para fase futura)

---

## Consideracoes de Seguranca

- Todas as verificacoes de acesso sao feitas via RLS no banco
- O frontend e apenas uma camada de UX, nunca confia apenas nele
- Super admins verificados via funcao `is_super_admin()` no banco
- Roles armazenados em tabela separada (`user_roles`), nunca em profiles
