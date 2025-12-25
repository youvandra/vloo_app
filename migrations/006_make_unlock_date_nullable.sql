-- Make unlock_date nullable in vloos table
ALTER TABLE vloos ALTER COLUMN unlock_date DROP NOT NULL;
