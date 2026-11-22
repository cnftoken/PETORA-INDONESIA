# FITUR: PETORA

72 fitur dalam 12 modul. Setiap butir: ID, deskripsi, kriteria selesai, status, lokasi kode, nama tes. Sumber: `BRIEF.md` bagian 5. Status: `belum` = belum diimplementasi.

## M01. Organisasi dan Akses (8 fitur)

| ID | Fitur | Deskripsi | Kriteria selesai | Status | Lokasi kode | Nama tes |
|---|---|---|---|---|---|---|
| M01-F01 | Profil perusahaan dan setup awal | Nama, alamat, NPWP, logo. Tampil di cetakan tagihan. Hanya Owner. Skrip setup membuat perusahaan, cabang pertama, dan Owner pertama. | Setup berjalan, perusahaan dan Owner pertama terbentuk | siap | `src/modules/organization/` | `m01-f01-company-setup` |
| M01-F02 | Cabang | Kode unik (2-5 huruf besar dan angka), nama, alamat, telepon, zona waktu, status aktif. Cabang nonaktif tidak bisa transaksi baru. | Cabang bisa ditambah, diedit, dinonaktifkan | siap | `src/modules/organization/` | `m01-f02-branch` |
| M01-F03 | Pengguna | Undang lewat email, aktif/nonaktif, atur ulang kata sandi. Tidak ada penghapusan permanen. Owner terakhir tidak bisa dinonaktifkan. | Pengguna bisa diundang, dinonaktifkan, password di-reset | siap | `src/modules/organization/` | `m01-f03-user` |
| M01-F04 | Role | Empat role tetap: Owner, Supervisor, Dokter, Staff. Owner mengatur permission Supervisor dan Dokter per role. | Role tetap, permission diatur per role | siap | `src/modules/organization/` | `m01-f04-role` |
| M01-F05 | Permission dan templat Staff | Permission per kelompok sesuai matriks BRIEF bagian 3. Templat Resepsionis, Kasir, Perawat, Gudang. Tanpa permission tidak melihat menu dan ditolak di database. | Permission diterapkan, ditolak di DB | siap | `src/modules/organization/` | `m01-f05-permission` |
| M01-F06 | Penugasan cabang | Pengguna ditugaskan ke satu atau lebih cabang, memilih cabang aktif. Tidak bisa bertindak di cabang yang tidak ditugaskan. | Penugasan cabang bekerja, aktif dipilih | siap | `src/modules/organization/` | `m01-f06-branch-assignment` |
| M01-F07 | Pengaturan perusahaan | PPN dan pembulatan (BR-020, BR-021), ambang peringatan kedaluwarsa (default 30 hari). Tarif punya tanggal berlaku. Perubahan tidak mengubah tagihan lama, tercatat audit. | Pengaturan tersimpan, tagihan lama tidak berubah | siap | `src/modules/organization/` | `m01-f07-company-settings`, `br-020-vat`, `br-021-rounding` |
| M01-F08 | Log audit | Penampil hanya-baca dengan filter pengguna, cabang, entitas, rentang waktu. Tidak bisa diubah/dihapus lewat aplikasi. | Log audit ditampilkan, read-only | siap | `src/modules/organization/` | `m01-f08-audit-log`, `br-014-audit-trail` |

## M02. Pelanggan dan Hewan (5 fitur)

