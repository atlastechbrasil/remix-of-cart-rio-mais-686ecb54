
# Plano: Sistema Multi-Tenant com Perfis de Acesso

## Visão Geral

Este plano implementa um sistema completo de multi-tenant onde:
- Cada **cartório** (tenant) terá seus dados isolados
- **Administradores globais** poderão alternar entre cartórios
- Usuários terão **perfis de acesso personalizáveis** com permissões granulares
- A tela de Usuários exibirá dados reais do banco de dados

## Correção Prévia: Dependências Faltando

Antes de implementar as funcionalidades, será necessário corrigir os erros de build restaurando as dependências faltantes no `package.json`:
- lucide-react, react-hook-form, zod, @hookform/resolvers, recharts, sonner, date-fns, cmdk, vaul, embla-carousel-react, input-otp
- Componentes Radix UI (@radix-ui/*)
- class-variance-authority, @supabase/supabase-js

---

## Parte 1: Estrutura do Banco de Dados

### 1.1 Criar Tabela de Cartórios (Tenants)

```text
+------------------+
|    cartorios     |
+------------------+
| id (uuid)        |
| nome             |
| cnpj             |
| endereco         |
| telefone         |
| email            |
| ativo            |
| created_at       |
| updated_at       |
+------------------+
```

### 1.2 Criar Sistema de Roles (Funções)

Seguindo as melhores práticas de segurança, os roles serão armazenados em tabela separada:

```text
+------------------------+
|  app_role (enum)       |
+------------------------+
| super_admin            | -> Acesso a todos os cartórios
| admin                  | -> Administrador do cartório
| financeiro             | -> Acesso financeiro
| operacional            | -> Acesso básico
+------------------------+

+------------------+
|   user_roles     |
+------------------+
| id               |
| user_id          |
| role             |
| created_at       |
+------------------+
```

### 1.3 Criar Tabela de Permissões por Cartório

```text
+---------------------+
| cartorio_usuarios   |
+---------------------+
| id                  |
| cartorio_id         |
| user_id             |
| role (app_role)     |
| ativo               |
| created_at          |
| updated_at          |
+---------------------+
```

### 1.4 Criar Tabela de Perfis Personalizáveis

```text
+---------------------+
|   perfis_acesso     |
+---------------------+
| id                  |
| cartorio_id         |
| nome                |
| descricao           |
| permissoes (jsonb)  |
| cor                 |
| created_at          |
| updated_at          |
+---------------------+
```

### 1.5 Atualizar Tabelas Existentes

Adicionar `cartorio_id` em todas as tabelas de dados:
- `contas_bancarias`
- `extratos`
- `extrato_itens`
- `lancamentos`
- `conciliacoes`

---

## Parte 2: Políticas de Segurança (RLS)

### 2.1 Função de Verificação de Acesso

Criar função `SECURITY DEFINER` para verificar permissões sem recursão:

```sql
-- Verifica se usuário tem role específico
CREATE FUNCTION has_role(user_id uuid, role app_role)

-- Verifica se usuário pertence a um cartório
CREATE FUNCTION user_belongs_to_cartorio(user_id uuid, cartorio_id uuid)

-- Retorna cartório ativo do usuário (para contexto)
CREATE FUNCTION get_user_active_cartorio(user_id uuid)
```

### 2.2 Atualizar RLS das Tabelas

Modificar políticas para filtrar por `cartorio_id`:
- Super admins: acesso a todos os cartórios
- Usuários normais: apenas cartórios vinculados

---

## Parte 3: Contexto de Tenant no Frontend

### 3.1 Criar TenantContext

```text
src/contexts/TenantContext.tsx
- cartorioAtivo: cartório selecionado
- cartorios: lista de cartórios disponíveis
- setCartorioAtivo(): alternar entre cartórios
- isLoading, isSuperAdmin
```

### 3.2 Seletor de Cartório no Sidebar

Para super_admins, exibir dropdown no header do sidebar para alternar entre cartórios.

---

## Parte 4: Tela de Usuários com Dados Reais

### 4.1 Hook useUsuarios

```text
src/hooks/useUsuarios.ts
- Buscar usuários do cartório ativo
- Incluir profile, roles e permissões
- CRUD de usuários
```

### 4.2 Componentes

- Lista de usuários com dados reais
- Dialog para convidar/editar usuários
- Gerenciador de perfis de acesso

---

## Parte 5: Configurar Admins Iniciais

Inserir registros para os usuários especificados:
- `alex@atlastechbrasil.com` -> super_admin
- `peterson@atlastechbrasil.com` -> super_admin

---

## Sequência de Implementação

1. **Corrigir dependências** do package.json
2. **Migração do banco** - criar tabelas e enums
3. **Atualizar RLS** - políticas multi-tenant
4. **TenantContext** - contexto de cartório ativo
5. **Atualizar hooks** - incluir cartorio_id nas queries
6. **Seletor de cartório** - UI para alternar
7. **Tela de Usuários** - dados reais + CRUD
8. **Perfis de acesso** - gerenciamento de permissões

---

## Detalhes Técnicos

### Migração SQL Principal

```sql
-- Enum de roles
CREATE TYPE app_role AS ENUM ('super_admin', 'admin', 'financeiro', 'operacional');

-- Tabela de cartórios
CREATE TABLE cartorios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar NOT NULL,
  cnpj varchar,
  endereco text,
  telefone varchar,
  email varchar,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de roles globais (super_admin)
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Vínculo usuário-cartório
CREATE TABLE cartorio_usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cartorio_id uuid REFERENCES cartorios(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'operacional',
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (cartorio_id, user_id)
);

-- Perfis de acesso personalizáveis
CREATE TABLE perfis_acesso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cartorio_id uuid REFERENCES cartorios(id) ON DELETE CASCADE NOT NULL,
  nome varchar NOT NULL,
  descricao text,
  permissoes jsonb NOT NULL DEFAULT '[]',
  cor varchar DEFAULT 'primary',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Adicionar cartorio_id nas tabelas existentes
ALTER TABLE contas_bancarias ADD COLUMN cartorio_id uuid REFERENCES cartorios(id);
ALTER TABLE extratos ADD COLUMN cartorio_id uuid REFERENCES cartorios(id);
ALTER TABLE extrato_itens ADD COLUMN cartorio_id uuid REFERENCES cartorios(id);
ALTER TABLE lancamentos ADD COLUMN cartorio_id uuid REFERENCES cartorios(id);
ALTER TABLE conciliacoes ADD COLUMN cartorio_id uuid REFERENCES cartorios(id);

-- Funções de verificação (SECURITY DEFINER)
CREATE FUNCTION has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE FUNCTION is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT has_role(_user_id, 'super_admin')
$$;

CREATE FUNCTION user_can_access_cartorio(_user_id uuid, _cartorio_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT is_super_admin(_user_id) OR EXISTS (
    SELECT 1 FROM cartorio_usuarios
    WHERE user_id = _user_id 
    AND cartorio_id = _cartorio_id 
    AND ativo = true
  )
$$;

-- Configurar admins iniciais
INSERT INTO user_roles (user_id, role)
SELECT id, 'super_admin' FROM auth.users 
WHERE email IN ('alex@atlastechbrasil.com', 'peterson@atlastechbrasil.com');
```

### Estrutura de Permissões (JSONB)

```json
{
  "dashboard": { "view": true },
  "conciliacao": { "view": true, "edit": true },
  "contas": { "view": true, "create": true, "edit": true, "delete": false },
  "extratos": { "view": true, "import": true, "delete": false },
  "lancamentos": { "view": true, "create": true, "edit": true, "delete": false },
  "relatorios": { "view": true, "export": true },
  "usuarios": { "view": false, "manage": false },
  "configuracoes": { "view": false, "edit": false }
}
```

### TenantContext

```typescript
interface TenantContextType {
  cartorioAtivo: Cartorio | null;
  cartorios: Cartorio[];
  userRole: AppRole | null;
  isSuperAdmin: boolean;
  isLoading: boolean;
  setCartorioAtivo: (id: string) => void;
  refetch: () => void;
}
```

---

## Resultado Esperado

- Super admins podem visualizar e alternar entre todos os cartórios
- Cada cartório tem dados completamente isolados
- Usuários veem apenas dados do cartório onde têm acesso
- Perfis de acesso são configuráveis por cartório
- Tela de Usuários exibe dados reais com CRUD funcional
