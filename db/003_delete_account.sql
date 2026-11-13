-- Optional account deletion. Run as the Supabase database owner in SQL Editor.
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = '' as $$
declare caller uuid := (select auth.uid());
begin
  if caller is null then raise exception 'Authentication required'; end if;
  delete from auth.users where id = caller;
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
