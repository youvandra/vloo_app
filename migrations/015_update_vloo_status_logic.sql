-- Update the trigger function to handle reverting to 'locked'
CREATE OR REPLACE FUNCTION public.check_vloo_unlock_status()
RETURNS trigger AS $$
BEGIN
  -- If unlock_date is in the past:
  -- Update to 'ready' only if currently 'locked'.
  -- (We don't want to revert 'claimed' to 'ready')
  IF NEW.unlock_date <= NOW() THEN
     IF NEW.status = 'locked' THEN
        NEW.status := 'ready';
     END IF;
  
  -- If unlock_date is in the future:
  -- Update to 'locked' only if currently 'ready'.
  -- (We don't want to revert 'claimed' to 'locked' either, usually)
  ELSIF NEW.unlock_date > NOW() THEN
     IF NEW.status = 'ready' THEN
        NEW.status := 'locked';
     END IF;
  END IF;

  return NEW;
END;
$$ LANGUAGE plpgsql;
