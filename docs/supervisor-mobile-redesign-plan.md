# Rencana Revisi Mobile Supervisor

Status: **disetujui untuk implementasi desain — 23 November 2026**
Branch FE dan BE: `feat/supervisor-mobile-revisions`
Acuan Home: referensi `code.html` yang diberikan pengguna. PRD dan spesifikasi bersama berada di folder `workspace/docs`.

## Keputusan yang sudah disetujui

- Supervisor memakai empat tab utama: **Home, Laporan, Riwayat, Project**.
- Home mengikuti susunan visual referensi: hero navy dengan gambar arsitektur, sapaan Supervisor, ringkasan tugas hari ini, laporan terbaru, dan navigasi bawah.
- Laporan berisi kartu kewajiban yang perlu dikirim. Aksi aktif hanya untuk tanggal `nextRequiredDate`; tanggal berikutnya terkunci mengikuti backend (`BR-20`).
- Form pengiriman langsung memiliki tiga langkah: **Keterangan → Foto + Keterangan → Konfirmasi**.
- Setelah backend berhasil menyimpan laporan, aplikasi menampilkan animasi sukses menggunakan Motion, lalu kembali ke daftar Laporan.
- Riwayat hanya berisi laporan terkirim Supervisor. Project tetap menggunakan desain project yang berlaku.
- Tidak ada draft laporan, backup lokal, atau pemulihan isian setelah route ditutup/dimuat ulang. Isian hanya bertahan dalam memori selama halaman form aktif.
- Pengguna mengonfirmasi tidak ada catatan draft lama yang perlu dipertahankan di database. Upload session sementara tetap dipakai untuk mengelola file unggahan; session itu bukan laporan draft.

## Route dan navigasi

| Tab / layar | Route | Perilaku |
| --- | --- | --- |
| Home | `/field/home` | Ringkasan tugas berdasarkan data backend dan maksimal tiga laporan terkirim terbaru. |
| Laporan | `/field/reports` | Kartu satu per tanggal kewajiban, tertua lebih dulu; CTA untuk tanggal berikutnya yang dapat dikerjakan. |
| Buat Laporan | `/field/reports/new?areaId=…&date=…` | Form tiga langkah dan upload foto bertahap. |
| Riwayat | `/field/history` | Semua laporan terkirim yang dibuat Supervisor ini, termasuk pada penugasan yang berakhir; terbaru lebih dahulu, paginasi API. |
| Detail | `/field/reports/[reportId]` | Detail laporan terkirim dalam mode baca saja. |
| Project | `/projects` dan `/projects/[projectId]/*` | Mengikuti konteks project yang ada; scope Supervisor hanya project dengan area tugas aktif. |

Navigasi bawah menampilkan Home, Laporan, Riwayat, dan Project. Pada route detail project/drawing, tab Project tetap aktif. FieldAppShell dan halaman Project Supervisor memakai palet Field-light; Office/Auth tetap memakai tema yang berlaku.

## Spesifikasi layar

### Home

- Hero mengacu pada referensi: latar navy, foto arsitektur dengan overlay untuk keterbacaan, identitas aplikasi, sapaan, dan aksi Keluar.
- Ringkasan tugas menampilkan kewajiban tertunggak dan tanggal berikut yang dapat dikerjakan dari `GET /reports/my-areas-status`.
- Riwayat terbaru mengambil maksimum tiga laporan milik akun aktif dari `GET /reports` dengan urutan `submittedAt` terbaru; tautan Lihat Semua membuka Riwayat.
- Tidak memakai nama project, jumlah, ataupun laporan contoh. Bila belum ada data, tampilkan empty state yang menjelaskan kondisi.
- Foto hero memakai asset project bila tersedia; jangan mengandalkan URL gambar eksternal. Jika asset belum tersedia, gunakan gradient navy.

### Laporan

- Kartu menyebut project, area, tanggal, dan status urutan kewajiban.
- Kartu tanggal tertua yang terbuka menampilkan tombol **Buat Laporan**. Tanggal yang lebih baru menunjukkan terkunci.
- Saat kembali dengan `submittedId`, tampilkan kartu `Baru Terkirim` di atas kewajiban dari data laporan yang sudah dikonfirmasi server. Tetap perbarui daftar kewajiban dari API.
- Backend tetap menjadi sumber kebenaran tanggal wajib, hari libur, dan lock state.
- Loading, kosong, error + coba lagi, dan success memiliki tampilan masing-masing.

### Form tiga langkah

1. **Keterangan** — pilih Ada Pekerjaan (`WORK`) atau Hari Tanpa Pekerjaan (`NO_WORK`). Untuk WORK isi progres, hambatan, rencana besok, cuaca, dan jumlah pekerja; lokasi opsional. Untuk NO_WORK isi alasan.
2. **Foto + keterangan** — pilih 1–10 foto, tulis caption per foto, kompres di browser, tunjukkan progress, dan izinkan retry hanya pada foto gagal.
3. **Konfirmasi** — periksa tanggal, area, jenis, seluruh keterangan, foto, dan caption sebelum Kirim Laporan.

