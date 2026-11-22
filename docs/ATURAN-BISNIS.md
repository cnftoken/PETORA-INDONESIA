# ATURAN-BISNIS: PETORA

Tabel BR-001 sampai BR-025 dengan kondisi, hasil, pengecualian, tes yang mengujinya, status tes, dan fase implementasi. Sumber: `BRIEF.md` bagian 7. Tidak boleh menyimpang dari brief.

| ID | Aturan | Tes yang menguji | Status tes | Fase implementasi |
|---|---|---|---|---|
| BR-001 | Isolasi cabang | `br-001-branch-isolation` | lolos (pgTAP) | 0 |
| BR-002 | Akses berbasis role dan permission | `br-002-role-permission` | lolos (pgTAP) | 0 |
| BR-003 | Pelanggan, hewan, dan riwayat medis terpusat lintas cabang | `br-003-cross-branch-medical` | lolos (pgTAP) | 3 |
| BR-004 | Rekam medis hanya ditulis Dokter, entri final terkunci | `br-004-medical-entry-lock` | belum | 8 |
| BR-005 | Visibilitas ke portal hanya entri yang dibagikan | `br-005-portal-visibility` | belum | 11 |
| BR-006 | Stok per cabang tidak boleh minus | `m08-f01-f02-stock` | lolos (pgTAP) | 5 |
| BR-007 | FEFO (kedaluwarsa terdekat dulu) | `br-007-fefo` | lolos (pgTAP) | 2 |
| BR-008 | Uang bilangan bulat Rupiah, tanpa float | `br-008-integer-money` | belum | 5 |
| BR-009 | Tagihan terpadu per kunjungan / rawat inap / retail | `m03-f01-f06-klinik` | lolos (pgTAP) | 4 |
| BR-010 | Pembayaran boleh sebagian, status belum lunas / sebagian / lunas | `br-010-partial-payment` | belum | 5 |
| BR-011 | Transaksi final tidak dihapus, void / pembatalan / retur / refund | `br-011-void-return-refund` | belum | 5 |
| BR-012 | Biaya kandang per 24 jam sejak check-in, dibulatkan ke atas, minimal 1 hari | `br-012-kennel-cost` | belum | 9 |
| BR-013 | Jadwal vaksin ulang = tanggal vaksin + interval jenis vaksin | `br-013-vaccine-interval` | belum | 8 |
| BR-014 | Jejak audit: siapa, kapan, apa yang berubah (nilai lama dan baru) | `br-014-audit-trail` | lolos (pgTAP) | 0 |
| BR-015 | Akun portal terikat ke satu pelanggan lewat undangan | `br-015-portal-account-binding` | belum | 11 |
| BR-016 | Zona waktu mengikuti lokasi cabang, disimpan UTC | `br-016-timezone` | lolos (pgTAP) | 0 |
| BR-017 | Transfer stok antar cabang: draft → dikirim → diterima, selisih ditinjau | `m08-f05-transfer` | lolos (pgTAP) | 4 |
| BR-018 | Pembayaran dicatat manual oleh kasir, satu metode, tidak tercatat ganda | `br-018-manual-payment` | belum | 5 |
| BR-019 | Portal hanya untuk melihat, tidak ada tombol bayar | `br-019-portal-read-only` | belum | 11 |
| BR-020 | PPN dapat dikonfigurasi, basis poin, tagihan menyimpan salinan | `br-020-vat` | lolos (pgTAP) | 1 |
| BR-021 | Pembulatan tagihan dapat dikonfigurasi, baris terpisah | `br-021-rounding` | lolos (pgTAP) | 1 |
| BR-022 | Penomoran dokumen unik dan berurutan per cabang per jenis | `m03-f01-f06-klinik` | lolos (pgTAP) | 4 |
| BR-023 | Stock opname: produk terkunci sampai sesi ditutup, selisih disetujui | `m08-f07-opname` | lolos (pgTAP) | 4 |
| BR-024 | Saat stok berkurang: finalisasi tagihan / pemberian obat / retur mengembalikan | `m08-f01-f02-stock` | lolos (pgTAP) | 5 |
| BR-025 | Diskon hanya per baris, persen atau nominal, wajib beralasan | `br-025-discount` | belum | 5 |

**Keterangan status tes:** `belum` = belum ada tes otomatis. Aturan dengan status "belum" tidak boleh ditandai fase selesai (AGENTS.md bagian 15).

## Catatan perhitungan wajib (BRIEF bagian 7)

- PPN 10%, pembulatan ke Rp500 terdekat:
  - Belum termasuk pajak: konsultasi Rp75.000 + vaksin Rp150.000 + obat 2 × Rp22.350 = Rp269.700 → PPN Rp26.970 → Rp296.670 → pembulatan −Rp170 → total **Rp296.500**.
  - Sudah termasuk pajak: total baris Rp269.700 → dasar pajak Rp245.182 → PPN Rp24.518 → pembulatan −Rp200 → total **Rp269.500**. PPN tetap Rp24.518.
- Biaya kandang: 24, 25, 48, 49 jam → 1, 2, 2, 3 hari.
