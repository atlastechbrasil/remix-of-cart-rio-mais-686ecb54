# Plano: Funcionalidades da Tela de Extratos

## Resumo
Implementar funcionalidades completas para gerenciamento de extratos bancários: visualização detalhada, download, exclusão e filtros avançados.

---

## Fase 1: Filtros Avançados

### 1.1 Componente FiltrosExtratos
- [ ] Criar `src/components/extratos/FiltrosExtratos.tsx`
- [ ] Filtro por conta bancária (Select com todas as contas)
- [ ] Filtro por período (DateRangePicker com data início/fim)
- [ ] Filtro por status (processado, conciliado, erro)
- [ ] Botão "Limpar Filtros"
- [ ] Persistir filtros no estado local

### 1.2 Hook useFiltrosExtratos
- [ ] Criar `src/hooks/useFiltrosExtratos.ts`
- [ ] Estado para cada filtro (contaId, dataInicio, dataFim, status)
- [ ] Função para aplicar filtros na query
- [ ] Função para limpar todos os filtros

---

## Fase 2: Detalhamento de Extrato

### 2.1 Dialog DetalhesExtratoDialog
- [ ] Criar `src/components/extratos/DetalhesExtratoDialog.tsx`
- [ ] Exibir metadados do extrato:
  - Nome do arquivo
  - Conta bancária (banco, agência, conta)
  - Período (data início a data fim)
  - Data de importação
  - Status atual
  - Total de lançamentos
- [ ] Listar todos os itens do extrato com:
  - Data da transação
  - Descrição
  - Valor (crédito/débito)
  - Status de conciliação (pendente, conciliado, divergente)
- [ ] Indicadores de resumo:
  - Total de créditos
  - Total de débitos
  - Saldo do período
  - % de itens conciliados

### 2.2 Hook useExtratoDetalhes
- [ ] Criar função para buscar extrato por ID com itens
- [ ] Incluir estatísticas calculadas
- [ ] Incluir informações da conta bancária relacionada

---

## Fase 3: Download de Extrato

### 3.1 Funcionalidade de Download
- [ ] Criar `src/lib/extrato-export.ts`
- [ ] Exportar para CSV:
  - Data, Descrição, Valor, Tipo, Status
- [ ] Exportar para PDF:
  - Cabeçalho com dados do extrato
  - Tabela de lançamentos
  - Resumo financeiro
- [ ] Exportar para Excel (XLSX)

### 3.2 Dialog DownloadExtratoDialog
- [ ] Criar `src/components/extratos/DownloadExtratoDialog.tsx`
- [ ] Opções de formato (CSV, PDF, Excel)
- [ ] Preview do que será exportado
- [ ] Botão de download com loading state

---

## Fase 4: Exclusão de Extrato ✅

### 4.1 Dialog ExcluirExtratoDialog
- [x] Criar `src/components/extratos/ExcluirExtratoDialog.tsx`
- [x] Confirmação antes de excluir
- [x] Alertas:
  - Número de itens que serão excluídos
  - Se há itens já conciliados (warning)
- [x] Opção de excluir mesmo com itens conciliados (checkbox de confirmação)

### 4.2 Hook useDeleteExtrato
- [x] Mutation para excluir extrato
- [x] Excluir extrato_itens relacionados (cascade)
- [x] Desfazer vínculos de conciliação se existirem
- [x] Invalidar cache após exclusão

---

## Fase 5: Melhorias Adicionais ✅

### 5.1 Ordenação da Tabela
- [x] Ordenar por data de importação (padrão: mais recente)
- [x] Ordenar por nome do arquivo
- [x] Ordenar por quantidade de lançamentos
- [x] Ordenar por status

### 5.2 Paginação
- [x] Adicionar paginação para listas grandes
- [x] Configuração de itens por página (10, 25, 50)

### 5.3 Busca Rápida
- [x] Campo de busca por nome de arquivo (implementado na Fase 1)
- [x] Busca em tempo real com debounce

### 5.4 Ações em Lote
- [x] Seleção múltipla de extratos
- [x] Excluir vários extratos de uma vez
- [ ] Download em lote (ZIP com múltiplos arquivos) - pendente

---

## Arquivos a Criar/Modificar

### Novos Arquivos:
1. `src/components/extratos/FiltrosExtratos.tsx`
2. `src/components/extratos/DetalhesExtratoDialog.tsx`
3. `src/components/extratos/DownloadExtratoDialog.tsx`
4. `src/components/extratos/ExcluirExtratoDialog.tsx`
5. `src/hooks/useFiltrosExtratos.ts`
6. `src/lib/extrato-export.ts`

### Arquivos a Modificar:
1. `src/pages/Extratos.tsx` - Integrar novos componentes
2. `src/hooks/useConciliacao.ts` - Adicionar queries/mutations necessárias

---

## Ordem de Implementação Sugerida

1. **Fase 1** - Filtros (base para outras funcionalidades)
2. **Fase 2** - Detalhamento (mais usado pelo usuário)
3. **Fase 4** - Exclusão (funcionalidade crítica)
4. **Fase 3** - Download (menos urgente)
5. **Fase 5** - Melhorias adicionais

---

## Considerações Técnicas

- Manter responsividade mobile em todos os componentes
- Usar design system existente (tokens, cores HSL)
- Reutilizar componentes UI existentes (Dialog, Button, Badge, etc.)
- Invalidar cache React Query após mutações
- Tratar erros com toast notifications
- Respeitar RLS policies existentes (cartorio_id filtering)
