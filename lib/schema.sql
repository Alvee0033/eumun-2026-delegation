-- KUMUN 2026 Delegation Registration Schema
-- Run: psql $DATABASE_URL -f lib/schema.sql

CREATE TABLE IF NOT EXISTS delegations (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(255)  NOT NULL,
  department     VARCHAR(255)  NOT NULL,
  phone          VARCHAR(30)   NOT NULL,
  whatsapp       VARCHAR(30)   NOT NULL,
  dob            DATE          NOT NULL,
  emergency_contact VARCHAR(255) NOT NULL,
  email          VARCHAR(255)  NOT NULL,
  mun_experience TEXT          NOT NULL,
  committee_1st  VARCHAR(100)  NOT NULL,
  committee_2nd  VARCHAR(100)  NOT NULL,
  preferred_role VARCHAR(50)   NOT NULL DEFAULT 'Delegate',
  campus_envoy   VARCHAR(255)  NOT NULL DEFAULT 'Syed Saimum Hasan',
  status         VARCHAR(20)   NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for fast admin queries
CREATE INDEX IF NOT EXISTS idx_delegations_created_at ON delegations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_delegations_status      ON delegations (status);
CREATE INDEX IF NOT EXISTS idx_delegations_committee1  ON delegations (committee_1st);
CREATE INDEX IF NOT EXISTS idx_delegations_department  ON delegations (department);
CREATE INDEX IF NOT EXISTS idx_delegations_email       ON delegations (email);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS delegations_updated_at ON delegations;
CREATE TRIGGER delegations_updated_at
  BEFORE UPDATE ON delegations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
