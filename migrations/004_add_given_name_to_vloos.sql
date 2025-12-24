-- Add given_name column to vloos table
alter table vloos add column given_name text;

-- Update existing rows (optional, sets default if needed, or leave null)
-- update vloos set given_name = 'Unknown' where given_name is null;
