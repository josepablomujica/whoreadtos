CREATE TABLE adhoc_analyses (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url   text,
  content_hash text,
  score        text        NOT NULL CHECK (score IN ('A','B','C','D','F')),
  items        jsonb       NOT NULL,
  word_count   integer,
  analyzed_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX adhoc_analyses_source_url_idx   ON adhoc_analyses(source_url);
CREATE INDEX adhoc_analyses_content_hash_idx ON adhoc_analyses(content_hash);

ALTER TABLE adhoc_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon read adhoc_analyses"
  ON adhoc_analyses FOR SELECT USING (true);

CREATE POLICY "anon insert adhoc_analyses"
  ON adhoc_analyses FOR INSERT WITH CHECK (true);
