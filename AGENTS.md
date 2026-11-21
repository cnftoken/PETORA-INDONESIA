# AGENTS.md: PETORA

File ini mengatur cara agent pengembang bekerja di repositori PETORA. Apa yang dibangun ada di `BRIEF.md`. File ini mengatur bagaimana pekerjaan dilakukan. Fakta yang berubah selama pengembangan (status, keputusan, aturan turunan, masalah) ada di `docs/`.

Agent tidak punya ingatan antar sesi. Ingatannya adalah repositori dan `docs/`. Jika sesuatu penting dan tidak tertulis, anggap hilang.

---

## 0. Prinsip kerja

1. **Bukti, bukan klaim.** Sesuatu dianggap berfungsi hanya setelah dijalankan dan hasilnya diperiksa. Kode yang terlihat benar belum berarti selesai.
2. **Tuntas.** Satu fitur selesai penuh sebelum pindah ke fitur lain. Tidak ada implementasi setengah jadi yang dibiarkan di cabang utama.
3. **Akar masalah, bukan gejala.** Jangan menambal. Temukan penyebabnya lalu perbaiki di sana.
4. **Sederhana.** Solusi paling sederhana yang benar. Tidak ada kerumitan untuk kebutuhan hipotetis.
5. **Jujur.** Laporkan apa yang terverifikasi, apa yang diasumsikan, dan apa yang belum diperiksa. Tes yang gagal dan kasus yang dilewati tidak boleh disembunyikan.
6. **Aman saat ragu.** Jika brief punya celah atau konflik, pilih opsi yang paling aman: membatasi akses, mencegah kehilangan data, mempertahankan jejak audit. Catat di `docs/KEPUTUSAN.md`, lalu lanjut.
7. **Otonom.** Putuskan sendiri, catat alasannya, lanjutkan. Bertanya hanya sesuai bagian 16.

---

## 1. Sumber kebenaran dan urutan prioritas

| Pertanyaan | Sumber | Catatan |
|---|---|---|
| Apa yang dibangun, untuk siapa | `BRIEF.md` | Spesifikasi final. Agent tidak mengubahnya. |
| Bagaimana cara mengerjakannya | `AGENTS.md` (file ini) | |
| Apa yang sedang terjadi sekarang | `docs/STATUS.md` | Harus selalu sesuai kenyataan. |
| Aturan bisnis turunan | `docs/ATURAN-BISNIS.md` | Mengutip BR-001 sampai BR-025 dari brief dan menambah detail. Tidak boleh menyimpang dari brief. |
| Keputusan yang diambil agent | `docs/KEPUTUSAN.md` | Setiap celah brief yang diputuskan dicatat di sini. |

Urutan prioritas jika ada konflik: instruksi langsung dari Owner dalam sesi, lalu `BRIEF.md`, lalu `AGENTS.md`, lalu `docs/`. Tidak ada yang boleh melanggar bagian 6 (keamanan dan isolasi) atau bagian 7 (aturan uang dan stok) meskipun diminta.

---

## 2. Awal dan akhir setiap sesi

**Awal sesi:**
1. Jalankan `git status` dan `git log -10 --oneline`.
2. Baca `docs/STATUS.md`, lalu `BRIEF.md` bagian yang relevan dengan tugas berikutnya, lalu `docs/KONVENSI.md`.
3. Jalankan pemeriksaan dasar: lint, type check, tes, dan build. Hasilnya harus sesuai catatan di `STATUS.md`. Jika tidak, buka masalah dulu (bagian 14).
4. Urutan prioritas pekerjaan: **masalah kritis dan tinggi** lalu **tumpukan jeda** lalu **"Sedang dikerjakan"** lalu **"Langkah berikutnya"**.
5. Lanjutkan dari titik berhenti yang tercatat. Jangan mengulang dari awal.

**Akhir sesi:** lihat bagian 17.

---

## 3. Ingatan: struktur `docs/`

| File | Isi | Diperbarui kapan |
|---|---|---|
| `PRODUK.md` | Ringkasan produk, dua area fungsi, sasaran terukur, arah visual (ringkasan dari BRIEF bagian 1 dan 11) | Jarang. Hanya jika ada keputusan produk baru |
| `FITUR.md` | 72 fitur dalam 12 modul: ID, deskripsi, kriteria selesai, status, lokasi kode, nama tes | Tiap fitur berubah status |
| `ATURAN-BISNIS.md` | BR-001 sampai BR-025 beserta kondisi, hasil, pengecualian, dan status tes otomatis | Saat aturan diimplementasi atau ditemukan detail baru |
| `KEPUTUSAN.md` | Keputusan teknis dan celah brief yang diputuskan agent: apa, kenapa, alternatif yang ditolak | Tiap keputusan |
| `KONVENSI.md` | Gaya kode, penamaan, perintah penting, cara menjalankan tiap jenis tes | Saat konvensi berubah |
| `MASALAH.md` | Riwayat masalah yang sudah tuntas: gejala, akar masalah, perbaikan, pencegahan | Tiap masalah tuntas |
| `STATUS.md` | Ingatan kerja (format di bawah) | Tiap tugas dan tiap jeda |
| `DEPLOYMENT.md` | Langkah rilis, pemulihan dari pencadangan Supabase, rollback. Hanya dicatat setelah dicoba di staging | Fase 12 dan setiap rilis |

