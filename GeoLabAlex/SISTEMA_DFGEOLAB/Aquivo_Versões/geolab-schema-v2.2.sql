-- ============================================================
--  GEOLAB PRO — Schema SQL Completo para Supabase/PostgreSQL
--  Versão 2.0 | ISO/IEC 17025 | ANM 95/2022 | ABNT
-- ============================================================

-- ── EXTENSÕES ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUM TYPES ─────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('admin','engenheiro','tecnico','cliente','auditor');
CREATE TYPE status_ensaio AS ENUM ('pendente','em_andamento','concluido','cancelado');
CREATE TYPE status_conformidade AS ENUM ('conforme','nao_conforme','atencao','pendente');
CREATE TYPE nivel_emergencia AS ENUM ('ANE0','ANE1','ANE2','ANE3');
CREATE TYPE metodo_barragem AS ENUM ('montante','linha_centro','jusante','outros');
CREATE TYPE tipo_ensaio AS ENUM (
  'granulometria','atterberg','compactacao_proctor','hilf',
  'cbr','triaxial','adensamento','permeabilidade',
  'compressao_concreto','tracao_diametral','modulo_elasticidade','durabilidade',
  'tracao_aco','dobramento','charpy',
  'liquefacao_cpt','estabilidade_talude','percolacao','spt'
);

