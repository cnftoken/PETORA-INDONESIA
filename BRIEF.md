# BRIEF PROYEK: PETORA

> **Spesifikasi final.** Semua isi dokumen ini adalah keputusan yang mengikat. Tidak ada asumsi dan tidak ada bagian opsional.
> Jika agent menemukan celah atau konflik, agent memilih opsi yang paling aman (membatasi akses, mencegah data hilang, mempertahankan jejak), mencatatnya di `docs/KEPUTUSAN.md`, lalu melanjutkan tanpa bertanya.
> Agent hanya bertanya untuk hal-hal di bagian 17.

---

## 0. Identitas

- Nama proyek: PETORA
- Jenis: proyek baru
- Bahasa antarmuka: Bahasa Indonesia
- Bahasa dokumentasi: Bahasa Indonesia. Kode, nama tabel, dan identifier dalam bahasa Inggris.
- Cakupan: seluruh fitur di bagian 5 (72 fitur dalam 12 modul)

## 1. Ringkasan dan sasaran

PETORA adalah aplikasi web operasional terintegrasi untuk mengelola seluruh aktivitas bisnis klinik hewan dan pet shop dalam satu sistem terpusat. Sistem menggabungkan operasional klinik, pelayanan kesehatan hewan, manajemen pelanggan, persediaan, penjualan produk, transaksi, pembayaran, dan pemantauan perkembangan hewan dalam satu platform yang saling terintegrasi.

**Konsep:** *Single Company, Multi-Branch*. Satu perusahaan mengelola banyak cabang sejak awal implementasi. Semua cabang berada dalam satu ekosistem data terpusat, dengan akses, kewenangan, dan ruang lingkup operasional per cabang.

**Dua area fungsi:**
1. **Operational Application** untuk Owner, Supervisor, Dokter, dan Staff. Setiap pengguna mendapat dashboard, menu, akses data, dan kewenangan sesuai role dan permission.
2. **Pet Owner Portal** untuk pemilik hewan. Hanya untuk melihat informasi hewan peliharaannya.

**Masalah yang diselesaikan:** operasional klinik hewan dan pet shop biasanya terpecah (pendaftaran, rekam medis, rawat inap, stok, kasir, laporan), sehingga data tidak sinkron, stok dan tagihan sulit ditelusuri, dan pemilik hewan tidak punya akses ke informasi hewannya.

**Sasaran yang diukur:**
- Satu tagihan menampung seluruh layanan, obat, produk, dan biaya rawat inap dari satu sumber.
- Stok per cabang akurat dan tidak pernah minus, termasuk saat transaksi bersamaan.
- Riwayat medis hewan dapat dibaca lintas cabang oleh pihak berizin.
- Pemilik hewan melihat kondisi hewan, vaksinasi, dan tagihannya tanpa menghubungi klinik.
- Tidak ada kebocoran data antar cabang maupun antar pemilik hewan.

## 2. Keputusan teknis

| Hal | Keputusan |
|---|---|
| Bahasa | TypeScript (strict) dan SQL |
| Framework | Next.js (App Router) dengan React, versi stabil terbaru saat proyek dimulai, di-pin |
| Package manager | pnpm, Node.js versi LTS |
| Hosting aplikasi | Vercel |
| Backend | Supabase penuh: Postgres, Auth, Row Level Security, Storage, Realtime |
| Fungsi server | Server Actions Next.js memanggil fungsi Postgres (RPC). Tanpa Edge Functions di v1. |
| Akses data | `@supabase/supabase-js` dan `@supabase/ssr`. Tanpa ORM. |
| Styling | Tailwind CSS dengan token desain sendiri |
| Komponen | Dibangun sendiri di `src/ui` di atas Radix UI primitives. Tanpa shadcn/ui bawaan. |
| Ikon | Lucide |
| Formulir dan validasi | React Hook Form dan Zod |
| Grafik | Recharts |
| Tanggal | date-fns dengan zona waktu IANA |
| Pembaruan langsung | Supabase Realtime hanya untuk antrean (M03-F02) dan status kandang (M05-F02) |
| State | Server Components dan Server Actions. Tanpa pustaka state global. |
| Cetak dan unduhan | Cetak lewat CSS print browser. CSV dibuat sendiri. Tanpa pustaka PDF. |
| Pemindai barcode | Pemindai USB mode keyboard. Tanpa pemindaian kamera. |
| Pengujian | Vitest, Playwright, pgTAP (`supabase test db`) |
| Kualitas kode | ESLint, Prettier, `tsc --noEmit` |
| CI | GitHub Actions. Repositori di GitHub. |
| Migrasi | Supabase CLI, tersimpan di repo |
| Pemantauan | Log bawaan Vercel dan Supabase. Tanpa layanan pihak ketiga di v1. |
| Autentikasi | Email dan kata sandi (minimal 10 karakter). Tanpa MFA di v1. |
| Struktur aplikasi | Satu aplikasi, bukan monorepo. Operasional di `/app`, portal di `/portal`. Tipe akun (operasional atau portal) dicek di database dan tidak bisa saling masuk. |
| Domain | Memakai URL bawaan Vercel. Aplikasi tidak bergantung pada domain tertentu. |

**Lingkungan:**
- **Lokal:** Supabase CLI (Docker). Semua pengembangan dan CI.
- **Staging:** proyek Supabase dan proyek Vercel terpisah. Perubahan diuji di staging sebelum produksi.
- **Produksi:** proyek Supabase dan proyek Vercel terpisah. Rilis hanya setelah lolos di staging.

**Biaya:** pengembangan dan staging memakai paket gratis. Produksi memakai paket berbayar terendah yang diizinkan untuk penggunaan komersial.

**Prinsip arsitektur:**
- Sumber kebenaran perhitungan (stok, transfer, tagihan, PPN, pembulatan, penomoran) ada di database sebagai fungsi Postgres. Kode TypeScript hanya menampilkan hasilnya.
- Semua operasi uang dan stok atomik, idempoten bila diulang, dan aman terhadap transaksi bersamaan.
- Tipe TypeScript dihasilkan dari skema database.
- Migrasi kecil dan bisa dijalankan ulang dari database kosong.

## 3. Pengguna, peran, dan permission

| Peran | Siapa | Tujuan | Perangkat | Lingkup |
|---|---|---|---|---|
| Owner | Pemilik perusahaan | Memantau dan mengendalikan seluruh cabang | Desktop, HP | Semua cabang |
| Supervisor | Penanggung jawab cabang | Mengendalikan operasional cabang dan menyetujui aksi sensitif | Desktop | Cabang yang ditugaskan |
| Dokter | Dokter hewan | Memeriksa, mendiagnosis, merawat, mencatat | Desktop, tablet | Cabang yang ditugaskan, riwayat medis lintas cabang |
| Staff | Resepsionis, kasir, perawat, petugas gudang | Menjalankan tugas harian | Desktop, tablet | Cabang yang ditugaskan, sesuai permission |
| Pemilik hewan | Pelanggan klinik | Melihat informasi hewan miliknya | HP | Hanya hewan miliknya dan hanya yang dibagikan |

**Aturan peran:**
- Hanya ada empat role operasional: Owner, Supervisor, Dokter, Staff. Tidak ada role kustom.
- Permission Owner selalu penuh dan tidak bisa dikurangi. Minimal satu Owner aktif harus selalu ada.
- Permission Supervisor dan Dokter diatur per role oleh Owner. Permission Staff diatur per pengguna oleh Owner.
- Staff adalah satu role. Fungsinya dibedakan oleh permission. Tersedia templat permission: Resepsionis, Kasir, Perawat, Gudang. Seorang Staff boleh memiliki gabungan beberapa templat.
- Satu pengguna ditugaskan ke satu atau lebih cabang dan memilih cabang aktif saat bekerja.

**Matriks permission awal.** ✓ = akses penuh, L = lihat saja, — = tidak ada. Owner dapat mengubahnya sesuai aturan di atas.

