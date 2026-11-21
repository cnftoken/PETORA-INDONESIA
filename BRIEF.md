# BRIEF PROYEK: PETORA

> **Cara membaca status keputusan**
> - **Dikonfirmasi**: sudah diputuskan pemilik produk. Agent tidak boleh mengubahnya.
> - **[ASUMSI]**: default sementara agar agent bisa langsung bekerja. Agent mencatatnya di `docs/PRODUK.md` dan boleh dikoreksi kapan saja.
> - **[USULAN]**: fitur tambahan di luar deskripsi awal. Dikerjakan hanya jika tidak dicoret oleh pemilik produk.
>
> Daftar lengkap asumsi dan usulan ada di bagian 19.

---

## 0. Identitas

- Nama proyek: PETORA
- Jenis: proyek baru
- Bahasa antarmuka pengguna: Bahasa Indonesia **[ASUMSI]**
- Bahasa dokumentasi: Bahasa Indonesia. Kode, nama tabel, dan identifier dalam bahasa Inggris.
- Versi target: v1 (seluruh fitur "Wajib v1" di bagian 4)

## 1. Ringkasan dan sasaran

- **Produk dalam satu kalimat:** aplikasi web operasional terintegrasi untuk mengelola seluruh aktivitas bisnis klinik hewan dan pet shop dalam satu sistem terpusat, dengan satu perusahaan yang dapat memiliki banyak cabang. *(Dikonfirmasi)*
- **Cakupan fungsional:** operasional klinik, pelayanan kesehatan hewan, manajemen pelanggan, persediaan, penjualan produk, transaksi, pembayaran, dan pemantauan perkembangan hewan, saling terintegrasi dalam satu platform. *(Dikonfirmasi)*
- **Konsep:** *Single Company, Multi-Branch*. Seluruh cabang berada dalam satu ekosistem data terpusat, dengan akses, kewenangan, dan ruang lingkup operasional per cabang. *(Dikonfirmasi)*
- **Dua area fungsi:** *(Dikonfirmasi)*
  1. **Operational Application** untuk Owner, Supervisor, Dokter, dan Staff.
  2. **Pet Owner Portal** untuk pemilik hewan (hanya melihat).
- **Masalah yang diselesaikan:** operasional klinik hewan dan pet shop biasanya terpecah (pendaftaran, rekam medis, rawat inap, stok, kasir, laporan), sehingga data tidak sinkron, stok dan tagihan sulit ditelusuri, dan pemilik hewan tidak punya akses ke informasi hewannya.
- **Cara mengatasinya sekarang [ASUMSI]:** catatan manual, spreadsheet, dan aplikasi kasir terpisah.
- **Mengapa sekarang:** sistem harus siap untuk banyak cabang sejak awal implementasi, bukan ditambal belakangan.

**Sasaran yang bisa diukur:**
- Satu tagihan menampung seluruh layanan, obat, produk, dan biaya rawat inap dari satu kunjungan.
- Stok per cabang akurat dan tidak pernah minus, termasuk saat transaksi bersamaan.
- Riwayat medis hewan dapat dibaca lintas cabang oleh pihak berizin.
- Pemilik hewan dapat melihat kondisi hewan, vaksinasi, dan tagihannya tanpa menghubungi klinik.
- Tidak ada kebocoran data antar cabang atau antar pemilik hewan.

## 2. Pengguna, peran, dan permission

| Peran | Siapa | Tujuan utama | Perangkat | Kemahiran | Lingkup |
|---|---|---|---|---|---|
| Owner | Pemilik perusahaan | Memantau dan mengendalikan seluruh cabang | Desktop, HP | Sedang | Semua cabang |
| Supervisor | Penanggung jawab cabang **[ASUMSI]** | Mengendalikan operasional cabang dan menyetujui aksi sensitif | Desktop | Sedang | Cabang yang ditugaskan |
| Dokter | Dokter hewan | Memeriksa, mendiagnosis, merawat, mencatat | Desktop, tablet | Sedang | Cabang yang ditugaskan; riwayat medis lintas cabang |
| Staff | Resepsionis, kasir, perawat, petugas gudang | Menjalankan tugas harian | Desktop, tablet | Rendah-sedang | Cabang yang ditugaskan, sesuai permission |
| Pemilik hewan | Pelanggan klinik | Melihat informasi hewan miliknya | HP (utama) | Rendah | Hanya hewan miliknya, hanya yang dibagikan |

**Aturan peran:**
- **Staff adalah satu role** *(Dikonfirmasi)*. Fungsinya dibedakan oleh permission, bukan role terpisah. Tersedia templat permission bawaan (Resepsionis, Kasir, Perawat, Gudang) yang bisa diubah Owner per pengguna.
- Role dan permission dapat dikonfigurasi, bukan hardcode.
- Satu pengguna bisa ditugaskan ke satu atau lebih cabang, dan memilih cabang aktif saat bekerja **[ASUMSI]**.

**Matriks permission bawaan [ASUMSI]**, dapat diubah Owner. ✓ = akses penuh, L = lihat saja, — = tidak ada.

| Kelompok permission | Owner | Supervisor | Dokter | Resepsionis | Kasir | Perawat | Gudang |
|---|---|---|---|---|---|---|---|
| Pengaturan organisasi, pajak, role, pengguna | ✓ | L | — | — | — | — | — |
| Pelanggan dan hewan | ✓ | ✓ | ✓ | ✓ | L | L | — |
| Kunjungan dan antrean | L | ✓ | ✓ | ✓ | L | ✓ | — |
| Rekam medis (baca) | L | L | ✓ | — | — | L | — |
| Rekam medis (tulis, kunci, bagikan) | — | — | ✓ | — | — | — | — |
| Rawat inap: administrasi (check-in/out, kandang) | L | ✓ | ✓ | ✓ | — | ✓ | — |
| Rawat inap: catatan harian dan pemberian obat | L | L | ✓ | — | — | ✓ | — |
| Katalog dan harga | ✓ | ✓ | L | L | L | L | ✓ |
| Stok, batch, penyesuaian (mengajukan) | L | ✓ | L | — | L | L | ✓ |
| Persetujuan penyesuaian stok dan selisih transfer | — | ✓ | — | — | — | — | — |
| Transfer stok antar cabang | L | ✓ | — | — | — | — | ✓ |
| Pengadaan | L | ✓ | — | — | — | — | ✓ |
| Tagihan dan pembayaran | L | ✓ | L | L | ✓ | — | — |
| Persetujuan void, retur, dan diskon di atas batas | — | ✓ | — | — | — | — | — |
| Laporan | ✓ (semua cabang) | ✓ (cabangnya) | — | — | — | — | — |
| Log audit | ✓ | L | — | — | — | — | — |

## 3. Model data dan akses

**Tiga lapis akses**, semuanya ditegakkan di database (Row Level Security Supabase) dan bukan hanya di antarmuka:
1. **Permission**: apakah pengguna boleh melakukan aksi ini.
2. **Cabang**: apakah data ini milik cabang yang ditugaskan kepadanya (BR-001).
3. **Kepemilikan** (khusus portal): apakah hewan ini miliknya dan entri ini dibagikan (BR-015, BR-019).

**Cakupan data:**

