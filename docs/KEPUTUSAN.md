# KEPUTUSAN: PETORA

Keputusan teknis dan celah brief yang diputuskan agent. Sumber: apa, kenapa, alternatif yang ditolak. Setiap celah brief yang diputuskan dicatat di sini.

| # | Keputusan | Alasan | Alternatif yang ditolak | Tanggal |
|---|---|---|---|---|
| 1 | TypeScript strict, tanpa `any` bila bisa dihindari | Keamanan tipe, deteksi dini error | JavaScript / TypeScript non-strict | 2026-11-21 |
| 2 | Next.js App Router + React, Server Components default | Stack yang disetujui BRIEF bagian 2 | Pages Router, monorepo | 2026-11-21 |
| 3 | Supabase penuh (Postgres, Auth, RLS, Storage, Realtime terbatas) | Stack yang disetujui BRIEF bagian 2 | Sendiri backend, Firebase, AWS | 2026-11-21 |
| 4 | Server Actions memanggil fungsi Postgres (RPC), tanpa Edge Functions v1 | Stack yang disetujui BRIEF bagian 2 | Edge Functions, tRPC, GraphQL | 2026-11-21 |
| 5 | `@supabase/supabase-js` dan `@supabase/ssr`, tanpa ORM | Stack yang disetujui BRIEF bagian 2 | Prisma, Drizzle, Sequelize | 2026-11-21 |
| 6 | Tailwind CSS dengan token sendiri, komponen di `src/ui` di atas Radix UI | Stack yang disetujui BRIEF bagian 2 | shadcn/ui bawaan, CSS-in-JS | 2026-11-21 |
| 7 | date-fns + pustaka zona waktu IANA | Stack yang disetujui BRIEF bagian 2 | date-fns-tz, dayjs, Moment.js | 2026-11-21 |
| 8 | Vitest, Playwright, pgTAP | Stack yang disetujui BRIEF bagian 2 | Jest, Cypress | 2026-11-21 |
| 9 | Perhitungan uang dan stok di database (fungsi Postgres), TypeScript hanya tampilkan | Prinsip arsitektur BRIEF bagian 3 | Logika bisnis di TypeScript | 2026-11-21 |
| 10 | RLS aktif di setiap tabel tanpa kecuali | Keamanan BRIEF bagian 6 | RLS hanya di tabel sensitif | 2026-11-21 |
| 11 | Uang: bilangan bulat Rupiah, tanpa float | BR-008 | Float / desimal di DB dan TS | 2026-11-21 |
| 12 | PPN: basis poin (1% = 100), tagihan simpan salinan tarif/mode/nilai | BR-020 | Tarif PPN diubah secara global | 2026-11-21 |
| 13 | Pembulatan: total akhir setelah PPN, setengah ke atas, baris terpisah | BR-021 | Pembulatan per baris | 2026-11-21 |
| 14 | Stok: tidak pernah minus, FEFO, batch kedaluwarsa tidak dijual | BR-006, BR-007 | Stok boleh minus, FIFO | 2026-11-21 |
| 15 | Waktu: disimpan UTC, tampil mengikuti zona IANA cabang | BR-016 | Waktu disimpan lokal | 2026-11-21 |
| 16 | Nomor dokumen: `{KODE-CABANG}-{JENIS}-{TAHUN}-{URUT 6 digit}`, unik per cabang per jenis per tahun | BR-022 | Nomor global, UUID | 2026-11-21 |
| 17 | Tipe TypeScript dihasilkan dari skema database (`supabase gen types`) | Prinsip arsitektur BRIEF bagian 3 | Tipe ditulis tangan | 2026-11-21 |
| 18 | Migrasi kecil, satu tujuan, bisa dijalankan ulang dari kosong. Berkas yang sudah dijalankan tidak diedit. | BRIEF bagian 12 | Edit migrasi yang sudah dijalankan | 2026-11-21 |
| 19 | `seed.sql` hanya lokal dan staging, tidak pernah produksi | BRIEF bagian 12 | Seed di produksi | 2026-11-21 |
| 20 | Portal hanya untuk melihat, tidak ada tombol bayar (BR-019) | BR-019 | Pembayaran online di portal | 2026-11-21 |
| 21 | Tidak ada payment gateway, WhatsApp, SMS, email otomatis di v1 | BRIEF bagian 15 | Integrasi pembayaran/notifikasi | 2026-11-21 |

Celah brief yang diputuskan agent: belum ada. Semua keputusan sudah tertulis di BRIEF.md.
