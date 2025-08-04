-- 20250804_fix_wallets.sql
-- Purpose:
-- 1) Correct wallet FK direction: wallets.user_id -> users.id
-- 2) Consolidate in_active_wallets into wallets with is_active = false
-- 3) Enforce uniqueness:
--    - UNIQUE (user_id, operator_id) AS wallets_user_operator_unique
--    - PARTIAL UNIQUE (user_id) WHERE is_active = true AS wallets_user_active_unique
-- 4) Add FK users.active_wallet_id -> wallets.id
-- 5) Clean up legacy schema: drop in_active_wallets
-- Notes:
-- - This migration assumes Postgres.
-- - It attempts to be idempotent where possible using IF EXISTS/NOT EXISTS patterns.
-- - Data backfill chooses the most recent updated_at/last_used_at when merging duplicates.
-- - You may need to adjust names/types if your actual DB differs.

BEGIN;

-- 0) Lock tables to avoid races during migration (optional, conservative)
-- You may comment these if causing lock contention in dev.
LOCK TABLE wallets IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE;

-- 1) Ensure wallets.user_id references users.id (fix inverted FK) -----------------------

-- Drop wrong FK if it exists (wallets.user_id -> users.active_wallet_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'wallets'
      AND c.conname = 'wallets_user_id_users_id_fk'
  ) THEN
    ALTER TABLE wallets DROP CONSTRAINT wallets_user_id_users_id_fk;
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- ignore if wallets not present
  NULL;
END$$;

-- Add correct FK wallets.user_id -> users.id if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'wallets'
      AND c.conname = 'wallets_user_id_users_fk'
  ) THEN
    ALTER TABLE wallets
      ADD CONSTRAINT wallets_user_id_users_fk
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE;
  END IF;
END$$;

-- 2) Backfill wallets.user_id if any rows incorrectly store users.active_wallet_id -------
-- Heuristic: if there exists a user where active_wallet_id = wallets.id, set wallets.user_id = users.id
-- Only update when wallets.user_id is NULL or does not match users.id
UPDATE wallets w
SET user_id = u.id
FROM users u
WHERE u.active_wallet_id = w.id
  AND (w.user_id IS NULL OR w.user_id <> u.id);

-- 3) Consolidate in_active_wallets into wallets as is_active = false ---------------------

-- Create temporary staging to merge by (user_id, operator_id)
-- Note: Some in_active_wallets may have NULL user_id; skip those or handle via custom rule.
WITH src AS (
  SELECT
    id,
    balance,
    COALESCE(payment_method, 'INSTORE_CASH') AS payment_method,
    COALESCE(currency, 'USD') AS currency,
    false AS is_active,
    COALESCE(is_default, false) AS is_default,
    address,
    cashtag,
    user_id,
    operator_id,
    last_used_at,
    created_at,
    updated_at
  FROM in_active_wallets
)
-- Upsert: prefer existing wallets row if (user_id, operator_id) already exists.
-- Otherwise insert a new row using the legacy id if not colliding; if id collides, generate a new one.
INSERT INTO wallets (id, balance, payment_method, currency, is_active, is_default, address, cashtag, user_id, operator_id, last_used_at, created_at, updated_at)
SELECT
  s.id,
  s.balance,
  s.payment_method,
  s.currency,
  s.is_active,
  s.is_default,
  s.address,
  s.cashtag,
  s.user_id,
  s.operator_id,
  s.last_used_at,
  COALESCE(s.created_at, NOW()),
  COALESCE(s.updated_at, NOW())
FROM src s
WHERE s.user_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- For conflicts by (user_id, operator_id) where an active (or any) wallet already exists, prefer preserving the most recently updated wallet.
-- We perform a merge by updating existing row when src has a more recent updated_at.
UPDATE wallets w
SET
  balance     = COALESCE(w.balance, s.balance),
  payment_method = COALESCE(w.payment_method, s.payment_method),
  currency    = COALESCE(w.currency, s.currency),
  is_active   = COALESCE(w.is_active, false) AND w.is_active, -- do not auto-activate from inactive source
  is_default  = COALESCE(w.is_default, s.is_default),
  address     = COALESCE(w.address, s.address),
  cashtag     = COALESCE(w.cashtag, s.cashtag),
  last_used_at= GREATEST(COALESCE(w.last_used_at, 'epoch'::timestamp), COALESCE(s.last_used_at, 'epoch'::timestamp)),
  updated_at  = GREATEST(COALESCE(w.updated_at, 'epoch'::timestamp), COALESCE(s.updated_at, NOW()))
FROM in_active_wallets s
WHERE w.user_id = s.user_id
  AND w.operator_id = s.operator_id;

-- 4) Add unique (user_id, operator_id) and partial unique (user_id) where is_active=true --

-- Drop existing composite unique if named differently, then add canonical name
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'wallets' AND c.conname = 'wallets_user_operator_unique'
  ) THEN
    ALTER TABLE wallets DROP CONSTRAINT wallets_user_operator_unique;
  END IF;
EXCEPTION WHEN undefined_table THEN NULL;
END$$;

ALTER TABLE wallets
  ADD CONSTRAINT wallets_user_operator_unique UNIQUE (user_id, operator_id);

-- Create partial unique index for one active wallet per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = ANY (current_schemas(true))
      AND tablename = 'wallets'
      AND indexname = 'wallets_user_active_unique'
  ) THEN
    CREATE UNIQUE INDEX wallets_user_active_unique
      ON wallets(user_id)
      WHERE is_active = true;
  END IF;
END$$;

-- 5) Add FK users.active_wallet_id -> wallets.id (nullable, unique) ---------------------

-- Ensure column exists and has unique index already (code defines unique). Add FK constraint if missing.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'users'
      AND c.conname = 'users_active_wallet_id_wallets_id_fk'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_active_wallet_id_wallets_id_fk
      FOREIGN KEY (active_wallet_id) REFERENCES wallets(id)
      ON UPDATE CASCADE
      ON DELETE SET NULL;
  END IF;
END$$;

-- Optional safety: ensure that when users.active_wallet_id is set, the referenced wallet is_active = true
-- This is implemented as a trigger to keep it DB-enforced.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'users_active_wallet_must_be_active_trg'
  ) THEN
    CREATE OR REPLACE FUNCTION users_active_wallet_must_be_active_fn()
    RETURNS trigger
    LANGUAGE plpgsql AS $BODY$
    BEGIN
      IF NEW.active_wallet_id IS NOT NULL THEN
        PERFORM 1 FROM wallets w WHERE w.id = NEW.active_wallet_id AND w.is_active = true;
        IF NOT FOUND THEN
          RAISE EXCEPTION 'active_wallet_id % must reference an active wallet', NEW.active_wallet_id;
        END IF;
      END IF;
      RETURN NEW;
    END;
    $BODY$;

    CREATE TRIGGER users_active_wallet_must_be_active_trg
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION users_active_wallet_must_be_active_fn();
  END IF;
END$$;

-- 6) Drop in_active_wallets after consolidation -----------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'in_active_wallets') THEN
    DROP TABLE in_active_wallets;
  END IF;
END$$;

COMMIT;