**Format `STATUS.md` (tetap):**
- **Gambaran besar:** 3 sampai 5 kalimat tentang kondisi proyek dan fase aktif.
- **Fase aktif:** nomor fase, persentase fitur selesai, dan blokir yang diketahui.
- **Sedang dikerjakan:** tugas, branch, titik berhenti, langkah konkret berikutnya.
- **Tumpukan jeda:** tiap butir berisi apa, mengapa dijeda, branch atau commit, dan cara melanjutkan.
- **Masalah terbuka:** ID, tingkat keparahan, gejala, hipotesis, yang sudah dicoba beserta hasilnya.
- **Blokir akses:** akun atau kredensial yang belum tersedia (GitHub, Supabase staging dan produksi, Vercel, SMTP) dan dampaknya.
- **Pekerjaan terakhir:** 5 entri terbaru (apa, file utama, hasil tes).
- **Langkah berikutnya:** maksimal 5, berurutan.

Tulis untuk pembaca yang belum pernah melihat proyek ini. `STATUS.md` yang basi merusak seluruh kerja.

---

## 4. Urutan kerja

### 4.1 Fase

Kerjakan fase 0 sampai 12 sesuai BRIEF bagian 14, berurutan. Setiap fase selesai penuh sebelum fase berikutnya dimulai. Agent tidak menunggu persetujuan antar fase.

Fase selesai jika:
- Semua fitur di fase itu memenuhi definisi selesai (bagian 15).
- Setiap aturan BR yang terkait punya tes otomatis yang lolos.
- `FITUR.md`, `ATURAN-BISNIS.md`, dan `STATUS.md` diperbarui di commit yang sama.

### 4.2 Fitur

Urutan kerja dalam satu fase: skema dan fungsi database lebih dulu, lalu tes database (pgTAP), lalu logika server (RPC dan Server Action), lalu antarmuka, lalu tes integrasi dan e2e untuk alur kritis. Tes ditulis sebelum kode yang diuji, lalu dipastikan gagal dulu.

### 4.3 Jika waktu atau konteks tidak cukup

Kecilkan cakupan, jangan kirim versi setengah jadi. Satu fitur utuh lebih baik daripada tiga fitur parsial. Sisa cakupan dicatat di `STATUS.md` sebagai langkah berikutnya.

---

## 5. Struktur repositori (wajib)

Struktur ini mengikuti BRIEF bagian 12. Penyimpangan hanya boleh jika framework memaksanya, dan wajib dicatat di `KEPUTUSAN.md`.
---
petora/
├── AGENTS.md · BRIEF.md · README.md · .env.example
├── package.json · pnpm-lock.yaml · konfigurasi (ts, eslint, prettier, vitest, playwright)
├── .github/workflows/ci.yml
├── docs/ # ingatan (bagian 3)
├── supabase/
│ ├── migrations/ # skema, RLS, fungsi (stok, tagihan, transfer, nomor)
│ ├── tests/ # tes pgTAP: RLS dan fungsi database
│ ├── seed.sql # data contoh, hanya lokal dan staging
│ └── config.toml
├── src/
│ ├── app/
│ │ ├── app/ # area operasional, rute /app
│ │ └── portal/ # area pemilik hewan, rute /portal
│ ├── modules/ # satu folder per modul
│ │ ├── organization/ customers/ clinic/ medical-records/
│ │ ├── inpatient/ catalog/ petshop/ inventory/
│ │ └── procurement/ billing/ reports/ owner-portal/
│ ├── lib/
│ │ ├── supabase/ # klien browser dan server
│ │ ├── access/ # cek permission untuk UI (bukan penegakan)
│ │ ├── money/ # format Rupiah dan helper bilangan bulat
│ │ └── time/ # konversi zona waktu cabang
│ ├── ui/ # sistem desain: token dan komponen dasar
│ └── types/ # tipe hasil generate dari skema database
├── e2e/ # Playwright: alur kritis
└── scripts/ # setup awal, seed, cek env, generate tipe

---
### 5.1 Aturan per folder

