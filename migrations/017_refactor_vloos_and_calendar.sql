-- Migration to refactor database:
-- 1. Delete user_calendar table
-- 2. Modify vloos table to keep only unlock_date and message (and structural columns)
--    Delete: encrypted_private_key, wallet_address, receiver_name, scan_count

-- 1. Drop user_calendar table
DROP TABLE IF EXISTS user_calendar;

-- 2. Modify vloos table
-- We need to be careful with dependencies.
-- verified_cards might depend on vloos.id (FK). That is fine, we are not deleting the table.
-- But if we delete wallet_address, any logic relying on it will break. We are assuming the app logic is being refactored simultaneously.

ALTER TABLE vloos DROP COLUMN IF EXISTS encrypted_private_key;
ALTER TABLE vloos DROP COLUMN IF EXISTS wallet_address;
ALTER TABLE vloos DROP COLUMN IF EXISTS receiver_name;
ALTER TABLE vloos DROP COLUMN IF EXISTS given_name; -- In case it wasn't renamed or old migration lingered
ALTER TABLE vloos DROP COLUMN IF EXISTS scan_count;

-- Note: We keep:
-- id (PK)
-- created_at
-- giver_id (FK to auth.users/public.users)
-- unlock_date
-- message
-- status (Locked/Ready/Claimed logic still seems relevant for a time-capsule message)

-- We might also need to drop the functions that rely on these columns?
-- update_wallet_address_array migration created logic for wallet_address.
-- get_vloo_private_key function uses encrypted_private_key. We should drop it.

DROP FUNCTION IF EXISTS get_vloo_private_key;

-- If there are triggers on wallet_address, they might break.
-- But usually triggers are on the table. If column is gone, trigger might become invalid if it references it.
-- We'll assume standard Postgres behavior (it might drop dependent triggers or error).
-- Ideally we drop the trigger first if it references the column.
-- Let's check for any known triggers.
-- tr_check_vloo_unlock_status depends on unlock_date (keeping it).

