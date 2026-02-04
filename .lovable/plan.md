
# Plano: Sistema Multi-Tenant com Dados Reais e Perfis de Acesso

## Resumo da Situacao Atual

O banco de dados ja possui a estrutura multi-tenant parcialmente implementada:
- Tabela `cartorios` com 1 cartorio de demonstracao
- Tabela `user_roles` com alex@atlastechbrasil.com como super_admin
- Tabela `cartorio_usuarios` (vazia - sem vinculos)
- Funcoes de seguranca (`has_role`, `is_super_admin`, `user_can_access_cartorio`) ja criadas
- Coluna `cartorio_id` ja existe nas tabelas de dados

**Usuario peterson@atlastechbrasil.com ainda nao esta registrado no sistema.**

---

## Parte 1: Corrigir Erros de Build (Prioritario)

### 1.1 Restaurar Dependencias Faltantes

O `package.json` esta incompleto. Sera necessario adicionar:

```text
Dependencias de Producao:
- lucide-react
- react-hook-form, @hookform/resolvers, zod
- recharts
- sonner
- date-fns
- cmdk, vaul, embla-carousel-react, input-otp
- class-variance-authority, clsx, tailwind-merge
- @supabase/supabase-js
- Componentes Radix UI (@radix-ui/react-*)
- tailwindcss-animate

Dependencias de Desenvolvimento:
- typescript, @types/react, @types/react-dom
- @types/node, eslint, globals, typescript-eslint
- vitest, @testing-library/react, jsdom
```

### 1.2 Corrigir CSS do Tailwind v4

O Tailwind v4 requer sintaxe diferente. O arquivo `src/index.css` precisa ser atualizado:

```text
Antes (nao funciona no v4):
@layer base {
  * {
    @apply border-border;
  }
}

Depois (compativel com v4):
@layer base {
  * {
    border-color: hsl(var(--border));
  }
}
```

---

## Parte 2: TenantContext - Gerenciamento Global

### 2.1 Criar Contexto de Tenant

Arquivo: `src/contexts/TenantContext.tsx`

```text
Funcionalidades:
- Buscar cartorios disponiveis para o usuario
- Carregar cartorio ativo do profile (cartorio_ativo_id)
- Permitir alternar entre cartorios (super_admins)
- Verificar se usuario e super_admin
- Persistir selecao no banco de dados
```

Fluxo de inicializacao:
```text
1. Verificar se usuario e super_admin
   -> Se sim: buscar todos os cartorios
   -> Se nao: buscar apenas cartorios vinculados

2. Carregar cartorio_ativo_id do profile
   -> Se existir: usar como cartorio ativo
   -> Se nao: usar primeiro cartorio disponivel

3. Prover cartorioAtivo para toda a aplicacao
```

### 2.2 Integrar no App.tsx

Envolver a aplicacao com `TenantProvider` apos `AuthProvider`:

```text
<AuthProvider>
  <TenantProvider>
    ...aplicacao
  </TenantProvider>
</AuthProvider>
```

---

## Parte 3: Seletor de Cartorio no Sidebar

### 3.1 Atualizar AppSidebar.tsx

Para super_admins, adicionar dropdown abaixo do logo:

```text
+---------------------------+
|        [FinCart Logo]     |
+---------------------------+
| [Dropdown Cartorio]    v  |  <- Novo componente
+---------------------------+
|  Dashboard               |
|  Conciliacao Bancaria    |
|  ...                     |
+---------------------------+
```

Comportamento:
- Mostrar nome do cartorio ativo
- Click abre lista de cartorios disponiveis
- Selecionar cartorio atualiza contexto global
- Apenas visivel para super_admins

---

## Parte 4: Atualizar Hooks para Multi-Tenant

### 4.1 Modificar Todos os Hooks de Dados

Atualizar para incluir `cartorio_id` do contexto:

```text
Arquivos a modificar:
- src/hooks/useConciliacao.ts
- src/hooks/useDashboardStats.ts

Mudancas:
1. Importar useTenant()
2. Adicionar cartorio_id nas queries
3. Incluir cartorio_id nas mutacoes (insert/update)
4. Atualizar queryKey para invalidar ao trocar cartorio
```

Exemplo de mudanca:
```text
// Antes
const { data } = await supabase
  .from("contas_bancarias")
  .select("*");

// Depois
const { data } = await supabase
  .from("contas_bancarias")
  .select("*")
  .eq("cartorio_id", cartorioAtivoId);
```

---

## Parte 5: Tela de Usuarios com Dados Reais

### 5.1 Criar Hook useUsuarios

Arquivo: `src/hooks/useUsuarios.ts`

```text
Funcionalidades:
- useUsuariosDoCartorio(): listar usuarios do cartorio ativo
- useConvidarUsuario(): adicionar usuario ao cartorio
- useAtualizarPerfilUsuario(): modificar role/permissoes
- useRemoverUsuario(): desvincular usuario do cartorio
```

Query principal:
```text
SELECT 
  cu.id,
  cu.role,
  cu.ativo,
  p.nome,
  p.avatar_url,
  au.email,
  au.last_sign_in_at
FROM cartorio_usuarios cu
JOIN auth.users au ON au.id = cu.user_id
LEFT JOIN profiles p ON p.user_id = cu.user_id
WHERE cu.cartorio_id = :cartorio_ativo_id
```

