# Plano: Implementação Completa da Tela de Conciliação Bancária

## Visão Geral

Sistema de conciliação bancária com foco em **fechamento diário**, permitindo comparação entre extratos bancários e lançamentos do sistema, com visualização detalhada de itens conciliados, pendentes e divergentes, além de funcionalidades de edição, filtros avançados e histórico de conciliações.

---

## Análise da Implementação Atual

### ✅ O que já existe:
- Painel dividido (ResizablePanelGroup) para extrato vs lançamentos
- Seleção e vinculação de itens (match)
- KPIs básicos (conciliados, pendentes, divergentes, taxa)
- Hooks para CRUD de conciliações (`useVincularConciliacao`, `useDesvincularConciliacao`)
- Suporte a cartório ativo (multi-tenant)
- Versão mobile com tabs

### ❌ O que falta:
- Filtros por data (foco no dia/fechamento diário)
- Detalhamento de itens já conciliados
- Edição de conciliações finalizadas
- Visualização de divergências com detalhes
- Histórico de conciliações anteriores
- Pesquisa de lançamentos/itens de extrato
- Sugestões automáticas de match
- Relatório de fechamento do dia

---

## Fase 1: Estrutura de Dados e Hooks Avançados

### 1.1 Novos Hooks de Consulta

**Arquivo:** `src/hooks/useConciliacaoAdvanced.ts`

```typescript
// Hooks planejados:
- useConciliacoesByDate(date: Date) // Conciliações por data específica
- useConciliacaoHistory(filters) // Histórico com filtros avançados
- useConciliacaoDetalhes(conciliacaoId) // Detalhes completos de uma conciliação
- useExtratoItensByDateRange(contaId, startDate, endDate) // Itens por período
- useLancamentosByDateRange(startDate, endDate) // Lançamentos por período
- useSugestoesConciliacao(extratoItemId) // Sugestões automáticas de match
- useUpdateConciliacao() // Editar conciliação existente
```

### 1.2 Tipos Adicionais

**Arquivo:** `src/types/conciliacao.ts`

```typescript
// Novos tipos:
interface ConciliacaoFiltros {
  dataInicio?: Date;
  dataFim?: Date;
  status?: StatusConciliacao[];
  contaId?: string;
  busca?: string;
  tipoLancamento?: TipoLancamento[];
  valorMinimo?: number;
  valorMaximo?: number;
}

interface ConciliacaoDetalhada extends Conciliacao {
  extrato_item: ExtratoItem;
  lancamento: Lancamento;
  conta_bancaria: ContaBancaria;
}

interface FechamentoDiario {
  data: string;
  totalConciliados: number;
  totalPendentes: number;
  totalDivergentes: number;
  valorConciliado: number;
  valorPendente: number;
  diferencaTotal: number;
}

interface SugestaoConciliacao {
  lancamento: Lancamento;
  score: number; // 0-100 (match confidence)
  motivos: string[];
}
```

---

## Fase 2: Componentes de Filtros e Navegação

### 2.1 Filtro de Data Rápido (Foco Diário)

**Arquivo:** `src/components/conciliacao/FiltroDataConciliacao.tsx`

Funcionalidades:
- [ ] Seletor de data com calendário
- [ ] Atalhos rápidos: "Hoje", "Ontem", "Últimos 7 dias", "Este mês"
- [ ] Indicador visual do dia sendo trabalhado
- [ ] Navegação por setas (< dia anterior | próximo dia >)
- [ ] Badge com quantidade de itens pendentes por dia

### 2.2 Filtros Avançados

**Arquivo:** `src/components/conciliacao/FiltrosAvancadosConciliacao.tsx`

Funcionalidades:
- [ ] Sheet/Drawer com filtros completos
- [ ] Filtro por status (pendente, conciliado, divergente)
- [ ] Filtro por tipo (receita/despesa ou crédito/débito)
- [ ] Filtro por faixa de valor (mín-máx)
- [ ] Filtro por categoria de lançamento
- [ ] Botão de limpar todos os filtros
- [ ] Contador de filtros ativos

### 2.3 Barra de Pesquisa

**Arquivo:** `src/components/conciliacao/SearchConciliacao.tsx`

Funcionalidades:
- [ ] Input de busca com debounce
- [ ] Busca em descrição, categoria, valor
- [ ] Highlight nos resultados encontrados
- [ ] Busca simultânea em extrato e lançamentos

---

## Fase 3: Componentes de Visualização por Status

### 3.1 Tabs de Status

**Arquivo:** `src/components/conciliacao/ConciliacaoTabs.tsx`

Estrutura:
- [ ] Tab "Pendentes" - Itens ainda não conciliados (visão atual)
- [ ] Tab "Conciliados" - Itens já vinculados com sucesso
- [ ] Tab "Divergentes" - Itens com diferença de valor
- [ ] Tab "Histórico" - Todas as conciliações realizadas

### 3.2 Lista de Itens Conciliados

**Arquivo:** `src/components/conciliacao/ListaConciliados.tsx`