| ID | Fitur | Deskripsi | Kriteria selesai | Status | Lokasi kode | Nama tes |
|---|---|---|---|---|---|---|
| M02-F01 | Data pelanggan | Nama, telepon (wajib, internasional), email, alamat, catatan. Nomor telepon sama tidak bisa didaftarkan dua kali. | Pelanggan bisa didaftar, telepon unik | siap | `src/modules/customers/` | `br-003-cross-branch-medical` |
| M02-F02 | Pencarian lintas cabang | Cari nama, telepon, nama hewan, nomor pasien. Hasil < 1 detik pada 50.000 data. | Pencarian cepat, lintas cabang | siap | `src/modules/customers/` | `br-003-cross-branch-medical` |
| M02-F03 | Profil hewan | Nomor pasien unik, nama, jenis, ras, kelamin, steril, lahir/umur, warna/ciri, microchip, foto, status, pemilik. Satu pemilik banyak hewan. | Profil hewan lengkap, transfer pemilik | siap | `src/modules/customers/` | `br-003-cross-branch-medical` |
| M02-F04 | Timeline riwayat | Kronologi kunjungan, tindakan, vaksin, rawat inap, tagihan lintas cabang, tiap baris cabang asal. | Timeline ditampilkan per cabang asal | belum | `src/modules/customers/` | `br-003-cross-branch-medical` |
| M02-F05 | Lampiran dan foto hewan | Storage, JPG/PNG/PDF, maks 10 MB, tautan bertanda signed berumur pendek, divalidasi server dan klien. | Lampiran tersimpan dan diakses aman | belum | `src/modules/customers/` | `br-003-cross-branch-medical` |

## M03. Pelayanan Klinik (6 fitur)

| ID | Fitur | Deskripsi | Kriteria selesai | Status | Lokasi kode | Nama tes |
|---|---|---|---|---|---|---|
| M03-F01 | Pendaftaran kunjungan | Pilih pelanggan dan hewan, keluhan, dokter tujuan, jenis layanan. Nomor kunjungan saat pendaftaran (BR-022). Status awal "terdaftar". | Kunjungan terdaftar, nomor diberikan | belum | `src/modules/clinic/` | `br-022-document-numbering` |
| M03-F02 | Antrean | Daftar menunggu per cabang dan dokter, panggil, lewati. Realtime tanpa muat ulang. | Antrean berfungsi, realtime | belum | `src/modules/clinic/` | `br-001-branch-isolation` |
| M03-F03 | Pemeriksaan dan tindakan | Dokter memulai pemeriksaan, status "diperiksa", tagihan draft otomatis. Tindakan masuk draft dengan salinan harga/pajak. Tandai "selesai". | Pemeriksaan dan tagihan draft | belum | `src/modules/clinic/` | `br-009-unified-invoice` |
| M03-F04 | Resep dan obat | Dokter menulis resep dari katalog (dosis, aturan pakai, jumlah). Obat masuk draft tagihan. Stok berkurang saat finalisasi. Jika tidak cukup, ditolak. | Resep masuk draft, stok dicek saat finalisasi | belum | `src/modules/clinic/` | `br-006-no-negative-stock`, `br-024-stock-decrement` |
| M03-F05 | Perubahan status kunjungan | Alur: terdaftar → menunggu → diperiksa → selesai. Pembatalan hanya sebelum diperiksa, wajib beralasan. | Status berubah sesuai alur | belum | `src/modules/clinic/` | `br-001-branch-isolation` |
| M03-F06 | Daftar dan riwayat kunjungan | Cari dan filter tanggal (zona cabang), status, dokter, pelanggan. | Daftar kunjungan dengan filter | belum | `src/modules/clinic/` | `br-016-timezone` |

## M04. Rekam Medis dan Vaksinasi (8 fitur)