| Kelompok permission | Owner | Supervisor | Dokter | Resepsionis | Kasir | Perawat | Gudang |
|---|---|---|---|---|---|---|---|
| Pengaturan organisasi, pajak, pengguna, permission | ✓ | L | — | — | — | — | — |
| Pelanggan dan hewan | ✓ | ✓ | ✓ | ✓ | L | L | — |
| Kunjungan dan antrean | L | ✓ | ✓ | ✓ | L | ✓ | — |
| Rekam medis (baca) | L | L | ✓ | — | — | L | — |
| Rekam medis (tulis, kunci, bagikan) | — | — | ✓ | — | — | — | — |
| Rawat inap: administrasi (check-in, check-out, kandang) | L | ✓ | ✓ | ✓ | — | ✓ | — |
| Rawat inap: catatan harian dan pemberian obat | L | L | ✓ | — | — | ✓ | — |
| Katalog: produk dan layanan | ✓ | L | L | L | L | L | ✓ (produk saja) |
| Harga dan status pajak | ✓ | L | L | L | L | L | L |
| Stok dan batch (termasuk mengajukan penyesuaian) | ✓ | ✓ | L | — | L | L | ✓ |
| Persetujuan penyesuaian stok, selisih transfer, selisih opname | ✓ | ✓ | — | — | — | — | — |
| Transfer stok antar cabang | ✓ | ✓ | — | — | — | — | ✓ |
| Pengadaan | ✓ | ✓ | — | — | — | — | ✓ |
| Tagihan dan pembayaran | L | ✓ | L | L | ✓ | — | — |
| Pemberian diskon, persetujuan void dan retur | ✓ | ✓ | — | — | — | — | — |
| Laporan | ✓ (semua cabang) | ✓ (cabangnya) | — | — | — | — | — |
| Log audit | ✓ | L | — | — | — | — | — |

## 4. Model data dan akses

**Tiga lapis akses**, semuanya ditegakkan di database dengan Row Level Security, bukan hanya di antarmuka:
1. **Permission:** apakah pengguna boleh melakukan aksi ini.
2. **Cabang:** apakah data ini milik cabang yang ditugaskan kepadanya (BR-001).
3. **Kepemilikan:** khusus portal, apakah hewan ini miliknya dan entri ini dibagikan (BR-005, BR-015, BR-019).

**Cakupan data:**

| Data | Cakupan | Catatan |
|---|---|---|
| Perusahaan, cabang, pengaturan, permission | Seluruh perusahaan | Diatur Owner |
| Pengguna | Seluruh perusahaan | Dengan penugasan cabang |
| Pelanggan, hewan | Terpusat, dibaca lintas cabang | Sesuai permission |
| Kunjungan | Milik cabang tempat terjadi | Riwayatnya dibaca lintas cabang oleh pihak berizin medis |
| Rekam medis, vaksinasi | Ditulis di cabang pelayanan, dibaca lintas cabang | Tiap entri mencatat cabang asal (BR-003) |
| Rawat inap, kandang | Per cabang | |
| Produk, layanan, kategori, harga | Seluruh perusahaan | Harga seragam di semua cabang |
| Stok, batch, mutasi, penyesuaian, opname | Per cabang | |
| Transfer stok | Dua cabang | Terlihat oleh cabang asal dan tujuan |
| Pemasok | Seluruh perusahaan | |
| Pesanan pembelian, penerimaan | Per cabang | |
| Tagihan, pembayaran | Per cabang | |
| Akun portal | Terikat ke satu pelanggan | |
| Log audit | Seluruh perusahaan | Dibaca sesuai cabang |

**Waktu (BR-016):** disimpan UTC. Tiap cabang punya zona waktu IANA (WIB `Asia/Jakarta`, WITA `Asia/Makassar`, WIT `Asia/Jayapura`). Semua tampilan, batas hari laporan, dan tahun penomoran mengikuti zona cabang.

## 5. Modul dan fitur

**12 modul, 72 fitur.** Semuanya wajib untuk v1. Kriteria selesai di bawah adalah syarat minimum yang masing-masing harus punya tes otomatis. Definisi selesai umum mengikuti `AGENTS.md` bagian 7.

### M01. Organisasi dan Akses (8 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M01-F01 | Profil perusahaan dan setup awal | Nama, alamat, NPWP (diisi bila ada), logo. Tampil di cetakan tagihan. Hanya Owner yang mengubah. Skrip setup di `scripts/` membuat perusahaan, cabang pertama, dan akun Owner pertama. |
| M01-F02 | Cabang | Kode (unik, 2-5 huruf besar dan angka), nama, alamat, telepon, zona waktu, status aktif. Cabang baru ditambah lewat pengaturan tanpa mengubah kode dan langsung bisa ditugasi pengguna serta punya stok dan penomoran sendiri. Cabang nonaktif tidak bisa membuat transaksi baru dan datanya tetap ada. |
| M01-F03 | Pengguna | Undang lewat email, aktif dan nonaktif, atur ulang kata sandi. Pengguna nonaktif tidak bisa masuk dan riwayatnya tetap utuh. Tidak ada penghapusan permanen. Owner terakhir tidak bisa dinonaktifkan. |
| M01-F04 | Role | Empat role tetap (bagian 3). Owner mengatur permission Supervisor dan Dokter per role. |
| M01-F05 | Permission dan templat Staff | Permission per kelompok sesuai matriks bagian 3. Templat Resepsionis, Kasir, Perawat, Gudang. Pengguna tanpa permission tidak melihat menunya dan ditolak di database. |
| M01-F06 | Penugasan cabang | Pengguna ditugaskan ke satu atau lebih cabang dan memilih cabang aktif. Seluruh data mengikuti cabang aktif. Tidak bisa bertindak di cabang yang tidak ditugaskan. |
| M01-F07 | Pengaturan perusahaan | PPN dan pembulatan (BR-020, BR-021), serta ambang peringatan kedaluwarsa (nilai awal 30 hari). Tarif punya tanggal berlaku. Perubahan tidak mengubah tagihan lama dan tercatat di audit. |
| M01-F08 | Log audit | Penampil hanya-baca dengan filter pengguna, cabang, entitas, dan rentang waktu. Mencakup semua perubahan di BR-014. Tidak bisa diubah atau dihapus lewat aplikasi. |

### M02. Pelanggan dan Hewan (5 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M02-F01 | Data pelanggan | Nama, telepon (wajib, dinormalisasi ke format internasional), email (diisi bila ada), alamat, catatan. Didaftarkan di cabang mana pun dan terlihat di semua cabang bagi pihak berizin. Nomor telepon yang sama tidak bisa didaftarkan dua kali. |
| M02-F02 | Pencarian lintas cabang | Cari berdasarkan nama, telepon, nama hewan, atau nomor pasien. Hasil kurang dari 1 detik pada 50.000 data. |
| M02-F03 | Profil hewan | Nomor pasien unik, nama, jenis, ras, kelamin, status steril, tanggal lahir atau perkiraan umur, warna dan ciri, microchip (diisi bila ada), foto, status (aktif atau meninggal), pemilik. Satu pemilik memiliki banyak hewan. Perpindahan pemilik tercatat dan pemilik lama kehilangan akses portal ke hewan itu. |
| M02-F04 | Timeline riwayat | Kronologi kunjungan, tindakan, vaksin, rawat inap, dan tagihan lintas cabang, tiap baris menunjukkan cabang asal. Tampil sesuai permission pengguna. |
| M02-F05 | Lampiran dan foto hewan | Tersimpan di storage dengan akses terbatas lewat tautan bertanda tangan berumur pendek. Tipe JPG, PNG, atau PDF, maksimal 10 MB per berkas, divalidasi. Hanya pihak berizin yang melihat. |

