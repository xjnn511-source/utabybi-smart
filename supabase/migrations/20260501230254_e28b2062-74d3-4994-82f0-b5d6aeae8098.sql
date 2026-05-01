CREATE TABLE public.label_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label_key TEXT NOT NULL UNIQUE,
  label_value TEXT NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.label_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read labels"
  ON public.label_overrides FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert labels"
  ON public.label_overrides FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update labels"
  ON public.label_overrides FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete labels"
  ON public.label_overrides FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_label_overrides_updated_at
  BEFORE UPDATE ON public.label_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.label_overrides;
ALTER TABLE public.label_overrides REPLICA IDENTITY FULL;