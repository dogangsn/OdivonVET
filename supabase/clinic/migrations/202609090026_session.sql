create function public.session_entitlement() returns boolean language sql stable security definer set search_path='' as $$
 select private.entitled() and exists(select 1 from public.profiles p where id=auth.uid() and active and (role='owner' or exists(select 1 from public.branches b where b.id=p.branch_id and b.active)));
$$;
revoke all on function public.session_entitlement() from public;grant execute on function public.session_entitlement() to authenticated;