### M03. Pelayanan Klinik (6 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M03-F01 | Pendaftaran kunjungan | Pilih pelanggan dan hewan, keluhan awal, dokter tujuan (kosong bila tidak ditentukan), jenis layanan. Hanya jalur datang langsung, tanpa booking. Nomor kunjungan diberikan saat pendaftaran (BR-022). Status awal "terdaftar". |
| M03-F02 | Antrean | Daftar menunggu per cabang dan per dokter, panggil, lewati. Perubahan status tampil ke pengguna lain di cabang yang sama tanpa muat ulang. |
| M03-F03 | Pemeriksaan dan tindakan | Dokter memulai pemeriksaan, status menjadi "diperiksa", dan tagihan draft dibuat otomatis. Tindakan dari katalog masuk draft tagihan dengan salinan harga dan pajak saat itu, tercatat pelaksana dan waktunya. Dokter menandai kunjungan "selesai" saat pelayanan medis tuntas. |
| M03-F04 | Resep dan obat | Dokter menulis resep dari produk obat di katalog (dosis, aturan pakai, jumlah). Obat masuk draft tagihan. Stok tidak dicadangkan di draft; stok berkurang saat tagihan difinalkan (BR-024). Jika stok tidak cukup saat finalisasi, finalisasi ditolak dan baris harus disesuaikan. |
| M03-F05 | Perubahan status kunjungan | Alur status sesuai bagian 7. Pembatalan hanya sebelum diperiksa dan wajib beralasan. |
| M03-F06 | Daftar dan riwayat kunjungan | Cari dan filter berdasarkan tanggal (zona cabang), status, dokter, dan pelanggan. |

### M04. Rekam Medis dan Vaksinasi (8 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M04-F01 | Entri medis | Anamnesis dan pemeriksaan fisik terstruktur per kunjungan: berat, suhu, denyut, napas, kondisi umum, catatan. Hanya Dokter yang menulis. Draft tersimpan otomatis. Berat terbaru memperbarui profil hewan. |
| M04-F02 | Diagnosis dan rencana terapi | Satu atau lebih diagnosis berupa teks dengan saran dari diagnosis yang pernah dipakai, dan rencana terapi. Diagnosis bisa dicari. Tanpa sistem kode eksternal. |
| M04-F03 | Lampiran medis | Hasil laboratorium, foto, dokumen terkait entri. Tipe dan ukuran sama dengan M02-F05. Akses mengikuti permission medis. |
| M04-F04 | Penguncian entri | Finalisasi mengunci entri. Upaya mengubah entri final ditolak di database. |
| M04-F05 | Addendum | Koreksi atau tambahan dengan penulis, waktu, dan alasan. Entri asli tetap utuh. Addendum tampil berurutan. |
| M04-F06 | Vaksinasi | Catat jenis, merek atau batch, tanggal, dokter. Daftar jenis vaksin dan interval booster (dalam hari) dibuat Owner dan Dokter; tidak ada daftar bawaan. Vaksin menjadi item tagihan. Muncul otomatis di profil hewan dan portal. |
| M04-F07 | Pengingat booster | Daftar hewan jatuh tempo dengan filter rentang tanggal dan cabang, dihitung dari interval (BR-013). Dokter mengubah interval per kasus. Pengingat v1 hanya berupa daftar di dalam aplikasi. |
| M04-F08 | Tandai "dibagikan" | Dokter memilih entri yang tampil di portal dan dapat mencabutnya (BR-005). Entri yang tidak dibagikan tidak terbaca akun portal, diuji di level database. |

### M05. Rawat Inap (6 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M05-F01 | Check-in | Dari kunjungan. Mencatat waktu check-in, alasan, kandang, dokter penanggung jawab, perkiraan lama. Tarif kandang saat itu dikunci. Rawat inap membuat tagihan draft sendiri yang terpisah dari tagihan kunjungan awal (BR-009). |
| M05-F02 | Manajemen kandang | Daftar kandang per cabang: kode, tipe, tarif harian, status (tersedia, terisi, dibersihkan). Satu kandang menampung satu hewan. Perpindahan kandang tercatat. |
| M05-F03 | Catatan perkembangan harian | Kondisi, tanda vital, makan, minum, eliminasi, catatan, foto. Oleh Perawat atau Dokter, berstempel waktu dan penulis. Dapat ditandai "dibagikan" ke portal. |
| M05-F04 | Pemberian obat dan tindakan | Jadwal dan realisasi pemberian: siapa, kapan, dosis. Stok berkurang saat pemberian dicatat dan item masuk draft tagihan rawat inap (BR-024). Pembatalan pemberian hanya oleh Dokter dengan alasan dan mengembalikan stok. |
| M05-F05 | Biaya kandang dan deposit | Biaya per 24 jam sejak check-in (BR-012). Deposit dicatat sebagai pembayaran di muka berjenis "deposit" dan otomatis dialokasikan ke tagihan rawat inap saat difinalkan. Sisa deposit dikembalikan sebagai refund (BR-011). |
| M05-F06 | Check-out | Status akhir: pulang, dirujuk, atau meninggal. Tagihan rawat inap difinalkan saat check-out. Pelunasan tidak disyaratkan untuk check-out; sisa tetap tercatat sebagai belum lunas. Ringkasan perawatan dibuat. Kandang menjadi "dibersihkan". Status meninggal memperbarui profil hewan. |

### M06. Katalog dan Harga (4 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M06-F01 | Produk | Kode SKU unik, nama, kategori, satuan, barcode (diisi bila ada), harga jual, harga beli terakhir, penanda berbatch dan berkedaluwarsa, stok minimum (seragam di semua cabang), status kena pajak. Bisa dicari dan dipindai. Dinonaktifkan, tidak dihapus. |
| M06-F02 | Layanan dan tindakan | Konsultasi, vaksinasi, operasi, dan lainnya dengan harga, status kena pajak, dan pelaksana (Dokter atau Perawat). Dinonaktifkan, tidak dihapus. |
| M06-F03 | Kategori dan riwayat harga | Kategori satu tingkat. Harga seragam di semua cabang. Setiap perubahan harga tercatat dengan tanggal berlaku. |
| M06-F04 | Status pajak per item | Penanda kena atau tidak kena PPN per produk dan layanan. Perubahan tidak mengubah tagihan lama (BR-020). |

### M07. Pet Shop (3 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M07-F01 | Katalog jual | Tampilan produk di kasir: cari, pindai barcode, filter kategori, stok cabang. Hanya produk aktif yang dijual. |
| M07-F02 | Penjualan retail | Keranjang, pelanggan (kosong bila pembeli umum), tagihan, pembayaran. Satu penjualan menghasilkan satu tagihan. Stok berkurang saat tagihan difinalkan. |
| M07-F03 | Retur penjualan | Retur item dengan alasan, tidak melebihi jumlah terjual. Stok kembali, atau dibuang dengan alasan "rusak". Pengembalian dana lewat BR-011. |

### M08. Inventori (7 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M08-F01 | Stok per cabang | Saldo per produk per cabang dengan pencarian. Saldo selalu sama dengan jumlah seluruh mutasinya, diuji. |
| M08-F02 | Batch dan kedaluwarsa | Penerimaan mencatat nomor batch dan tanggal kedaluwarsa. Pengurangan memakai FEFO (BR-007). Batch kedaluwarsa tidak bisa dijual. |
| M08-F03 | Penyesuaian stok | Koreksi dengan alasan: rusak, hilang, kedaluwarsa dibuang, lainnya. Gudang mengajukan dan Supervisor atau Owner menyetujui. Tidak bisa menyebabkan stok minus. |
| M08-F04 | Kartu stok | Riwayat mutasi per produk dan batch (masuk, keluar, transfer, penyesuaian, retur, opname) dengan saldo berjalan. Tiap baris menunjuk dokumen sumber. |
| M08-F05 | Transfer antar cabang | Sesuai BR-017. Stok asal berkurang saat dikirim, stok tujuan bertambah saat diterima, batch dan kedaluwarsa terbawa, barang dalam perjalanan tercatat, selisih penerimaan dicatat dan ditinjau Supervisor atau Owner. |
| M08-F06 | Peringatan stok minimum dan kedaluwarsa | Daftar produk di bawah stok minimum dan batch yang kedaluwarsa dalam jumlah hari sesuai pengaturan (nilai awal 30 hari). Tampil di dashboard Gudang, Supervisor, dan Owner. |
| M08-F07 | Stock opname | Sesuai BR-023. Sesi penghitungan fisik per cabang. Produk yang dihitung terkunci sampai sesi ditutup. Selisih menjadi penyesuaian setelah disetujui. |

