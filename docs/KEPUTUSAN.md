# Keputusan

| Keputusan | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js App Router, React, TypeScript strict | Sesuai brief |
| Backend | Supabase Postgres, Auth, RLS, Storage | Sesuai brief |
| Package manager | pnpm | Lockfile dan dependency reproducible |
| Komponen | Radix primitive + komponen internal | Sesuai brief |
| Styling | Tailwind CSS + token sendiri | Sesuai brief |
| Tes | Vitest, Playwright, pgTAP | Unit, e2e, dan database |
| State | Server Components/Actions, tanpa state global | Sesuai brief |
| Uang | Integer satuan Rupiah | Mencegah float |
| M01 akses | RLS dengan helper `is_owner`, `has_permission`, dan `is_assigned_to_branch` | Akses diuji dan ditegakkan di database |
| M06 katalog | Harga disimpan sebagai integer Rupiah | Mencegah float dan mempertahankan BR-008 serta BR-020 |
