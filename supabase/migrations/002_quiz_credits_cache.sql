/* ============================================================
   Micro2Move — Migration 002
   Adds: quiz_progress, credit_transactions, infrastructure_cache
   Extends: users (credits, verified_id)
   ============================================================ */

BEGIN;

SET search_path = micro2move, public;

-- ---- Credits balance + ID verification on users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS credits     int         NOT NULL DEFAULT 0
    CHECK (credits >= 0),
  ADD COLUMN IF NOT EXISTS verified_id boolean     NOT NULL DEFAULT false;

-- ---- Quiz progress (one row per user × module)
CREATE TABLE IF NOT EXISTS quiz_progress (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL,
  module_id       text        NOT NULL
    CHECK (length(trim(module_id)) >= 2),
  passed          boolean     NOT NULL DEFAULT false,
  last_attempt_at timestamptz,
  next_allowed_at timestamptz,
  credits_earned  int         NOT NULL DEFAULT 0
    CHECK (credits_earned >= 0),
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_qp_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT uq_qp_user_module UNIQUE (user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_qp_user
  ON quiz_progress (user_id);

CREATE INDEX IF NOT EXISTS idx_qp_module
  ON quiz_progress (module_id);

-- ---- Credit transactions (immutable audit ledger)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL,
  amount     int         NOT NULL,
  reason     text        NOT NULL
    CHECK (length(trim(reason)) >= 3),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_ct_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ct_user
  ON credit_transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_ct_created
  ON credit_transactions (created_at DESC);

-- ---- Infrastructure cache (GeoJSON tiles from OSM / ArcGIS)
CREATE TABLE IF NOT EXISTS infrastructure_cache (
  cache_key    text        PRIMARY KEY,
  geojson      jsonb       NOT NULL,
  refreshed_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
