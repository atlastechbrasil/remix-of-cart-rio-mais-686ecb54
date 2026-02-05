-- Inserir cartório de teste
INSERT INTO public.cartorios (id, nome, cnpj, email, telefone, endereco, ativo)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '1º Cartório de Registro de Imóveis de São Paulo', '12.345.678/0001-90', 'contato@1ri-sp.com.br', '(11) 3333-4444', 'Rua Augusta, 1500 - Consolação, São Paulo - SP', true),
  ('22222222-2222-2222-2222-222222222222', '2º Cartório de Registro de Imóveis de São Paulo', '98.765.432/0001-10', 'contato@2ri-sp.com.br', '(11) 5555-6666', 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP', true)
ON CONFLICT (id) DO NOTHING;

-- Inserir contas bancárias de teste
INSERT INTO public.contas_bancarias (id, user_id, cartorio_id, banco, agencia, conta, tipo, saldo, ativo)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Banco do Brasil', '1234-5', '12345-6', 'corrente', 150000.00, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Itaú', '0987', '54321-0', 'corrente', 85000.00, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'Bradesco', '2468', '13579-2', 'corrente', 220000.00, true)
ON CONFLICT (id) DO NOTHING;

-- Inserir lançamentos de teste (últimos 30 dias)
INSERT INTO public.lancamentos (id, user_id, cartorio_id, tipo, descricao, valor, data, categoria, status, status_conciliacao, responsavel)
VALUES 
  -- Receitas
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'receita', 'Registro de Imóvel - Matrícula 45.678', 1250.00, CURRENT_DATE - INTERVAL '1 day', 'Registro', 'pago', 'conciliado', 'Maria Silva'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'receita', 'Certidão de Matrícula - Mat. 12.345', 85.00, CURRENT_DATE - INTERVAL '2 days', 'Certidão', 'pago', 'conciliado', 'João Santos'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'receita', 'Averbação de Construção - Mat. 33.221', 450.00, CURRENT_DATE - INTERVAL '3 days', 'Averbação', 'pago', 'pendente', 'Maria Silva'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'receita', 'Registro de Compra e Venda - Mat. 78.901', 2800.00, CURRENT_DATE - INTERVAL '4 days', 'Registro', 'pago', 'conciliado', 'Ana Oliveira'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'receita', 'Busca de Documentos', 35.00, CURRENT_DATE - INTERVAL '5 days', 'Busca', 'pago', 'conciliado', 'João Santos'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'receita', 'Prenotação - Protocolo 2024/5678', 120.00, CURRENT_DATE - INTERVAL '6 days', 'Prenotação', 'pendente', 'pendente', 'Maria Silva'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'receita', 'Certidão Vintenária - Mat. 55.443', 250.00, CURRENT_DATE - INTERVAL '7 days', 'Certidão', 'pago', 'conciliado', 'Ana Oliveira'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'receita', 'Registro de Hipoteca - Mat. 66.778', 1800.00, CURRENT_DATE - INTERVAL '8 days', 'Registro', 'pago', 'divergente', 'João Santos'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'receita', 'Averbação de Cancelamento', 180.00, CURRENT_DATE - INTERVAL '10 days', 'Averbação', 'pago', 'conciliado', 'Maria Silva'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'receita', 'Registro de Incorporação', 5500.00, CURRENT_DATE - INTERVAL '12 days', 'Registro', 'pago', 'conciliado', 'Ana Oliveira'),
  
  -- Despesas
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'despesa', 'Folha de Pagamento - Janeiro/2026', 28500.00, CURRENT_DATE - INTERVAL '5 days', 'Pessoal', 'pago', 'conciliado', 'RH'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'despesa', 'Energia Elétrica', 1850.00, CURRENT_DATE - INTERVAL '10 days', 'Utilidades', 'pago', 'conciliado', 'Administrativo'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'despesa', 'Material de Escritório', 420.00, CURRENT_DATE - INTERVAL '8 days', 'Material', 'pago', 'pendente', 'Administrativo'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'despesa', 'Manutenção Ar Condicionado', 650.00, CURRENT_DATE - INTERVAL '15 days', 'Manutenção', 'pago', 'conciliado', 'Administrativo'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'despesa', 'IPTU - Parcela 2/10', 1200.00, CURRENT_DATE - INTERVAL '20 days', 'Impostos', 'pago', 'conciliado', 'Financeiro'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'despesa', 'Internet e Telefonia', 580.00, CURRENT_DATE - INTERVAL '12 days', 'Utilidades', 'pendente', 'pendente', 'Administrativo'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'despesa', 'Aluguel do Imóvel', 8500.00, CURRENT_DATE - INTERVAL '1 day', 'Infraestrutura', 'agendado', 'pendente', 'Financeiro'),
  
  -- Lançamentos para o segundo cartório
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'receita', 'Registro de Imóvel - Mat. 11.222', 1450.00, CURRENT_DATE - INTERVAL '2 days', 'Registro', 'pago', 'conciliado', 'Carlos Mendes'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'receita', 'Certidão Negativa', 65.00, CURRENT_DATE - INTERVAL '3 days', 'Certidão', 'pago', 'conciliado', 'Paula Costa'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'despesa', 'Folha de Pagamento', 32000.00, CURRENT_DATE - INTERVAL '5 days', 'Pessoal', 'pago', 'conciliado', 'RH')
ON CONFLICT (id) DO NOTHING;

-- Inserir perfis de acesso de teste
INSERT INTO public.perfis_acesso (id, cartorio_id, nome, descricao, cor, permissoes)
VALUES 
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Administrador', 'Acesso total ao sistema', '#16a34a', '{"dashboard": true, "lancamentos": true, "conciliacao": true, "relatorios": true, "usuarios": true, "configuracoes": true}'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Financeiro', 'Gerencia operações financeiras', '#2563eb', '{"dashboard": true, "lancamentos": true, "conciliacao": true, "relatorios": true, "usuarios": false, "configuracoes": false}'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Operacional', 'Visualização e lançamentos básicos', '#f59e0b', '{"dashboard": true, "lancamentos": true, "conciliacao": false, "relatorios": false, "usuarios": false, "configuracoes": false}')
ON CONFLICT (id) DO NOTHING;