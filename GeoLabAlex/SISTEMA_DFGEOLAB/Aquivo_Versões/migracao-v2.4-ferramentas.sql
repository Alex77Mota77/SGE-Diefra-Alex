-- ══════════════════════════════════════════════════════════════
--  SGEDIEFRA — MIGRAÇÃO v2.4
--  Tabela de Ferramentas de Laboratório + 90 equipamentos
--  Execute no SQL Editor do Supabase (uma única vez)
-- ══════════════════════════════════════════════════════════════

-- ── 1. ENUM status_ferramenta ─────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_ferramenta') THEN
    CREATE TYPE status_ferramenta AS ENUM ('ativo','manutencao','inativo','descartado');
    RAISE NOTICE '✓ ENUM status_ferramenta criado';
  ELSE
    RAISE NOTICE '⚠ ENUM status_ferramenta já existe';
  END IF;
END$$;

-- ── 2. TABELA ferramentas ────────────────────────────────────
CREATE TABLE IF NOT EXISTS ferramentas (
  id                 TEXT PRIMARY KEY,          -- F001, F002...
  laboratorio_id     UUID REFERENCES laboratorios(id) ON DELETE CASCADE,
  categoria          TEXT NOT NULL,
  nome               TEXT NOT NULL,
  marca              TEXT,
  norma              TEXT,
  descricao          TEXT,
  status             status_ferramenta NOT NULL DEFAULT 'ativo',
  patrimonio         TEXT,
  calibracao_prazo   TEXT,                      -- '6 meses', '12 meses', ''
  ultima_calibracao  DATE,
  proxima_calibracao DATE,
  localizacao        TEXT,                      -- sala, bancada, campo
  observacoes        TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. ÍNDICES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ferramentas_lab      ON ferramentas(laboratorio_id);
CREATE INDEX IF NOT EXISTS idx_ferramentas_cat      ON ferramentas(categoria);
CREATE INDEX IF NOT EXISTS idx_ferramentas_status   ON ferramentas(status);

-- ── 4. TRIGGER updated_at ─────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_ferramentas_updated ON ferramentas;
CREATE TRIGGER trg_ferramentas_updated
  BEFORE UPDATE ON ferramentas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 5. RLS ───────────────────────────────────────────────────
ALTER TABLE ferramentas ENABLE ROW LEVEL SECURITY;

-- Admin/engenheiro/técnico vê e edita as ferramentas do seu lab
DROP POLICY IF EXISTS "ferramenta_select"  ON ferramentas;
DROP POLICY IF EXISTS "ferramenta_insert"  ON ferramentas;
DROP POLICY IF EXISTS "ferramenta_update"  ON ferramentas;
DROP POLICY IF EXISTS "ferramenta_delete"  ON ferramentas;

CREATE POLICY "ferramenta_select" ON ferramentas FOR SELECT
  USING (
    laboratorio_id IS NULL OR
    laboratorio_id IN (
      SELECT laboratorio_id FROM usuarios WHERE auth_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "ferramenta_insert" ON ferramentas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_id = auth.uid()
        AND role IN ('admin','engenheiro','tecnico')
    )
  );

CREATE POLICY "ferramenta_update" ON ferramentas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_id = auth.uid()
        AND role IN ('admin','engenheiro','tecnico')
    )
  );

CREATE POLICY "ferramenta_delete" ON ferramentas FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND role = 'admin')
  );

-- ── 6. SEED — 90 FERRAMENTAS DO CATÁLOGO ──────────────────────
-- laboratorio_id NULL = ferramenta padrão (visível a todos)
INSERT INTO ferramentas
  (id, categoria, nome, marca, norma, descricao, status, patrimonio, calibracao_prazo)