| ID | Fitur | Deskripsi | Kriteria selesai | Status | Lokasi kode | Nama tes |
|---|---|---|---|---|---|---|
| M04-F01 | Entri medis | Anamnesis dan pemeriksaan fisik terstruktur per kunjungan. Hanya Dokter. Draft tersimpan otomatis. Berat terbaru perbarui profil hewan. | Entri medis bisa dibuat, draft otomatis | belum | `src/modules/medical-records/` | `br-004-medical-entry-lock` |
| M04-F02 | Diagnosis dan rencana terapi | Diagnosis teks dengan saran yang pernah dipakai, rencana terapi. Diagnosis bisa dicari. Tanpa kode eksternal. | Diagnosis dan rencana tersimpan | belum | `src/modules/medical-records/` | `br-004-medical-entry-lock` |
| M04-F03 | Lampiran medis | Hasil lab, foto, dokumen. Tipe/ukuran sama M02-F05. Akses mengikuti permission medis. | Lampiran medis tersimpan dan diakses | belum | `src/modules/medical-records/` | `br-004-medical-entry-lock` |
| M04-F04 | Penguncian entri | Finalisasi mengunci entri. Upaya mengubah entri final ditolak di database. | Entri final tidak bisa diubah | belum | `src/modules/medical-records/` | `br-004-medical-entry-lock` |
| M04-F05 | Addendum | Koreksi/tambah dengan penulis, waktu, alasan. Entri asli utuh. Addendum tampil berurutan. | Addendum ditambahkan, asli utuh | belum | `src/modules/medical-records/` | `br-014-audit-trail` |
| M04-F06 | Vaksinasi | Jenis, merek/batch, tanggal, dokter. Jenis vaksin dan interval booster dibuat Owner dan Dokter. Item tagihan. Muncul di profil dan portal. | Vaksinasi dicatat, jadi item tagihan | belum | `src/modules/medical-records/` | `br-013-vaccine-interval` |
| M04-F07 | Pengingat booster | Daftar hewan jatuh tempo, filter rentang tanggal dan cabang, dari interval. Dokter ubah interval per kasus. | Daftar booster jatuh tempo | belum | `src/modules/medical-records/` | `br-013-vaccine-interval` |
| M04-F08 | Tandai "dibagikan" | Dokter memilih entri yang tampil di portal, bisa mencabut. Tidak dibagikan tidak terbaca portal, diuji di DB. | Visibilitas portal sesuai tandai | belum | `src/modules/medical-records/` | `br-005-portal-visibility` |

## M05. Rawat Inap (6 fitur)

| ID | Fitur | Deskripsi | Kriteria selesai | Status | Lokasi kode | Nama tes |
|---|---|---|---|---|---|---|
| M05-F01 | Check-in | Dari kunjungan. Waktu check-in, alasan, kandang, dokter, perkiraan lama. Tarif kandang dikunci. Tagihan draft sendiri terpisah dari kunjungan awal. | Check-in membuat tagihan draft terpisah | belum | `src/modules/inpatient/` | `br-009-unified-invoice` |
| M05-F02 | Manajemen kandang | Daftar kandang per cabang: kode, tipe, tarif harian, status. Satu kandang satu hewan. Perpindahan tercatat. | Kandang dikelola, perpindahan tercatat | belum | `src/modules/inpatient/` | `br-001-branch-isolation` |
| M05-F03 | Catatan perkembangan harian | Kondisi, tanda vital, makan, minum, eliminasi, catatan, foto. Perawat atau Dokter, stempel waktu dan penulis. Bisa ditandai dibagikan. | Catatan harian tercatat | belum | `src/modules/inpatient/` | `br-005-portal-visibility` |
| M05-F04 | Pemberian obat dan tindakan | Jadwal dan realisasi: siapa, kapan, dosis. Stok berkurang saat dicatat, masuk draft tagihan rawat inap. Pembatalan hanya Dokter dengan alasan, kembalikan stok. | Pemberian obat mencatat stok | belum | `src/modules/inpatient/` | `br-006-no-negative-stock`, `br-024-stock-decrement` |
| M05-F05 | Biaya kandang dan deposit | Per 24 jam sejak check-in (BR-012). Deposit sebagai pembayaran "deposit", dialokasikan saat finalisasi, sisa dikembalikan refund. | Biaya kandang dan deposit bekerja | belum | `src/modules/inpatient/` | `br-012-kennel-cost`, `br-011-void-return-refund` |
| M05-F06 | Check-out | Status akhir: pulang, dirujuk, meninggal. Tagihan rawat inap difinalkan, biaya kandang final, deposit dialokasi, ringkasan perawatan. Kandang "dibersihkan". Meninggal perbarui profil hewan. | Check-out finalisasi tagihan | belum | `src/modules/inpatient/` | `br-012-kennel-cost` |

## M06. Katalog dan Harga (4 fitur)

