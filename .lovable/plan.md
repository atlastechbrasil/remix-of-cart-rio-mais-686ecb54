# Plano: Adaptação Mobile-First do FinCart

## Objetivo

Ajustar todas as páginas e componentes para funcionamento adequado em dispositivos móveis, seguindo a abordagem mobile-first, sem afetar a experiência desktop existente.

---

## Princípios

1. **Mobile-First**: Estilos base para mobile, media queries para telas maiores
2. **Não quebrar funcionalidades**: Todas as features devem continuar funcionando
3. **Usabilidade**: Touch-friendly, áreas de toque adequadas (mínimo 44x44px)
4. **Performance**: Evitar componentes pesados em mobile

---

## Análise dos Componentes

### 1. Layout Principal

#### 1.1 AppSidebar
**Status**: Precisa adaptação  
**Problemas**:
- Sidebar fixa ocupa espaço em mobile
- Menu não é acessível em telas pequenas

**Solução**:
- Converter para drawer/sheet em mobile (< 768px)
- Adicionar botão hamburger no header
- Manter sidebar fixa apenas em desktop (>= 1024px)

#### 1.2 MainLayout
**Status**: Precisa adaptação  
**Problemas**:
- Layout flexbox pode não se adaptar bem

**Solução**:
- Sidebar como overlay em mobile
- Conteúdo principal ocupa 100% da largura

#### 1.3 PageHeader
**Status**: Precisa ajustes  
**Problemas**:
- Busca e seletor de cartório podem não caber
- Muitos elementos na mesma linha

**Solução**:
- Esconder busca em mobile (já parcialmente feito)
- Seletor de cartório em menu dropdown
- Stack vertical do título + ações em mobile

---

### 2. Páginas

#### 2.1 Dashboard (Index)
**Ajustes necessários**:
- Cards de estatísticas: 1 coluna em mobile, 2 em tablet, 4 em desktop
- Gráficos: largura 100%, altura adaptável
- Widgets: stack vertical em mobile

#### 2.2 Conciliação
**Ajustes necessários**:
- Painel dividido: tabs em mobile em vez de split view
- Tabelas: scroll horizontal ou cards em mobile
- Botões de ação: sticky footer em mobile

#### 2.3 Contas Bancárias
**Ajustes necessários**:
- Grid de cards: 1 coluna em mobile
- Dialogs: fullscreen em mobile
- Tabelas: cards responsivos

#### 2.4 Extratos
**Ajustes necessários**:
- Tabela de itens: scroll horizontal ou cards
- Filtros: collapsible em mobile
- Upload: área de drop adequada

#### 2.5 Lançamentos
**Ajustes necessários**:
- Tabela: cards em mobile
- Filtros: drawer lateral ou collapsible
- Dialog de novo lançamento: fullscreen

#### 2.6 Usuários
**Ajustes necessários**:
- Tabs: scroll horizontal se necessário
- Tabela: cards em mobile
- Dialogs: fullscreen

#### 2.7 Cartórios
**Ajustes necessários**:
- Stats cards: 1 coluna em mobile
- Tabela: cards responsivos
- Ações: menu contextual

#### 2.8 Configurações
**Ajustes necessários**:
- Layout de seções: stack vertical
- Forms: inputs full width

#### 2.9 Relatórios
**Ajustes necessários**:
- Filtros: collapsible
- Gráficos: scroll horizontal se necessário

---

### 3. Componentes UI

#### 3.1 Dialogs
**Padrão para todos**:
```tsx
// Mobile: fullscreen
// Desktop: centered modal
className="sm:max-w-lg w-full h-full sm:h-auto"
```

#### 3.2 Tabelas
**Padrão para todos**:
- Desktop: tabela tradicional
- Mobile: cards ou scroll horizontal com min-width

#### 3.3 Formulários
**Padrão para todos**:
- Inputs: full width em mobile
- Botões: full width ou stack vertical
- Labels: acima dos inputs (não ao lado)

#### 3.4 Grids
**Breakpoints padrão**:
```
- Mobile (<640px): 1 coluna
- Tablet (640-1024px): 2 colunas
- Desktop (>1024px): 3-4 colunas
```

---

## Ordem de Implementação

### Fase 1: Layout Base ✅
1. [x] Criar componente MobileNav (hamburger + sheet) - MobileHeader.tsx
2. [x] Adaptar AppSidebar para responsivo - Sheet mobile + sidebar desktop
3. [x] Adaptar MainLayout - Condicional desktop/mobile
4. [x] Adaptar PageHeader - Responsivo com breakpoints

### Fase 2: Componentes Compartilhados
5. [ ] Criar componente ResponsiveTable (tabela/cards)
6. [ ] Criar componente ResponsiveDialog (fullscreen mobile)
7. [ ] Padronizar formulários

### Fase 3: Páginas Principais
8. [ ] Dashboard (Index)
9. [ ] Conciliação
10. [ ] Lançamentos
11. [ ] Contas Bancárias

### Fase 4: Páginas Secundárias
12. [ ] Extratos
13. [ ] Usuários
14. [ ] Cartórios
15. [ ] Configurações
16. [ ] Relatórios

### Fase 5: Testes e Refinamentos
17. [ ] Testar em diferentes dispositivos
18. [ ] Ajustar touch targets
19. [ ] Verificar performance
20. [ ] Corrigir bugs visuais

---

## Breakpoints Tailwind

```
sm: 640px   (tablet pequeno)
md: 768px   (tablet)
lg: 1024px  (desktop pequeno)
xl: 1280px  (desktop)
2xl: 1536px (desktop grande)
```

---

## Checklist por Componente

Para cada componente/página:
- [ ] Funciona em 320px de largura?
- [ ] Touch targets >= 44px?
- [ ] Texto legível sem zoom?
- [ ] Formulários usáveis?
- [ ] Navegação acessível?
- [ ] Não quebra funcionalidade existente?

---

## Notas Técnicas

1. **Não usar `@apply` com variáveis** (restrição do Tailwind v4)
2. **Dialogs**: Usar Sheet do shadcn para mobile quando apropriado
3. **Tabelas longas**: Considerar virtualização para performance
4. **Imagens**: Lazy loading obrigatório
5. **Gestos**: Swipe para voltar/fechar onde apropriado

---

## Estimativa

- **Fase 1**: 2-3 iterações
- **Fase 2**: 1-2 iterações
- **Fase 3**: 3-4 iterações
- **Fase 4**: 2-3 iterações
- **Fase 5**: 1-2 iterações

**Total estimado**: 9-14 iterações