| Data | Cakupan | Catatan |
|---|---|---|
| Perusahaan, cabang, role, permission, pengaturan pajak dan pembulatan | Seluruh perusahaan | Diatur Owner |
| Pengguna | Seluruh perusahaan | Dengan penugasan ke cabang |
| Pelanggan, hewan | Terpusat, dibaca lintas cabang | Sesuai permission |
| Kunjungan | Milik cabang tempat terjadi | Riwayat dibaca lintas cabang untuk pihak berizin medis |
| Rekam medis, vaksinasi | Ditulis di cabang pelayanan, **dibaca lintas cabang** | Tiap entri mencatat cabang asal (BR-003) |
| Rawat inap, kandang | Per cabang | |
| Katalog (produk, layanan, kategori) | Seluruh perusahaan | Harga dasar sama, bisa ditimpa per cabang **[ASUMSI]** |
| Stok, batch, mutasi stok | Per cabang | |
| Transfer stok | Melibatkan dua cabang | Terlihat oleh cabang asal dan tujuan |
| Pemasok | Seluruh perusahaan | |
| Pesanan pembelian, penerimaan | Per cabang | |
| Tagihan, pembayaran | Per cabang | |
| Akun portal | Terikat ke pelanggan | |
| Log audit | Seluruh perusahaan | Dibaca sesuai cabang |

**Penomoran dokumen (BR-022):** tiap cabang punya nomor unik dan berurutan untuk kunjungan, tagihan, pesanan pembelian, dan transfer, misalnya `JKT01-INV-2026-000123`.

**Waktu (BR-016):** waktu disimpan dalam UTC; tiap cabang punya zona waktu (WIB, WITA, WIT) dan semua tampilan serta batas hari laporan mengikuti zona cabang.

## 4. Modul dan fitur

**12 modul, 74 fitur.** Semua fitur "Wajib v1" kecuali yang bertanda **[USULAN]** (4 fitur). Kriteria selesai di bawah adalah syarat minimum yang harus punya tes otomatis. Definisi selesai umum mengikuti `AGENTS.md` bagian 7.

### M01. Organisasi dan Akses (8 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M01-F01 | Profil perusahaan | Nama, alamat, NPWP (opsional), logo. Tampil di cetakan tagihan. Hanya Owner yang mengubah. |
| M01-F02 | Cabang | Kode, nama, alamat, telepon, **zona waktu**, status aktif. Cabang baru ditambah lewat pengaturan tanpa mengubah kode dan langsung bisa ditugasi pengguna serta punya stok dan penomoran sendiri. Cabang nonaktif tidak bisa transaksi baru tetapi datanya tetap. |
| M01-F03 | Pengguna | Undang lewat email, aktif/nonaktif, atur ulang kata sandi, profil. Pengguna nonaktif tidak bisa masuk dan riwayatnya tetap utuh. Tidak ada penghapusan permanen. |
| M01-F04 | Role | Role bawaan Owner, Supervisor, Dokter, Staff. Owner mengatur permission tiap role. Role yang masih dipakai tidak bisa dihapus. |
| M01-F05 | Permission dan templat Staff | Permission granular per kelompok (bagian 2). Templat Resepsionis, Kasir, Perawat, Gudang. Pengguna tanpa permission tidak melihat menunya **dan** ditolak di database. |
| M01-F06 | Penugasan cabang | Pengguna ke satu atau lebih cabang; pengguna multi-cabang memilih cabang aktif dan seluruh data mengikuti. Tidak bisa bertindak di cabang yang tidak ditugaskan. |
| M01-F07 | Pengaturan pajak dan pembulatan | Sesuai BR-020 dan BR-021. Tarif punya tanggal berlaku. Perubahan tidak mengubah tagihan lama dan tercatat di audit. |
| M01-F08 | Log audit | Penampil hanya-baca dengan filter pengguna, cabang, entitas, dan rentang waktu. Mencakup semua perubahan di BR-014. Tidak bisa diubah atau dihapus lewat aplikasi. |

### M02. Pelanggan dan Hewan (6 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M02-F01 | Data pelanggan | Nama, telepon (wajib, dinormalisasi), email (opsional), alamat, catatan. Didaftarkan di cabang mana pun dan terlihat di semua cabang bagi pihak berizin. |
| M02-F02 | Pencarian lintas cabang | Cari berdasarkan nama, telepon, nama hewan, atau nomor pasien. Hasil kurang dari 1 detik pada 50.000 data **[ASUMSI target uji]**. |
| M02-F03 | Profil hewan | Nomor pasien unik, nama, jenis, ras, kelamin, status steril, tanggal lahir atau perkiraan umur, warna dan ciri, microchip (opsional), foto, status (aktif/meninggal), pemilik. Satu pemilik bisa punya banyak hewan. Perpindahan pemilik tercatat. |
| M02-F04 | Timeline riwayat | Kronologi kunjungan, tindakan, vaksin, rawat inap, dan tagihan lintas cabang, tiap baris menunjukkan cabang asal. Tampil sesuai permission pengguna. |
| M02-F05 | Lampiran dan foto hewan | Tersimpan di storage dengan akses terbatas. Tipe dan ukuran berkas divalidasi. Hanya yang berizin yang bisa melihat. |
| M02-F06 | Gabung data duplikat **[USULAN]** | Staff berizin menggabungkan dua data pelanggan yang sama. Semua hewan dan riwayat pindah, data lama diarsipkan, dan tercatat di audit. |

### M03. Pelayanan Klinik (6 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M03-F01 | Pendaftaran kunjungan | Pilih pelanggan dan hewan, keluhan awal, dokter tujuan (opsional), jenis layanan. Nomor kunjungan per cabang (BR-022). Jalur datang langsung saja, tanpa booking. Status awal "terdaftar". |
| M03-F02 | Antrean | Daftar menunggu per cabang dan per dokter, panggil, lewati. Perubahan status tampil ke pengguna lain di cabang yang sama tanpa muat ulang (realtime). |
| M03-F03 | Pemeriksaan dan tindakan | Dokter memulai pemeriksaan dan mencatat tindakan dari katalog. Tindakan masuk draft tagihan dengan harga dan pajak saat itu (snapshot), tercatat pelaksana dan waktunya. |
| M03-F04 | Resep dan obat | Dokter menulis resep dari katalog obat (dosis, aturan pakai, jumlah). Obat melebihi stok ditolak. Obat masuk tagihan, stok berkurang saat tagihan difinalkan. |
| M03-F05 | Perubahan status kunjungan | Alur status sesuai bagian 6. Pembatalan hanya sebelum diperiksa dan wajib beralasan. |
| M03-F06 | Daftar dan riwayat kunjungan | Cari dan filter kunjungan berdasarkan tanggal (mengikuti zona cabang), status, dokter, dan pelanggan. |

### M04. Rekam Medis dan Vaksinasi (8 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M04-F01 | Entri medis | Anamnesis dan pemeriksaan fisik terstruktur per kunjungan (berat, suhu, denyut, napas, kondisi umum, catatan). Hanya Dokter yang menulis. Draft tersimpan otomatis. Berat badan terbaru memperbarui profil hewan. |
| M04-F02 | Diagnosis dan rencana terapi | Satu atau lebih diagnosis (daftar bawaan yang bisa ditambah, atau teks bebas) dan rencana terapi. Diagnosis bisa dicari. |
| M04-F03 | Lampiran medis | Hasil laboratorium, foto, dokumen (PDF/JPG) terkait entri. Akses mengikuti permission medis. |
| M04-F04 | Penguncian entri | Finalisasi mengunci entri. Upaya mengubah entri final ditolak di database. |
| M04-F05 | Addendum | Koreksi atau tambahan dengan penulis, waktu, dan alasan. Entri asli tetap utuh dan addendum tampil berurutan. |
| M04-F06 | Vaksinasi | Catat jenis, merek/batch, tanggal, dokter. Daftar jenis vaksin beserta interval booster. Vaksin bisa jadi item tagihan. Muncul otomatis di profil hewan dan portal. |
| M04-F07 | Pengingat booster | Daftar hewan yang jatuh tempo (filter rentang tanggal dan cabang) dihitung dari interval (BR-013). Dokter bisa mengubah interval per kasus. Pengingat v1 hanya di dalam aplikasi. |
| M04-F08 | Tandai "dibagikan" | Dokter memilih entri yang tampil di portal dan bisa mencabutnya (BR-005). Entri yang tidak dibagikan tidak terbaca akun portal (diuji di level database). |