VALUES
('F001','Compactação','Prensa de Compactação CBR','Contenco / ELE','ABNT NBR 9895','Prensa motorizada para ensaio CBR com anel dinamométrico acoplado, penetrômetro e deflectômetro. Capacidade 50 kN.','ativo','',''),
('F002','Compactação','Molde Proctor Normal (PN)','Contenco','ABNT NBR 7182','Molde cilíndrico Ø100 mm × 127 mm, volume 944 cm³, com colarinho e base perfurada.','ativo','',''),
('F003','Compactação','Molde Proctor Intermediário (PI)','Contenco','ABNT NBR 7182','Molde cilíndrico Ø150 mm × 127 mm, volume 2.124 cm³.','ativo','',''),
('F004','Compactação','Soquete Manual Proctor Normal','Contenco','ABNT NBR 7182','Soquete Ø50 mm, massa 2,5 kg, altura de queda 305 mm, 25 golpes/camada.','ativo','',''),
('F005','Compactação','Soquete Manual Proctor Modificado','Contenco','ABNT NBR 7182','Soquete Ø50 mm, massa 4,5 kg, altura de queda 457 mm, 55 golpes/camada.','ativo','',''),
('F006','Compactação','Compactador Mecânico (Proctor Automático)','Controls / ELE','ABNT NBR 7182','Equipamento automático de compactação com contagem de golpes programável, pistão motorizado.','ativo','',''),
('F007','Compactação','Molde CBR (Ø152 mm)','Contenco','ABNT NBR 9895','Molde CBR Ø152 mm × 177 mm, com colar, base perfurada e disco espaçador.','ativo','',''),
('F008','Compactação','Anel Dinamométrico 50 kN','Controls','ABNT NBR 9895','Anel dinamométrico de carga para leitura de força no ensaio CBR, constante de calibração individual.','ativo','','6 meses'),
('F009','Compactação','Deflectômetro (Dial Gauge 0,01 mm)','Mitutoyo / Insize','ABNT NBR 9895','Relógio comparador com resolução 0,01 mm, curso 25 mm, para leitura de expansão e penetração.','ativo','','12 meses'),
('F010','Compactação','Conjunto de Placas Sobrecarga CBR','Contenco','ABNT NBR 9895','Placas anulares de sobrecarga em aço (1 kg cada), para simular peso do pavimento.','ativo','',''),
('F011','Granulometria','Conjunto de Peneiras ABNT (Solo)','Bertel / Contenco','ABNT NBR 7181','Série completa: 4", 3", 2", 1½", 1", ¾", ½", 3/8", nº4, 10, 16, 30, 40, 50, 100, 200 (abertura mín. 0,075 mm). Quadros Ø200 mm.','ativo','',''),
('F012','Granulometria','Agitador Mecânico de Peneiras','Bertel','ABNT NBR 7181','Agitador elétrico com timer, vibração em 3D, suporte para até 8 peneiras Ø200 mm.','ativo','',''),
('F013','Granulometria','Densímetro (Hidrômetro) ASTM 152H','Nacional','ABNT NBR 7181','Densímetro para análise por sedimentação (finos), escala 0,995 a 1,040 g/cm³.','ativo','','12 meses'),
('F014','Granulometria','Provetas 1000 mL (para sedimentação)','Pyrex','ABNT NBR 7181','Provetas cilíndricas graduadas 1000 mL, com tampa, para ensaio de sedimentação.','ativo','',''),
('F015','Granulometria','Termômetro de Imersão','Incoterm','ABNT NBR 7181','Termômetro digital ±0,1 °C para correção de temperatura na sedimentação.','ativo','','12 meses'),
('F016','Granulometria','Balança Analítica 0,001 g','Marte / Shimadzu','ABNT NBR 7181','Balança de precisão analítica, capacidade 320 g, resolução 0,001 g, calibração interna.','ativo','','12 meses'),
('F017','Granulometria','Balança Semi-Analítica 0,01 g','Marte','ABNT NBR 7181','Balança resolução 0,01 g, capacidade 3.000 g.','ativo','','12 meses'),
('F018','Granulometria','Estufa de Secagem 105 °C','FANEM / Quimis','ABNT NBR 7181','Estufa elétrica com circulação forçada, faixa 50–300 °C, controle digital ±1 °C.','ativo','','6 meses'),
('F019','Atterberg','Aparelho de Casagrande','Contenco / ELE','ABNT NBR 6459','Aparelho manual/motorizado para Limite de Liquidez. Concha de latão padronizada, queda 10 mm.','ativo','',''),
('F020','Atterberg','Ranhuradores (Casagrande + ASTM)','Contenco','ABNT NBR 6459','Ranhuradores tipo Casagrande e tipo ASTM para sulco padrão na concha.','ativo','',''),
('F021','Atterberg','Placa de Vidro para LP','Nacional','ABNT NBR 7180','Placa de vidro fosco 200×200 mm para rolagem do cilindro no Limite de Plasticidade.','ativo','',''),
('F022','Atterberg','Cápsulas de Porcelana','Nacional','ABNT NBR 6459','Cápsulas com tampa, Ø60 mm, para determinação de umidade dos fragmentos de Atterberg.','ativo','',''),
('F023','Triaxial','Prensa Triaxial Digitalizada','Controls / GDS Instruments','ABNT NBR 12007','Sistema triaxial automático com controladores de pressão de célula e contrapressão, transdutores de força, deslocamento e pressão intersticial. Software integrado.','ativo','','6 meses'),
('F024','Triaxial','Câmara Triaxial 38/50/70/100 mm','Controls','ABNT NBR 12007','Câmaras em acrílico ou aço inox para corpos de prova Ø38, 50, 70 e 100 mm.','ativo','',''),
('F025','Triaxial','Controlador de Pressão (GDS / Volum.)','GDS / Controls','ABNT NBR 12007','Controlador de pressão/volume servo-motorizado, resolução 1 kPa, range 0–2000 kPa.','ativo','','6 meses'),
('F026','Triaxial','Membrana de Borracha para CPs','Controls','ABNT NBR 12007','Membranas látex para CPs Ø38/50/70/100 mm, espessura 0,3 mm, descartável.','ativo','',''),
('F027','Triaxial','Pedras Porosas','Controls','ABNT NBR 12007','Discos porosos em cerâmica ou bronze sinterizado, Ø38/50/70/100 mm, para drenagem dos CPs.','ativo','',''),
('F028','Triaxial','Extrusor de Amostra','Contenco','ABNT NBR 12007','Extrusor manual para remover amostras indeformadas do amostrador sem perturbação.','ativo','',''),
('F029','Adensamento','Adensômetro Oedométrico','Controls / ELE','ABNT NBR 12007','Odômetro fixo com anel de carga, capacidade 50 kN, para ensaio de adensamento unidimensional. Inclui relógio comparador 0,01 mm.','ativo','','12 meses'),
('F030','Adensamento','Adensômetro com Backpressure','GDS / Controls','ASTM D4546','Odômetro avançado com saturação por contrapressão e medição de pressão intersticial.','ativo','','6 meses'),
('F031','Adensamento','Anéis de Corte (Ø50 / 70 mm)','Controls','ABNT NBR 12007','Anéis em aço inox para corte e confinamento de amostras no ensaio de adensamento.','ativo','',''),
('F032','Permeabilidade','Permeâmetro de Carga Variável','Contenco','ABNT NBR 14545','Permeâmetro para solos de baixa permeabilidade (argila), método de carga variável, tripé e tubo capilar graduado.','ativo','',''),
('F033','Permeabilidade','Permeâmetro de Carga Constante','Contenco','ABNT NBR 14545','Permeâmetro para solos de alta permeabilidade (areia, brita), reservatório de carga constante.','ativo','',''),
('F034','Permeabilidade','Permeâmetro Triaxial (Flexível)','Controls','ASTM D5084','Célula de parede flexível para k em condições confinadas, com contrapressão. Range k = 10⁻¹⁰ m/s.','ativo','',''),
('F035','Cisalhamento','Aparelho de Cisalhamento Direto Motorizado','Controls / ELE','ABNT NBR 12069','Equipamento motorizado com velocidades 0,002 a 2,4 mm/min, capacidade normal 10 kN, célula de carga digital e LVDT.','ativo','','12 meses'),
('F036','Cisalhamento','Caixas de Cisalhamento (60×60 / 100×100 mm)','Controls','ABNT NBR 12069','Caixas bipartidas 60×60 mm e 100×100 mm em aço inox para ensaio de cisalhamento direto.','ativo','',''),
('F037','Sondagem SPT','Conjunto de Sondagem à Percussão SPT','Menegotto / Nacional','ABNT NBR 6484','Conjunto completo: torre, martelo padrão 65 kg (queda 75 cm), tubos de revestimento, amostrador padrão, hastes de 1 m, trado espiral, cabeçote.','ativo','',''),
('F038','Sondagem SPT','Medidor de Energia SPT (SPT Analyzer)','Pile Dynamics / PDI','ASTM D4633','Instrumento para medição da energia real no SPT (ENTHRU), acelerômetro e strain gauge acoplados às hastes.','ativo','','12 meses'),
('F039','Sondagem SPT','Amostrador Shelby (Ø75 mm)','Contenco','ABNT NBR 9604','Tubo de parede fina Ø75 mm para coleta de amostras indeformadas em argila mole.','ativo','',''),
('F040','Sondagem SPT','Penetrômetro de Bolso','Controls','—','Penetrômetro manual para estimativa rápida de Su (coesão não-drenada) em campo. Escala 0–4,5 kgf/cm².','ativo','',''),
('F041','CPT','Equipamento CPTu (Cone Elétrico)','Fugro / A.P. van den Berg','ISO 22476-1','Cone elétrico com medição de resistência de ponta qc, atrito lateral fs e pressão de poro u2. Velocidade padrão 2 cm/s.','ativo','','6 meses'),
('F042','CPT','Caminhão de Reação CPT','Fugro','ISO 22476-1','Veículo de reação 20 tf para empuxo do cone nas sondagens CPT.','ativo','',''),
('F043','Concreto','Prensa de Ensaio Concreto 2.000 kN','AMSLER / Controls / CONTENCO','ABNT NBR 5739','Prensa hidráulica servo-controlada capacidade 2.000 kN, resolução 0,1 kN, display digital. Placas 200×200 mm e ponteira esférica.','ativo','','6 meses'),
('F044','Concreto','Capeadora de CPs de Concreto','Contenco','ABNT NBR 5738','Equipamento para capeamento com pasta de enxofre fundido ou elastômero, nivelamento ±0,5°.','ativo','',''),
('F045','Concreto','Retífica de Topos','Controls','ABNT NBR 5739','Retífica diamantada para plainar topos dos corpos de prova sem capeamento.','ativo','',''),
('F046','Concreto','Paquímetro Digital 300 mm','Mitutoyo','ABNT NBR 5739','Paquímetro digital aço inox, resolução 0,01 mm, para medição de dimensões dos CPs.','ativo','','12 meses'),
('F047','Concreto','Conjunto Slump Test (Abatimento)','Contenco','ABNT NBR NM 67','Tronco de cone de Abrams Ø100/200 mm × 300 mm, soquete de 16 mm, placa de base.','ativo','',''),
('F048','Concreto','Formas Cilíndricas (Ø100×200 mm)','Nacional','ABNT NBR 5738','Formas plásticas bipartidas para moldagem de CPs cilíndricos 10×20 cm. Kit 50 unid.','ativo','',''),
('F049','Concreto','Câmara Úmida / Câmara de Cura','FANEM','ABNT NBR 5738','Câmara de cura úmida com umidade >95% e temperatura 23±2 °C controlada digitalmente.','ativo','','6 meses'),
('F050','Concreto','Esclerômetro de Schmidt','Proceq','ABNT NBR 7584','Martelo de rebote para ensaio não destrutivo de resistência superficial do concreto.','ativo','','6 meses'),
('F051','Concreto','Pacômetro (Covermeter)','Proceq / Elcometer','—','Localizador de armaduras e medidor de cobrimento em estruturas de concreto armado.','ativo','',''),
('F052','Concreto','Termômetro Digital para Concreto','Incoterm','ABNT NBR 7212','Termômetro de haste Ø4 mm para leitura de temperatura do concreto fresco.','ativo','','12 meses'),
('F053','Aço','Máquina Universal de Ensaios (200 kN)','EMIC / Shimadzu / Instron','ABNT NBR 6152','Máquina eletromecânica universal 200 kN, garras intercambiáveis para tração e dobramento de aço, LVDT de precisão, software dedicado.','ativo','','12 meses'),
('F054','Aço','Extensômetro de Contato (Clip-on)','Instron / Epsilon','ABNT NBR 6152','Extensômetro de faca para medição de deformação em amostras de aço, base 50 mm, ±50%.','ativo','','12 meses'),
('F055','Aço','Máquina de Impacto Charpy (300 J)','EMIC / Instron','ABNT NBR 6157','Pêndulo Charpy capacidade 300 J, lâmina V, U, distância entre apoios 40 mm.','ativo','','12 meses'),
('F056','Aço','Dobradeira de Barras','Nacional','ABNT NBR 6152','Mesa de dobramento manual/hidráulica para barras CA-25 a CA-60 até Ø32 mm.','ativo','',''),
('F057','Aço','Durômetro Rockwell/Brinell','EMCO / Instron','ABNT NBR ISO 6506','Durômetro universal para medição de dureza de metais (HRB, HRC, HB).','ativo','','12 meses'),
('F058','Aço','Paquímetro e Micrômetro para Aço','Mitutoyo','ABNT NBR 6152','Paquímetro digital 0,01 mm e micrômetro externo 0–25 mm para dimensionamento de barras e corpos de prova.','ativo','','12 meses'),
('F059','Instrumentação','Piezômetro de Casagrande','Soil Instruments / SINCO','ANM 95/2022','Piezômetro hidráulico aberto para medição de nível d''água em barragens. Tubo PVC com seção filtrante e manômetro de Bourdon.','ativo','',''),
('F060','Instrumentação','Piezômetro Elétrico (Corda Vibrante)','Geokon / Roctest','ANM 95/2022','Piezômetro de corda vibrante, range 0–700 kPa, resolução 0,05% FS, temperatura integrada.','ativo','','6 meses'),
('F061','Instrumentação','Inclinômetro de Torpedo','SINCO / Slope Indicator','ANM 95/2022','Sonda inclinométrica bidirecional com acelerômetro MEMS, resolução 0,001°, para monitoramento de deslocamentos laterais.','ativo','','12 meses'),
('F062','Instrumentação','Marco Superficial de Recalque','Nacional','ANM 95/2022','Marco de concreto ou PVC enterrado para monitoramento topográfico de recalques na crista da barragem.','ativo','',''),
('F063','Instrumentação','Régua Linimétrica (Medidor de Nível)','Nacional','ANM 95/2022','Régua graduada instalada no reservatório para leitura do nível d''água.','ativo','',''),
('F064','Instrumentação','Leitora de Instrumentos (Datalogger)','Geokon / Campbell Scientific','—','Leitora portátil GK-403 ou datalogger automático para leitura de piezômetros e extensômetros de corda vibrante.','ativo','','12 meses'),
('F065','Instrumentação','Extensômetro de Fio (Settlement Gauge)','Geokon','ANM 95/2022','Extensômetro de haste múltipla para monitoramento de recalques em profundidade.','ativo','','12 meses'),
('F066','Umidade','Estufa de Secagem (105°C / 110°C)','FANEM / Quimis','ABNT NBR 6457','Estufa 105±5 °C com ventilação forçada. Capacidade 40 L. Sonda Pt-100 externa rastreável.','ativo','','6 meses'),
('F067','Umidade','Medidor de Umidade por Micro-ondas','SPEEDY / CEM','—','Determinador rápido de umidade por micro-ondas para solos e agregados. Resultado em 5 min.','ativo','',''),
('F068','Umidade','Termohigrômetro com Datalogger','Hobo / Onset','ISO/IEC 17025','Sensor T/UR com registro contínuo, certificado rastreável, para monitoramento da câmara de cura e laboratório.','ativo','','12 meses'),
('F069','Topografia','Estação Total','Leica / Topcon / Trimble','—','Estação total eletrônica (EDM + teodolito), precisão angular 2", precisão linear ±2 mm + 2 ppm. Para levantamentos e monitoramento geodésico.','ativo','','12 meses'),
('F070','Topografia','Nível Óptico / Eletrônico','Leica / Trimble','—','Nível automático ou eletrônico (digital) para levantamento de recalques e controle de cotas.','ativo','','12 meses'),
('F071','Topografia','GPS RTK','Trimble / Leica','—','Sistema GNSS de alta precisão (precisão planimétrica 1–2 cm) para mapeamento e monitoramento geodésico de barragens.','ativo','',''),
('F072','Topografia','Trena de Fibra 50 m','Lufkin','—','Trena de fibra de vidro graduada a cada 10 mm, para medições de campo.','ativo','',''),
('F073','Lab Geral','pH-metro de Bancada','Tecnopon / Hanna','—','pH-metro digital com eletrodo de vidro combinado, compensação automática de temperatura. Range 0–14 pH, ±0,01.','ativo','','6 meses'),
('F074','Lab Geral','Condutivímetro','Hanna','—','Medidor de condutividade elétrica e TDS, para análise de água de percolação e lixiviado.','ativo','','12 meses'),
('F075','Lab Geral','Dessecador com Sílica-Gel','Nacional','—','Dessecador de vidro Ø300 mm para resfriar amostras sem absorção de umidade.','ativo','',''),
('F076','Lab Geral','Placa Aquecedora / Manta Elétrica','Fisatom','—','Placa aquecedora com agitação magnética para dissolução de defloculantes na granulometria.','ativo','',''),
('F077','Lab Geral','Bomba de Vácuo','TE Instruments','—','Bomba de vácuo de membrana para saturação de corpos de prova (adensamento, triaxial, permeabilidade).','ativo','',''),
('F078','Lab Geral','Cronômetro Digital','Kenko','—','Cronômetro digital com laps, resolução 0,01 s, para controle de tempo nos ensaios de sedimentação.','ativo','','12 meses'),
('F079','Lab Geral','Régua de Aço Inox 300 mm','Mitutoyo','—','Régua de aço inox graduada a cada 0,5 mm, para verificação de dimensões de amostras.','ativo','',''),
('F080','Lab Geral','Forno Mufla 1200 °C','Quimis','—','Forno mufla para determinação do teor de matéria orgânica por ignição (perda ao fogo).','ativo','','12 meses'),
('F081','EPI','Óculos de Proteção','3M / Uvex','ABNT NBR 14626','Óculos de proteção com absorção UV, lente policarbonato incolor. CA: obrigatório.','ativo','',''),
('F082','EPI','Luvas de Nitrilo','Descarpack','—','Luvas de nitrilo sem talco, descartáveis, tamanhos M, G, GG. Para manuseio de solo e produtos químicos.','ativo','',''),
('F083','EPI','Protetor Auricular','3M / Silenta','NR-6','Protetor auricular tipo plug (espuma) NRRsf ≥24 dB. Obrigatório em locais com >85 dB.','ativo','',''),
('F084','EPI','Bota de Segurança','Bracol / Marluvas','ABNT NBR ISO 20345','Bota com bico de aço e palmilha anti-perfurante, CA 44.892. Para uso em campo e ensaios com cargas.','ativo','',''),
('F085','EPI','Capacete ABA FULL','MSA / 3M','ABNT NBR 8221','Capacete classe A, aba total, para proteção em campo (obras, sondagens, barragens).','ativo','',''),
('F086','Aquisição de Dados','Sistema de Aquisição de Dados (DAQ)','National Instruments / HBM','—','Módulo DAQ USB multicanal (8–32 canais) para leitura simultânea de transdutores analógicos (0–5V, 4–20mA) em ensaios automatizados.','ativo','','12 meses'),
('F087','Aquisição de Dados','Transdutor LVDT (±25 mm)','Schaevitz / Solartron','—','Transformador diferencial linear para medição de deslocamento em ensaios triaxial e adensamento. Resolução 1 μm.','ativo','','12 meses'),
('F088','Aquisição de Dados','Célula de Carga 5 kN','HBM / Kyowa','—','Célula de carga de compressão/tração, capacidade 5 kN, resolução 0,1 N, para ensaios de baixa carga.','ativo','','12 meses'),
('F089','Aquisição de Dados','Transdutor de Pressão','Keller / Druck','—','Transdutor piezoresistivo 0–700 kPa, saída 4–20 mA, para medição de pressão de célula e contrapressão no triaxial.','ativo','','12 meses'),
('F090','Aquisição de Dados','Conversor USB-Serial RS232/RS485','FTDI','—','Conversor para comunicação com instrumentos seriais (balanças, prensas, piezômetros) via porta USB do computador.','ativo','','')
ON CONFLICT (id) DO NOTHING;

