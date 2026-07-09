CREATE TABLE blog_post_likes (
  post_id uuid PRIMARY KEY REFERENCES blog_posts(id) ON DELETE CASCADE,
  count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blog_post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read like counts" ON blog_post_likes FOR SELECT USING (true);
-- No INSERT/UPDATE policy for anon — writes only happen through the function below.

CREATE OR REPLACE FUNCTION increment_post_like(p_post_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM blog_posts WHERE id = p_post_id AND status = 'published') THEN
    RAISE EXCEPTION 'Post not found';
  END IF;

  INSERT INTO blog_post_likes (post_id, count, updated_at)
  VALUES (p_post_id, 1, now())
  ON CONFLICT (post_id) DO UPDATE
    SET count = blog_post_likes.count + 1, updated_at = now()
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_post_like(uuid) TO anon, authenticated;