### M05. Rawat Inap (6 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M05-F01 | Check-in | Dari kunjungan; mencatat waktu check-in, alasan, kandang, dokter penanggung jawab, perkiraan lama. Waktu disimpan UTC dan tampil sesuai zona cabang. Tarif kandang saat itu dikunci. |
| M05-F02 | Manajemen kandang | Daftar kandang/ruang per cabang (kode, tipe, tarif harian, status: tersedia, terisi, dibersihkan). Satu kandang tidak bisa terisi dua hewan. Perpindahan kandang tercatat. |
| M05-F03 | Catatan perkembangan harian | Kondisi, tanda vital, makan, minum, eliminasi, catatan, foto opsional. Oleh Perawat atau Dokter, berstempel waktu dan penulis. Bisa ditandai "dibagikan" ke portal. |
| M05-F04 | Pemberian obat dan tindakan | Jadwal dan realisasi pemberian (siapa, kapan, dosis). Stok berkurang dan item masuk tagihan. |
| M05-F05 | Biaya kandang dan deposit | Biaya per 24 jam sejak check-in (BR-012). Deposit diterima di awal sebagai pembayaran di muka dan mengurangi sisa tagihan. Contoh 49 jam = 3 hari harus tepat. |
| M05-F06 | Check-out | Status akhir: pulang, dirujuk, meninggal. Ringkasan perawatan dibuat. Tagihan ditutup. Kandang berubah menjadi "dibersihkan". Status hewan meninggal memperbarui profilnya. |

### M06. Katalog dan Harga (4 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M06-F01 | Produk | Kode/SKU, nama, kategori, satuan, barcode (opsional), harga jual, harga beli terakhir, penanda berbatch/kedaluwarsa, stok minimum, status kena pajak. Bisa dicari dan dipindai. Dinonaktifkan, tidak dihapus. |
| M06-F02 | Layanan dan tindakan | Konsultasi, vaksinasi, operasi, dan lainnya dengan harga, status kena pajak, dan pelaksana (Dokter/Perawat). Dinonaktifkan, tidak dihapus. |
| M06-F03 | Kategori dan harga per cabang | Kategori satu tingkat. Harga dasar perusahaan, bisa ditimpa per cabang **[ASUMSI]**. Riwayat perubahan harga dengan tanggal berlaku. |
| M06-F04 | Status pajak per item | Penanda kena atau tidak kena PPN per produk dan layanan. Perubahan tidak mengubah tagihan lama (BR-020). |

### M07. Pet Shop (3 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M07-F01 | Katalog jual | Tampilan produk di kasir: cari, pindai barcode, filter kategori, stok cabang. Hanya produk aktif yang bisa dijual. |
| M07-F02 | Penjualan retail | Keranjang, pelanggan opsional, diskon, tagihan, pembayaran. Penjualan tanpa pasien menghasilkan tagihan dan mengurangi stok. |
| M07-F03 | Retur penjualan | Retur item dengan alasan, tidak melebihi jumlah terjual. Stok kembali atau dibuang bila rusak. Koreksi pembayaran lewat BR-011. |

### M08. Inventori (7 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M08-F01 | Stok per cabang | Saldo per produk per cabang dengan pencarian. Saldo selalu sama dengan jumlah seluruh mutasinya (diuji). |
| M08-F02 | Batch dan kedaluwarsa | Penerimaan mencatat nomor batch dan tanggal kedaluwarsa. Pengurangan memakai FEFO (BR-007). Batch kedaluwarsa tidak bisa dijual. |
| M08-F03 | Penyesuaian stok | Koreksi dengan alasan (rusak, hilang, kedaluwarsa dibuang). Gudang mengajukan, Supervisor menyetujui **[ASUMSI]**. Tidak bisa menyebabkan stok minus. |
| M08-F04 | Kartu stok | Riwayat mutasi per produk dan batch (masuk, keluar, transfer, penyesuaian, retur) dengan saldo berjalan. Tiap baris menunjuk dokumen sumber. |
| M08-F05 | Transfer antar cabang | Sesuai BR-017: draft → dikirim → diterima, atau dibatalkan. Stok asal berkurang saat dikirim, stok tujuan bertambah saat diterima, batch dan kedaluwarsa terbawa, barang "dalam perjalanan" tercatat, selisih penerimaan dicatat dan ditinjau Supervisor. |
| M08-F06 | Peringatan stok minimum dan kedaluwarsa **[USULAN]** | Daftar produk di bawah stok minimum dan batch yang mendekati kedaluwarsa (jumlah hari bisa diatur). Tampil di dashboard Gudang dan Supervisor. |
| M08-F07 | Stock opname **[USULAN]** | Sesi penghitungan fisik per cabang. Selisih tercatat dan menjadi penyesuaian setelah disetujui Supervisor (BR-023). |

### M09. Pengadaan (4 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M09-F01 | Pemasok | Nama, kontak, alamat, catatan; aktif/nonaktif. |
| M09-F02 | Pesanan pembelian | Dibuat per cabang, berisi item, jumlah, harga beli. Status draft → dipesan → diterima sebagian → diterima, atau dibatalkan. Tidak bisa diubah setelah dipesan kecuali dibatalkan. |
| M09-F03 | Penerimaan barang | Penuh atau sebagian, mencatat batch, kedaluwarsa, dan harga beli aktual. Menambah stok secara atomik dan memperbarui harga beli terakhir. Jumlah diterima tidak melebihi sisa pesanan. |
| M09-F04 | Retur ke pemasok **[USULAN]** | Kembalikan barang rusak atau salah kirim. Stok berkurang dan dicatat di kartu stok. |

### M10. Kasir, Tagihan, dan Pembayaran (8 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M10-F01 | Tagihan terpadu | Header (pelanggan, hewan, sumber: kunjungan/rawat inap/retail, cabang, nomor) dan baris (layanan, tindakan, obat, produk, kandang). Setiap sumber menghasilkan tagihan berbentuk sama. Baris menyimpan salinan harga dan pajak saat dibuat. |
| M10-F02 | Diskon | Per baris dan per tagihan, persen atau nominal, wajib beralasan. Batas diskon per peran diatur Owner. Di atas batas butuh persetujuan Supervisor. Sebelum batas diisi, diskon manual hanya oleh Supervisor **[ASUMSI]**. |
| M10-F03 | PPN | Sesuai BR-020. Dihitung dari dasar pajak setelah diskon. Tampil sebagai baris terpisah. Contoh perhitungan di bagian 6 harus tepat. |
| M10-F04 | Pembulatan | Sesuai BR-021. Dihitung pada total akhir setelah PPN dan tampil sebagai baris "Pembulatan" terpisah. |
| M10-F05 | Pembayaran manual | Sesuai BR-018: tunai, transfer, QRIS, kartu. Mencatat metode, jumlah, waktu, referensi (opsional). Tunai mencatat uang diterima dan kembalian. Tidak ada integrasi payment gateway. Aksi bayar tidak bisa tercatat ganda meski ditekan berulang. |
| M10-F06 | Pembayaran sebagian dan deposit | Status belum lunas → sebagian → lunas dengan sisa yang benar. Pembayaran non-tunai tidak boleh melebihi sisa. Deposit rawat inap dihitung sebagai pembayaran di muka. |
| M10-F07 | Void dan retur | Sesuai BR-011. Alasan wajib, persetujuan Supervisor di atas batas, pembatalan pembayaran, dan stok kembali bila perlu. Tagihan final tidak pernah dihapus. |
| M10-F08 | Cetak tagihan dan kuitansi | Tampilan cetak rapi (A4 dan lebar struk) dari browser: logo, cabang, nomor, tanggal sesuai zona cabang, rincian, PPN, pembulatan, pembayaran, sisa. Cetak ulang bertanda "Salinan". |

