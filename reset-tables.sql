-- Drop existing tables and sequences
DROP TABLE IF EXISTS ee37_submission CASCADE;
DROP TABLE IF EXISTS ee37_post CASCADE;
DROP SEQUENCE IF EXISTS ee37_post_id_seq CASCADE;
DROP SEQUENCE IF EXISTS ee37_submission_id_seq CASCADE;

-- Create submission table with UUID
CREATE TABLE IF NOT EXISTS ee37_submission (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL,
  word VARCHAR(50) NOT NULL,
  image_url TEXT,
  image_name VARCHAR(256),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS submission_name_idx ON ee37_submission(name);