-- ── 7. TABELA manutencoes_ferramentas (histórico de calibração) ──
CREATE TABLE IF NOT EXISTS manutencoes_ferramentas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ferramenta_id   TEXT NOT NULL REFERENCES ferramentas(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL CHECK (tipo IN ('calibracao','manutencao_preventiva','manutencao_corretiva','verificacao','descarte')),
  data_inicio     DATE NOT NULL,
  data_conclusao  DATE,
  responsavel     TEXT,
  certificado_nr  TEXT,               -- número do certificado de calibração
  laboratorio_cal TEXT,               -- laboratório que fez a calibração
  resultado       TEXT,               -- 'aprovado','reprovado','condicionado'
  observacoes     TEXT,
  custo_reais     NUMERIC(10,2),
  created_by      UUID REFERENCES usuarios(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_manut_ferramenta ON manutencoes_ferramentas(ferramenta_id);
CREATE INDEX IF NOT EXISTS idx_manut_tipo        ON manutencoes_ferramentas(tipo);

ALTER TABLE manutencoes_ferramentas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "manut_select" ON manutencoes_ferramentas FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM usuarios WHERE auth_id = auth.uid())
  );

CREATE POLICY "manut_insert" ON manutencoes_ferramentas FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND role IN ('admin','engenheiro','tecnico'))
  );

-- ── 8. VERIFICAÇÃO FINAL ──────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM ferramentas)             AS total_ferramentas,
  (SELECT COUNT(*) FROM ferramentas WHERE status='ativo') AS ativas,
  (SELECT COUNT(DISTINCT categoria) FROM ferramentas)     AS categorias;