### M11. Laporan dan Dashboard (7 fitur)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M11-F01 | Dashboard per peran | Owner: omzet, kunjungan, stok kritis, tagihan belum lunas semua cabang. Supervisor: sama untuk cabangnya. Dokter: antrean dan pasien rawat inap. Staff: sesuai permission. |
| M11-F02 | Laporan penjualan | Per periode, cabang, kategori, produk/layanan. |
| M11-F03 | Laporan kunjungan | Jumlah, jenis layanan, dokter, status. |
| M11-F04 | Laporan stok | Saldo, pergerakan, kedaluwarsa, dan nilai persediaan dari harga beli batch **[ASUMSI]**. |
| M11-F05 | Laporan pembayaran per metode | Per hari, kasir, dan cabang untuk rekonsiliasi: tunai, transfer, QRIS, kartu. |
| M11-F06 | Laporan pajak dan pembulatan | Dasar pajak, PPN, dan selisih pembulatan per periode dan cabang. |
| M11-F07 | Konsolidasi lintas cabang | Perbandingan antar cabang untuk Owner. Batas hari mengikuti zona cabang. |

Semua laporan: angka sama dengan jumlah transaksi sumbernya, bisa diekspor ke CSV, dan hanya menampilkan data sesuai permission dan cabang.

### M12. Pet Owner Portal (7 fitur, hanya untuk melihat)

| ID | Fitur | Detail dan kriteria selesai |
|---|---|---|
| M12-F01 | Akun lewat undangan | Klinik mengundang pemilik lewat email **[ASUMSI]**. Pemilik mengatur kata sandi dan masuk. Akun terikat ke data pelanggan (BR-015). Pemilik dapat mengatur kata sandinya sendiri. |
| M12-F02 | Profil hewan | Daftar hewan miliknya dengan foto, data dasar, dan berat terakhir. Tidak melihat hewan milik orang lain. |
| M12-F03 | Riwayat pemeriksaan | Daftar kunjungan dengan ringkasan yang dibagikan, lintas cabang. |
| M12-F04 | Rekam medis yang diizinkan | Detail entri dan lampiran yang ditandai "dibagikan" saja (BR-005). |
| M12-F05 | Vaksinasi | Riwayat vaksin dan jadwal berikutnya. |
| M12-F06 | Tagihan | Daftar dan rincian tagihan: baris, PPN, pembulatan, pembayaran, sisa. Tanpa tombol bayar (BR-019). Bisa dicetak. Tagihan belum lunas memberi keterangan untuk membayar di klinik. |
| M12-F07 | Perkembangan rawat inap | Status terkini dan catatan harian serta foto yang dibagikan. |

## 5. Alur utama

- **Kunjungan klinik:**
  1. Staff mendaftarkan kunjungan (pelanggan dan hewan sudah ada, termasuk dari cabang lain, atau didaftarkan baru).
  2. Hewan masuk antrean; Dokter memanggil dan memeriksa dengan riwayat medis lintas cabang terlihat.
  3. Dokter mencatat rekam medis: anamnesis, diagnosis, tindakan, resep, vaksin bila ada, lalu mengunci entri.
  4. Tindakan dan obat masuk tagihan; stok obat berkurang saat tagihan difinalkan.
  5. Tagihan dihitung: subtotal → diskon → PPN (bila aktif) → pembulatan (bila aktif).
  6. Kasir mencatat pembayaran manual (penuh atau sebagian) dan mencetak bukti.
  7. Entri yang dibagikan Dokter, vaksinasi, dan tagihan muncul di portal pemilik (hanya lihat).
- **Rawat inap:**
  1. Dokter memutuskan rawat inap; Staff check-in dan menempatkan hewan di kandang (waktu check-in tercatat).
  2. Perawat dan Dokter mencatat perkembangan harian dan pemberian obat.
  3. Biaya kandang dihitung per 24 jam sejak check-in; biaya, tindakan, dan obat terakumulasi di satu tagihan; deposit bisa diterima di awal.
  4. Check-out (pulang, dirujuk, meninggal), tagihan dilunasi, ringkasan perawatan tersedia di portal bila dibagikan.
- **Pet shop:** Kasir memilih produk, menambah ke keranjang, menerima pembayaran manual, stok cabang berkurang.
- **Pengadaan:** Gudang membuat pesanan pembelian, barang diterima (batch dan kedaluwarsa dicatat), stok bertambah, harga beli diperbarui.
- **Transfer stok antar cabang:**
  1. Gudang cabang asal membuat transfer (barang, batch, jumlah, cabang tujuan).
  2. Transfer dikirim: stok asal berkurang, status "dalam perjalanan".
  3. Cabang tujuan menerima dan mengonfirmasi jumlah; stok tujuan bertambah dengan batch dan kedaluwarsa yang sama.
  4. Jika jumlah diterima berbeda, selisih dicatat dengan alasan dan ditinjau Supervisor.
- **Undangan portal:** Staff mengundang pemilik lewat email, pemilik membuat kata sandi, akun terikat ke pelanggan, pemilik melihat hewannya.
- **Void tagihan:** kasir mengajukan dengan alasan, Supervisor menyetujui, tagihan menjadi void, pembayaran dibatalkan, stok kembali bila perlu, semua tercatat di audit.
- **Alur alternatif:** kunjungan dibatalkan sebelum dilayani; pembayaran sebagian dilunasi di hari berikutnya; pesanan pembelian diterima sebagian; transfer dibatalkan sebelum dikirim; hewan dipindahkan antar kandang.
- **Saat gagal:** pembayaran ganda dicegah; stok tidak cukup menolak penjualan dengan pesan jelas; koneksi putus tidak membuat transaksi setengah tersimpan.

## 6. Aturan bisnis

