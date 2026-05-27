
-- 1. Table
CREATE TABLE public.video_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  render_id TEXT,
  result_url TEXT,
  error TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_video_jobs_status_created ON public.video_jobs(status, created_at);
CREATE INDEX idx_video_jobs_user_created ON public.video_jobs(user_id, created_at DESC);

GRANT SELECT, INSERT ON public.video_jobs TO authenticated;
GRANT ALL ON public.video_jobs TO service_role;

ALTER TABLE public.video_jobs ENABLE ROW LEVEL SECURITY;

-- 2. Daily limit helper
CREATE OR REPLACE FUNCTION public.user_video_jobs_today(_user UUID)
RETURNS INTEGER
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COUNT(*)::INT FROM public.video_jobs
  WHERE user_id = _user AND created_at > now() - INTERVAL '1 day'
$$;

-- 3. Policies
CREATE POLICY "Users view own video jobs"
ON public.video_jobs FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own video jobs daily limit"
ON public.video_jobs FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND public.user_video_jobs_today(auth.uid()) < 1
);

-- 4. Updated_at trigger
CREATE TRIGGER trg_video_jobs_updated_at
BEFORE UPDATE ON public.video_jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Realtime
ALTER TABLE public.video_jobs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_jobs;
