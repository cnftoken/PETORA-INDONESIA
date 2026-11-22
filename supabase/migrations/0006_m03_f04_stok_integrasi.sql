-- Migrasi 0006: Integrasi stok pada resep (Fase 5/6, M03-F04 + M08)
-- Menambahkan branch_id pada resep dan fungsi database decrement_stock_fifo (FEFO, BR-006, BR-024).

-- ============================================================
-- Tambah branch_id pada tabel prescriptions
-- ============================================================

alter table prescriptions
  add column if not exists branch_id uuid references branches(id) on delete cascade;

create index if not exists idx_prescriptions_branch_id on prescriptions(branch_id);

-- ============================================================
-- Fungsi database: decrement_stock_fifo (BR-006, BR-007, BR-024)
-- Mengurangi stok dengan FEFO (kedaluwarsa terdekat dulu).
-- Menolak jika stok tidak cukup (tidak boleh minus).
-- ============================================================

create or replace function decrement_stock_fifo(
  p_branch_id uuid,
  p_product_id uuid,
  p_quantity integer,
  p_reference text
) returns void
language plpgsql as $$
declare
  v_available integer;
  v_remaining integer := p_quantity;
  v_batch_id uuid;
  v_batch_qty integer;
  v_take integer;
  v_new_balance integer;
begin
  -- Cek saldo stok tersedia (BR-006: tidak boleh minus)
  select quantity into v_available
  from stock_balances
  where branch_id = p_branch_id and product_id = p_product_id;

  if v_available is null then
    v_available := 0;
  end if;

  if v_available < p_quantity then
    raise exception 'Stok tidak cukup. Tersedia %, diminta %.', v_available, p_quantity;
  end if;

  -- Kurangi saldo stok
  v_new_balance := v_available - p_quantity;
  update stock_balances
  set quantity = v_new_balance, updated_at = now()
  where branch_id = p_branch_id and product_id = p_product_id;

  -- Kurangi batch dengan FEFO (kedaluwarsa terdekat dulu, BR-007)
  for v_batch_id, v_batch_qty in
    select id, quantity
    from stock_batches
    where branch_id = p_branch_id
      and product_id = p_product_id
      and quantity > 0
    order by expiry_date asc
    for update
  loop
    if v_remaining <= 0 then
      exit;
    end if;

    v_take := least(v_batch_qty, v_remaining);
    update stock_batches
    set quantity = v_batch_qty - v_take, updated_at = now()
    where id = v_batch_id;

    v_remaining := v_remaining - v_take;
  end loop;

  if v_remaining > 0 then
    raise exception 'Stok batch tidak mencukupi meski saldo mencukupi.';
  end if;

  -- Catat mutasi out
  insert into stock_mutations (
    branch_id, product_id, mutation_type, quantity, reference, created_at
  ) values (
    p_branch_id, p_product_id, 'out', -p_quantity,
    'RESEP-' || p_reference, now()
  );
end;
$$;

-- ============================================================
-- Izin untuk fungsi
-- ============================================================

grant execute on function decrement_stock_fifo(uuid, uuid, integer, text) to app_user;