Nilai form dan foto yang berhasil diproses dipertahankan saat perpindahan langkah dan retry selama route tetap aktif. Tidak ada `localStorage`, IndexedDB, ataupun simpan draft server. Reload atau keluar dari halaman menghapus isian form. Status terlambat dan hasil akhir tetap berasal dari backend.

### Sukses submit

- State submit: `idle → submitting → success` atau `idle → submitting → error`. Tombol Kirim dinonaktifkan selama `submitting` dan `success`. Saat menunggu server, teks menjadi spinner; tombol tampak menyempit via `scaleX(0.92)`, tanpa animasi width.
- Hanya respons sukses dari `POST /api/v1/reports/submit` memicu overlay Motion. Timeline sukses sekitar 1,8 detik: tombol fade; overlay brand `#161719`; lingkaran hijau `#16A34A` spring ringan; centang SVG putih digambar lewat `pathLength`; satu ring pulse; judul “Laporan Terkirim” dan waktu kirim tampil berurutan; tombol `Selesai` fade in.
- Animasi memakai `motion/react`, `AnimatePresence`, `MotionConfig reducedMotion="user"`, variants bertahap, easing masuk `easeOut`, dan easing keluar yang halus. Hanya transform/opacity yang dianimasikan; tidak ada confetti, suara, atau haptic wajib.
- `Selesai` menjadi satu-satunya cara menutup overlay; tidak ada auto-close. Fokus masuk ke tombol saat muncul, pesan sukses diumumkan dengan `role="status"`/`aria-live`, target sentuh minimal 48 × 48 px.
- Saat ditutup, `AnimatePresence` menjalankan exit fade/translate; `onExitComplete` kembali ke `/field/reports?submittedId={id}`. Cache detail/riwayat diisi dari respons server dan `my-areas-status` disegarkan. Halaman Laporan menampilkan kartu `Baru Terkirim` untuk laporan tersebut sebelum daftar kewajiban.
- Pada error submit, tidak ada overlay atau redirect. Tombol Kirim kembali aktif dengan shake kecil dan pesan error serta coba lagi; semua isian tetap ada selama halaman form aktif. Reduced motion menghilangkan gerakan dan memakai feedback statis/fade sederhana.

### Riwayat dan Project

- Riwayat menampilkan hanya laporan terkirim dengan `supervisorId` akun aktif, termasuk setelah penugasan area berakhir, dengan label terlambat/direvisi jika disediakan API. Setiap kartu dapat membuka detail baca saja; laporan supervisor lain tidak ditampilkan.
- Project, Area, dan Drawing tetap mengikuti batas akses serta desain project yang berlaku. Supervisor tidak memperoleh aksi Owner/Admin.

## Data dan endpoint

- Home: `GET /api/v1/reports/my-areas-status` dan `GET /api/v1/reports?page=1&pageSize=3&sortBy=reportDate&sortOrder=desc`.
- Laporan: `GET /api/v1/reports/my-areas-status`.
- Upload: `POST /api/v1/reports/upload-sessions` → `POST /api/v1/uploads/sign` dengan `sessionId` → signed `PUT` ke R2.
- Submit: `POST /api/v1/reports/submit` membuat laporan SUBMITTED dan metadata foto secara atomik.
- Riwayat/detail: `GET /api/v1/reports`, `GET /api/v1/reports/:id`.
- Session upload kedaluwarsa dan file orphan dibersihkan melalui proses cleanup yang sudah tersedia.

## Urutan implementasi

1. Ubah FieldAppShell menjadi empat tab dan pindahkan route awal Supervisor ke Home.
2. Buat Home dengan data tugas dan laporan terbaru dari API.
3. Ganti halaman tugas dengan daftar kartu kewajiban.
4. Ubah form menjadi tiga langkah dan unggah foto pada langkah Foto menggunakan upload session.
5. Tambahkan animasi sukses Motion setelah konfirmasi server dan redirect kembali ke Laporan.
6. Pastikan Riwayat hanya menampilkan laporan terkirim serta selaraskan lifecycle DB/API agar tidak ada status atau endpoint draft.
7. Pertahankan tampilan project dan verifikasi scope Supervisor.

## Kriteria selesai desain

- Empat tab tampil di layar Supervisor dan masing-masing menuju tujuan yang sesuai.
- Home mengikuti referensi dan hanya menampilkan data nyata.
- Laporan mengurutkan kewajiban dari yang tertua serta hanya membuka tanggal yang diizinkan backend.
- Form memuat tepat tiga langkah dan upload foto dapat diulang tanpa menghapus isian di halaman aktif.
- Tidak ada penyimpanan/pemulihan draft lokal maupun server.
- Motion hanya tampil setelah submit berhasil; overlay menunggu Selesai, keluar dengan AnimatePresence, lalu daftar menampilkan laporan baru dan kewajiban terbaru.
- Performa, reduced motion, ukuran tombol, dan fokus Selesai diverifikasi pada HP fisik kelas menengah, bukan hanya emulator.
- Riwayat hanya menampilkan laporan terkirim dalam scope Supervisor.
- Target sentuh minimal 48 × 48 px, teks utama minimal 16 px, safe area aktif, dan ada loading/empty/error/success state.

Penyusunan ini memperbarui desain saja; perubahan source code akan mengikuti rencana ini pada tahap implementasi.
