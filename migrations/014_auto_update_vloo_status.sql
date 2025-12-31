-- 1. Create a function to check and update status for a single row (Trigger Function)
CREATE OR REPLACE FUNCTION public.check_vloo_unlock_status()
RETURNS trigger AS $$
BEGIN
  -- If the unlock date is in the past and status is not 'ready' (and not 'claimed'), set to 'ready'
  -- We assume 'claimed' is a terminal state that shouldn't be reverted to 'ready' automatically,
  -- but the requirement says "status directly change to ready".
  -- Usually, if it's 'claimed', it should stay 'claimed'.
  -- So we only update if it is 'locked'.
  IF NEW.unlock_date <= NOW() AND NEW.status = 'locked' THEN
    NEW.status := 'ready';
  END IF;
  return NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the trigger to run on INSERT or UPDATE of unlock_date
DROP TRIGGER IF EXISTS tr_check_vloo_unlock_status ON public.vloos;
CREATE TRIGGER tr_check_vloo_unlock_status
BEFORE INSERT OR UPDATE OF unlock_date ON public.vloos
FOR EACH ROW
EXECUTE FUNCTION public.check_vloo_unlock_status();

-- 3. Create a function to batch update all eligible vloos (can be called via RPC or Cron)
CREATE OR REPLACE FUNCTION public.update_expired_vloos()
RETURNS void AS $$
BEGIN
  UPDATE public.vloos
  SET status = 'ready'
  WHERE unlock_date <= NOW() AND status = 'locked';
END;
$$ LANGUAGE plpgsql;

-- 4. Run an immediate update for existing records
SELECT public.update_expired_vloos();

-- 5. (Optional) Schedule this to run every minute using pg_cron
-- Uncomment the following lines if you have the pg_cron extension enabled in your Supabase project:
-- 
-- grant usage on schema cron to postgres;
-- grant all privileges on all tables in schema cron to postgres;
-- select cron.schedule(
--   'check-vloo-status',
--   '* * * * *', -- Every minute
--   $$select public.update_expired_vloos()$$
-- );
