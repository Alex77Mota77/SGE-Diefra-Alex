-- ═══════════════════════════════════════════════════════════════
--  MIGRAÇÃO v2.5 — Novos Tipos de Ensaio (39 ensaios DIEFRA)
--  Execute no SQL Editor do Supabase
--  Data: 2025
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- PASSO 1: Adicionar novos valores ao ENUM tipo_ensaio
-- (IF NOT EXISTS evita erro se já existir)
-- ─────────────────────────────────────────────────────────────
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'granulometria_peneiramento_sedimentacao';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'granulometria_peneiramento';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'granulometria_completa';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'teor_umidade_natural';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'massa_especifica_real_graos';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'peso_especifico_graos';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'massa_especifica_aparente_natural';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'densidade_aparente_natural';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'densidade_aparente_saturada';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'limite_liquidez';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'limite_plasticidade';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'proctor_normal';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'proctor_modificado';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'proctor_internormal';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'proctor_intermediario';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'proctor_intermodificado';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'cisalhamento_4_estagios';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'triaxial_ciu_4300';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'triaxial_cid_4300';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'adensamento_sem_permeab';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'adensamento_com_permeab';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'compacidade_vazio_maximo';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'compacidade_vazio_minimo';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'permeabilidade_carga_variavel';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'permeabilidade_carga_constante';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'isc_03_pontos';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'isc_05_pontos';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'isc_01_ponto_qualquer_energia';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'direct_simple_shear';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'amostragem_campo';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'dosagem_bgtc';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'equivalente_areia';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'analise_via_umida_minerios';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'oxidos_totais_frx';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'analise_termogravimetrica';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'analise_enxofre_leco';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'difracao_raios_x_rietveld';
ALTER TYPE tipo_ensaio ADD VALUE IF NOT EXISTS 'corte_testemunho';

