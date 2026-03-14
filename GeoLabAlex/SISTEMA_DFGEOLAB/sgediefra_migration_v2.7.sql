-- ============================================================
--  SGEDIEFRA — Migração v2.7
--  Novos ensaios e ajustes para calculadoras implementadas
-- ============================================================

-- ── 1. Garantir enum tipo_ensaio existe e tem todos os valores ─
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_ensaio_enum') THEN
    RAISE NOTICE 'Tipo tipo_ensaio_enum nao existe - ensaios.tipo eh TEXT, ok.';
  END IF;
END $$;

-- ── 2. Tabela ensaios_raw — colunas adicionais para novos ensaios ──
ALTER TABLE ensaios_raw
  ADD COLUMN IF NOT EXISTS tipo_calc TEXT,
  ADD COLUMN IF NOT EXISTS dados_raw JSONB,
  ADD COLUMN IF NOT EXISTS operador_id UUID REFERENCES usuarios(id) ON DELETE SET NULL;

-- ── 3. Tabela resultados — garantir colunas necessárias ───────
ALTER TABLE resultados
  ADD COLUMN IF NOT EXISTS laboratorio_id UUID REFERENCES laboratorios(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS dados_extras   JSONB,
  ADD COLUMN IF NOT EXISTS norma          TEXT;

-- ── 4. Tabela spt_camadas — dados brutos de SPT ───────────────
CREATE TABLE IF NOT EXISTS spt_camadas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ensaio_id      UUID NOT NULL REFERENCES ensaios(id) ON DELETE CASCADE,
  prof_m         NUMERIC(8,2) NOT NULL,
  nspt           INTEGER,
  n60            NUMERIC(8,2),
  n1_60          NUMERIC(8,2),
  sigv0_kpa      NUMERIC(10,2),
  sigv0_eff_kpa  NUMERIC(10,2),
  tipo_solo      TEXT DEFAULT 'areia',
  classificacao  TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. Tabela cpt_pontos — dados brutos de CPT/Liquefação ─────
CREATE TABLE IF NOT EXISTS cpt_pontos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ensaio_id      UUID NOT NULL REFERENCES ensaios(id) ON DELETE CASCADE,
  prof_m         NUMERIC(8,3) NOT NULL,
  qc_mpa         NUMERIC(10,4),
  fs_mpa         NUMERIC(10,6),
  sigv0_kpa      NUMERIC(10,2),
  sigv0_eff_kpa  NUMERIC(10,2),
  ic             NUMERIC(8,4),
  qc1n           NUMERIC(8,1),
  qc1ncs         NUMERIC(8,1),
  crr75          NUMERIC(8,4),
  csr            NUMERIC(8,4),
  fs_liq         NUMERIC(8,3),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. Tabela ensaio_fatias — fatias para Bishop Simplificado ─
CREATE TABLE IF NOT EXISTS ensaio_fatias (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ensaio_id      UUID NOT NULL REFERENCES ensaios(id) ON DELETE CASCADE,
  fatia_num      INTEGER NOT NULL,
  b_m            NUMERIC(10,4),
  w_kn_m         NUMERIC(10,4),
  alpha_deg      NUMERIC(8,4),
  u_kpa          NUMERIC(10,4) DEFAULT 0,
  c_kpa          NUMERIC(10,4),
  phi_deg        NUMERIC(8,4),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. Tabela ensaio_cps_concreto — corpos de prova ──────────
-- (já pode existir de versão anterior, ADD COLUMN IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS ensaio_cps_concreto (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ensaio_id      UUID NOT NULL REFERENCES ensaios(id) ON DELETE CASCADE,
  cp_num         INTEGER,
  tipo           TEXT DEFAULT 'compressao', -- compressao | tracao_diametral | modulo
  diametro_mm    NUMERIC(8,2) DEFAULT 100,
  altura_mm      NUMERIC(8,2) DEFAULT 200,
  idade_dias     INTEGER DEFAULT 28,
  carga_kn       NUMERIC(10,3),
  fc_mpa         NUMERIC(8,3),
  fct_mpa        NUMERIC(8,3),
  ecs_gpa        NUMERIC(8,3),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. Tabela ensaio_cps_aco — corpos de prova de aço ────────
CREATE TABLE IF NOT EXISTS ensaio_cps_aco (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ensaio_id      UUID NOT NULL REFERENCES ensaios(id) ON DELETE CASCADE,
  cp_num         INTEGER,
  diametro_mm    NUMERIC(8,2),
  lo_mm          NUMERIC(8,2),
  fy_kn          NUMERIC(10,4),
  fu_kn          NUMERIC(10,4),
  dl_mm          NUMERIC(8,4),
  fy_mpa         NUMERIC(8,2),
  fu_mpa         NUMERIC(8,2),
  alongamento_pct NUMERIC(8,2),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. Índices de performance ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_spt_camadas_ensaio    ON spt_camadas(ensaio_id);
CREATE INDEX IF NOT EXISTS idx_cpt_pontos_ensaio     ON cpt_pontos(ensaio_id);
CREATE INDEX IF NOT EXISTS idx_ensaio_fatias_ensaio  ON ensaio_fatias(ensaio_id);
CREATE INDEX IF NOT EXISTS idx_cps_concreto_ensaio   ON ensaio_cps_concreto(ensaio_id);
CREATE INDEX IF NOT EXISTS idx_cps_aco_ensaio        ON ensaio_cps_aco(ensaio_id);
CREATE INDEX IF NOT EXISTS idx_resultados_lab        ON resultados(laboratorio_id);

-- ── 10. RLS para novas tabelas ────────────────────────────────
ALTER TABLE spt_camadas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpt_pontos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ensaio_fatias      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ensaio_cps_concreto ENABLE ROW LEVEL SECURITY;
ALTER TABLE ensaio_cps_aco     ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- spt_camadas
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='spt_camadas' AND policyname='spt_auth') THEN
    EXECUTE 'CREATE POLICY spt_auth ON spt_camadas FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
  -- cpt_pontos
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='cpt_pontos' AND policyname='cpt_auth') THEN
    EXECUTE 'CREATE POLICY cpt_auth ON cpt_pontos FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
  -- ensaio_fatias
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ensaio_fatias' AND policyname='fatias_auth') THEN
    EXECUTE 'CREATE POLICY fatias_auth ON ensaio_fatias FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
  -- cps_concreto
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ensaio_cps_concreto' AND policyname='cps_conc_auth') THEN
    EXECUTE 'CREATE POLICY cps_conc_auth ON ensaio_cps_concreto FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
  -- cps_aco
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ensaio_cps_aco' AND policyname='cps_aco_auth') THEN
    EXECUTE 'CREATE POLICY cps_aco_auth ON ensaio_cps_aco FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- ── 11. Função helper: salvar dados brutos de ensaio ──────────
-- Upsert genérico de dados_raw em ensaios_raw
CREATE OR REPLACE FUNCTION salvar_dados_raw(
  p_ensaio_id UUID,
  p_tipo_calc TEXT,
  p_dados     JSONB,
  p_operador  UUID DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO ensaios_raw (ensaio_id, tipo_calc, dados_raw, operador_id)
  VALUES (p_ensaio_id, p_tipo_calc, p_dados, p_operador)
  ON CONFLICT (ensaio_id) DO UPDATE
    SET tipo_calc  = EXCLUDED.tipo_calc,
        dados_raw  = EXCLUDED.dados_raw,
        operador_id = COALESCE(EXCLUDED.operador_id, ensaios_raw.operador_id),
        updated_at = NOW()
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Adicionar updated_at em ensaios_raw se não existir
ALTER TABLE ensaios_raw ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ── 12. View: resumo por tipo de ensaio (para dashboard) ──────
CREATE OR REPLACE VIEW vw_ensaios_por_tipo AS
SELECT
  tipo,
  COUNT(*)                                        AS total,
  COUNT(*) FILTER (WHERE status='conforme')       AS conformes,
  COUNT(*) FILTER (WHERE status='nao_conforme')   AS nao_conformes,
  COUNT(*) FILTER (WHERE status='pendente')       AS pendentes,
  MAX(data_ensaio)                                AS ultimo_ensaio
FROM ensaios
GROUP BY tipo;

-- ── FIM v2.7 ──────────────────────────────────────────────────