### M09. Pengadaan (3 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M09-F01 | Pemasok | Nama, kontak, alamat, catatan, status aktif. Dinonaktifkan, tidak dihapus. |
| M09-F02 | Pesanan pembelian | Dibuat per cabang berisi item, jumlah, harga beli. Status draft → dipesan → diterima sebagian → diterima, atau dibatalkan. Tidak bisa diubah setelah dipesan kecuali dibatalkan. Nomor diberikan saat dipesan. |
| M09-F03 | Penerimaan barang | Penuh atau sebagian, mencatat batch, kedaluwarsa, dan harga beli aktual. Menambah stok secara atomik dan memperbarui harga beli terakhir. Jumlah diterima tidak melebihi sisa pesanan. |

### M10. Kasir, Tagihan, dan Pembayaran (8 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M10-F01 | Tagihan terpadu | Header: pelanggan, hewan, sumber (kunjungan, rawat inap, retail), cabang, nomor. Baris: layanan, tindakan, obat, produk, kandang. Semua sumber menghasilkan tagihan berbentuk sama. Baris menyimpan salinan harga dan pajak saat dibuat. Finalisasi oleh Kasir mengunci baris, memberi nomor, mengurangi stok (BR-024), dan mengubah status menjadi "belum lunas". |
| M10-F02 | Diskon | Hanya per baris, persen atau nominal, wajib beralasan, hanya oleh pengguna dengan permission diskon (Supervisor dan Owner) sesuai BR-025. |
| M10-F03 | PPN | Sesuai BR-020. Dihitung per tagihan setelah diskon. Tampil sebagai baris terpisah. Dua contoh perhitungan di bagian 7 harus menghasilkan angka yang sama persis. |
| M10-F04 | Pembulatan | Sesuai BR-021. Dihitung pada total akhir setelah PPN dan tampil sebagai baris "Pembulatan" terpisah. |
| M10-F05 | Pembayaran manual | Sesuai BR-018: tunai, transfer, QRIS, kartu. Mencatat metode, jumlah, waktu, referensi (diisi bila ada). Tunai mencatat uang diterima dan kembalian. Tanpa payment gateway. Aksi bayar yang ditekan berulang tidak tercatat ganda. |
| M10-F06 | Pembayaran sebagian dan deposit | Status belum lunas → sebagian → lunas dengan sisa yang benar (BR-010). Pembayaran non-tunai tidak melebihi sisa. Deposit rawat inap sesuai M05-F05. |
| M10-F07 | Void, retur, dan refund | Sesuai BR-011. Kasir mengajukan, Supervisor atau Owner menyetujui. Wajib beralasan. Stok kembali sesuai jenisnya. Tagihan final tidak pernah dihapus. |
| M10-F08 | Cetak tagihan dan kuitansi | Tampilan cetak untuk A4 dan lebar struk 80 mm dari browser: logo, nama cabang, nomor, tanggal zona cabang, rincian, PPN, pembulatan, pembayaran, sisa. Cetak ulang diberi tanda "Salinan". |

### M11. Laporan dan Dashboard (7 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M11-F01 | Dashboard per peran | Owner dan Supervisor: penjualan hari ini dan 30 hari, kunjungan hari ini, tagihan belum lunas (jumlah dan total), produk di bawah stok minimum, batch hampir kedaluwarsa; Owner juga membandingkan cabang. Dokter: antrean saya, pasien rawat inap tanggung jawab saya, booster jatuh tempo 7 hari. Staff: kartu sesuai templat (Resepsionis: antrean; Kasir: tagihan belum lunas dan pembayaran hari ini; Perawat: pasien rawat inap dan jadwal obat; Gudang: stok minimum, kedaluwarsa, transfer dalam perjalanan). |
| M11-F02 | Laporan penjualan | Per periode, cabang, kategori, produk atau layanan. "Penjualan" berarti total tagihan final tidak void sebelum PPN dan pembulatan. |
| M11-F03 | Laporan kunjungan | Jumlah, jenis layanan, dokter, status. |
| M11-F04 | Laporan stok | Saldo, pergerakan, kedaluwarsa, dan nilai persediaan dari harga beli batch. |
| M11-F05 | Laporan pembayaran per metode | Per hari, kasir, dan cabang untuk rekonsiliasi: tunai, transfer, QRIS, kartu, termasuk refund. |
| M11-F06 | Laporan pajak dan pembulatan | Dasar pajak, PPN, dan selisih pembulatan per periode dan cabang. |
| M11-F07 | Konsolidasi lintas cabang | Perbandingan antar cabang untuk Owner. Batas hari mengikuti zona waktu masing-masing cabang. |

Semua laporan: angka sama dengan jumlah transaksi sumbernya, bisa diekspor ke CSV, dan hanya menampilkan data sesuai permission dan cabang.

### M12. Pet Owner Portal (7 fitur, hanya untuk melihat)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M12-F01 | Akun lewat undangan | Klinik mengundang pemilik lewat email. Pemilik mengatur kata sandi lalu masuk. Akun terikat ke satu pelanggan (BR-015). Pemilik mengatur kata sandinya sendiri. |
| M12-F02 | Profil hewan | Daftar hewan miliknya dengan foto, data dasar, berat terakhir. Hewan yang meninggal tetap tampil dengan status "Meninggal". |
| M12-F03 | Riwayat pemeriksaan | Daftar kunjungan dengan ringkasan yang dibagikan, lintas cabang. |
| M12-F04 | Rekam medis yang diizinkan | Detail entri dan lampiran yang ditandai "dibagikan" saja (BR-005). |
| M12-F05 | Vaksinasi | Riwayat vaksin dan jadwal berikutnya. |
| M12-F06 | Tagihan | Daftar dan rincian tagihan final: baris, PPN, pembulatan, pembayaran, sisa. Tanpa tombol bayar (BR-019). Dapat dicetak. Tagihan belum lunas menampilkan keterangan "Pembayaran dilakukan di klinik". |
| M12-F07 | Perkembangan rawat inap | Status terkini serta catatan harian dan foto yang dibagikan. |

## 6. Alur utama

- **Kunjungan klinik:**
  1. Resepsionis mendaftarkan kunjungan (pelanggan dan hewan sudah ada, termasuk dari cabang lain, atau didaftarkan baru).
  2. Hewan masuk antrean. Dokter memanggil dan memulai pemeriksaan dengan riwayat medis lintas cabang terlihat. Tagihan draft dibuat.
  3. Dokter mencatat rekam medis, tindakan, resep, dan vaksin, mengunci entri, lalu menandai kunjungan "selesai".
  4. Kasir meninjau tagihan draft dan memintakan diskon ke Supervisor bila diperlukan, lalu memfinalkan tagihan (nomor diberikan, stok berkurang).
  5. Total dihitung: subtotal → diskon → PPN (bila aktif) → pembulatan (bila aktif).
  6. Kasir mencatat pembayaran manual (penuh atau sebagian) dan mencetak bukti.
  7. Entri yang dibagikan Dokter, vaksinasi, dan tagihan final muncul di portal pemilik.
- **Rawat inap:**
  1. Dokter memutuskan rawat inap. Staff melakukan check-in (waktu tercatat), menempatkan hewan di kandang, dan menerima deposit bila ada.
  2. Perawat dan Dokter mencatat perkembangan harian dan pemberian obat. Stok berkurang saat pemberian dicatat.
  3. Biaya kandang, tindakan, dan obat terakumulasi di draft tagihan rawat inap.
  4. Saat check-out (pulang, dirujuk, meninggal), tagihan difinalkan, biaya kandang dihitung final, deposit dialokasikan, dan ringkasan perawatan dibuat.