- **`src/modules/<nama>/`** berisi `components/`, `actions/`, `queries/`, `schemas/`, dan `tests/`. Modul tidak mengimpor berkas internal modul lain. Berbagi hanya lewat `src/lib`, `src/ui`, atau `src/types`.
- **`src/modules/billing/`** adalah satu-satunya tempat logika tagihan di sisi TypeScript. Perhitungan tetap di database (bagian 7).
- **`src/app/`** hanya berisi rute dan penyambung ke modul. Logika bisnis tidak ditulis di sini.
- **`src/lib/access/`** hanya untuk menyembunyikan menu dan tombol di UI. Penegakan selalu di database lewat RLS.
- **`src/types/`** berisi hasil generate. Tidak diedit tangan.
- **`supabase/migrations/`** berisi berkas baru saja. Berkas yang sudah pernah dijalankan tidak diedit. Perubahan dilakukan dengan migrasi baru.
- **`supabase/seed.sql`** tidak pernah dijalankan di produksi.
- **`scripts/`** berisi skrip yang dijalankan manusia atau CI. Tidak ada logika produk di sini.
- Folder atau berkas baru di luar struktur ini tidak dibuat tanpa catatan di `KEPUTUSAN.md`.

### 5.2 Penamaan

- Nama berkas dan folder: huruf kecil, kebab-case (`medical-records`, `stock-opname.ts`).
- Nama tabel, kolom, fungsi, dan identifier database: bahasa Inggris, snake_case.
- Kode dan identifier TypeScript: bahasa Inggris. Nama spesifik domain. Hindari `utils`, `helpers`, `data`, `handler`, `manager`.
- Teks antarmuka dan dokumentasi: Bahasa Indonesia.

---

## 6. Arsitektur dan keamanan

### 6.1 Di mana logika berada

- **Perhitungan di database.** Stok, transfer, tagihan, PPN, pembulatan, penomoran, dan biaya kandang dihitung oleh fungsi Postgres. TypeScript hanya memanggil fungsi itu dan menampilkan hasilnya.
- **Server Actions** di Next.js memanggil fungsi Postgres lewat RPC. Tanpa Edge Functions di v1.
- **Akses data** lewat `@supabase/supabase-js` dan `@supabase/ssr`. Tanpa ORM.
- **State** lewat Server Components dan Server Actions. Tanpa pustaka state global.
- **Pembaruan langsung (Realtime)** hanya untuk antrean (M03-F02) dan status kandang (M05-F02). Fitur lain tidak memakai Realtime.

### 6.2 Tiga lapis akses (ditegakkan di database)

1. **Permission:** pengguna boleh melakukan aksi ini atau tidak (BR-002).
2. **Cabang:** data ini milik cabang yang ditugaskan kepadanya (BR-001).
3. **Kepemilikan:** khusus portal, hewan ini milik pengguna dan entri ini dibagikan (BR-005, BR-015, BR-019).

Aturan wajib:
- RLS aktif di setiap tabel tanpa kecuali.
- Pengecekan di UI tidak pernah dianggap sebagai pengamanan.
- Aksi sensitif (void, refund, penyesuaian stok, perubahan role, perubahan pajak dan harga) berjalan di sisi server dengan jejak audit.
- Akses lintas cabang untuk riwayat medis (BR-003) hanya lewat RLS dan permission. Tidak pernah terbuka untuk semua.
- Dokter tidak bisa mengubah entri final, termasuk milik Dokter lain (BR-004).

### 6.3 Kode yang aman secara default

- Query terparameterisasi. Tanpa string SQL yang dirangkai.
- Validasi di batas sistem (input form, Server Action, parameter RPC). Data internal yang sudah tervalidasi tidak divalidasi ulang berlapis-lapis.
- Escaping keluaran. Tanpa `dangerouslySetInnerHTML` untuk data pengguna.
- Penanganan error: pesan yang berguna bagi pengguna, detail di log, tidak ada error yang ditelan diam-diam, tidak ada `try/catch` kosong.
- Operasi uang dan stok bersifat atomik, idempoten bila diulang, dan aman terhadap transaksi bersamaan (kunci baris atau pembatasan di database).

---

## 7. Aturan domain (uang, stok, waktu, nomor)

Aturan lengkap ada di BRIEF bagian 7. Bagian ini adalah ringkasan yang wajib dipatuhi di setiap kode.

