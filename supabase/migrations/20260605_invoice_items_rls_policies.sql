create policy invoice_items_select_internal_or_client
  on public.invoice_items for select
  to authenticated
  using (
    private.is_internal_user()
    or exists (
      select 1
      from public.invoices i
      where i.id = invoice_items.invoice_id
        and private.is_client_user(i.client_id)
    )
  );

create policy invoice_items_insert_internal
  on public.invoice_items for insert
  to authenticated
  with check (private.can_edit_leads());

create policy invoice_items_update_internal
  on public.invoice_items for update
  to authenticated
  using (private.can_edit_leads())
  with check (private.can_edit_leads());

create policy invoice_items_delete_internal
  on public.invoice_items for delete
  to authenticated
  using (private.can_edit_leads());