- **Pet shop:** Kasir memilih produk, menyusun keranjang, memfinalkan tagihan (stok berkurang), dan mencatat pembayaran.
- **Pengadaan:** Gudang membuat pesanan pembelian, memesan, lalu mencatat penerimaan (batch dan kedaluwarsa), stok bertambah, harga beli terakhir diperbarui.
- **Transfer stok antar cabang:**
  1. Gudang cabang asal membuat transfer (barang, batch, jumlah, cabang tujuan).
  2. Transfer dikirim: nomor diberikan, stok asal berkurang, status "dalam perjalanan".
  3. Cabang tujuan mengonfirmasi jumlah yang diterima, stok tujuan bertambah dengan batch dan kedaluwarsa yang sama.
  4. Jika jumlah diterima berbeda, selisih dicatat dengan alasan dan ditinjau Supervisor atau Owner.
- **Stock opname:** Supervisor atau Gudang membuka sesi dan memilih produk (terkunci), memasukkan hitungan fisik, Supervisor atau Owner menyetujui selisih, penyesuaian dibuat, produk terbuka kembali.
- **Undangan portal:** Staff berizin mengundang pemilik lewat email, pemilik membuat kata sandi, akun terikat ke pelanggan, pemilik melihat hewannya.
- **Void tagihan:** Kasir mengajukan dengan alasan, Supervisor atau Owner menyetujui, tagihan menjadi void, pembayaran dibatalkan atau di-refund, stok kembali sesuai jenisnya, semua tercatat di audit.
- **Saat gagal:** pembayaran ganda dicegah, stok tidak cukup menolak finalisasi dengan pesan yang menyebut produk dan sisa stok, koneksi putus tidak membuat transaksi setengah tersimpan.

## 7. Aturan bisnis

| ID | Aturan | Kondisi | Hasil | Pengecualian |
|---|---|---|---|---|
| BR-001 | Isolasi cabang | Pengguna mengakses data operasional (stok, transaksi, pembayaran, rawat inap) | Hanya data cabang yang ditugaskan kepadanya | Owner melihat semua cabang. Pelanggan, hewan, rekam medis mengikuti BR-003. |
| BR-002 | Akses berbasis role dan permission | Pengguna melakukan aksi | Diizinkan hanya jika permission-nya ada, ditegakkan di database | — |
| BR-003 | Pelanggan, hewan, dan riwayat medis terpusat lintas cabang | Hewan dilayani di cabang mana pun | Pengguna dengan permission baca rekam medis membaca riwayat medis lengkap semua cabang. Tiap entri mencatat cabang asal. | Penulisan rekam medis hanya di cabang tempat pelayanan. Stok dan keuangan tetap per cabang. |
| BR-004 | Rekam medis hanya ditulis Dokter | Entri dibuat atau diubah | Hanya Dokter. Entri final terkunci. | Koreksi lewat addendum bertanda waktu, penulis, dan alasan |
| BR-005 | Visibilitas ke portal | Entri medis atau catatan harian ingin dilihat pemilik | Tampil hanya jika ditandai "dibagikan" oleh Dokter | Vaksinasi dan tagihan final milik pemilik tampil otomatis |
| BR-006 | Stok per cabang tidak boleh minus | Finalisasi tagihan, pemberian obat rawat inap, pengiriman transfer, penyesuaian | Ditolak bila stok tidak cukup. Pengurangan atomik. | — |
| BR-007 | FEFO | Barang berbatch dikurangi | Batch dengan kedaluwarsa terdekat dipakai lebih dulu | Barang tanpa kedaluwarsa |
| BR-008 | Uang bilangan bulat Rupiah | Semua perhitungan | Tanpa float. Semua pembulatan eksplisit dan tercatat. | — |
| BR-009 | Tagihan terpadu | Kunjungan, rawat inap, atau penjualan retail | Satu kunjungan menghasilkan satu tagihan. Satu rawat inap menghasilkan satu tagihan sendiri, terpisah dari tagihan kunjungan awal. Satu penjualan menghasilkan satu tagihan. Finalisasi mengunci baris. | — |
| BR-010 | Pembayaran boleh sebagian | Pelanggan membayar kurang dari total | Status: belum lunas (terbayar 0), sebagian (0 sampai kurang dari total), lunas (terbayar sama dengan total). Sisa tercatat. | Pembayaran tunai boleh melebihi sisa, selisihnya dicatat sebagai kembalian |
| BR-011 | Transaksi final tidak dihapus | Ada kesalahan transaksi atau pembayaran, retur, atau sisa deposit | Dibatalkan lewat void (tagihan), pembatalan pembayaran, retur (barang), atau refund. Refund dicatat sebagai pembayaran bernilai negatif dengan metode dan referensi. Wajib beralasan. Kasir mengajukan, Supervisor atau Owner menyetujui. | — |
| BR-012 | Biaya kandang per 24 jam sejak check-in | Hewan dirawat inap | Jumlah hari = durasi sejak waktu check-in dibagi 24 jam, dibulatkan ke atas, minimal 1 hari. Biaya = tarif harian × jumlah hari. | 0 sampai 24 jam = 1 hari. Lebih dari 24 sampai 48 jam = 2 hari. Contoh: check-in 10 Nov 14:00, check-out 12 Nov 15:00 = 49 jam = 3 hari. |
| BR-013 | Jadwal vaksin ulang | Vaksin tercatat | Jatuh tempo = tanggal vaksin + interval jenis vaksin (hari) | Dokter dapat mengubah interval per kasus |
| BR-014 | Jejak audit | Perubahan pada rekam medis, transaksi, pembayaran, stok, pajak, harga, role, permission | Dicatat siapa, kapan, apa yang berubah (nilai lama dan baru) | — |
| BR-015 | Akun portal terikat kepemilikan | Pemilik membuat akun | Akun ditautkan ke satu pelanggan lewat undangan klinik. Hanya melihat hewan milik pelanggan itu saat ini. | — |
| BR-016 | Zona waktu mengikuti lokasi cabang | Semua waktu | Disimpan UTC, tampil sesuai zona cabang. Batas hari laporan dan tahun penomoran mengikuti zona cabang. Konsolidasi menjumlahkan per hari lokal tiap cabang. | — |
| BR-017 | Transfer stok antar cabang | Stok dipindah dari cabang asal ke tujuan | Status draft → dikirim → diterima, atau dibatalkan (hanya sebelum dikirim). Stok asal berkurang saat dikirim, tujuan bertambah saat diterima. Batch dan kedaluwarsa terbawa. Barang dalam perjalanan tercatat. Selisih penerimaan dicatat dengan alasan dan ditinjau Supervisor atau Owner. | — |
| BR-018 | Pembayaran dicatat manual oleh kasir | Pelanggan membayar | Kasir mencatat metode (tunai, transfer, QRIS, kartu), jumlah, waktu, referensi (diisi bila ada). Tunai mencatat uang diterima dan kembalian. Satu pembayaran memakai satu metode. Pembayaran campuran dicatat sebagai beberapa pembayaran. Tanpa payment gateway. Pembayaran tercatat tidak diubah, hanya dibatalkan lewat BR-011. | Pembayaran non-tunai tidak boleh melebihi sisa tagihan |
| BR-019 | Portal hanya untuk melihat | Pemilik mengakses portal | Hanya membaca data hewan miliknya yang diizinkan. Tagihan tampil (rincian, status, sisa) tanpa pembayaran online. | Pemilik mengatur kata sandinya sendiri |
| BR-020 | PPN dapat dikonfigurasi | Tagihan dibuat | Pengaturan perusahaan: PPN aktif atau tidak, tarif (disimpan sebagai basis poin, 1% = 100), dan mode harga katalog (belum atau sudah termasuk pajak). Tiap produk dan layanan ditandai kena atau tidak kena pajak. PPN dihitung per tagihan dari total baris kena pajak setelah diskon, dibulatkan ke Rupiah terdekat (setengah ke atas). Mode belum termasuk: PPN = dasar pajak × tarif. Mode sudah termasuk: dasar pajak = total baris kena pajak ÷ (1 + tarif), PPN = total baris kena pajak − dasar pajak. Tagihan menyimpan salinan tarif, mode, dan nilai pajak saat dibuat. Tarif tercatat dengan tanggal berlaku. | Default: PPN nonaktif. Tidak ada tarif atau status PKP bawaan sampai Owner mengisinya. |
| BR-021 | Pembulatan tagihan dapat dikonfigurasi | Total tagihan dihitung | Pengaturan perusahaan: tanpa pembulatan, atau kelipatan Rp100, Rp500, Rp1.000 terdekat (setengah ke atas). Dihitung pada total akhir setelah PPN. Tampil sebagai baris "Pembulatan" (positif atau negatif), tercatat di laporan, dan tidak mengubah nilai PPN. | Default: tanpa pembulatan |
| BR-022 | Penomoran dokumen | Dokumen difinalkan atau diberi status resmi | Nomor unik dan berurutan per cabang per jenis, tanpa duplikat meski dibuat bersamaan, tidak dipakai ulang termasuk setelah void. Format `{KODE-CABANG}-{JENIS}-{TAHUN}-{URUT 6 digit}`. Jenis: `VST` kunjungan (saat pendaftaran), `INV` tagihan (saat finalisasi), `PO` pesanan pembelian (saat dipesan), `TRF` transfer (saat dikirim). Urutan mulai 000001 tiap tahun lokal cabang. Draft belum bernomor. | Contoh: `JKT01-INV-2026-000123` |
| BR-023 | Stock opname | Sesi penghitungan fisik | Produk yang dihitung terkunci (tidak bisa dijual atau dimutasi) sampai sesi ditutup. Selisih = hitungan fisik − saldo sistem. Selisih menjadi penyesuaian setelah disetujui Supervisor atau Owner. | — |
| BR-024 | Saat stok berkurang | Barang atau obat keluar | Penjualan retail dan kunjungan klinik: saat tagihan difinalkan. Rawat inap: saat pemberian dicatat. Retur atau pembatalan pemberian mengembalikan stok. | — |
| BR-025 | Diskon | Diskon diberikan | Hanya per baris (persen atau nominal), wajib beralasan, hanya oleh pengguna dengan permission diskon (Supervisor dan Owner). Kasir mengajukan, Supervisor atau Owner menerapkan. Tidak ada diskon tingkat tagihan. | — |