| ID | Aturan | Kondisi | Hasil | Pengecualian | Status |
|---|---|---|---|---|---|
| BR-001 | Isolasi cabang | Pengguna mengakses data operasional (stok, transaksi, pembayaran, rawat inap) | Hanya data cabang yang ditugaskan kepadanya | Owner melihat semua cabang; pelanggan, hewan, rekam medis mengikuti BR-003 | Dikonfirmasi |
| BR-002 | Akses berbasis role dan permission | Pengguna melakukan aksi | Diizinkan hanya jika permission-nya ada; ditegakkan di database | — | Dikonfirmasi |
| BR-003 | Pelanggan, hewan, dan riwayat medis terpusat lintas cabang | Hewan dilayani di cabang mana pun | Pengguna dengan permission medis membaca riwayat medis lengkap semua cabang; tiap entri mencatat cabang asal | Penulisan rekam medis hanya di cabang tempat pelayanan; stok dan keuangan tetap per cabang | Dikonfirmasi |
| BR-004 | Rekam medis hanya ditulis Dokter | Entri dibuat atau diubah | Hanya Dokter; entri final terkunci | Koreksi lewat addendum bertanda waktu dan penulis | Asumsi |
| BR-005 | Visibilitas ke portal | Entri medis ingin dilihat pemilik | Tampil hanya jika ditandai "dibagikan" oleh Dokter | Vaksinasi dan tagihan pemilik tampil otomatis | Asumsi |
| BR-006 | Stok per cabang tidak boleh minus | Penjualan, pemakaian obat, pengiriman transfer | Ditolak bila stok tidak cukup; pengurangan atomik | Penyesuaian disetujui Supervisor, tetap tidak boleh membuat minus | Asumsi |
| BR-007 | FEFO | Barang berbatch dikurangi | Batch dengan kedaluwarsa terdekat dipakai lebih dulu | Barang tanpa kedaluwarsa | Asumsi |
| BR-008 | Uang bilangan bulat Rupiah | Semua perhitungan | Tanpa float; semua pembulatan eksplisit dan tercatat | — | Dikonfirmasi |
| BR-009 | Tagihan terpadu | Kunjungan atau rawat inap | Satu tagihan menampung jasa, tindakan, obat, produk, kandang | Penjualan retail murni tanpa pasien | Asumsi |
| BR-010 | Pembayaran boleh sebagian | Pelanggan membayar kurang dari total | Status "sebagian", sisa tercatat; lunas bila total terbayar | — | Asumsi |
| BR-011 | Transaksi final tidak dihapus | Ada kesalahan transaksi atau pembayaran | Dibatalkan lewat void atau retur dengan alasan | Di atas batas butuh persetujuan Supervisor | Asumsi |
| BR-012 | Biaya kandang per 24 jam sejak check-in | Hewan dirawat inap | Jumlah hari = durasi sejak waktu check-in dibagi 24 jam, dibulatkan ke atas, minimal 1 hari; biaya = tarif harian × jumlah hari | Contoh: check-in 10 Nov 14:00, check-out 12 Nov 15:00 = 49 jam = 3 hari | Dikonfirmasi (pembulatan ke atas untuk sisa kurang dari 24 jam: **[ASUMSI]**) |
| BR-013 | Jadwal vaksin ulang | Vaksin tercatat | Jatuh tempo dihitung dari jenis vaksin | Interval bisa diubah Dokter per kasus | Asumsi |
| BR-014 | Jejak audit | Perubahan rekam medis, transaksi, pembayaran, stok, pajak, role, permission | Dicatat siapa, kapan, apa yang berubah | — | Asumsi |
| BR-015 | Akun portal terikat kepemilikan | Pemilik membuat akun | Ditautkan ke pelanggan oleh klinik (undangan); hanya melihat hewan miliknya | Pemilik bersama: Nanti | Asumsi |
| BR-016 | Zona waktu mengikuti lokasi cabang | Semua waktu | Tiap cabang punya zona waktu (WIB/WITA/WIT); disimpan UTC, tampil sesuai zona cabang; batas "hari" laporan mengikuti zona cabang; konsolidasi menjumlahkan per hari lokal tiap cabang | — | Dikonfirmasi |
| BR-017 | Transfer stok antar cabang | Stok dipindah dari cabang asal ke tujuan | Status draft → dikirim → diterima, atau dibatalkan (hanya sebelum dikirim); stok asal berkurang saat dikirim, tujuan bertambah saat diterima; batch dan kedaluwarsa terbawa; barang dalam perjalanan tercatat; selisih dicatat dengan alasan dan ditinjau Supervisor | — | Dikonfirmasi |
| BR-018 | Pembayaran dicatat manual oleh kasir | Pelanggan membayar | Kasir mencatat metode (tunai, transfer, QRIS, kartu), jumlah, waktu, referensi (opsional); tunai mencatat uang diterima dan kembalian; tanpa payment gateway; pembayaran tercatat tidak diubah, hanya dibatalkan lewat BR-011 | Pembayaran non-tunai tidak boleh melebihi sisa tagihan | Dikonfirmasi |
| BR-019 | Portal hanya untuk melihat | Pemilik mengakses portal | Hanya membaca data hewan miliknya yang diizinkan; tagihan tampil (rincian, status, sisa) tanpa bayar online | Pemilik boleh mengatur akunnya sendiri (kata sandi) | Dikonfirmasi |
| BR-020 | PPN dapat dikonfigurasi | Tagihan dibuat | Pengaturan perusahaan: PPN aktif atau tidak, tarif, dan apakah harga katalog sudah termasuk pajak; tiap produk dan layanan ditandai kena atau tidak kena pajak; urutan: subtotal item → dikurangi diskon → dasar pajak → PPN; tagihan menyimpan salinan tarif dan nilai pajak saat dibuat; tarif tercatat dengan tanggal berlaku | Tidak ada tarif atau status PKP bawaan: default PPN nonaktif sampai Owner mengisinya | Dikonfirmasi |
| BR-021 | Pembulatan tagihan dapat dikonfigurasi | Total tagihan dihitung | Pengaturan perusahaan: tanpa pembulatan atau kelipatan Rp100, Rp500, Rp1.000 terdekat; dihitung pada total akhir setelah PPN; tampil sebagai baris "Pembulatan" (positif atau negatif) dan tercatat di laporan; tidak mengubah nilai PPN | Default: tanpa pembulatan | Dikonfirmasi |
| BR-022 | Penomoran dokumen | Kunjungan, tagihan, pesanan pembelian, transfer dibuat | Nomor unik dan berurutan per cabang per jenis dokumen, tanpa duplikat meski dibuat bersamaan; nomor tidak dipakai ulang, termasuk setelah void | Format contoh `JKT01-INV-2026-000123` | Asumsi |
| BR-023 | Stock opname | Sesi penghitungan fisik | Selisih terhadap saldo tercatat menjadi penyesuaian setelah disetujui Supervisor | — | Usulan |

- **Contoh perhitungan** (tarif PPN 10% hanya ilustrasi, bukan tarif yang berlaku; semua item kena pajak, harga belum termasuk pajak, pembulatan ke Rp500 terdekat): konsultasi Rp75.000 + vaksin Rp150.000 + obat 2 × Rp22.350 (Rp44.700) = subtotal Rp269.700 → PPN 10% Rp26.970 → Rp296.670 → pembulatan −Rp170 → **total Rp296.500**. DP Rp100.000 tunai → "sebagian", sisa Rp196.500. Hari berikutnya melunasi Rp196.500 → "lunas".
- **Status dan perpindahan yang boleh:**
  - Kunjungan: terdaftar → menunggu → diperiksa → selesai; atau dibatalkan (hanya sebelum diperiksa).
  - Rawat inap: dirawat → pulang / dirujuk / meninggal.
  - Tagihan: draft → belum lunas → sebagian → lunas; atau void (dengan persetujuan).
  - Pesanan pembelian: draft → dipesan → diterima sebagian → diterima; atau dibatalkan.
  - Transfer stok: draft → dikirim → diterima; atau dibatalkan (hanya sebelum dikirim).
  - Kandang: tersedia → terisi → dibersihkan → tersedia.
- **Kesalahan yang pernah terjadi di bisnis ini:** belum diketahui. Kasus uji wajib dari risiko umum: stok minus karena dua kasir menjual barang terakhir bersamaan; tagihan terbayar ganda karena tombol ditekan berulang; Dokter mengubah catatan Dokter lain; data operasional cabang A bocor ke staf cabang B; pemilik hewan melihat hewan milik orang lain; transfer yang diterima dua kali; stok hilang saat transfer terputus di tengah proses; tarif PPN berubah dan tagihan lama ikut berubah; pembulatan yang membuat total pembayaran dan tagihan tidak cocok; hari laporan bergeser untuk cabang di zona WITA/WIT.

