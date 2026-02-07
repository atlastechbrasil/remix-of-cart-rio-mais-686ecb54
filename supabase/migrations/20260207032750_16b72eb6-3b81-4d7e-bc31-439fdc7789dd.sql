-- Create test extrato
INSERT INTO extratos (user_id, cartorio_id, conta_id, arquivo, periodo_inicio, periodo_fim, total_lancamentos, status)
VALUES (
  'c2b5d0cd-e19c-4aca-b29d-e24a8a3a9ed5',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'extrato_teste_2026-02-07.ofx',
  '2026-02-03',
  '2026-02-09',
  15,
  'processado'
);

-- Create extrato items for this week
INSERT INTO extrato_itens (user_id, cartorio_id, extrato_id, data_transacao, descricao, valor, tipo, status_conciliacao, saldo_parcial)
SELECT 
  'c2b5d0cd-e19c-4aca-b29d-e24a8a3a9ed5',
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM extratos WHERE arquivo = 'extrato_teste_2026-02-07.ofx' LIMIT 1),
  data_transacao,
  descricao,
  valor,
  tipo::tipo_transacao,
  'pendente'::status_conciliacao,
  saldo_parcial
FROM (VALUES
  ('2026-02-03'::date, 'TED RECEBIDO - CLIENTE SILVA', 2500.00, 'credito', 10000),
  ('2026-02-03'::date, 'TARIFA BANCARIA', 35.90, 'debito', 10100),
  ('2026-02-03'::date, 'PIX RECEBIDO - JOAO SANTOS', 850.00, 'credito', 10200),
  ('2026-02-04'::date, 'PAGAMENTO FORNECEDOR ABC', 1200.00, 'debito', 10300),
  ('2026-02-04'::date, 'DEPOSITO EM DINHEIRO', 3000.00, 'credito', 10400),
  ('2026-02-05'::date, 'TED ENVIADO - CARTORIO CENTRAL', 5000.00, 'debito', 10500),
  ('2026-02-05'::date, 'ESTORNO TARIFA', 15.00, 'credito', 10600),
  ('2026-02-05'::date, 'RENDIMENTO POUPANCA', 125.50, 'credito', 10700),
  ('2026-02-06'::date, 'PIX ENVIADO - ENERGIA ELETRICA', 450.00, 'debito', 10800),
  ('2026-02-06'::date, 'BOLETO RECEBIDO', 1800.00, 'credito', 10900),
  ('2026-02-06'::date, 'DOC RECEBIDO - MARIA OLIVEIRA', 650.00, 'credito', 11000),
  ('2026-02-07'::date, 'PAGAMENTO ALUGUEL', 2800.00, 'debito', 11100),
  ('2026-02-07'::date, 'TED RECEBIDO - EMPRESA XYZ', 4500.00, 'credito', 11200),
  ('2026-02-07'::date, 'IOF SOBRE OPERACAO', 12.50, 'debito', 11300),
  ('2026-02-07'::date, 'CHEQUE COMPENSADO 000123', 750.00, 'debito', 11400)
) AS t(data_transacao, descricao, valor, tipo, saldo_parcial);

-- Create lancamentos (system records)
INSERT INTO lancamentos (user_id, cartorio_id, data, descricao, valor, tipo, categoria, status, status_conciliacao)
VALUES
  -- Matching items
  ('c2b5d0cd-e19c-4aca-b29d-e24a8a3a9ed5', '11111111-1111-1111-1111-111111111111', '2026-02-03', 'Recebimento Cliente Silva - Escritura', 2500.00, 'receita', 'Escrituras', 'pago', 'pendente'),
  ('c2b5d0cd-e19c-4aca-b29d-e24a8a3a9ed5', '11111111-1111-1111-1111-111111111111', '2026-02-03', 'Recebimento PIX João Santos', 850.00, 'receita', 'Registro', 'pago', 'pendente'),
  ('c2b5d0cd-e19c-4aca-b29d-e24a8a3a9ed5', '11111111-1111-1111-1111-111111111111', '2026-02-04', 'Pagamento Fornecedor ABC Ltda', 1200.00, 'despesa', 'Fornecedores', 'pago', 'pendente'),
  ('c2b5d0cd-e19c-4aca-b29d-e24a8a3a9ed5', '11111111-1111-1111-1111-111111111111', '2026-02-04', 'Depósito em espécie - caixa', 3000.00, 'receita', 'Caixa', 'pago', 'pendente'),
  ('c2b5d0cd-e19c-4aca-b29d-e24a8a3a9ed5', '11111111-1111-1111-1111-111111111111', '2026-02-05', 'Repasse Cartório Central', 5000.00, 'despesa', 'Repasses', 'pago', 'pendente'),
  ('c2b5d0cd-e19c-4aca-b29d-e24a8a3a9ed5', '11111111-1111-1111-1111-111111111111', '2026-02-06', 'Conta de Luz - Dezembro', 450.00, 'despesa', 'Utilidades', 'pago', 'pendente'),
  ('c2b5d0cd-e19c-4aca-b29d-e24a8a3a9ed5', '11111111-1111-1111-1111-111111111111', '2026-02-06', 'Recebimento Boleto - Certidão', 1800.00, 'receita', 'Certidões', 'pago', 'pendente'),
  ('c2b5d0cd-e19c-4aca-b29d-e24a8a3a9ed5', '11111111-1111-1111-1111-111111111111', '2026-02-07', 'Pagamento Aluguel Janeiro', 2800.00, 'despesa', 'Aluguel', 'pago', 'pendente'),
  ('c2b5d0cd-e19c-4aca-b29d-e24a8a3a9ed5', '11111111-1111-1111-1111-111111111111', '2026-02-07', 'Recebimento TED Empresa XYZ', 4500.00, 'receita', 'Escrituras', 'pago', 'pendente'),
  -- Non-matching items
  ('c2b5d0cd-e19c-4aca-b29d-e24a8a3a9ed5', '11111111-1111-1111-1111-111111111111', '2026-02-05', 'Receita Pendente - Autenticação', 320.00, 'receita', 'Autenticações', 'pago', 'pendente'),
  ('c2b5d0cd-e19c-4aca-b29d-e24a8a3a9ed5', '11111111-1111-1111-1111-111111111111', '2026-02-06', 'Pagamento Contador', 980.00, 'despesa', 'Serviços', 'pago', 'pendente'),
  ('c2b5d0cd-e19c-4aca-b29d-e24a8a3a9ed5', '11111111-1111-1111-1111-111111111111', '2026-02-07', 'Receita Reconhecimento Firma', 180.00, 'receita', 'Firmas', 'pago', 'pendente'),
  -- Slight value difference (650 vs 648.50)
  ('c2b5d0cd-e19c-4aca-b29d-e24a8a3a9ed5', '11111111-1111-1111-1111-111111111111', '2026-02-06', 'Recebimento Maria Oliveira - Registro', 648.50, 'receita', 'Registro', 'pago', 'pendente');