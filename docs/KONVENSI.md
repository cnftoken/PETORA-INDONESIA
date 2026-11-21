# Konvensi

## Struktur

Gunakan `src/app/app` untuk operasional, `src/app/portal` untuk portal, dan `src/modules/<modul>` untuk komponen, action, query, schema, dan tes.

## Bahasa

Dokumentasi dan UI memakai Bahasa Indonesia. Identifier, tabel, dan kolom memakai Bahasa Inggris.

## Perintah

- `pnpm dev`: aplikasi.
- `pnpm lint`: ESLint.
- `pnpm typecheck`: pemeriksaan tipe.
- `pnpm test`: Vitest.
- `pnpm test:e2e`: Playwright.
- `pnpm db:start`: Supabase lokal.
- `pnpm db:reset`: reset dan migrasi database.
- `pnpm db:test`: pgTAP.
- `pnpm build`: build produksi.