### 5.2 Atualizar src/pages/Usuarios.tsx

Substituir dados mockados por dados reais:

```text
Mudancas:
1. Usar useUsuariosDoCartorio() em vez do array estatico
2. Implementar dialog de convite (InviteUserDialog)
3. Implementar edicao de perfil
4. Implementar ativar/desativar usuario
5. Mostrar loading states e empty states
```

### 5.3 Dialog de Convite de Usuario

Componente: `src/components/usuarios/ConvidarUsuarioDialog.tsx`

```text
Campos:
- Email (obrigatorio)
- Nome (opcional)
- Perfil/Role (select: admin, financeiro, operacional)

Fluxo:
1. Verificar se usuario ja existe no auth.users
2. Se existir: apenas criar vinculo em cartorio_usuarios
3. Se nao existir: criar usuario via Supabase Auth + vinculo
```

---

## Parte 6: Perfis de Acesso Personalizaveis

### 6.1 Criar Hook usePerfisAcesso

Arquivo: `src/hooks/usePerfisAcesso.ts`

```text
Funcionalidades:
- usePerfisDoCartorio(): listar perfis do cartorio
- useCriarPerfil(): novo perfil com permissoes
- useAtualizarPerfil(): modificar permissoes
- useDeletarPerfil(): remover perfil
```

### 6.2 Atualizar Aba "Perfis de Acesso"

Na pagina de Usuarios, aba "Perfis de Acesso":

```text
- Listar perfis do banco (perfis_acesso)
- Criar novos perfis com nome, descricao e permissoes
- Editor de permissoes granulares (checkboxes)
- Cores personalizaveis para badges
```

Estrutura de Permissoes:
```text
{
  "dashboard": { "view": true },
  "conciliacao": { "view": true, "edit": true },
  "contas": { "view": true, "create": true, "edit": true, "delete": false },
  "extratos": { "view": true, "import": true },
  "lancamentos": { "view": true, "create": true, "edit": true },
  "relatorios": { "view": true, "export": true },
  "usuarios": { "view": false, "manage": false },
  "configuracoes": { "view": false }
}
```

---

## Parte 7: Configurar Super Admin para Peterson

### 7.1 Nota Importante

O usuario `peterson@atlastechbrasil.com` ainda nao existe no sistema. 
Sera necessario:
1. Peterson criar conta na tela de auth (se ativada) OU
2. Criar manualmente via Supabase Dashboard OU
3. Adicionar funcionalidade de convite

Uma vez que o usuario exista, inserir o role:
```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'super_admin' 
FROM auth.users 
WHERE email = 'peterson@atlastechbrasil.com';
```

---

## Sequencia de Implementacao

```text
Etapa 1: Corrigir Build
+------------------------+
| 1. Restaurar package.json com dependencias     |
| 2. Corrigir sintaxe CSS do Tailwind v4         |
+------------------------+
         |
         v
Etapa 2: Infraestrutura de Tenant
+------------------------+
| 3. Criar TenantContext                         |
| 4. Integrar TenantProvider no App.tsx          |
| 5. Adicionar seletor de cartorio no Sidebar    |
+------------------------+
         |
         v
Etapa 3: Atualizar Queries
+------------------------+
| 6. Modificar hooks para filtrar por cartorio   |
+------------------------+
         |
         v
Etapa 4: Tela de Usuarios
+------------------------+
| 7. Criar useUsuarios hook                      |
| 8. Atualizar Usuarios.tsx com dados reais      |
| 9. Criar dialogs de convite e edicao           |
| 10. Implementar gerenciamento de perfis        |
+------------------------+
```

---

## Arquivos a Serem Criados/Modificados

```text
Novos Arquivos:
- src/contexts/TenantContext.tsx
- src/hooks/useUsuarios.ts
- src/hooks/usePerfisAcesso.ts
- src/components/usuarios/ConvidarUsuarioDialog.tsx
- src/components/usuarios/EditarUsuarioDialog.tsx
- src/components/usuarios/GerenciarPerfisDialog.tsx
- src/components/layout/CartorioSelector.tsx

Arquivos Modificados:
- package.json (restaurar dependencias)
- src/index.css (corrigir sintaxe Tailwind v4)
- src/App.tsx (adicionar TenantProvider)
- src/components/layout/AppSidebar.tsx (seletor de cartorio)
- src/hooks/useConciliacao.ts (filtrar por cartorio)
- src/hooks/useDashboardStats.ts (filtrar por cartorio)
- src/pages/Usuarios.tsx (dados reais)
```

---

## Resultado Esperado

Apos a implementacao:

1. **Super admins** (alex@atlastechbrasil.com) verao dropdown no sidebar para alternar entre cartorios

2. **Dados isolados** - cada cartorio tera seus proprios dados financeiros completamente separados

3. **Tela de Usuarios** exibira usuarios reais do cartorio ativo com:
   - Nome, email, perfil e status
   - Ultimo acesso
   - Acoes de editar, ativar/desativar, remover

4. **Perfis de Acesso** serao gerenciaveis com permissoes granulares por modulo

5. **Peterson** podera ser adicionado como super_admin assim que criar sua conta
