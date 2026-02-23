/* ============================================================
   Micro2Move — BCNF-ish normalized PostgreSQL schema
   - Includes: tables, constraints, indexes, views, master data
   - Assumes PostgreSQL 13+ (works fine on 14/15/16 as well)
   ============================================================ */

BEGIN;

-- ---------- Extensions (UUID + case-insensitive email) ----------
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;   -- citext

-- ---------- Optional: dedicated schema ----------
CREATE SCHEMA IF NOT EXISTS micro2move;
SET search_path = micro2move, public;

-- ============================================================
-- 1) MASTER / LOOKUP TABLES (independent)
-- ============================================================

-- ---- Authorization roles (master: renter, supplier, admin)
CREATE TABLE IF NOT EXISTS authorization (
  authorization_id   smallserial PRIMARY KEY,
  authorization_role text NOT NULL UNIQUE
    CHECK (authorization_role = lower(trim(authorization_role)))
);

-- ---- e-bike status (master: is_listed, is_booked, in_use, has_issue)
CREATE TABLE IF NOT EXISTS e_bike_status (
  e_bike_status_id   smallserial PRIMARY KEY,
  e_bike_status_name text NOT NULL UNIQUE
    CHECK (e_bike_status_name = lower(trim(e_bike_status_name)))
);

-- ---- e-bike category (master)
CREATE TABLE IF NOT EXISTS e_bike_category (
  e_bike_category_id   smallserial PRIMARY KEY,
  e_bike_category_name text NOT NULL UNIQUE
    CHECK (length(trim(e_bike_category_name)) >= 2)
);

-- ---- Feature check master
CREATE TABLE IF NOT EXISTS feature_check (
  feature_check_id   smallserial PRIMARY KEY,
  feature_check_name text NOT NULL UNIQUE
    CHECK (length(trim(feature_check_name)) >= 5)
);

-- ---- Accounts type master
CREATE TABLE IF NOT EXISTS accounts_type (
  accounts_type_id   smallserial PRIMARY KEY,
  accounts_type_name text NOT NULL UNIQUE
    CHECK (length(trim(accounts_type_name)) >= 3)
);

-- ---- Geo location type master
CREATE TABLE IF NOT EXISTS geo_location_type (
  geo_location_type_id   smallserial PRIMARY KEY,
  geo_location_type_name text NOT NULL UNIQUE
    CHECK (length(trim(geo_location_type_name)) >= 3)
);

-- ---- Booking status (needed because booking is referenced everywhere)
CREATE TABLE IF NOT EXISTS booking_status (
  booking_status_id   smallserial PRIMARY KEY,
  booking_status_name text NOT NULL UNIQUE
    CHECK (booking_status_name = lower(trim(booking_status_name)))
);

-- ============================================================
-- 2) CORE ENTITIES
-- ============================================================