## 7. Data

- **Objek utama:** perusahaan, pengaturan pajak dan pembulatan, cabang (dengan zona waktu), pengguna, penugasan cabang, role, permission, pelanggan, hewan, kunjungan, entri rekam medis, addendum, diagnosis, lampiran, vaksinasi, rawat inap, kandang, catatan harian, pemberian obat, produk, layanan, kategori, harga, batch stok, mutasi stok, penyesuaian, opname, transfer stok, pemasok, pesanan pembelian, penerimaan, tagihan, baris tagihan, pembayaran, akun portal, penghitung nomor dokumen, log audit.
- **Data sensitif:** data pribadi pemilik (nama, telepon, email, alamat), rekam medis hewan, data keuangan, kredensial. Perlakukan sebagai data pribadi sesuai UU Pelindungan Data Pribadi: akses dibatasi, tanpa data pribadi di log aplikasi, jejak audit untuk akses dan perubahan.
- **Jumlah cabang:** tidak dibatasi, ditambah lewat pengaturan.
- **Target uji beban [ASUMSI]:** 10 cabang, puluhan pengguna per cabang, 50.000 pelanggan dan hewan, ratusan transaksi per hari secara total.
- **Retensi:** rekam medis, transaksi, pembayaran, dan audit tidak dihapus permanen; "hapus" memakai arsip atau penghapusan lunak.
- **Data awal [ASUMSI]:** belum ada. Agent menyiapkan data contoh realistis dan jalur impor CSV untuk pelanggan, hewan, produk, dan stok awal bila diperlukan.
- **Data contoh pengembangan:** minimal tiga cabang (WIB, WITA, WIT), pengguna untuk tiap peran dan templat Staff, hewan beragam jenis, produk klinik dan pet shop, vaksin, dan tagihan dalam berbagai status.

## 8. Integrasi dan lingkungan

| Layanan | Untuk apa | Status |
|---|---|---|
| Supabase | Backend penuh: Postgres, Auth, Row Level Security, Storage, Realtime, fungsi server | Belum ada akun, perlu dibuatkan |
| Vercel atau Cloudflare | Hosting aplikasi web | Belum ada akun, perlu dibuatkan |
| Payment gateway | Pembayaran online | **Tidak ada** *(Dikonfirmasi)* |
| WhatsApp, SMS, email notifikasi | Pengingat ke pemilik | Tidak di v1 (email hanya untuk undangan dan atur ulang sandi) |
| Printer | Cetak | Hanya lewat cetak browser |

**Lingkungan [ASUMSI]:** lokal (Supabase CLI) dan produksi. Lingkungan staging terpisah dibuat bila anggaran mengizinkan. Konfigurasi hanya lewat variabel lingkungan; `.env.example` lengkap; service role key hanya di server.

## 9. Batasan dan persyaratan non-fungsional

- **Anggaran [ASUMSI]:** muat di tier gratis atau terendah Supabase dan hosting selama pengembangan dan tahap awal.
- **Keamanan (wajib, tidak bisa ditawar):**
  - Isolasi cabang dan hak akses ditegakkan dengan Row Level Security, bukan hanya di UI.
  - Akses lintas cabang untuk riwayat medis (BR-003) diatur RLS dan permission, tidak terbuka untuk semua.
  - Aksi sensitif (void, penyesuaian stok, perubahan role, perubahan pajak) berjalan di sisi server dengan jejak audit.
  - Tanpa secret di repo, query terparameterisasi, validasi di batas sistem, dependensi di-pin.
  - Berkas di storage hanya bisa diakses pihak berizin (tautan bertanda tangan berumur pendek).
- **Regulasi:** pelindungan data pribadi pemilik hewan; catatan keuangan dan pajak bisa diaudit. Perlakuan pajak tiap layanan dan produk ditentukan Owner bersama konsultan pajak, tidak diasumsikan sistem.
- **Perangkat:** browser modern di desktop dan tablet untuk operasional; portal mengutamakan HP. Semua layar responsif.
- **Performa [ASUMSI target uji]:** layar kasir interaktif kurang dari 2 detik di jaringan 4G; simpan tagihan kurang dari 1 detik pada 95% permintaan; pencarian pelanggan kurang dari 1 detik pada 50.000 data.
- **Ketersediaan dan pemulihan:** prosedur pencadangan dan pemulihan database dijelaskan di `DEPLOYMENT.md`. Ketersediaan pemulihan titik waktu bergantung pada paket Supabase yang dipakai.
- **Aksesibilitas:** navigasi keyboard penuh, kontras memadai, label formulir, dukungan teks besar, menghormati pengurangan gerakan.
- **Integritas:** semua operasi uang dan stok bersifat atomik, idempoten bila diulang, dan aman terhadap transaksi bersamaan.

## 10. Tampilan dan pengalaman pengguna

**Arah:** konsep UI/UX bergaya Apple *(Dikonfirmasi)*, merujuk pada prinsip Apple Human Interface Guidelines: kejelasan, hierarki yang tegas, ruang kosong yang lega, fokus pada konten, dan kontrol yang terasa alami.

**Sistem desain (dibuat sekali di Fase 0, dipakai semua modul):**
- **Tipografi:** font sistem (`-apple-system`, `SF Pro` bila tersedia, fallback `system-ui`). Skala konsisten sekitar 34/28/22/17/15/13/12 px. Angka uang dan tabel memakai tabular numerals dan rata kanan.
- **Spasi:** kelipatan 4 px (4, 8, 12, 16, 24, 32, 48).
- **Bentuk:** sudut membulat kontinu (kontrol 8 px, kartu 12 px, sheet 20 px), bayangan halus, efek kaca/blur hemat (bilah atas dan sheet).
- **Warna:** satu warna aksen utama, warna semantik (sukses, peringatan, bahaya, info), latar netral berlapis, mode terang dan gelap. Aksen bernuansa hangat dan tepercaya (misalnya teal atau hijau lembut), bukan gradien ungu-biru bawaan. Identitas visual PETORA ditetapkan agent dan dicatat di `PRODUK.md` **[ASUMSI]**.
- **Gerak:** 200-350 ms, mengikuti `prefers-reduced-motion`. Bermakna (transisi sheet, perubahan status), bukan hiasan.
- **Target sentuh:** minimal 44 px.
- **Ikon:** set open-source bergaya garis tipis yang serasi. **Tanpa** logo, SF Symbols, atau font berlisensi Apple.

**Pola tata letak:**
- **Operasional (desktop):** sidebar kiri yang bisa diciutkan, bilah atas dengan pencarian global dan pemilih cabang aktif, tampilan master-detail untuk daftar, sheet untuk formulir.
- **Tablet:** sidebar ringkas, target sentuh besar untuk Dokter dan Perawat.
- **Kasir:** layar fokus dua kolom (keranjang dan rincian di satu sisi, ringkasan total dan pembayaran di sisi lain), cepat dan minim klik.
- **Portal (HP):** navigasi tab bawah (Hewan, Riwayat, Tagihan, Akun), kartu hewan besar dengan foto, bahasa awam.
- **Komponen khas:** sheet dari bawah, segmented control, daftar bergrup, toggle, pencarian di atas, chip status.
- **Keadaan lengkap untuk setiap layar:** kosong (dengan tindakan yang jelas), memuat (kerangka), galat (dengan jalan keluar), dan sukses.

