# PRODUK: PETORA

Ringkasan produk, dua area fungsi, sasaran terukur, arah visual. Ringkasan dari `BRIEF.md` bagian 1 dan 11.

## Identitas

- Nama proyek: PETORA
- Jenis: proyek baru
- Bahasa antarmuka: Bahasa Indonesia
- Bahasa dokumentasi: Bahasa Indonesia. Kode, nama tabel, dan identifier dalam bahasa Inggris.
- Cakupan: seluruh fitur di bagian 5 (72 fitur dalam 12 modul)

## Konsep

*Single Company, Multi-Branch.* Satu perusahaan mengelola banyak cabang sejak awal implementasi. Semua cabang dalam satu ekosistem data terpusat, dengan akses, kewenangan, dan ruang lingkup operasional per cabang.

## Dua area fungsi

1. **Operational Application** untuk Owner, Supervisor, Dokter, dan Staff. Setiap pengguna mendapat dashboard, menu, akses data, dan kewenangan sesuai role dan permission.
2. **Pet Owner Portal** untuk pemilik hewan. Hanya untuk melihat informasi hewan peliharaannya.

## Masalah yang diselesaikan

Operasional klinik hewan dan pet shop biasanya terpecah (pendaftaran, rekam medis, rawat inap, stok, kasir, laporan), sehingga data tidak sinkron, stok dan tagihan sulit ditelusuri, dan pemilik hewan tidak punya akses ke informasi hewannya.

## Sasaran yang diukur

- Satu tagihan menampung seluruh layanan, obat, produk, dan biaya rawat inap dari satu sumber.
- Stok per cabang akurat dan tidak pernah minus, termasuk saat transaksi bersamaan.
- Riwayat medis hewan dapat dibaca lintas cabang oleh pihak berizin.
- Pemilik hewan melihat kondisi hewan, vaksinasi, dan tagihannya tanpa menghubungi klinik.
- Tidak ada kebocoran data antar cabang maupun antar pemilik hewan.

## 12 modul, 72 fitur

M01 Organisasi dan Akses (8), M02 Pelanggan dan Hewan (5), M03 Pelayanan Klinik (6), M04 Rekam Medis dan Vaksinasi (8), M05 Rawat Inap (6), M06 Katalog dan Harga (4), M07 Pet Shop (3), M08 Inventori (7), M09 Pengadaan (3), M10 Kasir Tagihan dan Pembayaran (8), M11 Laporan dan Dashboard (7), M12 Pet Owner Portal (7).

## Arah visual

Konsep UI/UX bergaya Apple (Apple Human Interface Guidelines): kejelasan, hierarki tegas, ruang kosong lega, fokus pada konten, kontrol yang terasa alami.

- Font sistem: `-apple-system`, `BlinkMacSystemFont`, `SF Pro Text` bila tersedia, fallback `system-ui`. Skala 34, 28, 22, 17, 15, 13, 12 px.
- Warna aksen utama teal: terang `#0A7A78`, gelap `#4FD1CC`.
- Logo: wordmark teks "PETORA" dalam font sistem semi-bold. Tanpa ilustrasi atau ikon hewan sebagai logo.
- Target sentuh minimal 44 px. Tinggi baris tabel 44 px.
- Mode terang dan gelap mengikuti pengaturan sistem.
- Setiap layar punya empat keadaan: kosong, memuat, galat, sukses.
