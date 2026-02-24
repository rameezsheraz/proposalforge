-- Add columns for proposal scoring, keyword analysis, and success tracking
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS match_score INTEGER;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS important_keywords TEXT;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS missing_keywords TEXT;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost'));

-- Allow users to update their own proposals (for marking won/lost)
CREATE POLICY "Users can update own proposals"
  ON proposals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