Funcionalidades:
- [ ] Exibir pares vinculados (extrato ↔ lançamento)
- [ ] Mostrar data/hora da conciliação
- [ ] Mostrar usuário que conciliou
- [ ] Botão para desvincular (com confirmação)
- [ ] Botão para editar observação

### 3.3 Lista de Divergências

**Arquivo:** `src/components/conciliacao/ListaDivergencias.tsx`

Funcionalidades:
- [ ] Destacar a diferença de valor
- [ ] Mostrar valor do extrato vs valor do lançamento
- [ ] Indicador visual (verde = extrato maior, vermelho = lançamento maior)
- [ ] Campo para observação/justificativa
- [ ] Opção de "Aceitar divergência" ou "Corrigir"
- [ ] Histórico de alterações

---

## Fase 4: Diálogos e Modais

### 4.1 Dialog de Detalhes da Conciliação

**Arquivo:** `src/components/conciliacao/DetalhesConciliacaoDialog.tsx`

Funcionalidades:
- [ ] Exibir todos os dados do par conciliado
- [ ] Mostrar histórico de alterações
- [ ] Campos editáveis: observação, justificativa
- [ ] Timeline de ações (criação, edições, etc.)

### 4.2 Dialog de Edição de Conciliação

**Arquivo:** `src/components/conciliacao/EditarConciliacaoDialog.tsx`

Funcionalidades:
- [ ] Alterar observação/justificativa
- [ ] Marcar divergência como aceita/resolvida
- [ ] Opção de desvincular e revincular com outro item
- [ ] Histórico de alterações
- [ ] Validação e confirmação antes de salvar

### 4.3 Dialog de Fechamento do Dia

**Arquivo:** `src/components/conciliacao/FechamentoDiaDialog.tsx`

Funcionalidades:
- [ ] Resumo do dia selecionado
- [ ] Totais por status
- [ ] Lista de itens pendentes
- [ ] Opção de "Fechar dia" (marcar como revisado)
- [ ] Geração de relatório do fechamento

### 4.4 Dialog de Sugestões de Match

**Arquivo:** `src/components/conciliacao/SugestoesConciliacaoDialog.tsx`

Funcionalidades:
- [ ] Quando selecionar um item do extrato, sugerir lançamentos compatíveis
- [ ] Ordenar por score de compatibilidade
- [ ] Mostrar motivos da sugestão (valor similar, data próxima, descrição)
- [ ] Click para selecionar e vincular rapidamente

---

## Fase 5: Funcionalidades de Fechamento Diário

### 5.1 Widget de Resumo do Dia

**Arquivo:** `src/components/conciliacao/ResumoDiaConciliacao.tsx`

Funcionalidades:
- [ ] Card com resumo do dia atual/selecionado
- [ ] Progress bar de conciliação
- [ ] Totais: conciliados, pendentes, divergentes
- [ ] Valores monetários totalizados
- [ ] Indicador de "dia fechado" vs "em andamento"

### 5.2 Histórico de Fechamentos

**Arquivo:** `src/components/conciliacao/HistoricoFechamentos.tsx`

Funcionalidades:
- [ ] Calendário visual com status por dia
- [ ] Dias verdes = totalmente conciliados
- [ ] Dias amarelos = parcialmente conciliados
- [ ] Dias vermelhos = pendências ou divergências
- [ ] Click para navegar ao dia específico

---

## Fase 6: Sugestões Automáticas de Match

### 6.1 Algoritmo de Sugestão

**Arquivo:** `src/lib/conciliacao-matcher.ts`

Critérios de match:
- [ ] Valor exato (100% match)
- [ ] Valor aproximado (tolerância configurável)
- [ ] Data similar (mesmo dia, ±1 dia, ±3 dias)
- [ ] Descrição similar (fuzzy match)
- [ ] Histórico de padrões anteriores

### 6.2 Auto-conciliação (Opcional)

Funcionalidades:
- [ ] Botão "Auto-conciliar" para matches com 100% de confiança
- [ ] Confirmação antes de executar
- [ ] Relatório dos itens auto-conciliados
- [ ] Opção de desfazer em lote

---

## Fase 7: Refatoração da Página Principal