- **Uang (BR-008):** bilangan bulat Rupiah. Tanpa float di database maupun TypeScript. Setiap pembulatan eksplisit dan tercatat.
- **Tarif PPN (BR-020):** disimpan sebagai basis poin (1% = 100). Setiap tagihan menyimpan salinan tarif, mode, dan nilai pajak saat dibuat. Perubahan tarif tidak mengubah tagihan lama.
- **Pembulatan (BR-021):** dihitung pada total akhir setelah PPN, setengah ke atas. Tampil sebagai baris terpisah yang bisa positif atau negatif. Tidak mengubah nilai PPN.
- **Stok (BR-006, BR-007):** tidak pernah minus. Pengurangan memakai FEFO. Batch kedaluwarsa tidak bisa dijual.
- **Waktu (BR-016):** disimpan UTC. Tampil, batas hari laporan, dan tahun penomoran mengikuti zona IANA cabang. Konsolidasi menjumlahkan per hari lokal tiap cabang.
- **Nomor dokumen (BR-022):** format `{KODE-CABANG}-{JENIS}-{TAHUN}-{URUT 6 digit}`. Jenis: `VST`, `INV`, `PO`, `TRF`. Unik, berurutan per cabang per jenis, tidak dipakai ulang setelah void, tidak duplikat meski dibuat bersamaan.
- **Biaya kandang (BR-012):** per 24 jam sejak check-in, dibulatkan ke atas, minimal 1 hari. Uji wajib: 24, 25, 48, dan 49 jam menghasilkan 1, 2, 2, dan 3 hari.

**Tiga contoh perhitungan di BRIEF bagian 7 wajib menghasilkan angka yang sama persis dalam tes.** Jika kode menghasilkan angka berbeda, kode yang salah, bukan contohnya.

---

## 8. Keamanan dan data pribadi

- Tidak ada secret di repositori. Service role key hanya di environment server, tidak pernah di kode klien atau variabel `NEXT_PUBLIC_*`.
- `.env.example` lengkap, tanpa nilai rahasia. Setiap variabel didokumentasikan.
- Tidak ada data pribadi (nama, telepon, email, alamat, rekam medis, data keuangan) di log aplikasi, pesan galat yang ditampilkan, atau tangkapan layar tes yang di-commit.
- Akses dan perubahan data pribadi tercatat di log audit (BR-014).
- Data sensitif diperlakukan sesuai UU Pelindungan Data Pribadi: akses dibatasi, tidak ada salinan yang tidak perlu.
- Lampiran (M02-F05, M04-F03, foto catatan harian): tipe JPG, PNG, atau PDF, maksimal 10 MB, divalidasi di server dan klien. Diakses hanya lewat tautan bertanda tangan berumur pendek.
- Dependensi di-pin. Pembaruan keamanan dicatat di `KEPUTUSAN.md`.

---

## 9. Stack dan dependensi

### 9.1 Stack yang disetujui

Hanya stack di BRIEF bagian 2 yang boleh dipakai:

- TypeScript (strict), SQL
- Next.js (App Router), React, versi stabil terbaru saat proyek dimulai, di-pin
- pnpm, Node.js LTS
- Supabase: Postgres, Auth, RLS, Storage, Realtime (terbatas sesuai 6.1)
- Tailwind CSS dengan token sendiri
- Komponen di `src/ui` di atas Radix UI primitives (tanpa shadcn/ui bawaan)
- Lucide untuk ikon
- React Hook Form dan Zod
- Recharts
- date-fns beserta pustaka zona waktu IANA yang dipilih (dicatat di `KEPUTUSAN.md`)
- Vitest, Playwright, pgTAP (`supabase test db`)
- ESLint, Prettier, `tsc --noEmit`
- GitHub Actions, Supabase CLI, Vercel

### 9.2 Aturan penambahan dependensi

Dependensi baru hanya boleh ditambahkan jika semua ini benar:
- Kebutuhannya nyata sekarang, bukan hipotetis.
- Menulis sendiri membutuhkan lebih dari 50 baris dan rawan bug.
- Pustaka aktif dirawat dan luas dipakai.
- Keputusan dan alasannya dicatat di `KEPUTUSAN.md`.

Dilarang:
- Dependensi untuk satu fungsi kecil.
- Dua pustaka untuk satu tujuan.
- Versi tanpa pin.
- ORM, pustaka state global, pustaka PDF, pemindai kamera, shadcn/ui bawaan, dan pustaka notifikasi pihak ketiga.

### 9.3 Yang tidak dibangun (di luar cakupan dan v2)

Jangan dibangun, walaupun terlihat berguna (lihat BRIEF bagian 15):
- Payment gateway atau verifikasi pembayaran otomatis
- Notifikasi WhatsApp, SMS, atau email otomatis
- Booking online, pembayaran online di portal, MFA
- Impor CSV, gabung data pelanggan duplikat, retur ke pemasok
- Harga per cabang, akuntansi penuh, e-Faktur
- Cetak langsung ke printer struk (hanya cetak browser)
- Integrasi laboratorium atau radiologi

Ide di luar brief dicatat di bagian "Nanti" di `FITUR.md`. Tidak dikerjakan.

### 9.4 Anti over-engineering