**Bahasa antarmuka:**
- Bahasa Indonesia sehari-hari yang sopan, ringkas, dan konkret. Operasional memakai istilah klinik yang lazim (anamnesis, diagnosis, rawat inap). Portal memakai bahasa awam, bukan istilah medis mentah.
- Contoh nada: "Stok tidak cukup. Tersisa 3 pcs di cabang ini." Bukan: "Terjadi kesalahan."
- Pesan galat selalu menjelaskan apa yang terjadi dan apa yang bisa dilakukan berikutnya.

**Yang dihindari:** tampilan dashboard template generik, gradien ungu-biru bawaan, emoji sebagai dekorasi, kartu seragam tanpa hierarki, teks isian klise ("Lorem ipsum", "Welcome to our platform"), data contoh klise.

## 11. Preferensi teknis

- **Deployment akhir:** Cloudflare atau Vercel untuk aplikasi + **Supabase sebagai full backend** (Postgres, Auth, RLS, Storage, Realtime, Edge Functions bila diperlukan) *(Dikonfirmasi)*.
- **Acuan default [ASUMSI]:** Next.js (App Router) dengan TypeScript di Vercel. Agent boleh memilih framework lain atau Cloudflare, dengan alasan dicatat di `docs/KEPUTUSAN.md`.
- **Sumber kebenaran perhitungan ada di database** (stok, transfer, tagihan, PPN, pembulatan, penomoran). Kode TypeScript hanya menampilkan hasilnya, agar tidak ada dua implementasi yang bisa berbeda angka.
- Migrasi database tersimpan di repo, kecil, dan bisa dijalankan ulang dari database kosong.
- Tipe TypeScript dihasilkan dari skema database.
- Satu aplikasi, bukan monorepo. Portal dan operasional dipisah sebagai route group.
- Tidak ada layanan tambahan di luar Supabase dan hosting tanpa alasan terukur.

## 12. Struktur repositori acuan dan kesiapan deployment

Ini acuan. Agent boleh menyesuaikannya dengan framework yang dipilih dan mencatat alasannya di `KEPUTUSAN.md`.

```
petora/
├── AGENTS.md · BRIEF.md · README.md · .env.example
├── package.json + lockfile + konfigurasi (ts, lint, format, test)
├── .github/workflows/ci.yml     # lint, type check, tes, tes DB, build
├── docs/
│   ├── PRODUK · FITUR · ATURAN-BISNIS · KEPUTUSAN
│   ├── KONVENSI · MASALAH · STATUS
│   └── DEPLOYMENT.md            # langkah rilis dan rollback
├── supabase/
│   ├── migrations/              # skema, RLS, fungsi (stok, tagihan, transfer)
│   ├── tests/                   # tes RLS dan fungsi database
│   ├── seed.sql                 # data contoh, 3 cabang beda zona waktu
│   └── config.toml
├── src/
│   ├── app/
│   │   ├── (operations)/        # aplikasi operasional
│   │   └── (portal)/            # portal pemilik hewan
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
│   ├── ui/                      # sistem desain gaya Apple (token, komponen dasar)
│   └── types/                   # tipe hasil generate dari skema DB
├── e2e/                         # Playwright: alur kritis
└── scripts/                     # seed, cek env, generate tipe
```

**Siap deployment berarti:**
- CI hijau: lint, tipe, tes unit, tes database, e2e, build.
- Migrasi bisa dijalankan ulang dari database kosong.
- `.env.example` lengkap dan service role key hanya di environment server.
- `seed.sql` tidak pernah berjalan di produksi.
- `DEPLOYMENT.md` memuat langkah rilis dan rollback yang sudah dicoba.
- README bisa diikuti dari nol oleh orang baru.

## 13. Strategi pengujian

**Lapisan:**
- **Tes database:** isolasi cabang (BR-001), permission (BR-002), akses lintas cabang (BR-003), visibilitas portal (BR-005, BR-015, BR-019), penguncian rekam medis (BR-004), stok, transfer, tagihan, dan penomoran. Setiap kombinasi peran dan cabang diuji.
- **Tes unit:** logika murni di sisi aplikasi (format, validasi, pemetaan).
- **Tes integrasi:** tiap modul terhadap database lokal.
- **Tes e2e (Playwright):** alur kritis: kunjungan sampai pembayaran sampai portal; rawat inap penuh; penjualan retail; pengadaan sampai stok; transfer antar cabang; undangan portal dan akses terbatas.

**Penamaan:** tes menyebut ID aturan yang diujinya, misalnya `BR-001-branch-isolation` atau `BR-021-rounding`.

**Skenario wajib:**
- Dua kasir menjual barang terakhir bersamaan (BR-006).
- Aksi bayar ditekan berulang (BR-018, idempotensi).
- Transfer terputus di tengah proses (BR-017).
- Tarif PPN berubah setelah tagihan dibuat (BR-020).
- Contoh perhitungan Rp296.500 dan variasinya, termasuk PPN sudah termasuk harga dan pembulatan bernilai negatif (BR-020, BR-021).
- Biaya kandang 49 jam = 3 hari dan batas tepat 24/48 jam (BR-012).
- Transaksi pukul 23:30 WIB, WITA, dan WIT jatuh di hari yang benar di laporan (BR-016).
- Pengguna cabang A mencoba membaca atau mengubah data cabang B lewat API langsung (BR-001).
- Akun portal mencoba membaca hewan atau entri yang tidak dibagikan (BR-005, BR-015).
- Dokter mencoba mengubah entri final atau milik Dokter lain (BR-004).

**Tes yang bermakna:** menguji perilaku, bukan implementasi; tes baru harus terbukti bisa gagal bila kodenya dirusak.

## 14. Rencana pengerjaan bertahap

Urutan mengikuti ketergantungan: tagihan membutuhkan katalog dan stok, klinik membutuhkan tagihan, portal membutuhkan semua data. Tiap fase selesai penuh (definisi selesai `AGENTS.md` bagian 7) sebelum fase berikutnya dimulai.

| Fase | Cakupan | Aturan terkait | Bergantung pada |
|---|---|---|---|
| 0 | Fondasi: repo, CI, lint, tipe, Supabase lokal, skema dasar, pola RLS dan audit, sistem desain, seed dasar | — | — |
| 1 | M01 Organisasi dan Akses | BR-001, 002, 014, 016, 020, 021 (pengaturan) | 0 |
| 2 | M06 Katalog dan Harga | BR-020 (status pajak) | 1 |
| 3 | M02 Pelanggan dan Hewan | BR-003 (data terpusat) | 1 |
| 4 | M08 Inventori (termasuk transfer) | BR-006, 007, 017, 023 | 1, 2 |
| 5 | M10 Kasir, Tagihan, Pembayaran | BR-008, 009, 010, 011, 018, 020, 021, 022 | 2, 3, 4 |
| 6 | M07 Pet Shop | — | 4, 5 |
| 7 | M09 Pengadaan | BR-022 | 2, 4 |
| 8 | M03 Pelayanan Klinik dan M04 Rekam Medis dan Vaksinasi | BR-003, 004, 005, 013 | 3, 5 |
| 9 | M05 Rawat Inap | BR-012 | 5, 8 |
| 10 | M11 Laporan dan Dashboard | BR-016 | 5 sampai 9 |
| 11 | M12 Pet Owner Portal | BR-005, 015, 019 | 8, 9 |
| 12 | Penguatan dan deployment: uji beban, uji keamanan, aksesibilitas, `DEPLOYMENT.md`, deploy | seluruh BR | semua |

Sebuah fase selesai jika semua fiturnya memenuhi definisi selesai, aturan terkait punya tes otomatis, dan `STATUS.md`, `FITUR.md`, serta `ATURAN-BISNIS.md` diperbarui.

## 15. Di luar cakupan