**Contoh perhitungan.** Tarif PPN 10% hanya ilustrasi untuk tes, bukan tarif yang berlaku. Semua item kena pajak, pembulatan ke Rp500 terdekat.
- **Harga belum termasuk pajak:** konsultasi Rp75.000 + vaksin Rp150.000 + obat 2 × Rp22.350 (Rp44.700) = subtotal Rp269.700 → PPN 10% Rp26.970 → Rp296.670 → pembulatan −Rp170 → **total Rp296.500**. DP Rp100.000 tunai → status "sebagian", sisa Rp196.500. Pelunasan Rp196.500 → "lunas".
- **Harga sudah termasuk pajak:** item sama, total baris Rp269.700. Dasar pajak = Rp269.700 ÷ 1,10 = Rp245.182. PPN = Rp24.518. Sebelum pembulatan Rp269.700 → pembulatan −Rp200 → **total Rp269.500**. PPN tetap Rp24.518.

**Status dan perpindahan yang diizinkan:**
- Kunjungan: terdaftar → menunggu → diperiksa → selesai. Atau dibatalkan (hanya dari terdaftar atau menunggu).
- Rawat inap: dirawat → pulang, dirujuk, atau meninggal.
- Tagihan: draft → belum lunas → sebagian → lunas. Void dari belum lunas, sebagian, atau lunas dengan persetujuan.
- Pesanan pembelian: draft → dipesan → diterima sebagian → diterima. Atau dibatalkan (hanya dari draft atau dipesan).
- Transfer stok: draft → dikirim → diterima. Atau dibatalkan (hanya dari draft).
- Kandang: tersedia → terisi → dibersihkan → tersedia.
- Sesi opname: dibuka → dihitung → disetujui. Atau dibatalkan sebelum disetujui.

**Kasus uji wajib dari risiko bisnis:** stok minus karena dua kasir memfinalkan penjualan barang terakhir bersamaan; tagihan terbayar ganda karena tombol ditekan berulang; Dokter mengubah catatan Dokter lain; data operasional cabang A bocor ke staf cabang B; pemilik hewan melihat hewan milik orang lain; transfer yang diterima dua kali; stok hilang saat transfer terputus di tengah proses; tarif PPN berubah dan tagihan lama ikut berubah; pembulatan yang membuat total pembayaran dan tagihan tidak cocok; hari laporan bergeser untuk cabang di zona WITA dan WIT.

## 8. Data

- **Objek utama:** perusahaan, pengaturan, cabang (dengan zona waktu), pengguna, penugasan cabang, permission, pelanggan, hewan, kunjungan, entri rekam medis, addendum, diagnosis, lampiran, jenis vaksin, vaksinasi, rawat inap, kandang, catatan harian, pemberian obat, produk, layanan, kategori, riwayat harga, batch stok, mutasi stok, penyesuaian, sesi opname, transfer stok, pemasok, pesanan pembelian, penerimaan, tagihan, baris tagihan, pembayaran, akun portal, penghitung nomor dokumen, log audit.
- **Data sensitif:** data pribadi pemilik (nama, telepon, email, alamat), rekam medis, data keuangan, kredensial. Diperlakukan sesuai UU Pelindungan Data Pribadi: akses dibatasi, tidak ada data pribadi di log aplikasi, perubahan dan akses tercatat di audit.
- **Jumlah cabang:** tidak dibatasi, ditambah lewat pengaturan.
- **Target uji beban:** 10 cabang, 30 pengguna per cabang, 50.000 pelanggan dan hewan, 500 tagihan per hari secara total.
- **Retensi:** rekam medis, transaksi, pembayaran, dan audit tidak dihapus permanen. "Hapus" berarti arsip atau nonaktif.
- **Data awal:** sistem dimulai kosong dan data dimasukkan lewat antarmuka. Tidak ada fitur impor di v1.
- **Data contoh pengembangan (`seed.sql`, hanya lokal dan staging):** tiga cabang (WIB, WITA, WIT), pengguna untuk tiap peran dan templat Staff, beragam jenis hewan, produk klinik dan pet shop, jenis vaksin, serta tagihan dalam semua status.

## 9. Integrasi dan hal yang disediakan Owner

| Layanan | Untuk apa | Keputusan |
|---|---|---|
| Supabase | Backend penuh | Dipakai. Dua proyek: staging dan produksi. |
| Vercel | Hosting | Dipakai. Dua proyek: staging dan produksi. |
| GitHub | Repositori dan CI | Dipakai |
| Layanan email (SMTP) | Undangan dan atur ulang kata sandi lewat Supabase Auth | Dipakai di staging dan produksi |
| Payment gateway | Pembayaran online | **Tidak ada** |
| WhatsApp, SMS | Notifikasi | **Tidak ada di v1** |
| Printer struk | Cetak | Hanya lewat cetak browser |

**Disediakan Owner dan menjadi titik berhenti agent (bagian 17):**
- Sebelum Fase 1: repositori GitHub, proyek Supabase dan Vercel untuk staging.
- Sebelum Fase 12: proyek Supabase dan Vercel untuk produksi, serta layanan SMTP.
- Saat mengisi pengaturan di aplikasi: status PKP, tarif PPN yang berlaku, perlakuan pajak tiap produk dan layanan, pilihan pembulatan.

Selama kredensial belum tersedia, agent tetap bekerja penuh di lingkungan lokal dan mencatat statusnya di `STATUS.md`.

## 10. Batasan dan persyaratan non-fungsional

