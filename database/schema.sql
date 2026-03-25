-- BlueHorizon Port Database Schema
-- Simplified PostgreSQL table for port search

CREATE TABLE IF NOT EXISTS public.ports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  port_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Ensure pg_trgm extension is available
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN index using pg_trgm for fast fuzzy search on port_name
CREATE INDEX IF NOT EXISTS idx_ports_port_name_trgm ON public.ports USING gin (port_name gin_trgm_ops);