-- ─────────────────────────────────────────────────────────────
-- PASSO 2: Criar tabela de catálogo (se não existir)
-- Armazena metadados de cada tipo — label, norma, área
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tipos_ensaio_catalogo (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo    TEXT NOT NULL UNIQUE,   -- chave do NORMAS no frontend
  label     TEXT NOT NULL,          -- nome exibido
  norma     TEXT,                   -- ex: ABNT NBR 7181
  area      TEXT DEFAULT 'solos',   -- solos | concreto | aco | barragens
  ativo     BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tipos_ensaio_catalogo ENABLE ROW LEVEL SECURITY;

-- Todos os usuários autenticados podem consultar o catálogo
CREATE POLICY "catalogo_leitura_publica" ON tipos_ensaio_catalogo
  FOR SELECT USING (auth.role() = 'authenticated');

-- Somente admin pode inserir/editar
CREATE POLICY "catalogo_admin_escreve" ON tipos_ensaio_catalogo
  FOR ALL USING (
    EXISTS (SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- PASSO 3: Inserir os ensaios já existentes no catálogo
-- ─────────────────────────────────────────────────────────────
INSERT INTO tipos_ensaio_catalogo (codigo, label, norma, area, ativo) VALUES
  ('granulometria',       'Granulometria',                  'ABNT NBR 7181',       'solos',     true),
  ('atterberg',           'Limites de Atterberg',           'ABNT NBR 6459/7180',  'solos',     true),
  ('compactacao_proctor', 'Compactação Proctor',            'ABNT NBR 7182',       'solos',     true),
  ('hilf',                'Compactação Hilf (Rápido)',      'DNER ME 162/94',      'solos',     true),
  ('cbr',                 'CBR / ISC',                      'ABNT NBR 9895',       'solos',     true),
  ('triaxial',            'Triaxial CU/CD',                 'ABNT NBR 12007',      'solos',     true),
  ('adensamento',         'Adensamento',                    'ABNT NBR 12007',      'solos',     true),
  ('permeabilidade',      'Permeabilidade',                 'ABNT NBR 14545',      'solos',     true),
  ('spt',                 'Sondagem SPT',                   'ABNT NBR 6484',       'solos',     true),
  ('compressao_concreto', 'Compressão — Concreto',          'ABNT NBR 5739',       'concreto',  true),
  ('tracao_diametral',    'Tração Diametral',               'ABNT NBR 7222',       'concreto',  true),
  ('modulo_elasticidade', 'Módulo de Elasticidade',         'ABNT NBR 8522',       'concreto',  true),
  ('durabilidade',        'Durabilidade',                   'ABNT NBR 12655',      'concreto',  true),
  ('tracao_aco',          'Tração — Aço',                   'ABNT NBR 6152',       'aco',       true),
  ('dobramento',          'Dobramento',                     'ABNT NBR 6153',       'aco',       true),
  ('charpy',              'Impacto Charpy',                 'ABNT NBR 6157',       'aco',       true),
  ('liquefacao_cpt',      'Potencial de Liquefação (CPT)',  'ANM 95/2022',         'barragens', true),
  ('estabilidade_talude', 'Estabilidade de Talude',         'NBR 11682',           'barragens', true),
  ('percolacao',          'Análise de Percolação',          'ICOLD Bulletin 164',  'barragens', true)
ON CONFLICT (codigo) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- PASSO 4: Inserir os 38 novos ensaios DIEFRA
-- ─────────────────────────────────────────────────────────────
INSERT INTO tipos_ensaio_catalogo (codigo, label, norma, area, ativo) VALUES
  ('granulometria_peneiramento_sedimentacao', 'Granulometria Peneiramento + Sedimentação', 'ABNT NBR 7181', 'solos', true),
  ('granulometria_peneiramento', 'Granulometria por Peneiramento', 'ABNT NBR 7181', 'solos', true),
  ('granulometria_completa', 'Granulometria Completa', 'ABNT NBR 7181', 'solos', true),
  ('teor_umidade_natural', 'Teor de Umidade Natural', 'ABNT NBR 6457', 'solos', true),
  ('massa_especifica_real_graos', 'Massa Específica Real (Densidade dos Grãos)', 'ABNT NBR 6508', 'solos', true),
  ('peso_especifico_graos', 'Peso Específico dos Grãos', 'ABNT NBR 6508', 'solos', true),
  ('massa_especifica_aparente_natural', 'Massa Específica Aparente / Peso Específico Natural', 'ABNT NBR 9813', 'solos', true),
  ('densidade_aparente_natural', 'Densidade Aparente Natural', 'ABNT NBR 9813', 'solos', true),
  ('densidade_aparente_saturada', 'Densidade Aparente Saturada', 'ABNT NBR 9813', 'solos', true),
  ('limite_liquidez', 'Limite de Liquidez (LL)', 'ABNT NBR 6459', 'solos', true),
  ('limite_plasticidade', 'Limite de Plasticidade (LP)', 'ABNT NBR 7180', 'solos', true),
  ('proctor_normal', 'Proctor Normal', 'ABNT NBR 7182', 'solos', true),
  ('proctor_modificado', 'Compactação Proctor Modificado', 'ABNT NBR 7182', 'solos', true),
  ('proctor_internormal', 'Compactação Proctor Internormal', 'ABNT NBR 7182', 'solos', true),
  ('proctor_intermediario', 'Compactação Proctor Intermediário', 'ABNT NBR 7182', 'solos', true),
  ('proctor_intermodificado', 'Compactação Proctor Intermediário-Modificado', 'ABNT NBR 7182', 'solos', true),
  ('cisalhamento_4_estagios', 'Cisalhamento Direto (4 Estágios)', 'ABNT NBR 12069', 'solos', true),
  ('triaxial_ciu_4300', 'Triaxial CIU Sat σ3 4300 kPa por CP', 'ABNT NBR 12007 / ASTM D4767', 'solos', true),
  ('triaxial_cid_4300', 'Triaxial CID σ3 4300 kPa por CP', 'ABNT NBR 12007 / ASTM D7181', 'solos', true),
  ('adensamento_sem_permeab', 'Adensamento Edométrico sem Permeabilidade', 'ABNT NBR 12007', 'solos', true),
  ('adensamento_com_permeab', 'Adensamento Edométrico com Permeabilidade', 'ABNT NBR 12007', 'solos', true),
  ('compacidade_vazio_maximo', 'Compacidade Relativa — emax', 'ABNT NBR 12004', 'solos', true),
  ('compacidade_vazio_minimo', 'Compacidade Relativa — emin', 'ABNT NBR 12051', 'solos', true),
  ('permeabilidade_carga_variavel', 'Permeabilidade Carga Variável', 'ABNT NBR 14545', 'solos', true),
  ('permeabilidade_carga_constante', 'Permeabilidade Carga Constante', 'ABNT NBR 14545', 'solos', true),
  ('isc_03_pontos', 'ISC 03 Pontos', 'ABNT NBR 9895', 'solos', true),
  ('isc_05_pontos', 'ISC 05 Pontos', 'ABNT NBR 9895', 'solos', true),
  ('isc_01_ponto_qualquer_energia', 'ISC 01 Ponto Qualquer Energia', 'ABNT NBR 9895 / DNER ME 162', 'solos', true),
  ('direct_simple_shear', 'Direct Simple Shear (DSS)', 'ASTM D6528', 'solos', true),
  ('amostragem_campo', 'Amostragem de Campo', 'ABNT NBR 9604', 'solos', true),
  ('dosagem_bgtc', 'Dosagem de BGTC', 'DNIT 167/2013-ME', 'solos', true),
  ('equivalente_areia', 'Equivalente de Areia', 'ABNT NBR NM 30', 'solos', true),
  ('analise_via_umida_minerios', 'Análises via Úmida Clássica', 'ABNT ISO 11885', 'solos', true),
  ('oxidos_totais_frx', 'Óxidos Totais — FRX', 'ABNT ISO 14869-1 / FRX', 'solos', true),
  ('analise_termogravimetrica', 'Análise Termogravimétrica (TGA)', 'ASTM E1131 / ISO 11358', 'solos', true),
  ('analise_enxofre_leco', 'Análise de Enxofre (Leco)', 'ASTM E1018 / NBR ISO 15350', 'solos', true),
  ('difracao_raios_x_rietveld', 'Difração de Raios X — Rietveld', 'ASTM C1365 / ISO 29581-2', 'solos', true),
  ('corte_testemunho', 'Corte de Testemunho / Serragem', 'Procedimento interno', 'solos', true)
ON CONFLICT (codigo) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- PASSO 5: Tabela de parâmetros por tipo de ensaio (opcional)
-- Permite registrar os campos esperados de cada tipo
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parametros_ensaio_catalogo (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_codigo     TEXT NOT NULL REFERENCES tipos_ensaio_catalogo(codigo) ON DELETE CASCADE,
  parametro       TEXT NOT NULL,
  unidade         TEXT,
  limite_minimo   NUMERIC,
  limite_maximo   NUMERIC,
  obrigatorio     BOOLEAN DEFAULT true,
  ordem           INT DEFAULT 0
);

ALTER TABLE parametros_ensaio_catalogo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "params_leitura_publica" ON parametros_ensaio_catalogo
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "params_admin_escreve" ON parametros_ensaio_catalogo
  FOR ALL USING (
    EXISTS (SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- VERIFICAÇÃO FINAL
-- ─────────────────────────────────────────────────────────────
SELECT
  area,
  COUNT(*) AS total,
  STRING_AGG(codigo, ', ' ORDER BY codigo) AS ensaios
FROM tipos_ensaio_catalogo
WHERE ativo = true
GROUP BY area
ORDER BY area;
