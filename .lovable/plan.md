
# Plano de Transformacao - FinCart

## Resumo Executivo

Este plano transforma o CartorioGest em **FinCart**, um sistema especializado em **conciliacao bancaria para cartorios de registros de imoveis**. A mudanca inclui nova identidade visual baseada na logo fornecida (tons de azul e verde), reestruturacao completa das telas e menus para foco em conciliacao bancaria, e adequacao da terminologia para o contexto de registros de imoveis.

---

## 1. Nova Identidade Visual

### 1.1 Paleta de Cores Baseada na Logo

A logo FinCart apresenta um gradiente de azul escuro para verde, com um simbolo de checkmark. A nova paleta sera:

- **Primary**: Verde (#2E9E6B) - cor principal do "Cart" na logo
- **Secondary**: Azul (#1E5F99) - tom azul do icone
- **Accent**: Azul claro (#3B82B6) - tom intermediario do gradiente
- **Success**: Verde (#22C55E) - indicadores positivos
- **Sidebar**: Gradiente azul escuro (#1A365D para #0F172A)

### 1.2 Arquivos a Modificar

- `src/index.css`: Atualizar todas as variaveis CSS com a nova paleta
- `tailwind.config.ts`: Manter consistencia com as novas cores
- Copiar logo para `src/assets/fincart-logo.png`

---

## 2. Reestruturacao do Menu e Navegacao

### 2.1 Novo Menu Lateral (AppSidebar.tsx)

O menu sera reorganizado para foco em conciliacao bancaria:

```text
+----------------------------------+
|  [Logo FinCart]                  |
+----------------------------------+
|  Dashboard                       |
|  Conciliacao Bancaria    (NOVO)  |
|  Contas Bancarias        (NOVO)  |
|  Extratos                (NOVO)  |
|  Lancamentos             (RENOMEADO)|
|  Registros de Imoveis    (ADAPTADO)|
|  Repasses                        |
|  Relatorios                      |
|  Usuarios                        |
|  Configuracoes                   |
+----------------------------------+
```

### 2.2 Novas Rotas (App.tsx)

- `/conciliacao` - Tela principal de conciliacao bancaria
- `/contas` - Gestao de contas bancarias
- `/extratos` - Importacao e visualizacao de extratos
- `/lancamentos` - Antigo Financeiro, renomeado
- `/registros` - Antigo Atos, adaptado para registros de imoveis

---

## 3. Novas Telas Especificas para Conciliacao Bancaria

### 3.1 Dashboard (Index.tsx) - Reformulado

**KPIs principais:**
- Saldo Bancario Atual
- Lancamentos Pendentes de Conciliacao
- Divergencias Identificadas
- Taxa de Conciliacao (%)

**Graficos:**
- Evolucao do Saldo (linha)
- Lancamentos Conciliados vs Pendentes (barras)
- Divergencias por Conta (pizza)

**Alertas:**
- Lancamentos nao conciliados ha mais de X dias
- Divergencias de valores

### 3.2 Conciliacao Bancaria (NOVA - Conciliacao.tsx)

Tela central do sistema com:

- **Painel dividido**: Extrato Bancario (esquerda) | Lancamentos Sistema (direita)
- **Funcao de match automatico**: Algoritmo que sugere correspondencias
- **Match manual**: Arrastar e soltar ou selecionar itens
- **Status visual**: Conciliado (verde), Pendente (amarelo), Divergente (vermelho)
- **Filtros**: Por data, conta, status, valor
- **Acoes em lote**: Conciliar selecionados, ignorar, marcar para revisao

### 3.3 Contas Bancarias (NOVA - ContasBancarias.tsx)

- Lista de contas cadastradas (Banco, Agencia, Conta, Tipo)
- Saldo atual de cada conta
- Ultima atualizacao do extrato
- Botao para importar extrato
- Configuracoes de integracao bancaria

### 3.4 Extratos (NOVA - Extratos.tsx)

- Upload de arquivos OFX/CSV
- Visualizacao do extrato importado
- Historico de importacoes
- Preview antes de confirmar importacao
- Mapeamento de campos

### 3.5 Lancamentos (Financeiro.tsx - Renomeado)

- Manter estrutura atual
- Adicionar coluna "Status Conciliacao"
- Adicionar filtro por status de conciliacao
- Indicador visual de match com extrato

### 3.6 Registros de Imoveis (Atos.tsx - Adaptado)

Terminologia especifica para RI:
- Matricula (ao inves de Protocolo)
- Tipo de Registro (Averbacao, Registro, Cancelamento, etc.)
- Numero do Livro/Folha
- Imovel relacionado

---

## 4. Componentes Novos

### 4.1 Componentes de Conciliacao

- `ConciliacaoPanel.tsx`: Painel de comparacao lado a lado
- `ExtratoItem.tsx`: Linha do extrato bancario
- `LancamentoItem.tsx`: Linha do lancamento do sistema
- `MatchIndicator.tsx`: Indicador visual de correspondencia
- `ConciliacaoStats.tsx`: Cards com estatisticas de conciliacao

### 4.2 Componentes de Importacao

- `ImportarExtratoDialog.tsx`: Modal para upload de extrato
- `FileDropzone.tsx`: Area de arrastar e soltar arquivos
- `ExtratoPreview.tsx`: Preview do extrato antes de confirmar

### 4.3 Dashboard Components Atualizados

- `SaldoBancarioCard.tsx`: Card com saldo e variacao
- `ConciliacaoChart.tsx`: Grafico de status de conciliacao
- `DivergenciasWidget.tsx`: Lista de divergencias recentes
- `AlertasConciliacao.tsx`: Alertas de pendencias

---

## 5. Estrutura de Dados (Mockada)

### 5.1 Conta Bancaria
```text
- id, banco, agencia, conta, tipo
- saldoAtual, dataUltimaAtualizacao
```

### 5.2 Extrato Bancario
```text
- id, contaId, dataTransacao, descricao
- valor, tipo (credito/debito), saldoParcial
- statusConciliacao, lancamentoVinculadoId
```

### 5.3 Lancamento (atualizado)
```text
- campos existentes +
- statusConciliacao, extratoVinculadoId
- dataConciliacao, conciliadoPor
```

---

## 6. Detalhamento Tecnico

### 6.1 Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/Conciliacao.tsx` | Tela principal de conciliacao |
| `src/pages/ContasBancarias.tsx` | Gestao de contas |
| `src/pages/Extratos.tsx` | Importacao de extratos |
| `src/components/conciliacao/ConciliacaoPanel.tsx` | Painel de match |
| `src/components/conciliacao/ExtratoItem.tsx` | Item do extrato |
| `src/components/conciliacao/MatchIndicator.tsx` | Indicador de match |
| `src/components/conciliacao/ConciliacaoStats.tsx` | Estatisticas |
| `src/components/extratos/ImportarExtratoDialog.tsx` | Dialog de importacao |
| `src/components/dashboard/SaldoBancarioCard.tsx` | Card de saldo |
| `src/components/dashboard/DivergenciasWidget.tsx` | Widget de alertas |

### 6.2 Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/index.css` | Nova paleta de cores |
| `src/App.tsx` | Novas rotas |
| `src/components/layout/AppSidebar.tsx` | Novo menu e logo |
| `src/pages/Index.tsx` | Dashboard reformulado |
| `src/pages/Financeiro.tsx` | Renomear para Lancamentos, adicionar status |
| `src/pages/Atos.tsx` | Adaptar para Registros de Imoveis |
| `src/pages/Configuracoes.tsx` | Adicionar config de bancos |

### 6.3 Arquivos a Remover/Substituir

| Arquivo | Acao |
|---------|------|
| `src/components/atos/NovoAtoDialog.tsx` | Renomear/adaptar para NovoRegistroDialog |
| `src/components/dashboard/ActsChart.tsx` | Substituir por ConciliacaoChart |

---

## 7. Ordem de Implementacao

1. **Fase 1 - Identidade Visual**
   - Copiar logo para projeto
   - Atualizar `index.css` com nova paleta
   - Atualizar `AppSidebar.tsx` com logo e nome

2. **Fase 2 - Estrutura Base**
   - Atualizar `App.tsx` com novas rotas
   - Atualizar menu de navegacao

3. **Fase 3 - Telas Principais**
   - Criar `Conciliacao.tsx`
   - Criar `ContasBancarias.tsx`
   - Criar `Extratos.tsx`

4. **Fase 4 - Dashboard**
   - Reformular `Index.tsx`
   - Criar novos componentes de dashboard

5. **Fase 5 - Adaptacoes**
   - Renomear Financeiro para Lancamentos
   - Adaptar Atos para Registros de Imoveis
   - Atualizar Configuracoes

---

## 8. Resultado Esperado

O sistema FinCart tera:

- **Foco em conciliacao bancaria** com interface intuitiva de comparacao
- **Identidade visual profissional** baseada na logo (azul-verde)
- **Terminologia adequada** para cartorios de registros de imoveis
- **Fluxo de trabalho otimizado** para o dia a dia do financeiro
- **Indicadores claros** de pendencias e divergencias
- **Importacao facilitada** de extratos bancarios

