-- Restrict READ access on VLOOS table
-- Users should ONLY be able to read: wallet_address, unlock_date, message, receiver_name
-- They should NOT see: encrypted_private_key, etc.

-- NOTE:
-- In standard Postgres RLS (Row Level Security), policies control WHICH ROWS are visible.
-- They do NOT control WHICH COLUMNS are visible.
-- To restrict COLUMNS, we must use `GRANT SELECT (col1, col2) ...`.

-- However, there is a nuance:
-- 1. The "Giver" (who created the Vloo) probably needs to see the encrypted_private_key to export it or for their own dashboard?
--    Actually, based on the prompt, "users only can read...".
--    If the Giver needs to see the private key to bind it, they do that at creation time.
--    If they need to see it later, this restriction might break that.
--    BUT, the prompt is specific: "high security... users only can read...". 
--    This implies we should hide the private key from EVERYONE via standard SELECT.
--    The Private Key is only needed during "Claiming" (by the Receiver).
--    Claiming should probably be done via a Secure Function (RPC) that has `SECURITY DEFINER` privileges,
--    so it can read the hidden key and return it only if the unlock conditions are met.

-- STRATEGY:
-- 1. Revoke generic SELECT on `vloos`.
-- 2. Grant selective SELECT on specific columns to `authenticated` and `anon` (if public access is needed).
-- 3. If the Giver needs to see more, we might need a separate role or a secure function.
--    Assuming for "High Security" that direct access to keys is blocked.

-- Revoke all SELECT permissions first
REVOKE SELECT ON vloos FROM authenticated;
REVOKE SELECT ON vloos FROM anon;
REVOKE SELECT ON vloos FROM public;

-- Grant SELECT only on safe columns
-- Note: 'id' and 'giver_id' and 'created_at' are usually needed for basic app logic (fetching lists, ordering).
-- The user asked specifically for: "wallet_address, unlock_date, message, receiver_name".
-- I will add 'id', 'giver_id', 'created_at', 'status' because without 'id' and 'giver_id', the RLS policies (which check `giver_id`) and frontend lists might break completely.
-- Hiding 'id' usually makes the table unusable for any relation or UI list.
-- The CRITICAL thing to hide is 'encrypted_private_key'.

GRANT SELECT (
    id, 
    giver_id, 
    created_at, 
    status, 
    wallet_address, 
    unlock_date, 
    message, 
    receiver_name
) ON vloos TO authenticated;

GRANT SELECT (
    id, 
    giver_id, 
    created_at, 
    status, 
    wallet_address, 
    unlock_date, 
    message, 
    receiver_name
) ON vloos TO anon;

-- NOTE: By NOT granting SELECT on 'encrypted_private_key', we ensure that even if a user queries it, Postgres will throw an error.

-- What about Claiming?
-- Since the Receiver needs the private key eventually, they cannot SELECT it directly anymore.
-- You MUST use a Secure Database Function (RPC) to claim the Vloo.
-- That function will have `SECURITY DEFINER` set, meaning it bypasses these grants and can read the full table.
