-- Criar enum para status de conciliação
CREATE TYPE public.status_conciliacao AS ENUM ('pendente', 'conciliado', 'divergente');

-- Criar enum para tipo de conta bancária
CREATE TYPE public.tipo_conta AS ENUM ('corrente', 'poupanca', 'investimento');

-- Criar enum para tipo de transação
CREATE TYPE public.tipo_transacao AS ENUM ('credito', 'debito');

-- Criar enum para tipo de lançamento
CREATE TYPE public.tipo_lancamento AS ENUM ('receita', 'despesa');

-- Criar enum para status de lançamento
CREATE TYPE public.status_lancamento AS ENUM ('pago', 'pendente', 'agendado', 'cancelado');

-- Tabela de Contas Bancárias
CREATE TABLE public.contas_bancarias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  banco VARCHAR(100) NOT NULL,
  agencia VARCHAR(20) NOT NULL,
  conta VARCHAR(30) NOT NULL,
  tipo tipo_conta NOT NULL DEFAULT 'corrente',
  saldo DECIMAL(15, 2) NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Extratos Importados
CREATE TABLE public.extratos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conta_id UUID NOT NULL REFERENCES public.contas_bancarias(id) ON DELETE CASCADE,
  arquivo VARCHAR(255) NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  total_lancamentos INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'processado',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Itens do Extrato (movimentações bancárias)
CREATE TABLE public.extrato_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  extrato_id UUID NOT NULL REFERENCES public.extratos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  data_transacao DATE NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  tipo tipo_transacao NOT NULL,
  saldo_parcial DECIMAL(15, 2),
  status_conciliacao status_conciliacao NOT NULL DEFAULT 'pendente',
  lancamento_vinculado_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Lançamentos (sistema financeiro)
CREATE TABLE public.lancamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  data DATE NOT NULL,
  descricao TEXT NOT NULL,
  tipo tipo_lancamento NOT NULL,
  categoria VARCHAR(100),
  valor DECIMAL(15, 2) NOT NULL,
  status status_lancamento NOT NULL DEFAULT 'pendente',
  status_conciliacao status_conciliacao NOT NULL DEFAULT 'pendente',
  extrato_item_vinculado_id UUID,
  responsavel VARCHAR(100),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Conciliações (registro de vinculações)
CREATE TABLE public.conciliacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  extrato_item_id UUID NOT NULL REFERENCES public.extrato_itens(id) ON DELETE CASCADE,
  lancamento_id UUID NOT NULL REFERENCES public.lancamentos(id) ON DELETE CASCADE,
  diferenca DECIMAL(15, 2) DEFAULT 0,
  observacao TEXT,
  conciliado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(extrato_item_id, lancamento_id)
);

-- Adicionar FK após criação das tabelas
ALTER TABLE public.extrato_itens
ADD CONSTRAINT fk_lancamento_vinculado
FOREIGN KEY (lancamento_vinculado_id) REFERENCES public.lancamentos(id) ON DELETE SET NULL;

ALTER TABLE public.lancamentos
ADD CONSTRAINT fk_extrato_item_vinculado
FOREIGN KEY (extrato_item_vinculado_id) REFERENCES public.extrato_itens(id) ON DELETE SET NULL;

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.contas_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extrato_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conciliacoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para contas_bancarias
CREATE POLICY "Usuários podem ver suas próprias contas" ON public.contas_bancarias
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias contas" ON public.contas_bancarias
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias contas" ON public.contas_bancarias
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias contas" ON public.contas_bancarias
FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para extratos
CREATE POLICY "Usuários podem ver seus próprios extratos" ON public.extratos
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios extratos" ON public.extratos
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios extratos" ON public.extratos
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios extratos" ON public.extratos
FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para extrato_itens
CREATE POLICY "Usuários podem ver seus próprios itens de extrato" ON public.extrato_itens
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios itens de extrato" ON public.extrato_itens
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios itens de extrato" ON public.extrato_itens
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios itens de extrato" ON public.extrato_itens
FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para lancamentos
CREATE POLICY "Usuários podem ver seus próprios lançamentos" ON public.lancamentos
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios lançamentos" ON public.lancamentos
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios lançamentos" ON public.lancamentos
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios lançamentos" ON public.lancamentos
FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para conciliacoes
CREATE POLICY "Usuários podem ver suas próprias conciliações" ON public.conciliacoes
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias conciliações" ON public.conciliacoes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias conciliações" ON public.conciliacoes
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias conciliações" ON public.conciliacoes
FOR DELETE USING (auth.uid() = user_id);

-- Triggers para atualização automática de updated_at
CREATE TRIGGER update_contas_bancarias_updated_at
BEFORE UPDATE ON public.contas_bancarias
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_lancamentos_updated_at
BEFORE UPDATE ON public.lancamentos
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();