| ID | Fitur | Deskripsi | Kriteria selesai | Status | Lokasi kode | Nama tes |
|---|---|---|---|---|---|---|
| M06-F01 | Produk | SKU unik, nama, kategori, satuan, barcode, harga jual, harga beli terakhir, penanda berbatch/kedaluwarsa, stok minimum, status kena pajak. Dinonaktifkan, tidak dihapus. | Produk bisa dibuat, dicari, dinonaktifkan | siap | `src/modules/catalog/` | `br-007-fefo` |
| M06-F02 | Layanan dan tindakan | Konsultasi, vaksinasi, operasi, dll dengan harga, status kena pajak, pelaksana. Dinonaktifkan, tidak dihapus. | Layanan bisa dibuat dan dinonaktifkan | siap | `src/modules/catalog/` | `br-020-vat` |
| M06-F03 | Kategori dan riwayat harga | Kategori satu tingkat. Harga seragam semua cabang. Setiap perubahan harga tercatat dengan tanggal berlaku. | Kategori dan riwayat harga | siap | `src/modules/catalog/` | `br-020-vat` |
| M06-F04 | Status pajak per item | Penanda kena/tidak kena PPN per produk dan layanan. Perubahan tidak mengubah tagihan lama. | Status pajak per item | siap | `src/modules/catalog/` | `br-020-vat` |

## M07. Pet Shop (3 fitur)

| ID | Fitur | Deskripsi | Kriteria selesai | Status | Lokasi kode | Nama tes |
|---|---|---|---|---|---|---|
| M07-F01 | Katalog jual | Tampilan produk di kasir: cari, pindai barcode, filter kategori, stok cabang. Hanya produk aktif. | Katalog jual menampilkan produk aktif | belum | `src/modules/petshop/` | `br-006-no-negative-stock` |
| M07-F02 | Penjualan retail | Keranjang, pelanggan (kosong bila umum), tagihan, pembayaran. Satu penjualan satu tagihan. Stok berkurang saat finalisasi. | Penjualan retail membuat tagihan | belum | `src/modules/petshop/` | `br-009-unified-invoice`, `br-024-stock-decrement` |
| M07-F03 | Retur penjualan | Retur item dengan alasan, tidak melebihi terjual. Stok kembali atau dibuang "rusak". Pengembalian dana BR-011. | Retur penjualan mengembalikan stok | belum | `src/modules/petshop/` | `br-011-void-return-refund` |

## M08. Inventori (7 fitur)

| ID | Fitur | Deskripsi | Kriteria selesai | Status | Lokasi kode | Nama tes |
|---|---|---|---|---|---|---|
| M08-F01 | Stok per cabang | Saldo per produk per cabang dengan pencarian. Saldo sama dengan jumlah mutasi, diuji. | Saldo stok akurat per cabang | belum | `src/modules/inventory/` | `br-006-no-negative-stock` |
| M08-F02 | Batch dan kedaluwarsa | Penerimaan mencatat batch dan kedaluwarsa. Pengurangan FEFO. Batch kedaluwarsa tidak bisa dijual. | Batch dan kedaluwarsa tercatat | belum | `src/modules/inventory/` | `br-007-fefo` |
| M08-F03 | Penyesuaian stok | Koreksi dengan alasan. Gudang ajukan, Supervisor/Owner setujui. Tidak bisa stok minus. | Penyesuaian stok dengan approval | belum | `src/modules/inventory/` | `br-006-no-negative-stock` |
| M08-F04 | Kartu stok | Riwayat mutasi per produk dan batch dengan saldo berjalan. Tiap baris menunjuk dokumen sumber. | Kartu stok ditampilkan | belum | `src/modules/inventory/` | `br-024-stock-decrement` |
| M08-F05 | Transfer antar cabang | Stok asal berkurang saat dikirim, tujuan bertambah saat diterima, batch/kedaluwarsa terbawa, dalam perjalanan tercatat, selisih ditinjau. | Transfer stok berfungsi | belum | `src/modules/inventory/` | `br-017-stock-transfer` |
| M08-F06 | Peringatan stok minimum dan kedaluwarsa | Daftar produk di bawah stok minimum dan batch kedaluwarsa dalam hari (default 30). Dashboard Gudang, Supervisor, Owner. | Peringatan stok ditampilkan | belum | `src/modules/inventory/` | `br-007-fefo` |
| M08-F07 | Stock opname | Sesi penghitungan fisik per cabang. Produk terkunci sampai sesi ditutup. Selisih jadi penyesuaian setelah disetujui. | Stock opname berjalan | belum | `src/modules/inventory/` | `br-023-stock-opname` |

