-- Independent usage counter table (does not touch the editor logic)
CREATE TABLE public.usage_counters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analyze_deed INTEGER NOT NULL DEFAULT 0,
  generate_text INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.usage_counters TO authenticated;
GRANT ALL ON public.usage_counters TO service_role;

ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
ON public.usage_counters FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
ON public.usage_counters FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
ON public.usage_counters FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_usage_counters_updated_at
BEFORE UPDATE ON public.usage_counters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Atomic increment helper (upsert + $inc equivalent)
CREATE OR REPLACE FUNCTION public.increment_usage(_action TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _action NOT IN ('analyze_deed', 'generate_text') THEN
    RAISE EXCEPTION 'invalid action';
  END IF;

  INSERT INTO public.usage_counters (user_id, analyze_deed, generate_text)
  VALUES (
    auth.uid(),
    CASE WHEN _action = 'analyze_deed' THEN 1 ELSE 0 END,
    CASE WHEN _action = 'generate_text' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    analyze_deed = public.usage_counters.analyze_deed + (CASE WHEN _action = 'analyze_deed' THEN 1 ELSE 0 END),
    generate_text = public.usage_counters.generate_text + (CASE WHEN _action = 'generate_text' THEN 1 ELSE 0 END),
    updated_at = now();
END;
$$;