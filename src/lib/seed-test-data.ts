import { supabase } from "@/integrations/supabase/client";
import { addDays, format, startOfWeek, subDays } from "date-fns";

// Generates test data for the current week
export async function seedTestData(contaId: string, cartorioId: string | null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const userId = user.id;
  const hoje = new Date();
  const inicioSemana = startOfWeek(hoje, { weekStartsOn: 1 }); // Monday
  const fimSemana = addDays(inicioSemana, 6);

  // 1. Create an extrato for the week
  const { data: extrato, error: extratoError } = await supabase
    .from("extratos")
    .insert({
      user_id: userId,
      cartorio_id: cartorioId,
      conta_id: contaId,
      arquivo: `extrato_teste_${format(hoje, "yyyy-MM-dd")}.ofx`,
      periodo_inicio: format(inicioSemana, "yyyy-MM-dd"),
      periodo_fim: format(fimSemana, "yyyy-MM-dd"),
      total_lancamentos: 15,
      status: "processado",
    })
    .select()
    .single();

  if (extratoError) throw extratoError;

  // 2. Create extrato items (bank transactions)
  const extratoItens = [
    // Day 1 - Monday
    { data: format(inicioSemana, "yyyy-MM-dd"), descricao: "TED RECEBIDO - CLIENTE SILVA", valor: 2500.00, tipo: "credito" as const },
    { data: format(inicioSemana, "yyyy-MM-dd"), descricao: "TARIFA BANCARIA", valor: 35.90, tipo: "debito" as const },
    { data: format(inicioSemana, "yyyy-MM-dd"), descricao: "PIX RECEBIDO - JOAO SANTOS", valor: 850.00, tipo: "credito" as const },
    
    // Day 2 - Tuesday
    { data: format(addDays(inicioSemana, 1), "yyyy-MM-dd"), descricao: "PAGAMENTO FORNECEDOR ABC", valor: 1200.00, tipo: "debito" as const },
    { data: format(addDays(inicioSemana, 1), "yyyy-MM-dd"), descricao: "DEPOSITO EM DINHEIRO", valor: 3000.00, tipo: "credito" as const },
    
    // Day 3 - Wednesday
    { data: format(addDays(inicioSemana, 2), "yyyy-MM-dd"), descricao: "TED ENVIADO - CARTORIO CENTRAL", valor: 5000.00, tipo: "debito" as const },
    { data: format(addDays(inicioSemana, 2), "yyyy-MM-dd"), descricao: "ESTORNO TARIFA", valor: 15.00, tipo: "credito" as const },
    { data: format(addDays(inicioSemana, 2), "yyyy-MM-dd"), descricao: "RENDIMENTO POUPANCA", valor: 125.50, tipo: "credito" as const },
    
    // Day 4 - Thursday
    { data: format(addDays(inicioSemana, 3), "yyyy-MM-dd"), descricao: "PIX ENVIADO - ENERGIA ELETRICA", valor: 450.00, tipo: "debito" as const },
    { data: format(addDays(inicioSemana, 3), "yyyy-MM-dd"), descricao: "BOLETO RECEBIDO", valor: 1800.00, tipo: "credito" as const },
    { data: format(addDays(inicioSemana, 3), "yyyy-MM-dd"), descricao: "DOC RECEBIDO - MARIA OLIVEIRA", valor: 650.00, tipo: "credito" as const },
    
    // Day 5 - Friday (today area)
    { data: format(addDays(inicioSemana, 4), "yyyy-MM-dd"), descricao: "PAGAMENTO ALUGUEL", valor: 2800.00, tipo: "debito" as const },
    { data: format(addDays(inicioSemana, 4), "yyyy-MM-dd"), descricao: "TED RECEBIDO - EMPRESA XYZ", valor: 4500.00, tipo: "credito" as const },
    { data: format(addDays(inicioSemana, 4), "yyyy-MM-dd"), descricao: "IOF SOBRE OPERACAO", valor: 12.50, tipo: "debito" as const },
    { data: format(addDays(inicioSemana, 4), "yyyy-MM-dd"), descricao: "CHEQUE COMPENSADO 000123", valor: 750.00, tipo: "debito" as const },
  ];

  const { error: itensError } = await supabase.from("extrato_itens").insert(
    extratoItens.map((item, index) => ({
      user_id: userId,
      cartorio_id: cartorioId,
      extrato_id: extrato.id,
      data_transacao: item.data,
      descricao: item.descricao,
      valor: item.valor,
      tipo: item.tipo,
      status_conciliacao: "pendente" as const,
      saldo_parcial: 10000 + (index * 100), // Simulated running balance
    }))
  );

  if (itensError) throw itensError;

  // 3. Create lancamentos (system records) - some will match, some won't
  const lancamentos = [
    // Matching items (same value, close dates)
    { data: format(inicioSemana, "yyyy-MM-dd"), descricao: "Recebimento Cliente Silva - Escritura", valor: 2500.00, tipo: "receita" as const, categoria: "Escrituras" },
    { data: format(inicioSemana, "yyyy-MM-dd"), descricao: "Recebimento PIX João Santos", valor: 850.00, tipo: "receita" as const, categoria: "Registro" },
    { data: format(addDays(inicioSemana, 1), "yyyy-MM-dd"), descricao: "Pagamento Fornecedor ABC Ltda", valor: 1200.00, tipo: "despesa" as const, categoria: "Fornecedores" },
    { data: format(addDays(inicioSemana, 1), "yyyy-MM-dd"), descricao: "Depósito em espécie - caixa", valor: 3000.00, tipo: "receita" as const, categoria: "Caixa" },
    { data: format(addDays(inicioSemana, 2), "yyyy-MM-dd"), descricao: "Repasse Cartório Central", valor: 5000.00, tipo: "despesa" as const, categoria: "Repasses" },
    { data: format(addDays(inicioSemana, 3), "yyyy-MM-dd"), descricao: "Conta de Luz - Dezembro", valor: 450.00, tipo: "despesa" as const, categoria: "Utilidades" },
    { data: format(addDays(inicioSemana, 3), "yyyy-MM-dd"), descricao: "Recebimento Boleto - Certidão", valor: 1800.00, tipo: "receita" as const, categoria: "Certidões" },
    { data: format(addDays(inicioSemana, 4), "yyyy-MM-dd"), descricao: "Pagamento Aluguel Janeiro", valor: 2800.00, tipo: "despesa" as const, categoria: "Aluguel" },
    { data: format(addDays(inicioSemana, 4), "yyyy-MM-dd"), descricao: "Recebimento TED Empresa XYZ", valor: 4500.00, tipo: "receita" as const, categoria: "Escrituras" },
    
    // Non-matching items (system records without bank equivalent)
    { data: format(addDays(inicioSemana, 2), "yyyy-MM-dd"), descricao: "Receita Pendente - Autenticação", valor: 320.00, tipo: "receita" as const, categoria: "Autenticações" },
    { data: format(addDays(inicioSemana, 3), "yyyy-MM-dd"), descricao: "Pagamento Contador", valor: 980.00, tipo: "despesa" as const, categoria: "Serviços" },
    { data: format(addDays(inicioSemana, 4), "yyyy-MM-dd"), descricao: "Receita Reconhecimento Firma", valor: 180.00, tipo: "receita" as const, categoria: "Firmas" },
    
    // Items with slight value differences (to test tolerance)
    { data: format(addDays(inicioSemana, 3), "yyyy-MM-dd"), descricao: "Recebimento Maria Oliveira - Registro", valor: 648.50, tipo: "receita" as const, categoria: "Registro" }, // Bank has 650
  ];

  const { error: lancError } = await supabase.from("lancamentos").insert(
    lancamentos.map((item) => ({
      user_id: userId,
      cartorio_id: cartorioId,
      data: item.data,
      descricao: item.descricao,
      valor: item.valor,
      tipo: item.tipo,
      categoria: item.categoria,
      status: "pago" as const,
      status_conciliacao: "pendente" as const,
    }))
  );

  if (lancError) throw lancError;

  return {
    extratoId: extrato.id,
    itensCount: extratoItens.length,
    lancamentosCount: lancamentos.length,
    periodo: {
      inicio: format(inicioSemana, "dd/MM/yyyy"),
      fim: format(fimSemana, "dd/MM/yyyy"),
    },
  };
}

// Clean up test data
export async function cleanTestData(extratoId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  // Delete conciliações first (foreign key constraint)
  await supabase.from("conciliacoes").delete().eq("user_id", user.id);
  
  // Delete extrato items
  await supabase.from("extrato_itens").delete().eq("user_id", user.id);
  
  // Delete extratos
  await supabase.from("extratos").delete().eq("user_id", user.id);
  
  // Delete lancamentos
  await supabase.from("lancamentos").delete().eq("user_id", user.id);

  return { success: true };
}
