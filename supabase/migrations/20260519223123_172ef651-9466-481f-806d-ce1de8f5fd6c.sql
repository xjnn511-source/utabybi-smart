
-- 1) upgrade_requests table
CREATE TABLE public.upgrade_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan text NOT NULL,
  amount_sar integer NOT NULL,
  receipt_url text,
  sender_name text,
  sender_phone text,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);

ALTER TABLE public.upgrade_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own upgrade requests"
  ON public.upgrade_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own upgrade requests"
  ON public.upgrade_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all upgrade requests"
  ON public.upgrade_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update upgrade requests"
  ON public.upgrade_requests FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2) Receipts storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users read own receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins read all receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipts'
    AND has_role(auth.uid(), 'admin'::app_role)
  );

-- 3) Admin-only inserts/updates for subscribers and sales_records
CREATE POLICY "Admins insert subscribers"
  ON public.subscribers FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update subscribers"
  ON public.subscribers FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert sales"
  ON public.sales_records FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