- Banyak perusahaan (multi-tenant antar perusahaan): sistem ini sengaja **satu perusahaan, banyak cabang**.
- Aplikasi mobile native (cukup web responsif).
- Payment gateway, pembayaran online di portal, dan verifikasi otomatis transfer, QRIS, atau kartu.
- Portal yang dapat mengubah data selain pengaturan akunnya sendiri.
- Booking janji temu online oleh pemilik.
- Notifikasi WhatsApp, SMS, dan email otomatis.
- Integrasi alat laboratorium atau radiologi.
- Akuntansi penuh, utang atau pembayaran ke pemasok, e-Faktur, dan pelaporan pajak. Sistem hanya menghitung dan menampilkan PPN di tagihan serta menyediakan laporan pajak operasional.
- Cetak langsung ke printer struk (hanya cetak lewat browser).
- Grooming, penitipan, atau layanan lain di luar klinik dan pet shop.
- Toko online (e-commerce) untuk publik.
- Beberapa bahasa antarmuka.

## 16. Tanda berhasil v1

v1 dianggap selesai jika:
- Satu perusahaan dengan minimal tiga cabang, termasuk satu di zona WITA atau WIT, berjalan; cabang baru bisa ditambah lewat pengaturan tanpa mengubah kode.
- Pengguna cabang A terbukti tidak bisa melihat atau mengubah data operasional cabang B (diuji otomatis di level database).
- Riwayat medis dari cabang A terbaca oleh Dokter cabang B yang berizin, tetapi tidak oleh pengguna tanpa permission medis.
- Alur kunjungan klinik berjalan penuh: daftar → periksa → rekam medis → tagihan (diskon, PPN, pembulatan) → pembayaran manual → hasil tampil di portal.
- Alur rawat inap berjalan penuh dengan biaya kandang per 24 jam sejak check-in yang benar (termasuk kasus 49 jam = 3 hari).
- Penjualan pet shop, inventori, dan pengadaan berjalan dengan stok akurat dan tidak pernah minus, termasuk saat dua transaksi bersamaan.
- Transfer stok antar cabang berjalan penuh (kirim, terima, selisih, batal) dan total stok lintas cabang selalu konsisten.
- Pembayaran tunai, transfer, QRIS, dan kartu bisa dicatat; pembayaran sebagian dan pelunasan benar; pembayaran ganda tercegah.
- PPN dan pembulatan dikonfigurasi dari pengaturan; perubahan tarif tidak mengubah tagihan lama; contoh perhitungan di bagian 6 menghasilkan angka yang sama persis.
- Pemilik hewan bisa masuk ke portal dan hanya melihat hewan serta data yang dibagikan kepadanya, termasuk tagihan tanpa opsi bayar.
- Laporan operasional cocok dengan data transaksi sumbernya, termasuk batas hari per zona waktu cabang.
- Seluruh aturan BR-001 sampai BR-023 yang berstatus bukan Usulan punya tes otomatis; semua fitur Wajib v1 memenuhi definisi selesai.
- Aplikasi ter-deploy dengan Supabase, `DEPLOYMENT.md` terbukti bisa diikuti, dan README bisa diikuti dari nol.
- Tidak ada masalah kritis atau tinggi yang terbuka (sesuai `AGENTS.md`).

## 17. Batas otonomi

Default mengikuti `AGENTS.md`. Tambahan khusus proyek ini:
- **Harus ditanyakan dulu kepada saya:** pembuatan akun dan kredensial Supabase serta Vercel/Cloudflare, deploy ke produksi, mengisi tarif PPN atau status PKP yang berlaku sungguhan, migrasi yang menghapus atau mengubah data produksi, dan perubahan aturan bisnis yang mempengaruhi uang atau data medis.
- **Boleh langsung dikerjakan tanpa tanya:** semua pengembangan, skema database, migrasi di lingkungan pengembangan, data contoh, keputusan desain, dan pemilihan framework atau dependensi.

## 18. Risiko dan kekhawatiran

- **Yang paling ditakutkan:** kebocoran data antar cabang atau ke pemilik hewan yang salah, stok dan tagihan yang tidak akurat, rekam medis yang berubah tanpa jejak, dan perhitungan pajak yang keliru.
- **Bagian paling rumit:** hak akses berlapis dengan pengecualian lintas cabang untuk riwayat medis; tagihan terpadu dengan diskon, PPN, pembulatan, dan pembayaran sebagian; stok batch dengan konkurensi dan transfer antar cabang; zona waktu banyak cabang; portal yang hanya menampilkan data yang dibagikan.
- **Lingkup besar:** 74 fitur berisiko menghasilkan implementasi dangkal. Mitigasi: pengerjaan bertahap per fase dengan definisi selesai yang ketat, dan fitur Usulan boleh dicoret.
- **Performa RLS:** kebijakan akses yang kompleks bisa memperlambat query. Mitigasi: indeks yang tepat, uji beban di Fase 12, dan pola kebijakan yang seragam.
- **Pembayaran manual:** tanpa verifikasi otomatis, salah catat oleh kasir adalah risiko nyata. Mitigasi: referensi pembayaran, jejak audit, dan laporan per metode untuk rekonsiliasi.

## 19. Asumsi, usulan, dan yang Anda isi sendiri

**Asumsi yang masih berlaku** (agent memakai default ini sampai dikoreksi):
1. Supervisor adalah penanggung jawab cabang; satu pengguna bisa ditugaskan ke lebih dari satu cabang.
2. Matriks permission bawaan di bagian 2.
3. Rekam medis terkunci setelah final dan hanya dikoreksi lewat addendum (BR-004).
4. Dokter menandai entri sebagai "dibagikan" agar tampil di portal (BR-005).
5. Stok tidak boleh minus dan memakai FEFO (BR-006, BR-007).
6. Tagihan terpadu, pembayaran sebagian, dan void dengan persetujuan Supervisor (BR-009, BR-010, BR-011).
7. Sisa rawat inap kurang dari 24 jam dihitung satu hari penuh (BR-012).
8. Jadwal vaksin ulang, jejak audit, akun portal lewat undangan email (BR-013, BR-014, BR-015, M12-F01).
9. Harga dasar katalog bisa ditimpa per cabang (M06-F03).
10. Batas diskon diatur Owner; sebelum diisi, diskon manual hanya oleh Supervisor (M10-F02).
11. Penyesuaian stok: Gudang mengajukan, Supervisor menyetujui (M08-F03).
12. Nilai persediaan dihitung dari harga beli batch (M11-F04).
13. Format penomoran dokumen (BR-022).
14. Kunjungan datang langsung saja, tanpa booking.
15. Bahasa antarmuka Indonesia, tanpa merek visual yang sudah ada, tanpa data awal, anggaran tier gratis atau terendah, target uji beban dan performa di bagian 7 dan 9.
16. Framework acuan Next.js + TypeScript; lingkungan lokal dan produksi, staging bila anggaran ada.

**Usulan yang bisa Anda coret** (4 fitur): M02-F06 gabung duplikat, M08-F06 peringatan stok, M08-F07 stock opname (BR-023), M09-F04 retur ke pemasok.

**Yang Anda isi lewat pengaturan, tidak ditebak agent:**
- Status PKP, tarif PPN yang berlaku, dan perlakuan pajak tiap produk dan layanan.
- Pilihan pembulatan tagihan.
- Daftar cabang beserta zona waktunya, tarif kandang, serta katalog produk, layanan, dan harga.
- Batas diskon per peran.

---

## Lampiran

Belum ada. Tambahkan contoh formulir rekam medis, daftar tarif dan produk, logo, atau contoh tampilan yang Anda sukai bila tersedia.
