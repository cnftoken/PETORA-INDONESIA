# Aturan Bisnis

Rujukan detail dan contoh perhitungan: `BRIEF.md` bagian 7.

| ID | Ringkasan |
|---|---|
| BR-001 | Data operasional dibatasi cabang yang ditugaskan; Owner dapat melihat seluruh cabang. |
| BR-002 | Setiap aksi memerlukan permission yang ditegakkan di database. |
| BR-003 | Pelanggan, hewan, dan rekam medis terpusat lintas cabang sesuai izin. |
| BR-004 | Rekam medis hanya ditulis Dokter; final terkunci dan koreksi memakai addendum. |
| BR-005 | Entitas medis/harian portal hanya terbaca jika ditandai dibagikan. |
| BR-006 | Stok tidak boleh minus pada finalisasi, pemberian, pengiriman, atau penyesuaian. |
| BR-007 | Pengurangan batch memakai FEFO. |
| BR-008 | Uang memakai integer Rupiah tanpa float. |
| BR-009 | Tagihan dibentuk dari kunjungan, rawat inap, atau penjualan retail. |
| BR-010 | Pembayaran mendukung belum lunas, sebagian, dan lunas. |
| BR-011 | Final tidak dihapus; koreksi memakai void, retur, refund, atau pembatalan. |
| BR-012 | Biaya kandang 24 jam dibulatkan ke atas, minimum satu hari. |
| BR-013 | Booster dihitung dari interval jenis vaksin dan dapat diubah per kasus. |
| BR-014 | Perubahan sensitif dicatat dalam audit. |
| BR-015 | Akun portal terikat satu pelanggan dan kepemilikan saat ini. |
| BR-016 | Waktu disimpan UTC dan ditampilkan berdasarkan zona cabang. |
| BR-017 | Transfer status draft-dikirim-diterima dan atomik. |
| BR-018 | Pembayaran manual satu metode per pembayaran dan anti-duplikat. |
| BR-019 | Portal hanya membaca, tanpa pembayaran online. |
| BR-020 | PPN memakai snapshot konfigurasi pada tagihan. |
| BR-021 | Pembulatan dihitung setelah PPN. |
| BR-022 | Nomor dokumen unik per cabang, jenis, dan tahun lokal. |
| BR-023 | Produk opname terkunci sampai sesi ditutup. |
| BR-024 | Stok berkurang saat finalisasi atau pemberian. |
| BR-025 | Diskon per baris, beralasan, dan hanya oleh pihak berizin. |
