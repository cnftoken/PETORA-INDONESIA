-- Migrasi 0011: Penguncian Entri Medis Final (M04-F01, BR-004)
-- Trigger pada examinations mencegah perubahan entri yang sudah final (is_final=true).

-- ============================================================
-- Fungsi validasi penguncian entri medis final
-- ============================================================

create or replace function trg_validate_examination_final() returns trigger
language plpgsql as $$
begin
  -- Jika entri sudah final, tidak boleh diubah sama sekali
  if old.is_final then
    raise exception 'Entri medis final tidak dapat diubah. Entri yang sudah difinalisasi hanya bisa ditambah dengan addendum.';
  end if;

  return new;
end;
$$;

-- ============================================================
-- Trigger pada examinations
-- ============================================================

create trigger trg_examination_final_lock
  before update on examinations
  for each row
  execute function trg_validate_examination_final();

-- ============================================================
-- Izin untuk simulasi sesi aplikasi (app_user)
-- ============================================================

grant execute on function trg_validate_examination_final() to app_user;