- Tidak ada abstraksi "untuk jaga-jaga". Abstraksi baru setelah tiga pemakaian nyata.
- Tidak ada microservice, antrean, cache, atau lapisan konfigurasi tanpa masalah terukur.
- Satu cara untuk satu hal. Jika pola sudah ada, ikuti.
- Hapus kode tak terpakai. Jangan dikomentari.

---

## 10. Antarmuka, desain, dan bahasa

Sumber lengkap ada di BRIEF bagian 11. Berikut aturan yang wajib diperiksa di setiap layar.

**Sistem desain** (dibangun di Fase 0, dipakai semua modul):
- Font sistem: `-apple-system`, `BlinkMacSystemFont`, `SF Pro Text` bila tersedia, fallback `system-ui`. Skala 34, 28, 22, 17, 15, 13, 12 px.
- Angka uang dan tabel memakai `tabular-nums` dan rata kanan.
- Spasi kelipatan 4 px.
- Sudut: kontrol 8 px, kartu 12 px, sheet 20 px. Efek kaca hanya di bilah atas dan sheet.
- Warna: teal aksen `#0A7A78` (terang) dan `#4FD1CC` (gelap). Semantik hijau, kuning-oranye, merah, biru. Semua kombinasi teks lolos kontras 4,5:1.
- Mode terang dan gelap mengikuti pengaturan sistem.
- Gerak 200 sampai 350 ms, hanya untuk sheet dan perubahan status. Nonaktif jika `prefers-reduced-motion`.
- Target sentuh minimal 44 px. Tinggi baris tabel 44 px.
- Ikon Lucide saja. Logo berupa wordmark teks "PETORA".

**Tata letak:**
- Operasional desktop: sidebar 240 px yang bisa diciutkan ke 72 px, bilah atas dengan pencarian global dan pemilih cabang aktif, master-detail untuk daftar, sheet untuk formulir.
- Tablet: sidebar ringkas, target sentuh besar untuk Dokter dan Perawat.
- Kasir: layar dua kolom (keranjang dan rincian di kiri, total dan pembayaran di kanan).
- Portal: tab bawah dengan empat tab (Hewan, Riwayat, Tagihan, Akun). Mengutamakan HP.

**Setiap layar wajib punya empat keadaan:** kosong (dengan tindakan yang jelas), memuat (kerangka), galat (dengan jalan keluar), dan sukses.

**Bahasa:**
- Operasional: istilah klinik yang lazim (anamnesis, diagnosis, rawat inap).
- Portal: bahasa awam. Tidak ada istilah medis mentah.
- Pesan galat selalu menjelaskan apa yang terjadi dan apa yang harus dilakukan berikutnya. Contoh: "Stok tidak cukup. Tersisa 3 pcs di cabang ini."
- Bahasa sopan, ringkas, konkret.

**Dilarang:**
- Dashboard template generik, gradien ungu-biru bawaan, emoji sebagai dekorasi.
- Kartu seragam tanpa hierarki.
- Teks isian ("Lorem ipsum", "Welcome to our platform") dan data contoh klise.
- Kalimat pemasaran kosong.

**Aksesibilitas:** navigasi keyboard penuh, label di setiap formulir, dukungan teks besar, kontras 4,5:1.

**Pemindai barcode:** input dari pemindai USB mode keyboard. Tanpa pemindaian kamera.

**Cetak:** lewat CSS print browser untuk A4 dan struk 80 mm. Cetak ulang diberi tanda "Salinan". CSV dibuat sendiri tanpa pustaka tambahan.

---

## 11. Pengujian

### 11.1 Lapisan

- **pgTAP (`supabase/tests/`):** RLS dan fungsi database. Isolasi cabang, permission, akses lintas cabang, visibilitas portal, penguncian rekam medis, stok, transfer, tagihan, pajak, pembulatan, penomoran. Setiap kombinasi peran dan cabang yang relevan diuji.
- **Vitest unit:** logika murni di sisi aplikasi (format, validasi, pemetaan).
- **Vitest integrasi:** tiap modul terhadap database lokal.
- **Playwright e2e (`e2e/`):** alur kritis saja (lihat 11.3).

Piramida: banyak tes unit, lalu tes integrasi, lalu sedikit tes e2e untuk alur kritis. Logika aturan bisnis diuji di database, bukan hanya di UI.

### 11.2 Penamaan

Setiap tes menyebut ID aturan atau fitur yang diujinya:
- `BR-001-branch-isolation`
- `BR-021-rounding`
- `M10-F05-manual-payment-idempotent`

Berkas pgTAP mengikuti pola yang sama, misalnya `supabase/tests/br-001-branch-isolation.test.sql`.

### 11.3 Skenario wajib (BRIEF bagian 13)

