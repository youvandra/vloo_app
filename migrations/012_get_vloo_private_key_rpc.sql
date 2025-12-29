-- Create a secure RPC to fetch the encrypted private key
-- This bypasses the table-level SELECT restriction for this specific column
-- It should be used only when the user is attempting to claim/decrypt

create or replace function get_vloo_private_key(p_vloo_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_encrypted_key jsonb;
begin
  select encrypted_private_key into v_encrypted_key
  from vloos
  where id = p_vloo_id;
  
  return v_encrypted_key;
end;
$$;

-- Grant execute permission to everyone (public/anon need it for claiming flow)
grant execute on function get_vloo_private_key(uuid) to public;
grant execute on function get_vloo_private_key(uuid) to anon;
grant execute on function get_vloo_private_key(uuid) to authenticated;
