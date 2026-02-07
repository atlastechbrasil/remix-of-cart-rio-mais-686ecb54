-- Clean up duplicate conciliacoes (keep only the most recent one for each extrato_item_id)
DELETE FROM conciliacoes c1
WHERE c1.id NOT IN (
  SELECT DISTINCT ON (extrato_item_id) id
  FROM conciliacoes
  ORDER BY extrato_item_id, conciliado_em DESC
);

-- Add unique constraint to prevent duplicates in the future
-- Each extrato_item can only be linked to one lancamento at a time
CREATE UNIQUE INDEX IF NOT EXISTS conciliacoes_extrato_item_unique 
ON conciliacoes(extrato_item_id);

-- Each lancamento can only be linked to one extrato_item at a time  
CREATE UNIQUE INDEX IF NOT EXISTS conciliacoes_lancamento_unique 
ON conciliacoes(lancamento_id);