Setiap skenario di bawah wajib punya tes otomatis yang lolos:
- Dua kasir memfinalkan penjualan barang terakhir bersamaan (BR-006).
- Aksi bayar ditekan berulang (BR-018).
- Transfer terputus di tengah proses (BR-017).
- Tarif PPN berubah setelah tagihan dibuat (BR-020).
- Dua contoh perhitungan di BRIEF bagian 7 menghasilkan angka yang sama persis, termasuk pembulatan negatif (BR-020, BR-021).
- Biaya kandang 24, 25, 48, dan 49 jam menghasilkan 1, 2, 2, dan 3 hari (BR-012).
- Transaksi pukul 23:30 di WIB, WITA, dan WIT jatuh di hari yang benar pada laporan (BR-016).
- Pengguna cabang A membaca atau mengubah data cabang B lewat API langsung (BR-001).
- Akun portal membaca hewan atau entri yang tidak dibagikan (BR-005, BR-015).
- Dokter mengubah entri final atau entri milik Dokter lain (BR-004).
- Dua tagihan difinalkan bersamaan tidak menghasilkan nomor duplikat (BR-022).

Alur e2e wajib: kunjungan sampai pembayaran sampai portal, rawat inap penuh, penjualan retail, pengadaan sampai stok, transfer antar cabang, stock opname, undangan portal dan akses terbatas.

### 11.4 Aturan tes

- Tes menguji perilaku, bukan implementasi.
- Tes baru harus terbukti gagal jika kode yang diujinya dirusak. Verifikasi ini dilakukan sekali untuk tiap aturan BR.
- Tidak ada tes yang dinonaktifkan, dilewati, atau diperlonggar untuk membuat hijau.
- Tiap bug yang diperbaiki mendapat tes regresi.
- Uji kasus: jalur normal, nilai batas, input salah, kosong atau null, nilai sangat besar, karakter khusus dan Unicode, akses tanpa izin, dua aksi bersamaan, aksi berulang.

### 11.5 Status aturan

`ATURAN-BISNIS.md` memuat tabel untuk BR-001 sampai BR-025 dengan kolom: tes yang menguji, status (ada tes atau belum), dan fase implementasi. Aturan dengan status "belum" tidak boleh ditandai fase selesai.

---

## 12. Migrasi, seed, dan lingkungan

### 12.1 Migrasi

- Migrasi kecil, satu tujuan per berkas, dan bisa dijalankan ulang dari database kosong tanpa galat.
- Berkas migrasi yang sudah dijalankan tidak diedit.
- Setiap migrasi yang mengubah skema disertai tes pgTAP.
- Migrasi yang menghapus atau mengubah data produksi secara tidak bisa dibalik berhenti dan bertanya (bagian 16).
- Verifikasi wajib: `supabase db reset` lalu seluruh tes pgTAP, dari database kosong.

### 12.2 Seed

- `supabase/seed.sql` berisi tiga cabang (WIB `Asia/Jakarta`, WITA `Asia/Makassar`, WIT `Asia/Jayapura`), pengguna untuk tiap peran dan templat Staff, beragam jenis hewan, produk klinik dan pet shop, jenis vaksin, serta tagihan di semua status.
- Seed hanya untuk lokal dan staging. Tidak pernah berjalan di produksi. CI memeriksa ini.
- Sistem produksi dimulai kosong. Data dimasukkan lewat antarmuka.

### 12.3 Lingkungan

| Lingkungan | Supabase | Vercel | Catatan |
|---|---|---|---|
| Lokal | Supabase CLI (Docker) | - | Semua pengembangan dan CI |
| Staging | Proyek terpisah | Proyek terpisah | Semua perubahan diuji di sini dulu |
| Produksi | Proyek terpisah, paket berbayar terendah yang diizinkan untuk komersial | Proyek terpisah | Rilis hanya setelah lolos staging |

- Konfigurasi lingkungan lewat variabel environment. Tidak ada nilai lingkungan yang di-hardcode.
- Tanpa kredensial staging atau produksi, agent tetap bekerja penuh secara lokal, mencatat status di `STATUS.md`, dan melanjutkan tugas yang tidak bergantung padanya.

---

## 13. Git dan CI

### 13.1 Git

- Cabang utama `main` selalu hijau dan siap rilis.
- Pekerjaan dilakukan di cabang fitur. Commit kecil, utuh, dan hijau.
- Pesan commit dalam Bahasa Indonesia atau Inggris secara konsisten, dengan awalan: `fitur:`, `perbaikan:`, `refactor:`, `dokumen:`, `tes:`, `migrasi:`.
- Commit setengah jadi di cabang fitur diberi awalan `wip:`. Tidak pernah masuk `main` dalam keadaan `wip:`.
- Tidak ada perubahan yang menggantung di akhir sesi.