-- ── TABELA: LABORATÓRIOS ───────────────────────────────────
CREATE TABLE laboratorios (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo          TEXT UNIQUE NOT NULL,
  nome            TEXT NOT NULL,
  cidade          TEXT NOT NULL,
  estado          CHAR(2) NOT NULL,
  endereco        TEXT,
  telefone        TEXT,
  email           TEXT,
  responsavel     TEXT,
  crea_responsavel TEXT,
  acreditacao_iso BOOLEAN DEFAULT false,
  numero_acreditacao TEXT,
  ativo           BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── TABELA: USUÁRIOS ───────────────────────────────────────
CREATE TABLE usuarios (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id         UUID UNIQUE, -- referência ao Supabase Auth
  nome            TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  crea            TEXT,
  cargo           TEXT,
  role            user_role NOT NULL DEFAULT 'tecnico',
  laboratorio_id  UUID REFERENCES laboratorios(id),
  ativo           BOOLEAN DEFAULT true,
  ultimo_acesso   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── TABELA: CLIENTES / OBRAS ───────────────────────────────
CREATE TABLE clientes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome            TEXT NOT NULL,
  cnpj_cpf        TEXT,
  contato         TEXT,
  email           TEXT,
  obra            TEXT,
  municipio       TEXT,
  laboratorio_id  UUID REFERENCES laboratorios(id),
  ativo           BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── TABELA: ESTRUTURAS MONITORADAS (BARRAGENS) ─────────────
CREATE TABLE estruturas (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome            TEXT NOT NULL,
  codigo          TEXT UNIQUE,
  tipo            TEXT NOT NULL, -- barragem_rejeito, barragem_agua, dique, talude
  metodo          metodo_barragem,
  municipio       TEXT,
  estado          CHAR(2),
  coordenada_lat  DECIMAL(10,7),
  coordenada_lng  DECIMAL(10,7),
  altura_m        DECIMAL(8,2),
  comprimento_m   DECIMAL(10,2),
  volume_m3       DECIMAL(15,2),
  nivel_emergencia nivel_emergencia DEFAULT 'ANE0',
  fs_estatico     DECIMAL(6,3),
  fs_sismico      DECIMAL(6,3),
  data_ultima_auditoria DATE,
  responsavel_id  UUID REFERENCES usuarios(id),
  laboratorio_id  UUID REFERENCES laboratorios(id),
  observacoes     TEXT,
  ativo           BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── TABELA: AMOSTRAS ───────────────────────────────────────
CREATE TABLE amostras (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo          TEXT UNIQUE NOT NULL,
  descricao       TEXT,
  origem          TEXT NOT NULL, -- local de coleta
  profundidade_m  DECIMAL(8,2),
  coordenada_lat  DECIMAL(10,7),
  coordenada_lng  DECIMAL(10,7),
  data_coleta     DATE NOT NULL,
  data_entrada    DATE DEFAULT CURRENT_DATE,
  coletado_por    TEXT,
  cliente_id      UUID REFERENCES clientes(id),
  estrutura_id    UUID REFERENCES estruturas(id),
  laboratorio_id  UUID REFERENCES laboratorios(id) NOT NULL,
  responsavel_id  UUID REFERENCES usuarios(id),
  observacoes     TEXT,
  status          TEXT DEFAULT 'em_analise',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── TABELA: ENSAIOS ────────────────────────────────────────
CREATE TABLE ensaios (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo          TEXT UNIQUE NOT NULL,
  amostra_id      UUID REFERENCES amostras(id),
  tipo            tipo_ensaio NOT NULL,
  norma           TEXT NOT NULL,
  data_inicio     TIMESTAMPTZ DEFAULT NOW(),
  data_conclusao  TIMESTAMPTZ,
  status          status_ensaio DEFAULT 'em_andamento',
  responsavel_id  UUID REFERENCES usuarios(id),
  laboratorio_id  UUID REFERENCES laboratorios(id),
  equipamento     TEXT,
  temperatura_c   DECIMAL(5,2),
  umidade_rel     DECIMAL(5,2),
  observacoes     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── TABELA: RESULTADOS ─────────────────────────────────────
CREATE TABLE resultados (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ensaio_id           UUID REFERENCES ensaios(id) ON DELETE CASCADE,
  parametro           TEXT NOT NULL,
  valor_numerico      DECIMAL(20,6),
  valor_texto         TEXT,
  unidade             TEXT,
  limite_minimo       DECIMAL(20,6),
  limite_maximo       DECIMAL(20,6),
  referencia_limite   TEXT, -- ex: "NBR 11682 — FS ≥ 1.30"
  status_conformidade status_conformidade DEFAULT 'pendente',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── TABELA: LAUDOS ─────────────────────────────────────────
CREATE TABLE laudos (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo              TEXT UNIQUE NOT NULL,
  ensaio_id           UUID REFERENCES ensaios(id),
  titulo              TEXT NOT NULL,
  conclusao           TEXT,
  status_geral        status_conformidade,
  responsavel_id      UUID REFERENCES usuarios(id),
  conferente_id       UUID REFERENCES usuarios(id),
  data_emissao        TIMESTAMPTZ DEFAULT NOW(),
  data_validade       DATE,
  pdf_url             TEXT,
  assinado            BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── TABELA: INSTRUMENTAÇÃO (Barragens) ─────────────────────
CREATE TABLE instrumentacao (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estrutura_id    UUID REFERENCES estruturas(id),
  tipo_instrumento TEXT NOT NULL, -- piezometro, régua, marcos, inclinometro
  codigo_instrumento TEXT,
  valor           DECIMAL(12,4),
  unidade         TEXT,
  alerta_amarelo  DECIMAL(12,4),
  alerta_vermelho DECIMAL(12,4),
  nivel_alerta    TEXT DEFAULT 'normal', -- normal, atencao, critico
  data_leitura    TIMESTAMPTZ DEFAULT NOW(),
  lido_por        UUID REFERENCES usuarios(id),
  observacoes     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── TABELA: AUDITORIA DE AÇÕES ─────────────────────────────
CREATE TABLE auditoria (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id  UUID REFERENCES usuarios(id),
  acao        TEXT NOT NULL,
  tabela      TEXT,
  registro_id UUID,
  dados_antes JSONB,
  dados_depois JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── TABELA: NOTIFICAÇÕES ───────────────────────────────────
CREATE TABLE notificacoes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id      UUID REFERENCES usuarios(id),
  tipo            TEXT NOT NULL, -- alerta_fs, laudo_pronto, nao_conformidade
  titulo          TEXT NOT NULL,
  mensagem        TEXT,
  lida            BOOLEAN DEFAULT false,
  dados_extras    JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── ÍNDICES DE PERFORMANCE ─────────────────────────────────
CREATE INDEX idx_ensaios_laboratorio ON ensaios(laboratorio_id);
CREATE INDEX idx_ensaios_amostra ON ensaios(amostra_id);
CREATE INDEX idx_ensaios_status ON ensaios(status);
CREATE INDEX idx_ensaios_tipo ON ensaios(tipo);
CREATE INDEX idx_resultados_ensaio ON resultados(ensaio_id);
CREATE INDEX idx_amostras_laboratorio ON amostras(laboratorio_id);
CREATE INDEX idx_instrumentacao_estrutura ON instrumentacao(estrutura_id);
CREATE INDEX idx_instrumentacao_data ON instrumentacao(data_leitura);
CREATE INDEX idx_laudos_ensaio ON laudos(ensaio_id);
CREATE INDEX idx_notificacoes_usuario ON notificacoes(usuario_id, lida);

-- ── ROW LEVEL SECURITY (RLS) ───────────────────────────────
ALTER TABLE laboratorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE amostras ENABLE ROW LEVEL SECURITY;
ALTER TABLE ensaios ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE laudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estruturas ENABLE ROW LEVEL SECURITY;

-- Política: Admin vê tudo, outros veem apenas seu laboratório
CREATE POLICY "admin_full_access" ON ensaios
  FOR ALL USING (
    EXISTS (SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND role = 'admin')
    OR laboratorio_id = (SELECT laboratorio_id FROM usuarios WHERE auth_id = auth.uid())
  );

CREATE POLICY "laboratorio_own_data" ON amostras
  FOR ALL USING (
    laboratorio_id = (SELECT laboratorio_id FROM usuarios WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND role IN ('admin','auditor'))
  );

CREATE POLICY "resultados_via_ensaio" ON resultados
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ensaios e
      JOIN usuarios u ON u.auth_id = auth.uid()
      WHERE e.id = resultados.ensaio_id
      AND (e.laboratorio_id = u.laboratorio_id OR u.role IN ('admin','auditor'))
    )
  );

-- ── FUNÇÃO: Auto-update updated_at ─────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ensaios_updated BEFORE UPDATE ON ensaios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_estruturas_updated BEFORE UPDATE ON estruturas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── FUNÇÃO: Gerar código automático de ensaio ──────────────
CREATE OR REPLACE FUNCTION gerar_codigo_ensaio(lab_codigo TEXT, tipo_ens TEXT)
RETURNS TEXT AS $$
DECLARE seq INT;
BEGIN
  SELECT COUNT(*)+1 INTO seq FROM ensaios
  WHERE codigo LIKE lab_codigo || '-' || EXTRACT(YEAR FROM NOW()) || '%';
  RETURN lab_codigo || '-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ── FUNÇÃO: Verificar conformidade automática ──────────────
CREATE OR REPLACE FUNCTION verificar_conformidade()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.limite_minimo IS NOT NULL AND NEW.valor_numerico < NEW.limite_minimo THEN
    NEW.status_conformidade = 'nao_conforme';
  ELSIF NEW.limite_maximo IS NOT NULL AND NEW.valor_numerico > NEW.limite_maximo THEN
    NEW.status_conformidade = 'nao_conforme';
  ELSIF NEW.limite_minimo IS NOT NULL AND NEW.valor_numerico < NEW.limite_minimo * 1.1 THEN
    NEW.status_conformidade = 'atencao';
  ELSE
    NEW.status_conformidade = 'conforme';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_conformidade BEFORE INSERT OR UPDATE ON resultados
  FOR EACH ROW WHEN (NEW.valor_numerico IS NOT NULL)
  EXECUTE FUNCTION verificar_conformidade();

-- ── DADOS INICIAIS (SEED) ──────────────────────────────────
INSERT INTO laboratorios (codigo, nome, cidade, estado, acreditacao_iso) VALUES
  ('LAB-BH', 'GeoLab Belo Horizonte', 'Belo Horizonte', 'MG', true),
  ('LAB-SP', 'GeoLab São Paulo', 'São Paulo', 'SP', true),
  ('LAB-IT', 'GeoLab Itabira', 'Itabira', 'MG', false);

-- ── VIEW: Dashboard de KPIs ────────────────────────────────
CREATE OR REPLACE VIEW vw_kpis_laboratorio AS
SELECT
  l.id AS laboratorio_id,
  l.nome AS laboratorio,
  COUNT(DISTINCT e.id) AS total_ensaios,
  COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'concluido') AS ensaios_concluidos,
  COUNT(DISTINCT la.id) AS laudos_emitidos,
  ROUND(
    100.0 * COUNT(r.id) FILTER (WHERE r.status_conformidade = 'conforme') /
    NULLIF(COUNT(r.id) FILTER (WHERE r.status_conformidade != 'pendente'), 0), 1
  ) AS pct_conformidade,
  COUNT(DISTINCT est.id) AS estruturas_monitoradas,
  COUNT(DISTINCT est.id) FILTER (WHERE est.nivel_emergencia != 'ANE0') AS estruturas_alerta
FROM laboratorios l
LEFT JOIN ensaios e ON e.laboratorio_id = l.id
LEFT JOIN laudos la ON la.ensaio_id = e.id
LEFT JOIN resultados r ON r.ensaio_id = e.id
LEFT JOIN estruturas est ON est.laboratorio_id = l.id
GROUP BY l.id, l.nome;

-- ── VIEW: Últimos ensaios com status ───────────────────────
CREATE OR REPLACE VIEW vw_ultimos_ensaios AS
SELECT
  e.id, e.codigo, e.tipo, e.norma, e.status, e.created_at,
  a.origem AS local_coleta,
  u.nome AS responsavel,
  l.codigo AS laboratorio,
  CASE
    WHEN EXISTS (SELECT 1 FROM resultados r WHERE r.ensaio_id = e.id AND r.status_conformidade = 'nao_conforme') THEN 'nao_conforme'
    WHEN EXISTS (SELECT 1 FROM resultados r WHERE r.ensaio_id = e.id AND r.status_conformidade = 'atencao') THEN 'atencao'
    ELSE 'conforme'
  END AS status_conformidade_geral
FROM ensaios e
LEFT JOIN amostras a ON a.id = e.amostra_id
LEFT JOIN usuarios u ON u.id = e.responsavel_id
LEFT JOIN laboratorios l ON l.id = e.laboratorio_id
ORDER BY e.created_at DESC;

-- ============================================================
--  CONEXÃO NO APP (variáveis de ambiente):
--  VITE_SUPABASE_URL=https://seu-projeto.supabase.co
--  VITE_SUPABASE_ANON_KEY=sua-chave-publica-aqui
-- ============================================================


-- ══════════════════════════════════════════════════════════════
--  MIGRAÇÃO v2.1 — Instrumentos + Perfil automático
--  Execute este bloco no SQL Editor do Supabase
-- ══════════════════════════════════════════════════════════════

-- ── TABELA: Config de instrumentos por usuário ──────────────
CREATE TABLE IF NOT EXISTS instrumentos_config (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id   UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  config       JSONB NOT NULL DEFAULT '[]',
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE instrumentos_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuario_ve_propria_config" ON instrumentos_config
  FOR ALL USING (usuario_id = auth.uid());

-- ── TABELA: Auditoria (garantir que existe) ─────────────────
CREATE TABLE IF NOT EXISTS auditoria (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id   UUID REFERENCES usuarios(id),
  acao         TEXT NOT NULL,          -- INSERT, UPDATE, DELETE
  tabela       TEXT NOT NULL,
  registro_id  UUID,
  detalhes     JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_ve_auditoria" ON auditoria
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND role IN ('admin','auditor'))
  );

CREATE POLICY "sistema_insere_auditoria" ON auditoria
  FOR INSERT WITH CHECK (true);

-- ── TRIGGER: Auto-audit em INSERT/UPDATE/DELETE de ensaios ──
CREATE OR REPLACE FUNCTION fn_audit_ensaio()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_uid UUID;
BEGIN
  SELECT id INTO v_uid FROM usuarios WHERE auth_id = auth.uid() LIMIT 1;
  IF TG_OP = 'DELETE' THEN
    INSERT INTO auditoria(usuario_id,acao,tabela,registro_id,detalhes)
    VALUES(v_uid,'DELETE','ensaios',OLD.id,to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO auditoria(usuario_id,acao,tabela,registro_id,detalhes)
    VALUES(v_uid,'UPDATE','ensaios',NEW.id,jsonb_build_object('before',to_jsonb(OLD),'after',to_jsonb(NEW)));
    RETURN NEW;
  ELSE
    INSERT INTO auditoria(usuario_id,acao,tabela,registro_id,detalhes)
    VALUES(v_uid,'INSERT','ensaios',NEW.id,to_jsonb(NEW));
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_ensaio ON ensaios;
CREATE TRIGGER trg_audit_ensaio
  AFTER INSERT OR UPDATE OR DELETE ON ensaios
  FOR EACH ROW EXECUTE FUNCTION fn_audit_ensaio();

-- ── TRIGGER: Auto-audit em resultados ───────────────────────
CREATE OR REPLACE FUNCTION fn_audit_resultado()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_uid UUID;
BEGIN
  SELECT id INTO v_uid FROM usuarios WHERE auth_id = auth.uid() LIMIT 1;
  IF TG_OP = 'INSERT' THEN
    INSERT INTO auditoria(usuario_id,acao,tabela,registro_id,detalhes)
    VALUES(v_uid,'INSERT','resultados',NEW.id,jsonb_build_object('ensaio_id',NEW.ensaio_id,'parametro',NEW.parametro,'valor',NEW.valor_numerico,'status',NEW.status_conformidade));
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_resultado ON resultados;
CREATE TRIGGER trg_audit_resultado
  AFTER INSERT ON resultados
  FOR EACH ROW EXECUTE FUNCTION fn_audit_resultado();

-- ── TRIGGER: Auto-audit em usuarios ─────────────────────────
CREATE OR REPLACE FUNCTION fn_audit_usuario()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO auditoria(usuario_id,acao,tabela,registro_id,detalhes)
    VALUES(NEW.id,'INSERT','usuarios',NEW.id,jsonb_build_object('email',NEW.email,'role',NEW.role,'cargo',NEW.cargo));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO auditoria(usuario_id,acao,tabela,registro_id,detalhes)
    VALUES(NEW.id,'UPDATE','usuarios',NEW.id,jsonb_build_object('email',NEW.email,'role',NEW.role));
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_usuario ON usuarios;
CREATE TRIGGER trg_audit_usuario
  AFTER INSERT OR UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION fn_audit_usuario();

-- ── TRIGGER: Auto-audit em laudos ───────────────────────────
CREATE OR REPLACE FUNCTION fn_audit_laudo()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_uid UUID;
BEGIN
  SELECT id INTO v_uid FROM usuarios WHERE auth_id = auth.uid() LIMIT 1;
  INSERT INTO auditoria(usuario_id,acao,tabela,registro_id,detalhes)
  VALUES(v_uid,TG_OP,'laudos',NEW.id,jsonb_build_object('codigo',NEW.codigo,'status',NEW.status));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_laudo ON laudos;
CREATE TRIGGER trg_audit_laudo
  AFTER INSERT OR UPDATE ON laudos
  FOR EACH ROW EXECUTE FUNCTION fn_audit_laudo();

-- ── TRIGGER: Auto-audit em instrumentacao ───────────────────
CREATE OR REPLACE FUNCTION fn_audit_instr()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_uid UUID;
BEGIN
  SELECT id INTO v_uid FROM usuarios WHERE auth_id = auth.uid() LIMIT 1;
  INSERT INTO auditoria(usuario_id,acao,tabela,registro_id,detalhes)
  VALUES(v_uid,'INSERT','instrumentacao',NEW.id,jsonb_build_object('codigo',NEW.codigo_instrumento,'valor',NEW.valor,'alerta',NEW.nivel_alerta));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_instr ON instrumentacao;
CREATE TRIGGER trg_audit_instr
  AFTER INSERT ON instrumentacao
  FOR EACH ROW EXECUTE FUNCTION fn_audit_instr();

-- ── HABILITAR REALTIME nas novas tabelas ─────────────────────
-- Execute manualmente: Database > Replication > supabase_realtime
-- Tabelas: instrumentos_config, auditoria

-- ── VERIFICAÇÃO FINAL ────────────────────────────────────────
SELECT
  t.tablename,
  t.rowsecurity AS rls_ativo,
  COUNT(p.policyname) AS politicas
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
  AND t.tablename IN ('ensaios','resultados','usuarios','laudos','instrumentacao','instrumentos_config','auditoria')
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;


-- ══════════════════════════════════════════════════════════════
--  MIGRAÇÃO v2.2 — Dados brutos dos cálculos (calculadoras)
--  Execute este bloco após a migração v2.1
-- ══════════════════════════════════════════════════════════════

-- ── Dados brutos dos cálculos (peneiras, pontos Proctor, CPs...) ──
CREATE TABLE IF NOT EXISTS ensaios_raw (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ensaio_id    UUID NOT NULL REFERENCES ensaios(id) ON DELETE CASCADE,
  dados_brutos JSONB NOT NULL DEFAULT '{}',
  origem       TEXT DEFAULT 'manual',   -- 'serial_ou_teclado' | 'importacao_excel'
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ensaios_raw ENABLE ROW LEVEL SECURITY;

-- Mesma política do ensaio pai
CREATE POLICY "usuario_ve_raw_do_seu_lab" ON ensaios_raw
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ensaios e
      JOIN usuarios u ON u.laboratorio_id = e.laboratorio_id
      WHERE e.id = ensaios_raw.ensaio_id
        AND u.auth_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND role = 'admin')
  );

-- ── Índice para busca por ensaio ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ensaios_raw_ensaio ON ensaios_raw(ensaio_id);

-- ── Verificação ──────────────────────────────────────────────
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('ensaios_raw','instrumentos_config','auditoria');


-- ══════════════════════════════════════════════════════════════
--  🔴 FIX URGENTE — RLS bloqueando criação de perfil
--  Execute AGORA no SQL Editor do Supabase
-- ══════════════════════════════════════════════════════════════

-- ── 1. Política que permite usuário criar o PRÓPRIO perfil ───
-- (sem isso, o INSERT falha porque o usuário não está na tabela ainda)
DROP POLICY IF EXISTS "usuario_pode_criar_proprio_perfil" ON usuarios;
CREATE POLICY "usuario_pode_criar_proprio_perfil" ON usuarios
  FOR INSERT
  WITH CHECK (auth_id = auth.uid());

-- ── 2. Função SECURITY DEFINER (bypassa RLS) ─────────────────
-- Chamada via sb.rpc("criar_perfil_usuario", {...})
-- SECURITY DEFINER = roda com permissão de superusuário, ignora RLS
CREATE OR REPLACE FUNCTION criar_perfil_usuario(
  p_auth_id UUID,
  p_nome    TEXT,
  p_email   TEXT,
  p_role    TEXT    DEFAULT 'admin',
  p_cargo   TEXT    DEFAULT 'Administrador',
  p_crea    TEXT    DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Só permite criar perfil para o próprio usuário autenticado
  IF p_auth_id != auth.uid() THEN
    RAISE EXCEPTION 'Não autorizado: só é possível criar o próprio perfil.';
  END IF;

  -- Verifica se já existe
  IF EXISTS (SELECT 1 FROM usuarios WHERE auth_id = p_auth_id) THEN
    RAISE EXCEPTION 'Perfil já existe para este usuário.';
  END IF;

  INSERT INTO usuarios (auth_id, nome, email, role, cargo, crea)
  VALUES (p_auth_id, p_nome, p_email, p_role, p_cargo, p_crea);
END;
$$;

-- Garante que só usuários autenticados podem chamar a função
REVOKE EXECUTE ON FUNCTION criar_perfil_usuario FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION criar_perfil_usuario TO authenticated;

-- ── 3. Verificação ───────────────────────────────────────────
-- Deve aparecer: "usuario_pode_criar_proprio_perfil" na lista
SELECT policyname, cmd FROM pg_policies
WHERE tablename = 'usuarios' AND schemaname = 'public'
ORDER BY policyname;

-- Deve aparecer: "criar_perfil_usuario" na lista
SELECT routine_name, security_type FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'criar_perfil_usuario';


-- ══════════════════════════════════════════════════════════════
--  FIX: Colunas faltando nas tabelas
--  Execute no SQL Editor do Supabase
-- ══════════════════════════════════════════════════════════════

-- Colunas da tabela ensaios (caso não existam)
ALTER TABLE ensaios ADD COLUMN IF NOT EXISTS area               TEXT;
ALTER TABLE ensaios ADD COLUMN IF NOT EXISTS amostra_descricao  TEXT;
ALTER TABLE ensaios ADD COLUMN IF NOT EXISTS data_ensaio        DATE;

-- Colunas extras da tabela estruturas (formulário completo)
ALTER TABLE estruturas ADD COLUMN IF NOT EXISTS municipio            TEXT;
ALTER TABLE estruturas ADD COLUMN IF NOT EXISTS estado               TEXT DEFAULT 'MG';
ALTER TABLE estruturas ADD COLUMN IF NOT EXISTS responsavel_tecnico  TEXT;
ALTER TABLE estruturas ADD COLUMN IF NOT EXISTS crea_responsavel     TEXT;
ALTER TABLE estruturas ADD COLUMN IF NOT EXISTS observacoes          TEXT;
ALTER TABLE estruturas ADD COLUMN IF NOT EXISTS laboratorio_id       UUID REFERENCES laboratorios(id);

-- Verificação
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'estruturas' AND table_schema = 'public'
ORDER BY ordinal_position;


-- ══════════════════════════════════════════════════════════════
--  MIGRAÇÃO v2.3 — Ensaio de Hilf (Método Rápido)
--  Execute este bloco UMA VEZ no SQL Editor do Supabase
--  se o banco já estiver criado (já existir a tabela ensaios)
-- ══════════════════════════════════════════════════════════════

-- 1. Adicionar 'hilf' ao ENUM tipo_ensaio
--    (o CREATE TYPE acima só vale para bancos novos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'hilf'
      AND enumtypid = 'public.tipo_ensaio'::regtype
  ) THEN
    ALTER TYPE tipo_ensaio ADD VALUE 'hilf' AFTER 'compactacao_proctor';
    RAISE NOTICE 'ENUM tipo_ensaio: valor "hilf" adicionado com sucesso.';
  ELSE
    RAISE NOTICE 'ENUM tipo_ensaio: "hilf" já existia — nenhuma alteração.';
  END IF;
END$$;

-- 2. Registrar norma na tabela de referência (se existir)
INSERT INTO normas_referencia (tipo_ensaio, norma, descricao, area)
VALUES ('hilf', 'DNER ME 162/94', 'Compactação dos Solos — Método Rápido de Hilf', 'solos')
ON CONFLICT (tipo_ensaio) DO NOTHING;

-- 3. Verificar resultado
SELECT enumlabel, enumsortorder
FROM pg_enum
WHERE enumtypid = 'public.tipo_ensaio'::regtype
ORDER BY enumsortorder;