## M09. Pengadaan (3 fitur)

| ID | Fitur | Deskripsi | Kriteria selesai | Status | Lokasi kode | Nama tes |
|---|---|---|---|---|---|---|
| M09-F01 | Pemasok | Nama, kontak, alamat, catatan, status aktif. Dinonaktifkan, tidak dihapus. | Pemasok bisa dibuat dan dinonaktifkan | belum | `src/modules/procurement/` | `br-001-branch-isolation` |
| M09-F02 | Pesanan pembelian | Per cabang: item, jumlah, harga beli. Status draft → dipesan → diterima sebagian → diterima, atau dibatalkan. Tidak bisa diubah setelah dipesan kecuali dibatalkan. Nomor saat dipesan. | PO dengan alur status | belum | `src/modules/procurement/` | `br-022-document-numbering` |
| M09-F03 | Penerimaan barang | Penuh atau sebagian, batch, kedaluwarsa, harga beli aktual. Tambah stok atomik, update harga beli terakhir. Tidak melebihi sisa PO. | Penerimaan menambah stok | belum | `src/modules/procurement/` | `br-024-stock-decrement` |

## M10. Kasir, Tagihan, dan Pembayaran (8 fitur)

| ID | Fitur | Deskripsi | Kriteria selesai | Status | Lokasi kode | Nama tes |
|---|---|---|---|---|---|---|
| M10-F01 | Tagihan terpadu | Header: pelanggan, hewan, sumber, cabang, nomor. Baris: layanan, tindakan, obat, produk, kandang. Finalisasi oleh Kasir mengunci baris, nomor, kurangi stok, status "belum lunas". | Tagihan terpadu dengan baris | belum | `src/modules/billing/` | `br-009-unified-invoice`, `br-022-document-numbering`, `br-024-stock-decrement` |
| M10-F02 | Diskon | Per baris, persen atau nominal, wajib beralasan, hanya permission diskon (Supervisor, Owner). | Diskon per baris dengan alasan | belum | `src/modules/billing/` | `br-025-discount` |
| M10-F03 | PPN | Per tagihan setelah diskon. Baris terpisah. Dua contoh perhitungan BRIEF bagian 7 harus sama persis. | PPN dihitung dengan benar | belum | `src/modules/billing/` | `br-020-vat` |
| M10-F04 | Pembulatan | Pada total akhir setelah PPN. Baris "Pembulatan" terpisah, positif atau negatif. | Pembulatan dihitung dengan benar | belum | `src/modules/billing/` | `br-021-rounding` |
| M10-F05 | Pembayaran manual | Tunai, transfer, QRIS, kartu. Metode, jumlah, waktu, referensi. Tunai: uang diterima dan kembalian. Tidak tercatat ganda. | Pembayaran manual dicatat | belum | `src/modules/billing/` | `br-018-manual-payment` |
| M10-F06 | Pembayaran sebagian dan deposit | Belum lunas → sebagian → lunas dengan sisa benar. Non-tunai tidak melebihi sisa. Deposit rawat inap M05-F05. | Pembayaran sebagian dan lunas | belum | `src/modules/billing/` | `br-010-partial-payment` |
| M10-F07 | Void, retur, dan refund | Kasir ajukan, Supervisor/Owner setujui. Wajib beralasan. Stok kembali. Tagihan final tidak dihapus. | Void/retur/refund bekerja | belum | `src/modules/billing/` | `br-011-void-return-refund` |
| M10-F08 | Cetak tagihan dan kuitansi | Cetak browser A4 dan struk 80 mm: logo, nama cabang, nomor, tanggal zona cabang, rincian, PPN, pembulatan, pembayaran, sisa. Cetak ulang tanda "Salinan". | Cetak tagihan dan kuitansi | belum | `src/modules/billing/` | `br-020-vat`, `br-021-rounding` |

## M11. Laporan dan Dashboard (7 fitur)

