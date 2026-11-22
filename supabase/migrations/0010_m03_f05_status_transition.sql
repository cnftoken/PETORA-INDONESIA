-- Migrasi 0010: Validasi Transisi Status Kunjungan (M03-F05)
-- Trigger pada tabel visits untuk memastikan transisi status mengikuti alur:
-- terdaftar → menunggu → diperiksa → selesai.
-- Pembatalan hanya diperbolehkan sebelum diperiksa (terdaftar/diterima → dibatalkan).

-- ============================================================
-- Fungsi validasi transisi status kunjungan
-- ============================================================

create or replace function trg_validate_visit_status_transition() returns trigger
language plpgsql as $$
declare
  valid_transitions text[][] := array[
    array['terdaftar', 'menunggu'],
    array['terdaftar', 'dibatalkan'],
    array['menunggu', 'diperiksa'],
    array['menunggu', 'dibatalkan'],
    array['diperiksa', 'selesai']
  ];
  transition_valid boolean := false;
  i int;
begin
  -- Jika status tidak berubah, izinkan
  if old.status = new.status then
    return new;
  end if;

  -- Cek apakah transisi ada dalam daftar yang valid
  for i in 1..array_length(valid_transitions, 1) loop
    if valid_transitions[i][1] = old.status and valid_transitions[i][2] = new.status then
      transition_valid := true;
      exit;
    end if;
  end loop;

  if not transition_valid then
    raise exception 'Transisi status kunjungan dari % ke % tidak diperbolehkan. Alur: terdaftar → menunggu → diperiksa → selesai. Pembatalan hanya sebelum diperiksa.', old.status, new.status;
  end if;

  return new;
end;
$$;

-- ============================================================
-- Trigger pada visits
-- ============================================================

create trigger trg_visit_status_transition
  before update of status on visits
  for each row
  execute function trg_validate_visit_status_transition();

-- ============================================================
-- Izin untuk simulasi sesi aplikasi (app_user)
-- ============================================================

grant execute on function trg_validate_visit_status_transition() to app_user;