-- ---- Users
CREATE TABLE IF NOT EXISTS users (
  user_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  full_name            varchar(150) NOT NULL
    CHECK (length(trim(full_name)) >= 2),

  hashed_password      text NOT NULL
    CHECK (length(trim(hashed_password)) >= 20),

  date_of_birth        date,

  email                citext NOT NULL UNIQUE
    CHECK (email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'),

  tnc_accepted         boolean NOT NULL DEFAULT false,

  profile_image_link   text,
  govt_id_image_link   text,

  joining_date         timestamptz NOT NULL DEFAULT now(),

  is_active            boolean NOT NULL DEFAULT true
);

-- Helpful partial indexes
CREATE INDEX IF NOT EXISTS idx_users_active
  ON users (user_id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_users_joining_date
  ON users (joining_date DESC);

-- ---- User ↔ Authorization (many-to-many)
CREATE TABLE IF NOT EXISTS user_authorization (
  user_id           uuid NOT NULL,
  authorization_id  smallint NOT NULL,
  granted_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, authorization_id),
  CONSTRAINT fk_ua_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_ua_auth FOREIGN KEY (authorization_id) REFERENCES authorization(authorization_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_user_authorization_auth
  ON user_authorization (authorization_id);

-- ---- Supplier (subset of users; 1:1 with users)
CREATE TABLE IF NOT EXISTS supplier (
  supplier_user_id uuid PRIMARY KEY,
  is_verified      boolean NOT NULL DEFAULT false,
  verified_at      timestamptz,
  CONSTRAINT fk_supplier_user FOREIGN KEY (supplier_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT chk_supplier_verified_at
    CHECK ((is_verified = false AND verified_at IS NULL) OR (is_verified = true AND verified_at IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_supplier_is_verified
  ON supplier (is_verified);

-- ---- Geo location (normalized address/location object)
CREATE TABLE IF NOT EXISTS geo_location (
  geo_location_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  geo_location_name         text NOT NULL
    CHECK (length(trim(geo_location_name)) >= 2),

  geo_location_details      text,
  geo_location_postal_address text NOT NULL
    CHECK (length(trim(geo_location_postal_address)) >= 5),

  geo_location_type_id      smallint NOT NULL,
  latitude                  numeric(9,6),
  longitude                 numeric(9,6),

  geo_location_start_date   date,
  geo_location_end_date     date,

  CONSTRAINT fk_geo_location_type
    FOREIGN KEY (geo_location_type_id) REFERENCES geo_location_type(geo_location_type_id) ON DELETE RESTRICT,

  CONSTRAINT chk_geo_location_dates
    CHECK (geo_location_end_date IS NULL OR geo_location_start_date IS NULL OR geo_location_end_date >= geo_location_start_date),

  CONSTRAINT chk_geo_lat CHECK (latitude IS NULL OR (latitude BETWEEN -90 AND 90)),
  CONSTRAINT chk_geo_lon CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180))
);

CREATE INDEX IF NOT EXISTS idx_geo_location_type
  ON geo_location (geo_location_type_id);

CREATE INDEX IF NOT EXISTS idx_geo_location_lat_lon
  ON geo_location (latitude, longitude);

-- ============================================================
-- 3) E-BIKE DOMAIN
-- ============================================================

-- ---- e-bike
CREATE TABLE IF NOT EXISTS e_bike (
  e_bike_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  e_bike_name          varchar(120) NOT NULL
    CHECK (length(trim(e_bike_name)) >= 2),

  supplier_user_id     uuid NOT NULL,
  price_per_week       numeric(10,2) NOT NULL
    CHECK (price_per_week >= 0),

  available_from_date  date NOT NULL,
  available_to_date    date,
  CONSTRAINT chk_bike_availability_dates
    CHECK (available_to_date IS NULL OR available_to_date >= available_from_date),

  e_bike_category_id   smallint NOT NULL,
  pick_up_geo_location_id uuid,

  e_bike_status_id     smallint NOT NULL,

  created_at           timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT fk_bike_supplier FOREIGN KEY (supplier_user_id) REFERENCES supplier(supplier_user_id) ON DELETE RESTRICT,
  CONSTRAINT fk_bike_category FOREIGN KEY (e_bike_category_id) REFERENCES e_bike_category(e_bike_category_id) ON DELETE RESTRICT,
  CONSTRAINT fk_bike_pickup_location FOREIGN KEY (pick_up_geo_location_id) REFERENCES geo_location(geo_location_id) ON DELETE SET NULL,
  CONSTRAINT fk_bike_status FOREIGN KEY (e_bike_status_id) REFERENCES e_bike_status(e_bike_status_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_bike_supplier
  ON e_bike (supplier_user_id);

CREATE INDEX IF NOT EXISTS idx_bike_status
  ON e_bike (e_bike_status_id);

CREATE INDEX IF NOT EXISTS idx_bike_category
  ON e_bike (e_bike_category_id);

CREATE INDEX IF NOT EXISTS idx_bike_availability
  ON e_bike (available_from_date, available_to_date);

-- ---- e-bike feature checks (per bike per check)
CREATE TABLE IF NOT EXISTS e_bike_feature_check (
  e_bike_id         uuid NOT NULL,
  feature_check_id  smallint NOT NULL,
  checked_ok        boolean NOT NULL DEFAULT false,
  checked_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (e_bike_id, feature_check_id),
  CONSTRAINT fk_ebfc_bike FOREIGN KEY (e_bike_id) REFERENCES e_bike(e_bike_id) ON DELETE CASCADE,
  CONSTRAINT fk_ebfc_feature FOREIGN KEY (feature_check_id) REFERENCES feature_check(feature_check_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_ebfc_feature
  ON e_bike_feature_check (feature_check_id);

-- ============================================================
-- 4) BOOKINGS + OPERATIONAL TABLES
-- ============================================================

-- ---- Booking
CREATE TABLE IF NOT EXISTS booking (
  booking_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  e_bike_id           uuid NOT NULL,
  renter_user_id      uuid NOT NULL,

  booking_status_id   smallint NOT NULL,

  start_date          date NOT NULL,
  end_date            date NOT NULL,
  CONSTRAINT chk_booking_dates CHECK (end_date >= start_date),

  booking_date_time   timestamptz NOT NULL DEFAULT now(),

  agreed_price_per_week numeric(10,2) NOT NULL CHECK (agreed_price_per_week >= 0),
  total_amount        numeric(12,2) NOT NULL CHECK (total_amount >= 0),

  pick_up_geo_location_id uuid,
  return_geo_location_id  uuid,

  CONSTRAINT fk_booking_bike FOREIGN KEY (e_bike_id) REFERENCES e_bike(e_bike_id) ON DELETE RESTRICT,
  CONSTRAINT fk_booking_renter FOREIGN KEY (renter_user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
  CONSTRAINT fk_booking_status FOREIGN KEY (booking_status_id) REFERENCES booking_status(booking_status_id) ON DELETE RESTRICT,
  CONSTRAINT fk_booking_pickup_location FOREIGN KEY (pick_up_geo_location_id) REFERENCES geo_location(geo_location_id) ON DELETE SET NULL,
  CONSTRAINT fk_booking_return_location FOREIGN KEY (return_geo_location_id) REFERENCES geo_location(geo_location_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_booking_bike
  ON booking (e_bike_id);

CREATE INDEX IF NOT EXISTS idx_booking_renter
  ON booking (renter_user_id);

CREATE INDEX IF NOT EXISTS idx_booking_status
  ON booking (booking_status_id);

CREATE INDEX IF NOT EXISTS idx_booking_dates
  ON booking (start_date, end_date);

-- ---- e-bike rating
CREATE TABLE IF NOT EXISTS e_bike_rating (
  e_bike_rating_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  renter_user_id     uuid NOT NULL,
  e_bike_id          uuid NOT NULL,
  e_bike_rating      smallint NOT NULL CHECK (e_bike_rating BETWEEN 1 AND 5),
  comment            text,
  rating_date_time   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_rating_renter FOREIGN KEY (renter_user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
  CONSTRAINT fk_rating_bike FOREIGN KEY (e_bike_id) REFERENCES e_bike(e_bike_id) ON DELETE CASCADE,
  CONSTRAINT uq_rating_once UNIQUE (renter_user_id, e_bike_id)
);

CREATE INDEX IF NOT EXISTS idx_rating_bike
  ON e_bike_rating (e_bike_id);

-- ---- Issue (reported problem)
CREATE TABLE IF NOT EXISTS issue (
  issue_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL,
  e_bike_id            uuid NOT NULL,
  booking_id          uuid,
  issue_image_link    text,
  issue_description   text NOT NULL CHECK (length(trim(issue_description)) >= 5),
  issue_date_time     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_issue_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
  CONSTRAINT fk_issue_bike FOREIGN KEY (e_bike_id) REFERENCES e_bike(e_bike_id) ON DELETE RESTRICT,
  CONSTRAINT fk_issue_booking FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_issue_bike
  ON issue (e_bike_id);

CREATE INDEX IF NOT EXISTS idx_issue_booking
  ON issue (booking_id);

CREATE INDEX IF NOT EXISTS idx_issue_date
  ON issue (issue_date_time DESC);

-- ---- Issue ↔ Feature check (many-to-many)
CREATE TABLE IF NOT EXISTS issue_feature_check (
  issue_id          uuid NOT NULL,
  feature_check_id  smallint NOT NULL,
  PRIMARY KEY (issue_id, feature_check_id),
  CONSTRAINT fk_ifc_issue FOREIGN KEY (issue_id) REFERENCES issue(issue_id) ON DELETE CASCADE,
  CONSTRAINT fk_ifc_feature FOREIGN KEY (feature_check_id) REFERENCES feature_check(feature_check_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_ifc_feature
  ON issue_feature_check (feature_check_id);

-- ---- Handover (1:1 with booking)
CREATE TABLE IF NOT EXISTS handover (
  handover_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id             uuid NOT NULL UNIQUE,
  handover_date_time     timestamptz NOT NULL DEFAULT now(),
  handover_location_id   uuid,
  pre_handover_image_link text,
  CONSTRAINT fk_handover_booking FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE,
  CONSTRAINT fk_handover_location FOREIGN KEY (handover_location_id) REFERENCES geo_location(geo_location_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_handover_datetime
  ON handover (handover_date_time DESC);

-- ---- Return (bike_return to avoid reserved word)
CREATE TABLE IF NOT EXISTS bike_return (
  return_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id         uuid NOT NULL UNIQUE,
  return_date_time   timestamptz NOT NULL DEFAULT now(),
  return_location_id uuid,
  return_image_link  text,
  CONSTRAINT fk_return_booking FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE,
  CONSTRAINT fk_return_location FOREIGN KEY (return_location_id) REFERENCES geo_location(geo_location_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_return_datetime
  ON bike_return (return_date_time DESC);

-- ---- Incident (tied to booking)
CREATE TABLE IF NOT EXISTS incident (
  incident_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id           uuid NOT NULL,
  incident_date        date NOT NULL DEFAULT current_date,
  incident_image_link  text,
  incident_description text NOT NULL CHECK (length(trim(incident_description)) >= 5),
  CONSTRAINT fk_incident_booking FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_incident_booking
  ON incident (booking_id);

CREATE INDEX IF NOT EXISTS idx_incident_date
  ON incident (incident_date DESC);

-- ---- Insurance claim (1:1 with incident)
CREATE TABLE IF NOT EXISTS insurance_claim (
  insurance_claim_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id              uuid NOT NULL UNIQUE,
  insurance_claim_details  text NOT NULL CHECK (length(trim(insurance_claim_details)) >= 5),
  created_at               timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_claim_incident FOREIGN KEY (incident_id) REFERENCES incident(incident_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_claim_created
  ON insurance_claim (created_at DESC);

-- ---- Accounts ledger (tied to booking + type)
CREATE TABLE IF NOT EXISTS accounts (
  accounts_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id        uuid NOT NULL,
  amount_credit     numeric(12,2) NOT NULL CHECK (amount_credit >= 0),
  accounts_type_id  smallint NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  note              text,
  CONSTRAINT fk_accounts_booking FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE,
  CONSTRAINT fk_accounts_type FOREIGN KEY (accounts_type_id) REFERENCES accounts_type(accounts_type_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_accounts_booking
  ON accounts (booking_id);

CREATE INDEX IF NOT EXISTS idx_accounts_type
  ON accounts (accounts_type_id);

CREATE INDEX IF NOT EXISTS idx_accounts_created
  ON accounts (created_at DESC);

-- ---- Booking cancellation (0/1 per booking)
CREATE TABLE IF NOT EXISTS booking_cancellation (
  booking_cancellation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id              uuid NOT NULL UNIQUE,
  cancellation_date       date NOT NULL DEFAULT current_date,
  cancellation_charge     numeric(12,2) NOT NULL DEFAULT 0 CHECK (cancellation_charge >= 0),
  CONSTRAINT fk_cancellation_booking FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cancellation_date
  ON booking_cancellation (cancellation_date DESC);

-- ============================================================
-- 5) VIEWS (useful read models)
-- ============================================================

-- ---- View: user roles
CREATE OR REPLACE VIEW v_user_roles AS
SELECT
  u.user_id,
  u.full_name,
  u.email,
  u.is_active,
  array_agg(a.authorization_role ORDER BY a.authorization_role) AS roles
FROM users u
LEFT JOIN user_authorization ua ON ua.user_id = u.user_id
LEFT JOIN authorization a ON a.authorization_id = ua.authorization_id
GROUP BY u.user_id, u.full_name, u.email, u.is_active;

-- ---- View: available bikes (listed and within availability window)
CREATE OR REPLACE VIEW v_available_bikes AS
SELECT
  b.e_bike_id,
  b.e_bike_name,
  b.price_per_week,
  b.available_from_date,
  b.available_to_date,
  c.e_bike_category_name,
  s.e_bike_status_name,
  b.supplier_user_id,
  b.pick_up_geo_location_id
FROM e_bike b
JOIN e_bike_category c ON c.e_bike_category_id = b.e_bike_category_id
JOIN e_bike_status s ON s.e_bike_status_id = b.e_bike_status_id
WHERE s.e_bike_status_name = 'is_listed';

-- ---- View: booking summary
CREATE OR REPLACE VIEW v_booking_summary AS
SELECT
  bk.booking_id,
  bk.booking_date_time,
  bk.start_date,
  bk.end_date,
  bs.booking_status_name,
  bk.total_amount,
  bk.renter_user_id,
  u.full_name AS renter_name,
  bk.e_bike_id,
  eb.e_bike_name,
  eb.supplier_user_id
FROM booking bk
JOIN booking_status bs ON bs.booking_status_id = bk.booking_status_id
JOIN users u ON u.user_id = bk.renter_user_id
JOIN e_bike eb ON eb.e_bike_id = bk.e_bike_id;

-- ============================================================
-- 6) MASTER DATA LOAD (safe, idempotent)
-- ============================================================

-- Authorization roles
INSERT INTO authorization (authorization_role) VALUES
  ('renter'), ('supplier'), ('admin')
ON CONFLICT (authorization_role) DO NOTHING;

-- e-bike status
INSERT INTO e_bike_status (e_bike_status_name) VALUES
  ('is_listed'), ('is_booked'), ('in_use'), ('has_issue')
ON CONFLICT (e_bike_status_name) DO NOTHING;

-- e-bike categories
INSERT INTO e_bike_category (e_bike_category_name) VALUES
  ('city'),
  ('hybrid/ trecking'),
  ('mountain'),
  ('cargo'),
  ('folding'),
  ('fat tyre'),
  ('road')
ON CONFLICT (e_bike_category_name) DO NOTHING;

-- Feature checks
INSERT INTO feature_check (feature_check_name) VALUES
  ('Battery charges and holds power'),
  ('Motor assist functioning smoothly'),
  ('Brakes responsive and reliable'),
  ('Lights and indicators working'),
  ('Display and controls operational'),
  ('Tyres properly inflated, no damage'),
  ('Frame, seat, pedals secure')
ON CONFLICT (feature_check_name) DO NOTHING;

-- Accounts types
INSERT INTO accounts_type (accounts_type_name) VALUES
  ('rental received'),
  ('insurance premium received'),
  ('supplier payout'),
  ('insurance premium payout'),
  ('cancellation pay to renter'),
  ('issue pay to renter'),
  ('incident pay to renter')
ON CONFLICT (accounts_type_name) DO NOTHING;

-- Geo location types
INSERT INTO geo_location_type (geo_location_type_name) VALUES
  ('charging station'),
  ('dedicated bike station')
ON CONFLICT (geo_location_type_name) DO NOTHING;

-- Booking status
INSERT INTO booking_status (booking_status_name) VALUES
  ('requested'),
  ('confirmed'),
  ('in_use'),
  ('completed'),
  ('cancelled')
ON CONFLICT (booking_status_name) DO NOTHING;

COMMIT;