### 13.2 CI (`.github/workflows/ci.yml`)

Setiap push dan pull request menjalankan, berurutan:
1. Lint (ESLint, Prettier)
2. Type check (`tsc --noEmit`)
3. Tes unit dan integrasi (Vitest)
4. Tes database (`supabase db reset` lalu `supabase test db`)
5. Tes e2e (Playwright)
6. Build

CI harus hijau sebelum merge. Tes yang gagal di CI diperlakukan sebagai masalah (bagian 14), bukan dilewati.

### 13.3 Rilis

- Staging dulu. Produksi hanya setelah staging lolos semua pemeriksaan dan tes e2e.
- `DEPLOYMENT.md` harus sudah dicoba di staging, termasuk pemulihan dan rollback, sebelum rilis produksi pertama.
- Deploy ke produksi selalu berhenti dan bertanya (bagian 16).

---

## 14. Masalah dan interupsi

### 14.1 Tingkat keparahan

| Tingkat | Contoh | Aturan |
|---|---|---|
| **Kritis** | Data bocor antar cabang atau antar pemilik hewan, stok minus, pembayaran tercatat ganda, data final bisa diubah atau dihapus, kehilangan data, RLS tidak aktif | Dikerjakan segera. Memblokir fase dan rilis. |
| **Tinggi** | Alur utama dari brief bagian 6 rusak, aturan BR tanpa tes, PPN atau pembulatan salah, CI merah, build gagal | Memblokir penyelesaian fase. |
| **Sedang** | Fitur berfungsi tetapi tidak sesuai kriteria selesai, pesan galat tidak jelas, keadaan kosong atau memuat belum ada | Dicatat, dikerjakan dalam fase yang sama. |
| **Rendah** | Kerapian, penamaan, dokumentasi, gaya | Dicatat, dikerjakan bila tidak mengganggu. |

Tidak boleh ada masalah kritis atau tinggi terbuka saat v1 dinyatakan selesai.

### 14.2 Protokol jeda (saat masalah muncul di tengah pekerjaan)

1. **Simpan keadaan:** commit pekerjaan setengah jadi di cabang fitur dengan awalan `wip:`. Jika tidak bisa, `git stash` dengan nama yang jelas.
2. **Catat di tumpukan jeda** di `STATUS.md`: apa yang dikerjakan, titik berhenti, branch atau commit, dan langkah melanjutkan.
3. **Buat cabang terpisah** untuk masalah dari basis yang bersih. Konteks pekerjaan lama tidak dibawa ke perbaikan.
4. **Selesaikan masalah** sesuai 14.3.
5. **Kembali ke jeda:** baca catatannya, pulihkan keadaan, rebase ke perubahan terbaru, jalankan semua tes, periksa bahwa asumsi pekerjaan lama masih berlaku, lalu lanjutkan. Hapus butir dari tumpukan.

Masalah yang muncul saat memperbaiki masalah juga dijeda dengan cara sama. Tumpukan dikerjakan berurutan (terakhir masuk, pertama dilanjutkan), bukan antrean acak.

### 14.3 Siklus penyelesaian masalah

1. **Tangkap:** tulis gejala persis (pesan galat, langkah, lingkungan) di "Masalah terbuka".
2. **Reproduksi:** buat gejala muncul sesuai permintaan. Tanpa reproduksi, belum ada perbaikan yang valid.
3. **Tes gagal dulu:** tulis tes otomatis yang gagal karena masalah ini.
4. **Cari akar masalah:** rumuskan hipotesis, uji satu per satu, catat hasilnya. Gunakan log, `git bisect`, dan baca dokumentasi dependensi bila perlu. Tanya "kenapa" sampai penyebab, bukan berhenti di titik galat.
5. **Perbaiki di akar** dengan perubahan sekecil yang benar.
6. **Verifikasi:** tes baru lolos, seluruh suite lolos, skenario asli dicoba langsung di aplikasi.
7. **Sapu pola:** cari tempat lain dengan kesalahan serupa dan perbaiki sekalian.
8. **Catat** di `MASALAH.md` (gejala, akar masalah, perbaikan, pencegahan). Hapus dari "Masalah terbuka".

### 14.4 Jika macet

- Setelah tiga upaya gagal, berhenti menebak. Persempit reproduksi, periksa ulang asumsi, bandingkan dengan keadaan yang berfungsi, baca sumber dan dokumentasi dependensi, ubah pendekatan.
- Masalah hanya boleh diparkir jika terhalang hal di luar kendali agent (akses, kredensial, keputusan Owner). Catat hipotesis, bukti, dan apa yang dibutuhkan, lalu lanjut ke tugas yang tidak bergantung padanya.
- Dilarang: menonaktifkan tes yang gagal, memperlonggar asersi, menelan error dengan `try/catch` kosong, atau menambah retry untuk menutupi bug.

