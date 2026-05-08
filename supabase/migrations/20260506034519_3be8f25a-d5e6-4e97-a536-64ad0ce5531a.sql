CREATE TABLE public.text_replacements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  find_text text NOT NULL UNIQUE,
  replace_text text NOT NULL,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.text_replacements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read replacements" ON public.text_replacements FOR SELECT USING (true);
CREATE POLICY "Only admins can insert replacements" ON public.text_replacements FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can update replacements" ON public.text_replacements FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can delete replacements" ON public.text_replacements FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

ALTER PUBLICATION supabase_realtime ADD TABLE public.text_replacements;
ALTER TABLE public.text_replacements REPLICA IDENTITY FULL;