### 7.1 Nova Estrutura de `Conciliacao.tsx`

Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Título + Seletor de Conta + Filtro de Data          │
├─────────────────────────────────────────────────────────────┤
│ Resumo do Dia: [Conciliados] [Pendentes] [Divergentes] [%]  │
├─────────────────────────────────────────────────────────────┤
│ Tabs: [Pendentes] [Conciliados] [Divergentes] [Histórico]   │
├─────────────────────────────────────────────────────────────┤
│ Barra: Pesquisa | Filtros Avançados | Auto-conciliar        │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                  │
│   Extrato Bancário       │    Lançamentos do Sistema        │
│   (com filtros aplicados)│    (com filtros aplicados)       │
│                          │                                  │
│   [Selecionar item]      │    [Selecionar item]             │
│                          │                                  │
├──────────────────────────┴──────────────────────────────────┤
│ Footer: [Sugestões] [Vincular Selecionados] [Fechamento]    │
└─────────────────────────────────────────────────────────────┘
```

---

## Fase 8: Exportação e Relatórios

### 8.1 Relatório de Conciliação

**Arquivo:** `src/components/conciliacao/RelatorioConciliacao.tsx`

Funcionalidades:
- [ ] Exportar PDF do fechamento do dia
- [ ] Exportar Excel com todos os dados
- [ ] Filtro por período para relatório
- [ ] Incluir assinatura/aprovação digital

---

## Fase 9: Melhorias de UX

### 9.1 Atalhos de Teclado

- [ ] `Ctrl+F` = Focar na busca
- [ ] `Enter` = Vincular selecionados
- [ ] `Esc` = Limpar seleção
- [ ] `←` / `→` = Navegar entre dias

### 9.2 Feedback Visual

- [ ] Animações ao vincular/desvincular
- [ ] Toast com undo para ações destrutivas
- [ ] Indicadores de loading granulares
- [ ] Empty states informativos

### 9.3 Responsividade Mobile

- [ ] Swipe para navegar entre tabs
- [ ] Pull-to-refresh
- [ ] Bottom sheet para ações
- [ ] Filtros em drawer full-screen

---

## Estrutura de Arquivos Final

```
src/
├── components/
│   └── conciliacao/
│       ├── FiltroDataConciliacao.tsx
│       ├── FiltrosAvancadosConciliacao.tsx
│       ├── SearchConciliacao.tsx
│       ├── ConciliacaoTabs.tsx
│       ├── ListaConciliados.tsx
│       ├── ListaDivergencias.tsx
│       ├── DetalhesConciliacaoDialog.tsx
│       ├── EditarConciliacaoDialog.tsx
│       ├── FechamentoDiaDialog.tsx
│       ├── SugestoesConciliacaoDialog.tsx
│       ├── ResumoDiaConciliacao.tsx
│       ├── HistoricoFechamentos.tsx
│       ├── RelatorioConciliacao.tsx
│       ├── ItemCard.tsx (extraído)
│       ├── ExtratoList.tsx (extraído)
│       └── LancamentoList.tsx (extraído)
├── hooks/
│   ├── useConciliacao.ts (existente)
│   └── useConciliacaoAdvanced.ts (novo)
├── lib/
│   └── conciliacao-matcher.ts (novo)
├── types/
│   └── conciliacao.ts (novo)
└── pages/
    └── Conciliacao.tsx (refatorado)
```

---

## Ordem de Implementação Recomendada

### Sprint 1: Fundamentos
1. ✅ Criar arquivo de tipos `src/types/conciliacao.ts`
2. ✅ Extrair componentes existentes para arquivos separados
3. ✅ Implementar `FiltroDataConciliacao` com navegação diária
4. ✅ Adicionar hooks de consulta por data

### Sprint 2: Visualização por Status
5. ✅ Implementar `ConciliacaoTabs`
6. ✅ Criar `ListaConciliados` com detalhes dos pares
7. ✅ Criar `ListaDivergencias` com destaque de diferenças

### Sprint 3: Edição e Detalhes
8. ✅ Implementar `DetalhesConciliacaoDialog`
9. ✅ Implementar `EditarConciliacaoDialog`
10. ✅ Adicionar funcionalidade de desvincular com confirmação

### Sprint 4: Fechamento Diário
11. ✅ Criar `ResumoDiaConciliacao`
12. ✅ Implementar `FechamentoDiaDialog`
13. ✅ Criar visualização de histórico

### Sprint 5: Filtros e Pesquisa
14. ✅ Implementar `FiltrosAvancadosConciliacao`
15. ✅ Implementar `SearchConciliacao`
16. ✅ Integrar filtros na página principal

### Sprint 6: Sugestões e Auto-match
17. ✅ Criar algoritmo de sugestão em `conciliacao-matcher.ts`
18. ✅ Implementar `SugestoesConciliacaoDialog`
19. ✅ Adicionar funcionalidade de auto-conciliação

### Sprint 7: Polish e Exportação
20. ✅ Implementar exportação PDF/Excel
21. ✅ Adicionar atalhos de teclado
22. ✅ Refinar responsividade mobile
23. ✅ Testes e ajustes finais

---

## Considerações Técnicas

### Performance
- Usar virtualização para listas grandes (react-window ou similar)
- Implementar paginação server-side quando necessário
- Otimizar queries com índices apropriados no Supabase

### Segurança
- Manter RLS policies existentes
- Validar permissões por cartório em todas as operações
- Log de auditoria para alterações em conciliações

### Integridade de Dados
- Transações atômicas para vincular/desvincular
- Prevenir conciliação duplicada
- Validar que item do extrato/lançamento não está já vinculado

---

## Próximos Passos

1. **Aprovar este plano** antes de iniciar implementação
2. Começar pela Sprint 1 (fundamentos e filtros de data)
3. Iterar com feedback após cada sprint

---

*Plano criado em: 2026-02-07*
*Autor: Lovable AI*
