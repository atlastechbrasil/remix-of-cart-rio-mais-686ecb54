# Plano: Implementação Completa da Tela de Relatórios

## Visão Geral
Implementação completa da tela de Relatórios com dados reais do Supabase, exportação para PDF/Excel, impressão e gráficos interativos com filtros avançados.

---

## Fase 1: Infraestrutura de Dados e Hooks

### 1.1 Hook de Relatórios (`src/hooks/useRelatorios.ts`)
- [ ] Criar hook para buscar dados agregados de lançamentos
- [ ] Implementar queries para:
  - Resumo financeiro (receitas, despesas, saldo)
  - Receitas por categoria
  - Evolução mensal
  - Dados de conciliação
  - Produtividade por responsável
- [ ] Filtros por: período, tipo de lançamento, status de conciliação, categoria
- [ ] Suporte a `cartorio_id` do TenantContext

### 1.2 Tipos e Interfaces (`src/types/relatorios.ts`)
- [ ] Definir tipos para filtros de relatório
- [ ] Definir tipos para dados agregados
- [ ] Definir tipos para opções de exportação

---

## Fase 2: Componentes de Filtros

### 2.1 Filtros Avançados (`src/components/relatorios/FiltrosRelatorio.tsx`)
- [ ] Date range picker para período
- [ ] Multi-select para tipo de lançamento (receita/despesa)
- [ ] Select para status de conciliação
- [ ] Select para categoria
- [ ] Botão de limpar filtros
- [ ] Responsividade mobile (drawer/sheet)

### 2.2 Seletor de Período Rápido
- [ ] Opções: Hoje, Esta semana, Este mês, Último mês, Este ano
- [ ] Seleção de período customizado

---

## Fase 3: Gráficos e Visualizações

### 3.1 Gráfico de Receitas por Categoria (`src/components/relatorios/ReceitasPorCategoriaChart.tsx`)
- [ ] Pie chart com dados reais de lançamentos
- [ ] Legenda interativa
- [ ] Tooltip com valores formatados
- [ ] Adaptação mobile

### 3.2 Gráfico de Evolução Mensal (`src/components/relatorios/EvolucaoMensalChart.tsx`)
- [ ] Line/Area chart com receitas vs despesas
- [ ] Eixo X com meses
- [ ] Comparativo visual

### 3.3 Gráfico de Produtividade (`src/components/relatorios/ProdutividadeChart.tsx`)
- [ ] Bar chart horizontal por responsável
- [ ] Quantidade de lançamentos e valor total
- [ ] Filtro por tipo

### 3.4 Indicadores Resumo (`src/components/relatorios/IndicadoresResumo.tsx`)
- [ ] Cards com: Total Receitas, Total Despesas, Saldo, % Conciliado
- [ ] Comparativo com período anterior

---

## Fase 4: Relatórios Específicos

### 4.1 Relatório Financeiro Mensal
- [ ] Resumo executivo
- [ ] Tabela de lançamentos
- [ ] Gráficos de distribuição

### 4.2 Relatório de Conciliação
- [ ] Status geral de conciliação
- [ ] Itens pendentes vs conciliados
- [ ] Divergências encontradas

### 4.3 Relatório Comparativo
- [ ] Comparativo mês atual vs anterior
- [ ] Variação percentual
- [ ] Gráfico de barras comparativo

---

## Fase 5: Funcionalidade de Exportação

### 5.1 Utilitário de Exportação (`src/lib/export-utils.ts`)
- [ ] Função `exportToPDF` usando jspdf + jspdf-autotable
- [ ] Função `exportToExcel` usando xlsx
- [ ] Função `printReport` para impressão nativa

### 5.2 Componente de Exportação (`src/components/relatorios/ExportButtons.tsx`)
- [ ] Botões de exportação (PDF, Excel, Imprimir)
- [ ] Dropdown menu com opções
- [ ] Loading states durante exportação

---

## Fase 6: Página Principal de Relatórios

### 6.1 Refatorar `src/pages/Relatorios.tsx`
- [ ] Integrar todos os componentes
- [ ] Estado global de filtros
- [ ] Navegação entre tipos de relatório
- [ ] Loading states e error handling

### 6.2 Tabs/Navegação
- [ ] Tab: Visão Geral (dashboard de métricas)
- [ ] Tab: Financeiro (receitas, despesas, fluxo)
- [ ] Tab: Conciliação (status, divergências)
- [ ] Tab: Gerar Relatórios (cards de relatórios disponíveis)

---

## Fase 7: Responsividade Mobile

### 7.1 Adaptações Mobile
- [ ] Filtros em Sheet/Drawer
- [ ] Gráficos redimensionados
- [ ] Tabelas responsivas
- [ ] Touch-friendly controls

### 7.2 Exportação Mobile
- [ ] Download direto

---

## Dependências Necessárias
- `jspdf` - Geração de PDF
- `jspdf-autotable` - Tabelas em PDF
- `xlsx` - Exportação Excel

---

## Estrutura de Arquivos Final

```
src/
├── components/
│   └── relatorios/
│       ├── FiltrosRelatorio.tsx
│       ├── ReceitasPorCategoriaChart.tsx
│       ├── EvolucaoMensalChart.tsx
│       ├── ProdutividadeChart.tsx
│       ├── IndicadoresResumo.tsx
│       ├── RelatorioCard.tsx
│       ├── ExportButtons.tsx
│       └── RelatorioPreviewDialog.tsx
├── hooks/
│   └── useRelatorios.ts
├── lib/
│   └── export-utils.ts
├── types/
│   └── relatorios.ts
└── pages/
    └── Relatorios.tsx
```

---

## Próximos Passos
1. Instalar dependências (jspdf, jspdf-autotable, xlsx)
2. Criar tipos e interfaces
3. Implementar hook de dados
4. Criar componentes de filtros
5. Criar componentes de gráficos
6. Implementar exportação
7. Refatorar página principal
8. Testar responsividade
