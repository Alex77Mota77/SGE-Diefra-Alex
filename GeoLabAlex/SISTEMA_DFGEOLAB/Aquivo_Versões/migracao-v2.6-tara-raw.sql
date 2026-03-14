-- ══════════════════════════════════════════════════════════════
--  SGEDIEFRA — MIGRAÇÃO v2.6 FINAL
--  Baseada no schema real do banco (março 2026)
--  Tabelas existentes NÃO são alteradas.
--  Execute uma vez no SQL Editor do Supabase.
-- ══════════════════════════════════════════════════════════════

-- ── O que já existe e NÃO será tocado: ───────────────────────
--   ferramentas      (já existe — com categoria, calibracao_prazo)
--   instrumentos_config  (já existe — é config de usuário, não instrumentos)
--   ensaios_raw      (já existe)
--   ensaios_tara     (já existe)
--   ensaios          (já existe)
--   estruturas       (já existe)
--   resultados       (já existe)
--   usuarios         (já existe)

-- ── 1. NOVA tabela 'instrumentos' ────────────────────────────
--    (substitui instrumentos_config para monitoramento de campo)
CREATE TABLE IF NOT EXISTS instrumentos (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tag               TEXT        NOT NULL,
  tipo              TEXT        NOT NULL DEFAULT 'piezometro',
    -- valores: piezometro | nivel_dagua | recalque |
    --          pressao_poros | acelerometro | inclinometro
  cota_m            NUMERIC,
  alerta_atencao    NUMERIC,
  alerta_emergencia NUMERIC,
  laboratorio_id    UUID,       -- sem FK — compatível com qualquer schema
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ── 2. Coluna dados_raw na tabela ensaios (se não existir) ───
ALTER TABLE ensaios ADD COLUMN IF NOT EXISTS dados_raw JSONB;

-- ── 3. RLS para instrumentos ─────────────────────────────────
ALTER TABLE instrumentos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'instrumentos' AND policyname = 'instrumentos_crud'
  ) THEN
    CREATE POLICY "instrumentos_crud" ON instrumentos
      USING      (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- ── 4. Índice de performance ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_instrumentos_lab
  ON instrumentos(laboratorio_id);

-- ══════════════════════════════════════════════════════════════
--  FIM DA MIGRAÇÃO v2.6 FINAL
--  Após executar, atualize o sgediefra.jsx com a versão v2.6.
-- ══════════════════════════════════════════════════════════════