| ID | Fitur | Deskripsi | Kriteria selesai | Status | Lokasi kode | Nama tes |
|---|---|---|---|---|---|---|
| M11-F01 | Dashboard per peran | Owner/Supervisor: penjualan hari ini dan 30 hari, kunjungan, tagihan belum lunas, stok minimum, batch kedaluwarsa. Dokter: antrean, rawat inap, booster 7 hari. Staff: kartu sesuai templat. | Dashboard per role | belum | `src/modules/reports/` | `br-016-timezone` |
| M11-F02 | Laporan penjualan | Per periode, cabang, kategori, produk/layanan. Penjualan = total tagihan final tidak void sebelum PPN dan pembulatan. | Laporan penjualan akurat | belum | `src/modules/reports/` | `br-016-timezone` |
| M11-F03 | Laporan kunjungan | Jumlah, jenis layanan, dokter, status. | Laporan kunjungan | belum | `src/modules/reports/` | `br-016-timezone` |
| M11-F04 | Laporan stok | Saldo, pergerakan, kedaluwarsa, nilai persediaan dari harga beli batch. | Laporan stok | belum | `src/modules/reports/` | `br-016-timezone` |
| M11-F05 | Laporan pembayaran per metode | Per hari, kasir, cabang: tunai, transfer, QRIS, kartu, termasuk refund. | Laporan pembayaran | belum | `src/modules/reports/` | `br-018-manual-payment` |
| M11-F06 | Laporan pajak dan pembulatan | Dasar pajak, PPN, selisih pembulatan per periode dan cabang. | Laporan pajak dan pembulatan | belum | `src/modules/reports/` | `br-020-vat`, `br-021-rounding` |
| M11-F07 | Konsolidasi lintas cabang | Perbandingan antar cabang untuk Owner. Batas hari mengikuti zona masing-masing cabang. | Konsolidasi lintas cabang | belum | `src/modules/reports/` | `br-016-timezone` |

## M12. Pet Owner Portal (7 fitur, hanya untuk melihat)

| ID | Fitur | Deskripsi | Kriteria selesai | Status | Lokasi kode | Nama tes |
|---|---|---|---|---|---|---|
| M12-F01 | Akun lewat undangan | Klinik undang lewat email. Pemilik atur kata sandi, masuk. Akun terikat ke satu pelanggan. Pemilik atur kata sandi sendiri. | Akun portal terikat pelanggan | belum | `src/modules/owner-portal/` | `br-015-portal-account-binding` |
| M12-F02 | Profil hewan | Daftar hewan miliknya dengan foto, data dasar, berat terakhir. Meninggal tetap tampil dengan status "Meninggal". | Profil hewan di portal | belum | `src/modules/owner-portal/` | `br-015-portal-account-binding` |
| M12-F03 | Riwayat pemeriksaan | Daftar kunjungan dengan ringkasan yang dibagikan, lintas cabang. | Riwayat pemeriksaan di portal | belum | `src/modules/owner-portal/` | `br-005-portal-visibility` |
| M12-F04 | Rekam medis yang diizinkan | Detail entri dan lampiran yang ditandai "dibagikan" saja. | Rekam medis yang dibagikan | belum | `src/modules/owner-portal/` | `br-005-portal-visibility` |
| M12-F05 | Vaksinasi | Riwayat vaksin dan jadwal berikutnya. | Vaksinasi di portal | belum | `src/modules/owner-portal/` | `br-013-vaccine-interval` |
| M12-F06 | Tagihan | Daftar dan rincian tagihan final: baris, PPN, pembulatan, pembayaran, sisa. Tanpa tombol bayar. Belum lunas: "Pembayaran dilakukan di klinik". Bisa dicetak. | Tagihan di portal tanpa bayar | belum | `src/modules/owner-portal/` | `br-019-portal-read-only` |
| M12-F07 | Perkembangan rawat inap | Status terkini, catatan harian dan foto yang dibagikan. | Perkembangan rawat inap di portal | belum | `src/modules/owner-portal/` | `br-005-portal-visibility` |

**Total: 72 fitur, 15 fitur status `siap` (M01: 8, M06: 4, M02: 3), 57 fitur status `belum`.**
