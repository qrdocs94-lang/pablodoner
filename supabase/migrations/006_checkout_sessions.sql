-- Migration 006: checkout_sessions temp table
-- Stores validated order data between Stripe session creation and payment confirmation.
-- The webhook reads from here to create the real order, then deletes the row.

CREATE TABLE IF NOT EXISTS checkout_sessions (
  stripe_session_id TEXT PRIMARY KEY,
  order_data        JSONB        NOT NULL,
  created_at        TIMESTAMPTZ  DEFAULT NOW()
);

-- Only service role (edge functions) should access this table
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;
-- No public RLS policies → anon/authenticated roles cannot read or write

-- Auto-delete rows older than 2 hours (abandoned sessions)
-- This runs as a cron job via pg_cron if available, otherwise cleanup is done by the webhook
-- Manual cleanup: DELETE FROM checkout_sessions WHERE created_at < NOW() - INTERVAL '2 hours';
