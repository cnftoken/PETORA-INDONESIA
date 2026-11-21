# KONVENSI: PETORA

Gaya kode, penamaan, dan perintah penting untuk proyek PETORA. Sumber lengkap: `AGENTS.md` bagian 5, 6, 9, 10, 11.

## 1. Penamaan

- Berkas dan folder: huruf kecil, kebab-case (`medical-records`, `stock-opname.ts`).
- Tabel, kolom, fungsi, dan identifier database: bahasa Inggris, snake_case.
- Kode dan identifier TypeScript: bahasa Inggris, nama spesifik domain. Hindari `utils`, `helpers`, `data`, `handler`, `manager`.
- Teks antarmuka dan dokumentasi: Bahasa Indonesia.

## 2. Gaya kode

- TypeScript strict, tanpa `any` bila bisa dihindari.
- Tidak ada komentar dalam kode kecuali diminta pengguna.
- Impor diurutkan: eksternal, lalu internal (`@/`), lalu relative.
- Komponen React: Server Component default, Client Component hanya bila perlu interaktivitas.
- Formulir: React Hook Form + Zod.
- Uang: bilangan bulat Rupiah, tanpa float. Format lewat `src/lib/money`.
- Waktu: disimpan UTC, tampil sesuai zona cabang (IANA). Pakai `src/lib/time`.
- Query: terparameterisasi, tanpa string SQL dirangkai. Tanpa ORM.
- Akses data: `@supabase/supabase-js` dan `@supabase/ssr`.

## 3. Struktur folder

- `src/modules/<nama>/`: `components/`, `actions/`, `queries/`, `schemas/`, `tests/`. Modul tidak mengimpor internal modul lain. Berbagi lewat `src/lib`, `src/ui`, atau `src/types`.
- `src/app/`: hanya rute dan penyambung ke modul. Tidak ada logika bisnis.
- `src/lib/access/`: cek permission untuk UI saja. Penegakan di database lewat RLS.
- `src/types/`: hasil generate dari skema database. Tidak diedit tangan.
- `supabase/migrations/`: berkas baru saja, satu tujuan, bisa dijalankan ulang dari kosong. Berkas yang sudah dijalankan tidak diedit.
- `supabase/tests/`: pgTAP, pola nama `br-XXX-...` atau `Mxx-Fxx-...`.
- `supabase/seed.sql`: hanya lokal dan staging, tidak di produksi.
- `scripts/`: skrip manusia/CI. Tidak ada logika produk.
- `e2e/`: Playwright, alur kritis saja.

## 4. Perintah penting

| Perintah | Keterangan |
|---|---|
| `pnpm install` | Pasang dependensi (di-pin) |
| `pnpm dev` | Jalankan server pengembangan Next.js |
| `pnpm build` | Build produksi Next.js |
| `pnpm lint` | ESLint + Prettier |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test:unit` | Vitest unit dan integrasi |
| `pnpm test:db` | `supabase db reset` lalu `supabase test db` (pgTAP) |
| `pnpm test:e2e` | Playwright |
| `pnpm test` | Semua tes (unit + db + e2e) |
| `supabase gen types typescript --local` | Generate tipe TypeScript dari skema DB |

## 5. Pengujian

- Tes menyebut ID aturan/fitur, misal `BR-001-branch-isolation`, `M10-F05-manual-payment-idempotent`.
- pgTAP: pola `supabase/tests/br-001-branch-isolation.test.sql`.
- Tes baru harus terbukti gagal jika kode yang diujinya dirusak.
- Tidak ada tes yang dinonaktifkan, dilewati, atau diperlonggar.
- Tiap bug yang diperbaiki mendapat tes regresi.
- Uji kasus: jalur normal, nilai batas, input salah, kosong/null, nilai sangat besar, karakter khusus/Unicode, akses tanpa izin, dua aksi bersamaan, aksi berulang.

## 6. Git dan commit

- Cabang utama `main` selalu hijau.
- Pekerjaan di cabang fitur. Commit kecil, utuh, hijau.
- Pesan commit Bahasa Indonesia atau Inggris, awalan: `fitur:`, `perbaikan:`, `refactor:`, `dokumen:`, `tes:`, `migrasi:`. Setengah jadi: `wip:` (tidak masuk `main`).
- Tidak ada perubahan yang menggantung di akhir sesi.

## 7. Keamanan

- Tidak ada secret di repositori. Service role key hanya di environment server, tidak pernah di `NEXT_PUBLIC_*`.
- `.env.example` lengkap, tanpa nilai rahasia.
- Tidak ada data pribadi di log, pesan galat, atau tangkapan layar tes.
- RLS aktif di setiap tabel tanpa kecuali.
- Query terparameterisasi. Validasi di batas sistem.
- Output di-escape. Tanpa `dangerouslySetInnerHTML` untuk data pengguna.

## 8. Aturan uang, stok, waktu, nomor

- Uang: bilangan bulat Rupiah. Pembulatan eksplisit dan tercatat.
- PPN: basis poin (1% = 100). Setiap tagihan menyimpan salinan tarif, mode, dan nilai pajak.
- Pembulatan: pada total akhir setelah PPN, setengah ke atas, baris terpisah "Pembulatan".
- Stok: tidak pernah minus. Pengurangan FEFO. Batch kedaluwarsa tidak bisa dijual.
- Waktu: disimpan UTC. Tampil dan batas hari laporan mengikuti zona IANA cabang.
- Nomor dokumen: `{KODE-CABANG}-{JENIS}-{TAHUN}-{URUT 6 digit}`. Jenis: `VST`, `INV`, `PO`, `TRF`.
