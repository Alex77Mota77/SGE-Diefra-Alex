-- ══════════════════════════════════════════════════════════════
--  SGEDIEFRA — MIGRAÇÃO v2.3
--  Ensaio de Hilf (Método Rápido) — DNER ME 162/94
-- ══════════════════════════════════════════════════════════════

-- Adicionar 'hilf' ao ENUM tipo_ensaio
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'hilf'
      AND enumtypid = 'public.tipo_ensaio'::regtype
  ) THEN
    ALTER TYPE tipo_ensaio ADD VALUE 'hilf' AFTER 'compactacao_proctor';
    RAISE NOTICE '✓ "hilf" adicionado ao ENUM tipo_ensaio';
  ELSE
    RAISE NOTICE '⚠ "hilf" já existia — sem alteração';
  END IF;
END$$;

-- Confirmar resultado
SELECT enumlabel AS tipo_ensaio, enumsortorder AS ordem
FROM pg_enum
WHERE enumtypid = 'public.tipo_ensaio'::regtype
ORDER BY enumsortorder;
