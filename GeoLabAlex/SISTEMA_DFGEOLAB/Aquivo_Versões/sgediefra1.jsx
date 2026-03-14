import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ══════════════════════════════════════════════════════════════
//  AUTO-TRADUÇÃO — detecta idioma do Windows/navegador
// ══════════════════════════════════════════════════════════════
const LANG = (() => {
  const l = (navigator.language || navigator.userLanguage || "pt").toLowerCase();
  if (l.startsWith("pt")) return "pt";
  if (l.startsWith("es")) return "es";
  if (l.startsWith("fr")) return "fr";
  if (l.startsWith("de")) return "de";
  if (l.startsWith("it")) return "it";
  if (l.startsWith("zh")) return "zh";
  if (l.startsWith("ja")) return "ja";
  if (l.startsWith("ko")) return "ko";
  if (l.startsWith("ru")) return "ru";
  if (l.startsWith("ar")) return "ar";
  return "en";
})();

const I18N = {
  pt: {
    // Nav
    dashboard:"Dashboard", ensaios:"Ensaios", barragens:"Estruturas", relatorios:"Laudos", realtime:"Tempo Real",
    // Ações
    enter:"ENTRAR NO SISTEMA →", createAccount:"CRIAR CONTA →", connect:"⚡ CONECTAR AO BANCO DE DADOS",
    connecting:"CONECTANDO...", loading:"CARREGANDO...", saving:"SALVANDO...", waiting:"AGUARDE...",
    newEnsaio:"+ NOVO ENSAIO", generateReport:"◧ GERAR LAUDO", saveEnsaio:"💾 SALVAR NO BANCO",
    cancel:"CANCELAR", close:"✕ FECHAR", saveIdentity:"💾 SALVAR IDENTIDADE", exit:"SAIR",
    registerFirst:"+ REGISTRAR PRIMEIRO",
    // Formulários
    email:"EMAIL", password:"SENHA", login:"ENTRAR", newUser:"NOVO USUÁRIO",
    projectUrl:"PROJECT URL", anonKey:"ANON PUBLIC KEY",
    ensaioType:"TIPO DE ENSAIO", sampleId:"IDENTIFICAÇÃO DA AMOSTRA",
    logoIcon:"ÍCONE DO LOGO", systemName:"NOME DO SISTEMA", subtitle:"SUBTÍTULO / DESCRIÇÃO",
    accentColor:"COR DE DESTAQUE", preview:"PRÉVIA",
    // Mensagens de erro
    errFillAll:"Preencha todos os campos obrigatórios.",
    errFillUrlKey:"Preencha a URL e a chave.",
    errFillEmailPwd:"Preencha email e senha.",
    errConnFailed:"Falha na conexão: ",
    errGeneric:"Erro: ",
    errSave:"Erro ao salvar: ",
    errLoadEnsaios:"Erro ao carregar ensaios: ",
    errSelectType:"Preencha tipo e identificação da amostra.",
    // Alertas / Toast
    toastSaved:"✓ Ensaio salvo com sucesso!",
    toastNewEnsaio:"⛏ Novo ensaio registrado: ",
    toastAlert:"⚠ ALERTA CRÍTICO: ",
    toastCriticalFs:"⚠ ALERTA CRÍTICO: Acionar PAEBM — ANM 95/2022",
    // Status
    conforme:"CONFORME", naoConforme:"NÃO CONFORME", atencao:"ATENÇÃO", pendente:"PENDENTE",
    // Dashboard
    panelTitle:"Painel de Controle", liveData:"Dados em tempo real",
    totalEnsaios:"Ensaios no Banco", laudosEmitidos:"Laudos Emitidos", conformidade:"Conformidade", naoConformidades:"Não Conformidades",
    structureFs:"ESTRUTURAS — FATORES DE SEGURANÇA", lastEnsaios:"ÚLTIMOS ENSAIOS DO BANCO",
    conformByArea:"CONFORMIDADE POR ÁREA",
    noStructure:"Nenhuma estrutura cadastrada.", insertViaSQL:"Insira via SQL Editor no Supabase.",
    noEnsaios:"Nenhum ensaio ainda.",
    // Ensaios
    ensaiosTitle:"Gestão de Ensaios", ensaiosLive:"ensaios · dados ao vivo",
    noEnsaiosFilter:"Nenhum ensaio. Clique em + NOVO ENSAIO.",
    resultsDb:"RESULTADOS DO BANCO DE DADOS", inProgress:"⛏ Ensaio em andamento — resultados pendentes",
    // Barragens
    structureTitle:"Monitoramento de Estruturas", noStructureSql:"Nenhuma estrutura cadastrada",
    noStructureInsert:"Insira dados na tabela estruturas via Supabase SQL Editor",
    // Laudos
    reportsTitle:"Central de Laudos", reportsSubtitle:"Laudos gerados a partir dos dados reais do banco",
    selectEnsaio:"SELECIONE UM ENSAIO PARA GERAR O LAUDO", noCompletedEnsaios:"Nenhum ensaio concluído com resultados ainda.",
    // Realtime
    realtimeTitle:"Monitor em Tempo Real", realtimeSubtitle:"WebSocket Supabase Realtime · eventos ao vivo",
    liveEvents:"◎ EVENTOS AO VIVO", waitingEvents:"Canal WebSocket ativo. Aguardando eventos do banco...",
    testInsert:"TESTAR: INSERIR ENSAIO", howItWorks:"🔌 COMO FUNCIONA",
    newEnsaioEvent:"NOVO ENSAIO", instrumentEvent:"INSTRUMENTAÇÃO",
    // Laudo
    reportPreview:"📄 LAUDO TÉCNICO — PRÉVIA", labEmitter:"LABORATÓRIO EMISSOR",
    reportCode:"CÓDIGO", results:"RESULTADOS", technicalConclusion:"CONCLUSÃO TÉCNICA",
    concApproved:"atenderam a todos os requisitos normativos. Material APROVADO para a aplicação especificada.",
    concWarning:"apresentaram parâmetros próximos aos limites. Recomenda-se análise complementar.",
    concFailed:"apresentaram parâmetros FORA dos limites normativos. Material REPROVADO — ação corretiva imediata obrigatória.",
    respTech:"Responsável Técnico", conference:"Conferência", accreditation:"Acreditação",
    // Config
    configTitle:"CONEXÃO SUPABASE POSTGRESQL", configIdentity:"⚙ CONFIGURAR IDENTIDADE DO SISTEMA",
    credentialsTitle:"COMO OBTER AS CREDENCIAIS",
    step1a:"Acesse", step1b:"supabase.com e crie conta gratuita",
    step2a:"Crie projeto", step2b:"South America (São Paulo)",
    step3a:"Vá em", step3b:"Project Settings → API",
    step4a:"Copie", step4b:"Project URL e anon public key",
    step5a:"Importe", step5b:"geolab-schema.sql no SQL Editor",
    // Misc
    liveBadge:"SUPABASE LIVE", configLogo:"Configurar identidade do sistema",
    approvalTech:"Aprovação técnica", sample:"AMOSTRA", date:"DATA", status:"STATUS",
    area:"ÁREA", action:"AÇÃO", code:"CÓDIGO", test:"ENSAIO", responsible:"RESPONSÁVEL",
    limit:"Limite", norm:"Norma",
  },
  en: {
    dashboard:"Dashboard", ensaios:"Tests", barragens:"Structures", relatorios:"Reports", realtime:"Real-time",
    enter:"ENTER SYSTEM →", createAccount:"CREATE ACCOUNT →", connect:"⚡ CONNECT TO DATABASE",
    connecting:"CONNECTING...", loading:"LOADING...", saving:"SAVING...", waiting:"PLEASE WAIT...",
    newEnsaio:"+ NEW TEST", generateReport:"◧ GENERATE REPORT", saveEnsaio:"💾 SAVE TO DATABASE",
    cancel:"CANCEL", close:"✕ CLOSE", saveIdentity:"💾 SAVE IDENTITY", exit:"LOGOUT",
    registerFirst:"+ ADD FIRST",
    email:"EMAIL", password:"PASSWORD", login:"LOGIN", newUser:"NEW USER",
    projectUrl:"PROJECT URL", anonKey:"ANON PUBLIC KEY",
    ensaioType:"TEST TYPE", sampleId:"SAMPLE IDENTIFICATION",
    logoIcon:"LOGO ICON", systemName:"SYSTEM NAME", subtitle:"SUBTITLE / DESCRIPTION",
    accentColor:"ACCENT COLOR", preview:"PREVIEW",
    errFillAll:"Fill in all required fields.",
    errFillUrlKey:"Fill in the URL and key.",
    errFillEmailPwd:"Fill in email and password.",
    errConnFailed:"Connection failed: ",
    errGeneric:"Error: ",
    errSave:"Error saving: ",
    errLoadEnsaios:"Error loading tests: ",
    errSelectType:"Fill in test type and sample identification.",
    toastSaved:"✓ Test saved successfully!",
    toastNewEnsaio:"⛏ New test registered: ",
    toastAlert:"⚠ CRITICAL ALERT: ",
    toastCriticalFs:"⚠ CRITICAL ALERT: Activate PAEBM — ANM 95/2022",
    conforme:"COMPLIANT", naoConforme:"NON-COMPLIANT", atencao:"WARNING", pendente:"PENDING",
    panelTitle:"Control Panel", liveData:"Real-time data",
    totalEnsaios:"Tests in Database", laudosEmitidos:"Reports Issued", conformidade:"Compliance", naoConformidades:"Non-Conformities",
    structureFs:"STRUCTURES — SAFETY FACTORS", lastEnsaios:"LATEST TESTS FROM DATABASE",
    conformByArea:"COMPLIANCE BY AREA",
    noStructure:"No structures registered.", insertViaSQL:"Insert via SQL Editor in Supabase.",
    noEnsaios:"No tests yet.",
    ensaiosTitle:"Test Management", ensaiosLive:"tests · live data",
    noEnsaiosFilter:"No tests. Click + NEW TEST.",
    resultsDb:"DATABASE RESULTS", inProgress:"⛏ Test in progress — pending results",
    structureTitle:"Structure Monitoring", noStructureSql:"No structures registered",
    noStructureInsert:"Insert data into the structures table via Supabase SQL Editor",
    reportsTitle:"Reports Center", reportsSubtitle:"Reports generated from real database data",
    selectEnsaio:"SELECT A TEST TO GENERATE REPORT", noCompletedEnsaios:"No completed tests with results yet.",
    realtimeTitle:"Real-Time Monitor", realtimeSubtitle:"Supabase Realtime WebSocket · live events",
    liveEvents:"◎ LIVE EVENTS", waitingEvents:"WebSocket channel active. Waiting for database events...",
    testInsert:"TEST: INSERT TEST", howItWorks:"🔌 HOW IT WORKS",
    newEnsaioEvent:"NEW TEST", instrumentEvent:"INSTRUMENTATION",
    reportPreview:"📄 TECHNICAL REPORT — PREVIEW", labEmitter:"ISSUING LABORATORY",
    reportCode:"CODE", results:"RESULTS", technicalConclusion:"TECHNICAL CONCLUSION",
    concApproved:"met all regulatory requirements. Material APPROVED for the specified application.",
    concWarning:"showed parameters close to limits. Additional analysis recommended.",
    concFailed:"showed parameters OUTSIDE regulatory limits. Material REJECTED — immediate corrective action required.",
    respTech:"Technical Responsible", conference:"Review", accreditation:"Accreditation",
    configTitle:"SUPABASE POSTGRESQL CONNECTION", configIdentity:"⚙ CONFIGURE SYSTEM IDENTITY",
    credentialsTitle:"HOW TO GET CREDENTIALS",
    step1a:"Go to", step1b:"supabase.com and create free account",
    step2a:"Create project", step2b:"South America (São Paulo)",
    step3a:"Go to", step3b:"Project Settings → API",
    step4a:"Copy", step4b:"Project URL and anon public key",
    step5a:"Import", step5b:"geolab-schema.sql in SQL Editor",
    liveBadge:"SUPABASE LIVE", configLogo:"Configure system identity",
    approvalTech:"Technical approval", sample:"SAMPLE", date:"DATE", status:"STATUS",
    area:"AREA", action:"ACTION", code:"CODE", test:"TEST", responsible:"RESPONSIBLE",
    limit:"Limit", norm:"Standard",
  },
  es: {
    dashboard:"Panel", ensaios:"Ensayos", barragens:"Estructuras", relatorios:"Informes", realtime:"Tiempo Real",
    enter:"ENTRAR AL SISTEMA →", createAccount:"CREAR CUENTA →", connect:"⚡ CONECTAR A LA BASE DE DATOS",
    connecting:"CONECTANDO...", loading:"CARGANDO...", saving:"GUARDANDO...", waiting:"ESPERE...",
    newEnsaio:"+ NUEVO ENSAYO", generateReport:"◧ GENERAR INFORME", saveEnsaio:"💾 GUARDAR EN BD",
    cancel:"CANCELAR", close:"✕ CERRAR", saveIdentity:"💾 GUARDAR IDENTIDAD", exit:"SALIR",
    registerFirst:"+ REGISTRAR PRIMERO",
    email:"CORREO", password:"CONTRASEÑA", login:"ENTRAR", newUser:"NUEVO USUARIO",
    projectUrl:"PROJECT URL", anonKey:"ANON PUBLIC KEY",
    ensaioType:"TIPO DE ENSAYO", sampleId:"IDENTIFICACIÓN DE MUESTRA",
    logoIcon:"ÍCONO DEL LOGO", systemName:"NOMBRE DEL SISTEMA", subtitle:"SUBTÍTULO",
    accentColor:"COLOR DE ACENTO", preview:"VISTA PREVIA",
    errFillAll:"Complete todos los campos obligatorios.",
    errFillUrlKey:"Complete la URL y la clave.",
    errFillEmailPwd:"Complete el correo y la contraseña.",
    errConnFailed:"Fallo en la conexión: ",
    errGeneric:"Error: ",
    errSave:"Error al guardar: ",
    errLoadEnsaios:"Error al cargar ensayos: ",
    errSelectType:"Complete el tipo de ensayo e identificación de muestra.",
    toastSaved:"✓ ¡Ensayo guardado con éxito!",
    toastNewEnsaio:"⛏ Nuevo ensayo registrado: ",
    toastAlert:"⚠ ALERTA CRÍTICA: ",
    toastCriticalFs:"⚠ ALERTA CRÍTICA: Activar PAEBM — ANM 95/2022",
    conforme:"CONFORME", naoConforme:"NO CONFORME", atencao:"ATENCIÓN", pendente:"PENDIENTE",
    panelTitle:"Panel de Control", liveData:"Datos en tiempo real",
    totalEnsaios:"Ensayos en BD", laudosEmitidos:"Informes Emitidos", conformidade:"Conformidad", naoConformidades:"No Conformidades",
    structureFs:"ESTRUCTURAS — FACTORES DE SEGURIDAD", lastEnsaios:"ÚLTIMOS ENSAYOS DE LA BD",
    conformByArea:"CONFORMIDAD POR ÁREA",
    noStructure:"Sin estructuras registradas.", insertViaSQL:"Inserte via SQL Editor en Supabase.",
    noEnsaios:"Sin ensayos aún.",
    ensaiosTitle:"Gestión de Ensayos", ensaiosLive:"ensayos · datos en vivo",
    noEnsaiosFilter:"Sin ensayos. Haga clic en + NUEVO ENSAYO.",
    resultsDb:"RESULTADOS DE LA BASE DE DATOS", inProgress:"⛏ Ensayo en curso — resultados pendientes",
    structureTitle:"Monitoreo de Estructuras", noStructureSql:"Sin estructuras registradas",
    noStructureInsert:"Inserte datos en la tabla estructuras via Supabase SQL Editor",
    reportsTitle:"Central de Informes", reportsSubtitle:"Informes generados de datos reales",
    selectEnsaio:"SELECCIONE UN ENSAYO PARA GENERAR INFORME", noCompletedEnsaios:"Sin ensayos completados con resultados.",
    realtimeTitle:"Monitor en Tiempo Real", realtimeSubtitle:"WebSocket Supabase Realtime · eventos en vivo",
    liveEvents:"◎ EVENTOS EN VIVO", waitingEvents:"Canal WebSocket activo. Esperando eventos...",
    testInsert:"PROBAR: INSERTAR ENSAYO", howItWorks:"🔌 CÓMO FUNCIONA",
    newEnsaioEvent:"NUEVO ENSAYO", instrumentEvent:"INSTRUMENTACIÓN",
    reportPreview:"📄 INFORME TÉCNICO — VISTA PREVIA", labEmitter:"LABORATORIO EMISOR",
    reportCode:"CÓDIGO", results:"RESULTADOS", technicalConclusion:"CONCLUSIÓN TÉCNICA",
    concApproved:"cumplieron con todos los requisitos normativos. Material APROBADO.",
    concWarning:"mostraron parámetros cercanos a los límites. Se recomienda análisis complementario.",
    concFailed:"mostraron parámetros FUERA de los límites. Material RECHAZADO — acción correctiva inmediata.",
    respTech:"Responsable Técnico", conference:"Revisión", accreditation:"Acreditación",
    configTitle:"CONEXIÓN SUPABASE POSTGRESQL", configIdentity:"⚙ CONFIGURAR IDENTIDAD DEL SISTEMA",
    credentialsTitle:"CÓMO OBTENER LAS CREDENCIALES",
    step1a:"Acceda a", step1b:"supabase.com y cree cuenta gratuita",
    step2a:"Cree proyecto", step2b:"South America (São Paulo)",
    step3a:"Vaya a", step3b:"Project Settings → API",
    step4a:"Copie", step4b:"Project URL y anon public key",
    step5a:"Importe", step5b:"geolab-schema.sql en SQL Editor",
    liveBadge:"SUPABASE LIVE", configLogo:"Configurar identidad del sistema",
    approvalTech:"Aprobación técnica", sample:"MUESTRA", date:"FECHA", status:"ESTADO",
    area:"ÁREA", action:"ACCIÓN", code:"CÓDIGO", test:"ENSAYO", responsible:"RESPONSABLE",
    limit:"Límite", norm:"Norma",
  },
  fr: {
    dashboard:"Tableau de bord", ensaios:"Essais", barragens:"Structures", relatorios:"Rapports", realtime:"Temps Réel",
    enter:"ENTRER →", createAccount:"CRÉER UN COMPTE →", connect:"⚡ CONNECTER À LA BASE DE DONNÉES",
    connecting:"CONNEXION...", loading:"CHARGEMENT...", saving:"ENREGISTREMENT...", waiting:"VEUILLEZ PATIENTER...",
    newEnsaio:"+ NOUVEL ESSAI", generateReport:"◧ GÉNÉRER RAPPORT", saveEnsaio:"💾 ENREGISTRER",
    cancel:"ANNULER", close:"✕ FERMER", saveIdentity:"💾 SAUVEGARDER", exit:"DÉCONNECTER",
    registerFirst:"+ AJOUTER PREMIER",
    email:"E-MAIL", password:"MOT DE PASSE", login:"CONNEXION", newUser:"NOUVEL UTILISATEUR",
    projectUrl:"PROJECT URL", anonKey:"ANON PUBLIC KEY",
    ensaioType:"TYPE D'ESSAI", sampleId:"IDENTIFICATION DE L'ÉCHANTILLON",
    logoIcon:"ICÔNE DU LOGO", systemName:"NOM DU SYSTÈME", subtitle:"SOUS-TITRE",
    accentColor:"COULEUR D'ACCENT", preview:"APERÇU",
    errFillAll:"Remplissez tous les champs obligatoires.",
    errFillUrlKey:"Remplissez l'URL et la clé.",
    errFillEmailPwd:"Remplissez l'e-mail et le mot de passe.",
    errConnFailed:"Échec de connexion: ",
    errGeneric:"Erreur: ",
    errSave:"Erreur d'enregistrement: ",
    errLoadEnsaios:"Erreur de chargement des essais: ",
    errSelectType:"Remplissez le type d'essai et l'identification de l'échantillon.",
    toastSaved:"✓ Essai enregistré avec succès!",
    toastNewEnsaio:"⛏ Nouvel essai enregistré: ",
    toastAlert:"⚠ ALERTE CRITIQUE: ",
    toastCriticalFs:"⚠ ALERTE CRITIQUE: Activer PAEBM — ANM 95/2022",
    conforme:"CONFORME", naoConforme:"NON CONFORME", atencao:"ATTENTION", pendente:"EN ATTENTE",
    panelTitle:"Tableau de Bord", liveData:"Données en temps réel",
    totalEnsaios:"Essais en BD", laudosEmitidos:"Rapports Émis", conformidade:"Conformité", naoConformidades:"Non-Conformités",
    structureFs:"STRUCTURES — FACTEURS DE SÉCURITÉ", lastEnsaios:"DERNIERS ESSAIS DE LA BD",
    conformByArea:"CONFORMITÉ PAR ZONE",
    noStructure:"Aucune structure enregistrée.", insertViaSQL:"Insérez via SQL Editor dans Supabase.",
    noEnsaios:"Aucun essai encore.",
    ensaiosTitle:"Gestion des Essais", ensaiosLive:"essais · données en direct",
    noEnsaiosFilter:"Aucun essai. Cliquez sur + NOUVEL ESSAI.",
    resultsDb:"RÉSULTATS DE LA BASE DE DONNÉES", inProgress:"⛏ Essai en cours — résultats en attente",
    structureTitle:"Surveillance des Structures", noStructureSql:"Aucune structure enregistrée",
    noStructureInsert:"Insérez des données dans la table structures via Supabase SQL Editor",
    reportsTitle:"Centre de Rapports", reportsSubtitle:"Rapports générés à partir des données réelles",
    selectEnsaio:"SÉLECTIONNEZ UN ESSAI POUR GÉNÉRER LE RAPPORT", noCompletedEnsaios:"Aucun essai terminé avec résultats.",
    realtimeTitle:"Moniteur Temps Réel", realtimeSubtitle:"WebSocket Supabase Realtime · événements en direct",
    liveEvents:"◎ ÉVÉNEMENTS EN DIRECT", waitingEvents:"Canal WebSocket actif. En attente d'événements...",
    testInsert:"TESTER: INSÉRER ESSAI", howItWorks:"🔌 COMMENT ÇA MARCHE",
    newEnsaioEvent:"NOUVEL ESSAI", instrumentEvent:"INSTRUMENTATION",
    reportPreview:"📄 RAPPORT TECHNIQUE — APERÇU", labEmitter:"LABORATOIRE ÉMETTEUR",
    reportCode:"CODE", results:"RÉSULTATS", technicalConclusion:"CONCLUSION TECHNIQUE",
    concApproved:"ont satisfait à toutes les exigences normatives. Matériau APPROUVÉ.",
    concWarning:"ont montré des paramètres proches des limites. Analyse complémentaire recommandée.",
    concFailed:"ont montré des paramètres HORS des limites. Matériau REJETÉ — action corrective immédiate.",
    respTech:"Responsable Technique", conference:"Vérification", accreditation:"Accréditation",
    configTitle:"CONNEXION SUPABASE POSTGRESQL", configIdentity:"⚙ CONFIGURER L'IDENTITÉ DU SYSTÈME",
    credentialsTitle:"COMMENT OBTENIR LES IDENTIFIANTS",
    step1a:"Accédez à", step1b:"supabase.com et créez un compte gratuit",
    step2a:"Créez un projet", step2b:"South America (São Paulo)",
    step3a:"Allez dans", step3b:"Project Settings → API",
    step4a:"Copiez", step4b:"Project URL et anon public key",
    step5a:"Importez", step5b:"geolab-schema.sql dans SQL Editor",
    liveBadge:"SUPABASE EN DIRECT", configLogo:"Configurer l'identité du système",
    approvalTech:"Approbation technique", sample:"ÉCHANTILLON", date:"DATE", status:"STATUT",
    area:"ZONE", action:"ACTION", code:"CODE", test:"ESSAI", responsible:"RESPONSABLE",
    limit:"Limite", norm:"Norme",
  },
  de: {
    dashboard:"Dashboard", ensaios:"Tests", barragens:"Strukturen", relatorios:"Berichte", realtime:"Echtzeit",
    enter:"ANMELDEN →", createAccount:"KONTO ERSTELLEN →", connect:"⚡ MIT DATENBANK VERBINDEN",
    connecting:"VERBINDE...", loading:"LADEN...", saving:"SPEICHERN...", waiting:"BITTE WARTEN...",
    newEnsaio:"+ NEUER TEST", generateReport:"◧ BERICHT ERSTELLEN", saveEnsaio:"💾 IN DB SPEICHERN",
    cancel:"ABBRECHEN", close:"✕ SCHLIESSEN", saveIdentity:"💾 IDENTITÄT SPEICHERN", exit:"ABMELDEN",
    registerFirst:"+ ERSTEN HINZUFÜGEN",
    email:"E-MAIL", password:"PASSWORT", login:"ANMELDEN", newUser:"NEUER BENUTZER",
    projectUrl:"PROJECT URL", anonKey:"ANON PUBLIC KEY",
    ensaioType:"TESTTYP", sampleId:"PROBENIDENTIFIKATION",
    logoIcon:"LOGO-SYMBOL", systemName:"SYSTEMNAME", subtitle:"UNTERTITEL",
    accentColor:"AKZENTFARBE", preview:"VORSCHAU",
    errFillAll:"Füllen Sie alle Pflichtfelder aus.",
    errFillUrlKey:"URL und Schlüssel ausfüllen.",
    errFillEmailPwd:"E-Mail und Passwort ausfüllen.",
    errConnFailed:"Verbindung fehlgeschlagen: ",
    errGeneric:"Fehler: ",
    errSave:"Fehler beim Speichern: ",
    errLoadEnsaios:"Fehler beim Laden der Tests: ",
    errSelectType:"Testtyp und Probenidentifikation ausfüllen.",
    toastSaved:"✓ Test erfolgreich gespeichert!",
    toastNewEnsaio:"⛏ Neuer Test registriert: ",
    toastAlert:"⚠ KRITISCHER ALARM: ",
    toastCriticalFs:"⚠ KRITISCHER ALARM: PAEBM aktivieren — ANM 95/2022",
    conforme:"KONFORM", naoConforme:"NICHT KONFORM", atencao:"ACHTUNG", pendente:"AUSSTEHEND",
    panelTitle:"Kontrollpanel", liveData:"Echtzeitdaten",
    totalEnsaios:"Tests in DB", laudosEmitidos:"Ausgestellte Berichte", conformidade:"Konformität", naoConformidades:"Nichtkonformitäten",
    structureFs:"STRUKTUREN — SICHERHEITSFAKTOREN", lastEnsaios:"NEUESTE TESTS AUS DB",
    conformByArea:"KONFORMITÄT NACH BEREICH",
    noStructure:"Keine Strukturen registriert.", insertViaSQL:"Über SQL Editor in Supabase einfügen.",
    noEnsaios:"Noch keine Tests.",
    ensaiosTitle:"Testverwaltung", ensaiosLive:"Tests · Live-Daten",
    noEnsaiosFilter:"Keine Tests. Auf + NEUER TEST klicken.",
    resultsDb:"DATENBANKERGEBNISSE", inProgress:"⛏ Test läuft — Ergebnisse ausstehend",
    structureTitle:"Strukturüberwachung", noStructureSql:"Keine Strukturen registriert",
    noStructureInsert:"Daten in die Tabelle Strukturen über Supabase SQL Editor einfügen",
    reportsTitle:"Berichtszentrum", reportsSubtitle:"Berichte aus echten Datenbankdaten",
    selectEnsaio:"TEST AUSWÄHLEN UM BERICHT ZU ERSTELLEN", noCompletedEnsaios:"Noch keine abgeschlossenen Tests.",
    realtimeTitle:"Echtzeit-Monitor", realtimeSubtitle:"Supabase Realtime WebSocket · Live-Ereignisse",
    liveEvents:"◎ LIVE-EREIGNISSE", waitingEvents:"WebSocket-Kanal aktiv. Warte auf Ereignisse...",
    testInsert:"TESTEN: TEST EINFÜGEN", howItWorks:"🔌 WIE ES FUNKTIONIERT",
    newEnsaioEvent:"NEUER TEST", instrumentEvent:"INSTRUMENTIERUNG",
    reportPreview:"📄 TECHNISCHER BERICHT — VORSCHAU", labEmitter:"AUSSTELLENDES LABOR",
    reportCode:"CODE", results:"ERGEBNISSE", technicalConclusion:"TECHNISCHES FAZIT",
    concApproved:"erfüllten alle normativen Anforderungen. Material GENEHMIGT.",
    concWarning:"zeigten Parameter nahe an Grenzwerten. Ergänzende Analyse empfohlen.",
    concFailed:"zeigten Parameter AUSSERHALB der Grenzwerte. Material ABGELEHNT — sofortige Korrekturmaßnahme.",
    respTech:"Technisch Verantwortlicher", conference:"Überprüfung", accreditation:"Akkreditierung",
    configTitle:"SUPABASE POSTGRESQL VERBINDUNG", configIdentity:"⚙ SYSTEMIDENTITÄT KONFIGURIEREN",
    credentialsTitle:"WIE MAN ZUGANGSDATEN ERHÄLT",
    step1a:"Zugriff", step1b:"supabase.com und kostenloses Konto erstellen",
    step2a:"Projekt erstellen", step2b:"South America (São Paulo)",
    step3a:"Gehen zu", step3b:"Project Settings → API",
    step4a:"Kopieren", step4b:"Project URL und anon public key",
    step5a:"Importieren", step5b:"geolab-schema.sql im SQL Editor",
    liveBadge:"SUPABASE LIVE", configLogo:"Systemidentität konfigurieren",
    approvalTech:"Technische Genehmigung", sample:"PROBE", date:"DATUM", status:"STATUS",
    area:"BEREICH", action:"AKTION", code:"CODE", test:"TEST", responsible:"VERANTWORTLICHER",
    limit:"Grenzwert", norm:"Norm",
  },
};

// Fallback para inglês se idioma não mapeado
const T18 = I18N[LANG] || I18N["en"];
const t = (key) => T18[key] || I18N["en"][key] || key;

// ══════════════════════════════════════════════════════════════
//  DESIGN TOKENS
// ══════════════════════════════════════════════════════════════
const C = {
  bg:"#020d07", surface:"#071a0e", card:"#0a2215", cardHov:"#0f2e1d",
  border:"#183d24", borderHi:"#266638",
  emerald:"#16c55e", forest:"#0d8040", lime:"#7fff5a",
  gold:"#c8a84b", teal:"#0fd4a8", blue:"#2ea8e0",
  red:"#e04545", orange:"#e08030",
  text:"#c4e8d0", textDim:"#5a9e74", textFaint:"#234830", white:"#edfff4",
  glowG:"rgba(22,197,94,0.14)",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; width:100%; }
  body { min-height:100vh; width:100%; overflow-x:hidden; background:${C.bg}; color:${C.text}; font-family:'Rajdhani',sans-serif; }
  #root { width:100%; min-height:100vh; }

  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:${C.surface}; }
  ::-webkit-scrollbar-thumb { background:${C.forest}; border-radius:3px; }

  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

  .fade-in { animation:fadeIn .28s ease forwards; }

  /* ── Botões ── */
  .btn-p {
    background:linear-gradient(135deg,${C.forest},${C.emerald});
    color:#000; border:none; border-radius:8px; padding:10px 20px;
    font-family:'Rajdhani',sans-serif; font-weight:700; font-size:13px;
    letter-spacing:1.5px; cursor:pointer; transition:all .2s; text-transform:uppercase;
    white-space:nowrap;
  }
  .btn-p:hover { filter:brightness(1.15); transform:translateY(-1px); box-shadow:0 4px 16px rgba(22,197,94,.3); }
  .btn-p:disabled { background:${C.border}; color:${C.textFaint}; cursor:not-allowed; transform:none; box-shadow:none; }

  .btn-g {
    background:transparent; color:${C.textDim}; border:1px solid ${C.border};
    border-radius:7px; padding:7px 14px; font-family:'Rajdhani',sans-serif;
    font-weight:600; font-size:12px; letter-spacing:1px; cursor:pointer;
    transition:all .2s; text-transform:uppercase; white-space:nowrap;
  }
  .btn-g:hover { border-color:${C.borderHi}; color:${C.text}; }

  /* ── Inputs ── */
  .inp {
    width:100%; background:${C.bg}; border:1px solid ${C.borderHi};
    color:${C.text}; border-radius:8px; padding:11px 14px;
    font-family:'JetBrains Mono',monospace; font-size:12px;
    outline:none; transition:border-color .2s;
  }
  .inp:focus { border-color:${C.emerald}; box-shadow:0 0 0 3px rgba(22,197,94,.1); }

  .sel {
    width:100%; background:${C.surface}; border:1px solid ${C.border};
    color:${C.text}; border-radius:8px; padding:10px 12px;
    font-family:'Rajdhani',sans-serif; font-size:13px; outline:none; cursor:pointer;
  }

  .lbl { font-size:11px; color:${C.textDim}; letter-spacing:1.5px; text-transform:uppercase; display:block; margin-bottom:6px; }

  /* ── Secção título ── */
  .sec {
    font-size:11px; font-weight:700; color:${C.emerald}; letter-spacing:2px;
    text-transform:uppercase; margin-bottom:16px;
    display:flex; align-items:center; gap:8px;
  }
  .sec::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,${C.border},transparent); }

  .sdot { width:6px; height:6px; border-radius:50%; background:${C.emerald}; animation:pulse 2s infinite; display:inline-block; }

  /* ── Hover cards ── */
  .ch { transition:all .2s; cursor:pointer; }
  .ch:hover { border-color:${C.borderHi}!important; background:${C.cardHov}!important; transform:translateY(-1px); box-shadow:0 4px 20px rgba(22,197,94,.08); }

  /* ── Hex bg ── */
  .hbg { position:relative; overflow:hidden; }
  .hbg::before {
    content:''; position:absolute; inset:0;
    background-image:radial-gradient(circle at 1px 1px,${C.borderHi}55 1px,transparent 0);
    background-size:28px 28px; opacity:.35; pointer-events:none;
  }

  /* ══════════════════════════════
     GRIDS RESPONSIVOS
  ══════════════════════════════ */
  .g4 { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
  .g3 { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  .g2 { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
  .ga { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:12px; }

  /* wrapper principal centralizado */
  .wrap {
    max-width: 100%;
    margin: 0 auto;
    padding: 20px 24px 48px;
    width: 100%;
    box-sizing: border-box;
  }

  @media (min-width:1600px) {
    .wrap { max-width:100%; padding:24px 40px 56px; }
  }
  @media (min-width:1920px) {
    .wrap { max-width:100%; padding:28px 60px 64px; }
  }

  /* telas médias */
  @media (max-width:1200px) {
    .g4 { grid-template-columns:repeat(2,1fr); }
    .wrap { padding:18px 20px 40px; }
  }
  @media (max-width:900px) {
    .g4 { grid-template-columns:repeat(2,1fr); }
    .g3 { grid-template-columns:repeat(2,1fr); }
    .g2 { grid-template-columns:1fr; }
    .wrap { padding:16px 14px 32px; }
  }
  /* desktop: esconde hamburger */
  .show-mobile-btn { display:none!important; }

  @media (max-width:640px) {
    .g4 { grid-template-columns:1fr 1fr; }
    .g3 { grid-template-columns:1fr; }
    .ga { grid-template-columns:1fr 1fr; }
    .wrap { padding:14px 10px 28px; }
    .hm { display:none!important; }
    .nav-m { overflow-x:auto; -webkit-overflow-scrolling:touch; white-space:nowrap; padding-bottom:4px; }
    /* mobile: mostra hamburger */
    .show-mobile-btn { display:flex!important; align-items:center; justify-content:center; }
    .g2-ensaios { grid-template-columns:1fr!important; }
  }
  @media (max-width:400px) {
    .g4 { grid-template-columns:1fr 1fr; }
    .wrap { padding:12px 8px 24px; }
  }

  /* tabelas responsivas */
  .tbl-wrap { width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch; }
  table { width:100%; border-collapse:collapse; }

  /* modais */
  .modal-inner {
    width: min(880px, 96vw);
    max-height: 92vh;
    overflow-y: auto;
  }
  .modal-inner-sm {
    width: min(600px, 96vw);
    max-height: 92vh;
    overflow-y: auto;
  }
`;

// ══════════════════════════════════════════════════════════════
//  NORMAS
// ══════════════════════════════════════════════════════════════
const NORMAS = {
  granulometria:       { label:"Granulometria",           norma:"ABNT NBR 7181",      area:"solos",     params:[{p:"% Argila",u:"%",lmin:null,lmax:null},{p:"% Silte",u:"%",lmin:null,lmax:null},{p:"% Areia Fina",u:"%",lmin:null,lmax:null},{p:"% Areia Grossa",u:"%",lmin:null,lmax:null},{p:"% Pedregulho",u:"%",lmin:null,lmax:null}]},
  atterberg:           { label:"Limites de Atterberg",    norma:"ABNT NBR 6459/7180", area:"solos",     params:[{p:"Limite de Liquidez (LL)",u:"%",lmin:null,lmax:null},{p:"Limite de Plasticidade (LP)",u:"%",lmin:null,lmax:null},{p:"Índice de Plasticidade (IP)",u:"%",lmin:null,lmax:null}]},
  compactacao_proctor: { label:"Compactação Proctor",     norma:"ABNT NBR 7182",      area:"solos",     params:[{p:"Umidade Ótima (Wot)",u:"%",lmin:null,lmax:null},{p:"Densidade Máx. (ρdmáx)",u:"g/cm³",lmin:null,lmax:null},{p:"Grau de Compactação",u:"%",lmin:95,lmax:null}]},
  hilf:                { label:"Compactação Hilf (Rápido)", norma:"DNER ME 162/94",   area:"solos",     params:[{p:"Umidade Ótima Hilf (Wot)",u:"%",lmin:null,lmax:null},{p:"ρd máx Hilf (g/cm³)",u:"g/cm³",lmin:null,lmax:null},{p:"Umidade Natural (%)",u:"%",lmin:null,lmax:null}]},
  cbr:                 { label:"CBR / ISC",               norma:"ABNT NBR 9895",      area:"solos",     params:[{p:"ISC (%)",u:"%",lmin:6,lmax:null},{p:"Expansão (%)",u:"%",lmin:0,lmax:2}]},
  triaxial:            { label:"Triaxial (CU/CD)",        norma:"ABNT NBR 12007",     area:"solos",     params:[{p:"Coesão (c')",u:"kPa",lmin:null,lmax:null},{p:"Ângulo de Atrito (φ')",u:"°",lmin:28,lmax:null},{p:"Módulo E50",u:"MPa",lmin:null,lmax:null}]},
  adensamento:         { label:"Adensamento",             norma:"ABNT NBR 12007",     area:"solos",     params:[{p:"Índice de Compressão (Cc)",u:"—",lmin:null,lmax:null},{p:"Coef. Adensamento (Cv)",u:"m²/s",lmin:null,lmax:null},{p:"Pressão Pré-adensamento",u:"kPa",lmin:null,lmax:null}]},
  permeabilidade:      { label:"Permeabilidade",          norma:"ABNT NBR 14545",     area:"solos",     params:[{p:"Coeficiente k",u:"cm/s",lmin:null,lmax:null}]},
  spt:                 { label:"Sondagem SPT",            norma:"ABNT NBR 6484",      area:"solos",     params:[{p:"NSPT médio",u:"golpes",lmin:null,lmax:null},{p:"Prof. máxima",u:"m",lmin:null,lmax:null},{p:"Nível d'água (NA)",u:"m",lmin:null,lmax:null}]},
  compressao_concreto: { label:"Compressão — Concreto",   norma:"ABNT NBR 5739",      area:"concreto",  params:[{p:"fck 7 dias",u:"MPa",lmin:18,lmax:null},{p:"fck 28 dias",u:"MPa",lmin:25,lmax:null},{p:"Slump",u:"mm",lmin:60,lmax:120}]},
  tracao_diametral:    { label:"Tração Diametral",        norma:"ABNT NBR 7222",      area:"concreto",  params:[{p:"fctk (28 dias)",u:"MPa",lmin:2.5,lmax:null}]},
  modulo_elasticidade: { label:"Módulo de Elasticidade",  norma:"ABNT NBR 8522",      area:"concreto",  params:[{p:"Módulo Secante (Ecs)",u:"GPa",lmin:25,lmax:null}]},
  tracao_aco:          { label:"Tração — Aço",            norma:"ABNT NBR 6152",      area:"aco",       params:[{p:"Tensão de escoamento (fy)",u:"MPa",lmin:500,lmax:null},{p:"Tensão de ruptura (fu)",u:"MPa",lmin:600,lmax:null},{p:"Alongamento",u:"%",lmin:10,lmax:null}]},
  charpy:              { label:"Impacto Charpy",          norma:"ABNT NBR 6157",      area:"aco",       params:[{p:"Energia absorvida",u:"J",lmin:27,lmax:null}]},
  liquefacao_cpt:      { label:"Potencial de Liquefação", norma:"ANM 95/2022",        area:"barragens", params:[{p:"Qc/σ'v0 (CPT)",u:"—",lmin:null,lmax:null},{p:"Ic (comportamento)",u:"—",lmin:null,lmax:null},{p:"FS Liquefação (CRR/CSR)",u:"—",lmin:1.25,lmax:null}]},
  estabilidade_talude: { label:"Estabilidade de Talude",  norma:"NBR 11682",          area:"barragens", params:[{p:"FS Estático longo prazo",u:"—",lmin:1.30,lmax:null},{p:"FS Estático curto prazo",u:"—",lmin:1.20,lmax:null},{p:"FS Sísmico (kh=0.1)",u:"—",lmin:1.00,lmax:null}]},
  percolacao:          { label:"Análise de Percolação",   norma:"ICOLD Bulletin 164", area:"barragens", params:[{p:"Gradiente de saída (i)",u:"—",lmin:0,lmax:0.5},{p:"Vazão percolada",u:"L/s",lmin:null,lmax:null},{p:"Linha freática (m)",u:"m",lmin:null,lmax:null}]},

  granulometria_peneiramento_sedimentacao: { label:"Granulometria Peneiramento + Sedimentação", norma:"ABNT NBR 7181", area:"solos", params:[{p:"% Argila",u:"%",lmin:null,lmax:null},{p:"% Silte",u:"%",lmin:null,lmax:null},{p:"% Areia Fina",u:"%",lmin:null,lmax:null},{p:"% Areia Média",u:"%",lmin:null,lmax:null},{p:"% Areia Grossa",u:"%",lmin:null,lmax:null},{p:"% Pedregulho",u:"%",lmin:null,lmax:null},{p:"D10 (mm)",u:"mm",lmin:null,lmax:null},{p:"D50 (mm)",u:"mm",lmin:null,lmax:null},{p:"D60 (mm)",u:"mm",lmin:null,lmax:null},{p:"Cu - Coef. Uniformidade",u:"—",lmin:null,lmax:null}] },
  granulometria_peneiramento: { label:"Granulometria por Peneiramento", norma:"ABNT NBR 7181", area:"solos", params:[{p:"% Passante #200",u:"%",lmin:null,lmax:null},{p:"% Passante #40",u:"%",lmin:null,lmax:null},{p:"% Passante #10",u:"%",lmin:null,lmax:null},{p:"% Passante #4",u:"%",lmin:null,lmax:null},{p:"D10 (mm)",u:"mm",lmin:null,lmax:null},{p:"D60 (mm)",u:"mm",lmin:null,lmax:null}] },
  granulometria_completa: { label:"Granulometria Completa", norma:"ABNT NBR 7181", area:"solos", params:[{p:"% Argila",u:"%",lmin:null,lmax:null},{p:"% Silte",u:"%",lmin:null,lmax:null},{p:"% Areia Total",u:"%",lmin:null,lmax:null},{p:"% Pedregulho",u:"%",lmin:null,lmax:null},{p:"D10 (mm)",u:"mm",lmin:null,lmax:null},{p:"D30 (mm)",u:"mm",lmin:null,lmax:null},{p:"D60 (mm)",u:"mm",lmin:null,lmax:null},{p:"Cu (Coef. Uniformidade)",u:"—",lmin:null,lmax:null},{p:"Cc (Coef. Curvatura)",u:"—",lmin:null,lmax:null}] },
  teor_umidade_natural: { label:"Teor de Umidade Natural", norma:"ABNT NBR 6457", area:"solos", params:[{p:"Umidade Natural w (%)",u:"%",lmin:null,lmax:null}] },
  massa_especifica_real_graos: { label:"Massa Específica Real (Densidade dos Grãos)", norma:"ABNT NBR 6508", area:"solos", params:[{p:"Gs (g/cm³)",u:"g/cm³",lmin:2.4,lmax:2.9}] },
  peso_especifico_graos: { label:"Peso Específico dos Grãos", norma:"ABNT NBR 6508", area:"solos", params:[{p:"Gs (g/cm³)",u:"g/cm³",lmin:2.4,lmax:2.9}] },
  massa_especifica_aparente_natural: { label:"Massa Específica Aparente / Peso Específico Natural", norma:"ABNT NBR 9813", area:"solos", params:[{p:"γnat (kN/m³)",u:"kN/m³",lmin:null,lmax:null},{p:"ρnat (g/cm³)",u:"g/cm³",lmin:null,lmax:null},{p:"Índice de Vazios e",u:"—",lmin:null,lmax:null}] },
  densidade_aparente_natural: { label:"Ensaio de Densidade Aparente Natural", norma:"ABNT NBR 9813", area:"solos", params:[{p:"ρnat (g/cm³)",u:"g/cm³",lmin:null,lmax:null},{p:"γnat (kN/m³)",u:"kN/m³",lmin:null,lmax:null}] },
  densidade_aparente_saturada: { label:"Ensaio de Densidade Aparente Saturada", norma:"ABNT NBR 9813", area:"solos", params:[{p:"ρsat (g/cm³)",u:"g/cm³",lmin:null,lmax:null},{p:"γsat (kN/m³)",u:"kN/m³",lmin:null,lmax:null}] },
  limite_liquidez: { label:"Limite de Liquidez (LL)", norma:"ABNT NBR 6459", area:"solos", params:[{p:"Limite de Liquidez LL (%)",u:"%",lmin:null,lmax:null}] },
  limite_plasticidade: { label:"Limite de Plasticidade (LP)", norma:"ABNT NBR 7180", area:"solos", params:[{p:"Limite de Plasticidade LP (%)",u:"%",lmin:null,lmax:null},{p:"Índice de Plasticidade IP (%)",u:"%",lmin:null,lmax:null}] },
  proctor_normal: { label:"Proctor Normal", norma:"ABNT NBR 7182", area:"solos", params:[{p:"Umidade Ótima Wot (%)",u:"%",lmin:null,lmax:null},{p:"ρdmáx (g/cm³)",u:"g/cm³",lmin:null,lmax:null},{p:"Grau de Compactação (%)",u:"%",lmin:95,lmax:null}] },
  proctor_modificado: { label:"Compactação Proctor Modificado", norma:"ABNT NBR 7182", area:"solos", params:[{p:"Umidade Ótima Wot (%)",u:"%",lmin:null,lmax:null},{p:"ρdmáx (g/cm³)",u:"g/cm³",lmin:null,lmax:null},{p:"Grau de Compactação (%)",u:"%",lmin:98,lmax:null}] },
  proctor_internormal: { label:"Compactação Proctor Internormal", norma:"ABNT NBR 7182", area:"solos", params:[{p:"Umidade Ótima Wot (%)",u:"%",lmin:null,lmax:null},{p:"ρdmáx (g/cm³)",u:"g/cm³",lmin:null,lmax:null},{p:"Grau de Compactação (%)",u:"%",lmin:95,lmax:null}] },
  proctor_intermediario: { label:"Compactação Proctor Intermediário", norma:"ABNT NBR 7182", area:"solos", params:[{p:"Umidade Ótima Wot (%)",u:"%",lmin:null,lmax:null},{p:"ρdmáx (g/cm³)",u:"g/cm³",lmin:null,lmax:null},{p:"Grau de Compactação (%)",u:"%",lmin:95,lmax:null}] },
  proctor_intermodificado: { label:"Compactação Proctor Intermediário-Modificado", norma:"ABNT NBR 7182", area:"solos", params:[{p:"Umidade Ótima Wot (%)",u:"%",lmin:null,lmax:null},{p:"ρdmáx (g/cm³)",u:"g/cm³",lmin:null,lmax:null},{p:"Grau de Compactação (%)",u:"%",lmin:95,lmax:null}] },
  cisalhamento_4_estagios: { label:"Cisalhamento Direto (4 Estágios)", norma:"ABNT NBR 12069", area:"solos", params:[{p:"Coesão c' (kPa)",u:"kPa",lmin:0,lmax:null},{p:"Ângulo de Atrito φ' (°)",u:"°",lmin:15,lmax:null},{p:"Tensão Normal σ máx (kPa)",u:"kPa",lmin:null,lmax:null}] },
  triaxial_ciu_4300: { label:"Triaxial CIU Sat — σ3 máx 4300 kPa (por CP)", norma:"ABNT NBR 12007 / ASTM D4767", area:"solos", params:[{p:"Coesão cu (kPa)",u:"kPa",lmin:0,lmax:null},{p:"Ângulo φu (°)",u:"°",lmin:0,lmax:null},{p:"Pressão de célula σ3 (kPa)",u:"kPa",lmin:null,lmax:null},{p:"Tensão desviadora Δσ (kPa)",u:"kPa",lmin:null,lmax:null},{p:"Pressão intersticial u (kPa)",u:"kPa",lmin:null,lmax:null}] },
  triaxial_cid_4300: { label:"Triaxial CID — σ3 máx 4300 kPa (por CP)", norma:"ABNT NBR 12007 / ASTM D7181", area:"solos", params:[{p:"Coesão efetiva c' (kPa)",u:"kPa",lmin:0,lmax:null},{p:"Ângulo de Atrito φ' (°)",u:"°",lmin:20,lmax:null},{p:"Pressão de célula σ3 (kPa)",u:"kPa",lmin:null,lmax:null},{p:"Tensão desviadora Δσ (kPa)",u:"kPa",lmin:null,lmax:null}] },
  adensamento_sem_permeab: { label:"Adensamento Edométrico até 10 Estágios (sem permeab.)", norma:"ABNT NBR 12007", area:"solos", params:[{p:"Índice de Compressão Cc",u:"—",lmin:null,lmax:null},{p:"Índice de Recompressão Cs",u:"—",lmin:null,lmax:null},{p:"Coef. Adensamento Cv (cm²/s)",u:"cm²/s",lmin:null,lmax:null},{p:"Tensão Pré-adensamento σp (kPa)",u:"kPa",lmin:null,lmax:null},{p:"Índice de Vazios Inicial e0",u:"—",lmin:null,lmax:null}] },
  adensamento_com_permeab: { label:"Adensamento Edométrico até 10 Estágios (com permeab.)", norma:"ABNT NBR 12007", area:"solos", params:[{p:"Índice de Compressão Cc",u:"—",lmin:null,lmax:null},{p:"Índice de Recompressão Cs",u:"—",lmin:null,lmax:null},{p:"Coef. Adensamento Cv (cm²/s)",u:"cm²/s",lmin:null,lmax:null},{p:"Tensão Pré-adensamento σp (kPa)",u:"kPa",lmin:null,lmax:null},{p:"Permeabilidade k (cm/s)",u:"cm/s",lmin:null,lmax:null}] },
  compacidade_vazio_maximo: { label:"Compacidade Relativa — Índice de Vazio Máximo", norma:"ABNT NBR 12004", area:"solos", params:[{p:"Índice de Vazio Máximo emax",u:"—",lmin:null,lmax:null},{p:"Densidade Mínima ρdmin (g/cm³)",u:"g/cm³",lmin:null,lmax:null}] },
  compacidade_vazio_minimo: { label:"Compacidade Relativa — Índice de Vazio Mínimo", norma:"ABNT NBR 12051", area:"solos", params:[{p:"Índice de Vazio Mínimo emin",u:"—",lmin:null,lmax:null},{p:"Densidade Máxima ρdmax (g/cm³)",u:"g/cm³",lmin:null,lmax:null},{p:"Compacidade Relativa Dr (%)",u:"%",lmin:null,lmax:null}] },
  permeabilidade_carga_variavel: { label:"Permeabilidade Carga Variável", norma:"ABNT NBR 14545", area:"solos", params:[{p:"Coef. Permeabilidade k (cm/s)",u:"cm/s",lmin:null,lmax:null},{p:"Temperatura T (°C)",u:"°C",lmin:null,lmax:null}] },
  permeabilidade_carga_constante: { label:"Permeabilidade Carga Constante", norma:"ABNT NBR 14545", area:"solos", params:[{p:"Coef. Permeabilidade k (cm/s)",u:"cm/s",lmin:null,lmax:null},{p:"Temperatura T (°C)",u:"°C",lmin:null,lmax:null}] },
  isc_03_pontos: { label:"ISC — 03 Pontos", norma:"ABNT NBR 9895", area:"solos", params:[{p:"ISC / CBR (%)",u:"%",lmin:2,lmax:null},{p:"Expansão (%)",u:"%",lmin:null,lmax:2},{p:"Umidade Ótima (%)",u:"%",lmin:null,lmax:null},{p:"ρdmáx (g/cm³)",u:"g/cm³",lmin:null,lmax:null}] },
  isc_05_pontos: { label:"ISC — 05 Pontos", norma:"ABNT NBR 9895", area:"solos", params:[{p:"ISC / CBR (%)",u:"%",lmin:2,lmax:null},{p:"Expansão (%)",u:"%",lmin:null,lmax:2},{p:"Umidade Ótima (%)",u:"%",lmin:null,lmax:null},{p:"ρdmáx (g/cm³)",u:"g/cm³",lmin:null,lmax:null}] },
  isc_01_ponto_qualquer_energia: { label:"ISC — 01 Ponto + Compactação qualquer energia", norma:"ABNT NBR 9895 / DNER ME 162", area:"solos", params:[{p:"ISC / CBR (%)",u:"%",lmin:2,lmax:null},{p:"Expansão (%)",u:"%",lmin:null,lmax:2},{p:"Umidade Natural (%)",u:"%",lmin:null,lmax:null}] },
  direct_simple_shear: { label:"Direct Simple Shear (DSS)", norma:"ASTM D6528", area:"solos", params:[{p:"Resistência de Pico τmax (kPa)",u:"kPa",lmin:null,lmax:null},{p:"Razão Su/σv'",u:"—",lmin:null,lmax:null},{p:"Deformação de Pico γ (%)",u:"%",lmin:null,lmax:null}] },
  amostragem_campo: { label:"Amostragem de Campo (deformada e indeformada)", norma:"ABNT NBR 9604", area:"solos", params:[{p:"Profundidade Topo (m)",u:"m",lmin:null,lmax:null},{p:"Profundidade Base (m)",u:"m",lmin:null,lmax:null}] },
  dosagem_bgtc: { label:"Dosagem de BGTC", norma:"DNIT 167/2013-ME", area:"solos", params:[{p:"Teor de Cimento (%)",u:"%",lmin:2,lmax:8},{p:"Resistência à Compressão (MPa)",u:"MPa",lmin:2,lmax:null},{p:"Umidade Ótima (%)",u:"%",lmin:null,lmax:null},{p:"ρdmáx (g/cm³)",u:"g/cm³",lmin:null,lmax:null}] },
  equivalente_areia: { label:"Equivalente de Areia", norma:"ABNT NBR NM 30 / DNIT 054", area:"solos", params:[{p:"Equivalente de Areia EA (%)",u:"%",lmin:55,lmax:null}] },
  analise_via_umida_minerios: { label:"Análises via Úmida Clássica (minérios)", norma:"ABNT ISO 11885", area:"solos", params:[{p:"Fe total (%)",u:"%",lmin:null,lmax:null},{p:"Al₂O₃ (%)",u:"%",lmin:null,lmax:null},{p:"SiO₂ (%)",u:"%",lmin:null,lmax:null},{p:"Mn (%)",u:"%",lmin:null,lmax:null}] },
  oxidos_totais_frx: { label:"Óxidos Totais por Fusão — Fluorescência Raios X", norma:"ABNT ISO 14869-1 / FRX", area:"solos", params:[{p:"Fe₂O₃ (%)",u:"%",lmin:null,lmax:null},{p:"SiO₂ (%)",u:"%",lmin:null,lmax:null},{p:"Al₂O₃ (%)",u:"%",lmin:null,lmax:null},{p:"TiO₂ (%)",u:"%",lmin:null,lmax:null},{p:"MnO (%)",u:"%",lmin:null,lmax:null},{p:"Perda ao Fogo PF (%)",u:"%",lmin:null,lmax:null}] },
  analise_termogravimetrica: { label:"Análise Termogravimétrica (TGA)", norma:"ASTM E1131 / ISO 11358", area:"solos", params:[{p:"Perda de Massa Total (%)",u:"%",lmin:null,lmax:null},{p:"Temp. Início Decomposição (°C)",u:"°C",lmin:null,lmax:null},{p:"Resíduo a 1000°C (%)",u:"%",lmin:null,lmax:null}] },
  analise_enxofre_leco: { label:"Análise de Enxofre (Leco)", norma:"ASTM E1018 / NBR ISO 15350", area:"solos", params:[{p:"Teor de Enxofre S (%)",u:"%",lmin:null,lmax:null}] },
  difracao_raios_x_rietveld: { label:"Difração de Raios X — Método Rietveld", norma:"ASTM C1365 / ISO 29581-2", area:"solos", params:[{p:"Quartzo (%)",u:"%",lmin:null,lmax:null},{p:"Goethita (%)",u:"%",lmin:null,lmax:null},{p:"Hematita (%)",u:"%",lmin:null,lmax:null},{p:"Gibbsita (%)",u:"%",lmin:null,lmax:null},{p:"Caolinita (%)",u:"%",lmin:null,lmax:null}] },
  corte_testemunho: { label:"Corte de Testemunho / Serragem de Compactos", norma:"Procedimento interno", area:"solos", params:[{p:"Comprimento Total Cortado (cm)",u:"cm",lmin:null,lmax:null},{p:"Nº de Cortes",u:"—",lmin:null,lmax:null}] },
};

const AICONS = { solos:"⛏", concreto:"🏗", aco:"⚙", barragens:"🏔" };
const ACOLORS = { solos:C.emerald, concreto:C.gold, aco:C.blue, barragens:C.orange };
const sColor = s => ({conforme:C.emerald,nao_conforme:C.red,atencao:C.orange,pendente:C.textDim})[s]||C.textDim;
const sLabel = s => ({conforme:t("conforme"),nao_conforme:t("naoConforme"),atencao:t("atencao"),pendente:t("pendente")})[s]||"—";
function calcSt(v,mn,mx){
  if(v===null||v===undefined||isNaN(v)) return "pendente";
  if((mn!==null&&v<mn)||(mx!==null&&v>mx)) return "nao_conforme";
  if(mn!==null&&mn>0&&v<mn*1.08) return "atencao";
  return "conforme";
}

// ══════════════════════════════════════════════════════════════
//  COMPONENTES BASE
// ══════════════════════════════════════════════════════════════
const Badge = ({label,color}) => (
  <span style={{background:color+"22",color,padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,letterSpacing:1,fontFamily:"'Rajdhani',sans-serif",border:`1px solid ${color}44`,textTransform:"uppercase",whiteSpace:"nowrap"}}>
    {label}
  </span>
);

const Spinner = () => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:48,flexDirection:"column",gap:14}}>
    <div style={{width:36,height:36,border:`2px solid ${C.border}`,borderTop:`2px solid ${C.emerald}`,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
    <span style={{fontSize:11,color:C.textDim,letterSpacing:2}}>{t("loading")}</span>
  </div>
);

function Modal({title,onClose,children,wide}){
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,backdropFilter:"blur(4px)",padding:12}} onClick={onClose}>
      <div className={`fade-in ${wide?"modal-inner":"modal-inner-sm"}`} style={{background:C.card,border:`1px solid ${C.borderHi}`,borderRadius:16,padding:"clamp(16px,3vw,28px)",boxShadow:`0 24px 80px rgba(0,0,0,.6),0 0 40px ${C.glowG}`}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,borderBottom:`1px solid ${C.border}`,paddingBottom:16,flexWrap:"wrap",gap:8}}>
          <span style={{fontSize:13,fontWeight:700,color:C.emerald,letterSpacing:2,textTransform:"uppercase"}}>{title}</span>
          <button className="btn-g" onClick={onClose} style={{padding:"4px 12px",fontSize:11}}>{t("close")}</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const Card = ({children,style={},className=""}) => (
  <div className={className} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:18,...style}}>
    {children}
  </div>
);

function FsGauge({fs,min,size=90}){
  const ratio=Math.min(Math.max(fs/(min*1.6),0),1);
  const cl=fs<min?C.red:fs<min*1.1?C.orange:C.emerald;
  const r=size*.38,cx=size/2,cy=size*.56;
  const a=Math.PI+ratio*Math.PI;
  const x1=cx+r*Math.cos(Math.PI),y1=cy+r*Math.sin(Math.PI);
  const x2=cx+r*Math.cos(2*Math.PI),y2=cy+r*Math.sin(2*Math.PI);
  const xN=cx+r*Math.cos(a),yN=cy+r*Math.sin(a);
  return (
    <svg width={size} height={size*.62} viewBox={`0 0 ${size} ${size*.62}`}>
      <path d={`M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}`} fill="none" stroke={C.border} strokeWidth="7" strokeLinecap="round"/>
      <path d={`M${x1},${y1} A${r},${r} 0 0 1 ${xN},${yN}`} fill="none" stroke={cl} strokeWidth="7" strokeLinecap="round"/>
      <filter id="gf"><feGaussianBlur stdDeviation="2"/></filter>
      <path d={`M${x1},${y1} A${r},${r} 0 0 1 ${xN},${yN}`} fill="none" stroke={cl} strokeWidth="4" strokeLinecap="round" filter="url(#gf)" opacity=".5"/>
      <text x={cx} y={cy-2} textAnchor="middle" fill={cl} fontSize={size*.19} fontWeight="700" fontFamily="'Rajdhani',sans-serif">{fs.toFixed(2)}</text>
      <text x={cx} y={cy+9} textAnchor="middle" fill={C.textDim} fontSize={size*.1} fontFamily="'JetBrains Mono',monospace">FS</text>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════
//  LOGO CONFIGURÁVEL
// ══════════════════════════════════════════════════════════════
const DEFAULT_LOGO = {icon:"SGE",name:"SGEDIEFRA",subtitle:"Sistema de Gestão de Ensaios · DIEFRA",accent:C.emerald};

// ══════════════════════════════════════════════════════════════
//  SGE DIEFRA — LOGO VETORIAL (SVG inline, fiel ao original)
// ══════════════════════════════════════════════════════════════
function DiefraLogo({ size = 48, accent = "#16c55e", showText = true, style = {} }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap: showText ? 10 : 0, ...style }}>
      <DiefraIconSVG size={size} accent={accent}/>
      {showText && (
        <div style={{ minWidth:0 }}>
          <div style={{
            fontSize: size * 0.3, fontWeight: 800, color: accent,
            letterSpacing: size * 0.04, lineHeight: 1.1,
            fontFamily: "'Rajdhani',sans-serif",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>SGEDIEFRA</div>
          <div style={{
            fontSize: size * 0.16, color: "#6b7a6e", letterSpacing: 1, lineHeight: 1.2,
            whiteSpace: "nowrap", display:"flex", alignItems:"center", gap:3,
          }}><span className="sdot"/>SUPABASE LIVE</div>
        </div>
      )}
    </div>
  );
}

// ── SVG icon puro (reutilizável) ─────────────────────────────

// ══════════════════════════════════════════════════════════════
//  PRIMITIVOS SVG — gráficos sem dependência externa
// ══════════════════════════════════════════════════════════════

function Spark({vals,cor}){
  if(!vals?.length) return null;
  const mx=Math.max(...vals,1),mn=Math.min(...vals,0);
  const W=60,H=24;
  const pts=vals.map((v,i)=>({x:(i/(vals.length-1||1))*W,y:H-((v-mn)/(mx-mn||1))*(H-2)-1}));
  const d=pts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return(
    <svg width={W} height={H} style={{display:'block',overflow:'visible'}}>
      <path d={d} fill="none" stroke={cor} strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="2.5" fill={cor}/>
    </svg>
  );
}

function SvgBarras({dados,cor='#16c55e',h=106}){
  if(!dados?.length) return null;
  const mx=Math.max(...dados.map(d=>d.val),1);
  const W=100,H=h-16;
  const bw=Math.floor((W-8)/dados.length)-2;
  return(
    <div style={{width:'100%',height:h,overflow:'visible'}}>
      <svg width="100%" height={h} viewBox={`0 0 ${W} ${H+16}`} preserveAspectRatio="xMidYMid meet" style={{display:'block'}}>
        {dados.map((d,i)=>{
          const bh=Math.max(2,(d.val/mx)*(H-10));
          const x=4+i*(bw+2),y=H-bh;
          return(
            <g key={i}>
              <rect x={x} y={y} width={bw} height={bh} fill={d.cor||cor} rx="2" opacity="0.85"/>
              <rect x={x} y={y} width={bw} height={Math.min(3,bh)} fill={d.cor||cor} rx="1"/>
              <text x={x+bw/2} y={H+12} textAnchor="middle" fontSize="7" fill="#6b7a6e">{d.lbl}</text>
              {d.val>0&&<text x={x+bw/2} y={y-3} textAnchor="middle" fontSize="7" fill={d.cor||cor} fontWeight="700">{d.val}</text>}
            </g>
          );
        })}
        <line x1="0" y1={H} x2={W} y2={H} stroke="#2a3a2f" strokeWidth="0.8"/>
      </svg>
    </div>
  );
}

function SvgLinha({dados,cor='#00d4aa',h=96}){
  if(!dados?.length) return null;
  const mx=Math.max(...dados.map(d=>d.val),1);
  const mn=Math.min(...dados.map(d=>d.val),0);
  const W=100,H=h-16;
  const pts=dados.map((d,i)=>({x:(i/(dados.length-1||1))*W,y:H-((d.val-mn)/(mx-mn||1))*(H-12)-6}));
  const ln=pts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const ar=ln+` L${pts[pts.length-1].x},${H} L0,${H} Z`;
  const gid='lg'+cor.replace('#','');
  return(
    <div style={{width:'100%',height:h}}>
      <svg width="100%" height={h} viewBox={`0 0 ${W} ${H+16}`} preserveAspectRatio="xMidYMid meet" style={{display:'block'}}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cor} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={cor} stopOpacity="0.02"/>
          </linearGradient>
        </defs>
        <path d={ar} fill={`url(#${gid})`}/>
        <path d={ln} fill="none" stroke={cor} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
        {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="2.2" fill={cor}/>)}
        {dados.map((d,i)=>(<g key={i}>
          <text x={pts[i].x} y={pts[i].y-5} textAnchor="middle" fontSize="7" fill={cor} fontWeight="700">{d.val}{d.suf||''}</text>
          <text x={pts[i].x} y={H+12} textAnchor="middle" fontSize="7" fill="#6b7a6e">{d.lbl}</text>
        </g>))}
      </svg>
    </div>
  );
}

function SvgDonut({pct,cor,label,sub,size=80}){
  const R=28,cx=40,cy=40,circ=2*Math.PI*R;
  const p=Math.max(0,Math.min(100,pct));
  return(
    <div style={{textAlign:'center'}}>
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#182c1e" strokeWidth="9"/>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={cor} strokeWidth="9"
          strokeDasharray={`${circ*(p/100)} ${circ}`}
          strokeLinecap="round" transform="rotate(-90 40 40)"
          style={{transition:'stroke-dasharray 1.2s ease'}}/>
        <text x={cx} y={cy-3} textAnchor="middle" fontSize="13" fontWeight="800"
          fill={cor} fontFamily="'JetBrains Mono',monospace">{p}%</text>
        {sub&&<text x={cx} y={cy+9} textAnchor="middle" fontSize="7" fill="#6b9e7a">{sub}</text>}
      </svg>
      {label&&<div style={{fontSize:9,color:'#6b7a6e',letterSpacing:1,marginTop:-2}}>{label}</div>}
    </div>
  );
}

function SvgHBar({val,max,cor,label,right}){
  const pct=max>0?Math.min(100,(val/max)*100):0;
  return(
    <div style={{marginBottom:9}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:3,fontSize:10}}>
        <span style={{color:'#9ab09e',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'65%'}}>{label}</span>
        <span style={{color:cor,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>{right||val}</span>
      </div>
      <div style={{height:5,background:'#182c1e',borderRadius:4,overflow:'hidden'}}>
        <div style={{width:`${pct}%`,height:'100%',background:`linear-gradient(90deg,${cor}88,${cor})`,borderRadius:4,transition:'width 1.2s ease'}}/>
      </div>
    </div>
  );
}

function FsMeter({fs,label}){
  // semicircular gauge
  const W=120,H=70,R=50,cx=60,cy=65;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const norm=clamp((fs-0.5)/2.5,0,1);  // 0.5→0 … 3.0→1
  const ang=-180+norm*180;  // degrees from left
  const toRad=d=>d*Math.PI/180;
  const nx=cx+R*Math.cos(toRad(ang));
  const ny=cy+R*Math.sin(toRad(ang));
  const cor=fs>=1.3?'#16c55e':fs>=1.0?'#c8a84b':'#f87171';
  // arc for coloring (0.5..3.0 → red/yellow/green)
  const arcSeg=(a1,a2,c)=>{
    const x1=cx+R*Math.cos(toRad(a1)),y1=cy+R*Math.sin(toRad(a1));
    const x2=cx+R*Math.cos(toRad(a2)),y2=cy+R*Math.sin(toRad(a2));
    return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
  };
  return(
    <div style={{textAlign:'center'}}>
      <svg width={W} height={H+8} viewBox={`0 0 ${W} ${H+8}`}>
        <path d={arcSeg(-180,-108)} fill="none" stroke="#f87171" strokeWidth="7" strokeLinecap="round"/>
        <path d={arcSeg(-108,-72)} fill="none" stroke="#c8a84b" strokeWidth="7" strokeLinecap="round"/>
        <path d={arcSeg(-72,0)}   fill="none" stroke="#16c55e" strokeWidth="7" strokeLinecap="round"/>
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={cor} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r="5" fill={cor}/>
        <text x={cx} y={cy-12} textAnchor="middle" fontSize="13" fontWeight="800"
          fill={cor} fontFamily="'JetBrains Mono',monospace">{fs.toFixed(2)}</text>
        <text x={cx} y={H+6} textAnchor="middle" fontSize="8" fill="#6b9e7a">{label}</text>
      </svg>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  DASHBOARD v2 — visão completa em 4 linhas
// ══════════════════════════════════════════════════════════════
function DashboardPageV2({ensaios,estruturas,kpis,logo,canEdit,onNewEnsaio}){
  const MESES=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const mes=new Date().getMonth();

  // ── ensaios por mês (últimos 6) ──
  const emMes=Array.from({length:6},(_,i)=>{
    const m=(mes-5+i+12)%12;
    const cnt=ensaios.filter(e=>e.data_ensaio&&new Date(e.data_ensaio).getMonth()===m).length;
    return {lbl:MESES[m],val:cnt};
  });

  // ── conformidade mensal ──
  const confMes=Array.from({length:6},(_,i)=>{
    const m=(mes-5+i+12)%12;
    const ea=ensaios.filter(e=>e.status==='concluido'&&e.data_ensaio&&new Date(e.data_ensaio).getMonth()===m);
    if(!ea.length) return {lbl:MESES[m],val:100,suf:'%'};
    const nc=ea.filter(e=>(e.resultados||[]).some(r=>r.status_conformidade==='nao_conforme')).length;
    return {lbl:MESES[m],val:Math.round(100*(ea.length-nc)/ea.length),suf:'%'};
  });

  // ── ensaios por tipo ──
  const porTipo={};
  ensaios.forEach(e=>{const k=NORMAS[e.tipo]?.label||e.tipo||'Outro';porTipo[k]=(porTipo[k]||0)+1;});
  const tipoTop=Object.entries(porTipo).sort((a,b)=>b[1]-a[1]).slice(0,7);
  const CORS=['#16c55e','#00d4aa','#00b8d4','#7ec820','#c8a84b','#4ea8ff','#a855f7'];

  // ── status ──
  const ST={pendente:0,em_andamento:0,concluido:0,cancelado:0};
  ensaios.forEach(e=>ST[e.status]!=null&&ST[e.status]++);
  const stArr=[
    {l:'Concluídos',v:ST.concluido,cor:'#16c55e'},
    {l:'Em Andamento',v:ST.em_andamento,cor:'#c8a84b'},
    {l:'Pendentes',v:ST.pendente,cor:'#4ea8ff'},
    {l:'Cancelados',v:ST.cancelado,cor:'#f87171'},
  ];

  // ── conformidade por área ──
  const AREAS=['solos','concreto','aco','barragens'];
  const confArea=AREAS.map(a=>{
    const ea=ensaios.filter(e=>e.area===a&&e.status==='concluido');
    const nc=ea.filter(e=>(e.resultados||[]).some(r=>r.status_conformidade==='nao_conforme')).length;
    return {a,pct:ea.length?Math.round(100*(ea.length-nc)/ea.length):100,tot:ea.length,cor:ACOLORS[a]};
  });

  // ── FS estruturas ──
  const fsOk=estruturas.filter(e=>(e.fs_estatico||0)>=1.3).length;
  const fsAl=estruturas.filter(e=>(e.fs_estatico||0)>=1.0&&(e.fs_estatico||0)<1.3).length;
  const fsCr=estruturas.filter(e=>(e.fs_estatico||0)>0&&(e.fs_estatico||0)<1.0).length;
  const spark7=Array.from({length:7},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-6+i);
    const ds=d.toISOString().slice(0,10);
    return ensaios.filter(e=>(e.data_ensaio||e.created_at||'').slice(0,10)===ds).length;
  });

  const cs={background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:'clamp(12px,2vw,18px)'};
  const sh=(cor)=>({onMouseEnter:e=>{e.currentTarget.style.boxShadow=`0 4px 20px ${cor}22`},onMouseLeave:e=>{e.currentTarget.style.boxShadow=''}});

  return(
    <div className="fade-in wrap" style={{display:'grid',gap:14,width:'100%',boxSizing:'border-box',paddingBottom:48}}>

      {/* ── TOPO ── */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:8}}>
        <div>
          <div style={{fontSize:'clamp(16px,2.5vw,20px)',fontWeight:700}}>◈ Dashboard Geotécnico</div>
          <div style={{fontSize:11,color:C.textDim,marginTop:2}}>
            Tempo real · {new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
          </div>
        </div>
        {canEdit&&<button className="btn-p" onClick={onNewEnsaio}>+ Novo Ensaio</button>}
      </div>
      <div style={{height:1,background:`linear-gradient(90deg,${logo.accent},transparent)`}}/>

      {/* ── LINHA 1 — 5 KPI CARDS ── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10,alignItems:'stretch'}}>
        {[
          {icon:'⛏', label:'Total de Ensaios',    val:ensaios.length,                                                                           cor:'#16c55e', spark:spark7},
          {icon:'◧', label:'Laudos Emitidos',      val:ensaios.filter(e=>e.status==='concluido'||e.status==='conforme').length,               cor:'#c8a84b', spark:null},
          {icon:'◉', label:'Conformidade',         val:(ensaios.length>0?Math.round(ensaios.filter(e=>e.status==='concluido'||e.status==='conforme').length/ensaios.length*100):100)+'%', cor:'#00d4aa', spark:null},
          {icon:'⚠', label:'Não Conformidades',   val:ensaios.filter(e=>e.status==='nao_conforme').length,                                    cor:ensaios.filter(e=>e.status==='nao_conforme').length>0?'#f87171':'#16c55e', spark:null},
          {icon:'🏔',label:'Estruturas',           val:estruturas.length,                                                                        cor:'#4ea8ff', spark:null},
        ].map((k,i)=>(
          <div key={i} style={{...cs,position:'relative'}} {...sh(k.cor)}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${k.cor},transparent)`}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
              <span style={{fontSize:18,filter:`drop-shadow(0 0 5px ${k.cor}88)`}}>{k.icon}</span>
              {k.spark&&<Spark vals={k.spark} cor={k.cor}/>}
            </div>
            <div style={{fontSize:'clamp(22px,3vw,30px)',fontWeight:800,color:k.cor,fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>{k.val}</div>
            <div style={{fontSize:9,color:C.textDim,marginTop:6,letterSpacing:.5}}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* ── LINHA 2 — GRÁFICOS BARRAS + LINHA + HORIZONTAL ── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(240px,100%),1fr))',gap:14}}>

        <div style={cs}>
          <div style={{fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:10,display:'flex',justifyContent:'space-between'}}>
            <span>📅 ENSAIOS POR MÊS</span>
            <span style={{color:'#16c55e',fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{emMes.slice(-1)[0].val}</span>
          </div>
          <SvgBarras dados={emMes} cor="#16c55e"/>
        </div>

        <div style={cs}>
          <div style={{fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:10,display:'flex',justifyContent:'space-between'}}>
            <span>📈 CONFORMIDADE MENSAL</span>
            <span style={{color:'#00d4aa',fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{confMes.slice(-1)[0].val}%</span>
          </div>
          <SvgLinha dados={confMes} cor="#00d4aa"/>
        </div>

        <div style={cs}>
          <div style={{fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:10}}>🔬 ENSAIOS POR TIPO</div>
          {tipoTop.length===0
            ?<div style={{color:C.textFaint,fontSize:11,padding:'16px 0',textAlign:'center'}}>Nenhum ensaio</div>
            :tipoTop.map(([lbl,val],i)=>(
              <SvgHBar key={i} val={val} max={tipoTop[0][1]} cor={CORS[i%7]}
                label={lbl.split(' ').slice(0,2).join(' ')}/>
          ))}
        </div>
      </div>

      {/* ── LINHA 3 — STATUS DONUTS + FS + CONFORMIDADE POR ÁREA ── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(260px,100%),1fr))',gap:14}}>

        {/* Status donuts */}
        <div style={cs}>
          <div style={{fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:12}}>◎ STATUS DOS ENSAIOS</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center',marginBottom:10}}>
            {stArr.filter(s=>s.v>0||ensaios.length===0).map((s,i)=>(
              <SvgDonut key={i} pct={ensaios.length?Math.round(s.v/ensaios.length*100):0}
                cor={s.cor} label={s.l.split(' ')[0]} sub={String(s.v)} size={76}/>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5}}>
            {stArr.map((s,i)=>(
              <div key={i} style={{background:'#101f14',borderRadius:6,padding:'6px 10px',
                display:'flex',justifyContent:'space-between',alignItems:'center',borderLeft:`2px solid ${s.cor}55`}}>
                <span style={{fontSize:9,color:C.textDim}}>{s.l}</span>
                <span style={{fontSize:12,fontWeight:700,color:s.cor,fontFamily:"'JetBrains Mono',monospace"}}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FS Estruturas */}
        <div style={cs}>
          <div style={{fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:10}}>🏔 FATOR DE SEGURANÇA — ESTRUTURAS</div>
          {estruturas.length===0
            ?<div style={{color:C.textFaint,fontSize:11,padding:'16px 0',textAlign:'center'}}>Nenhuma estrutura cadastrada</div>
            :(<>
              <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap',justifyContent:'center'}}>
                {[{l:'FS≥1,30 ✓',v:fsOk,cor:'#16c55e'},{l:'Alerta',v:fsAl,cor:'#c8a84b'},{l:'Crítico',v:fsCr,cor:'#f87171'}].map((s,i)=>(
                  <div key={i} style={{flex:1,minWidth:64,background:'#101f14',borderRadius:8,
                    padding:'8px 6px',textAlign:'center',border:`1px solid ${s.cor}33`}}>
                    <div style={{fontSize:18,fontWeight:800,color:s.cor,fontFamily:"'JetBrains Mono',monospace"}}>{s.v}</div>
                    <div style={{fontSize:8,color:C.textDim,marginTop:2}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
                {estruturas.slice(0,4).map(e=>(
                  <FsMeter key={e.id} fs={e.fs_estatico||0} label={e.nome?.split(' ')[0]||'Estr.'}/>
                ))}
              </div>
            </>)
          }
        </div>

        {/* Conformidade por área */}
        <div style={cs}>
          <div style={{fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:10}}>◉ CONFORMIDADE POR ÁREA</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
            {confArea.map((a,i)=>(
              <SvgDonut key={i} pct={a.pct} cor={a.cor} label={a.a} sub={a.tot+' ens'} size={80}/>
            ))}
          </div>
          <div style={{display:'grid',gap:4}}>
            {confArea.map((a,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:8,background:'#101f14',
                borderRadius:6,padding:'5px 10px',borderLeft:`2px solid ${a.cor}88`}}>
                <span style={{fontSize:12}}>{AICONS[a.a]}</span>
                <span style={{fontSize:9,color:C.textDim,flex:1,textTransform:'capitalize'}}>{a.a}</span>
                <span style={{fontSize:9,color:C.textFaint}}>{a.tot}</span>
                <span style={{fontSize:10,fontWeight:700,color:a.pct>=95?'#16c55e':a.pct>=80?'#c8a84b':'#f87171',
                  fontFamily:"'JetBrains Mono',monospace"}}>{a.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LINHA 4 — ÚLTIMOS ENSAIOS + ALERTAS ── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(280px,100%),1fr))',gap:14}}>

        <div style={cs}>
          <div style={{fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:10}}>◷ ÚLTIMOS ENSAIOS</div>
          {ensaios.length===0
            ?<div style={{color:C.textFaint,fontSize:11,padding:'16px 0',textAlign:'center'}}>
              Nenhum ensaio registrado<br/>
              {canEdit&&<button className="btn-p" onClick={onNewEnsaio} style={{marginTop:10,fontSize:11}}>+ Primeiro Ensaio</button>}
            </div>
            :ensaios.slice(0,7).map(e=>{
              const sg=sgOf(e.resultados||[]);
              return(
                <div key={e.id} style={{background:'#101f14',borderRadius:8,padding:'8px 12px',marginBottom:6,
                  display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,
                  borderLeft:`2px solid ${sColor(sg)||C.border}`}}>
                  <div style={{minWidth:0,flex:1}}>
                    <div style={{fontSize:11,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {AICONS[e.area]} {NORMAS[e.tipo]?.label||e.tipo}
                    </div>
                    <div style={{fontSize:9,color:C.textDim,marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {e.amostra_descricao||'—'} · {e.data_ensaio||'—'}
                    </div>
                  </div>
                  <Badge label={sLabel(sg)} color={sColor(sg)}/>
                </div>
              );
            })
          }
        </div>

        <div style={cs}>
          <div style={{fontSize:10,color:C.textDim,letterSpacing:1,marginBottom:10}}>⚡ INDICADORES CRÍTICOS — ANM 95/2022</div>
          <div style={{display:'grid',gap:7}}>
            {/* FS mínimo */}
            {(()=>{
              const fsMin=estruturas.length?Math.min(...estruturas.map(e=>e.fs_estatico||99)):null;
              const cor=!fsMin||fsMin===99?'#6b7a6e':fsMin>=1.3?'#16c55e':fsMin>=1.0?'#c8a84b':'#f87171';
              return(
                <div style={{background:'#101f14',borderRadius:8,padding:'10px 14px',borderLeft:`3px solid ${cor}`}}>
                  <div style={{fontSize:9,color:C.textDim,letterSpacing:1,marginBottom:3}}>FS MÍNIMO ESTÁTICO — ESTRUTURAS</div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:10,color:C.text}}>Menor FS entre todas as estruturas</span>
                    <span style={{fontSize:16,fontWeight:800,color:cor,fontFamily:"'JetBrains Mono',monospace"}}>
                      {fsMin&&fsMin!==99?fsMin.toFixed(2):'—'}
                    </span>
                  </div>
                  <div style={{fontSize:9,color:C.textDim,marginTop:3}}>Limite NBR 11682: <span style={{color:'#16c55e'}}>FS ≥ 1,30</span></div>
                </div>
              );
            })()}
            {/* NC recentes */}
            {(()=>{
              const nc=ensaios.filter(e=>(e.resultados||[]).some(r=>r.status_conformidade==='nao_conforme'));
              return(
                <div style={{background:'#101f14',borderRadius:8,padding:'10px 14px',borderLeft:`3px solid ${nc.length>0?'#f87171':'#16c55e'}`}}>
                  <div style={{fontSize:9,color:C.textDim,letterSpacing:1,marginBottom:3}}>NÃO CONFORMIDADES ATIVAS</div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:10,color:C.text}}>Ensaios com resultado NC</span>
                    <span style={{fontSize:16,fontWeight:800,color:nc.length>0?'#f87171':'#16c55e',fontFamily:"'JetBrains Mono',monospace"}}>{nc.length}</span>
                  </div>
                  {nc.length>0&&<div style={{fontSize:9,color:'#f87171',marginTop:3}}>⚠ Verificar laudos e ações corretivas</div>}
                </div>
              );
            })()}
            {/* Nível emergência mais crítico */}
            {(()=>{
              const lvl=['ANE3','ANE2','ANE1','ANE0'];
              const worst=lvl.find(l=>estruturas.some(e=>e.nivel_emergencia===l))||'ANE0';
              const cor={'ANE0':'#16c55e','ANE1':'#c8a84b','ANE2':'#f97316','ANE3':'#f87171'}[worst];
              return(
                <div style={{background:'#101f14',borderRadius:8,padding:'10px 14px',borderLeft:`3px solid ${cor}`}}>
                  <div style={{fontSize:9,color:C.textDim,letterSpacing:1,marginBottom:3}}>NÍVEL DE EMERGÊNCIA MÁXIMO</div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:10,color:C.text}}>Declaração ANM 95/2022</span>
                    <span style={{fontSize:16,fontWeight:800,color:cor,fontFamily:"'JetBrains Mono',monospace"}}>{worst}</span>
                  </div>
                  <div style={{fontSize:9,color:C.textDim,marginTop:3}}>
                    {worst==='ANE0'?'Normal — sem emergência':`Emergência ${worst} declarada`}
                  </div>
                </div>
              );
            })()}
            {/* Taxa conclusão */}
            <div style={{background:'#101f14',borderRadius:8,padding:'10px 14px'}}>
              <div style={{fontSize:9,color:C.textDim,letterSpacing:1,marginBottom:6}}>TAXA DE CONCLUSÃO DE ENSAIOS</div>
              <SvgHBar val={ST.concluido} max={Math.max(ensaios.length,1)}
                cor="#16c55e" label="Concluídos"
                right={ensaios.length?Math.round(ST.concluido/ensaios.length*100)+'%':'0%'}/>
              <SvgHBar val={ST.em_andamento} max={Math.max(ensaios.length,1)}
                cor="#c8a84b" label="Em andamento"
                right={ensaios.length?Math.round(ST.em_andamento/ensaios.length*100)+'%':'0%'}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FERRAMENTAS_CATALOG = [
  {id:'F001',cat:'Compactação',nome:'Prensa de Compactação CBR',marca:'Contenco / ELE',norma:'ABNT NBR 9895',descricao:'Prensa motorizada para ensaio CBR com anel dinamométrico acoplado, penetrômetro e deflectômetro. Capacidade 50 kN.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F002',cat:'Compactação',nome:'Molde Proctor Normal (PN)',marca:'Contenco',norma:'ABNT NBR 7182',descricao:'Molde cilíndrico Ø100 mm × 127 mm, volume 944 cm³, com colarinho e base perfurada.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F003',cat:'Compactação',nome:'Molde Proctor Intermediário (PI)',marca:'Contenco',norma:'ABNT NBR 7182',descricao:'Molde cilíndrico Ø150 mm × 127 mm, volume 2.124 cm³.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F004',cat:'Compactação',nome:'Soquete Manual Proctor Normal',marca:'Contenco',norma:'ABNT NBR 7182',descricao:'Soquete Ø50 mm, massa 2,5 kg, altura de queda 305 mm, 25 golpes/camada.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F005',cat:'Compactação',nome:'Soquete Manual Proctor Modificado',marca:'Contenco',norma:'ABNT NBR 7182',descricao:'Soquete Ø50 mm, massa 4,5 kg, altura de queda 457 mm, 55 golpes/camada.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F006',cat:'Compactação',nome:'Compactador Mecânico (Proctor Automático)',marca:'Controls / ELE',norma:'ABNT NBR 7182',descricao:'Equipamento automático de compactação com contagem de golpes programável, pistão motorizado.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F007',cat:'Compactação',nome:'Molde CBR (Ø152 mm)',marca:'Contenco',norma:'ABNT NBR 9895',descricao:'Molde CBR Ø152 mm × 177 mm, com colar, base perfurada e disco espaçador.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F008',cat:'Compactação',nome:'Anel Dinamométrico 50 kN',marca:'Controls',norma:'ABNT NBR 9895',descricao:'Anel dinamométrico de carga para leitura de força no ensaio CBR, constante de calibração individual.',status:'ativo',patrimonio:'',calibracao:'6 meses'},
  {id:'F009',cat:'Compactação',nome:'Deflectômetro (Dial Gauge 0,01 mm)',marca:'Mitutoyo / Insize',norma:'ABNT NBR 9895',descricao:'Relógio comparador com resolução 0,01 mm, curso 25 mm, para leitura de expansão e penetração.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F010',cat:'Compactação',nome:'Conjunto de Placas Sobrecarga CBR',marca:'Contenco',norma:'ABNT NBR 9895',descricao:'Placas anulares de sobrecarga em aço (1 kg cada), para simular peso do pavimento.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F011',cat:'Granulometria',nome:'Conjunto de Peneiras ABNT (Solo)',marca:'Bertel / Contenco',norma:'ABNT NBR 7181',descricao:'Série completa: 4", 3", 2", 1½", 1", ¾", ½", 3/8", nº4, 10, 16, 30, 40, 50, 100, 200 (abertura mín. 0,075 mm). Quadros Ø200 mm.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F012',cat:'Granulometria',nome:'Agitador Mecânico de Peneiras',marca:'Bertel',norma:'ABNT NBR 7181',descricao:'Agitador elétrico com timer, vibração em 3D, suporte para até 8 peneiras Ø200 mm.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F013',cat:'Granulometria',nome:'Densímetro (Hidrômetro) ASTM 152H',marca:'Nacional',norma:'ABNT NBR 7181',descricao:'Densímetro para análise por sedimentação (finos), escala 0,995 a 1,040 g/cm³.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F014',cat:'Granulometria',nome:'Provetas 1000 mL (para sedimentação)',marca:'Pyrex',norma:'ABNT NBR 7181',descricao:'Provetas cilíndricas graduadas 1000 mL, com tampa, para ensaio de sedimentação.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F015',cat:'Granulometria',nome:'Termômetro de Imersão',marca:'Incoterm',norma:'ABNT NBR 7181',descricao:'Termômetro digital ±0,1 °C para correção de temperatura na sedimentação.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F016',cat:'Granulometria',nome:'Balança Analítica 0,001 g',marca:'Marte / Shimadzu',norma:'ABNT NBR 7181',descricao:'Balança de precisão analítica, capacidade 320 g, resolução 0,001 g, calibração interna.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F017',cat:'Granulometria',nome:'Balança Semi-Analítica 0,01 g',marca:'Marte',norma:'ABNT NBR 7181',descricao:'Balança resolução 0,01 g, capacidade 3.000 g.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F018',cat:'Granulometria',nome:'Estufa de Secagem 105 °C',marca:'FANEM / Quimis',norma:'ABNT NBR 7181',descricao:'Estufa elétrica com circulação forçada, faixa 50–300 °C, controle digital ±1 °C.',status:'ativo',patrimonio:'',calibracao:'6 meses'},
  {id:'F019',cat:'Atterberg',nome:'Aparelho de Casagrande',marca:'Contenco / ELE',norma:'ABNT NBR 6459',descricao:'Aparelho manual/motorizado para Limite de Liquidez. Concha de latão padronizada, queda 10 mm.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F020',cat:'Atterberg',nome:'Ranhuradores (Casagrande + ASTM)',marca:'Contenco',norma:'ABNT NBR 6459',descricao:'Ranhuradores tipo Casagrande e tipo ASTM para sulco padrão na concha.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F021',cat:'Atterberg',nome:'Placa de Vidro para LP',marca:'Nacional',norma:'ABNT NBR 7180',descricao:'Placa de vidro fosco 200×200 mm para rolagem do cilindro no Limite de Plasticidade.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F022',cat:'Atterberg',nome:'Cápsulas de Porcelana',marca:'Nacional',norma:'ABNT NBR 6459',descricao:'Cápsulas com tampa, Ø60 mm, para determinação de umidade dos fragmentos de Atterberg.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F023',cat:'Triaxial',nome:'Prensa Triaxial Digitalizada',marca:'Controls / GDS Instruments',norma:'ABNT NBR 12007',descricao:'Sistema triaxial automático com controladores de pressão de célula e contrapressão, transdutores de força, deslocamento e pressão intersticial. Software integrado.',status:'ativo',patrimonio:'',calibracao:'6 meses'},
  {id:'F024',cat:'Triaxial',nome:'Câmara Triaxial 38/50/70/100 mm',marca:'Controls',norma:'ABNT NBR 12007',descricao:'Câmaras em acrílico ou aço inox para corpos de prova Ø38, 50, 70 e 100 mm.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F025',cat:'Triaxial',nome:'Controlador de Pressão (GDS / Volum.)',marca:'GDS / Controls',norma:'ABNT NBR 12007',descricao:'Controlador de pressão/volume servo-motorizado, resolução 1 kPa, range 0–2000 kPa.',status:'ativo',patrimonio:'',calibracao:'6 meses'},
  {id:'F026',cat:'Triaxial',nome:'Membrana de Borracha para CPs',marca:'Controls',norma:'ABNT NBR 12007',descricao:'Membranas látex para CPs Ø38/50/70/100 mm, espessura 0,3 mm, descartável.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F027',cat:'Triaxial',nome:'Pedras Porosas',marca:'Controls',norma:'ABNT NBR 12007',descricao:'Discos porosos em cerâmica ou bronze sinterizado, Ø38/50/70/100 mm, para drenagem dos CPs.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F028',cat:'Triaxial',nome:'Extrusor de Amostra',marca:'Contenco',norma:'ABNT NBR 12007',descricao:'Extrusor manual para remover amostras indeformadas do amostrador sem perturbação.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F029',cat:'Adensamento',nome:'Adensômetro Oedométrico',marca:'Controls / ELE',norma:'ABNT NBR 12007',descricao:'Odômetro fixo com anel de carga, capacidade 50 kN, para ensaio de adensamento unidimensional. Inclui relógio comparador 0,01 mm.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F030',cat:'Adensamento',nome:'Adensômetro com Backpressure',marca:'GDS / Controls',norma:'ASTM D4546',descricao:'Odômetro avançado com saturação por contrapressão e medição de pressão intersticial.',status:'ativo',patrimonio:'',calibracao:'6 meses'},
  {id:'F031',cat:'Adensamento',nome:'Anéis de Corte (Ø50 / 70 mm)',marca:'Controls',norma:'ABNT NBR 12007',descricao:'Anéis em aço inox para corte e confinamento de amostras no ensaio de adensamento.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F032',cat:'Permeabilidade',nome:'Permeâmetro de Carga Variável',marca:'Contenco',norma:'ABNT NBR 14545',descricao:'Permeâmetro para solos de baixa permeabilidade (argila), método de carga variável, tripé e tubo capilar graduado.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F033',cat:'Permeabilidade',nome:'Permeâmetro de Carga Constante',marca:'Contenco',norma:'ABNT NBR 14545',descricao:'Permeâmetro para solos de alta permeabilidade (areia, brita), reservatório de carga constante.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F034',cat:'Permeabilidade',nome:'Permeâmetro Triaxial (Flexível)',marca:'Controls',norma:'ASTM D5084',descricao:'Célula de parede flexível para k em condições confinadas, com contrapressão. Range k = 10⁻¹⁰ m/s.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F035',cat:'Cisalhamento',nome:'Aparelho de Cisalhamento Direto Motorizado',marca:'Controls / ELE',norma:'ABNT NBR 12069',descricao:'Equipamento motorizado com velocidades 0,002 a 2,4 mm/min, capacidade normal 10 kN, célula de carga digital e LVDT.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F036',cat:'Cisalhamento',nome:'Caixas de Cisalhamento (60×60 / 100×100 mm)',marca:'Controls',norma:'ABNT NBR 12069',descricao:'Caixas bipartidas 60×60 mm e 100×100 mm em aço inox para ensaio de cisalhamento direto.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F037',cat:'Sondagem SPT',nome:'Conjunto de Sondagem à Percussão SPT',marca:'Menegotto / Nacional',norma:'ABNT NBR 6484',descricao:'Conjunto completo: torre, martelo padrão 65 kg (queda 75 cm), tubos de revestimento, amostrador padrão, hastes de 1 m, trado espiral, cabeçote.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F038',cat:'Sondagem SPT',nome:'Medidor de Energia SPT (SPT Analyzer)',marca:'Pile Dynamics / PDI',norma:'ASTM D4633',descricao:'Instrumento para medição da energia real no SPT (ENTHRU), acelerômetro e strain gauge acoplados às hastes.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F039',cat:'Sondagem SPT',nome:'Amostrador Shelby (Ø75 mm)',marca:'Contenco',norma:'ABNT NBR 9604',descricao:'Tubo de parede fina Ø75 mm para coleta de amostras indeformadas em argila mole.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F040',cat:'Sondagem SPT',nome:'Penetrômetro de Bolso',marca:'Controls',norma:'—',descricao:'Penetrômetro manual para estimativa rápida de Su (coesão não-drenada) em campo. Escala 0–4,5 kgf/cm².',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F041',cat:'CPT',nome:'Equipamento CPTu (Cone Elétrico)',marca:'Fugro / A.P. van den Berg',norma:'ISO 22476-1',descricao:'Cone elétrico com medição de resistência de ponta qc, atrito lateral fs e pressão de poro u2. Velocidade padrão 2 cm/s.',status:'ativo',patrimonio:'',calibracao:'6 meses'},
  {id:'F042',cat:'CPT',nome:'Caminhão de Reação CPT',marca:'Fugro',norma:'ISO 22476-1',descricao:'Veículo de reação 20 tf para empuxo do cone nas sondagens CPT.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F043',cat:'Concreto',nome:'Prensa de Ensaio Concreto 2.000 kN',marca:'AMSLER / Controls / CONTENCO',norma:'ABNT NBR 5739',descricao:'Prensa hidráulica servo-controlada capacidade 2.000 kN, resolução 0,1 kN, display digital. Placas 200×200 mm e ponteira esférica.',status:'ativo',patrimonio:'',calibracao:'6 meses'},
  {id:'F044',cat:'Concreto',nome:'Capeadora de CPs de Concreto',marca:'Contenco',norma:'ABNT NBR 5738',descricao:'Equipamento para capeamento com pasta de enxofre fundido ou elastômero, nivelamento ±0,5°.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F045',cat:'Concreto',nome:'Retífica de Topos',marca:'Controls',norma:'ABNT NBR 5739',descricao:'Retífica diamantada para plainar topos dos corpos de prova sem capeamento.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F046',cat:'Concreto',nome:'Paquímetro Digital 300 mm',marca:'Mitutoyo',norma:'ABNT NBR 5739',descricao:'Paquímetro digital aço inox, resolução 0,01 mm, para medição de dimensões dos CPs.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F047',cat:'Concreto',nome:'Conjunto Slump Test (Abatimento)',marca:'Contenco',norma:'ABNT NBR NM 67',descricao:'Tronco de cone de Abrams Ø100/200 mm × 300 mm, soquete de 16 mm, placa de base.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F048',cat:'Concreto',nome:'Formas Cilíndricas (Ø100×200 mm)',marca:'Nacional',norma:'ABNT NBR 5738',descricao:'Formas plásticas bipartidas para moldagem de CPs cilíndricos 10×20 cm. Kit 50 unid.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F049',cat:'Concreto',nome:'Câmara Úmida / Câmara de Cura',marca:'FANEM',norma:'ABNT NBR 5738',descricao:'Câmara de cura úmida com umidade >95% e temperatura 23±2 °C controlada digitalmente.',status:'ativo',patrimonio:'',calibracao:'6 meses'},
  {id:'F050',cat:'Concreto',nome:'Esclerômetro de Schmidt',marca:'Proceq',norma:'ABNT NBR 7584',descricao:'Martelo de rebote para ensaio não destrutivo de resistência superficial do concreto.',status:'ativo',patrimonio:'',calibracao:'6 meses'},
  {id:'F051',cat:'Concreto',nome:'Pacômetro (Covermeter)',marca:'Proceq / Elcometer',norma:'—',descricao:'Localizador de armaduras e medidor de cobrimento em estruturas de concreto armado.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F052',cat:'Concreto',nome:'Termômetro Digital para Concreto',marca:'Incoterm',norma:'ABNT NBR 7212',descricao:'Termômetro de haste Ø4 mm para leitura de temperatura do concreto fresco.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F053',cat:'Aço',nome:'Máquina Universal de Ensaios (200 kN)',marca:'EMIC / Shimadzu / Instron',norma:'ABNT NBR 6152',descricao:'Máquina eletromecânica universal 200 kN, garras intercambiáveis para tração e dobramento de aço, LVDT de precisão, software dedicado.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F054',cat:'Aço',nome:'Extensômetro de Contato (Clip-on)',marca:'Instron / Epsilon',norma:'ABNT NBR 6152',descricao:'Extensômetro de faca para medição de deformação em amostras de aço, base 50 mm, ±50%.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F055',cat:'Aço',nome:'Máquina de Impacto Charpy (300 J)',marca:'EMIC / Instron',norma:'ABNT NBR 6157',descricao:'Pêndulo Charpy capacidade 300 J, lâmina V, U, distância entre apoios 40 mm.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F056',cat:'Aço',nome:'Dobradeira de Barras',marca:'Nacional',norma:'ABNT NBR 6152',descricao:'Mesa de dobramento manual/hidráulica para barras CA-25 a CA-60 até Ø32 mm.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F057',cat:'Aço',nome:'Durômetro Rockwell/Brinell',marca:'EMCO / Instron',norma:'ABNT NBR ISO 6506',descricao:'Durômetro universal para medição de dureza de metais (HRB, HRC, HB).',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F058',cat:'Aço',nome:'Paquímetro e Micrômetro para Aço',marca:'Mitutoyo',norma:'ABNT NBR 6152',descricao:'Paquímetro digital 0,01 mm e micrômetro externo 0–25 mm para dimensionamento de barras e corpos de prova.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F059',cat:'Instrumentação',nome:'Piezômetro de Casagrande',marca:'Soil Instruments / SINCO',norma:'ANM 95/2022',descricao:'Piezômetro hidráulico aberto para medição de nível d\'água em barragens. Tubo PVC com seção filtrante e manômetro de Bourdon.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F060',cat:'Instrumentação',nome:'Piezômetro Elétrico (Corda Vibrante)',marca:'Geokon / Roctest',norma:'ANM 95/2022',descricao:'Piezômetro de corda vibrante, range 0–700 kPa, resolução 0,05% FS, temperatura integrada.',status:'ativo',patrimonio:'',calibracao:'6 meses'},
  {id:'F061',cat:'Instrumentação',nome:'Inclinômetro de Torpedo',marca:'SINCO / Slope Indicator',norma:'ANM 95/2022',descricao:'Sonda inclinométrica bidirecional com acelerômetro MEMS, resolução 0,001°, para monitoramento de deslocamentos laterais.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F062',cat:'Instrumentação',nome:'Marco Superficial de Recalque',marca:'Nacional',norma:'ANM 95/2022',descricao:'Marco de concreto ou PVC enterrado para monitoramento topográfico de recalques na crista da barragem.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F063',cat:'Instrumentação',nome:'Régua Linimétrica (Medidor de Nível)',marca:'Nacional',norma:'ANM 95/2022',descricao:'Régua graduada instalada no reservatório para leitura do nível d\'água.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F064',cat:'Instrumentação',nome:'Leitora de Instrumentos (Datalogger)',marca:'Geokon / Campbell Scientific',norma:'—',descricao:'Leitora portátil GK-403 ou datalogger automático para leitura de piezômetros e extensômetros de corda vibrante.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F065',cat:'Instrumentação',nome:'Extensômetro de Fio (Settlement Gauge)',marca:'Geokon',norma:'ANM 95/2022',descricao:'Extensômetro de haste múltipla para monitoramento de recalques em profundidade.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F066',cat:'Umidade',nome:'Estufa de Secagem (105°C / 110°C)',marca:'FANEM / Quimis',norma:'ABNT NBR 6457',descricao:'Estufa 105±5 °C com ventilação forçada. Capacidade 40 L. Sonda Pt-100 externa rastreável.',status:'ativo',patrimonio:'',calibracao:'6 meses'},
  {id:'F067',cat:'Umidade',nome:'Medidor de Umidade por Micro-ondas',marca:'SPEEDY / CEM',norma:'—',descricao:'Determinador rápido de umidade por micro-ondas para solos e agregados. Resultado em 5 min.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F068',cat:'Umidade',nome:'Termohigrômetro com Datalogger',marca:'Hobo / Onset',norma:'ISO/IEC 17025',descricao:'Sensor T/UR com registro contínuo, certificado rastreável, para monitoramento da câmara de cura e laboratório.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F069',cat:'Topografia',nome:'Estação Total',marca:'Leica / Topcon / Trimble',norma:'—',descricao:'Estação total eletrônica (EDM + teodolito), precisão angular 2", precisão linear ±2 mm + 2 ppm. Para levantamentos e monitoramento geodésico.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F070',cat:'Topografia',nome:'Nível Óptico / Eletrônico',marca:'Leica / Trimble',norma:'—',descricao:'Nível automático ou eletrônico (digital) para levantamento de recalques e controle de cotas.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F071',cat:'Topografia',nome:'GPS RTK',marca:'Trimble / Leica',norma:'—',descricao:'Sistema GNSS de alta precisão (precisão planimétrica 1–2 cm) para mapeamento e monitoramento geodésico de barragens.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F072',cat:'Topografia',nome:'Trena de Fibra 50 m',marca:'Lufkin',norma:'—',descricao:'Trena de fibra de vidro graduada a cada 10 mm, para medições de campo.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F073',cat:'Lab Geral',nome:'pH-metro de Bancada',marca:'Tecnopon / Hanna',norma:'—',descricao:'pH-metro digital com eletrodo de vidro combinado, compensação automática de temperatura. Range 0–14 pH, ±0,01.',status:'ativo',patrimonio:'',calibracao:'6 meses'},
  {id:'F074',cat:'Lab Geral',nome:'Condutivímetro',marca:'Hanna',norma:'—',descricao:'Medidor de condutividade elétrica e TDS, para análise de água de percolação e lixiviado.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F075',cat:'Lab Geral',nome:'Dessecador com Sílica-Gel',marca:'Nacional',norma:'—',descricao:'Dessecador de vidro Ø300 mm para resfriar amostras sem absorção de umidade.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F076',cat:'Lab Geral',nome:'Placa Aquecedora / Manta Elétrica',marca:'Fisatom',norma:'—',descricao:'Placa aquecedora com agitação magnética para dissolução de defloculantes na granulometria.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F077',cat:'Lab Geral',nome:'Bomba de Vácuo',marca:'TE Instruments',norma:'—',descricao:'Bomba de vácuo de membrana para saturação de corpos de prova (adensamento, triaxial, permeabilidade).',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F078',cat:'Lab Geral',nome:'Cronômetro Digital',marca:'Kenko',norma:'—',descricao:'Cronômetro digital com laps, resolução 0,01 s, para controle de tempo nos ensaios de sedimentação.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F079',cat:'Lab Geral',nome:'Régua de Aço Inox 300 mm',marca:'Mitutoyo',norma:'—',descricao:'Régua de aço inox graduada a cada 0,5 mm, para verificação de dimensões de amostras.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F080',cat:'Lab Geral',nome:'Forno Mufla 1200 °C',marca:'Quimis',norma:'—',descricao:'Forno mufla para determinação do teor de matéria orgânica por ignição (perda ao fogo).',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F081',cat:'EPI',nome:'Óculos de Proteção',marca:'3M / Uvex',norma:'ABNT NBR 14626',descricao:'Óculos de proteção com absorção UV, lente policarbonato incolor. CA: obrigatório.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F082',cat:'EPI',nome:'Luvas de Nitrilo',marca:'Descarpack',norma:'—',descricao:'Luvas de nitrilo sem talco, descartáveis, tamanhos M, G, GG. Para manuseio de solo e produtos químicos.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F083',cat:'EPI',nome:'Protetor Auricular',marca:'3M / Silenta',norma:'NR-6',descricao:'Protetor auricular tipo plug (espuma) NRRsf ≥24 dB. Obrigatório em locais com >85 dB.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F084',cat:'EPI',nome:'Bota de Segurança',marca:'Bracol / Marluvas',norma:'ABNT NBR ISO 20345',descricao:'Bota com bico de aço e palmilha anti-perfurante, CA 44.892. Para uso em campo e ensaios com cargas.',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F085',cat:'EPI',nome:'Capacete ABA FULL',marca:'MSA / 3M',norma:'ABNT NBR 8221',descricao:'Capacete classe A, aba total, para proteção em campo (obras, sondagens, barragens).',status:'ativo',patrimonio:'',calibracao:''},
  {id:'F086',cat:'Aquisição de Dados',nome:'Sistema de Aquisição de Dados (DAQ)',marca:'National Instruments / HBM',norma:'—',descricao:'Módulo DAQ USB multicanal (8–32 canais) para leitura simultânea de transdutores analógicos (0–5V, 4–20mA) em ensaios automatizados.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F087',cat:'Aquisição de Dados',nome:'Transdutor LVDT (±25 mm)',marca:'Schaevitz / Solartron',norma:'—',descricao:'Transformador diferencial linear para medição de deslocamento em ensaios triaxial e adensamento. Resolução 1 μm.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F088',cat:'Aquisição de Dados',nome:'Célula de Carga 5 kN',marca:'HBM / Kyowa',norma:'—',descricao:'Célula de carga de compressão/tração, capacidade 5 kN, resolução 0,1 N, para ensaios de baixa carga.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F089',cat:'Aquisição de Dados',nome:'Transdutor de Pressão',marca:'Keller / Druck',norma:'—',descricao:'Transdutor piezoresistivo 0–700 kPa, saída 4–20 mA, para medição de pressão de célula e contrapressão no triaxial.',status:'ativo',patrimonio:'',calibracao:'12 meses'},
  {id:'F090',cat:'Aquisição de Dados',nome:'Conversor USB-Serial RS232/RS485',marca:'FTDI',norma:'—',descricao:'Conversor para comunicação com instrumentos seriais (balanças, prensas, piezômetros) via porta USB do computador.',status:'ativo',patrimonio:'',calibracao:''}
];

const CAT_CORES = {"Compactação": "#c8a84b", "Granulometria": "#16c55e", "Atterberg": "#00d4aa", "Triaxial": "#4ea8ff", "Adensamento": "#7ec820", "Permeabilidade": "#00b8d4", "Cisalhamento": "#a855f7", "Sondagem SPT": "#f97316", "CPT": "#f87171", "Concreto": "#8b6914", "Aço": "#94a3b8", "Instrumentação": "#e879f9", "Umidade": "#67e8f9", "Topografia": "#fbbf24", "Lab Geral": "#6b9e7a", "EPI": "#fb923c", "Aquisição de Dados": "#818cf8"};

const CAT_ICONS = {
  'Compactação':'🔨','Granulometria':'⚖','Atterberg':'🧪','Triaxial':'🔬',
  'Adensamento':'📐','Permeabilidade':'💧','Cisalhamento':'✂','Sondagem SPT':'🪛',
  'CPT':'📡','Concreto':'🏗','Aço':'⚙','Instrumentação':'📊',
  'Umidade':'🌡','Topografia':'🗺','Lab Geral':'🔭','EPI':'🦺','Aquisição de Dados':'💻',
};

function FerramentasPage(){
  const [busca,   setBusca]    = useState('');
  const [catFil,  setCatFil]   = useState('Todas');
  const [statusF, setStatusF]  = useState('todos');
  const [sel,     setSel]      = useState(null);
  const [showForm,setShowForm] = useState(false);
  const [lista,   setLista]    = useState(FERRAMENTAS_CATALOG);
  const [loadingF,setLoadingF] = useState(false);
  const [form,setForm]=useState({id:'',cat:'Compactação',nome:'',marca:'',norma:'',descricao:'',status:'ativo',patrimonio:'',calibracao:''});

  // ── Normaliza registro do banco para formato interno (cat, calibracao) ──
  const fromDB = (f) => ({
    ...f,
    cat:       f.categoria       || f.cat        || 'Lab Geral',
    calibracao:f.calibracao_prazo|| f.calibracao || '',
  });

  // ── Normaliza formato interno para colunas reais do banco ──
  const toDB = (item) => {
    const { cat, calibracao, ...rest } = item;
    return {
      ...rest,
      categoria:        cat        || 'Lab Geral',
      calibracao_prazo: calibracao || null,
    };
  };

  const salvarLista=(nl)=>setLista(nl);

  // Carregar do Supabase (quando disponível)
  useEffect(()=>{
    const sb=window._sgSb;
    if(!sb) return;
    setLoadingF(true);
    sb.from('ferramentas').select('*').order('id')
      .then(({data,error})=>{
        if(!error&&data?.length) setLista(data.map(fromDB));
      })
      .finally(()=>setLoadingF(false));
  },[]);

  const upsertFerramenta=async(item)=>{
    const sb=window._sgSb;
    if(!sb){salvarLista(lista.map(f=>f.id===item.id?item:f).concat(lista.find(f=>f.id===item.id)?[]:[item]));return;}
    const dbItem = toDB(item);
    const {error}=await sb.from('ferramentas').upsert(dbItem,{onConflict:'id'});
    if(!error){
      setLista(prev=>prev.find(f=>f.id===item.id)?prev.map(f=>f.id===item.id?item:f):[...prev,item]);
    } else {
      alert('Erro ao salvar: '+error.message);
    }
  };

  const deletarFerramenta=async(id)=>{
    const sb=window._sgSb;
    if(!sb){salvarLista(lista.filter(f=>f.id!==id));return;}
    const {error}=await sb.from('ferramentas').delete().eq('id',id);
    if(!error) setLista(prev=>prev.filter(f=>f.id!==id));
  };

  const cats = ['Todas',...new Set(FERRAMENTAS_CATALOG.map(f=>f.cat))];

  const filtradas = lista.filter(f=>{
    const q=busca.toLowerCase();
    const matchQ=!q||(f.nome+f.cat+f.marca+f.norma+f.descricao).toLowerCase().includes(q);
    const matchC=catFil==='Todas'||f.cat===catFil;
    const matchS=statusF==='todos'||f.status===statusF;
    return matchQ&&matchC&&matchS;
  });

  const resumo = ()=>{
    const total=lista.length;
    const ativo=lista.filter(f=>f.status==='ativo').length;
    const manut=lista.filter(f=>f.status==='manutencao').length;
    const inativo=lista.filter(f=>f.status==='inativo').length;
    const calibPend=lista.filter(f=>f.calibracao&&f.status==='ativo').length;
    return {total,ativo,manut,inativo,calibPend};
  };
  const R=resumo();

  const saveForm=async()=>{
    if(!form.nome.trim()){alert('Nome obrigatório');return;}
    const isNew=!form.id;
    const newId=isNew?'F'+String(Date.now()).slice(-6):form.id;
    const item={...form,id:newId};
    await upsertFerramenta(item);
    setSel(item);
    setShowForm(false);
  };

  const excluir=async(id)=>{if(!confirm('Excluir ferramenta?'))return;await deletarFerramenta(id);setSel(null);};

  const statusCor={ativo:'#16c55e',manutencao:'#c8a84b',inativo:'#f87171'};
  const statusLabel={ativo:'Ativo',manutencao:'Manutenção',inativo:'Inativo'};

  return(
    <div className="fade-in" style={{display:'grid',gap:14}}>

      {/* HEADER */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:8}}>
        <div>
          <div style={{fontSize:'clamp(16px,2.5vw,20px)',fontWeight:700}}>🧰 Ferramentas de Laboratório</div>
          <div style={{fontSize:11,color:C.textDim,marginTop:2}}>{R.total} equipamentos cadastrados · {R.ativo} ativos{loadingF&&' · carregando...'}</div>
        </div>
        <button className="btn-p" onClick={()=>{setForm({id:'',cat:'Compactação',nome:'',marca:'',norma:'',descricao:'',status:'ativo',patrimonio:'',calibracao:''});setShowForm(true);}}>
          + Nova Ferramenta
        </button>
      </div>
      <div style={{height:1,background:'linear-gradient(90deg,#16c55e,transparent)'}}/>

      {/* KPI RESUMO */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(130px,100%),1fr))',gap:10}}>
        {[
          {l:'Total',v:R.total,cor:'#16c55e'},
          {l:'Ativos',v:R.ativo,cor:'#16c55e'},
          {l:'Manutenção',v:R.manut,cor:'#c8a84b'},
          {l:'Inativos',v:R.inativo,cor:'#f87171'},
          {l:'Com Calibração',v:R.calibPend,cor:'#4ea8ff'},
        ].map((k,i)=>(
          <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 14px',
            position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${k.cor},transparent)`}}/>
            <div style={{fontSize:'clamp(20px,3vw,26px)',fontWeight:800,color:k.cor,fontFamily:"'JetBrains Mono',monospace"}}>{k.v}</div>
            <div style={{fontSize:9,color:C.textDim,marginTop:4,letterSpacing:.5}}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
        <input className="inp" value={busca} onChange={e=>setBusca(e.target.value)}
          placeholder="🔍 Buscar nome, norma, marca..."
          style={{flex:1,minWidth:180,padding:'8px 12px',fontSize:12}}/>
        <select className="inp" value={statusF} onChange={e=>setStatusF(e.target.value)}
          style={{padding:'8px 12px',fontSize:12}}>
          {['todos','ativo','manutencao','inativo'].map(s=><option key={s} value={s}>{s==='todos'?'Todos Status':statusLabel[s]||s}</option>)}
        </select>
      </div>

      {/* FILTRO CATEGORIAS */}
      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setCatFil(c)}
            style={{background:catFil===c?(CAT_CORES[c]||'#16c55e')+'22':'transparent',
              color:catFil===c?(CAT_CORES[c]||'#16c55e'):'#6b7a6e',
              border:`1px solid ${catFil===c?(CAT_CORES[c]||'#16c55e'):'#2a3a2f'}`,
              borderRadius:6,padding:'5px 10px',cursor:'pointer',fontSize:10,fontWeight:catFil===c?700:400,
              transition:'all .15s',fontFamily:"'Rajdhani',sans-serif",whiteSpace:'nowrap'}}>
            {c==='Todas'?'Todas':CAT_ICONS[c]+' '+c}
          </button>
        ))}
      </div>

      {/* GRID FERRAMENTAS + DETALHE */}
      <div style={{display:'grid',gridTemplateColumns:sel?'clamp(200px,30%,320px) minmax(0,1fr)':'1fr',gap:14,alignItems:'start'}}>

        {/* LISTA */}
        <div style={{display:'grid',gap:6,maxHeight:'min(65vh,600px)',overflowY:'auto',paddingRight:4,minHeight:120}}>
          {filtradas.length===0&&(
            <div style={{background:C.card,borderRadius:10,padding:28,textAlign:'center',color:C.textFaint,fontSize:11,
              border:`1px dashed ${C.border}`}}>Nenhuma ferramenta encontrada</div>
          )}
          {filtradas.map(f=>{
            const cor=CAT_CORES[f.cat]||'#16c55e';
            const sc=statusCor[f.status]||'#6b7a6e';
            const isS=sel?.id===f.id;
            return(
              <div key={f.id} onClick={()=>setSel(isS?null:f)}
                style={{background:isS?cor+'18':C.card,border:`1px solid ${isS?cor:C.border}`,
                  borderRadius:10,padding:'11px 14px',cursor:'pointer',transition:'all .15s',
                  borderLeft:isS?`3px solid ${cor}`:undefined}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:6}}>
                  <div style={{minWidth:0,flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {CAT_ICONS[f.cat]} {f.nome}
                    </div>
                    <div style={{fontSize:9,color:C.textDim,marginTop:2}}>
                      {f.marca} · {f.cat}
                    </div>
                  </div>
                  <div style={{flexShrink:0,textAlign:'right'}}>
                    <div style={{fontSize:9,fontWeight:700,color:sc,background:sc+'22',
                      borderRadius:4,padding:'2px 7px',letterSpacing:.5}}>{statusLabel[f.status]||f.status}</div>
                    {f.calibracao&&<div style={{fontSize:8,color:'#4ea8ff',marginTop:3}}>🔧 {f.calibracao}</div>}
                  </div>
                </div>
                {f.norma&&<div style={{fontSize:8,color:cor,marginTop:5,letterSpacing:.5}}>{f.norma}</div>}
              </div>
            );
          })}
        </div>

        {/* DETALHE */}
        {sel&&(
          <div className="fade-in" style={{background:C.card,border:`1px solid ${CAT_CORES[sel.cat]||C.border}`,
            borderRadius:12,padding:'clamp(14px,2vw,22px)',position:'sticky',top:70}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14,gap:8}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:'clamp(13px,2vw,16px)',fontWeight:800,lineHeight:1.2}}>{CAT_ICONS[sel.cat]} {sel.nome}</div>
                <div style={{fontSize:10,color:C.textDim,marginTop:3}}>{sel.id} · {sel.cat}</div>
              </div>
              <div style={{display:'flex',gap:6,flexShrink:0}}>
                <button className="btn-g" onClick={()=>{setForm({...sel});setShowForm(true);}} style={{fontSize:10,padding:'5px 10px'}}>✏ Editar</button>
                <button onClick={()=>excluir(sel.id)} style={{background:'#f8717122',border:'1px solid #f87171',borderRadius:6,padding:'5px 10px',cursor:'pointer',fontSize:10,color:'#f87171'}}>🗑</button>
                <button className="btn-g" onClick={()=>setSel(null)} style={{fontSize:10,padding:'5px 8px'}}>✕</button>
              </div>
            </div>

            <div style={{display:'grid',gap:8}}>
              {[
                {l:'Marca / Referência',v:sel.marca||'—'},
                {l:'Norma Aplicável',   v:sel.norma||'—'},
                {l:'Nº Patrimônio',     v:sel.patrimonio||'—'},
                {l:'Prazo Calibração',  v:sel.calibracao||'Não aplicável'},
                {l:'Status',            v:statusLabel[sel.status]||sel.status,cor:statusCor[sel.status]},
              ].map((r,i)=>(
                <div key={i} style={{background:'#101f14',borderRadius:8,padding:'9px 12px',
                  display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
                  <span style={{fontSize:9,color:C.textDim,letterSpacing:.5}}>{r.l}</span>
                  <span style={{fontSize:11,fontWeight:600,color:r.cor||C.text,textAlign:'right'}}>{r.v}</span>
                </div>
              ))}
              <div style={{background:'#101f14',borderRadius:8,padding:'10px 12px'}}>
                <div style={{fontSize:9,color:C.textDim,letterSpacing:.5,marginBottom:5}}>DESCRIÇÃO</div>
                <div style={{fontSize:11,color:C.text,lineHeight:1.7}}>{sel.descricao||'—'}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL FORM */}
      {showForm&&(
        <Modal title={form.id?'Editar Ferramenta':'Nova Ferramenta'} onClose={()=>setShowForm(false)}>
          <div style={{display:'grid',gap:12}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div>
                <label className="lbl">Categoria</label>
                <select className="inp" value={form.cat} onChange={e=>setForm(x=>({...x,cat:e.target.value}))} style={{padding:'8px 10px'}}>
                  {Object.keys(CAT_ICONS).map(c=><option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Status</label>
                <select className="inp" value={form.status} onChange={e=>setForm(x=>({...x,status:e.target.value}))} style={{padding:'8px 10px'}}>
                  {['ativo','manutencao','inativo'].map(s=><option key={s} value={s}>{statusLabel[s]}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="lbl">Nome *</label>
              <input className="inp" value={form.nome} onChange={e=>setForm(x=>({...x,nome:e.target.value}))} placeholder="Ex: Prensa CBR 50 kN"/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div>
                <label className="lbl">Marca / Referência</label>
                <input className="inp" value={form.marca} onChange={e=>setForm(x=>({...x,marca:e.target.value}))} placeholder="Contenco / Controls"/>
              </div>
              <div>
                <label className="lbl">Norma</label>
                <input className="inp" value={form.norma} onChange={e=>setForm(x=>({...x,norma:e.target.value}))} placeholder="ABNT NBR 9895"/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div>
                <label className="lbl">Nº Patrimônio</label>
                <input className="inp" value={form.patrimonio} onChange={e=>setForm(x=>({...x,patrimonio:e.target.value}))} placeholder="PAT-0001"/>
              </div>
              <div>
                <label className="lbl">Prazo Calibração</label>
                <input className="inp" value={form.calibracao} onChange={e=>setForm(x=>({...x,calibracao:e.target.value}))} placeholder="6 meses / 12 meses"/>
              </div>
            </div>
            <div>
              <label className="lbl">Descrição</label>
              <textarea className="inp" rows="3" value={form.descricao}
                onChange={e=>setForm(x=>({...x,descricao:e.target.value}))}
                placeholder="Especificações técnicas, capacidade, resolução..."/>
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button className="btn-g" onClick={()=>setShowForm(false)}>Cancelar</button>
              <button className="btn-p" onClick={saveForm}>{form.id?'Salvar Alterações':'Cadastrar Ferramenta'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}


function DiefraIconSVG({ size = 80, accent = "#16c55e" }) {
  const teal  = "#0d7a5f";
  const lime  = "#8dc63f";
  const white = "#ffffff";
  const glow  = accent + "55";
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink:0, filter:`drop-shadow(0 0 ${size/5}px ${glow})` }}>

      {/* ── Folha/swoosh externa — CONTORNO apenas, verde-limão ── */}
      <path
        d="M100 15 C58 15 22 48 22 90 C22 118 36 140 58 154 C68 160 78 165 86 172 C90 175 94 178 100 185 C100 178 106 175 114 172 C122 165 132 160 142 154 C164 140 178 118 178 90 C178 48 142 15 100 15Z"
        fill="none" stroke={lime} strokeWidth="5" opacity="0.9"/>

      {/* ── Petala/swoosh saindo para cima-direita ── */}
      <path
        d="M130 22 C148 10 168 12 178 30 C162 26 148 28 140 40 C132 30 130 22 130 22Z"
        fill={lime} opacity="0.85"/>

      {/* ── Forma interna teal — balão de fala arredondado ── */}
      <path
        d="M100 30 C72 30 50 52 50 80 C50 100 60 116 76 125 C82 129 88 132 94 138 C96 141 98 143 100 148 C102 143 104 141 106 138 C112 132 118 129 124 125 C140 116 150 100 150 80 C150 52 128 30 100 30Z"
        fill={teal}/>

      {/* ── Reflexo sutil no teal ── */}
      <path d="M68 48 C62 58 60 70 62 81 C64 90 70 97 78 103 C72 96 68 87 68 78 C68 68 68 57 68 48Z"
        fill={white} opacity="0.10"/>

      {/* ── Folhinha verde-limão no canto inferior-direito do balão ── */}
      <path
        d="M128 122 C136 114 148 116 152 126 C144 124 136 126 132 134 C128 128 128 122 128 122Z"
        fill={lime} opacity="0.9"/>

      {/* ── Texto SGE ── */}
      <text x="100" y="96"
        textAnchor="middle" dominantBaseline="middle"
        fontSize="42" fontWeight="900"
        fontFamily="'Rajdhani','Arial Black','Helvetica Neue',sans-serif"
        fill={white} letterSpacing="2">SGE</text>

    </svg>
  );
}

// Versão grande para login / splash
function DiefraLogoFull({ accent = "#16c55e", subtitle = "Sistema de Gestão de Ensaios" }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
      <DiefraIconSVG size={130} accent={accent}/>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:15, color:"#0d7a5f", letterSpacing:3, fontWeight:600,
          fontFamily:"'Rajdhani',sans-serif", marginBottom:4 }}>
          Sistema de Gestão de Ensaios
        </div>
        <div style={{ fontSize:26, fontWeight:900, color:"#0d7a5f",
          fontFamily:"'Rajdhani',sans-serif", letterSpacing:6, lineHeight:1 }}>
          DIEFRA
        </div>
      </div>
    </div>
  );
}

function LogoEditor({logo,onSave,onClose}){
  const [v,setV]=useState({...logo});
  const presets=[{icon:"🏔"},{icon:"⛰"},{icon:"🌿"},{icon:"🔬"},{icon:"⚗"},{icon:"📊"},{icon:"🛡"},{icon:"⚙"},{icon:"🌍"},{icon:"💎"}];
  const colors=[C.emerald,"#00d4aa","#00b8d4","#7fff5a","#c8a84b","#4ea8ff","#a855f7"];
  return (
    <Modal title={t("configIdentity")} onClose={onClose}>
      <div style={{display:"grid",gap:18}}>
        <div>
          <label className="lbl">{t("logoIcon")}</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
            {presets.map(p=>(
              <button key={p.icon} onClick={()=>setV(x=>({...x,icon:p.icon}))}
                style={{background:v.icon===p.icon?C.emerald+"33":C.surface,border:`1px solid ${v.icon===p.icon?C.emerald:C.border}`,borderRadius:8,padding:"7px 11px",cursor:"pointer",fontSize:20}}>
                {p.icon}
              </button>
            ))}
          </div>
          <input className="inp" value={v.icon} onChange={e=>setV(x=>({...x,icon:e.target.value}))} placeholder="Ou cole qualquer emoji..."/>
        </div>
        <div>
          <label className="lbl">{t("systemName")}</label>
          <input className="inp" value={v.name} onChange={e=>setV(x=>({...x,name:e.target.value}))}/>
        </div>
        <div>
          <label className="lbl">{t("subtitle")}</label>
          <input className="inp" value={v.subtitle} onChange={e=>setV(x=>({...x,subtitle:e.target.value}))}/>
        </div>
        <div>
          <label className="lbl">{t("accentColor")}</label>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            {colors.map(cl=>(
              <button key={cl} onClick={()=>setV(x=>({...x,accent:cl}))}
                style={{width:28,height:28,borderRadius:"50%",background:cl,border:`2px solid ${v.accent===cl?"#fff":cl}`,cursor:"pointer",boxShadow:v.accent===cl?`0 0 10px ${cl}`:""}}/>
            ))}
            <input type="color" value={v.accent} onChange={e=>setV(x=>({...x,accent:e.target.value}))}
              style={{width:32,height:28,borderRadius:6,border:`1px solid ${C.border}`,background:"none",cursor:"pointer"}}/>
          </div>
        </div>
        <div style={{background:C.surface,borderRadius:10,padding:16,textAlign:"center"}}>
          <div style={{fontSize:10,color:C.textDim,marginBottom:10,letterSpacing:1}}>{t("preview")}</div>
          <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center"}}>
            <span style={{fontSize:28}}>{v.icon}</span>
            <div>
              <div style={{fontWeight:700,color:v.accent,letterSpacing:4,fontFamily:"'Rajdhani',sans-serif",fontSize:18}}>{v.name}</div>
              <div style={{fontSize:9,color:C.textDim,letterSpacing:1}}>{v.subtitle}</div>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",flexWrap:"wrap"}}>
          <button className="btn-g" onClick={onClose}>{t("cancel")}</button>
          <button className="btn-p" onClick={()=>{onSave(v);onClose();}}>{t("saveIdentity")}</button>
        </div>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════
//  CONFIG SCREEN
// ══════════════════════════════════════════════════════════════
function ConfigScreen({onConnect,logo}){
  const [url,setUrl]=useState("");
  const [key,setKey]=useState("");
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");

  const connect=async()=>{
    if(!url||!key){setErr(t("errFillUrlKey"));return;}
    setLoading(true);setErr("");
    try{
      // Testa conexão antes de prosseguir
      const cl=createClient(url.trim(),key.trim());
      const {error}=await cl.from("laboratorios").select("id").limit(1);
      if(error){setErr(t("errConnFailed")+error.message);setLoading(false);return;}
      // Passa url e key (strings) para doConnect
      onConnect(url.trim(), key.trim());
    }catch(e){setErr(t("errGeneric")+e.message);setLoading(false);}
  };

  return (
    <div className="hbg" style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
      <style>{CSS}</style>
      <div style={{width:"100%",maxWidth:520}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <DiefraLogoFull accent={logo.accent} subtitle={logo.subtitle}/>
          <div style={{height:1,background:`linear-gradient(90deg,transparent,${logo.accent},transparent)`,margin:"16px auto",width:"70%"}}/>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            {["ISO/IEC 17025","ANM 95/2022","NBR 11682"].map(n=>(
              <span key={n} style={{fontSize:9,color:C.textFaint,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 8px",letterSpacing:1}}>{n}</span>
            ))}
          </div>
        </div>
        <Card style={{marginBottom:14,boxShadow:`0 0 40px ${C.glowG}`}}>
          <div style={{fontSize:10,color:C.textDim,letterSpacing:2,marginBottom:18}}>{t("configTitle")}</div>
          <div style={{marginBottom:14}}>
            <label className="lbl">{t("projectUrl")}</label>
            <input className="inp" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://xxxxxxxxxxxx.supabase.co" onKeyDown={e=>e.key==="Enter"&&connect()}/>
          </div>
          <div style={{marginBottom:18}}>
            <label className="lbl">{t("anonKey")}</label>
            <input className="inp" type="password" value={key} onChange={e=>setKey(e.target.value)} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." onKeyDown={e=>e.key==="Enter"&&connect()}/>
          </div>
          {err&&<div style={{background:C.red+"22",border:`1px solid ${C.red}`,borderRadius:8,padding:"10px 14px",color:C.red,fontSize:11,marginBottom:14}}>⚠ {err}</div>}
          <button className="btn-p" onClick={connect} disabled={loading||!url||!key} style={{width:"100%",padding:"13px",fontSize:13}}>
            {loading?t("connecting"):t("connect")}
          </button>
        </Card>
        <Card>
          <div style={{fontSize:11,color:logo.accent,marginBottom:12,letterSpacing:2}}>{t("credentialsTitle")}</div>
          {[[t("step1a"),t("step1b")],[t("step2a"),t("step2b")],[t("step3a"),t("step3b")],[t("step4a"),t("step4b")],[t("step5a"),t("step5b")]].map(([a,b],i)=>(
            <div key={i} style={{display:"flex",gap:10,marginBottom:8,fontSize:12}}>
              <span style={{background:logo.accent,color:"#000",borderRadius:4,padding:"1px 7px",fontWeight:700,fontSize:10,flexShrink:0,minWidth:20,textAlign:"center"}}>{i+1}</span>
              <span><strong style={{color:C.text}}>{a}</strong> <span style={{color:C.textDim}}>{b}</span></span>
            </div>
          ))}
        </Card>
        <div style={{textAlign:"center",marginTop:10,fontSize:9,color:C.textFaint,letterSpacing:1}}>
          {LANG.toUpperCase()} · SUPABASE POSTGRESQL · REALTIME WEBSOCKET
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════════════════════════
function LoginScreen({supabase,onLogin,logo}){
  const white = "#ffffff";
  const [email,setEmail]=useState("");
  const [senha,setSenha]=useState("");
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const [modo,setModo]=useState("login");

  const auth=async()=>{
    if(!email||!senha){setErr(t("errFillEmailPwd"));return;}
    setLoading(true);setErr("");
    try{
      const r=modo==="login"
        ?await supabase.auth.signInWithPassword({email:email.trim(),password:senha})
        :await supabase.auth.signUp({email:email.trim(),password:senha});
      if(r.error){
        // Traduz erros comuns do Supabase
        const msg = r.error.message;
        if(msg.includes("Invalid login")) setErr("E-mail ou senha incorretos.");
        else if(msg.includes("Email not confirmed")) setErr("Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.");
        else if(msg.includes("User not found")) setErr("Usuário não encontrado.");
        else setErr(msg);
      } else {
        const session = r.data?.session;
        const user    = r.data?.user;
        if(!user){ setErr("Erro ao autenticar. Tente novamente."); setLoading(false); return; }
        onLogin(supabase, session ?? { user });
      }
    }catch(e){setErr(e.message);}
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:"100vh", background:C.bg,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:16, fontFamily:"'Rajdhani',sans-serif",
    }}>
      <style>{CSS}</style>

      {/* card único centralizado */}
      <div style={{
        width:"100%", maxWidth:380,
        background:C.card,
        border:`1px solid ${"#0d7a5f"}55`,
        borderRadius:16,
        padding:"28px 28px 22px",
        boxShadow:`0 0 60px ${"#0d7a5f"}30`,
      }}>

        {/* ── Logo compacto ── */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,marginBottom:20}}>
          <DiefraIconSVG size={72} accent={logo.accent}/>
          <div style={{textAlign:"center",lineHeight:1.3}}>
            <div style={{fontSize:11,color:"#0d7a5f",letterSpacing:3,fontWeight:600}}>Sistema de Gestão de Ensaios</div>
            <div style={{fontSize:22,fontWeight:900,color:"#0d7a5f",letterSpacing:5}}>DIEFRA</div>
          </div>
          <div style={{height:1,width:"80%",background:`linear-gradient(90deg,transparent,${"#0d7a5f"}60,transparent)`}}/>
        </div>

        {/* Toggle */}
        <div style={{display:"flex",marginBottom:16,background:C.bg,borderRadius:8,padding:3,border:`1px solid ${C.border}`}}>
          {[["login",t("login")],["cadastro",t("newUser")]].map(([m,l])=>(
            <button key={m} onClick={()=>setModo(m)}
              style={{flex:1,background:modo===m?"#0d7a5f":"transparent",color:modo===m?"#fff":C.textDim,
                border:"none",borderRadius:6,padding:"8px",fontSize:12,cursor:"pointer",
                fontWeight:700,transition:"all .18s",letterSpacing:2,fontFamily:"'Rajdhani',sans-serif"}}>
              {l}
            </button>
          ))}
        </div>

        {/* Email */}
        <div style={{marginBottom:12}}>
          <label style={{fontSize:10,color:C.textDim,letterSpacing:2,display:"block",marginBottom:5}}>EMAIL</label>
          <input className="inp" type="email" value={email} onChange={e=>setEmail(e.target.value)}
            placeholder="seu@diefra.com.br" autoFocus
            style={{width:"100%",boxSizing:"border-box",padding:"10px 13px",fontSize:13,
              background:"#0a1f14",border:`1px solid ${"#0d7a5f"}55`,borderRadius:8,color:C.text,
              outline:"none",fontFamily:"'Rajdhani',sans-serif"}}/>
        </div>

        {/* Senha */}
        <div style={{marginBottom:18}}>
          <label style={{fontSize:10,color:C.textDim,letterSpacing:2,display:"block",marginBottom:5}}>SENHA</label>
          <input className="inp" type="password" value={senha} onChange={e=>setSenha(e.target.value)}
            placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&auth()}
            style={{width:"100%",boxSizing:"border-box",padding:"10px 13px",fontSize:13,
              background:"#0a1f14",border:`1px solid ${"#0d7a5f"}55`,borderRadius:8,color:C.text,
              outline:"none",fontFamily:"'Rajdhani',sans-serif"}}/>
        </div>

        {err&&<div style={{background:C.red+"22",border:`1px solid ${C.red}`,borderRadius:8,
          padding:"8px 12px",color:C.red,fontSize:11,marginBottom:14}}>⚠ {err}</div>}

        <button onClick={auth} disabled={loading}
          style={{width:"100%",padding:"12px",fontSize:13,fontWeight:800,letterSpacing:3,
            background:"#0d7a5f",color:"#fff",border:"none",borderRadius:8,
            cursor:loading?"not-allowed":"pointer",fontFamily:"'Rajdhani',sans-serif",
            transition:"all .2s",opacity:loading?0.65:1,
            boxShadow:`0 4px 18px ${"#0d7a5f"}50`}}>
          {loading ? "AGUARDE..." : modo==="login" ? "ENTRAR" : "CRIAR CONTA"}
        </button>

        <div style={{textAlign:"center",marginTop:14,fontSize:8,color:"#0d7a5f55",letterSpacing:2}}>
          ISO/IEC 17025 · ANM 95/2022 · NBR 11682
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MOTOR DE CÁLCULOS GEOTÉCNICOS — ABNT/ASTM
//  Entrada via Serial (Web Serial API) ou teclado
// ══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════
//  MOTOR DE CÁLCULOS GEOTÉCNICOS — ABNT/ASTM
// ══════════════════════════════════════════════════════════════

// ── Granulometria NBR 7181 ───────────────────────────────────
function calcGranulometria(peneiras, massaTotal) {
  // peneiras: [{abertura_mm, nome, massaRetida_g}]  ordenadas > para <
  const sorted = [...peneiras].sort((a,b)=>b.abertura_mm - a.abertura_mm);
  let acum = 0;
  const rows = sorted.map(p => {
    const retida = parseFloat(p.massaRetida_g)||0;
    const pct_retida = massaTotal>0 ? (retida/massaTotal)*100 : 0;
    acum += pct_retida;
    return { ...p, massaRetida_g:retida, pct_retida, pct_retida_acum:acum, pct_passante:100-acum };
  });
  // D10, D30, D60 por interpolação log-linear
  const getDx = (x) => {
    for(let i=0;i<rows.length-1;i++){
      const r1=rows[i], r2=rows[i+1];
      if(r1.pct_passante>=x && r2.pct_passante<=x){
        const t=(x-r2.pct_passante)/(r1.pct_passante-r2.pct_passante);
        return Math.pow(10, Math.log10(r2.abertura_mm)+t*(Math.log10(r1.abertura_mm)-Math.log10(r2.abertura_mm)));
      }
    }
    return null;
  };
  const D10=getDx(10), D30=getDx(30), D60=getDx(60);
  const Cu = D10&&D60 ? D60/D10 : null;
  const Cc = D10&&D30&&D60 ? (D30*D30)/(D60*D10) : null;
  // Classificação simplificada SUCS
  const pct_finos = rows.find(r=>r.abertura_mm<=0.075)?.pct_passante ?? 0;
  const pct_areia = (rows.find(r=>r.abertura_mm<=4.75)?.pct_passante??0) - pct_finos;
  let sucs = pct_finos>50 ? (pct_finos>70?"CH/MH":"CL/ML") :
             pct_areia>45 ? (Cu&&Cu>=6&&Cc&&Cc>=1&&Cc<=3?"SW":"SP") :
             (Cu&&Cu>=4?"GW":"GP");
  return { rows, D10, D30, D60, Cu, Cc, sucs, pct_finos, pct_areia };
}

// ── Compactação Proctor NBR 7182 ─────────────────────────────
function calcProctor(pontos, Gs=2.67) {
  // pontos: [{umidade_pct, massa_umido_g, volume_molde_cm3}]
  const rows = pontos.map(p => {
    const w = parseFloat(p.umidade_pct)/100;
    const ro_ap = parseFloat(p.massa_umido_g)/parseFloat(p.volume_molde_cm3);
    const ro_d = ro_ap/(1+w);
    return { ...p, w_pct:parseFloat(p.umidade_pct), ro_ap, ro_d };
  }).filter(r=>!isNaN(r.ro_d));
  if(rows.length<3) return { rows, wOtimo:null, rodMax:null };
  // Ajuste polinomial grau 2: rod = a*w² + b*w + c
  const n=rows.length, sw=rows.reduce((s,r)=>s+r.w_pct,0), sw2=rows.reduce((s,r)=>s+r.w_pct**2,0),
        sw3=rows.reduce((s,r)=>s+r.w_pct**3,0), sw4=rows.reduce((s,r)=>s+r.w_pct**4,0),
        sy=rows.reduce((s,r)=>s+r.ro_d,0), swy=rows.reduce((s,r)=>s+r.w_pct*r.ro_d,0),
        sw2y=rows.reduce((s,r)=>s+r.w_pct**2*r.ro_d,0);
  const A=[[sw4,sw3,sw2],[sw3,sw2,sw],[sw2,sw,n]];
  const B=[sw2y,swy,sy];
  // Gauss elimination 3x3
  for(let i=0;i<3;i++){
    for(let j=i+1;j<3;j++){
      const f=A[j][i]/A[i][i];
      for(let k=i;k<3;k++) A[j][k]-=f*A[i][k];
      B[j]-=f*B[i];
    }
  }
  const c2=B[2]/A[2][2], c1=(B[1]-A[1][2]*c2)/A[1][1], c0=(B[0]-A[0][1]*c1-A[0][2]*c2)/A[0][0];
  const wOtimo = -c1/(2*c0);
  const rodMax = c0*wOtimo**2 + c1*wOtimo + c2;
  // Curva de saturação: rod_sat = Gs*1/(1+Gs*w/100)
  const wRange = Array.from({length:30},(_,i)=>rows[0].w_pct-2 + i*(rows[rows.length-1].w_pct-rows[0].w_pct+4)/29);
  const curvaSat = wRange.map(w=>({ w, rod: Gs/(1+Gs*w/100) }));
  const curvaFit = wRange.map(w=>({ w, rod: c0*w**2+c1*w+c2 }));
  return { rows, wOtimo, rodMax, c0, c1, c2, curvaSat, curvaFit, Gs };
}

// ── Hilf (Método Rápido) — DNER ME 162/94 / DNIT ────────────
// Compacta solo na umidade natural; adiciona/retira água Δm
// sem secar as amostras entre pontos.
//
// Entrada por ponto:
//   massa_umida_g      — massa do solo ÚMIDO no molde (g)
//   volume_molde_cm3   — volume do molde (cm³)
//   delta_agua_g       — água adicionada (+) ou retirada (-) (g)
//                        0 = ponto na umidade natural
// Parâmetros globais:
//   w_nat_pct          — umidade natural do solo (%)
//   Gs                 — densidade real dos grãos
//
function calcHilf(pontos, w_nat_pct, Gs=2.67) {
  const wn = parseFloat(w_nat_pct)/100;
  if(isNaN(wn)) return { rows:[], wOtimo:null, rodMax:null };

  const rows = pontos.map(p => {
    const Mu  = parseFloat(p.massa_umida_g);
    const V   = parseFloat(p.volume_molde_cm3);
    const dw  = parseFloat(p.delta_agua_g)||0;
    if(isNaN(Mu)||isNaN(V)||V<=0) return null;

    // Massa de solo seco no molde
    const Md  = Mu / (1 + wn);
    // Umidade corrigida com acréscimo de água
    const w_i = ((Mu - Md + dw) / Md);           // fração decimal
    const w_pct = w_i * 100;
    // Massa úmida real após adicionar água
    const Mu_real = Md * (1 + w_i);
    // Densidade aparente e seca
    const ro_ap = Mu_real / V;
    const ro_d  = ro_ap / (1 + w_i);
    return { ...p, w_pct, ro_ap, ro_d, Md, delta_agua_g: dw };
  }).filter(Boolean).filter(r=>!isNaN(r.ro_d)&&r.ro_d>0);

  if(rows.length<3) return { rows, wOtimo:null, rodMax:null };

  // Ajuste parabólico grau 2 (mesmo método Proctor)
  const n=rows.length,
    sw =rows.reduce((s,r)=>s+r.w_pct,0),
    sw2=rows.reduce((s,r)=>s+r.w_pct**2,0),
    sw3=rows.reduce((s,r)=>s+r.w_pct**3,0),
    sw4=rows.reduce((s,r)=>s+r.w_pct**4,0),
    sy =rows.reduce((s,r)=>s+r.ro_d,0),
    swy=rows.reduce((s,r)=>s+r.w_pct*r.ro_d,0),
    sw2y=rows.reduce((s,r)=>s+r.w_pct**2*r.ro_d,0);

  const A=[[sw4,sw3,sw2],[sw3,sw2,sw],[sw2,sw,n]];
  const B=[sw2y,swy,sy];
  for(let i=0;i<3;i++){
    for(let j=i+1;j<3;j++){
      const f=A[j][i]/A[i][i];
      for(let k=i;k<3;k++) A[j][k]-=f*A[i][k];
      B[j]-=f*B[i];
    }
  }
  const c2=B[2]/A[2][2],
        c1=(B[1]-A[1][2]*c2)/A[1][1],
        c0=(B[0]-A[0][1]*c1-A[0][2]*c2)/A[0][0];

  const wOtimo  = -c1/(2*c0);
  const rodMax  = c0*wOtimo**2 + c1*wOtimo + c2;

  const wMin = Math.min(...rows.map(r=>r.w_pct)) - 1.5;
  const wMax = Math.max(...rows.map(r=>r.w_pct)) + 1.5;
  const wRange = Array.from({length:40},(_,i)=>wMin+i*(wMax-wMin)/39);
  const curvaSat = wRange.map(w=>({ w, rod: Gs/(1+Gs*w/100) }));
  const curvaFit = wRange.map(w=>({ w, rod: c0*w**2+c1*w+c2 }));

  return { rows, wOtimo, rodMax, c0, c1, c2, curvaSat, curvaFit, Gs, w_nat_pct };
}


// ── CBR / ISC NBR 9895 ───────────────────────────────────────
function calcCBR(leituras, constante_anel_kN_div=0.05) {
  // leituras: [{penetracao_mm, leitura_anel_div}]
  // Penetrações padrão: 0,0.64,1.27,1.91,2.54,3.18,3.81,4.44,5.08,6.35,7.62,10.16
  const AREA_CM2 = 19.35; // pistão padrão 3 pol²
  const P_PADRAO_254 = 13.24; // kN (6895 kPa × 19.35 cm²/1000/10)
  const P_PADRAO_508 = 19.96; // kN
  const rows = leituras.map(l => {
    const pen = parseFloat(l.penetracao_mm);
    const carga_kN = parseFloat(l.leitura_anel_div) * constante_anel_kN_div;
    const pressao_kPa = carga_kN / AREA_CM2 * 1000 / 10;
    return { pen, leitura: parseFloat(l.leitura_anel_div), carga_kN, pressao_kPa };
  }).filter(r=>!isNaN(r.pen)).sort((a,b)=>a.pen-b.pen);
  // Correção da curva se início não zero
  const getP = (pen) => {
    const r=rows.find(r=>Math.abs(r.pen-pen)<0.1);
    if(r) return r.pressao_kPa;
    if(rows.length<2) return 0;
    for(let i=0;i<rows.length-1;i++){
      if(rows[i].pen<=pen && rows[i+1].pen>=pen){
        const t=(pen-rows[i].pen)/(rows[i+1].pen-rows[i].pen);
        return rows[i].pressao_kPa + t*(rows[i+1].pressao_kPa-rows[i].pressao_kPa);
      }
    }
    return 0;
  };
  const p254 = getP(2.54);
  const p508 = getP(5.08);
  const ISC_254 = (p254 / 6895) * 100;
  const ISC_508 = (p508 / 10342) * 100;
  const ISC = Math.max(ISC_254, ISC_508);
  const expansao = null; // calculado separadamente por leitura de expansão
  return { rows, p254, p508, ISC_254, ISC_508, ISC, constante_anel_kN_div };
}

// ── Compressão Concreto NBR 5739 / NBR 12655 ─────────────────
function calcCompressaoConcreto(corpos) {
  // corpos: [{id, diametro_cm, altura_cm, carga_kN, idade_dias}]
  const rows = corpos.map(cp => {
    const d=parseFloat(cp.diametro_cm), h=parseFloat(cp.altura_cm), F=parseFloat(cp.carga_kN);
    const area_cm2 = Math.PI*(d/2)**2;
    const fc_MPa = (F*1000)/(area_cm2*100); // kN → N, cm² → mm²: ×1000/100 = ×10
    const fator_esbeltez = h/d;
    const fc_corrigido = fc_MPa * (fator_esbeltez<1.75 ? 0.87 : fator_esbeltez<1.94 ? 0.92 : 1.0);
    return { ...cp, area_cm2, fc_MPa, fc_corrigido, fator_esbeltez };
  }).filter(r=>!isNaN(r.fc_MPa));
  if(!rows.length) return {rows, fcm:0, fck_est:0, s:0};
  const fcm = rows.reduce((s,r)=>s+r.fc_corrigido,0)/rows.length;
  const s = rows.length>1 ? Math.sqrt(rows.reduce((s,r)=>s+(r.fc_corrigido-fcm)**2,0)/(rows.length-1)) : 0;
  const fck_est = fcm - 1.65*s; // NBR 12655 método A
  const delta_fck = fck_est - rows.reduce((mn,r)=>Math.min(mn,r.fc_corrigido),Infinity);
  return { rows, fcm, fck_est, s, delta_fck };
}

// ── Triaxial CU/CD NBR 12007 — Círculos de Mohr ─────────────
function calcTriaxial(ensaios) {
  // ensaios: [{sigma3_kPa, delta_sigma_kPa}] — mín. 3 pontos
  const rows = ensaios.map(e => {
    const s3=parseFloat(e.sigma3_kPa), ds=parseFloat(e.delta_sigma_kPa);
    const s1=s3+ds;
    const centro=(s1+s3)/2, raio=(s1-s3)/2;
    return { s3, ds, s1, centro, raio };
  }).filter(r=>!isNaN(r.s3)&&!isNaN(r.s1));
  if(rows.length<2) return { rows, c:0, phi:0, R2:0 };
  // Método Kf: p=(s1+s3)/2, q=(s1-s3)/2 → q=a+p·tanα → sinφ=tanα, c=a/cosφ
  const ps=rows.map(r=>r.centro), qs=rows.map(r=>r.raio);
  const n=ps.length, sp=ps.reduce((s,v)=>s+v,0), sq=qs.reduce((s,v)=>s+v,0);
  const spp=ps.reduce((s,v)=>s+v*v,0), spq=ps.reduce((s,v,i)=>s+v*qs[i],0);
  const tanA=(n*spq-sp*sq)/(n*spp-sp*sp);
  const a=(sq-tanA*sp)/n;
  const phi_rad=Math.asin(tanA); const phi=phi_rad*180/Math.PI;
  const c = Math.abs(tanA)<0.999 ? a/Math.cos(phi_rad) : 0;
  const R2=1-(qs.reduce((s,v,i)=>s+(v-(a+tanA*ps[i]))**2,0)/qs.reduce((s,v)=>s+(v-sq/n)**2,0));
  // Envoltória de Ruptura: τ = c + σ·tan(φ)
  const sigRange=Array.from({length:50},(_,i)=>i*(rows[rows.length-1].s1*1.1)/49);
  const envelope=sigRange.map(sig=>({ sig, tau: c+sig*Math.tan(phi_rad) }));
  return { rows, c, phi, phi_rad, tanA, a, R2, envelope };
}

const CALC_ENGINE = { calcGranulometria, calcProctor, calcCBR, calcCompressaoConcreto, calcTriaxial };



// ══════════════════════════════════════════════════════════════
//  HELPER — captura leitura do instrumento serial conectado
// ══════════════════════════════════════════════════════════════
function BtnSerial({ onCapture, label }) {
  const [flash, setFlash] = useState(false);
  const capturar = () => {
    const leit = window._sgSerialLeit;
    if (!leit) { alert("Nenhum instrumento serial conectado.\nVá em 🔌 Instrumentos, selecione e conecte o equipamento."); return; }
    const val = typeof leit.valor === "number" ? leit.valor : parseFloat(leit.valor);
    if (isNaN(val)) { alert("Leitura inválida do instrumento: " + leit.raw); return; }
    onCapture(val);
    setFlash(true); setTimeout(() => setFlash(false), 800);
  };
  return (
    <button onClick={capturar}
      title={window._sgSerialLeit ? "Capturar leitura do instrumento conectado" : "Nenhum instrumento conectado — acesse 🔌 Instrumentos"}
      style={{ background: flash ? C.emerald+"44" : window._sgSerialLeit ? C.surface : C.bg,
        border: `1px solid ${flash?C.emerald:window._sgSerialLeit?C.teal:C.border}`,
        borderRadius: 6, padding: "6px 10px", cursor: window._sgSerialLeit?"pointer":"not-allowed",
        fontSize: 10, color: flash ? C.emerald : window._sgSerialLeit ? C.teal : C.textFaint,
        transition: "all .2s", whiteSpace: "nowrap", flexShrink: 0,
        opacity: window._sgSerialLeit ? 1 : 0.5 }}>
      {flash ? "✓ Lido!" : "📡"}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════
//  SVG CHARTS
// ══════════════════════════════════════════════════════════════

// Escala SVG
function svgX(val, min, max, w) { return ((val - min) / (max - min)) * w; }
function svgY(val, min, max, h) { return h - ((val - min) / (max - min)) * h; }

function ChartGranulometria({ resultado }) {
  const W=520, H=280, PL=52, PT=16, PR=16, PB=44;
  const cw=W-PL-PR, ch=H-PT-PB;
  const rows = resultado.rows.filter(r=>r.abertura_mm>0);
  if(!rows.length) return null;
  const logMin=Math.log10(0.001), logMax=Math.log10(100);
  const xl=v=>PL+svgX(Math.log10(v),logMin,logMax,cw);
  const yl=v=>PT+svgY(v,0,100,ch);
  const pts=rows.map(r=>`${xl(r.abertura_mm)},${yl(r.pct_passante)}`).join(" ");
  const ticks=[0.001,0.01,0.1,1,10,100];
  const yticks=[0,20,40,60,80,100];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",maxWidth:W,display:"block",background:C.surface,borderRadius:10,margin:"0 auto"}}>
      <rect x={PL} y={PT} width={cw} height={ch} fill={C.bg} stroke={C.border} strokeWidth={1}/>
      {yticks.map(y=>(
        <g key={y}>
          <line x1={PL} y1={PT+svgY(y,0,100,ch)} x2={PL+cw} y2={PT+svgY(y,0,100,ch)} stroke={C.border} strokeDasharray="3,3" strokeWidth={.5}/>
          <text x={PL-6} y={PT+svgY(y,0,100,ch)+4} textAnchor="end" fontSize={9} fill={C.textDim}>{y}</text>
        </g>
      ))}
      {ticks.map(t=>(
        <g key={t}>
          <line x1={xl(t)} y1={PT} x2={xl(t)} y2={PT+ch} stroke={C.border} strokeDasharray="3,3" strokeWidth={.5}/>
          <text x={xl(t)} y={PT+ch+14} textAnchor="middle" fontSize={8} fill={C.textDim}>{t<1?t:t}</text>
        </g>
      ))}
      <polyline points={pts} fill="none" stroke={C.emerald} strokeWidth={2.5} strokeLinejoin="round"/>
      {rows.map((r,i)=><circle key={i} cx={xl(r.abertura_mm)} cy={yl(r.pct_passante)} r={4} fill={C.emerald} stroke={C.bg} strokeWidth={1.5}/>)}
      {resultado.D10&&<line x1={xl(resultado.D10)} y1={PT} x2={xl(resultado.D10)} y2={PT+ch} stroke={C.orange} strokeWidth={1.5} strokeDasharray="4,3"/>}
      {resultado.D60&&<line x1={xl(resultado.D60)} y1={PT} x2={xl(resultado.D60)} y2={PT+ch} stroke={C.red} strokeWidth={1.5} strokeDasharray="4,3"/>}
      <text x={PL+cw/2} y={H-4} textAnchor="middle" fontSize={9} fill={C.textDim}>Abertura das Peneiras (mm)</text>
      <text x={14} y={PT+ch/2} textAnchor="middle" fontSize={9} fill={C.textDim} transform={`rotate(-90,14,${PT+ch/2})`}>% Passante</text>
    </svg>
  );
}

function ChartProctor({ resultado }) {
  if(!resultado.rows?.length) return null;
  const W=420,H=260,PL=52,PT=16,PR=20,PB=44;
  const cw=W-PL-PR, ch=H-PT-PB;
  const allW=[...resultado.rows.map(r=>r.w_pct),...(resultado.curvaSat?.map(p=>p.w)||[])];
  const allD=[...resultado.rows.map(r=>r.ro_d),...(resultado.curvaSat?.map(p=>p.rod)||[])];
  const xmin=Math.min(...allW)-1, xmax=Math.max(...allW)+1;
  const ymin=Math.min(...allD)-0.05, ymax=Math.max(...allD)+0.05;
  const xl=v=>PL+svgX(v,xmin,xmax,cw);
  const yl=v=>PT+svgY(v,ymin,ymax,ch);
  const fitPts=resultado.curvaFit?.map(p=>`${xl(p.w)},${yl(p.rod)}`).join(" ")||"";
  const satPts=resultado.curvaSat?.map(p=>`${xl(p.w)},${yl(p.rod)}`).join(" ")||"";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",maxWidth:W,display:"block",background:C.surface,borderRadius:10,margin:"0 auto"}}>
      <rect x={PL} y={PT} width={cw} height={ch} fill={C.bg} stroke={C.border} strokeWidth={1}/>
      {satPts&&<polyline points={satPts} fill="none" stroke={C.blue} strokeWidth={1.5} strokeDasharray="5,4" opacity={.7}/>}
      {fitPts&&<polyline points={fitPts} fill="none" stroke={C.emerald} strokeWidth={2.5}/>}
      {resultado.rows.map((r,i)=><circle key={i} cx={xl(r.w_pct)} cy={yl(r.ro_d)} r={5} fill={C.orange} stroke={C.bg} strokeWidth={1.5}/>)}
      {resultado.wOtimo&&<line x1={xl(resultado.wOtimo)} y1={PT} x2={xl(resultado.wOtimo)} y2={PT+ch} stroke={C.gold} strokeWidth={2} strokeDasharray="5,3"/>}
      {resultado.rodMax&&<line x1={PL} y1={yl(resultado.rodMax)} x2={PL+cw} y2={yl(resultado.rodMax)} stroke={C.gold} strokeWidth={1.5} strokeDasharray="5,3"/>}
      {Array.from({length:6},(_,i)=>xmin+i*(xmax-xmin)/5).map(v=>(
        <g key={v}><text x={xl(v)} y={PT+ch+14} textAnchor="middle" fontSize={9} fill={C.textDim}>{v.toFixed(1)}</text></g>
      ))}
      {Array.from({length:5},(_,i)=>ymin+i*(ymax-ymin)/4).map(v=>(
        <g key={v}><text x={PL-6} y={yl(v)+4} textAnchor="end" fontSize={9} fill={C.textDim}>{v.toFixed(3)}</text></g>
      ))}
      <text x={PL+cw/2} y={H-4} textAnchor="middle" fontSize={9} fill={C.textDim}>Umidade w (%)</text>
      <text x={14} y={PT+ch/2} textAnchor="middle" fontSize={9} fill={C.textDim} transform={`rotate(-90,14,${PT+ch/2})`}>ρd (g/cm³)</text>
    </svg>
  );
}

function ChartCBR({ resultado }) {
  if(!resultado.rows?.length) return null;
  const W=380,H=240,PL=50,PT=16,PR=20,PB=40;
  const cw=W-PL-PR, ch=H-PT-PB;
  const xmax=Math.max(12,Math.max(...resultado.rows.map(r=>r.pen)));
  const ymax=Math.max(10000,Math.max(...resultado.rows.map(r=>r.pressao_kPa))*1.1);
  const xl=v=>PL+svgX(v,0,xmax,cw);
  const yl=v=>PT+svgY(v,0,ymax,ch);
  const pts=resultado.rows.map(r=>`${xl(r.pen)},${yl(r.pressao_kPa)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",maxWidth:W,display:"block",background:C.surface,borderRadius:10,margin:"0 auto"}}>
      <rect x={PL} y={PT} width={cw} height={ch} fill={C.bg} stroke={C.border} strokeWidth={1}/>
      {[2.54,5.08].map(pen=>(
        <g key={pen}>
          <line x1={xl(pen)} y1={PT} x2={xl(pen)} y2={PT+ch} stroke={C.orange} strokeWidth={1.5} strokeDasharray="4,3" opacity={.8}/>
          <text x={xl(pen)} y={PT+ch+24} textAnchor="middle" fontSize={8} fill={C.orange}>{pen}mm</text>
        </g>
      ))}
      <polyline points={pts} fill="none" stroke={C.emerald} strokeWidth={2.5} strokeLinejoin="round"/>
      {resultado.rows.map((r,i)=><circle key={i} cx={xl(r.pen)} cy={yl(r.pressao_kPa)} r={4} fill={C.emerald} stroke={C.bg} strokeWidth={1.5}/>)}
      <text x={PL+cw/2} y={H-2} textAnchor="middle" fontSize={9} fill={C.textDim}>Penetração (mm)</text>
      <text x={14} y={PT+ch/2} textAnchor="middle" fontSize={9} fill={C.textDim} transform={`rotate(-90,14,${PT+ch/2})`}>Pressão (kPa)</text>
    </svg>
  );
}

function ChartMohr({ resultado }) {
  if(!resultado.rows?.length) return null;
  const W=460,H=260,PL=50,PT=16,PR=16,PB=40;
  const cw=W-PL-PR, ch=H-PT-PB;
  const maxS1 = Math.max(...resultado.rows.map(r=>r.s1))*1.15;
  const maxTau = Math.max(...resultado.rows.map(r=>r.raio))*2.2;
  const scale = Math.max(maxS1, maxTau*2);
  const xl=v=>PL+svgX(v,0,scale,cw);
  const yl=v=>PT+svgY(v,0,scale/2,ch);
  const envPts=resultado.envelope?.map(p=>`${xl(p.sig)},${yl(p.tau)}`).join(" ")||"";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",maxWidth:W,display:"block",background:C.surface,borderRadius:10,margin:"0 auto"}}>
      <rect x={PL} y={PT} width={cw} height={ch} fill={C.bg} stroke={C.border} strokeWidth={1}/>
      {/* Eixo zero */}
      <line x1={PL} y1={PT+ch} x2={PL+cw} y2={PT+ch} stroke={C.textDim} strokeWidth={1}/>
      {/* Envoltória */}
      {envPts&&<polyline points={envPts} fill="none" stroke={C.red} strokeWidth={2} opacity={.9}/>}
      {/* Círculos */}
      {resultado.rows.map((r,i)=>{
        const cx=xl(r.centro), cy=yl(0); // base na linha zero
        const rx=(r.raio/scale)*cw, ry=(r.raio/(scale/2))*ch;
        return <ellipse key={i} cx={cx} cy={cy-ry} rx={rx} ry={ry}
          fill="none" stroke={[C.emerald,C.teal,C.blue,C.orange][i%4]} strokeWidth={2}/>;
      })}
      {/* Labels */}
      {Array.from({length:6},(_,i)=>i*scale/5).map(v=>(
        <text key={v} x={xl(v)} y={PT+ch+14} textAnchor="middle" fontSize={9} fill={C.textDim}>{Math.round(v)}</text>
      ))}
      <text x={PL+cw/2} y={H-2} textAnchor="middle" fontSize={9} fill={C.textDim}>σ Normal (kPa)</text>
      <text x={14} y={PT+ch/2} textAnchor="middle" fontSize={9} fill={C.textDim} transform={`rotate(-90,14,${PT+ch/2})`}>τ Cisalhamento (kPa)</text>
    </svg>
  );
}

function ChartConcreto({ resultado }) {
  if(!resultado.rows?.length) return null;
  const W=380,H=220,PL=50,PT=20,PR=20,PB=50;
  const cw=W-PL-PR, ch=H-PT-PB;
  const vals=resultado.rows.map(r=>r.fc_corrigido);
  const ymax=Math.max(...vals)*1.2, ymin=0;
  const barW=Math.min(40,(cw-10)/resultado.rows.length-4);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",maxWidth:W,display:"block",background:C.surface,borderRadius:10,margin:"0 auto"}}>
      <rect x={PL} y={PT} width={cw} height={ch} fill={C.bg} stroke={C.border} strokeWidth={1}/>
      {/* fck_est */}
      <line x1={PL} y1={PT+svgY(resultado.fck_est,ymin,ymax,ch)} x2={PL+cw} y2={PT+svgY(resultado.fck_est,ymin,ymax,ch)} stroke={C.emerald} strokeWidth={2} strokeDasharray="5,4"/>
      {/* fcm */}
      <line x1={PL} y1={PT+svgY(resultado.fcm,ymin,ymax,ch)} x2={PL+cw} y2={PT+svgY(resultado.fcm,ymin,ymax,ch)} stroke={C.gold} strokeWidth={1.5} strokeDasharray="3,3"/>
      {resultado.rows.map((r,i)=>{
        const x=PL+8+i*(cw-16)/resultado.rows.length;
        const bh=(r.fc_corrigido/ymax)*ch;
        const by=PT+ch-bh;
        const ok=r.fc_corrigido>=25;
        return <g key={i}>
          <rect x={x} y={by} width={barW} height={bh} fill={ok?C.emerald:C.red} rx={3} opacity={.85}/>
          <text x={x+barW/2} y={PT+ch+14} textAnchor="middle" fontSize={8} fill={C.textDim}>{r.id||`CP${i+1}`}</text>
          <text x={x+barW/2} y={by-4} textAnchor="middle" fontSize={9} fill={ok?C.emerald:C.red} fontWeight="700">{r.fc_corrigido.toFixed(1)}</text>
        </g>;
      })}
      <text x={PL+cw+4} y={PT+svgY(resultado.fck_est,ymin,ymax,ch)} fontSize={8} fill={C.emerald}>fck</text>
      <text x={PL+cw+4} y={PT+svgY(resultado.fcm,ymin,ymax,ch)} fontSize={8} fill={C.gold}>fcm</text>
    </svg>
  );
}



// ══════════════════════════════════════════════════════════════
//  CALCULADORAS DE ENSAIO — entrada de dados brutos + serial
// ══════════════════════════════════════════════════════════════

// ── Granulometria ─────────────────────────────────────────────
const PENEIRAS_PADRAO = [
  {abertura_mm:76.2,nome:'3"'},{abertura_mm:50.8,nome:'2"'},{abertura_mm:38.1,nome:'1.1/2"'},
  {abertura_mm:25.4,nome:'1"'},{abertura_mm:19.1,nome:'3/4"'},{abertura_mm:9.52,nome:'3/8"'},
  {abertura_mm:4.75,nome:'#4'},{abertura_mm:2.0,nome:'#10'},{abertura_mm:0.84,nome:'#20'},
  {abertura_mm:0.42,nome:'#40'},{abertura_mm:0.25,nome:'#60'},{abertura_mm:0.149,nome:'#100'},
  {abertura_mm:0.074,nome:'#200'},
];

function CalcGranulometria({ onResult }) {
  const PENEIRAS_DEFAULT = ["75","50","38","25","19","12.5","9.5","4.76","2.0","0.84","0.42","0.25","0.149","0.074"];
  const [massaTotal, setMassaTotal] = useState("");
  const [taraDefault, setTaraDefault] = useState(""); // tara padrão por peneira (g)
  const [peneiras, setPeneiras] = useState(
    PENEIRAS_DEFAULT.map(ab=>({abertura:ab,massa:"",tara:""}))
  );
  const [resultado, setResultado] = useState(null);
  const setMassa=(i,v)=>setPeneiras(p=>p.map((r,j)=>j===i?{...r,massa:v}:r));
  const setTara =(i,v)=>setPeneiras(p=>p.map((r,j)=>j===i?{...r,tara:v}:r));

  const calcular=()=>{
    const mt=parseFloat(massaTotal);
    if(!mt){alert("Informe a massa total da amostra");return;}
    const td=parseFloat(taraDefault)||0;
    // Retido real = massa bruta - tara
    const retidos=peneiras.map(p=>{
      const mb=parseFloat(p.massa)||0, tc=parseFloat(p.tara)||td;
      return{ab:parseFloat(p.abertura)||0, ret:Math.max(mb-tc,0)};
    }).filter(p=>p.ret>=0);
    if(!retidos.some(p=>p.ret>0)){alert("Nenhum retido informado. Verifique as massas.");return;}
    const r=calcGranulometria(retidos.map((p,i)=>({id:i,abertura_mm:p.ab,massa_retida_g:p.ret})),mt);
    setResultado(r);
  };

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(200px,100%),1fr))",gap:10,marginBottom:14}}>
        <div>
          <label className="lbl">Massa Total Amostra (g)</label>
          <div style={{display:"flex",gap:5}}>
            <input type="number" step="any" className="inp" value={massaTotal}
              onChange={e=>setMassaTotal(e.target.value)} style={{flex:1,padding:"7px 10px"}}/>
            <BtnSerial onCapture={v=>setMassaTotal(v.toFixed(2))}/>
          </div>
        </div>
        <div>
          <label className="lbl">Tara peneira padrão (g)</label>
          <div style={{display:"flex",gap:5}}>
            <input type="number" step="any" className="inp" value={taraDefault}
              onChange={e=>setTaraDefault(e.target.value)} placeholder="ex: 380" style={{flex:1,padding:"7px 10px"}}/>
            <BtnSerial onCapture={v=>setTaraDefault(v.toFixed(2))}/>
          </div>
          <div style={{fontSize:8,color:C.textDim,marginTop:2}}>Aplica a todas as peneiras sem tara individual</div>
        </div>
      </div>
      <div style={{overflowX:"auto",marginBottom:12}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead>
            <tr>{["Peneira (mm)","Massa bruta (g)","Tara (g)","Retido real (g)"].map(h=>(
              <th key={h} style={{background:C.surface,padding:"6px 10px",fontSize:9,color:C.textDim,
                borderBottom:`1px solid ${C.border}`,textAlign:"left"}}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
          {peneiras.map((p,i)=>{
            const td2=parseFloat(taraDefault)||0;
            const mb=parseFloat(p.massa)||0, tc=parseFloat(p.tara)||td2;
            const ret=Math.max(mb-tc,0);
            return(
            <tr key={i} style={{background:i%2===0?C.surface:"transparent"}}>
              <td style={{padding:"4px 10px",fontWeight:700,fontFamily:"'JetBrains Mono',monospace",fontSize:10}}>{p.abertura}</td>
              <td style={{padding:"4px 6px"}}>
                <div style={{display:"flex",gap:4}}>
                  <input type="number" step="any" className="inp" value={p.massa}
                    onChange={e=>setMassa(i,e.target.value)} style={{width:90,padding:"4px 6px",fontSize:10}}/>
                  <BtnSerial onCapture={v=>setMassa(i,v.toFixed(2))}/>
                </div>
              </td>
              <td style={{padding:"4px 6px"}}>
                <input type="number" step="any" className="inp" value={p.tara}
                  onChange={e=>setTara(i,e.target.value)} placeholder={taraDefault||"—"} style={{width:70,padding:"4px 6px",fontSize:10}}/>
              </td>
              <td style={{padding:"4px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:10,
                color:ret>0?C.emerald:C.textFaint}}>{mb>0?ret.toFixed(2):"—"}</td>
            </tr>
          );})}
          </tbody>
        </table>
      </div>
      <button className="btn-p" onClick={calcular}>⚙ Calcular Granulometria</button>
      {resultado&&resultado.passantes&&(
        <div style={{marginTop:14}}>
          <div style={{overflowX:"auto",marginBottom:10}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
              <thead><tr>{["Peneira","Retido (g)","%Retido","%Retido Ac.","%Passante"].map(h=>(
                <th key={h} style={{background:C.surface,padding:"5px 8px",fontSize:8,color:C.textDim,borderBottom:`1px solid ${C.border}`}}>{h}</th>
              ))}</tr></thead>
              <tbody>{resultado.passantes.map((r,i)=>(
                <tr key={i} style={{background:i%2===0?C.surface:"transparent"}}>
                  <td style={{padding:"3px 8px",fontWeight:700}}>{r.ab} mm</td>
                  <td style={{padding:"3px 8px",textAlign:"right"}}>{r.ret?.toFixed(2)}</td>
                  <td style={{padding:"3px 8px",textAlign:"right"}}>{r.pct_ret?.toFixed(2)}</td>
                  <td style={{padding:"3px 8px",textAlign:"right"}}>{r.pct_ret_ac?.toFixed(2)}</td>
                  <td style={{padding:"3px 8px",textAlign:"right",fontWeight:700,color:C.emerald}}>{r.passante?.toFixed(2)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <button className="btn-p" onClick={()=>onResult({
            "% Argila":resultado.argila,"% Silte":resultado.silte,
            "% Areia Fina":resultado.areia_fina,"% Areia Grossa":resultado.areia_grossa,
            "% Pedregulho":resultado.pedregulho,
            "D10 (mm)":resultado.d10,"D50 (mm)":resultado.d50,"D60 (mm)":resultado.d60,
            "Cu - Coef. Uniformidade":resultado.cu,
          },resultado)}>✓ Usar estes resultados</button>
        </div>
      )}
    </div>
  );
}

function CalcProctor({ onResult }) {
  const [Gs,       setGs]       = useState("2.67");
  const [volMolde, setVolMolde] = useState("944");
  const [taraMolde,setTaraMolde]= useState(""); // tara do molde (g) — descontada da massa bruta
  const [pontos, setPontos] = useState(Array.from({length:5},(_,i)=>({id:i,umidade_pct:"",massa_bruta_g:"",tara_g:""})));
  const [resultado, setResultado] = useState(null);

  const setPonto = (i,k,v) => setPontos(prev=>prev.map((p,j)=>j===i?{...p,[k]:v}:p));

  const calcular = () => {
    const tm = parseFloat(taraMolde)||0;
    const pts = pontos.map(p=>{
      const mb=parseFloat(p.massa_bruta_g),tc=parseFloat(p.tara_g)||tm;
      const mu=mb-tc; // massa úmida real = massa bruta − tara
      return(p.umidade_pct&&mb&&mu>0)?{
        id:p.id, umidade_pct:p.umidade_pct,
        massa_umido_g:mu.toFixed(2),
        volume_molde_cm3:volMolde,
      }:null;
    }).filter(Boolean);
    if(pts.length<3){alert("Mínimo 3 pontos. Verifique se a tara está preenchida.");return;}
    const resultado_ = calcProctor(pts,parseFloat(Gs)||2.67);
    // Taras para banco
    const tarasDB_pct = pontos.filter(p=>p.massa_bruta_g).map((p,i)=>({
      determinacao:i+1,tipo_tara:"molde",identificacao:`Ponto ${i+1}`,
      massa_bruta_g:parseFloat(p.massa_bruta_g)||0,
      tara_g:parseFloat(p.tara_g)||parseFloat(taraMolde)||0,
      origem:"manual",
    }));
    if(resultado_) resultado_._taras_json=JSON.stringify(tarasDB_pct);
    setResultado(resultado_);
  };

  return (
    <div style={{display:"grid",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(140px,100%),1fr))",gap:10}}>
        <div>
          <label className="lbl">Gs (Densidade Real)</label>
          <input type="number" step="0.01" className="inp" value={Gs} onChange={e=>setGs(e.target.value)} style={{padding:"7px 10px"}}/>
        </div>
        <div>
          <label className="lbl">Vol. Molde (cm³)</label>
          <input type="number" step="any" className="inp" value={volMolde} onChange={e=>{setVolMolde(e.target.value);}} style={{padding:"7px 10px"}}/>
        </div>
        <div>
          <label className="lbl">Tara do Molde (g) — padrão</label>
          <div style={{display:"flex",gap:5}}>
            <input type="number" step="any" className="inp" value={taraMolde}
              onChange={e=>setTaraMolde(e.target.value)} placeholder="ex: 5420" style={{flex:1,padding:"7px 10px"}}/>
            <BtnSerial onCapture={v=>setTaraMolde(v.toFixed(2))}/>
          </div>
          <div style={{fontSize:8,color:C.textDim,marginTop:2}}>Aplica a todos os pontos se não preenchida individualmente</div>
        </div>
      </div>
      <div>
        <div className="sec">PONTOS DA CURVA DE COMPACTAÇÃO</div>
        <div style={{display:"grid",gap:8}}>
          {pontos.map((p,i)=>{
            const tm=parseFloat(taraMolde)||0;
            const mb=parseFloat(p.massa_bruta_g)||0;
            const tc=parseFloat(p.tara_g)||tm;
            const mu=mb-tc;
            return(
            <div key={i} style={{background:C.surface,borderRadius:8,padding:"10px 12px",display:"grid",gridTemplateColumns:"auto 1fr 1fr 1fr",gap:10,alignItems:"center"}}>
              <div style={{width:24,height:24,borderRadius:6,background:C.card,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.textDim}}>{i+1}</div>
              <div>
                <div style={{fontSize:8,color:C.textDim,marginBottom:3,letterSpacing:1}}>UMIDADE (%)</div>
                <input type="number" step="any" className="inp" value={p.umidade_pct}
                  onChange={e=>setPonto(i,"umidade_pct",e.target.value)} placeholder="12.5" style={{width:"100%",padding:"5px 8px",fontSize:11}}/>
              </div>
              <div>
                <div style={{fontSize:8,color:C.textDim,marginBottom:3,letterSpacing:1}}>MASSA BRUTA M+S (g)</div>
                <div style={{display:"flex",gap:5}}>
                  <input type="number" step="any" className="inp" value={p.massa_bruta_g}
                    onChange={e=>setPonto(i,"massa_bruta_g",e.target.value)} placeholder="7250" style={{flex:1,padding:"5px 8px",fontSize:11}}/>
                  <BtnSerial onCapture={v=>setPonto(i,"massa_bruta_g",v.toFixed(2))}/>
                </div>
              </div>
              <div>
                <div style={{fontSize:8,color:C.textDim,marginBottom:3,letterSpacing:1}}>TARA MOLDE (g)</div>
                <div style={{display:"flex",gap:5}}>
                  <input type="number" step="any" className="inp" value={p.tara_g}
                    onChange={e=>setPonto(i,"tara_g",e.target.value)} placeholder={taraMolde||"—"} style={{flex:1,padding:"5px 8px",fontSize:11}}/>
                  <BtnSerial onCapture={v=>setPonto(i,"tara_g",v.toFixed(2))}/>
                </div>
                {mb>0&&tc>0&&<div style={{fontSize:9,color:C.emerald,marginTop:2}}>M úmida = {mu.toFixed(1)} g</div>}
              </div>
            </div>
          );})}
        </div>
        <button className="btn-g" onClick={()=>setPontos(prev=>[...prev,{id:prev.length,umidade_pct:"",massa_bruta_g:"",tara_g:""}])}
          style={{marginTop:8,fontSize:11}}>+ Ponto</button>
      </div>
      <button className="btn-p" onClick={calcular}>⚙ Calcular Curva de Compactação</button>
      {resultado&&(
        <div style={{display:"grid",gap:14}}>
          <ChartProctor resultado={resultado}/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(130px,100%),1fr))",gap:8}}>
            {[
              {l:"Umidade Ótima (wot)",v:resultado.wOtimo?.toFixed(2)+"%",hi:true},
              {l:"ρd máx (g/cm³)",v:resultado.rodMax?.toFixed(4),hi:true},
              {l:"Gs utilizado",v:resultado.Gs},
              {l:"Vol. Molde (cm³)",v:pontos[0]?.volume_molde_cm3},
            ].map(s=>(
              <div key={s.l} style={{background:C.surface,borderRadius:8,padding:"9px 12px",textAlign:"center"}}>
                <div style={{fontSize:8,color:C.textDim,letterSpacing:1,marginBottom:3}}>{s.l}</div>
                <div style={{fontSize:13,fontWeight:700,color:s.hi?C.emerald:C.text,fontFamily:"'JetBrains Mono',monospace"}}>{s.v??"-"}</div>
              </div>
            ))}
          </div>
          <button className="btn-p" onClick={()=>onResult({
            "Umidade Ótima (Wot)":resultado.wOtimo?.toFixed(2),"Densidade Máx. (ρdmáx)":resultado.rodMax?.toFixed(4),"Grau de Compactação":"100.0",
            ...(resultado._taras_json?{_taras_json:resultado._taras_json}:{}),
          },resultado)}>✓ Usar estes resultados</button>
        </div>
      )}
    </div>
  );
}

// ── CalcHilf — Método Rápido de Hilf ─────────────────────────
function CalcHilf({ onResult }) {
  const [wNat,    setWNat]    = useState("18.0");
  const [Gs,      setGs]      = useState("2.67");
  const [taraMolde,setTaraMolde]= useState("");
  const [pontos, setPontos] = useState(Array.from({length:5},(_,i)=>({
    id:i, delta_agua_g:"0", massa_bruta_g:"", tara_g:"", volume_molde_cm3:"944",
  })));
  const [resultado,setResultado]=useState(null);
  const setPonto=(i,k,v)=>setPontos(prev=>prev.map((p,j)=>j===i?{...p,[k]:v}:p));

  const calcular=()=>{
    const tm=parseFloat(taraMolde)||0;
    const pts=pontos.map(p=>{
      const mb=parseFloat(p.massa_bruta_g), tc=parseFloat(p.tara_g)||tm;
      const mu=mb-tc;
      return(mb&&mu>0)?{...p,massa_umida_g:mu.toFixed(2)}:null;
    }).filter(Boolean);
    if(pts.length<3){alert("Mínimo 3 pontos. Verifique tara.");return;}
    const r=calcHilf(pts,wNat,parseFloat(Gs)||2.67);
    setResultado(r);
  };

  return(
    <div style={{display:"grid",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(150px,100%),1fr))",gap:10}}>
        {[["wNat",wNat,setWNat,"Umidade Natural wnat (%)"],["Gs",Gs,setGs,"Gs (Densidade Real)"],["taraMolde",taraMolde,setTaraMolde,"Tara Molde padrão (g)"]].map(([k,val,setter,lb])=>(
          <div key={k}>
            <label className="lbl">{lb}</label>
            <div style={{display:"flex",gap:5}}>
              <input type="number" step="any" className="inp" value={val}
                onChange={e=>setter(e.target.value)} style={{flex:1,padding:"7px 10px"}}/>
              {k==="taraMolde"&&<BtnSerial onCapture={v=>setTaraMolde(v.toFixed(2))}/>}
            </div>
          </div>
        ))}
      </div>
      <div>
        <div className="sec">PONTOS DE COMPACTAÇÃO (HILF)</div>
        <div style={{display:"grid",gap:8}}>
        {pontos.map((p,i)=>{
          const tm=parseFloat(taraMolde)||0;
          const mb=parseFloat(p.massa_bruta_g)||0, tc=parseFloat(p.tara_g)||tm;
          return(
          <div key={i} style={{background:C.surface,borderRadius:8,padding:"10px 12px",
            display:"grid",gridTemplateColumns:"auto 1fr 1fr 1fr 1fr",gap:10,alignItems:"center"}}>
            <div style={{width:24,height:24,borderRadius:6,background:C.card,display:"flex",
              alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.textDim}}>{i+1}</div>
            <div>
              <div style={{fontSize:8,color:C.textDim,marginBottom:3,letterSpacing:1}}>Δ ÁGUA (g)</div>
              <div style={{display:"flex",gap:4}}>
                <input type="number" step="any" className="inp" value={p.delta_agua_g}
                  onChange={e=>setPonto(i,"delta_agua_g",e.target.value)} placeholder="0" style={{flex:1,padding:"5px 7px",fontSize:11}}/>
              </div>
            </div>
            <div>
              <div style={{fontSize:8,color:C.textDim,marginBottom:3,letterSpacing:1}}>MASSA BRUTA M+S (g)</div>
              <div style={{display:"flex",gap:4}}>
                <input type="number" step="any" className="inp" value={p.massa_bruta_g}
                  onChange={e=>setPonto(i,"massa_bruta_g",e.target.value)} placeholder="7250" style={{flex:1,padding:"5px 7px",fontSize:11}}/>
                <BtnSerial onCapture={v=>setPonto(i,"massa_bruta_g",v.toFixed(2))}/>
              </div>
            </div>
            <div>
              <div style={{fontSize:8,color:C.textDim,marginBottom:3,letterSpacing:1}}>TARA MOLDE (g)</div>
              <div style={{display:"flex",gap:4}}>
                <input type="number" step="any" className="inp" value={p.tara_g}
                  onChange={e=>setPonto(i,"tara_g",e.target.value)} placeholder={taraMolde||"—"} style={{flex:1,padding:"5px 7px",fontSize:11}}/>
                <BtnSerial onCapture={v=>setPonto(i,"tara_g",v.toFixed(2))}/>
              </div>
              {mb>0&&tc>0&&<div style={{fontSize:9,color:C.emerald,marginTop:2}}>M úmida={( mb-tc).toFixed(1)}g</div>}
            </div>
            <div>
              <div style={{fontSize:8,color:C.textDim,marginBottom:3,letterSpacing:1}}>VOL MOLDE (cm³)</div>
              <input type="number" step="any" className="inp" value={p.volume_molde_cm3}
                onChange={e=>setPonto(i,"volume_molde_cm3",e.target.value)} style={{width:"100%",padding:"5px 7px",fontSize:11}}/>
            </div>
          </div>
        );})}
        </div>
        <button className="btn-g" onClick={()=>setPontos(prev=>[...prev,{id:prev.length,delta_agua_g:"0",massa_bruta_g:"",tara_g:"",volume_molde_cm3:"944"}])}
          style={{marginTop:8,fontSize:11}}>+ Ponto</button>
      </div>
      <button className="btn-p" onClick={calcular}>⚙ Calcular Hilf</button>
      {resultado&&resultado.wOtimo&&(
        <div style={{display:"grid",gap:10}}>
          <ChartProctor resultado={resultado}/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(130px,100%),1fr))",gap:8}}>
            {[{l:"Wot (Hilf)",v:resultado.wOtimo?.toFixed(2)+"%",hi:true},{l:"ρd máx",v:resultado.rodMax?.toFixed(4),hi:true}].map(s=>(
              <div key={s.l} style={{background:C.surface,borderRadius:8,padding:"9px 12px",textAlign:"center"}}>
                <div style={{fontSize:8,color:C.textDim,letterSpacing:1,marginBottom:3}}>{s.l}</div>
                <div style={{fontSize:13,fontWeight:700,color:s.hi?C.emerald:C.text}}>{s.v??"-"}</div>
              </div>
            ))}
          </div>
          <button className="btn-p" onClick={()=>onResult({
            "Umidade Ótima Hilf (Wot)":resultado.wOtimo?.toFixed(2),
            "ρd máx Hilf (g/cm³)":resultado.rodMax?.toFixed(4),
            "Umidade Natural (%)":wNat,
          },resultado)}>✓ Usar estes resultados</button>
        </div>
      )}
    </div>
  );
}
function CalcCBR({ onResult }) {
  const [constante, setConstante] = useState("0.05");
  const [taraLeit,  setTaraLeit]  = useState(""); // tara anel extensômetro expansão
  const PENETRACOES = [0.63,1.27,1.90,2.54,3.81,5.08,6.35,7.62,10.16,12.70];
  const [leituras, setLeituras] = useState(PENETRACOES.map((p,i)=>({id:i,pen:p,leit_bruta:"",tara_exp:""})));
  const [expLeit,  setExpLeit]  = useState({inicial:"",final:"",horas:"24"});
  const [resultado, setResultado] = useState(null);
  const setL=(i,k,v)=>setLeituras(prev=>prev.map((r,j)=>j===i?{...r,[k]:v}:r));

  const calcular=()=>{
    const te=parseFloat(taraLeit)||0;
    const ls=leituras.map(r=>{
      const lb=parseFloat(r.leit_bruta)||0, tc=parseFloat(r.tara_exp)||te;
      return{...r, leit:(lb-tc).toFixed(3)};
    });
    const r=calcCBR(ls.map(r=>({...r,leit:parseFloat(r.leit)})),parseFloat(constante)||0.05);
    if(!r.isc_254||!r.isc_508){alert("Preencha ao menos as leituras de 2.54mm e 5.08mm");return;}
    // Expansão
    const ei=parseFloat(expLeit.inicial)||0, ef=parseFloat(expLeit.final)||0, h=parseFloat(expLeit.horas)||24;
    const exp=((ef-ei)/127.0)*100; // expansão % (h corpo=127mm)
    setResultado({...r, expansao:+exp.toFixed(2), horas_expansao:h});
  };

  return(<div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(180px,100%),1fr))",gap:10,marginBottom:14}}>
      <div>
        <label className="lbl">Constante anel (kN/div)</label>
        <input type="number" step="any" className="inp" value={constante} onChange={e=>setConstante(e.target.value)} style={{padding:"7px 10px"}}/>
      </div>
      <div>
        <label className="lbl">Tara anel/leit. padrão (div)</label>
        <div style={{display:"flex",gap:5}}>
          <input type="number" step="any" className="inp" value={taraLeit} onChange={e=>setTaraLeit(e.target.value)} placeholder="0" style={{flex:1,padding:"7px 10px"}}/>
          <BtnSerial onCapture={v=>setTaraLeit(v.toFixed(3))}/>
        </div>
        <div style={{fontSize:8,color:C.textDim,marginTop:2}}>Leitura real = leit.bruta − tara</div>
      </div>
    </div>
    <div className="sec">LEITURAS DE PENETRAÇÃO</div>
    <div style={{overflowX:"auto",marginBottom:14}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
        <thead><tr>{["Penetração (mm)","Leitura bruta (div)","Tara (div)","Leit. real","Pressão (kPa)"].map(h=>(
          <th key={h} style={{background:C.surface,padding:"5px 8px",fontSize:8,color:C.textDim,borderBottom:`1px solid ${C.border}`}}>{h}</th>
        ))}</tr></thead>
        <tbody>
        {leituras.map((r,i)=>{
          const te=parseFloat(taraLeit)||0;
          const lb=parseFloat(r.leit_bruta)||0, tc=parseFloat(r.tara_exp)||te;
          const lreal=lb-tc, p=lreal*(parseFloat(constante)||0.05)*1000/1; // kPa
          return(
          <tr key={i} style={{background:i%2===0?C.surface:"transparent"}}>
            <td style={{padding:"3px 8px",fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{r.pen}</td>
            <td style={{padding:"3px 6px"}}>
              <div style={{display:"flex",gap:4}}>
                <input type="number" step="any" className="inp" value={r.leit_bruta}
                  onChange={e=>setL(i,"leit_bruta",e.target.value)} style={{width:80,padding:"4px 6px",fontSize:10}}/>
                <BtnSerial onCapture={v=>setL(i,"leit_bruta",v.toFixed(3))}/>
              </div>
            </td>
            <td style={{padding:"3px 6px"}}>
              <input type="number" step="any" className="inp" value={r.tara_exp}
                onChange={e=>setL(i,"tara_exp",e.target.value)} placeholder={taraLeit||"0"} style={{width:60,padding:"4px 6px",fontSize:10}}/>
            </td>
            <td style={{padding:"3px 8px",color:C.teal,fontFamily:"'JetBrains Mono',monospace",fontSize:10}}>{lb>0?lreal.toFixed(3):"—"}</td>
            <td style={{padding:"3px 8px",color:C.gold,fontFamily:"'JetBrains Mono',monospace",fontSize:10}}>{lb>0?p.toFixed(1):"—"}</td>
          </tr>
        );})}
        </tbody>
      </table>
    </div>
    <div className="sec" style={{marginBottom:8}}>EXPANSÃO</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
      {[["inicial","Leitura inicial (mm)"],["final","Leitura final (mm)"],["horas","Período (h)"]].map(([k,lb])=>(
        <div key={k}>
          <label style={{fontSize:9,color:C.textDim,display:"block",marginBottom:4}}>{lb}</label>
          <div style={{display:"flex",gap:5}}>
            <input type="number" step="any" className="inp" value={expLeit[k]}
              onChange={e=>setExpLeit(x=>({...x,[k]:e.target.value}))} style={{flex:1,padding:"7px 9px"}}/>
            {k!=="horas"&&<BtnSerial onCapture={v=>setExpLeit(x=>({...x,[k]:v.toFixed(3)}))}/>}
          </div>
        </div>
      ))}
    </div>
    <button className="btn-p" onClick={calcular}>⚙ Calcular CBR/ISC</button>
    {resultado&&(
      <div style={{background:C.surface,borderRadius:10,padding:14,marginTop:12,display:"flex",gap:16,flexWrap:"wrap"}}>
        {[["ISC (CBR) 2.54mm",resultado.isc_254+"%"],["ISC (CBR) 5.08mm",resultado.isc_508+"%"],
          ["ISC adotado",resultado.isc+"%",true],["Expansão",resultado.expansao+"%"]].map(([l,v,hi])=>(
          <div key={l} style={{textAlign:"center"}}>
            <div style={{fontSize:9,color:C.textDim}}>{l}</div>
            <div style={{fontSize:15,fontWeight:700,color:hi?C.emerald:C.gold,fontFamily:"'JetBrains Mono',monospace"}}>{v}</div>
          </div>
        ))}
        <button className="btn-p" style={{alignSelf:"center"}} onClick={()=>onResult({
          "ISC (%)":resultado.isc,"Expansão (%)":resultado.expansao,
        },{cbr:resultado})}>✓ Usar estes resultados</button>
      </div>
    )}
  </div>);
}
function CalcConcreto({ onResult }) {
  const [dim, setDim] = useState({diam:"10",alt:"20"});
  const [cps, setCps] = useState(Array.from({length:3},(_,i)=>({id:i,idade:"28",carga_bruta_kN:"",tara_kN:""})));
  const [resultado, setResultado] = useState(null);
  const setCP=(i,k,v)=>setCps(prev=>prev.map((p,j)=>j===i?{...p,[k]:v}:p));

  const calcular=()=>{
    const A=Math.PI*(parseFloat(dim.diam)/2)**2; // cm²
    const rows=cps.filter(p=>p.carga_bruta_kN).map(p=>{
      const cb=parseFloat(p.carga_bruta_kN)||0, tc=parseFloat(p.tara_kN)||0;
      const F=(cb-tc)*1000; // N
      const fc=F/A/10; // MPa (1 kgf/cm² = 0.0981 MPa → usar N/cm² × 0.01 MPa)
      // fc (MPa) = F(N) / A(cm²) / 10 = (carga_real_kN × 1000) / A / 10
      const fc_mpa=(cb-tc)*1000/(A*10);
      return{...p,carga_real_kN:(cb-tc).toFixed(3),fc_mpa:+fc_mpa.toFixed(2)};
    });
    if(!rows.length){alert("Informe ao menos 1 CP");return;}
    const fcm=rows.reduce((s,r)=>s+r.fc_mpa,0)/rows.length;
    const fck_est=rows.length>=3?fcm-1.65*Math.sqrt(rows.reduce((s,r)=>s+(r.fc_mpa-fcm)**2,0)/rows.length):fcm;
    const r={fcm:+fcm.toFixed(2),fck_est:+fck_est.toFixed(2),rows,A:+A.toFixed(2)};
    setResultado(r);
  };

  return(<div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
      {[["diam","Diâmetro (cm)"],["alt","Altura (cm)"]].map(([k,lb])=>(
        <div key={k}>
          <label style={{fontSize:9,color:C.textDim,display:"block",marginBottom:4}}>{lb}</label>
          <input type="number" step="any" className="inp" value={dim[k]}
            onChange={e=>setDim(x=>({...x,[k]:e.target.value}))} style={{width:"100%",padding:"7px 9px"}}/>
        </div>
      ))}
      <div>
        <label style={{fontSize:9,color:C.textDim,display:"block",marginBottom:4}}>Área (cm²)</label>
        <div style={{background:C.surface,borderRadius:6,padding:"7px 9px",fontSize:11,color:C.gold,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>
          {(Math.PI*(parseFloat(dim.diam||10)/2)**2).toFixed(2)}
        </div>
      </div>
    </div>
    <div className="sec">CORPOS DE PROVA</div>
    <div style={{display:"grid",gap:8,marginBottom:14}}>
    {cps.map((p,i)=>{
      const cb=parseFloat(p.carga_bruta_kN)||0, tc=parseFloat(p.tara_kN)||0;
      const A=Math.PI*(parseFloat(dim.diam||10)/2)**2;
      const fc_prev=cb>0?(cb-tc)*1000/(A*10):null;
      return(
      <div key={i} style={{background:C.surface,borderRadius:8,padding:"10px 14px",
        display:"grid",gridTemplateColumns:"auto 1fr 1fr 1fr",gap:10,alignItems:"center"}}>
        <div style={{width:24,height:24,borderRadius:6,background:C.card,display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:11,fontWeight:700,color:C.textDim}}>{i+1}</div>
        <div>
          <label style={{fontSize:8,color:C.textDim,display:"block",marginBottom:3}}>IDADE (dias)</label>
          <select className="sel" value={p.idade} onChange={e=>setCP(i,"idade",e.target.value)} style={{padding:"5px 6px",fontSize:11}}>
            {["7","14","28","91"].map(d=><option key={d} value={d}>{d}d</option>)}
          </select>
        </div>
        <div>
          <label style={{fontSize:8,color:C.textDim,display:"block",marginBottom:3}}>CARGA BRUTA (kN)</label>
          <div style={{display:"flex",gap:4}}>
            <input type="number" step="any" className="inp" value={p.carga_bruta_kN}
              onChange={e=>setCP(i,"carga_bruta_kN",e.target.value)} style={{flex:1,padding:"5px 7px",fontSize:11}}/>
            <BtnSerial onCapture={v=>setCP(i,"carga_bruta_kN",v.toFixed(3))}/>
          </div>
        </div>
        <div>
          <label style={{fontSize:8,color:C.textDim,display:"block",marginBottom:3}}>TARA CABEÇOTE (kN)</label>
          <div style={{display:"flex",gap:4}}>
            <input type="number" step="any" className="inp" value={p.tara_kN}
              onChange={e=>setCP(i,"tara_kN",e.target.value)} placeholder="0" style={{flex:1,padding:"5px 7px",fontSize:11}}/>
            <BtnSerial onCapture={v=>setCP(i,"tara_kN",v.toFixed(3))}/>
          </div>
          {cb>0&&<div style={{fontSize:9,color:C.emerald,marginTop:2}}>fc≈{fc_prev?.toFixed(1)} MPa</div>}
        </div>
      </div>
    );})}
    </div>
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <button className="btn-g" onClick={()=>setCps(prev=>[...prev,{id:prev.length,idade:"28",carga_bruta_kN:"",tara_kN:""}])}>+ CP</button>
      <button className="btn-p" onClick={calcular}>⚙ Calcular fck</button>
      {resultado&&<div style={{background:C.emerald+"22",borderRadius:8,padding:"8px 14px",display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>fcm</div><div style={{fontSize:14,fontWeight:700,color:C.gold}}>{resultado.fcm} MPa</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>fck est.</div><div style={{fontSize:14,fontWeight:700,color:C.emerald}}>{resultado.fck_est} MPa</div></div>
        <button className="btn-p" style={{fontSize:11,padding:"5px 12px"}} onClick={()=>{
          const r28=resultado.rows.filter(r=>r.idade==="28");
          onResult({
            "fck 7 dias":resultado.rows.filter(r=>r.idade==="7")[0]?.fc_mpa??null,
            "fck 28 dias":r28.length?+(r28.reduce((s,r)=>s+r.fc_mpa,0)/r28.length).toFixed(2):resultado.fcm,
            "Slump":null,
          },resultado);
        }}>✓ Usar estes resultados</button>
      </div>}
    </div>
  </div>);
}


// ── CalcTriaxial — NBR 12007 ──────────────────────────────────
function CalcTriaxial({ onResult }) {
  const [ensaios, setEnsaios] = useState(Array.from({length:3},(_,i)=>({id:i,s3:"",ds:"",u:"",Gs:"2.67",e0:"",wc:""})));
  const [resultado, setResultado] = useState(null);
  const setE=(i,k,v)=>setEnsaios(prev=>prev.map((p,j)=>j===i?{...p,[k]:v}:p));
  const calcular=()=>{
    const pts=ensaios.filter(e=>e.s3&&e.ds).map(e=>({...e,s3:parseFloat(e.s3),ds:parseFloat(e.ds),u:parseFloat(e.u)||0}));
    if(pts.length<2){alert("Mínimo 2 CPs");return;}
    const r=calcTriaxial(pts);
    setResultado(r);
  };
  return(
    <div style={{display:"grid",gap:14}}>
      <div style={{display:"grid",gap:8}}>
        {ensaios.map((e,i)=>(
          <div key={i} style={{background:C.surface,borderRadius:8,padding:"10px 12px",
            display:"grid",gridTemplateColumns:"auto 1fr 1fr 1fr",gap:10,alignItems:"center"}}>
            <div style={{width:24,height:24,borderRadius:6,background:C.card,display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:11,fontWeight:700,color:C.textDim}}>CP{i+1}</div>
            {[["s3","σ₃ (kPa)"],["ds","Δσ (kPa)"],["u","u (kPa)"]].map(([k,lb])=>(
              <div key={k}>
                <div style={{fontSize:8,color:C.textDim,marginBottom:3,letterSpacing:1}}>{lb}</div>
                <div style={{display:"flex",gap:4}}>
                  <input type="number" step="any" className="inp" value={e[k]}
                    onChange={ev=>setE(i,k,ev.target.value)} style={{flex:1,padding:"5px 7px",fontSize:11}}/>
                  <BtnSerial onCapture={v=>setE(i,k,v.toFixed(2))}/>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <button className="btn-g" onClick={()=>setEnsaios(prev=>[...prev,{id:prev.length,s3:"",ds:"",u:"",Gs:"2.67",e0:"",wc:""}])}>+ CP</button>
        <button className="btn-p" onClick={calcular}>⚙ Calcular Parâmetros</button>
      </div>
      {resultado&&(
        <div style={{display:"grid",gap:12}}>
          <ChartMohr resultado={resultado}/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(130px,100%),1fr))",gap:8}}>
            {[{l:"Coesão c'",v:(resultado.c||0).toFixed(2)+" kPa",hi:false},{l:"Ângulo φ'",v:(resultado.phi||0).toFixed(1)+"°",hi:true},{l:"E50",v:"—"}].map(s=>(
              <div key={s.l} style={{background:C.surface,borderRadius:8,padding:"9px 12px",textAlign:"center"}}>
                <div style={{fontSize:8,color:C.textDim,letterSpacing:1,marginBottom:3}}>{s.l}</div>
                <div style={{fontSize:13,fontWeight:700,color:s.hi?C.emerald:C.text}}>{s.v??"-"}</div>
              </div>
            ))}
          </div>
          <button className="btn-p" onClick={()=>onResult({"Coesão (c')":resultado.c?.toFixed(2),"Ângulo de Atrito (φ')":resultado.phi?.toFixed(1),"Módulo E50":"—"},resultado)}>
            ✓ Usar estes resultados
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  HELPERS PARA CALCULADORAS NOVAS
// ══════════════════════════════════════════════════════════════
function _linReg(pts){
  const n=pts.length; if(n<2) return {a:0,b:0,r2:0};
  const sx=pts.reduce((s,p)=>s+p.x,0), sy=pts.reduce((s,p)=>s+p.y,0);
  const sxx=pts.reduce((s,p)=>s+p.x*p.x,0), sxy=pts.reduce((s,p)=>s+p.x*p.y,0);
  const b=(n*sxy-sx*sy)/(n*sxx-sx*sx||1);
  const a=(sy-b*sx)/n;
  const ybar=sy/n;
  const sst=pts.reduce((s,p)=>s+(p.y-ybar)**2,0);
  const sse=pts.reduce((s,p)=>s+(p.y-(a+b*p.x))**2,0);
  return{a,b,r2:sst>0?1-sse/sst:1};
}
function _rowArr(n,def=()=>({})){ return Array.from({length:n},(_,i)=>({id:i,...def(i)})); }
function _num(v){ return parseFloat(v)||0; }

// ── Teor de Umidade Natural — NBR 6457 ────────────────────────
function CalcTeorUmidade({ onResult }){
  const [rows,setRows]=useState(_rowArr(3,()=>({cap:"",mc:"",mcu:"",mcs:""})));
  const [res,setRes]=useState(null);
  const set=(i,k,v)=>setRows(r=>{const n=[...r];n[i]={...n[i],[k]:v};return n;});
  const calc=()=>{
    const ws=rows.map(r=>{
      const mc=_num(r.mc),mcu=_num(r.mcu),mcs=_num(r.mcs);
      if(!mcs||!mc||mcs<=mc) return null;
      return((mcu-mcs)/(mcs-mc))*100;
    }).filter(v=>v!==null&&v>=0);
    if(!ws.length){alert("Preencha ao menos 1 determinação completa");return;}
    const w_med=ws.reduce((s,v)=>s+v,0)/ws.length;
    const r={w_med:+w_med.toFixed(2),determinacoes:ws.map(v=>+v.toFixed(2))};
    // Monta array de taras para persistir no banco
    const tarasDB = rows.filter(rw=>rw.mc&&rw.mcu&&rw.mcs).map((rw,i)=>({
      determinacao: i+1, tipo_tara:"capsula", identificacao:rw.cap||`Det.${i+1}`,
      massa_bruta_g:_num(rw.mcu), tara_g:_num(rw.mc), temperatura_c:null, origem:"manual",
    }));
    setRes(r);
  };
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>
      w = (Mcu − Mcs) / (Mcs − Mc) × 100 · Mc = tara cápsula
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(280px,100%),1fr))",gap:10,marginBottom:12}}>
    {rows.map((r,i)=>(
      <div key={i} style={{background:C.bg,borderRadius:8,padding:12,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,fontWeight:700,color:C.gold,marginBottom:8}}>Determinação {i+1}</div>
        {[["cap","Cápsula nº","txt"],["mc","Tara cápsula Mc (g)",""],["mcu","Massa cáp+solo úmido Mcu (g)","📡"],["mcs","Massa cáp+solo seco Mcs (g)","📡"]].map(([k,lb,tp])=>(
          <div key={k} style={{marginBottom:6}}>
            <label style={{fontSize:9,color:C.textDim,display:"block",marginBottom:3}}>{lb}</label>
            <div style={{display:"flex",gap:6}}>
              <input type={tp==="txt"?"text":"number"} step="any" className="inp"
                value={r[k]} onChange={e=>set(i,k,e.target.value)} style={{flex:1,padding:"6px 8px",fontSize:11}}/>
              {tp==="📡"&&<BtnSerial onCapture={v=>set(i,k,v.toFixed(2))}/>}
            </div>
          </div>
        ))}
        {r.mc&&r.mcu&&r.mcs&&_num(r.mcs)>_num(r.mc)&&
          <div style={{fontSize:11,color:C.emerald,fontWeight:700,marginTop:6}}>
            w = {((_num(r.mcu)-_num(r.mcs))/(_num(r.mcs)-_num(r.mc))*100).toFixed(2)} %
          </div>}
      </div>
    ))}
    </div>
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <button className="btn-g" onClick={()=>setRows(r=>[...r,{id:r.length,cap:"",mc:"",mcu:"",mcs:""}])}>+ Det.</button>
      <button className="btn-p" onClick={calc}>Calcular Umidade</button>
      {res&&<div style={{background:C.emerald+"22",borderRadius:8,padding:"8px 14px",display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:13,fontWeight:700,color:C.emerald}}>w médio = {res.w_med} %</span>
        <button className="btn-p" style={{fontSize:11,padding:"5px 12px"}} onClick={()=>{
          const tarasDB=rows.filter(rw=>rw.mc&&rw.mcu&&rw.mcs).map((rw,i)=>({
            determinacao:i+1,tipo_tara:"capsula",identificacao:rw.cap||`Det.${i+1}`,
            massa_bruta_g:_num(rw.mcu),tara_g:_num(rw.mc),temperatura_c:null,origem:"manual",
          }));
          onResult({"Umidade Natural w (%)":res.w_med,_taras_json:JSON.stringify(tarasDB)},{umidade:res});
        }}>✓ Usar estes resultados</button>
      </div>}
    </div>
  </div>);
}

// ── Massa Específica Real dos Grãos — NBR 6508 ────────────────
function CalcGraos({ onResult }){
  const fatorT=t=>{const ts=[15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
    const fs=[1.001,1.001,1.001,1.000,1.000,1.000,0.999,0.999,0.998,0.998,0.997,0.997,0.996,0.995,0.995,0.994];
    const idx=ts.indexOf(Math.round(_num(t)));return idx>=0?fs[idx]:1.000;};
  const [rows,setRows]=useState(_rowArr(2,()=>({ms:"",mf:"",mfs:"",t:"20"})));
  const [Gs,setGs]=useState(null);
  const set=(i,k,v)=>setRows(r=>{const n=[...r];n[i]={...n[i],[k]:v};return n;});
  const calc=()=>{
    const vals=rows.map(r=>{
      const ms=_num(r.ms),mf=_num(r.mf),mfs=_num(r.mfs),t=_num(r.t);
      if(!ms||!mf||!mfs) return null;
      return fatorT(t)*ms/(ms-(mfs-mf));
    }).filter(v=>v!==null&&v>0);
    if(!vals.length){alert("Preencha ao menos 1 determinação");return;}
    const gs_med=vals.reduce((s,v)=>s+v,0)/vals.length;
    setGs(+gs_med.toFixed(3));
    setGs(+gs_med.toFixed(3));
  };
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>
      Gs = ft × Ms / (Ms − (Mfs − Mf)) · Ms = solo seco · Mf = frasco+água · Mfs = frasco+solo+água
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(280px,100%),1fr))",gap:10,marginBottom:12}}>
    {rows.map((r,i)=>(
      <div key={i} style={{background:C.bg,borderRadius:8,padding:12,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,fontWeight:700,color:C.teal,marginBottom:8}}>Determinação {i+1}</div>
        {[["ms","Solo seco Ms (g)","📡"],["mf","Frasco+água Mf (g)","📡"],["mfs","Frasco+solo+água Mfs (g)","📡"],["t","Temperatura T (°C)",""]].map(([k,lb,s])=>(
          <div key={k} style={{marginBottom:6}}>
            <label style={{fontSize:9,color:C.textDim,display:"block",marginBottom:3}}>{lb}</label>
            <div style={{display:"flex",gap:6}}>
              <input type="number" step="any" className="inp" value={r[k]}
                onChange={e=>set(i,k,e.target.value)} style={{flex:1,padding:"6px 8px",fontSize:11}}/>
              {s==="📡"&&<BtnSerial onCapture={v=>set(i,k,v.toFixed(2))}/>}
            </div>
          </div>
        ))}
        {r.ms&&r.mf&&r.mfs&&<div style={{fontSize:11,color:C.teal,fontWeight:700,marginTop:6}}>
          Gs = {(fatorT(_num(r.t))*_num(r.ms)/(_num(r.ms)-(_num(r.mfs)-_num(r.mf))||1)).toFixed(3)}
        </div>}
      </div>
    ))}
    </div>
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <button className="btn-g" onClick={()=>setRows(r=>[...r,{id:r.length,ms:"",mf:"",mfs:"",t:"20"}])}>+ Det.</button>
      <button className="btn-p" onClick={calc}>Calcular Gs</button>
      {Gs!==null&&<div style={{background:C.emerald+"22",borderRadius:8,padding:"8px 14px",display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:13,fontWeight:700,color:C.emerald}}>Gs = {Gs} g/cm³</span>
        <button className="btn-p" style={{fontSize:11,padding:"5px 12px"}} onClick={()=>onResult({"Gs (g/cm³)":Gs},{graos:rows})}>✓ Usar estes resultados</button>
      </div>}
      {Gs&&<div style={{background:C.teal+"22",borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:700,color:C.teal}}>Gs = {Gs} g/cm³</div>}
    </div>
  </div>);
}

// ── Densidade in situ — NBR 9813 ──────────────────────────────
function CalcDensidadeInsitu({ onResult }){
  const [d,setD]=useState({ms:"",vb:"",wnat:"",gs:"2.67"});
  const [res,setRes]=useState(null);
  const set=(k,v)=>setD(x=>({...x,[k]:v}));
  const calc=()=>{
    const ms=_num(d.ms),vb=_num(d.vb),w=_num(d.wnat),gs=_num(d.gs)||2.67;
    if(!ms||!vb){alert("Preencha massa e volume");return;}
    const rho_nat=ms/vb, gamma_nat=rho_nat*9.81, rho_d=rho_nat/(1+w/100), e=(gs/rho_d)-1;
    const r={"ρnat (g/cm³)":+rho_nat.toFixed(3),"γnat (kN/m³)":+gamma_nat.toFixed(2),"Índice de Vazios e":+e.toFixed(3)};
    setRes(r);
  };
  return(<div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(200px,100%),1fr))",gap:10,marginBottom:12}}>
      {[["ms","Massa solo úmido Ms (g)","📡"],["vb","Volume buraco Vb (cm³)","📡"],["wnat","Umidade Natural w (%)",""],["gs","Gs (g/cm³)",""]].map(([k,lb,s])=>(
        <div key={k}>
          <label style={{fontSize:9,color:C.textDim,display:"block",marginBottom:4}}>{lb}</label>
          <div style={{display:"flex",gap:6}}>
            <input type="number" step="any" className="inp" value={d[k]}
              onChange={e=>set(k,e.target.value)} style={{flex:1,padding:"7px 9px",fontSize:11}}/>
            {s==="📡"&&<BtnSerial onCapture={v=>set(k,v.toFixed(2))}/>}
          </div>
        </div>
      ))}
    </div>
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <button className="btn-p" onClick={calc}>Calcular Densidade</button>
      {res&&<div style={{background:C.gold+"22",borderRadius:8,padding:"8px 14px",display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
        {Object.entries(res).map(([k,v])=>(
          <div key={k} style={{textAlign:"center"}}>
            <div style={{fontSize:9,color:C.textDim}}>{k}</div>
            <div style={{fontSize:14,fontWeight:700,color:C.gold,fontFamily:"'JetBrains Mono',monospace"}}>{v}</div>
          </div>
        ))}
        <button className="btn-p" style={{fontSize:11,padding:"5px 12px",marginLeft:"auto"}} onClick={()=>onResult(res,{densidade:res})}>✓ Usar estes resultados</button>
      </div>}
    </div>
  </div>);
}

// ── Limite de Liquidez — NBR 6459 ─────────────────────────────
function CalcLL({ onResult }){
  const [rows,setRows]=useState(_rowArr(4,()=>({golpes:"",mc:"",mcu:"",mcs:""})));
  const [res,setRes]=useState(null);
  const set=(i,k,v)=>setRows(r=>{const n=[...r];n[i]={...n[i],[k]:v};return n;});
  const calc=()=>{
    const pts=rows.map(r=>{
      const g=_num(r.golpes),mc=_num(r.mc),mcu=_num(r.mcu),mcs=_num(r.mcs);
      if(!g||!mcs||!mc||mcs<=mc) return null;
      const w=((mcu-mcs)/(mcs-mc))*100;
      return{x:Math.log10(g),y:w,golpes:g,w:+w.toFixed(2)};
    }).filter(Boolean);
    if(pts.length<2){alert("Mínimo 2 pontos");return;}
    const{a,b}=_linReg(pts);
    const ll=a+b*Math.log10(25);
    const tarasDB_ll = rows.filter(r=>r.mc&&r.mcu&&r.mcs).map((r,i)=>({
      determinacao:i+1,tipo_tara:"capsula",identificacao:`Ponto ${i+1} (${_num(r.golpes)} golpes)`,
      massa_bruta_g:_num(r.mcu),tara_g:_num(r.mc),origem:"manual",
    }));
    setRes({ll:+ll.toFixed(1),pts,a,b,tarasDB_ll});
  };
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>
      Curva de fluidez · LL = w a 25 golpes · Mc = tara cápsula
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(260px,100%),1fr))",gap:10,marginBottom:12}}>
    {rows.map((r,i)=>(
      <div key={i} style={{background:C.bg,borderRadius:8,padding:12,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,fontWeight:700,color:C.orange,marginBottom:8}}>Ponto {i+1}</div>
        {[["golpes","Nº de golpes",""],["mc","Tara cápsula Mc (g)",""],["mcu","Mcáp+solo úmido Mcu (g)","📡"],["mcs","Mcáp+solo seco Mcs (g)","📡"]].map(([k,lb,s])=>(
          <div key={k} style={{marginBottom:6}}>
            <label style={{fontSize:9,color:C.textDim,display:"block",marginBottom:3}}>{lb}</label>
            <div style={{display:"flex",gap:6}}>
              <input type="number" step="any" className="inp" value={r[k]}
                onChange={e=>set(i,k,e.target.value)} style={{flex:1,padding:"6px 8px",fontSize:11}}/>
              {s==="📡"&&<BtnSerial onCapture={v=>set(i,k,v.toFixed(2))}/>}
            </div>
          </div>
        ))}
        {r.golpes&&r.mc&&r.mcu&&r.mcs&&_num(r.mcs)>_num(r.mc)&&
          <div style={{fontSize:11,color:C.orange,fontWeight:700,marginTop:6}}>
            w = {((_num(r.mcu)-_num(r.mcs))/(_num(r.mcs)-_num(r.mc))*100).toFixed(1)} %
          </div>}
      </div>
    ))}
    </div>
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <button className="btn-g" onClick={()=>setRows(r=>[...r,{id:r.length,golpes:"",mc:"",mcu:"",mcs:""}])}>+ Ponto</button>
      <button className="btn-p" onClick={calc}>Calcular LL</button>
      {res&&<div style={{background:C.orange+"22",borderRadius:8,padding:"8px 14px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <span style={{fontSize:14,fontWeight:700,color:C.orange}}>LL = {res.ll} %</span>
        <button className="btn-p" style={{fontSize:11,padding:"5px 12px"}} onClick={()=>onResult({"Limite de Liquidez LL (%)":res.ll,_taras_json:JSON.stringify(res.tarasDB_ll)},{ll:res.ll,pts:res.pts})}>✓ Usar estes resultados</button>
      </div>}
    </div>
  </div>);
}

// ── Limite de Plasticidade — NBR 7180 ─────────────────────────
function CalcLP({ onResult }){
  const [rows,setRows]=useState(_rowArr(3,()=>({mc:"",mcu:"",mcs:""})));
  const [res,setRes]=useState(null);
  const [ll,setLL]=useState("");
  const set=(i,k,v)=>setRows(r=>{const n=[...r];n[i]={...n[i],[k]:v};return n;});
  const calc=()=>{
    const ws=rows.map(r=>{
      const mc=_num(r.mc),mcu=_num(r.mcu),mcs=_num(r.mcs);
      if(!mcs||!mc||mcs<=mc) return null;
      return((mcu-mcs)/(mcs-mc))*100;
    }).filter(v=>v!==null&&v>=0);
    if(!ws.length){alert("Preencha ao menos 1 rolete");return;}
    const lp=ws.reduce((s,v)=>s+v,0)/ws.length;
    const ip=ll?_num(ll)-lp:null;
    const tarasDB_lp = rows.filter(r=>r.mc&&r.mcu&&r.mcs).map((r,i)=>({
      determinacao:i+1,tipo_tara:"capsula",identificacao:`Rolete ${i+1}`,
      massa_bruta_g:_num(r.mcu),tara_g:_num(r.mc),origem:"manual",
    }));
    setRes({lp:+lp.toFixed(1),ip:ip?+ip.toFixed(1):null,tarasDB_lp,ws});
  };
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>Roletes 3mm · LP = média das umidades · Mc = tara cápsula</div>
    <div style={{marginBottom:10}}>
      <label style={{fontSize:9,color:C.textDim,display:"block",marginBottom:4}}>LL (%) — para calcular IP automaticamente</label>
      <input type="number" step="any" className="inp" value={ll} onChange={e=>setLL(e.target.value)} style={{width:120,padding:"6px 8px"}} placeholder="opcional"/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(260px,100%),1fr))",gap:10,marginBottom:12}}>
    {rows.map((r,i)=>(
      <div key={i} style={{background:C.bg,borderRadius:8,padding:12,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,fontWeight:700,color:C.blue,marginBottom:8}}>Rolete {i+1}</div>
        {[["mc","Tara cápsula Mc (g)",""],["mcu","Mcáp+solo úmido Mcu (g)","📡"],["mcs","Mcáp+solo seco Mcs (g)","📡"]].map(([k,lb,s])=>(
          <div key={k} style={{marginBottom:6}}>
            <label style={{fontSize:9,color:C.textDim,display:"block",marginBottom:3}}>{lb}</label>
            <div style={{display:"flex",gap:6}}>
              <input type="number" step="any" className="inp" value={r[k]}
                onChange={e=>set(i,k,e.target.value)} style={{flex:1,padding:"6px 8px",fontSize:11}}/>
              {s==="📡"&&<BtnSerial onCapture={v=>set(i,k,v.toFixed(2))}/>}
            </div>
          </div>
        ))}
        {r.mc&&r.mcu&&r.mcs&&_num(r.mcs)>_num(r.mc)&&
          <div style={{fontSize:11,color:C.blue,fontWeight:700,marginTop:4}}>
            w = {((_num(r.mcu)-_num(r.mcs))/(_num(r.mcs)-_num(r.mc))*100).toFixed(1)} %
          </div>}
      </div>
    ))}
    </div>
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <button className="btn-g" onClick={()=>setRows(r=>[...r,{id:r.length,mc:"",mcu:"",mcs:""}])}>+ Rolete</button>
      <button className="btn-p" onClick={calc}>Calcular LP</button>
      {res&&<div style={{background:C.blue+"22",borderRadius:8,padding:"8px 14px",display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>LP</div><div style={{fontSize:14,fontWeight:700,color:C.blue}}>{res.lp} %</div></div>
        {res.ip&&<div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>IP</div><div style={{fontSize:14,fontWeight:700,color:C.blue}}>{res.ip} %</div></div>}
        <button className="btn-p" style={{fontSize:11,padding:"5px 12px"}} onClick={()=>{
          const out={"Limite de Plasticidade LP (%)":res.lp};
          if(res.ip) out["Índice de Plasticidade IP (%)"]=res.ip;
          out._taras_json=JSON.stringify(res.tarasDB_lp);
          onResult(out,{lp:res.lp,ip:res.ip,ws:res.ws});
        }}>✓ Usar estes resultados</button>
      </div>}
    </div>
  </div>);
}

// ── Cisalhamento Direto 4 Estágios — NBR 12069 ────────────────
function CalcCisalhamento({ onResult }){
  const [rows,setRows]=useState(_rowArr(4,()=>({sigma:"",tau:""})));
  const [res,setRes]=useState(null);
  const set=(i,k,v)=>setRows(r=>{const n=[...r];n[i]={...n[i],[k]:v};return n;});
  const calc=()=>{
    const pts=rows.map(r=>{const x=_num(r.sigma),y=_num(r.tau);return(x&&y)?{x,y}:null;}).filter(Boolean);
    if(pts.length<2){alert("Mínimo 2 estágios");return;}
    const{a,b,r2}=_linReg(pts);
    const phi=Math.atan(b)*(180/Math.PI);
    setRes({c:+a.toFixed(2),phi:+phi.toFixed(1),r2:+r2.toFixed(4),pts});
  };
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>τ = c' + σ·tan(φ') · σ e τ são valores líquidos (já descontada tara da prensa)</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(220px,100%),1fr))",gap:10,marginBottom:12}}>
    {rows.map((r,i)=>(
      <div key={i} style={{background:C.bg,borderRadius:8,padding:12,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,fontWeight:700,color:C.emerald,marginBottom:8}}>Estágio {i+1}</div>
        {[["sigma","Tensão Normal σ (kPa)","📡"],["tau","Resist. Cisalh. τmax (kPa)","📡"]].map(([k,lb])=>(
          <div key={k} style={{marginBottom:6}}>
            <label style={{fontSize:9,color:C.textDim,display:"block",marginBottom:3}}>{lb}</label>
            <div style={{display:"flex",gap:6}}>
              <input type="number" step="any" className="inp" value={r[k]}
                onChange={e=>set(i,k,e.target.value)} style={{flex:1,padding:"6px 8px",fontSize:11}}/>
              <BtnSerial onCapture={v=>set(i,k,v.toFixed(1))}/>
            </div>
          </div>
        ))}
      </div>
    ))}
    </div>
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <button className="btn-g" onClick={()=>setRows(r=>[...r,{id:r.length,sigma:"",tau:""}])}>+ Estágio</button>
      <button className="btn-p" onClick={calc}>Calcular Envoltória</button>
      {res&&<div style={{background:C.emerald+"22",borderRadius:8,padding:"8px 14px",display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>c'</div><div style={{fontSize:14,fontWeight:700,color:C.emerald}}>{res.c} kPa</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>φ'</div><div style={{fontSize:14,fontWeight:700,color:C.emerald}}>{res.phi}°</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>R²</div><div style={{fontSize:12,color:C.textDim}}>{res.r2}</div></div>
        <button className="btn-p" style={{fontSize:11,padding:"5px 12px"}} onClick={()=>onResult({"Coesão c' (kPa)":res.c,"Ângulo de Atrito φ' (°)":res.phi,"Tensão Normal σ máx (kPa)":Math.max(...res.pts.map(p=>p.x))},{cisalhamento:res})}>✓ Usar estes resultados</button>
      </div>}
    </div>
  </div>);
}

// ── Triaxial CIU/CID DIEFRA — 4300 kPa ───────────────────────
function CalcTriaxialDIEFRA({ tipo="CIU", onResult }){
  const [rows,setRows]=useState(_rowArr(3,()=>({s3:"",ds:"",u:""})));
  const [res,setRes]=useState(null);
  const set=(i,k,v)=>setRows(r=>{const rr=[...r];rr[i]={...rr[i],[k]:v};return rr;});
  const calc=()=>{
    const circs=rows.map(r=>{
      const s3=_num(r.s3),ds=_num(r.ds),u=tipo==="CIU"?_num(r.u):0;
      if(!s3||!ds) return null;
      const s1eff=(s3-u)+ds, s3eff=s3-u;
      return{s3eff,s1eff,R:(s1eff-s3eff)/2,Sc:(s1eff+s3eff)/2};
    }).filter(Boolean);
    if(circs.length<2){alert("Mínimo 2 CPs");return;}
    const pts=circs.map(c=>({x:c.Sc,y:c.R}));
    const{a:a_,b:b_}=_linReg(pts);
    const phi=Math.asin(Math.min(Math.abs(b_),0.999))*(180/Math.PI);
    const c_=a_/Math.cos(phi*Math.PI/180);
    const out=tipo==="CIU"
      ?{"Coesão cu (kPa)":+c_.toFixed(2),"Ângulo φu (°)":+phi.toFixed(1),"Pressão de célula σ3 (kPa)":Math.max(...rows.map(r=>_num(r.s3))),"Tensão desviadora Δσ (kPa)":Math.max(...rows.map(r=>_num(r.ds))),"Pressão intersticial u (kPa)":Math.max(...rows.map(r=>_num(r.u)))}
      :{"Coesão efetiva c' (kPa)":+c_.toFixed(2),"Ângulo de Atrito φ' (°)":+phi.toFixed(1),"Pressão de célula σ3 (kPa)":Math.max(...rows.map(r=>_num(r.s3))),"Tensão desviadora Δσ (kPa)":Math.max(...rows.map(r=>_num(r.ds)))};
    setRes({c:+c_.toFixed(2),phi:+phi.toFixed(1),circs,tipo,out});
  };
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>
      {tipo==="CIU"?"CIU Consolidado-Não-Drenado (σ saturado)":"CID Consolidado-Drenado"} · σ₃ máx 4300 kPa
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(240px,100%),1fr))",gap:10,marginBottom:12}}>
    {rows.map((r,i)=>(
      <div key={i} style={{background:C.bg,borderRadius:8,padding:12,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,fontWeight:700,color:C.teal,marginBottom:8}}>CP {i+1}</div>
        {[["s3","Pressão de célula σ₃ (kPa)","📡"],["ds","Tensão desviadora Δσ (kPa)","📡"],tipo==="CIU"?["u","Pressão intersticial u (kPa)","📡"]:null].filter(Boolean).map(([k,lb])=>(
          <div key={k} style={{marginBottom:6}}>
            <label style={{fontSize:9,color:C.textDim,display:"block",marginBottom:3}}>{lb}</label>
            <div style={{display:"flex",gap:6}}>
              <input type="number" step="any" className="inp" value={r[k]||""}
                onChange={e=>set(i,k,e.target.value)} style={{flex:1,padding:"6px 8px",fontSize:11}}/>
              <BtnSerial onCapture={v=>set(i,k,v.toFixed(1))}/>
            </div>
          </div>
        ))}
      </div>
    ))}
    </div>
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <button className="btn-g" onClick={()=>setRows(r=>[...r,{id:r.length,s3:"",ds:"",u:""}])}>+ CP</button>
      <button className="btn-p" onClick={calc}>Calcular Parâmetros</button>
      {res&&<div style={{background:C.teal+"22",borderRadius:8,padding:"8px 14px",display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>{tipo==="CIU"?"cu":"c'"}</div><div style={{fontSize:14,fontWeight:700,color:C.teal}}>{res.c} kPa</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>{tipo==="CIU"?"φu":"φ'"}</div><div style={{fontSize:14,fontWeight:700,color:C.teal}}>{res.phi}°</div></div>
        <button className="btn-p" style={{fontSize:11,padding:"5px 12px"}} onClick={()=>onResult(res.out,{triaxial:{circs:res.circs,c:res.c,phi:res.phi,tipo:res.tipo}})}>✓ Usar estes resultados</button>
      </div>}
    </div>
  </div>);
}
function CalcTriaxialCIU({ onResult }){ return <CalcTriaxialDIEFRA tipo="CIU" onResult={onResult}/>; }
function CalcTriaxialCID({ onResult }){ return <CalcTriaxialDIEFRA tipo="CID" onResult={onResult}/>; }

// ── Adensamento Edométrico — NBR 12007 ────────────────────────
function CalcAdensamento({ comPermeab=false, onResult }){
  const [estagio,setEstagio]=useState(_rowArr(5,()=>({sigma:"",e:"",t50:"",Hm:"",k:""})));
  const [res,setRes]=useState(null);
  const setS=(i,k,v)=>setEstagio(r=>{const n=[...r];n[i]={...n[i],[k]:v};return n;});
  const calc=()=>{
    const pts=estagio.map(r=>{const s=_num(r.sigma),e=_num(r.e);return(s>0&&e>=0)?{s,e,t50:_num(r.t50),Hm:_num(r.Hm),k:_num(r.k)}:null;}).filter(Boolean);
    if(pts.length<3){alert("Mínimo 3 estágios");return;}
    const logpts=pts.map(p=>({x:Math.log10(p.s),y:p.e}));
    const{b:cc_neg}=_linReg(logpts);
    const Cc=Math.abs(cc_neg), Cs=Cc*0.15;
    const cvs=pts.filter(p=>p.t50>0&&p.Hm>0).map(p=>{const Hd=p.Hm/2;return 0.848*Hd*Hd/p.t50;});
    const Cv=cvs.length?cvs.reduce((s,v)=>s+v,0)/cvs.length:null;
    const sigmap=pts.reduce((prev,cur)=>cur.s>prev.s?cur:prev).s;
    const out={"Índice de Compressão Cc":+Cc.toFixed(4),"Índice de Recompressão Cs":+Cs.toFixed(4),"Tensão Pré-adensamento σp (kPa)":+sigmap.toFixed(1),"Índice de Vazios Inicial e0":+pts[0].e.toFixed(4)};
    if(Cv) out["Coef. Adensamento Cv (cm²/s)"]=+Cv.toFixed(6);
    if(comPermeab){const ks=pts.filter(p=>p.k>0).map(p=>p.k);if(ks.length)out["Permeabilidade k (cm/s)"]=+(ks.reduce((s,v)=>s+v,0)/ks.length).toExponential(2);}
    setRes({...out,_pts:pts});
  };
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>e × log(σ) · Cv por Taylor (t₅₀) · σp por Casagrande</div>
    <div style={{overflowX:"auto",marginBottom:12}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
        <thead><tr>{["Est.","σ (kPa)","e","t₅₀ (min)","Hm (cm)",comPermeab?"k (cm/s)":""].filter(Boolean).map(h=>(
          <th key={h} style={{background:C.surface,padding:"6px 10px",fontSize:9,color:C.textDim,borderBottom:`1px solid ${C.border}`,textAlign:"left"}}>{h}</th>
        ))}</tr></thead>
        <tbody>{estagio.map((r,i)=>(
          <tr key={i}><td style={{padding:"4px 8px",color:C.textDim,fontSize:10}}>{i+1}</td>
            {["sigma","e","t50","Hm",comPermeab?"k":""].filter(Boolean).map(k=>(
              <td key={k} style={{padding:"4px 6px"}}>
                <input type="number" step="any" className="inp" value={r[k]||""}
                  onChange={e=>setS(i,k,e.target.value)} style={{width:"100%",padding:"4px 6px",fontSize:10}}/>
              </td>
            ))}
          </tr>
        ))}</tbody>
      </table>
    </div>
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <button className="btn-g" onClick={()=>setEstagio(r=>[...r,{id:r.length,sigma:"",e:"",t50:"",Hm:"",k:""}])}>+ Estágio</button>
      <button className="btn-p" onClick={calc}>Calcular Adensamento</button>
      {res&&<div style={{background:C.gold+"22",borderRadius:8,padding:"8px 14px",display:"flex",gap:12,flexWrap:"wrap"}}>
        {Object.entries(res).map(([k,v])=>(
          <div key={k} style={{textAlign:"center"}}>
            <div style={{fontSize:8,color:C.textDim,maxWidth:80}}>{k}</div>
            <div style={{fontSize:12,fontWeight:700,color:C.gold,fontFamily:"'JetBrains Mono',monospace"}}>{v}</div>
          </div>
        ))}
      
        <button className="btn-p" style={{fontSize:11,padding:"5px 12px",marginLeft:"auto"}} onClick={()=>{
          const {_pts,...out}=res;
          onResult(out,{adensamento:{pts:_pts,...out}});
        }}>✓ Usar estes resultados</button>
      </div>}
    </div>
  </div>);
}
function CalcAdensamentoSem({ onResult }){ return <CalcAdensamento comPermeab={false} onResult={onResult}/>; }
function CalcAdensamentoCom({ onResult }){ return <CalcAdensamento comPermeab={true}  onResult={onResult}/>; }

// ── Compacidade emax/emin ─────────────────────────────────────
function CalcCompacidade({ modo="max", onResult }){
  const [d,setD]=useState({ms:"",vf:"",gs:"2.67"});
  const set=(k,v)=>setD(x=>({...x,[k]:v}));
  const [res,setRes]=useState(null);
  const calc=()=>{
    const ms=_num(d.ms),vf=_num(d.vf),gs=_num(d.gs)||2.67;
    if(!ms||!vf){alert("Preencha massa e volume");return;}
    const rho=ms/vf, e=(gs/rho)-1;
    setRes({e:+e.toFixed(3),rho:+rho.toFixed(3)});
  };
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>e = Gs/ρd − 1 · Estado: {modo==="max"?"Mais Solto (emax) — NBR 12004":"Mais Denso (emin) — NBR 12051"}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(180px,100%),1fr))",gap:10,marginBottom:12}}>
      {[["ms","Massa solo seco Ms (g)","📡"],["vf","Volume frasco Vf (cm³)",""],["gs","Gs (g/cm³)",""]].map(([k,lb,s])=>(
        <div key={k}><label style={{fontSize:9,color:C.textDim,display:"block",marginBottom:4}}>{lb}</label>
          <div style={{display:"flex",gap:6}}>
            <input type="number" step="any" className="inp" value={d[k]} onChange={e=>set(k,e.target.value)} style={{flex:1,padding:"7px 9px",fontSize:11}}/>
            {s==="📡"&&<BtnSerial onCapture={v=>set(k,v.toFixed(2))}/>}
          </div>
        </div>
      ))}
    </div>
    <div style={{display:"flex",gap:8,alignItems:"center"}}>
      <button className="btn-p" onClick={calc}>Calcular e{modo==="max"?"max":"min"}</button>
      {res&&<div style={{background:C.teal+"22",borderRadius:8,padding:"8px 14px",display:"flex",gap:16,alignItems:"center"}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>e{modo==="max"?"max":"min"}</div><div style={{fontSize:14,fontWeight:700,color:C.teal}}>{res.e}</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>ρd (g/cm³)</div><div style={{fontSize:14,fontWeight:700,color:C.teal}}>{res.rho}</div></div>
        <button className="btn-p" style={{fontSize:11,padding:"5px 12px"}} onClick={()=>modo==="max"?onResult({"Índice de Vazio Máximo emax":res.e,"ρdmin (g/cm³)":res.rho},res):onResult({"Índice de Vazio Mínimo emin":res.e,"ρdmax (g/cm³)":res.rho},res)}>✓ Usar estes resultados</button>
      </div>}
    </div>
  </div>);
}
function CalcEmaxComp({ onResult }){ return <CalcCompacidade modo="max" onResult={onResult}/>; }
function CalcEminComp({ onResult }){ return <CalcCompacidade modo="min" onResult={onResult}/>; }

// ── Permeabilidade Carga Variável — NBR 14545 ─────────────────
function CalcPermCargaVariavel({ onResult }){
  const [d,setD]=useState({a:"",A:"",L:"",t:"",h1:"",h2:""});
  const [res,setRes]=useState(null);
  const set=(k,v)=>setD(x=>({...x,[k]:v}));
  const calc=()=>{
    const a=_num(d.a),A=_num(d.A),L=_num(d.L),t=_num(d.t),h1=_num(d.h1),h2=_num(d.h2);
    if(!a||!A||!L||!t||!h1||!h2){alert("Preencha todos");return;}
    const k=(a*L)/(A*t)*Math.log(h1/h2);
    setRes(+k.toFixed(8));
  };
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>k = (a·L / A·t) · ln(h1/h2)</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(180px,100%),1fr))",gap:10,marginBottom:12}}>
      {[["a","Área tubo a (cm²)"],["A","Área corpo A (cm²)"],["L","Comprimento L (cm)"],["t","Tempo t (s)"],["h1","Carga inicial h1 (cm)"],["h2","Carga final h2 (cm)"]].map(([k,lb])=>(
        <div key={k}><label style={{fontSize:9,color:C.textDim,display:"block",marginBottom:4}}>{lb}</label>
          <input type="number" step="any" className="inp" value={d[k]} onChange={e=>set(k,e.target.value)} style={{width:"100%",padding:"7px 9px",fontSize:11}}/></div>
      ))}
    </div>
    <div style={{display:"flex",gap:8,alignItems:"center"}}>
      <button className="btn-p" onClick={calc}>Calcular k</button>
      {res!==null&&<div style={{background:C.teal+"22",borderRadius:8,padding:"8px 14px",display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:13,fontWeight:700,color:C.teal}}>k = {res} cm/s</span>
        <button className="btn-p" style={{fontSize:11,padding:"5px 12px"}} onClick={()=>onResult({"Coef. Permeabilidade k (cm/s)":res},{perm:{k:res}})}>✓ Usar estes resultados</button>
      </div>}
    </div>
  </div>);
}

// ── Permeabilidade Carga Constante — NBR 14545 ────────────────
function CalcPermCargaConstante({ onResult }){
  const [d,setD]=useState({Q:"",A:"",L:"",Dh:"",t:""});
  const [res,setRes]=useState(null);
  const set=(k,v)=>setD(x=>({...x,[k]:v}));
  const calc=()=>{
    const Q=_num(d.Q),A=_num(d.A),L=_num(d.L),Dh=_num(d.Dh),t=_num(d.t);
    if(!Q||!A||!L||!Dh||!t){alert("Preencha todos");return;}
    const k=(Q*L)/(A*Dh*t);
    setRes(+k.toFixed(8));
  };
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>k = Q·L / (A·Δh·t) — Lei de Darcy</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(180px,100%),1fr))",gap:10,marginBottom:12}}>
      {[["Q","Vazão Q (cm³)"],["A","Área seção A (cm²)"],["L","Comprimento L (cm)"],["Dh","Perda de carga Δh (cm)"],["t","Tempo t (s)"]].map(([k,lb])=>(
        <div key={k}><label style={{fontSize:9,color:C.textDim,display:"block",marginBottom:4}}>{lb}</label>
          <input type="number" step="any" className="inp" value={d[k]} onChange={e=>set(k,e.target.value)} style={{width:"100%",padding:"7px 9px",fontSize:11}}/></div>
      ))}
    </div>
    <div style={{display:"flex",gap:8,alignItems:"center"}}>
      <button className="btn-p" onClick={calc}>Calcular k</button>
      {res!==null&&<div style={{background:C.teal+"22",borderRadius:8,padding:"8px 14px",display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:13,fontWeight:700,color:C.teal}}>k = {res} cm/s</span>
        <button className="btn-p" style={{fontSize:11,padding:"5px 12px"}} onClick={()=>onResult({"Coef. Permeabilidade k (cm/s)":res},{perm:{k:res}})}>✓ Usar estes resultados</button>
      </div>}
    </div>
  </div>);
}

// ── ISC variantes — reutiliza CalcCBR ────────────────────────
function CalcISC03({ onResult }){ return <CalcCBR onResult={onResult}/>; }
function CalcISC05({ onResult }){ return <CalcCBR onResult={onResult}/>; }
function CalcISC01({ onResult }){ return <CalcCBR onResult={onResult}/>; }

// ── Equivalente de Areia — NBR NM 30 ─────────────────────────
function CalcEquivalenteAreia({ onResult }){
  const [rows,setRows]=useState(_rowArr(3,()=>({h1:"",h2:""})));
  const [res,setRes]=useState(null);
  const set=(i,k,v)=>setRows(r=>{const n=[...r];n[i]={...n[i],[k]:v};return n;});
  const calc=()=>{
    const eas=rows.map(r=>{const h1=_num(r.h1),h2=_num(r.h2);return(h1&&h2)?+(h2/h1*100).toFixed(1):null;}).filter(v=>v!==null);
    if(!eas.length){alert("Preencha ao menos 1");return;}
    const ea_med=+(eas.reduce((s,v)=>s+v,0)/eas.length).toFixed(1);
    setRes({ea_med,eas});
  };
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>EA = (h₂/h₁)×100 · h₁=altura total · h₂=altura areia sedimentada</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(240px,100%),1fr))",gap:10,marginBottom:12}}>
    {rows.map((r,i)=>(
      <div key={i} style={{background:C.bg,borderRadius:8,padding:12,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,fontWeight:700,color:C.gold,marginBottom:8}}>Ensaio {i+1}</div>
        {[["h1","h₁ — Alt. total suspensão (mm)"],["h2","h₂ — Alt. areia sedimentada (mm)"]].map(([k,lb])=>(
          <div key={k} style={{marginBottom:6}}>
            <label style={{fontSize:9,color:C.textDim,display:"block",marginBottom:3}}>{lb}</label>
            <input type="number" step="any" className="inp" value={r[k]} onChange={e=>set(i,k,e.target.value)} style={{width:"100%",padding:"6px 8px",fontSize:11}}/>
          </div>
        ))}
        {r.h1&&r.h2&&<div style={{fontSize:11,color:C.gold,fontWeight:700,marginTop:4}}>
          EA = {(_num(r.h2)/_num(r.h1)*100).toFixed(1)} %
        </div>}
      </div>
    ))}
    </div>
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <button className="btn-g" onClick={()=>setRows(r=>[...r,{id:r.length,h1:"",h2:""}])}>+ Ensaio</button>
      <button className="btn-p" onClick={calc}>Calcular EA</button>
      {res&&<div style={{background:C.gold+"22",borderRadius:8,padding:"8px 14px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <span style={{fontSize:14,fontWeight:700,color:C.gold}}>EA médio = {res.ea_med} %{res.ea_med>=55?" ✓ CONFORME":" ⚠ ABAIXO DO LIMITE"}</span>
        <button className="btn-p" style={{fontSize:11,padding:"5px 12px"}} onClick={()=>onResult({"Equivalente de Areia EA (%)":res.ea_med},{ea:res})}>✓ Usar estes resultados</button>
      </div>}
    </div>
  </div>);
}

// ── DSS — Direct Simple Shear — ASTM D6528 ───────────────────
function CalcDSS({ onResult }){
  const [rows,setRows]=useState(_rowArr(5,()=>({gamma:"",tau:""})));
  const [sigv,setSigv]=useState("");
  const [res,setRes]=useState(null);
  const set=(i,k,v)=>setRows(r=>{const n=[...r];n[i]={...n[i],[k]:v};return n;});
  const calc=()=>{
    const pts=rows.map(r=>{const g=_num(r.gamma),t=_num(r.tau);return(g&&t)?{x:g,y:t}:null;}).filter(Boolean);
    if(!pts.length){alert("Preencha ao menos 1 ponto");return;}
    const tau_max=Math.max(...pts.map(p=>p.y));
    const g_peak=pts.find(p=>p.y===tau_max)?.x||0;
    const sv=_num(sigv), ratio=sv?+(tau_max/sv).toFixed(3):null;
    const out={"Resistência de Pico τmax (kPa)":+tau_max.toFixed(2),"Deformação de Pico γ (%)":+g_peak.toFixed(2)};
    if(ratio) out["Razão Su/σv'"]=ratio;
    setRes({tau_max:+tau_max.toFixed(2),g_peak:+g_peak.toFixed(2),ratio,_pts:pts,_out:out});
  };
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>Curva τ × γ · identificação do pico</div>
    <div style={{marginBottom:10}}>
      <label style={{fontSize:9,color:C.textDim,display:"block",marginBottom:4}}>Tensão vertical efetiva σ'v (kPa) — para Su/σ'v (opcional)</label>
      <input type="number" step="any" className="inp" value={sigv} onChange={e=>setSigv(e.target.value)} style={{width:140,padding:"6px 8px"}}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(200px,100%),1fr))",gap:8,marginBottom:12}}>
    {rows.map((r,i)=>(
      <div key={i} style={{background:C.bg,borderRadius:8,padding:10,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:9,color:C.textDim,marginBottom:6}}>Ponto {i+1}</div>
        {[["gamma","Deformação γ (%)"],["tau","Tensão cisalh. τ (kPa)"]].map(([k,lb])=>(
          <div key={k} style={{marginBottom:5}}>
            <label style={{fontSize:8,color:C.textDim,display:"block",marginBottom:2}}>{lb}</label>
            <div style={{display:"flex",gap:5}}>
              <input type="number" step="any" className="inp" value={r[k]}
                onChange={e=>set(i,k,e.target.value)} style={{flex:1,padding:"5px 7px",fontSize:10}}/>
              <BtnSerial onCapture={v=>set(i,k,v.toFixed(2))}/>
            </div>
          </div>
        ))}
      </div>
    ))}
    </div>
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <button className="btn-g" onClick={()=>setRows(r=>[...r,{id:r.length,gamma:"",tau:""}])}>+ Ponto</button>
      <button className="btn-p" onClick={calc}>Calcular DSS</button>
      {res&&<div style={{background:"#a78bfa22",borderRadius:8,padding:"8px 14px",display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>τmax</div><div style={{fontSize:14,fontWeight:700,color:"#a78bfa"}}>{res.tau_max} kPa</div></div>
        {res.ratio&&<div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>Su/σ'v</div><div style={{fontSize:14,fontWeight:700,color:"#a78bfa"}}>{res.ratio}</div></div>}
        <button className="btn-p" style={{fontSize:11,padding:"5px 12px"}} onClick={()=>onResult(res._out,{dss:{pts:res._pts,tau_max:res.tau_max,g_peak:res.g_peak,ratio:res.ratio}})}>✓ Usar estes resultados</button>
      </div>}
    </div>
  </div>);
}

// ── Wrappers para variantes ───────────────────────────────────
function CalcGranPen({  onResult }){ return <CalcGranulometria onResult={onResult}/>; }
function CalcGranComp({ onResult }){ return <CalcGranulometria onResult={onResult}/>; }
function CalcGranSed({  onResult }){ return <CalcGranulometria onResult={onResult}/>; }
function CalcProctorNorm({    onResult }){ return <CalcProctor onResult={onResult}/>; }
function CalcProctorMod({     onResult }){ return <CalcProctor onResult={onResult}/>; }
function CalcProctorIntern({  onResult }){ return <CalcProctor onResult={onResult}/>; }
function CalcProctorInterm({  onResult }){ return <CalcProctor onResult={onResult}/>; }
function CalcProctorIntermod({ onResult }){ return <CalcProctor onResult={onResult}/>; }


// ══════════════════════════════════════════════════════════════
//  CALCULADORAS NOVAS — v2.7
// ══════════════════════════════════════════════════════════════

// ── SPT — ABNT NBR 6484:2001 ─────────────────────────────────
function CalcSPT({ onResult }){
  const EF = ()=>({prof:"",nspt:"",solo:"areia"});
  const [rows,setRows]=useState(_rowArr(6,EF));
  const [na,setNA]=useState("");
  const [er,setER]=useState("72");
  const [res,setRes]=useState(null);
  const set=(i,k,v)=>setRows(r=>{const n=[...r];n[i]={...n[i],[k]:v};return n;});

  const classifica=(n,solo)=>{
    if(solo==="argila"){
      if(n<=2)  return"Muito Mole";
      if(n<=4)  return"Mole";
      if(n<=8)  return"Média";
      if(n<=15) return"Rija";
      if(n<=30) return"Muito Rija";
      return"Dura";
    }
    if(n<=4)  return"Fofinha";
    if(n<=10) return"Pouco Compacta";
    if(n<=30) return"Med. Compacta";
    if(n<=50) return"Compacta";
    return"M. Compacta";
  };

  const calc=()=>{
    const pts=rows.map(r=>{
      const p=_num(r.prof),n=parseInt(r.nspt);
      if(!p||isNaN(n)) return null;
      return{p,n,solo:r.solo||"areia"};
    }).filter(Boolean);
    if(!pts.length){alert("Preencha ao menos 1 camada");return;}
    const naV=_num(na)||9999, erV=_num(er)||72;
    // γ acima NA=18 kN/m³, abaixo NA γ'=8 kN/m³ (NBR 6484 C.1)
    let sigV=0,layers=[];
    for(let i=0;i<pts.length;i++){
      const dz=i===0?pts[i].p:pts[i].p-pts[i-1].p;
      const gamma=pts[i].p<=naV?18:8;
      sigV+=gamma*dz;
      const sigVeff=Math.max(10,sigV);
      const n60=+(pts[i].n*(erV/60)).toFixed(1);
      const cn=Math.min(2.0,+Math.sqrt(100/sigVeff).toFixed(3));
      const n1_60=+(cn*n60).toFixed(1);
      layers.push({...pts[i],sigVeff:+sigVeff.toFixed(1),n60,cn,n1_60,
        classe:classifica(pts[i].n,pts[i].solo)});
    }
    const nspt_med=+(layers.reduce((s,l)=>s+l.n,0)/layers.length).toFixed(1);
    const n60_med =+(layers.reduce((s,l)=>s+l.n60,0)/layers.length).toFixed(1);
    const prof_max=Math.max(...layers.map(l=>l.p));
    setRes({layers,nspt_med,n60_med,prof_max,na_m:_num(na)||null});
  };

  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>
      N60 = N × ER/60 · CN = √(100/σ'v0) ≤ 2 · N1(60) = CN × N60 — NBR 6484
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
      <div><label className="lbl">Nível d'Água NA (m)</label>
        <input type="number" step="any" className="inp" value={na} onChange={e=>setNA(e.target.value)}
          style={{padding:"7px 10px",width:"100%"}} placeholder="ex: 3.5"/></div>
      <div><label className="lbl">Razão de Energia ER (%)</label>
        <select className="inp" value={er} onChange={e=>setER(e.target.value)} style={{padding:"7px 10px",width:"100%"}}>
          <option value="72">72 % — corda simples (típico BR)</option>
          <option value="60">60 % — referência N60</option>
          <option value="78">78 % — automático japonês</option>
          <option value="45">45 % — martelete segurança</option>
        </select></div>
    </div>
    <div style={{overflowX:"auto",marginBottom:10}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
        <thead><tr style={{background:C.surface}}>
          {["Prof. (m)","NSPT","Tipo Solo"].map(h=>(
            <th key={h} style={{padding:"5px 8px",textAlign:"left",color:C.textDim,fontSize:9,fontWeight:600}}>{h}</th>
          ))}
        </tr></thead>
        <tbody>{rows.map((r,i)=>(
          <tr key={i}>
            <td style={{padding:3}}><input type="number" step="any" className="inp" value={r.prof}
              onChange={e=>set(i,"prof",e.target.value)} style={{width:"100%",padding:"5px 7px",fontSize:11}}
              placeholder={`${(i+1)*1.5}`}/></td>
            <td style={{padding:3}}><input type="number" className="inp" value={r.nspt}
              onChange={e=>set(i,"nspt",e.target.value)} style={{width:"100%",padding:"5px 7px",fontSize:11}}/></td>
            <td style={{padding:3}}>
              <select className="inp" value={r.solo} onChange={e=>set(i,"solo",e.target.value)}
                style={{width:"100%",padding:"5px 7px",fontSize:11}}>
                <option value="areia">Areia / Silte</option>
                <option value="argila">Argila</option>
              </select></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:12}}>
      <button className="btn-g" onClick={()=>setRows(r=>[...r,EF()])}>+ Camada</button>
      <button className="btn-p" onClick={calc}>Calcular SPT</button>
    </div>
    {res&&<div>
      <div style={{background:C.emerald+"22",borderRadius:8,padding:"8px 14px",display:"flex",gap:16,flexWrap:"wrap",alignItems:"center",marginBottom:8}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>NSPT médio</div><div style={{fontSize:14,fontWeight:700,color:C.emerald}}>{res.nspt_med}</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>N60 médio</div><div style={{fontSize:14,fontWeight:700,color:C.teal}}>{res.n60_med}</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>Prof. máx</div><div style={{fontSize:14,fontWeight:700,color:C.text}}>{res.prof_max} m</div></div>
        {res.na_m&&<div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>NA</div><div style={{fontSize:14,fontWeight:700,color:C.blue}}>{res.na_m} m</div></div>}
        <button className="btn-p" style={{fontSize:11,padding:"5px 12px",marginLeft:"auto"}} onClick={()=>onResult({
          "NSPT médio":res.nspt_med,"Prof. máxima":res.prof_max,"N60 médio":res.n60_med,
          "Nível d'água (NA)":res.na_m??null,
        },{spt:res})}>✓ Usar estes resultados</button>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
          <thead><tr style={{background:C.surface}}>
            {["Prof.","NSPT","N60","σ'v0 (kPa)","CN","N1(60)","Classificação"].map(h=>(
              <th key={h} style={{padding:"5px 8px",color:C.textDim,fontWeight:600,fontSize:9,
                textAlign:"left",borderBottom:`1px solid ${C.border}`}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{res.layers.map((l,i)=>(
            <tr key={i} style={{borderBottom:`1px solid ${C.border}22`}}>
              <td style={{padding:"4px 8px"}}>{l.p} m</td>
              <td style={{padding:"4px 8px",fontWeight:700,
                color:l.n>=30?C.emerald:l.n>=10?C.gold:C.red}}>{l.n}</td>
              <td style={{padding:"4px 8px"}}>{l.n60}</td>
              <td style={{padding:"4px 8px"}}>{l.sigVeff}</td>
              <td style={{padding:"4px 8px"}}>{l.cn}</td>
              <td style={{padding:"4px 8px",fontWeight:700,color:C.teal}}>{l.n1_60}</td>
              <td style={{padding:"4px 8px",fontSize:9,color:C.textDim}}>{l.classe}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>}
  </div>);
}

// ── Tração Diametral (Splitting Test) — ABNT NBR 7222:2011 ───
function CalcTracaoDiametral({ onResult }){
  const [rows,setRows]=useState(_rowArr(3,()=>({d:"100",l:"200",f:""})));
  const [res,setRes]=useState(null);
  const set=(i,k,v)=>setRows(r=>{const n=[...r];n[i]={...n[i],[k]:v};return n;});
  const calc=()=>{
    const vals=rows.map(r=>{
      const d=_num(r.d),l=_num(r.l),f=_num(r.f);
      if(!d||!l||!f) return null;
      // fct,sp = 2F / (π × d × l)   [F em N, d e l em mm → MPa]
      const fct=+(2*f*1000/(Math.PI*d*l)).toFixed(3);
      return{d,l,f,fct};
    }).filter(Boolean);
    if(!vals.length){alert("Preencha ao menos 1 CP");return;}
    const fct_med=+(vals.reduce((s,v)=>s+v.fct,0)/vals.length).toFixed(3);
    const conforme=fct_med>=2.5;
    setRes({vals,fct_med,conforme});
  };
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>
      fct,sp = 2F / (π × d × l) — F em kN, d e l em mm → MPa — NBR 7222:2011
    </div>
    <div style={{overflowX:"auto",marginBottom:10}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
        <thead><tr style={{background:C.surface}}>
          {["CP","Diâm. d (mm)","Comprimento l (mm)","Força F (kN)"].map(h=>(
            <th key={h} style={{padding:"5px 8px",textAlign:"left",color:C.textDim,fontSize:9,fontWeight:600}}>{h}</th>
          ))}
        </tr></thead>
        <tbody>{rows.map((r,i)=>(
          <tr key={i}>
            <td style={{padding:3,color:C.textDim,fontSize:10,paddingLeft:8}}>CP {i+1}</td>
            {["d","l","f"].map(k=>(
              <td key={k} style={{padding:3}}>
                <input type="number" step="any" className="inp" value={r[k]}
                  onChange={e=>set(i,k,e.target.value)}
                  style={{width:"100%",padding:"5px 7px",fontSize:11}}/>
              </td>
            ))}
          </tr>
        ))}</tbody>
      </table>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:10}}>
      <button className="btn-g" onClick={()=>setRows(r=>[...r,{d:"100",l:"200",f:""}])}>+ CP</button>
      <button className="btn-p" onClick={calc}>Calcular fct,sp</button>
    </div>
    {res&&<div style={{background:(res.conforme?C.emerald:C.red)+"22",borderRadius:8,
      padding:"8px 14px",display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:9,color:C.textDim}}>fct,sp médio</div>
        <div style={{fontSize:14,fontWeight:700,color:res.conforme?C.emerald:C.red}}>{res.fct_med} MPa</div>
      </div>
      <div style={{fontSize:10,color:res.conforme?C.emerald:C.red,fontWeight:700}}>
        {res.conforme?"✓ CONFORME (≥ 2,5 MPa)":"⚠ NÃO CONFORME (< 2,5 MPa)"}
      </div>
      <button className="btn-p" style={{fontSize:11,padding:"5px 12px",marginLeft:"auto"}}
        onClick={()=>onResult({"fctk (28 dias)":res.fct_med},{tracao_diametral:res})}>
        ✓ Usar estes resultados</button>
    </div>}
  </div>);
}

// ── Módulo de Elasticidade — ABNT NBR 8522:2021 ───────────────
function CalcModuloElasticidade({ onResult }){
  // Método A: carga incremental (corda 30 % → 40% → 30%)
  // Ecs = (σb - σa) / (εb - εa)  onde σ = carga/área, ε = deformação relativa
  const [dim,setDim]=useState({diam:"100",alt:"200"});
  const [fu,setFu]=useState(""); // carga de ruptura kN (do ensaio de compressão)
  const [rows,setRows]=useState(_rowArr(2,()=>({f:"",dl:""})));
  const [res,setRes]=useState(null);
  const set=(i,k,v)=>setRows(r=>{const n=[...r];n[i]={...n[i],[k]:v};return n;});
  const setD=(k,v)=>setDim(x=>({...x,[k]:v}));
  const calc=()=>{
    const d=_num(dim.diam),h=_num(dim.alt),fuV=_num(fu);
    if(!d||!h){alert("Preencha dimensões");return;}
    const A=Math.PI*(d/2)**2; // mm²
    // Pontos a=0,30%fu e b=40%fu
    const fa=_num(rows[0].f),fb=_num(rows[1].f);
    const dla=_num(rows[0].dl),dlb=_num(rows[1].dl);
    if(!fa||!fb||!dla||!dlb){alert("Preencha cargas e deformações");return;}
    const sa=(fa*1000)/A; // MPa
    const sb=(fb*1000)/A; // MPa
    const ea=dla/h;       // adimensional (relativo)
    const eb=dlb/h;
    if(Math.abs(eb-ea)<1e-9){alert("Deformações iguais — verifique");return;}
    const Ecs=+((sb-sa)/(eb-ea)/1000).toFixed(2); // GPa
    const fuMPa=fuV?+((fuV*1000)/A).toFixed(2):null;
    setRes({Ecs,sa:+sa.toFixed(2),sb:+sb.toFixed(2),ea:+(ea*1e6).toFixed(0),
      eb:+(eb*1e6).toFixed(0),A:+A.toFixed(0),fuMPa});
  };
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>
      Método A — Corda: σa=30%fu → σb=40%fu · Ecs = (σb−σa)/(εb−εa) — NBR 8522:2021
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
      <div><label className="lbl">Diâmetro (mm)</label>
        <input type="number" step="any" className="inp" value={dim.diam} onChange={e=>setD("diam",e.target.value)} style={{padding:"7px 10px",width:"100%"}}/></div>
      <div><label className="lbl">Altura (mm)</label>
        <input type="number" step="any" className="inp" value={dim.alt} onChange={e=>setD("alt",e.target.value)} style={{padding:"7px 10px",width:"100%"}}/></div>
      <div><label className="lbl">Força ruptura Fu (kN)</label>
        <input type="number" step="any" className="inp" value={fu} onChange={e=>setFu(e.target.value)} style={{padding:"7px 10px",width:"100%"}} placeholder="opcional"/></div>
    </div>
    <div style={{marginBottom:8,fontSize:10,color:C.textDim}}>Ponto A = 30% Fu — Ponto B = 40% Fu</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
      {[["Ponto A (30% Fu) — Força (kN)","Ponto A — Deform. ΔL (mm)"],
        ["Ponto B (40% Fu) — Força (kN)","Ponto B — Deform. ΔL (mm)"]].map(([la,lb],i)=>(
        <React.Fragment key={i}>
          <div><label className="lbl">{la}</label>
            <input type="number" step="any" className="inp" value={rows[i].f}
              onChange={e=>set(i,"f",e.target.value)} style={{padding:"7px 10px",width:"100%"}}/></div>
          <div><label className="lbl">{lb}</label>
            <input type="number" step="any" className="inp" value={rows[i].dl}
              onChange={e=>set(i,"dl",e.target.value)} style={{padding:"7px 10px",width:"100%"}}/></div>
        </React.Fragment>
      ))}
    </div>
    <button className="btn-p" onClick={calc}>Calcular Ecs</button>
    {res&&<div style={{background:C.blue+"22",borderRadius:8,padding:"8px 14px",
      display:"flex",gap:16,flexWrap:"wrap",alignItems:"center",marginTop:10}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>Ecs</div>
        <div style={{fontSize:14,fontWeight:700,color:C.blue}}>{res.Ecs} GPa</div></div>
      {res.fuMPa&&<div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>fck est.</div>
        <div style={{fontSize:14,fontWeight:700,color:C.gold}}>{res.fuMPa} MPa</div></div>}
      <button className="btn-p" style={{fontSize:11,padding:"5px 12px",marginLeft:"auto"}}
        onClick={()=>onResult({"Módulo Secante (Ecs)":res.Ecs},{modulo:res})}>
        ✓ Usar estes resultados</button>
    </div>}
  </div>);
}

// ── Tração em Aço — ABNT NBR 6152:2016 / NBR 7480 ────────────
function CalcTracaoAco({ onResult }){
  const [rows,setRows]=useState(_rowArr(3,()=>({diam:"12.5",lo:"100",fy:"",fu:"",dl:""})));
  const [classe,setClasse]=useState("CA-50");
  const [res,setRes]=useState(null);
  const set=(i,k,v)=>setRows(r=>{const n=[...r];n[i]={...n[i],[k]:v};return n;});
  // NBR 7480 limits
  const REQS={
    "CA-25":{fy_min:250,fu_min:325,A_min:18,ratio:0.77},
    "CA-50":{fy_min:500,fu_min:550,A_min:8, ratio:0.91},
    "CA-60":{fy_min:600,fu_min:660,A_min:6, ratio:0.91},
  };
  const calc=()=>{
    const vals=rows.map(r=>{
      const d=_num(r.diam),lo=_num(r.lo),fy=_num(r.fy),fu=_num(r.fu),dl=_num(r.dl);
      if(!d||!lo||!fy||!fu) return null;
      const A=Math.PI*(d/2)**2;
      const fy_mpa=+(fy*1000/A).toFixed(1);
      const fu_mpa=+(fu*1000/A).toFixed(1);
      const elong=dl?+((dl/lo)*100).toFixed(1):null;
      return{d,lo,fy_mpa,fu_mpa,elong,A:+A.toFixed(2)};
    }).filter(Boolean);
    if(!vals.length){alert("Preencha ao menos 1 CP");return;}
    const fy_med=+(vals.reduce((s,v)=>s+v.fy_mpa,0)/vals.length).toFixed(1);
    const fu_med=+(vals.reduce((s,v)=>s+v.fu_mpa,0)/vals.length).toFixed(1);
    const A_med =+(vals.filter(v=>v.elong!=null).reduce((s,v)=>s+v.elong,0)/vals.filter(v=>v.elong!=null).length).toFixed(1);
    const req=REQS[classe];
    const ok_fy=fy_med>=req.fy_min, ok_fu=fu_med>=req.fu_min;
    const ok_A=!isNaN(A_med)&&A_med>=req.A_min;
    const ok_ratio=fy_med/fu_med<=req.ratio;
    setRes({vals,fy_med,fu_med,A_med,classe,req,ok_fy,ok_fu,ok_A,ok_ratio});
  };
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>
      fy = Fy/A · fu = Fu/A · A5 = ΔL/L0 × 100 — NBR 6152:2016 / verificação NBR 7480
    </div>
    <div style={{marginBottom:10}}>
      <label className="lbl">Classe do Aço (NBR 7480)</label>
      <select className="inp" value={classe} onChange={e=>setClasse(e.target.value)} style={{padding:"7px 10px"}}>
        {["CA-25","CA-50","CA-60"].map(c=><option key={c} value={c}>{c}</option>)}
      </select>
    </div>
    <div style={{overflowX:"auto",marginBottom:10}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
        <thead><tr style={{background:C.surface}}>
          {["CP","Diam. (mm)","L₀ (mm)","Fy (kN)","Fu (kN)","ΔL (mm)"].map(h=>(
            <th key={h} style={{padding:"5px 8px",textAlign:"left",color:C.textDim,fontSize:9,fontWeight:600}}>{h}</th>
          ))}
        </tr></thead>
        <tbody>{rows.map((r,i)=>(
          <tr key={i}>
            <td style={{padding:3,color:C.textDim,fontSize:10,paddingLeft:8}}>CP {i+1}</td>
            {["diam","lo","fy","fu","dl"].map(k=>(
              <td key={k} style={{padding:3}}>
                <input type="number" step="any" className="inp" value={r[k]}
                  onChange={e=>set(i,k,e.target.value)}
                  style={{width:"100%",padding:"5px 7px",fontSize:11}}/>
              </td>
            ))}
          </tr>
        ))}</tbody>
      </table>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:10}}>
      <button className="btn-g" onClick={()=>setRows(r=>[...r,{diam:"12.5",lo:"100",fy:"",fu:"",dl:""}])}>+ CP</button>
      <button className="btn-p" onClick={calc}>Calcular</button>
    </div>
    {res&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:8}}>
        {[{l:"fy médio",v:`${res.fy_med} MPa`,ok:res.ok_fy,req:`≥${res.req.fy_min}`},
          {l:"fu médio",v:`${res.fu_med} MPa`,ok:res.ok_fu,req:`≥${res.req.fu_min}`},
          {l:"A5 médio",v:`${isNaN(res.A_med)?"-":res.A_med} %`,ok:res.ok_A,req:`≥${res.req.A_min}`},
          {l:"fy/fu ≤ "+res.req.ratio,v:(res.fy_med/res.fu_med).toFixed(3),ok:res.ok_ratio,req:"relação"},
        ].map((item,i)=>(
          <div key={i} style={{background:(item.ok?C.emerald:C.red)+"22",borderRadius:8,padding:"9px 12px",
            textAlign:"center",border:`1px solid ${item.ok?C.emerald:C.red}44`}}>
            <div style={{fontSize:9,color:C.textDim}}>{item.l} ({item.req})</div>
            <div style={{fontSize:13,fontWeight:700,color:item.ok?C.emerald:C.red}}>{item.v}</div>
            <div style={{fontSize:8,color:item.ok?C.emerald:C.red}}>{item.ok?"✓ OK":"✗ FALHOU"}</div>
          </div>
        ))}
      </div>
      <button className="btn-p" style={{fontSize:11,padding:"5px 12px"}} onClick={()=>onResult({
        "Tensão de escoamento (fy)":res.fy_med,"Tensão de ruptura (fu)":res.fu_med,
        "Alongamento":isNaN(res.A_med)?null:res.A_med,
      },{tracao_aco:res})}>✓ Usar estes resultados</button>
    </div>}
  </div>);
}

// ── Impacto Charpy — ABNT NBR 6157:2018 ──────────────────────
function CalcCharpy({ onResult }){
  const [rows,setRows]=useState(_rowArr(3,()=>({e:"",t:"23"})));
  const [lim,setLim]=useState("27");
  const [res,setRes]=useState(null);
  const set=(i,k,v)=>setRows(r=>{const n=[...r];n[i]={...n[i],[k]:v};return n;});
  const calc=()=>{
    const vals=rows.map(r=>_num(r.e)).filter(v=>v!==null&&!isNaN(v));
    if(vals.length<1){alert("Preencha ao menos 1 CP");return;}
    const e_med=+(vals.reduce((s,v)=>s+v,0)/vals.length).toFixed(1);
    const e_min=Math.min(...vals);
    const limV=_num(lim)||27;
    setRes({vals,e_med,e_min,limV,conforme:e_med>=limV&&e_min>=0.7*limV});
  };
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>
      Energia absorvida média ≥ limite · mínimo individual ≥ 70% limite — NBR 6157:2018
    </div>
    <div style={{marginBottom:10}}>
      <label className="lbl">Limite mínimo (J)</label>
      <input type="number" step="any" className="inp" value={lim} onChange={e=>setLim(e.target.value)}
        style={{padding:"7px 10px",width:120}} placeholder="27"/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
      {rows.map((r,i)=>(
        <div key={i}><label className="lbl">CP {i+1} — Energia (J)</label>
          <input type="number" step="any" className="inp" value={r.e}
            onChange={e=>set(i,"e",e.target.value)} style={{padding:"7px 10px",width:"100%"}}/></div>
      ))}
    </div>
    <div style={{display:"flex",gap:8,marginBottom:10}}>
      <button className="btn-g" onClick={()=>setRows(r=>[...r,{e:"",t:"23"}])}>+ CP</button>
      <button className="btn-p" onClick={calc}>Calcular</button>
    </div>
    {res&&<div style={{background:(res.conforme?C.emerald:C.red)+"22",borderRadius:8,
      padding:"8px 14px",display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>E médio</div>
        <div style={{fontSize:14,fontWeight:700,color:res.conforme?C.emerald:C.red}}>{res.e_med} J</div></div>
      <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>E mínimo</div>
        <div style={{fontSize:14,fontWeight:700,color:res.e_min>=0.7*res.limV?C.emerald:C.red}}>{res.e_min} J</div></div>
      <div style={{fontSize:10,fontWeight:700,color:res.conforme?C.emerald:C.red}}>
        {res.conforme?"✓ CONFORME":"⚠ NÃO CONFORME"}
      </div>
      <button className="btn-p" style={{fontSize:11,padding:"5px 12px",marginLeft:"auto"}}
        onClick={()=>onResult({"Energia absorvida":res.e_med},{charpy:res})}>
        ✓ Usar estes resultados</button>
    </div>}
  </div>);
}

// ── Liquefação por CPT — ANM 95/2022 / Robertson & Wride 1998 ─
function CalcLiquefacaoCPT({ onResult }){
  // Ic = √[(3.47 - log Qt)² + (log Fr + 1.22)²]
  // Qt = (qc - σv0) / σ'v0
  // Fr = fs / (qc - σv0) × 100
  // qc1N = CQ × (qc/Pa) onde CQ = (Pa/σ'v0)^0.5 ≤ 1.7
  // CRR7.5 = 0.833×[qc1N,cs/1000] + 0.05   se qc1N<50
  //         = 93×[qc1N,cs/1000]³ + 0.08    se 50≤qc1N≤160
  // CSR = 0.65 × (σv0/σ'v0) × (amax/g) × rd
  // rd = 1 - 0.00765z (z≤9.15)
  // FS = CRR7.5 × MSF / CSR
  const EF=()=>({z:"",qc:"",fs_cpt:"",sigv0:"",sigv0_eff:""});
  const [rows,setRows]=useState(_rowArr(4,EF));
  const [amax,setAmax]=useState("0.10");
  const [mw,setMw]=useState("7.5");
  const [res,setRes]=useState(null);
  const set=(i,k,v)=>setRows(r=>{const n=[...r];n[i]={...n[i],[k]:v};return n;});
  const Pa=100; // kPa pressão atmosférica

  const calc=()=>{
    const amaxV=_num(amax)||0.1, mwV=_num(mw)||7.5;
    // MSF (Magnitude Scaling Factor)
    const MSF=Math.min(1.8,10**(2.24)/(mwV**2.56));
    const pts=rows.map(r=>{
      const z=_num(r.z),qcV=_num(r.qc),fsV=_num(r.fs_cpt),
            sigv=_num(r.sigv0),sigvp=_num(r.sigv0_eff);
      if(!z||!qcV||!sigv||!sigvp) return null;
      const qcKPa=qcV*1000; // MPa → kPa
      const fsKPa=(fsV||0)*1000;
      const Qt=(qcKPa-sigv)/sigvp;
      const Fr=qcKPa-sigv>0?fsKPa/(qcKPa-sigv)*100:0;
      // Ic Robertson 1990
      const Ic=Math.sqrt((3.47-Math.log10(Math.max(Qt,0.1)))**2+(Math.log10(Fr+0.001)+1.22)**2);
      // CQ: correction for overburden
      const CQ=Math.min(1.7,Math.sqrt(Pa/sigvp));
      const qc1N=CQ*(qcKPa/Pa);
      // Kc: fines correction
      let Kc=1.0;
      if(Ic>1.64) Kc=-0.403*Ic**4+5.581*Ic**3-21.63*Ic**2+33.75*Ic-17.88;
      const qc1Ncs=Math.min(200,Kc*qc1N);
      // CRR7.5
      let CRR75=0;
      if(qc1Ncs<50)      CRR75=0.833*(qc1Ncs/1000)+0.05;
      else if(qc1Ncs<=160) CRR75=93*(qc1Ncs/1000)**3+0.08;
      else CRR75=1.0; // non-liquefiable (high qc1N)
      // rd (depth factor, Liao & Whitman 1986)
      const rd=z<=9.15?1-0.00765*z:1-0.00765*9.15-0.0267*(z-9.15);
      const CSR=0.65*(sigv/sigvp)*(amaxV)*rd;
      const FS=CSR>0?+(CRR75*MSF/CSR).toFixed(2):Infinity;
      return{z,qcV,Ic:+Ic.toFixed(2),qc1N:+qc1N.toFixed(0),qc1Ncs:+qc1Ncs.toFixed(0),
        CRR75:+CRR75.toFixed(3),CSR:+CSR.toFixed(3),FS,
        liq:FS<1.0?"LIQUEFAZ":FS<1.25?"ATENÇÃO":"Estável"};
    }).filter(Boolean);
    if(!pts.length){alert("Preencha ao menos 1 profundidade");return;}
    const FS_min=Math.min(...pts.map(p=>p.FS));
    setRes({pts,FS_min:+FS_min.toFixed(2),MSF:+MSF.toFixed(3),amax:amaxV,mw:mwV});
  };
  const corFS=fs=>fs<1?"#f87171":fs<1.25?C.gold:C.emerald;
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>
      Robertson & Wride (1998) — Ic, CRR7.5, MSF — Referência ANM 95/2022
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
      <div><label className="lbl">Aceleração máxima amax/g</label>
        <input type="number" step="any" className="inp" value={amax} onChange={e=>setAmax(e.target.value)}
          style={{padding:"7px 10px",width:"100%"}} placeholder="0.10"/></div>
      <div><label className="lbl">Magnitude sísmica Mw</label>
        <input type="number" step="any" className="inp" value={mw} onChange={e=>setMw(e.target.value)}
          style={{padding:"7px 10px",width:"100%"}} placeholder="7.5"/></div>
    </div>
    <div style={{overflowX:"auto",marginBottom:10}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
        <thead><tr style={{background:C.surface}}>
          {["Prof. z (m)","qc (MPa)","fs (MPa)","σv0 (kPa)","σ'v0 (kPa)"].map(h=>(
            <th key={h} style={{padding:"5px 8px",textAlign:"left",color:C.textDim,fontSize:9,fontWeight:600}}>{h}</th>
          ))}
        </tr></thead>
        <tbody>{rows.map((r,i)=>(
          <tr key={i}>
            {["z","qc","fs_cpt","sigv0","sigv0_eff"].map(k=>(
              <td key={k} style={{padding:3}}>
                <input type="number" step="any" className="inp" value={r[k]}
                  onChange={e=>set(i,k,e.target.value)}
                  style={{width:"100%",padding:"5px 7px",fontSize:11}}/>
              </td>
            ))}
          </tr>
        ))}</tbody>
      </table>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:10}}>
      <button className="btn-g" onClick={()=>setRows(r=>[...r,EF()])}>+ Ponto</button>
      <button className="btn-p" onClick={calc}>Calcular Liquefação</button>
    </div>
    {res&&<div>
      <div style={{background:corFS(res.FS_min)+"22",borderRadius:8,padding:"8px 14px",
        display:"flex",gap:16,flexWrap:"wrap",alignItems:"center",marginBottom:8}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>FS mín</div>
          <div style={{fontSize:14,fontWeight:700,color:corFS(res.FS_min)}}>{res.FS_min}</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>MSF</div>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>{res.MSF}</div></div>
        <button className="btn-p" style={{fontSize:11,padding:"5px 12px",marginLeft:"auto"}}
          onClick={()=>onResult({
            "FS Liquefação (CRR/CSR)":res.FS_min,
            "Qc/σ'v0 (CPT)":res.pts[0]?.qc1N??null,
            "Ic (comportamento)":res.pts[0]?.Ic??null,
          },{liquefacao:res})}>✓ Usar estes resultados</button>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
          <thead><tr style={{background:C.surface}}>
            {["Prof.","qc1N","qc1N,cs","Ic","CRR7.5","CSR","FS","Status"].map(h=>(
              <th key={h} style={{padding:"5px 8px",color:C.textDim,fontSize:9,fontWeight:600,
                textAlign:"left",borderBottom:`1px solid ${C.border}`}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{res.pts.map((p,i)=>(
            <tr key={i} style={{borderBottom:`1px solid ${C.border}22`}}>
              <td style={{padding:"4px 8px"}}>{p.z} m</td>
              <td style={{padding:"4px 8px"}}>{p.qc1N}</td>
              <td style={{padding:"4px 8px"}}>{p.qc1Ncs}</td>
              <td style={{padding:"4px 8px"}}>{p.Ic}</td>
              <td style={{padding:"4px 8px"}}>{p.CRR75}</td>
              <td style={{padding:"4px 8px"}}>{p.CSR}</td>
              <td style={{padding:"4px 8px",fontWeight:700,color:corFS(p.FS)}}>{p.FS}</td>
              <td style={{padding:"4px 8px",fontSize:9,fontWeight:700,
                color:p.liq==="LIQUEFAZ"?"#f87171":p.liq==="ATENÇÃO"?C.gold:C.emerald}}>{p.liq}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>}
  </div>);
}

// ── Estabilidade de Talude — Bishop Simplificado — NBR 11682 ──
function CalcEstabilidadeTalude({ onResult }){
  // Bishop Simplificado iterativo:
  // ΣR = Σ{[c'×b + (W - u×b)×tan(φ')] / mα}
  // mα = cos(α) × [1 + tan(α)×tan(φ')/FS]
  // FS = ΣR / Σ(W×sin(α))
  const EF=()=>({b:"",w:"",alpha:"",u:"0",c:"",phi:""});
  const [fatias,setFatias]=useState(_rowArr(4,EF));
  const [tipo,setTipo]=useState("longo_prazo");
  const [res,setRes]=useState(null);
  const set=(i,k,v)=>setFatias(r=>{const n=[...r];n[i]={...n[i],[k]:v};return n;});

  const calc=()=>{
    const slices=fatias.map(r=>{
      const b=_num(r.b),w=_num(r.w),alpha=_num(r.alpha)*Math.PI/180,
            u=_num(r.u)||0,c=_num(r.c),phi=_num(r.phi)*Math.PI/180;
      if(!b||!w||isNaN(alpha)||isNaN(c)||isNaN(phi)) return null;
      return{b,w,alpha,u,c,phi};
    }).filter(Boolean);
    if(slices.length<2){alert("Mínimo 2 fatias");return;}

    // Iteração Bishop Simplificado
    let FS=1.5, FSold=0, iter=0;
    while(Math.abs(FS-FSold)>1e-5&&iter<100){
      FSold=FS;
      const num=slices.reduce((s,sl)=>{
        const ma=Math.cos(sl.alpha)*(1+Math.tan(sl.alpha)*Math.tan(sl.phi)/FS);
        return s+(sl.c*sl.b+(sl.w-sl.u*sl.b)*Math.tan(sl.phi))/ma;
      },0);
      const den=slices.reduce((s,sl)=>s+sl.w*Math.sin(sl.alpha),0);
      FS=den>0?num/den:1;
      iter++;
    }
    FS=+FS.toFixed(3);
    // NBR 11682 mínimos
    const limMin=tipo==="longo_prazo"?1.30:tipo==="curto_prazo"?1.20:1.00;
    setRes({FS,iter,conforme:FS>=limMin,limMin,tipo,
      status:FS>=limMin?"✓ ESTÁVEL":"⚠ INSTÁVEL"});
  };

  const tipoLabels={"longo_prazo":"Longo Prazo (≥1,30)","curto_prazo":"Curto Prazo (≥1,20)","sismico":"Sísmico (≥1,00)"};

  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>
      Bishop Simplificado iterativo · W = peso fatia · α = ângulo base · u = pressão neutra — NBR 11682
    </div>
    <div style={{marginBottom:10}}>
      <label className="lbl">Tipo de Análise</label>
      <select className="inp" value={tipo} onChange={e=>setTipo(e.target.value)} style={{padding:"7px 10px"}}>
        {Object.entries(tipoLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}
      </select>
    </div>
    <div style={{overflowX:"auto",marginBottom:10}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
        <thead><tr style={{background:C.surface}}>
          {["Fat.","b (m)","W (kN/m)","α (°)","u (kPa)","c' (kPa)","φ' (°)"].map(h=>(
            <th key={h} style={{padding:"5px 6px",textAlign:"left",color:C.textDim,fontSize:8,fontWeight:600}}>{h}</th>
          ))}
        </tr></thead>
        <tbody>{fatias.map((r,i)=>(
          <tr key={i}>
            <td style={{padding:2,color:C.textDim,fontSize:9,paddingLeft:6}}>{i+1}</td>
            {["b","w","alpha","u","c","phi"].map(k=>(
              <td key={k} style={{padding:2}}>
                <input type="number" step="any" className="inp" value={r[k]}
                  onChange={e=>set(i,k,e.target.value)}
                  style={{width:"100%",padding:"4px 6px",fontSize:10}}/>
              </td>
            ))}
          </tr>
        ))}</tbody>
      </table>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:10}}>
      <button className="btn-g" onClick={()=>setFatias(r=>[...r,EF()])}>+ Fatia</button>
      <button className="btn-p" onClick={calc}>Calcular Bishop</button>
    </div>
    {res&&<div style={{background:(res.conforme?C.emerald:C.red)+"22",borderRadius:8,
      padding:"10px 14px",display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>FS Bishop</div>
        <div style={{fontSize:18,fontWeight:800,color:res.conforme?C.emerald:C.red}}>{res.FS}</div></div>
      <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>Mínimo NBR</div>
        <div style={{fontSize:13,fontWeight:700,color:C.textDim}}>{res.limMin}</div></div>
      <div style={{fontSize:11,fontWeight:700,color:res.conforme?C.emerald:C.red}}>{res.status}</div>
      <button className="btn-p" style={{fontSize:11,padding:"5px 12px",marginLeft:"auto"}}
        onClick={()=>onResult({
          "FS Estático longo prazo":res.tipo==="longo_prazo"?res.FS:null,
          "FS Estático curto prazo":res.tipo==="curto_prazo"?res.FS:null,
          "FS Sísmico (kh=0.1)":res.tipo==="sismico"?res.FS:null,
        },{estabilidade:res})}>✓ Usar estes resultados</button>
    </div>}
  </div>);
}

// ── Análise de Percolação — ICOLD Bulletin 164 / Darcy ────────
function CalcPercolacao({ onResult }){
  const [d,setD]=useState({k:"",H:"",Nf:"6",Nd:"18",L:"",A:""});
  const [res,setRes]=useState(null);
  const set=(k,v)=>setD(x=>({...x,[k]:v}));
  const calc=()=>{
    const k=_num(d.k)/100; // cm/s → m/s
    const H=_num(d.H), Nf=_num(d.Nf)||6, Nd=_num(d.Nd)||18;
    const L=_num(d.L), A=_num(d.A)||1;
    if(!k||!H){alert("Preencha k e H");return;}
    // Vazão por rede de fluxo: Q = k × H × (Nf/Nd) × A  [m³/s por metro de barragem]
    const Q_m3s=k*H*(Nf/Nd)*A; // m³/s
    const Q_Ls=+(Q_m3s*1000).toFixed(4); // L/s
    // Gradiente de saída médio estimado
    const i_saida=L?+(H/(L*(Nd/Nf))).toFixed(3):null;
    // FS contra piping: ic_crítico ≈ (Gs-1)/(1+e) ≈ 0.7~1.0
    // Referência: ic ≈ (Gs-1)/(1+e) = (2.67-1)/(1+0.7) ≈ 0.98
    const ic=0.98;
    const FS_pip=i_saida?+(ic/i_saida).toFixed(2):null;
    setRes({Q_m3s:+Q_m3s.toExponential(3),Q_Ls,i_saida,FS_pip,k_cms:+(_num(d.k)).toFixed(8),
      conforme:FS_pip?FS_pip>=4:null});
  };
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>
      Q = k × H × (Nf/Nd) · gradiente saída = H/(L × Nd/Nf) · FS piping ≥ 4 — ICOLD Bul. 164
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(160px,100%),1fr))",gap:10,marginBottom:10}}>
      {[["k","k (cm/s)","1e-5"],["H","Carga hidráulica H (m)","10"],
        ["Nf","Nº tubos de fluxo Nf","6"],["Nd","Nº potenciais Nd","18"],
        ["L","Comprimento base L (m)",""],["A","Área corte A (m)","1"]].map(([key,label,ph])=>(
        <div key={key}><label className="lbl">{label}</label>
          <input type="number" step="any" className="inp" value={d[key]}
            onChange={e=>set(key,e.target.value)}
            style={{padding:"7px 10px",width:"100%"}} placeholder={ph}/></div>
      ))}
    </div>
    <button className="btn-p" onClick={calc}>Calcular Percolação</button>
    {res&&<div style={{marginTop:10,display:"grid",gap:8}}>
      <div style={{background:C.teal+"22",borderRadius:8,padding:"8px 14px",
        display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>Vazão Q</div>
          <div style={{fontSize:13,fontWeight:700,color:C.teal}}>{res.Q_Ls} L/s</div></div>
        {res.i_saida&&<div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>Grad. saída</div>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>{res.i_saida}</div></div>}
        {res.FS_pip&&<div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>FS piping</div>
          <div style={{fontSize:13,fontWeight:700,color:res.FS_pip>=4?C.emerald:C.red}}>{res.FS_pip}</div></div>}
        {res.FS_pip&&<div style={{fontSize:10,fontWeight:700,color:res.conforme?C.emerald:C.red}}>
          {res.conforme?"✓ SEGURO (≥4)":"⚠ VERIFICAR (< 4)"}</div>}
        <button className="btn-p" style={{fontSize:11,padding:"5px 12px",marginLeft:"auto"}}
          onClick={()=>onResult({
            "Gradiente de saída (i)":res.i_saida??null,
            "Vazão percolada":res.Q_Ls,
            "Linha freática (m)":null,
          },{percolacao:res})}>✓ Usar estes resultados</button>
      </div>
    </div>}
  </div>);
}

// ── Dosagem BGTC — DNIT 167/2013-ME ──────────────────────────
function CalcDosagemBGTC({ onResult }){
  // Método Sherard para BGTC/Solo-Cimento:
  // Teor ótimo = menor teor que atinge resistência mínima (2 ou 3 MPa)
  const EF=()=>({cimento:"",wot:"",rdmax:"",rcs7:"",rcs28:""});
  const [rows,setRows]=useState(_rowArr(4,EF));
  const [uso,setUso]=useState("base");
  const [res,setRes]=useState(null);
  const set=(i,k,v)=>setRows(r=>{const n=[...r];n[i]={...n[i],[k]:v};return n;});
  const RCS_MIN={base:3.0,subbase:2.0};
  const calc=()=>{
    const pts=rows.map(r=>{
      const c=_num(r.cimento),wot=_num(r.wot),rd=_num(r.rdmax),
            rcs7=_num(r.rcs7),rcs28=_num(r.rcs28);
      if(!c||!wot||!rd) return null;
      return{c,wot,rd,rcs7:rcs7||null,rcs28:rcs28||null};
    }).filter(Boolean);
    if(pts.length<2){alert("Mínimo 2 pontos de cimento");return;}
    const lim=RCS_MIN[uso];
    // Encontra teor ótimo por interpolação linear (primeiro que atinge lim na rcs28 ou rcs7×1.35)
    const withRcs=pts.map(p=>({...p,rcs_ref:p.rcs28||(p.rcs7?p.rcs7*1.35:null)}));
    const abaixo=withRcs.filter(p=>p.rcs_ref&&p.rcs_ref<lim);
    const acima =withRcs.filter(p=>p.rcs_ref&&p.rcs_ref>=lim);
    let teor_otimo=null;
    if(acima.length&&abaixo.length){
      const p1=abaixo[abaixo.length-1], p2=acima[0];
      const frac=(lim-p1.rcs_ref)/(p2.rcs_ref-p1.rcs_ref);
      teor_otimo=+(p1.c+frac*(p2.c-p1.c)).toFixed(1);
    } else if(acima.length){
      teor_otimo=acima[0].c;
    }
    // wot e rdmax no teor ótimo (interpolação)
    const wot_ot=teor_otimo?+(pts.reduce((s,p)=>s+p.wot,0)/pts.length).toFixed(1):null;
    const rd_ot =teor_otimo?+(pts.reduce((s,p)=>s+p.rd,0)/pts.length).toFixed(3):null;
    setRes({pts,teor_otimo,wot_ot,rd_ot,lim,uso,conforme:teor_otimo!==null});
  };
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:8}}>
      Teor ótimo = menor % cimento que atinge RCS28 ≥ {uso==="base"?3:2} MPa — DNIT 167/2013-ME
    </div>
    <div style={{marginBottom:10}}>
      <label className="lbl">Camada de Uso</label>
      <select className="inp" value={uso} onChange={e=>setUso(e.target.value)} style={{padding:"7px 10px"}}>
        <option value="base">Base (RCS28 ≥ 3,0 MPa)</option>
        <option value="subbase">Sub-base (RCS28 ≥ 2,0 MPa)</option>
      </select>
    </div>
    <div style={{overflowX:"auto",marginBottom:10}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
        <thead><tr style={{background:C.surface}}>
          {["Cimento (%)","Wot (%)","ρdmáx (g/cm³)","RCS 7d (MPa)","RCS 28d (MPa)"].map(h=>(
            <th key={h} style={{padding:"5px 8px",textAlign:"left",color:C.textDim,fontSize:9,fontWeight:600}}>{h}</th>
          ))}
        </tr></thead>
        <tbody>{rows.map((r,i)=>(
          <tr key={i}>
            {["cimento","wot","rdmax","rcs7","rcs28"].map(k=>(
              <td key={k} style={{padding:3}}>
                <input type="number" step="any" className="inp" value={r[k]}
                  onChange={e=>set(i,k,e.target.value)}
                  style={{width:"100%",padding:"5px 7px",fontSize:11}}/>
              </td>
            ))}
          </tr>
        ))}</tbody>
      </table>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:10}}>
      <button className="btn-g" onClick={()=>setRows(r=>[...r,EF()])}>+ Ponto</button>
      <button className="btn-p" onClick={calc}>Calcular Dosagem</button>
    </div>
    {res&&<div style={{background:(res.conforme?C.emerald:C.red)+"22",borderRadius:8,
      padding:"10px 14px",display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
      {res.teor_otimo?<>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>Teor ótimo cimento</div>
          <div style={{fontSize:16,fontWeight:800,color:C.emerald}}>{res.teor_otimo} %</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>Wot médio</div>
          <div style={{fontSize:13,fontWeight:700,color:C.gold}}>{res.wot_ot} %</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.textDim}}>ρdmáx médio</div>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>{res.rd_ot} g/cm³</div></div>
      </>:<div style={{color:C.red,fontWeight:700,fontSize:11}}>
        ⚠ Nenhum teor atingiu RCS ≥ {res.lim} MPa — aumente o teor de cimento</div>}
      {res.teor_otimo&&<button className="btn-p" style={{fontSize:11,padding:"5px 12px",marginLeft:"auto"}}
        onClick={()=>onResult({
          "Teor de Cimento (%)":res.teor_otimo,"Umidade Ótima (%)":res.wot_ot,
          "ρdmáx (g/cm³)":res.rd_ot,"Resistência à Compressão (MPa)":res.lim,
        },{bgtc:res})}>✓ Usar estes resultados</button>}
    </div>}
  </div>);
}

// ── Registros manuais — entrada direta de parâmetros ──────────
function CalcRegistroManual({ campos, onResult }){
  const [vals,setVals]=useState({});
  const set=(k,v)=>setVals(x=>({...x,[k]:v}));
  const salvar=()=>{
    const out={};
    campos.forEach(c=>{const v=_num(vals[c.p]);if(v!==null) out[c.p]=v;});
    if(!Object.keys(out).length){alert("Preencha ao menos 1 campo");return;}
    onResult(out,{manual:out});
  };
  return(<div>
    <div style={{fontSize:10,color:C.textDim,marginBottom:10}}>
      Ensaio de resultado instrumental — insira os valores obtidos diretamente.
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(200px,100%),1fr))",gap:10,marginBottom:12}}>
      {campos.map(c=>(
        <div key={c.p}><label className="lbl">{c.p}{c.u?` (${c.u})`:""}</label>
          <input type="number" step="any" className="inp" value={vals[c.p]||""}
            onChange={e=>set(c.p,e.target.value)}
            style={{padding:"7px 10px",width:"100%"}}/></div>
      ))}
    </div>
    <button className="btn-p" onClick={salvar}>✓ Registrar Resultados</button>
  </div>);
}

// Wrappers para CalcRegistroManual:
function CalcAmostragemCampo({onResult}){
  return <CalcRegistroManual campos={[{p:"Profundidade Topo (m)",u:"m"},{p:"Profundidade Base (m)",u:"m"}]} onResult={onResult}/>;
}
function CalcAnaliseUmida({onResult}){
  return <CalcRegistroManual campos={[{p:"Fe total",u:"%"},{p:"Al₂O₃",u:"%"},{p:"SiO₂",u:"%"},{p:"Mn",u:"%"}]} onResult={onResult}/>;
}
function CalcOxidosFRX({onResult}){
  return <CalcRegistroManual campos={[{p:"Fe₂O₃",u:"%"},{p:"SiO₂",u:"%"},{p:"Al₂O₃",u:"%"},{p:"TiO₂",u:"%"},{p:"MnO",u:"%"},{p:"Perda ao Fogo PF",u:"%"}]} onResult={onResult}/>;
}
function CalcTGA({onResult}){
  return <CalcRegistroManual campos={[{p:"Perda de Massa Total",u:"%"},{p:"Temp. Início Decomposição",u:"°C"},{p:"Resíduo a 1000°C",u:"%"}]} onResult={onResult}/>;
}
function CalcEnxofreLeco({onResult}){
  return <CalcRegistroManual campos={[{p:"Teor de Enxofre S",u:"%"}]} onResult={onResult}/>;
}
function CalcDRX({onResult}){
  return <CalcRegistroManual campos={[{p:"Quartzo",u:"%"},{p:"Goethita",u:"%"},{p:"Hematita",u:"%"},{p:"Gibbsita",u:"%"},{p:"Caolinita",u:"%"}]} onResult={onResult}/>;
}
function CalcCorteTestemunho({onResult}){
  return <CalcRegistroManual campos={[{p:"Comprimento Total Cortado (cm)",u:"cm"},{p:"Nº de Cortes",u:"—"}]} onResult={onResult}/>;
}

// Aliases genéricos
function CalcAtterberg({onResult}){ return <CalcLP onResult={onResult}/>; }


// ══════════════════════════════════════════════════════════════
//  CALC_MAP — mapeia tipo_ensaio → calculadora
// ══════════════════════════════════════════════════════════════
const CALC_MAP = {
  // Tipos originais
  granulometria:                           { comp:CalcGranulometria,     titulo:"⚗ Granulometria — NBR 7181" },
  compactacao_proctor:                     { comp:CalcProctor,           titulo:"⚗ Proctor — NBR 7182" },
  hilf:                                    { comp:CalcHilf,              titulo:"⚗ Hilf (Rápido) — DNER ME 162/94" },
  cbr:                                     { comp:CalcCBR,               titulo:"⚗ CBR / ISC — NBR 9895" },
  compressao_concreto:                     { comp:CalcConcreto,          titulo:"⚗ Compressão Concreto — NBR 5739" },
  triaxial:                                { comp:CalcTriaxial,          titulo:"⚗ Triaxial — NBR 12007" },
  // Granulometria variantes
  granulometria_peneiramento_sedimentacao: { comp:CalcGranSed,           titulo:"⚗ Granulometria Pen+Sed — NBR 7181" },
  granulometria_peneiramento:              { comp:CalcGranPen,           titulo:"⚗ Granulometria Peneiramento — NBR 7181" },
  granulometria_completa:                  { comp:CalcGranComp,          titulo:"⚗ Granulometria Completa — NBR 7181" },
  // Caracterização
  teor_umidade_natural:                    { comp:CalcTeorUmidade,       titulo:"⚗ Teor de Umidade Natural — NBR 6457" },
  massa_especifica_real_graos:             { comp:CalcGraos,             titulo:"⚗ Massa Específica Real (Gs) — NBR 6508" },
  peso_especifico_graos:                   { comp:CalcGraos,             titulo:"⚗ Peso Específico dos Grãos — NBR 6508" },
  massa_especifica_aparente_natural:       { comp:CalcDensidadeInsitu,   titulo:"⚗ Massa Específica Aparente Natural — NBR 9813" },
  densidade_aparente_natural:              { comp:CalcDensidadeInsitu,   titulo:"⚗ Densidade Aparente Natural — NBR 9813" },
  densidade_aparente_saturada:             { comp:CalcDensidadeInsitu,   titulo:"⚗ Densidade Aparente Saturada — NBR 9813" },
  // Atterberg
  limite_liquidez:                         { comp:CalcLL,                titulo:"⚗ Limite de Liquidez — NBR 6459" },
  limite_plasticidade:                     { comp:CalcLP,                titulo:"⚗ Limite de Plasticidade — NBR 7180" },
  // Compactação variantes
  proctor_normal:                          { comp:CalcProctorNorm,       titulo:"⚗ Proctor Normal — NBR 7182" },
  proctor_modificado:                      { comp:CalcProctorMod,        titulo:"⚗ Proctor Modificado — NBR 7182" },
  proctor_internormal:                     { comp:CalcProctorIntern,     titulo:"⚗ Proctor Internormal — NBR 7182" },
  proctor_intermediario:                   { comp:CalcProctorInterm,     titulo:"⚗ Proctor Intermediário — NBR 7182" },
  proctor_intermodificado:                 { comp:CalcProctorIntermod,   titulo:"⚗ Proctor Interm-Modificado — NBR 7182" },
  // Resistência
  cisalhamento_4_estagios:                 { comp:CalcCisalhamento,      titulo:"⚗ Cisalhamento Direto 4 Est. — NBR 12069" },
  triaxial_ciu_4300:                       { comp:CalcTriaxialCIU,       titulo:"⚗ Triaxial CIU σ3 4300 kPa — NBR 12007" },
  triaxial_cid_4300:                       { comp:CalcTriaxialCID,       titulo:"⚗ Triaxial CID σ3 4300 kPa — NBR 12007" },
  direct_simple_shear:                     { comp:CalcDSS,               titulo:"⚗ Direct Simple Shear — ASTM D6528" },
  // Adensamento
  adensamento_sem_permeab:                 { comp:CalcAdensamentoSem,    titulo:"⚗ Adensamento Edométrico — NBR 12007" },
  adensamento_com_permeab:                 { comp:CalcAdensamentoCom,    titulo:"⚗ Adensamento + Permeab — NBR 12007" },
  // Compacidade
  compacidade_vazio_maximo:                { comp:CalcEmaxComp,          titulo:"⚗ Compacidade emax — NBR 12004" },
  compacidade_vazio_minimo:                { comp:CalcEminComp,          titulo:"⚗ Compacidade emin — NBR 12051" },
  // Permeabilidade
  permeabilidade_carga_variavel:           { comp:CalcPermCargaVariavel, titulo:"⚗ Permeabilidade Carga Variável — NBR 14545" },
  permeabilidade_carga_constante:          { comp:CalcPermCargaConstante,titulo:"⚗ Permeabilidade Carga Constante — NBR 14545" },
  // ISC variantes
  isc_03_pontos:                           { comp:CalcISC03,             titulo:"⚗ ISC 03 Pontos — NBR 9895" },
  isc_05_pontos:                           { comp:CalcISC05,             titulo:"⚗ ISC 05 Pontos — NBR 9895" },
  isc_01_ponto_qualquer_energia:           { comp:CalcISC01,             titulo:"⚗ ISC 01 Ponto — NBR 9895" },
  // Qualidade
  equivalente_areia:                       { comp:CalcEquivalenteAreia,  titulo:"⚗ Equivalente de Areia — NBR NM 30" },
  // Atterberg combinado
  atterberg:                               { comp:CalcAtterberg,         titulo:"⚗ Atterberg (LL + LP + IP) — NBR 6459/7180" },
  // Adensamento / Permeabilidade genéricos
  adensamento:                             { comp:CalcAdensamentoSem,    titulo:"⚗ Adensamento Edométrico — NBR 12007" },
  permeabilidade:                          { comp:CalcPermCargaVariavel, titulo:"⚗ Permeabilidade — NBR 14545" },
  // Sondagem SPT
  spt:                                     { comp:CalcSPT,               titulo:"⚗ Sondagem SPT — NBR 6484:2022" },
  // Concreto
  tracao_diametral:                        { comp:CalcTracaoDiametral,   titulo:"⚗ Tração Diametral — NBR 7222:2011" },
  modulo_elasticidade:                     { comp:CalcModuloElasticidade,titulo:"⚗ Módulo de Elasticidade — NBR 8522:2021" },
  // Aço
  tracao_aco:                              { comp:CalcTracaoAco,         titulo:"⚗ Tração em Aço — NBR 6152:2022" },
  charpy:                                  { comp:CalcCharpy,            titulo:"⚗ Impacto Charpy — NBR ISO 148-1:2016" },
  // Barragens
  liquefacao_cpt:                          { comp:CalcLiquefacaoCPT,     titulo:"⚗ Liquefação CPT — ANM 95/2022 / Robertson 2010" },
  estabilidade_talude:                     { comp:CalcEstabilidadeTalude,titulo:"⚗ Estabilidade de Talude — NBR 11682:2009" },
  percolacao:                              { comp:CalcPercolacao,        titulo:"⚗ Análise de Percolação — ICOLD Bulletin 164" },
  // Solo-cimento
  dosagem_bgtc:                            { comp:CalcDosagemBGTC,       titulo:"⚗ Dosagem de BGTC — DNIT 167/2013-ME" },
  // Ensaios analíticos / laboratoriais
  amostragem_campo:                        { comp:CalcAmostragemCampo,   titulo:"📋 Amostragem de Campo — NBR 9604" },
  analise_via_umida_minerios:              { comp:CalcAnaliseUmida,   titulo:"🧪 Análise via Úmida — ISO 11885" },
  oxidos_totais_frx:                       { comp:CalcOxidosFRX,         titulo:"🔬 Óxidos Totais FRX — ISO 14869-1" },
  analise_termogravimetrica:               { comp:CalcTGA,               titulo:"🔬 Análise Termogravimétrica — ASTM E1131" },
  analise_enxofre_leco:                    { comp:CalcEnxofreLeco,           titulo:"🧪 Enxofre (Leco) — ASTM E1018" },
  difracao_raios_x_rietveld:               { comp:CalcDRX,               titulo:"🔬 Difração Raios X (Rietveld) — ASTM C1365" },
  corte_testemunho:                        { comp:CalcCorteTestemunho,   titulo:"📋 Corte de Testemunho — Procedimento Interno" },
};

// ══════════════════════════════════════════════════════════════
//  SERIAL STATUS BAR
// ══════════════════════════════════════════════════════════════
function SerialStatusBar() {
  const [leit, setLeit] = useState(null);
  useEffect(() => {
    const id = setInterval(() => {
      const v = window.__serialLast;
      if (v !== undefined) setLeit(+v);
    }, 400);
    return () => clearInterval(id);
  }, []);
  if (leit === null) return null;
  return (
    <div style={{background:C.surface,border:`1px solid ${C.teal}`,borderRadius:8,padding:"6px 12px",
      display:"flex",alignItems:"center",gap:10,marginBottom:10,fontSize:11}}>
      <span style={{color:C.teal,fontWeight:700}}>📡 Serial</span>
      <span style={{fontFamily:"'JetBrains Mono',monospace",color:C.text,fontSize:13}}>{leit}</span>
      <span style={{color:C.textDim,fontSize:9}}>última leitura ao vivo</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  INLINE RESULT PANEL — insere resultados em ensaio existente
// ══════════════════════════════════════════════════════════════
function InlineResultPanel({ ensaio, supabase, onSaved }) {
  const norma  = NORMAS[ensaio.tipo] || { params:[] };
  const CalcComp = CALC_MAP[ensaio.tipo]?.comp || null;
  const [showCalc, setShowCalc] = useState(false);
  const [vals,  setVals]  = useState({});
  const [saving,setSaving]= useState(false);
  const [err,   setErr]   = useState("");

  const salvar = async () => {
    if (!supabase) { setErr("Supabase não conectado"); return; }
    setSaving(true); setErr("");
    try {
      // Salva resultados (valores líquidos já com tara descontada)
      const res = norma.params.map(p => {
        const v = parseFloat(vals[p.p]);
        return { ensaio_id: ensaio.id, parametro: p.p,
          valor_numerico: isNaN(v) ? null : v,
          unidade: p.u, limite_minimo: p.lmin, limite_maximo: p.lmax,
          status: isNaN(v) ? "pendente" : calcSt(v, p.lmin, p.lmax),
        };
      });
      const { error: rErr } = await supabase.from("resultados").insert(res);
      if (rErr) throw rErr;

      // Salva dados brutos (tara + massas originais) em ensaios_raw
      const rawObj = {};
      Object.entries(vals).forEach(([k,v]) => { rawObj[k] = v; });
      await supabase.from("ensaios_raw").upsert({
        ensaio_id: ensaio.id,
        tipo_calc: ensaio.tipo,
        dados_raw: rawObj,
        dados_brutos: rawObj,
        origem: "inline_panel",
      }, { onConflict: "ensaio_id" });

      // Salva taras individuais na tabela ensaios_tara (se existirem no vals)
      const taras = [];
      // Para umidade, LL, LP: mc é tara
      if (vals._taras_json) {
        try {
          const parsed = JSON.parse(vals._taras_json);
          if (Array.isArray(parsed)) taras.push(...parsed.map(t=>({...t, ensaio_id:ensaio.id, laboratorio_id:ensaio.laboratorio_id})));
        } catch {}
      }
      if (taras.length > 0) {
        await supabase.from("ensaios_tara").insert(taras);
      }

      // ── Tabelas estruturadas por tipo de ensaio ──────────────
      // SPT — spt_camadas
      if (ensaio.tipo === "spt" && rawObj.spt) {
        const spt_rows = (rawObj.spt || []).map(c=>({
          ensaio_id:ensaio.id, profundidade_m:c.prof, n1:c.n1, n2:c.n2, n3:c.n3,
          nspt:c.nspt, impenetravel:c.impenetravel||false, nivel_agua:c.na||false,
          descricao_solo:c.obs||null,
        }));
        if (spt_rows.length) await supabase.from("spt_camadas").insert(spt_rows);
      }
      // CPT — cpt_pontos
      if (ensaio.tipo === "liquefacao_cpt" && rawObj.cpt) {
        const cpt_rows = (rawObj.cpt || []).map(p=>({
          ensaio_id:ensaio.id, profundidade_m:p.z, qc_mpa:p.qt,
          qt_norm:p.Qt, fr_pct:p.Fr, ic:p.Ic, csr:p.CSR, crr:p.CRR,
          fs_liq:p.FS, argila_like:p.argila_like||false,
        }));
        if (cpt_rows.length) await supabase.from("cpt_pontos").insert(cpt_rows);
      }
      // Bishop — fatias_bishop
      if (ensaio.tipo === "estabilidade_talude" && rawObj.estabilidade?.spt_data) {
        const b_rows = (rawObj.estabilidade?.fatias||[]).map((f,i)=>({
          ensaio_id:ensaio.id, numero_fatia:i+1,
          largura_b_m:f.b, altura_h_m:f.h,
          angulo_alpha_gr:f.alpha*(180/Math.PI), pressao_poros:f.u,
          peso_w_kn_m:f.W,
        }));
        if (b_rows.length) await supabase.from("fatias_bishop").insert(b_rows);
      }

      await supabase.from("ensaios").update({ status: "concluido" }).eq("id", ensaio.id);
      onSaved();
    } catch(e) { setErr(e.message); }
    setSaving(false);
  };

  return (
    <div style={{ background:C.surface, borderRadius:10, padding:14, border:`1px solid ${C.border}` }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.teal, marginBottom:10 }}>
        📋 Inserir Resultados — {norma.label || ensaio.tipo}
      </div>
      <SerialStatusBar/>
      {CalcComp && (
        <div style={{ marginBottom:12 }}>
          <button className="btn-g" style={{ fontSize:11 }} onClick={() => setShowCalc(s => !s)}>
            ⚗ {showCalc ? "Fechar calculadora" : "Abrir calculadora"}
          </button>
          {showCalc && (
            <div style={{ marginTop:10, background:C.bg, borderRadius:8, padding:14, border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:11, color:C.textDim, marginBottom:8 }}>{CALC_MAP[ensaio.tipo].titulo}</div>
              <CalcComp onResult={(resultObj) => {
                setVals(prev => ({ ...prev, ...Object.fromEntries(Object.entries(resultObj).map(([k,v])=>[k,String(v)])) }));
                setShowCalc(false);
              }}/>
            </div>
          )}
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(200px,100%),1fr))", gap:10, marginBottom:12 }}>
        {norma.params.map(p => {
          const v = parseFloat(vals[p.p]);
          const st = !isNaN(v) ? calcSt(v, p.lmin, p.lmax) : null;
          return (
            <div key={p.p} style={{ background:C.bg, borderRadius:8, padding:10, border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:9, color:C.textDim, marginBottom:4 }}>{p.p} {p.u && `(${p.u})`}</div>
              <div style={{ display:"flex", gap:6 }}>
                <input type="number" step="any" className="inp"
                  value={vals[p.p] || ""}
                  onChange={e => setVals(x => ({ ...x, [p.p]: e.target.value }))}
                  style={{ flex:1, padding:"6px 8px", fontSize:12 }}/>
                <BtnSerial onCapture={v => setVals(x => ({ ...x, [p.p]: v.toFixed(4) }))}/>
              </div>
              {st && (
                <div style={{ fontSize:9, marginTop:4, color: sColor(st), fontWeight:700 }}>
                  {sLabel(st)}
                  {p.lmin !== null && <span style={{ color:C.textDim }}> (min: {p.lmin})</span>}
                  {p.lmax !== null && <span style={{ color:C.textDim }}> (max: {p.lmax})</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {err && <div style={{ background:C.red+"22", border:`1px solid ${C.red}`, borderRadius:6, padding:"8px 12px", fontSize:11, color:C.red, marginBottom:10 }}>⚠ {err}</div>}
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <button className="btn-p" onClick={salvar} disabled={saving}>
          {saving ? "⏳ Salvando..." : "💾 Salvar Resultados"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MODAL NOVO ENSAIO
// ══════════════════════════════════════════════════════════════
function NovoEnsaioModal({ supabase, user, authUser, laboratorioId, onClose, onSaved }) {
  const [tipo,    setTipo]    = useState("");
  const [amostra, setAmostra] = useState("");
  const [vals,    setVals]    = useState({});
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");
  const [showCalc,setShowCalc]= useState(false);

  const norma   = tipo ? NORMAS[tipo] : null;
  const CalcComp= tipo && CALC_MAP[tipo] ? CALC_MAP[tipo].comp : null;

  const salvar = async () => {
    if (!tipo || !amostra.trim()) { setErr("Tipo e identificação da amostra são obrigatórios."); return; }
    if (!supabase) { setErr("Supabase não conectado."); return; }
    setSaving(true); setErr("");
    try {
      // Gera código único: DIEFRA-TIPO-TIMESTAMP
      const now = new Date();
      const ts = now.getFullYear().toString().slice(2) +
        String(now.getMonth()+1).padStart(2,"0") +
        String(now.getDate()).padStart(2,"0") + "-" +
        String(now.getHours()).padStart(2,"0") +
        String(now.getMinutes()).padStart(2,"0") +
        String(now.getSeconds()).padStart(2,"0");
      const codigo_auto = (tipo.slice(0,6).toUpperCase().replace(/_/g,"-") + "-" + ts).slice(0,30);

      const payload = {
        codigo: codigo_auto,
        tipo,
        norma: norma?.norma || "",
        amostra_descricao: amostra.trim(),
        status: "concluido",
        data_ensaio: now.toISOString().split("T")[0],
        area: norma?.area || "solos",
      };
      if (laboratorioId) payload.laboratorio_id = laboratorioId;
      if (user?.id && user.id !== authUser?.id) payload.responsavel_id = user.id;

      const { data: ens, error: eE } = await supabase.from("ensaios").insert(payload).select().single();
      if (eE) throw eE;

      if (norma?.params?.length) {
        const res = norma.params.map(p => {
          const v = parseFloat(vals[p.p]);
          return {
            ensaio_id: ens.id,
            parametro: p.p,
            valor_numerico: isNaN(v) ? null : v,
            unidade: p.u,
            limite_minimo: p.lmin,
            limite_maximo: p.lmax,
            status: isNaN(v) ? "pendente" : calcSt(v, p.lmin, p.lmax),
          };
        });
        const { error: rE } = await supabase.from("resultados").insert(res);
        if (rE) throw rE;
      }

      // Salva dados brutos (tara + massas originais) em ensaios_raw
      const rawObj = {};
      Object.entries(vals).forEach(([k,v]) => { if (v !== undefined && v !== "") rawObj[k] = v; });
      if (Object.keys(rawObj).length > 0) {
        await supabase.from("ensaios_raw").insert({
          ensaio_id:    ens.id,
          tipo_calc:    tipo,
          dados_raw:    rawObj,      // coluna v2.6+
          dados_brutos: rawObj,      // coluna original
          origem:       "novo_ensaio_modal",
        });
      }
      // Salva taras individuais se fornecidas
      if (vals._taras_json) {
        try {
          const taras = JSON.parse(vals._taras_json);
          if (Array.isArray(taras) && taras.length > 0) {
            await supabase.from("ensaios_tara").insert(
              taras.map(t => ({ ...t, ensaio_id: ens.id, laboratorio_id: laboratorioId||null }))
            );
          }
        } catch {}
      }

      onSaved(ens);
    } catch(e) { setErr(e.message); }
    setSaving(false);
  };

  return (
    <Modal title={t("newEnsaio")} onClose={onClose} wide>
      <div style={{ display:"grid", gap:14 }}>
        {/* Tipo */}
        <div>
          <label className="lbl">Tipo de Ensaio *</label>
          <select className="sel" value={tipo} onChange={e=>{ setTipo(e.target.value); setVals({}); setShowCalc(false); }} style={{ padding:"8px 10px" }}>
            <option value="">— selecione —</option>
            {Object.entries(NORMAS).map(([k,n])=>(
              <option key={k} value={k}>{n.label} — {n.norma}</option>
            ))}
          </select>
        </div>
        {/* Amostra */}
        <div>
          <label className="lbl">Identificação / Amostra *</label>
          <input className="inp" value={amostra} onChange={e=>setAmostra(e.target.value)} placeholder="Ex: BH-001/A — Solo argiloso — Cota 842m" style={{ padding:"8px 10px" }}/>
        </div>

        {norma && (
          <>
            {/* Calculadora opcional */}
            {CalcComp && (
              <div style={{ background:C.surface, borderRadius:10, padding:14, border:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: showCalc ? 12 : 0 }}>
                  <button className="btn-g" style={{ fontSize:11 }} onClick={()=>setShowCalc(s=>!s)}>
                    ⚗ {showCalc ? "Fechar calculadora" : CALC_MAP[tipo].titulo}
                  </button>
                  {!showCalc && <span style={{ fontSize:9, color:C.textDim }}>Opcional — preencha os resultados abaixo ou use a calculadora</span>}
                </div>
                {showCalc && (
                  <CalcComp onResult={(resultObj, rawData) => {
                    const newVals = {};
                    Object.entries(resultObj).forEach(([k,v]) => { if(v !== null && v !== undefined) newVals[k] = String(v); });
                    if (rawData) newVals["_raw_calc"] = JSON.stringify(rawData);
                    setVals(prev => ({ ...prev, ...newVals }));
                    setShowCalc(false);
                  }}/>
                )}
              </div>
            )}

            {/* Entrada manual */}
            <div>
              <div className="sec">RESULTADOS</div>
              <SerialStatusBar/>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(200px,100%),1fr))", gap:10 }}>
                {norma.params.map(p => {
                  const v = parseFloat(vals[p.p]);
                  const st = !isNaN(v) ? calcSt(v, p.lmin, p.lmax) : null;
                  return (
                    <div key={p.p} style={{ background:C.surface, borderRadius:8, padding:10, border:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:9, color:C.textDim, marginBottom:4 }}>{p.p} {p.u && `(${p.u})`}</div>
                      <div style={{ display:"flex", gap:6 }}>
                        <input type="number" step="any" className="inp"
                          value={vals[p.p] || ""}
                          onChange={e => setVals(x => ({ ...x, [p.p]: e.target.value }))}
                          style={{ flex:1, padding:"6px 8px", fontSize:12 }}/>
                        <BtnSerial onCapture={v => setVals(x => ({ ...x, [p.p]: v.toFixed(4) }))}/>
                      </div>
                      {st && (
                        <div style={{ fontSize:9, marginTop:4, fontWeight:700, color:sColor(st) }}>
                          {sLabel(st)}
                          {p.lmin !== null && <span style={{ color:C.textDim }}> ≥{p.lmin}</span>}
                          {p.lmax !== null && <span style={{ color:C.textDim }}> ≤{p.lmax}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {err && <div style={{ background:C.red+"22", border:`1px solid ${C.red}`, borderRadius:6, padding:"8px 12px", fontSize:11, color:C.red }}>⚠ Erro ao salvar: {err}</div>}

        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
          <button className="btn-g" onClick={onClose}>{t("cancel")}</button>
          <button className="btn-p" onClick={salvar} disabled={!tipo || !amostra || saving}>
            {saving ? t("saving") : t("saveEnsaio")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════
//  ENSAIOS PAGE
// ══════════════════════════════════════════════════════════════
function EnsaiosPage({ ensaios, supabase, canEdit, laboratorioId, user, authUser, onReload }) {
  const [busca,   setBusca]   = useState("");
  const [filtArea,setFiltArea]= useState("todos");
  const [filtSt,  setFiltSt]  = useState("todos");
  const [selE,    setSelE]    = useState(null);
  const [showNovo,setShowNovo]= useState(false);
  const [toast,   setToast]   = useState("");

  const toast$ = msg => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const filtrados = ensaios.filter(e => {
    const matchB = !busca || e.tipo?.includes(busca.toLowerCase()) || e.amostra_descricao?.toLowerCase().includes(busca.toLowerCase()) || e.codigo?.toLowerCase().includes(busca.toLowerCase());
    const matchA = filtArea==="todos" || e.area===filtArea;
    const matchS = filtSt==="todos"   || e.status===filtSt;
    return matchB && matchA && matchS;
  });

  const areas = ["todos",...new Set(ensaios.map(e=>e.area).filter(Boolean))];
  const statuses = ["todos","concluido","em_andamento","pendente","nao_conforme"];

  return (
    <div className="wrap">
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18, flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:160 }}>
          <div style={{ fontSize:22, fontWeight:900, color:C.text }}>⛏ {t("ensaios")}</div>
          <div style={{ fontSize:11, color:C.textDim }}>{filtrados.length} de {ensaios.length} ensaios</div>
        </div>
        {canEdit && <button className="btn-p" onClick={()=>setShowNovo(true)}>{t("newEnsaio")}</button>}
      </div>

      {/* Filtros */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto auto", gap:10, marginBottom:16 }}>
        <input className="inp" value={busca} onChange={e=>setBusca(e.target.value)}
          placeholder="🔍 Buscar por tipo, código ou amostra..." style={{ padding:"8px 12px" }}/>
        <select className="sel" value={filtArea} onChange={e=>setFiltArea(e.target.value)} style={{ padding:"8px 10px" }}>
          {areas.map(a=><option key={a} value={a}>{a==="todos"?"Todas áreas":a}</option>)}
        </select>
        <select className="sel" value={filtSt} onChange={e=>setFiltSt(e.target.value)} style={{ padding:"8px 10px" }}>
          {statuses.map(s=><option key={s} value={s}>{s==="todos"?"Todos status":sLabel(s)||s}</option>)}
        </select>
      </div>

      {/* Layout lista + detalhe */}
      <div style={{ display:"grid", gridTemplateColumns:selE?"1fr 400px":"1fr", gap:16, alignItems:"start" }}>
        {/* Lista */}
        <div style={{ background:C.card, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
          {filtrados.length === 0
            ? <div style={{ padding:32, textAlign:"center", color:C.textDim }}>Nenhum ensaio encontrado</div>
            : filtrados.map((e,i) => {
                const nr = NORMAS[e.tipo];
                const aicon = AICONS[e.area||"solos"] || "⛏";
                const acol  = ACOLORS[e.area||"solos"] || C.emerald;
                const hasCalc = !!CALC_MAP[e.tipo];
                return (
                  <div key={e.id || i}
                    onClick={()=>{ setSelE(prev=>prev?.id===e.id?null:e); window.scrollTo({top:0,behavior:"instant"}); }}
                    style={{ padding:"12px 16px", cursor:"pointer", borderBottom:`1px solid ${C.border}`,
                      background: selE?.id===e.id ? C.surface : "transparent",
                      transition:"background 0.15s" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:20 }}>{aicon}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:C.text, display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                          {nr?.label || e.tipo}
                          {hasCalc && <span style={{ fontSize:8, color:C.teal, background:C.teal+"22", padding:"1px 5px", borderRadius:4 }}>⚗ calc</span>}
                        </div>
                        <div style={{ fontSize:10, color:C.textDim }}>{e.amostra_descricao || "—"}</div>
                        <div style={{ fontSize:9, color:C.textFaint||C.textDim }}>{e.codigo} · {e.data_ensaio}</div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ fontSize:10, fontWeight:700, color:sColor(e.status) }}>{sLabel(e.status)||e.status}</div>
                        <div style={{ fontSize:9, color:acol }}>{nr?.norma||"—"}</div>
                      </div>
                    </div>
                  </div>
                );
              })
          }
        </div>

        {/* Painel detalhe */}
        {selE && (
          <div style={{ background:C.card, borderRadius:12, border:`1px solid ${C.border}`, padding:16, position:"sticky", top:72 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <div style={{ flex:1, fontSize:13, fontWeight:700, color:C.text }}>{NORMAS[selE.tipo]?.label||selE.tipo}</div>
              <button onClick={()=>setSelE(null)} style={{ background:"transparent", border:"none", cursor:"pointer", color:C.textDim, fontSize:16 }}>✕</button>
            </div>
            <div style={{ fontSize:10, color:C.textDim, marginBottom:12 }}>
              <div>Código: <span style={{ color:C.text }}>{selE.codigo}</span></div>
              <div>Amostra: <span style={{ color:C.text }}>{selE.amostra_descricao}</span></div>
              <div>Data: <span style={{ color:C.text }}>{selE.data_ensaio}</span></div>
              <div>Norma: <span style={{ color:C.teal }}>{selE.norma}</span></div>
            </div>

            {/* Resultados existentes */}
            {selE.resultados?.length > 0 && (
              <div style={{ marginBottom:14 }}>
                <div className="sec">RESULTADOS</div>
                {selE.resultados.map((r,i)=>(
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                    padding:"6px 10px", background:C.surface, borderRadius:6, marginBottom:4 }}>
                    <div style={{ fontSize:11, color:C.textDim }}>{r.parametro} {r.unidade&&`(${r.unidade})`}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:C.text }}>
                        {r.valor_numerico !== null ? r.valor_numerico : "—"}
                      </span>
                      <span style={{ fontSize:9, fontWeight:700, color:sColor(r.status) }}>{sLabel(r.status)||""}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* InlineResultPanel se não há resultados e pode editar */}
            {(!selE.resultados || selE.resultados.length === 0) && canEdit && (
              <InlineResultPanel ensaio={selE} supabase={supabase}
                onSaved={()=>{ onReload(); setSelE(null); toast$("✓ Resultados salvos!"); }}/>
            )}
            {(!selE.resultados || selE.resultados.length === 0) && !canEdit && (
              <div style={{ color:C.textDim, fontSize:11, textAlign:"center", padding:16 }}>Ensaio em andamento</div>
            )}
          </div>
        )}
      </div>

      {showNovo && (
        <NovoEnsaioModal supabase={supabase} user={user} authUser={authUser}
          laboratorioId={laboratorioId}
          onClose={()=>setShowNovo(false)}
          onSaved={()=>{ setShowNovo(false); onReload(); toast$("✓ Ensaio salvo!"); }}/>
      )}

      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, background:C.emerald, color:"#000", borderRadius:8,
          padding:"10px 20px", fontWeight:700, fontSize:13, zIndex:9999, boxShadow:"0 4px 20px #0005" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  BARRAGENS / ESTRUTURAS PAGE
// ══════════════════════════════════════════════════════════════
function NovaEstruturaModal({ supabase, labId, onClose, onSave }) {
  const [form, setForm] = useState({ nome:"", codigo:"", tipo:"barragem_terra", metodo:"Bishop",
    fs_estatico:"1.5", fs_sismico:"1.1", nivel_emergencia:"N1", altura_m:"", municipio:"", estado:"", responsavel_tecnico:"", crea_responsavel:"", observacoes:"" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k,v) => setForm(x=>({...x,[k]:v}));

  const salvar = async () => {
    if (!form.nome.trim()) { setErr("Nome é obrigatório."); return; }
    const codigo = form.codigo.trim() || ("EST-" + Date.now().toString().slice(-6));
    setSaving(true); setErr("");
    try {
      const payload = { ...form, codigo, fs_estatico:parseFloat(form.fs_estatico)||1.5,
        fs_sismico:parseFloat(form.fs_sismico)||1.1, altura_m:parseFloat(form.altura_m)||null };
      if (labId) payload.laboratorio_id = labId;
      const { data, error } = await supabase.from("estruturas").insert(payload).select().single();
      if (error) throw error;
      onSave(data);
    } catch(e) { setErr(e.message); }
    setSaving(false);
  };

  const Field = ({label,k,type="text",opts=null,span=1}) => (
    <div style={{ gridColumn:`span ${span}` }}>
      <label className="lbl">{label}</label>
      {opts ? (
        <select className="sel" value={form[k]} onChange={e=>set(k,e.target.value)} style={{ padding:"7px 10px", width:"100%" }}>
          {opts.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
        </select>
      ) : (
        <input type={type} className="inp" value={form[k]} onChange={e=>set(k,e.target.value)} style={{ padding:"7px 10px", width:"100%" }}/>
      )}
    </div>
  );

  return (
    <Modal title="Nova Estrutura" onClose={onClose}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Field label="Nome da Estrutura *" k="nome" span={2}/>
        <Field label="Código" k="codigo"/>
        <Field label="Tipo" k="tipo" opts={[{v:"barragem_terra",l:"Barragem Terra"},{v:"barragem_concreto",l:"Barragem Concreto"},{v:"dique",l:"Dique"},{v:"talude",l:"Talude"},{v:"aterro",l:"Aterro"}]}/>
        <Field label="Método Análise" k="metodo" opts={["Bishop","Janbu","Spencer","Morgenstern-Price"]}/>
        <Field label="Nível Emergência" k="nivel_emergencia" opts={["N1","N2","N3"]}/>
        <Field label="FS Estático" k="fs_estatico" type="number"/>
        <Field label="FS Sísmico" k="fs_sismico" type="number"/>
        <Field label="Altura (m)" k="altura_m" type="number"/>
        <Field label="Município" k="municipio"/>
        <Field label="Estado (UF)" k="estado"/>
        <Field label="Responsável Técnico" k="responsavel_tecnico"/>
        <Field label="CREA Responsável" k="crea_responsavel"/>
        <Field label="Observações" k="observacoes" span={2}/>
      </div>
      {err && <div style={{ marginTop:10, color:C.red, fontSize:11 }}>⚠ {err}</div>}
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:16, borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
        <button className="btn-g" onClick={onClose}>{t("cancel")}</button>
        <button className="btn-p" onClick={salvar} disabled={saving}>{saving?"Salvando...":"💾 Salvar Estrutura"}</button>
      </div>
    </Modal>
  );
}

function BarragensPage({ estruturas, ensaios, supabase, canEdit, labId, onReload }) {
  const [selE, setSelE] = useState(null);
  const [showNova, setShowNova] = useState(false);

  const nivelColor = n => ({N1:C.emerald,N2:C.gold,N3:C.red})[n]||C.textDim;
  const fsColor = fs => fs>=1.5?C.emerald:fs>=1.3?C.gold:C.red;

  return (
    <div className="wrap">
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:22, fontWeight:900, color:C.text }}>🏔 {t("barragens")}</div>
          <div style={{ fontSize:11, color:C.textDim }}>{estruturas.length} estruturas cadastradas</div>
        </div>
        {canEdit && <button className="btn-p" onClick={()=>setShowNova(true)}>+ Nova Estrutura</button>}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(320px,100%),1fr))", gap:14 }}>
        {estruturas.map((e,i) => (
          <div key={e.id||i} onClick={()=>setSelE(prev=>prev?.id===e.id?null:e)}
            style={{ background:C.card, borderRadius:12, border:`2px solid ${selE?.id===e.id?C.emerald:C.border}`,
              padding:16, cursor:"pointer", transition:"border-color 0.15s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <span style={{ fontSize:24 }}>🏔</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{e.nome}</div>
                <div style={{ fontSize:10, color:C.textDim }}>{e.codigo} · {e.tipo?.replace(/_/g," ")} · {e.municipio}/{e.estado}</div>
              </div>
              <div style={{ background:nivelColor(e.nivel_emergencia)+"22", color:nivelColor(e.nivel_emergencia),
                borderRadius:6, padding:"3px 8px", fontSize:10, fontWeight:700 }}>
                {e.nivel_emergencia||"N1"}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {[["FS Estático",e.fs_estatico,fsColor(e.fs_estatico)],["FS Sísmico",e.fs_sismico,fsColor(e.fs_sismico)],["Altura",e.altura_m?e.altura_m+"m":"—",C.textDim]].map(([l,v,col])=>(
                <div key={l} style={{ background:C.surface, borderRadius:8, padding:"8px", textAlign:"center" }}>
                  <div style={{ fontSize:8, color:C.textDim }}>{l}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:col, fontFamily:"'JetBrains Mono',monospace" }}>{v??"-"}</div>
                </div>
              ))}
            </div>
            {e.responsavel_tecnico && <div style={{ fontSize:9, color:C.textDim, marginTop:8 }}>Resp: {e.responsavel_tecnico} · {e.crea_responsavel||""}</div>}
          </div>
        ))}
        {estruturas.length===0 && <div style={{ padding:32, textAlign:"center", color:C.textDim, gridColumn:"1/-1" }}>Nenhuma estrutura cadastrada</div>}
      </div>

      {selE && (
        <div style={{ marginTop:20, background:C.card, borderRadius:12, border:`1px solid ${C.border}`, padding:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div style={{ flex:1, fontSize:15, fontWeight:700, color:C.text }}>Ensaios — {selE.nome}</div>
            <button onClick={()=>setSelE(null)} style={{ background:"transparent", border:"none", cursor:"pointer", color:C.textDim }}>✕</button>
          </div>
          {ensaios.filter(e=>e.estrutura_id===selE.id||e.amostra_descricao?.includes(selE.codigo||selE.nome?.slice(0,10))).length === 0
            ? <div style={{ color:C.textDim, fontSize:11 }}>Nenhum ensaio vinculado</div>
            : ensaios.filter(e=>e.estrutura_id===selE.id||e.amostra_descricao?.includes(selE.codigo||selE.nome?.slice(0,10))).map((e,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px",
                background:C.surface, borderRadius:8, marginBottom:6 }}>
                <span>{AICONS[e.area]||"⛏"}</span>
                <div style={{ flex:1, fontSize:11 }}>{NORMAS[e.tipo]?.label||e.tipo}</div>
                <span style={{ fontSize:9, fontWeight:700, color:sColor(e.status) }}>{sLabel(e.status)||e.status}</span>
              </div>
            ))}
        </div>
      )}

      {showNova && supabase && (
        <NovaEstruturaModal supabase={supabase} labId={labId}
          onClose={()=>setShowNova(false)}
          onSave={()=>{ setShowNova(false); onReload(); }}/>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  LAUDOS / RELATÓRIOS PAGE
// ══════════════════════════════════════════════════════════════
function RelatoriosPage({ ensaios, labNome, userName }) {
  const [selE, setSelE] = useState(null);
  const hoje = new Date().toLocaleDateString("pt-BR");

  const conformes = ensaios.filter(e=>e.status==="concluido"||e.status==="conforme");

  return (
    <div className="wrap">
      <div style={{ fontSize:22, fontWeight:900, color:C.text, marginBottom:18 }}>◧ {t("relatorios")}</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(300px,100%),1fr))", gap:14 }}>
        {conformes.map((e,i)=>(
          <div key={e.id||i} onClick={()=>setSelE(prev=>prev?.id===e.id?null:e)}
            style={{ background:C.card, borderRadius:10, border:`1px solid ${selE?.id===e.id?C.emerald:C.border}`,
              padding:14, cursor:"pointer" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <span style={{ fontSize:18 }}>{AICONS[e.area||"solos"]}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:700 }}>{NORMAS[e.tipo]?.label||e.tipo}</div>
                <div style={{ fontSize:9, color:C.textDim }}>{e.amostra_descricao}</div>
              </div>
              <div style={{ fontSize:10, color:C.emerald, fontWeight:700 }}>{e.data_ensaio}</div>
            </div>
            <div style={{ fontSize:9, color:C.textDim }}>{e.codigo} · {NORMAS[e.tipo]?.norma}</div>
          </div>
        ))}
        {conformes.length===0 && <div style={{ color:C.textDim, padding:32, textAlign:"center" }}>Nenhum ensaio concluído</div>}
      </div>

      {selE && (
        <div style={{ marginTop:20, background:C.card, borderRadius:12, border:`1px solid ${C.border}`, padding:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div style={{ flex:1, fontSize:13, fontWeight:700 }}>Laudo Técnico — {NORMAS[selE.tipo]?.label}</div>
            <button onClick={()=>setSelE(null)} style={{ background:"transparent", border:"none", cursor:"pointer", color:C.textDim }}>✕</button>
          </div>
          <div style={{ background:C.surface, borderRadius:10, padding:20, fontFamily:"'JetBrains Mono',monospace", fontSize:10 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.emerald, marginBottom:8 }}>LAUDO TÉCNICO DE ENSAIO</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12 }}>
              {[["Laboratório",labNome||"SGEDIEFRA"],["Ensaio",NORMAS[selE.tipo]?.label||selE.tipo],["Norma",NORMAS[selE.tipo]?.norma||selE.norma],["Amostra",selE.amostra_descricao],["Data",selE.data_ensaio],["Código",selE.codigo],["Responsável",userName||"—"],["Emissão",hoje]].map(([l,v])=>(
                <div key={l}><span style={{ color:C.textDim }}>{l}: </span><span style={{ color:C.text }}>{v||"—"}</span></div>
              ))}
            </div>
            {selE.resultados?.length > 0 && (
              <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:12 }}>
                <thead><tr>{["Parâmetro","Valor","Unidade","Status"].map(h=>(
                  <th key={h} style={{ padding:"4px 8px", borderBottom:`1px solid ${C.border}`, color:C.textDim, textAlign:"left", fontSize:9 }}>{h}</th>
                ))}</tr></thead>
                <tbody>{selE.resultados.map((r,i)=>(
                  <tr key={i}><td style={{ padding:"4px 8px" }}>{r.parametro}</td>
                    <td style={{ padding:"4px 8px", fontWeight:700 }}>{r.valor_numerico??"-"}</td>
                    <td style={{ padding:"4px 8px", color:C.textDim }}>{r.unidade||"-"}</td>
                    <td style={{ padding:"4px 8px", color:sColor(r.status), fontWeight:700 }}>{sLabel(r.status)||r.status}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
            <div style={{ color:C.textDim, fontSize:9, borderTop:`1px solid ${C.border}`, paddingTop:8 }}>
              SGEDIEFRA v2.0 · ISO/IEC 17025 · ANM 95/2022 · NBR 11682 · {hoje}
            </div>
          </div>
          <button className="btn-p" style={{ marginTop:12 }} onClick={()=>window.print()}>🖨 Imprimir / PDF</button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  REALTIME PAGE
// ══════════════════════════════════════════════════════════════
function RealtimePage({ ensaios, supabase }) {
  const [eventos, setEventos] = useState([]);
  useEffect(() => {
    if (!supabase) return;
    const ch = supabase.channel("realtime-page")
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"ensaios"},(p)=>{
        setEventos(ev=>[{tipo:"ensaio",data:p.new,ts:new Date().toLocaleTimeString("pt-BR")},...ev.slice(0,49)]);
      })
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"resultados"},(p)=>{
        setEventos(ev=>[{tipo:"resultado",data:p.new,ts:new Date().toLocaleTimeString("pt-BR")},...ev.slice(0,49)]);
      })
      .subscribe();
    return ()=>supabase.removeChannel(ch);
  },[supabase]);

  return (
    <div className="wrap">
      <div style={{ fontSize:22, fontWeight:900, color:C.text, marginBottom:18 }}>◎ {t("realtime")}</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
        {[["Ensaios hoje",ensaios.filter(e=>e.data_ensaio===new Date().toISOString().split("T")[0]).length,C.emerald],
          ["Eventos ao vivo",eventos.length,C.teal]].map(([l,v,c])=>(
          <div key={l} style={{ background:C.card, borderRadius:10, border:`1px solid ${C.border}`, padding:16, textAlign:"center" }}>
            <div style={{ fontSize:32, fontWeight:900, color:c }}>{v}</div>
            <div style={{ fontSize:11, color:C.textDim }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ background:C.card, borderRadius:12, border:`1px solid ${C.border}`, padding:16 }}>
        <div style={{ fontSize:11, fontWeight:700, color:C.teal, marginBottom:10 }}>
          📡 Feed em tempo real {supabase?"(conectado)":"(desconectado)"}
        </div>
        {eventos.length === 0
          ? <div style={{ color:C.textDim, fontSize:11, textAlign:"center", padding:24 }}>Aguardando eventos...</div>
          : eventos.map((ev,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px",
              background:C.surface, borderRadius:6, marginBottom:4, fontSize:10 }}>
              <span style={{ color:C.textDim, fontFamily:"'JetBrains Mono',monospace", fontSize:9 }}>{ev.ts}</span>
              <span style={{ color:ev.tipo==="ensaio"?C.emerald:C.teal, fontWeight:700 }}>{ev.tipo==="ensaio"?"ENSAIO":"RESULTADO"}</span>
              <span style={{ color:C.text }}>{ev.data.tipo||ev.data.parametro||JSON.stringify(ev.data).slice(0,60)}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  INSTRUMENTOS PAGE (Config)
// ══════════════════════════════════════════════════════════════
function InstrumentosPage({ supabase, labId }) {
  const FORM_EMPTY = {tag:"",tipo:"piezometro",cota_m:"",alerta_atencao:"",alerta_emergencia:""};
  const [inst, setInst] = useState([]);
  const [form, setForm] = useState(FORM_EMPTY);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Tabela correta: 'instrumentos' (criada pela migração v2.6)
  // NÃO usa instrumentos_config (é tabela de config de usuário)
  const TABLE = "instrumentos";

  useEffect(()=>{
    if(!supabase) return;
    let q = supabase.from(TABLE).select("*").order("created_at",{ascending:false});
    if(labId) q = q.eq("laboratorio_id", labId);
    q.then(({data,error})=>{
      if(!error&&data) setInst(data);
    });
  },[supabase]);

  const salvar = async () => {
    if(!form.tag.trim()) return;
    setLoading(true);
    const payload={
      tag: form.tag.trim(),
      tipo: form.tipo,
      cota_m: parseFloat(form.cota_m)||null,
      alerta_atencao: parseFloat(form.alerta_atencao)||null,
      alerta_emergencia: parseFloat(form.alerta_emergencia)||null,
    };
    if(labId) payload.laboratorio_id = labId;

    if(!supabase){
      if(editId){
        setInst(p=>p.map(x=>x.id===editId?{...x,...payload}:x));
      } else {
        setInst(p=>[...p,{...payload,id:Date.now()}]);
      }
      setForm(FORM_EMPTY); setEditId(null); setShowForm(false); setLoading(false); return;
    }

    if(editId){
      const{data,error}=await supabase.from(TABLE).update(payload).eq("id",editId).select().single();
      if(!error&&data) setInst(p=>p.map(x=>x.id===editId?data:x));
      else if(error) alert("Erro ao salvar: "+error.message);
    } else {
      const{data,error}=await supabase.from(TABLE).insert(payload).select().single();
      if(!error&&data) setInst(p=>[...p,data]);
      else if(error) alert("Erro ao salvar: "+error.message);
    }
    setForm(FORM_EMPTY); setEditId(null); setShowForm(false);
    setLoading(false);
  };

  const excluir = async (id) => {
    if(!confirm("Excluir instrumento?")) return;
    if(!supabase){ setInst(p=>p.filter(x=>x.id!==id)); return; }
    await supabase.from(TABLE).delete().eq("id",id);
    setInst(p=>p.filter(x=>x.id!==id));
  };

  const iniciarEdicao = (ins) => {
    setForm({
      tag: ins.tag||"", tipo: ins.tipo||"piezometro",
      cota_m: ins.cota_m??"", alerta_atencao: ins.alerta_atencao??"",
      alerta_emergencia: ins.alerta_emergencia??""
    });
    setEditId(ins.id);
    setShowForm(true);
  };

  const novoForm = () => { setForm(FORM_EMPTY); setEditId(null); setShowForm(true); };

  return(
    <div className="wrap">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div style={{fontSize:22,fontWeight:900,color:C.text}}>🔌 Instrumentação</div>
        <button className="btn-p" onClick={novoForm}>+ Novo Instrumento</button>
      </div>

      {showForm&&(
        <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.teal}`,padding:16,marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:C.teal,marginBottom:10}}>
            {editId?"✏ Editar Instrumento":"+ Novo Instrumento"}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(180px,100%),1fr))",gap:10,marginBottom:10}}>
            <div><label className="lbl">TAG *</label>
              <input className="inp" value={form.tag} onChange={e=>setForm(x=>({...x,tag:e.target.value}))} style={{padding:"7px 10px",width:"100%"}} placeholder="PIE-01"/>
            </div>
            <div><label className="lbl">Tipo</label>
              <select className="sel" value={form.tipo} onChange={e=>setForm(x=>({...x,tipo:e.target.value}))} style={{padding:"7px 10px",width:"100%"}}>
                {["piezometro","nivel_dagua","recalque","pressao_poros","acelerometro","inclinometro"].map(t=><option key={t} value={t}>{t.replace(/_/g," ")}</option>)}
              </select>
            </div>
            <div><label className="lbl">Cota (m)</label>
              <input type="number" className="inp" value={form.cota_m} onChange={e=>setForm(x=>({...x,cota_m:e.target.value}))} style={{padding:"7px 10px",width:"100%"}}/>
            </div>
            <div><label className="lbl">Alerta Atenção</label>
              <input type="number" className="inp" value={form.alerta_atencao} onChange={e=>setForm(x=>({...x,alerta_atencao:e.target.value}))} style={{padding:"7px 10px",width:"100%"}}/>
            </div>
            <div><label className="lbl">Alerta Emergência</label>
              <input type="number" className="inp" value={form.alerta_emergencia} onChange={e=>setForm(x=>({...x,alerta_emergencia:e.target.value}))} style={{padding:"7px 10px",width:"100%"}}/>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn-p" onClick={salvar} disabled={loading||!form.tag.trim()} style={{minWidth:120}}>
              {loading?"Salvando...":(editId?"💾 Salvar Edição":"+ Adicionar")}
            </button>
            <button className="btn-g" onClick={()=>{setShowForm(false);setEditId(null);setForm(FORM_EMPTY);}}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(220px,100%),1fr))",gap:10}}>
        {inst.map((ins,i)=>(
          <div key={ins.id||i} style={{background:C.card,borderRadius:10,border:`1px solid ${C.border}`,padding:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.teal}}>{ins.tag}</div>
                <div style={{fontSize:10,color:C.textDim}}>{ins.tipo?.replace(/_/g," ")} · {ins.cota_m!=null?ins.cota_m+"m":"—"}</div>
              </div>
              <div style={{display:"flex",gap:4,flexShrink:0}}>
                <button onClick={()=>iniciarEdicao(ins)}
                  style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:5,
                    padding:"3px 7px",cursor:"pointer",fontSize:10,color:C.textDim,transition:"all .15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.teal;e.currentTarget.style.color=C.teal;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textDim;}}>
                  ✏
                </button>
                <button onClick={()=>excluir(ins.id)}
                  style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:5,
                    padding:"3px 7px",cursor:"pointer",fontSize:10,color:C.textDim,transition:"all .15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.red;e.currentTarget.style.color=C.red;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textDim;}}>
                  🗑
                </button>
              </div>
            </div>
            {ins.alerta_atencao!=null&&<div style={{fontSize:9,color:C.gold}}>⚠ Atenção: {ins.alerta_atencao}</div>}
            {ins.alerta_emergencia!=null&&<div style={{fontSize:9,color:C.red}}>🚨 Emergência: {ins.alerta_emergencia}</div>}
          </div>
        ))}
        {inst.length===0&&!showForm&&(
          <div style={{color:C.textDim,fontSize:11,padding:24,gridColumn:"1/-1",textAlign:"center",
            background:C.card,borderRadius:10,border:`1px dashed ${C.border}`}}>
            Nenhum instrumento cadastrado.<br/>
            <button className="btn-p" onClick={novoForm} style={{marginTop:10,fontSize:11}}>+ Registrar Primeiro</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  APP PRINCIPAL — SGEDIEFRA
// ══════════════════════════════════════════════════════════════
export default function SGEDIEFRA() {
  const [sb,    setSb]    = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [user,  setUser]  = useState(null);
  const [labNome,setLabNome]=useState("");
  const [labId, setLabId] = useState(null);
  const [page,  setPage]  = useState("dashboard");
  const [ensaios,   setEnsaios]   = useState([]);
  const [estruturas,setEstruturas]= useState([]);
  const [loading,   setLoading]   = useState(false);
  const [logo, setLogo] = useState(DEFAULT_LOGO);
  const [showConfig,setShowConfig]= useState(false);
  const [showLogoEd,setShowLogoEd]= useState(false);
  const [initDone,  setInitDone]  = useState(false);

  const canEdit = user?.role === "admin" || user?.role === "engenheiro" || user?.role === "tecnico";

  // Expõe cliente Supabase globalmente (FerramentasPage, serial)
  useEffect(() => { window._sgSb = sb; }, [sb]);

  // ── Auto-login saved credentials ─────────────────────────────
  useEffect(()=>{
    const saved = localStorage.getItem("sgediefra_creds");
    if(saved){try{const{url,key}=JSON.parse(saved);if(url&&key)doConnect(url,key);}catch{}}
  },[]);

  const doConnect = async (url, key) => {
    try {
      const client = createClient(url, key);
      // Salva credenciais imediatamente para auto-login no próximo reload
      localStorage.setItem("sgediefra_creds", JSON.stringify({url,key}));
      // Guarda url/key no objeto client para recuperar depois
      client._sgUrl = url;
      client._sgKey = key;
      const { data:{ session } } = await client.auth.getSession();
      if (!session) { setSb(client); return; }   // vai para tela de login
      setSb(client);
      setAuthUser(session.user);
      await loadProfile(client, session.user);
    } catch(e) {
      console.error("doConnect error:", e);
      setSb(null);
      localStorage.removeItem("sgediefra_creds");
    }
  };

  const loadProfile = async (client, au) => {
    setLoading(true);
    try {
      const { data:prof } = await client.from("usuarios").select("*,laboratorios(nome)").eq("auth_id", au.id).single();
      if (prof) {
        setUser(prof);
        setLabNome(prof.laboratorios?.nome || "");
        setLabId(prof.laboratorio_id);
      }
      await loadData(client, prof?.laboratorio_id);
    } catch(e) { console.error(e); }
    setLoading(false);
    setInitDone(true);
  };

  const loadData = async (client, lid) => {
    const sb2 = client || sb;
    if (!sb2) return;
    try {
      const q1 = sb2.from("ensaios").select("*,resultados(*)").order("created_at",{ascending:false}).limit(500);
      const q2 = sb2.from("estruturas").select("*").order("created_at",{ascending:false}).limit(100);
      if (lid) { q1.eq("laboratorio_id", lid); q2.eq("laboratorio_id", lid); }
      const [{ data:e },{ data:s }] = await Promise.all([q1, q2]);
      if (e) setEnsaios(e);
      if (s) setEstruturas(s);
    } catch(e) { console.error(e); }
  };

  const handleLogin = async (client, sessionOrUser) => {
    // sessionOrUser pode ser o objeto session { user } ou diretamente o user
    const au = sessionOrUser?.user ?? sessionOrUser;
    setSb(client);
    setAuthUser(au);
    // Tenta salvar credenciais (usa campos internos do cliente)
    const savedCreds = localStorage.getItem("sgediefra_creds");
    if (!savedCreds && client._sgUrl) {
      localStorage.setItem("sgediefra_creds", JSON.stringify({url:client._sgUrl,key:client._sgKey}));
    }
    await loadProfile(client, au);
  };

  const handleLogout = () => {
    sb?.auth.signOut();
    setSb(null); setAuthUser(null); setUser(null);
    setEnsaios([]); setEstruturas([]);
    localStorage.removeItem("sgediefra_creds");
  };

  const changePage = (p) => { setPage(p); window.scrollTo({top:0,behavior:"instant"}); };

  // ── Sem Supabase: config screen ───────────────────────────────
  if (!sb) return <ConfigScreen onConnect={doConnect} logo={logo}/>;
  // ── Supabase mas sem login ─────────────────────────────────────
  if (!authUser) return <LoginScreen supabase={sb} onLogin={handleLogin} logo={logo}/>;
  // ── Loading ───────────────────────────────────────────────────
  if (loading && !initDone) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, color:C.text }}>
      <style>{CSS}</style>
      <div style={{ textAlign:"center" }}>
        <DiefraLogo size={48}/>
        <div style={{ marginTop:16, fontSize:13, color:C.textDim }}>{t("loading")}</div>
      </div>
    </div>
  );

  const PAGES = [
    {id:"dashboard",    icon:"◈",  lbl:"Dashboard"},
    {id:"ensaios",      icon:"⛏",  lbl:t("ensaios")},
    {id:"barragens",    icon:"🏔", lbl:t("barragens")},
    {id:"relatorios",   icon:"◧",  lbl:t("relatorios")},
    {id:"ferramentas",  icon:"🧰", lbl:"Ferramentas"},
    {id:"realtime",     icon:"◎",  lbl:t("realtime")},
    {id:"configuracoes",icon:"🔌", lbl:"Instrumentos"},
  ];

  const kpis = {
    // Chaves usadas pelo DashboardPageV2
    total:  ensaios.length,
    conc:   ensaios.filter(e=>e.status==="concluido"||e.status==="conforme").length,
    conf:   ensaios.length>0
              ? Math.round(ensaios.filter(e=>e.status==="concluido"||e.status==="conforme").length/ensaios.length*100)
              : 0,
    nc:     ensaios.filter(e=>e.status==="nao_conforme").length,
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:C.bg, color:C.text, overflowX:"hidden", width:"100vw", maxWidth:"100%" }}>
      <style>{CSS}</style>
      {/* Header */}
      <header style={{ position:"sticky", top:0, zIndex:100, background:C.card,
        borderBottom:`1px solid ${C.border}`, height:52, display:"flex", alignItems:"center",
        padding:"0 16px", gap:10, width:"100%", boxSizing:"border-box", flexShrink:0 }}>
        {/* Logo */}
        <div onClick={()=>setShowLogoEd(true)} style={{ cursor:"pointer", flexShrink:0 }}>
          <DiefraLogo size={32} showText={true}/>
        </div>
        {/* Nav */}
        <nav style={{ display:"flex", gap:1, flex:1, overflowX:"auto", scrollbarWidth:"none" }}>
          {PAGES.map(p=>(
            <button key={p.id} onClick={()=>changePage(p.id)}
              style={{ background:page===p.id?C.surface:"transparent",
                border:`1px solid ${page===p.id?C.border:"transparent"}`,
                cursor:"pointer", padding:"5px 10px", borderRadius:8,
                color:page===p.id?C.emerald:C.textDim,
                fontSize:12, fontWeight:page===p.id?700:500,
                whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:6,
                transition:"all .15s", flexShrink:0 }}>
              <span>{p.icon}</span>
              <span style={{ fontSize:11 }}>{p.lbl}</span>
            </button>
          ))}
        </nav>
        {/* User info */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.text, lineHeight:1.2 }}>{user?.nome||authUser?.email?.split("@")[0]}</div>
            <div style={{ fontSize:9, color:C.emerald, letterSpacing:1 }}>{(user?.role||"user").toUpperCase()} · <span style={{color:C.textDim}}>{labNome||"SUPABASE LIVE"}</span></div>
          </div>
          <button onClick={handleLogout} title="Sair"
            style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:8,
              padding:"6px 10px", cursor:"pointer", color:C.textDim, fontSize:13,
              transition:"all .15s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=C.red}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>⏻</button>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex:1, overflowY:"auto", width:"100%", minWidth:0 }}>
        {page==="dashboard" && (
          <DashboardPageV2 ensaios={ensaios} estruturas={estruturas} kpis={kpis} logo={logo}
            canEdit={canEdit} onNewEnsaio={()=>changePage("ensaios")}/>
        )}
        {page==="ensaios" && (
          <EnsaiosPage ensaios={ensaios} supabase={sb} canEdit={canEdit}
            laboratorioId={labId} user={user} authUser={authUser}
            onReload={()=>loadData(sb,labId)}/>
        )}
        {page==="barragens" && (
          <BarragensPage estruturas={estruturas} ensaios={ensaios} supabase={sb}
            canEdit={canEdit} labId={labId} onReload={()=>loadData(sb,labId)}/>
        )}
        {page==="relatorios" && (
          <RelatoriosPage ensaios={ensaios} labNome={labNome} userName={user?.nome}/>
        )}
        {page==="ferramentas" && <FerramentasPage/>}
        {page==="realtime"    && <RealtimePage ensaios={ensaios} supabase={sb}/>}
        {page==="configuracoes"&&<InstrumentosPage supabase={sb} labId={labId}/>}
      </main>

      {/* Logo editor */}
      {showLogoEd && <LogoEditor logo={logo} onSave={l=>{setLogo(l);setShowLogoEd(false);}} onClose={()=>setShowLogoEd(false)}/>}
    </div>
  );
}
