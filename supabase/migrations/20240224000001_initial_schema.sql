-- Proposals table: stores generated proposals per user
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('qa', 'sap', 'dev', 'devops')),
  skills_summary TEXT,
  portfolio_links TEXT,
  generated_proposal TEXT,
  generated_hook TEXT,
  generated_pain_points TEXT,
  generated_cta TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by user and month (for usage counting)
CREATE INDEX IF NOT EXISTS idx_proposals_user_created ON proposals(user_id, created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Users can only read/insert/delete their own proposals
CREATE POLICY "Users can view own proposals"
  ON proposals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own proposals"
  ON proposals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own proposals"
  ON proposals FOR DELETE
  USING (auth.uid() = user_id);
