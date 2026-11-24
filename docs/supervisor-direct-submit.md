# Supervisor: Pengiriman Laporan Langsung

Status: **desain disetujui — 23 November 2026**
Sumber keputusan: PRD revisi mobile Supervisor dan konfirmasi pengguna. Pengguna memastikan tidak ada catatan draft lama di database.

## Aturan siklus laporan

- `DailyReport` baru dibuat setelah validasi lengkap dan backend menerima permintaan kirim.
- Setiap laporan langsung berstatus `SUBMITTED`; tidak ada status `DRAFT`, endpoint simpan/update draft, backup lokal, atau pemulihan form.
- Nilai form berada di state memori halaman. Nilai bertahan saat berpindah langkah dan retry foto, tetapi hilang jika halaman dimuat ulang atau ditutup.
- `ReportUploadSession` dan metadata foto upload sementara bukan laporan draft. Session mengikat upload ke Supervisor, area, tanggal, retry, dan cleanup orphan.
- Riwayat Supervisor hanya mengambil laporan `SUBMITTED` yang ada dalam scope pengguna.

## Urutan tiga langkah

1. **Keterangan**: pilih `WORK`/ `NO_WORK`, lalu isi field wajib sesuai jenis laporan.
2. **Foto + keterangan**: pilih 1–10 foto, isi caption tiap foto, kompres di browser, unggah dengan signed URL, tampilkan progres, dan retry item gagal.
3. **Konfirmasi**: tampilkan ringkasan semua field dan foto; tombol Kirim Laporan mengirim data final.

## Alur upload dan submit

1. Saat mulai langkah Foto atau sebelum upload pertama, FE meminta `POST /api/v1/reports/upload-sessions` dengan `areaId` dan `reportDate`. Backend mengikat session ke Supervisor aktif, area, dan tanggal.
2. FE mengompres foto di perangkat dan meminta signed URL melalui `POST /api/v1/uploads/sign` dengan `sessionId`, area/tanggal, serta metadata file.
3. FE mengunggah file langsung ke R2 menggunakan signed `PUT`. Backend mencatat storage key pada session; setiap foto memiliki progress dan hasil upload sendiri.
4. Saat Konfirmasi dikirim, FE memanggil `POST /api/v1/reports/submit` dengan `sessionId`, field laporan, caption, urutan foto, `takenAt` jika valid, dan storage key.
5. Backend memeriksa kepemilikan session, masa penugasan, aturan progressive lock, kelengkapan field, jumlah foto, prefix/key dan keberadaan objek, serta keunikan area/tanggal. Dalam transaksi singkat, backend membuat laporan SUBMITTED, metadata foto, nomor laporan, waktu kirim, status terlambat, paraf, dan status session selesai.
6. Foto yang sudah terkait laporan tidak ikut cleanup. Foto orphan dari session yang tidak selesai dihapus oleh cleanup idempoten setelah masa retry/session berakhir.

Jika upload foto gagal, ulangi foto tersebut tanpa menghapus field dan foto sukses selama halaman form masih terbuka. Jika submit gagal, tidak ada laporan terkirim, animasi sukses, atau redirect. Jika submit berhasil, frontend menampilkan overlay Motion dan menunggu Supervisor menekan `Selesai` sebelum mengganti route ke daftar Laporan.

## State submit dan animasi Motion

- State mengikuti `idle → submitting → success` atau `idle → submitting → error`. Tombol Kirim nonaktif selama `submitting` dan `success`; state tidak ditentukan timer. Spinner tampil selama request dan tombol tampak menyempit memakai transform `scaleX(0.92)`, bukan animasi width.
- Hanya respons sukses server yang memulai overlay. Timeline Motion sekitar 1,8 detik: tombol fade, overlay brand `#161719` fade in, lingkaran sukses hijau `#16A34A` membesar dengan spring ringan, centang putih SVG inline digambar via `pathLength: 0 → 1`, satu ring pulse, judul “Laporan Terkirim” lalu waktu kirim dengan stagger 0,1 detik, terakhir tombol `Selesai`.
- Gunakan `motion/react`, `AnimatePresence`, `MotionConfig reducedMotion="user"`, easing masuk `easeOut`, dan exit lembut `easeInOut`. Batasi animasi ke transform dan opacity. Tidak ada confetti, suara, atau haptic wajib.
- Setelah sekitar 1,8 detik, overlay menunggu aksi pengguna pada tombol `Selesai`; tidak ada auto-close. Umumkan teks dengan `role="status"`/`aria-live`, arahkan fokus ke tombol tersebut saat muncul, dan gunakan target sentuh minimal 48 × 48 px.
- Ketika Selesai ditekan, exit fade/translate berjalan melalui `AnimatePresence`. Isi cache detail/riwayat dari respons submit dan refresh `my-areas-status`; setelah `onExitComplete`, kembali ke `/field/reports?submittedId={id}`. List menampilkan kartu laporan baru dari cache atau detail API sebelum kewajiban terbaru.
- Jika submit gagal, jangan tampilkan overlay sukses atau navigasi. Tombol kembali normal dengan shake horizontal singkat, pesan error, dan retry; isian form tidak hilang. Reduced motion mengganti gerakan dengan checkmark/teks statis dan fade sederhana.

## Data dan migrasi

- `GET /reports/my-areas-status` tidak mengembalikan `draftReportId`; tanggal tanpa laporan tetap dihitung sebagai kewajiban.
- `GET /reports` hanya berisi laporan SUBMITTED dan tidak menerima filter draft.
- Untuk role Supervisor, backend selalu mengunci query riwayat ke `supervisorId` akun aktif. Riwayat pribadi tetap menyertakan laporan sendiri dari penugasan yang telah berakhir; akun tidak dapat membaca riwayat Supervisor lain.
- Kontrak Supervisor memakai `POST /reports/submit` untuk membuat laporan langsung; route simpan/perbarui draft dan submit dengan ID draft dihapus.
- Schema final menggunakan `ReportStatus` bernilai `SUBMITTED` saja. `submittedAt` dan data paraf menjadi wajib karena hanya laporan terkirim yang disimpan.
- Karena tidak ada row draft lama, migrasi tidak perlu memindahkan atau menghapus laporan draft. Tetap jalankan migrasi database melalui Human Gate proyek.
- Tabel session upload tetap ada dan memiliki lifecycle teknis tersendiri; cleanup session tidak menghapus foto yang sudah menjadi bagian laporan.

## Kegagalan dan pemulihan

- Validasi field gagal: tunjukkan error dekat field terkait, tetap di langkah yang benar, jangan submit.
- Signed URL / PUT gagal: tawarkan Ulangi Foto Ini untuk foto gagal; pertahankan foto yang sudah berhasil dan semua input selama halaman aktif.
- Session upload kedaluwarsa: minta session baru lalu unggah ulang hanya item yang belum berhasil; jangan buat record DailyReport.
- Submit ditolak karena lock/penugasan/data duplikat: tampilkan pesan API Bahasa Indonesia, tidak menjalankan success state.
- Tab ditutup atau reload sebelum submit: isian hilang sesuai keputusan pengguna; tidak ada tombol lanjutkan draft.

Dokumen ini adalah spesifikasi target. Implementasi backend/frontend yang masih memiliki endpoint draft perlu diselaraskan pada tahap pengembangan.