---

## 15. Definisi selesai

### 15.1 Per fitur

Sebuah fitur selesai hanya jika semua ini benar, dengan bukti dari menjalankannya:
- Berfungsi ujung ke ujung: antarmuka, logika, dan penyimpanan. Bukan satu lapisan saja.
- Semua kriteria selesai di `FITUR.md` terpenuhi dan setiap kriterianya punya tes otomatis.
- Keempat keadaan layar (kosong, memuat, galat, sukses) ada.
- Kasus galat ditangani: input salah, data kosong, batas nilai, kegagalan jaringan, akses tidak sah.
- Aturan BR yang terkait punya tes dan statusnya diperbarui di `ATURAN-BISNIS.md`.
- Tidak ada `TODO`, stub, data palsu, fungsi kosong, kode mati, atau log debug.
- Lint, type check, build, dan seluruh tes lolos.
- Dokumen terkait (`FITUR.md`, `ATURAN-BISNIS.md`, `README.md`, `STATUS.md`) diperbarui di commit yang sama.
- Diff sudah ditinjau sendiri seperti meninjau kode orang lain.

### 15.2 Per fase

Sesuai bagian 4.1. Tambahan: tidak ada masalah kritis atau tinggi yang terkait fase tersebut.

### 15.3 Kesiapan rilis (fase 12)

- CI hijau: lint, tipe, tes unit, tes database, e2e, build.
- Migrasi berjalan dari database kosong tanpa galat.
- `.env.example` lengkap. Service role key hanya di environment server.
- `seed.sql` tidak pernah berjalan di produksi.
- `DEPLOYMENT.md` memuat langkah rilis, pemulihan, dan rollback yang sudah dicoba di staging.
- README bisa diikuti dari nol oleh orang baru di mesin kosong.
- Uji beban: 10 cabang, 30 pengguna per cabang, 50.000 pelanggan dan hewan, 500 tagihan per hari. Layar kasir di bawah 2 detik di 4G. Simpan tagihan di bawah 1 detik pada 95% permintaan. Pencarian pelanggan di bawah 1 detik pada 50.000 data.
- Aksesibilitas dan responsivitas diperiksa di layar utama.

---

## 16. Batas otonomi

### 16.1 Agent memutuskan sendiri (tanpa bertanya)

- Versi dependensi (di-pin), nama internal, struktur kode di dalam modul.
- Detail visual di dalam sistem desain bagian 10.
- Skema tabel, indeks, dan nama fungsi database.
- Cara menyelesaikan celah atau konflik di brief, dengan memilih opsi paling aman dan mencatatnya di `KEPUTUSAN.md`.

### 16.2 Agent berhenti dan bertanya hanya untuk

- Akun dan kredensial yang belum disediakan: GitHub, Supabase (staging dan produksi), Vercel (staging dan produksi), SMTP.
- Deploy ke produksi.
- Pengisian tarif PPN dan status PKP yang berlaku sungguhan. Sampai diisi, PPN tetap nonaktif sesuai default BR-020.
- Migrasi yang menghapus atau mengubah data produksi secara tidak bisa dibalik.

### 16.3 Cara berhenti

Saat berhenti untuk hal di 16.2:
1. Catat keadaan di `STATUS.md` dan blokir di bagian "Blokir akses".
2. Siapkan pilihan beserta rekomendasi dan alasannya.
3. Lanjutkan semua pekerjaan lain yang tidak bergantung padanya.

Agent tidak mengubah `BRIEF.md`. Perubahan spesifikasi hanya oleh Owner.

---

## 17. Akhir setiap tugas dan sesi

1. Seluruh pemeriksaan hijau: lint, type check, tes, build.
2. Dokumen terkait diperbarui. `STATUS.md` mencerminkan keadaan sebenarnya: tidak ada pekerjaan tak tercatat, tidak ada jeda yang tertinggal, "Langkah berikutnya" jelas.
3. Commit. Tidak ada perubahan yang menggantung.
4. Laporan singkat dengan empat bagian:
   - **Terverifikasi:** apa yang selesai dan bukti tesnya.
   - **Diasumsikan:** keputusan yang diambil agent dan sudah dicatat di `KEPUTUSAN.md`.
   - **Belum:** apa yang belum selesai dan alasannya.
   - **Berikutnya:** langkah berikutnya, sesuai `STATUS.md`.

**Proyek dianggap matang** jika semua 72 fitur v1 memenuhi bagian 15, aturan BR-001 sampai BR-025 punya tes otomatis yang lolos, tidak ada masalah kritis atau tinggi terbuka, README bisa diikuti dari nol, dan build bersih di mesin lain.
