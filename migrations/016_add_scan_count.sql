ALTER TABLE public.vloos ADD COLUMN IF NOT EXISTS scan_count INTEGER DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_vloo_scan_count(p_vloo_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.vloos
  SET scan_count = scan_count + 1
  WHERE id = p_vloo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