- **Keamanan (wajib):**
  - Isolasi cabang dan hak akses ditegakkan dengan Row Level Security.
  - Akses lintas cabang untuk riwayat medis (BR-003) diatur RLS dan permission, tidak terbuka untuk semua.
  - Aksi sensitif (void, refund, penyesuaian stok, perubahan role, perubahan pajak dan harga) berjalan di sisi server dengan jejak audit.
  - Tanpa secret di repo. Service role key hanya di environment server.
  - Query terparameterisasi, validasi di batas sistem, dependensi di-pin.
- **Regulasi:** pelindungan data pribadi pemilik hewan. Catatan keuangan dan pajak bisa diaudit. Perlakuan pajak ditentukan Owner bersama konsultan pajaknya, bukan oleh sistem.
- **Perangkat:** browser modern (dua versi mayor terakhir Chrome, Safari, Edge, Firefox) di desktop dan tablet untuk operasional. Portal mengutamakan HP. Semua layar responsif.
- **Performa:** layar kasir interaktif kurang dari 2 detik di jaringan 4G. Simpan tagihan kurang dari 1 detik pada 95% permintaan. Pencarian pelanggan kurang dari 1 detik pada 50.000 data.
- **Pemulihan:** `DEPLOYMENT.md` menjelaskan pemulihan dari pencadangan bawaan paket produksi Supabase. Tidak ada sistem cadangan buatan sendiri.
- **Aksesibilitas:** navigasi keyboard penuh, kontras teks minimal 4,5:1, label formulir, dukungan teks besar, mengikuti `prefers-reduced-motion`.

## 11. Tampilan dan pengalaman pengguna

Konsep UI/UX bergaya Apple, merujuk pada prinsip Apple Human Interface Guidelines: kejelasan, hierarki tegas, ruang kosong lega, fokus pada konten, kontrol yang terasa alami.

**Sistem desain** (dibuat sekali di Fase 0, dipakai semua modul):
- **Tipografi:** font sistem (`-apple-system`, `BlinkMacSystemFont`, `SF Pro Text` bila tersedia, fallback `system-ui`). Skala 34, 28, 22, 17, 15, 13, 12 px. Angka uang dan tabel memakai `tabular-nums` dan rata kanan.
- **Spasi:** kelipatan 4 px (4, 8, 12, 16, 24, 32, 48).
- **Bentuk:** sudut membulat (kontrol 8 px, kartu 12 px, sheet 20 px), bayangan halus. Efek kaca (blur) hanya di bilah atas dan sheet.
- **Warna:**
  - Aksen utama teal: terang `#0A7A78`, gelap `#4FD1CC`.
  - Warna semantik: hijau (sukses), kuning-oranye (peringatan), merah (bahaya), biru (info), semuanya diverifikasi kontras AA.
  - Latar netral berlapis. Mode terang dan gelap mengikuti pengaturan sistem pengguna.
- **Logo:** wordmark teks "PETORA" dalam font sistem semi-bold. Tanpa ilustrasi atau ikon hewan sebagai logo.
- **Gerak:** durasi 200 sampai 350 ms. Hanya untuk transisi sheet dan perubahan status. Nonaktif bila `prefers-reduced-motion`.
- **Target sentuh:** minimal 44 px. Tinggi baris tabel 44 px.
- **Ikon:** Lucide. Tanpa logo, SF Symbols, atau font berlisensi Apple.

**Tata letak:**
- **Operasional (desktop):** sidebar kiri 240 px yang bisa diciutkan menjadi 72 px, bilah atas dengan pencarian global dan pemilih cabang aktif, tampilan master-detail untuk daftar, sheet untuk formulir.
- **Tablet:** sidebar ringkas, target sentuh besar untuk Dokter dan Perawat.
- **Kasir:** layar fokus dua kolom (keranjang dan rincian di kiri, ringkasan total dan pembayaran di kanan).
- **Portal (HP):** tab bar bawah dengan empat tab: Hewan, Riwayat, Tagihan, Akun. Kartu hewan besar dengan foto. Bahasa awam.
- **Komponen khas:** sheet dari bawah, segmented control, daftar bergrup, toggle, pencarian di atas, chip status.
- **Setiap layar punya empat keadaan:** kosong (dengan tindakan yang jelas), memuat (kerangka), galat (dengan jalan keluar), sukses.

**Bahasa antarmuka:**
- Bahasa Indonesia sehari-hari yang sopan, ringkas, dan konkret.
- Operasional memakai istilah klinik yang lazim (anamnesis, diagnosis, rawat inap). Portal memakai bahasa awam, bukan istilah medis mentah.
- Contoh nada: "Stok tidak cukup. Tersisa 3 pcs di cabang ini." Bukan: "Terjadi kesalahan."
- Pesan galat selalu menjelaskan apa yang terjadi dan apa yang dilakukan berikutnya.

**Dilarang:** tampilan dashboard template generik, gradien ungu-biru bawaan, emoji sebagai dekorasi, kartu seragam tanpa hierarki, teks isian klise ("Lorem ipsum", "Welcome to our platform"), data contoh klise.

## 12. Struktur repositori dan kesiapan deployment

Struktur ini wajib diikuti. Penyimpangan hanya bila framework memaksanya, dicatat di `KEPUTUSAN.md`.

```
petora/
├── AGENTS.md · BRIEF.md · README.md · .env.example
├── package.json + pnpm-lock.yaml + konfigurasi (ts, eslint, prettier, vitest, playwright)
├── .github/workflows/ci.yml     # lint, type check, tes, tes DB, build
├── docs/
│   ├── PRODUK · FITUR · ATURAN-BISNIS · KEPUTUSAN
│   ├── KONVENSI · MASALAH · STATUS
│   └── DEPLOYMENT.md            # langkah rilis, pemulihan, dan rollback
├── supabase/
│   ├── migrations/              # skema, RLS, fungsi (stok, tagihan, transfer)
│   ├── tests/                   # tes RLS dan fungsi database
│   ├── seed.sql                 # data contoh, 3 cabang beda zona waktu
│   └── config.toml
├── src/
│   ├── app/
│   │   ├── app/                 # area operasional di /app
│   │   └── portal/              # area pemilik hewan di /portal
│   ├── modules/                 # satu folder per modul
│   │   ├── organization/  customers/  clinic/  medical-records/
│   │   ├── inpatient/  catalog/  petshop/  inventory/
│   │   └── procurement/  billing/  reports/  owner-portal/
│   │      (isi tiap modul: components, actions, queries, schemas, tests)
│   ├── lib/
│   │   ├── supabase/            # klien browser dan server
│   │   ├── access/              # cek permission di UI
│   │   ├── money/               # format Rupiah
│   │   └── time/                # zona waktu cabang
│   ├── ui/                      # sistem desain (token, komponen dasar)
│   └── types/                   # tipe hasil generate dari skema DB
├── e2e/                         # Playwright: alur kritis
└── scripts/                     # setup awal, seed, cek env, generate tipe
```

**Siap deployment berarti:**
- CI hijau: lint, tipe, tes unit, tes database, e2e, build.
- Migrasi dijalankan ulang dari database kosong tanpa galat.
- `.env.example` lengkap. Service role key hanya di environment server.
- `seed.sql` tidak pernah berjalan di produksi.
- `DEPLOYMENT.md` memuat langkah rilis, pemulihan, dan rollback yang sudah dicoba di staging.
- README bisa diikuti dari nol oleh orang baru.

## 13. Strategi pengujian

**Lapisan:**
- **Tes database (pgTAP):** isolasi cabang (BR-001), permission (BR-002), akses lintas cabang (BR-003), visibilitas portal (BR-005, BR-015, BR-019), penguncian rekam medis (BR-004), stok, transfer, tagihan, pajak, pembulatan, dan penomoran. Setiap kombinasi peran dan cabang diuji.
- **Tes unit (Vitest):** logika murni di sisi aplikasi (format, validasi, pemetaan).
- **Tes integrasi (Vitest):** tiap modul terhadap database lokal.
- **Tes e2e (Playwright):** kunjungan sampai pembayaran sampai portal; rawat inap penuh; penjualan retail; pengadaan sampai stok; transfer antar cabang; stock opname; undangan portal dan akses terbatas.

