-- Grant SELECT permission on the new scan_count column
GRANT SELECT (scan_count) ON public.vloos TO authenticated;
GRANT SELECT (scan_count) ON public.vloos TO anon;

-- Ensure the increment function is executable
GRANT EXECUTE ON FUNCTION public.increment_vloo_scan_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_vloo_scan_count(UUID) TO anon;
