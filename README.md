# PETORA

PETORA adalah aplikasi web operasional terintegrasi untuk klinik hewan dan pet shop.

## Persyaratan

- Node.js LTS
- pnpm
- Docker Desktop atau engine Docker kompatibel
- Akun Supabase untuk staging/produksi

## Pengembangan lokal

```bash
pnpm install
cp .env.example .env.local
pnpm db:start
pnpm dev
```

Isi variabel Supabase dari keluaran `pnpm db:start`. Supabase lokal tersedia pada `http://127.0.0.1:54323`.
Untuk membuat perusahaan, cabang, dan akun Owner pertama:

```bash
SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
  node scripts/setup.mjs nama-perusahaan owner@email.test "Nama Owner" "Kata sandi minimal 10 karakter"
```

## Pemeriksaan

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm db:test
pnpm build
```

## Struktur

- `src/app/app`: aplikasi operasional
- `src/app/portal`: portal pemilik hewan
- `src/modules`: modul bisnis
- `src/lib`: Supabase, uang, dan waktu
- `supabase/migrations`: skema dan fungsi Postgres
- `supabase/tests`: tes database pgTAP
- `docs`: status dan keputusan proyek