**Penamaan:** tes menyebut ID aturan yang diujinya, misalnya `BR-001-branch-isolation` atau `BR-021-rounding`.

**Skenario wajib:**
- Dua kasir memfinalkan penjualan barang terakhir bersamaan (BR-006).
- Aksi bayar ditekan berulang (BR-018).
- Transfer terputus di tengah proses (BR-017).
- Tarif PPN berubah setelah tagihan dibuat (BR-020).
- Dua contoh perhitungan bagian 7 menghasilkan angka yang sama persis, termasuk pembulatan bernilai negatif (BR-020, BR-021).
- Biaya kandang 24, 25, 48, dan 49 jam menghasilkan 1, 2, 2, dan 3 hari (BR-012).
- Transaksi pukul 23:30 di WIB, WITA, dan WIT jatuh di hari yang benar pada laporan (BR-016).
- Pengguna cabang A membaca atau mengubah data cabang B lewat API langsung (BR-001).
- Akun portal membaca hewan atau entri yang tidak dibagikan (BR-005, BR-015).
- Dokter mengubah entri final atau entri milik Dokter lain (BR-004).
- Penomoran tidak menghasilkan duplikat saat dua tagihan difinalkan bersamaan (BR-022).

**Tes yang bermakna:** menguji perilaku, bukan implementasi. Tes baru harus terbukti gagal bila kodenya dirusak.

## 14. Fase pengerjaan

Urutan mengikuti ketergantungan. Tiap fase selesai penuh sesuai definisi selesai `AGENTS.md` bagian 7 sebelum fase berikutnya dimulai. Agent tidak menunggu persetujuan antar fase.

| Fase | Cakupan | Aturan terkait | Bergantung pada |
|---|---|---|---|
| 0 | Fondasi: repo, CI, lint, tipe, Supabase lokal, skema dasar, pola RLS dan audit, sistem desain, seed dasar | — | — |
| 1 | M01 Organisasi dan Akses | BR-001, 002, 014, 016, 020 dan 021 (pengaturan) | 0 |
| 2 | M06 Katalog dan Harga | BR-020 (status pajak) | 1 |
| 3 | M02 Pelanggan dan Hewan | BR-003 (data terpusat) | 1 |
| 4 | M08 Inventori, termasuk transfer dan opname | BR-006, 007, 017, 023 | 1, 2 |
| 5 | M10 Kasir, Tagihan, Pembayaran | BR-008, 009, 010, 011, 018, 020, 021, 022, 024, 025 | 2, 3, 4 |
| 6 | M07 Pet Shop | BR-024 | 4, 5 |
| 7 | M09 Pengadaan | BR-022 | 2, 4 |
| 8 | M03 Pelayanan Klinik dan M04 Rekam Medis dan Vaksinasi | BR-003, 004, 005, 013 | 3, 5 |
| 9 | M05 Rawat Inap | BR-012, 024 | 5, 8 |
| 10 | M11 Laporan dan Dashboard | BR-016 | 5 sampai 9 |
| 11 | M12 Pet Owner Portal | BR-005, 015, 019 | 8, 9 |
| 12 | Penguatan dan deployment: uji beban, uji keamanan, aksesibilitas, `DEPLOYMENT.md`, deploy staging lalu produksi | semua BR | semua |

Sebuah fase selesai jika semua fiturnya memenuhi definisi selesai, aturan terkaitnya punya tes otomatis, dan `STATUS.md`, `FITUR.md`, serta `ATURAN-BISNIS.md` diperbarui.

## 15. Di luar cakupan dan ditunda

**Di luar cakupan (tidak akan dibuat):**
- Banyak perusahaan (multi-tenant antar perusahaan). Sistem ini satu perusahaan, banyak cabang.
- Aplikasi mobile native.
- Payment gateway dan verifikasi otomatis pembayaran transfer, QRIS, atau kartu.
- Portal yang mengubah data selain pengaturan akunnya sendiri.
- Integrasi alat laboratorium atau radiologi.
- Akuntansi penuh, utang atau pembayaran ke pemasok, e-Faktur, dan pelaporan pajak. Sistem hanya menghitung dan menampilkan PPN di tagihan serta menyediakan laporan pajak operasional.
- Cetak langsung ke printer struk.
- Grooming, penitipan, atau layanan lain di luar klinik dan pet shop.
- Toko online untuk publik.
- Beberapa bahasa antarmuka.

**Ditunda ke v2 (tidak dikerjakan di v1):**
- Booking janji temu online oleh pemilik.
- Notifikasi WhatsApp, SMS, dan email otomatis.
- Pembayaran online di portal.
- Gabung data pelanggan duplikat.
- Retur ke pemasok.
- Harga berbeda per cabang.
- Impor CSV data awal.
- MFA.
- Beberapa akun portal untuk satu hewan.

## 16. Tanda berhasil v1

v1 selesai jika semua ini terpenuhi:
- Satu perusahaan dengan minimal tiga cabang, termasuk satu di zona WITA atau WIT, berjalan. Cabang baru ditambah lewat pengaturan tanpa mengubah kode.
- Pengguna cabang A terbukti tidak bisa melihat atau mengubah data operasional cabang B (diuji otomatis di level database).
- Riwayat medis dari cabang A terbaca oleh Dokter cabang B yang berizin, tetapi tidak oleh pengguna tanpa permission medis.
- Alur kunjungan klinik berjalan penuh: daftar → periksa → rekam medis → tagihan (diskon, PPN, pembulatan) → pembayaran manual → hasil tampil di portal.
- Alur rawat inap berjalan penuh dengan biaya kandang yang benar (24, 25, 48, 49 jam = 1, 2, 2, 3 hari).
- Penjualan pet shop, inventori, dan pengadaan berjalan dengan stok akurat dan tidak pernah minus, termasuk saat dua transaksi bersamaan.
- Transfer stok antar cabang dan stock opname berjalan penuh, dan total stok lintas cabang selalu konsisten.
- Pembayaran tunai, transfer, QRIS, dan kartu tercatat. Pembayaran sebagian, pelunasan, dan refund benar. Pembayaran ganda tercegah.
- PPN dan pembulatan dikonfigurasi dari pengaturan. Perubahan tarif tidak mengubah tagihan lama. Dua contoh perhitungan di bagian 7 menghasilkan angka yang sama persis.
- Pemilik hewan masuk ke portal dan hanya melihat hewan serta data yang dibagikan kepadanya, termasuk tagihan tanpa opsi bayar.
- Laporan operasional cocok dengan data transaksi sumbernya, termasuk batas hari per zona waktu cabang.
- Seluruh aturan BR-001 sampai BR-025 punya tes otomatis. Semua 72 fitur memenuhi definisi selesai.
- Aplikasi ter-deploy ke staging lalu produksi. `DEPLOYMENT.md` terbukti bisa diikuti. README bisa diikuti dari nol.
- Tidak ada masalah kritis atau tinggi yang terbuka (sesuai `AGENTS.md`).

## 17. Aturan otonomi

Semua yang tertulis di dokumen ini sudah diputuskan. Agent tidak bertanya tentang isinya.

**Agent berhenti dan bertanya hanya untuk:**
- Akun dan kredensial yang belum disediakan (GitHub, Supabase, Vercel, SMTP).
- Deploy ke produksi.
- Mengisi tarif PPN dan status PKP yang berlaku sungguhan.
- Migrasi yang menghapus atau mengubah data produksi secara tidak bisa dibalik.

**Agent memutuskan sendiri tanpa bertanya:** versi dependensi, nama internal, struktur kode di dalam modul, detail desain visual di dalam sistem desain bagian 11, skema tabel dan indeks, serta cara menyelesaikan celah di brief (aturan di bagian atas dokumen).

Saat berhenti, agent menyiapkan semuanya terlebih dahulu: keadaan tercatat di `STATUS.md`, pilihan beserta rekomendasi dan alasannya, dan pekerjaan lain yang tidak bergantung tetap dilanjutkan.
