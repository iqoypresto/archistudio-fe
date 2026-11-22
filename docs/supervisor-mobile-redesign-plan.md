# Rencana perbaikan Supervisor Mobile

Status: **rancangan awal; alur draf digantikan oleh keputusan terbaru di `supervisor-direct-submit.md`**
Branch aktif FE dan BE saat disusun: `feat/develop-ui-sidebar-shadcn`
Acuan visual lokal: `../demo-supervisor/wireframes-v2/*.svg` relatif terhadap root repo FE, berada di luar repo Git FE/BE. Dokumen ini tetap memuat keputusan rancangan secara tertulis agar dapat ditinjau dari branch tanpa berkas SVG. Pola `docs/wireframes/supervisor/*.svg` juga diabaikan oleh `.gitignore` FE untuk mencegah salinan wireframe ikut staging di masa depan.

## Hasil yang dituju

Supervisor menyelesaikan laporan dari HP melalui satu pengalaman yang konsisten: **Tugas Lapor → Kondisi → Foto → Periksa → Terkirim**. Ia dapat melanjutkan draf, melihat riwayat dan detail, serta membaca project/area/drawing yang ditugaskan. Perubahan pada tampilan Supervisor tidak mengubah alur Owner/Admin.

Rancangan menggunakan tema terang sebagai **hipotesis untuk diuji di lokasi kerja**, bukan keputusan mengganti tema kantor. Ukuran acuan 390 px; periksa juga 320 dan 430 px. Semua aksi sentuh Supervisor ditargetkan minimal 48 × 48 px mengikuti spesifikasi di `workspace/docs/06-ui-design.md`.

## Keputusan produk dan aturan BE sebelum UI final

1. **Keputusan produk — arti “Riwayat Saya”.** User memilih hanya laporan yang dibuat Supervisor sendiri. `GET /reports` sekarang memaksakan `supervisorId` akun aktif pada server untuk role Supervisor, tanpa menerima override query. Izin baca detail laporan area tetap mengikuti `BR-03` dan tidak diubah oleh keputusan daftar riwayat ini.
2. **Usulan penguatan — draf setelah masa penugasan berakhir.** `updateDraft` saat ini memeriksa pemilik dan status draf, tetapi belum memeriksa rentang penugasan. Rekomendasi: samakan guard dengan save/submit, lalu tampilkan pesan yang menjelaskan mengapa draf tidak bisa diteruskan. Konfirmasi aturan produk sebelum mengubah perilaku BE.
3. **Status tanggal tetap ditentukan BE.** FE tidak menghitung sendiri hari wajib, urutan tunggakan, batas 17:00, maupun pengecualian hari libur. FE memakai `GET /reports/my-areas-status` sebagai sumber kebenaran.
4. **Paraf tetap otomatis berupa nama, jabatan, dan waktu kirim.** Tidak ada tanda tangan gambar, approval/reject, revisi Supervisor, atau unggah Drawing.

BE berada pada repo Git terpisah dengan nama branch aktif yang sama. Pada saat rencana dibuat, `be/.env.example` sudah berubah secara lokal; perubahan tersebut tidak termasuk cakupan rencana ini dan tidak disentuh.

## Peta rancangan UI — Jalur A, pembaruan Phase 4

Dokumen `workspace/docs/00` sampai `07` sudah tersedia. PRD, kontrak API, dan rancangan UI lama menjadi dasar. Tabel ini adalah **draft pembaruan khusus Supervisor** untuk ditinjau sebelum menyentuh `docs/06-ui-design.md` atau source aplikasi.

| Layar / route | Kebutuhan & aturan | Data / endpoint | Komponen rancangan | Keadaan yang wajib digambar |
| --- | --- | --- | --- | --- |
| **Tugas Lapor** `/field/tasks` | `US-07`, `US-10`; `AC-07.1`, `AC-10.1`; `BR-03`, `BR-11`, `BR-20` | `GET /reports/my-areas-status` | `PriorityTaskCard`, `CompactAreaRow`, `SupervisorBottomNav` | loading skeleton; tidak ada area; gagal + coba lagi; prioritas tertunggak; draf; sudah terkirim; hari libur |
| **Kondisi** `/field/reports/new` langkah 1 | `US-08`, `US-09`; `AC-08.1`, `AC-09.1`; `BR-14`–`BR-19` | nilai form lokal; `POST /reports/draft` atau `PUT /reports/:id/draft` untuk simpan | `ReportContextHeader`, `ReportTypeSwitch`, `WorkFields`, `NoWorkFields`, `SaveStatus` | kosong; validasi per bidang; draf server berhasil/gagal; cadangan perangkat tersedia |
| **Foto** route editor yang sama, langkah 2 | `US-08`, `US-09`; `AC-08.1`, `AC-08.2`, `AC-09.1`; `BR-16`, `BR-23` | `POST /uploads/sign`; PUT ke signed URL | `PhotoQueue`, `PhotoItem`, `PhotoUploadStatus` | belum ada foto; kompres; menyiapkan URL; mengunggah; terunggah; gagal + ulangi; 10 foto |
| **Periksa** route editor yang sama, langkah 3 | `US-08`, `US-09`; `AC-08.1`, `AC-09.1`; `BR-17`, `BR-24`, `BR-26` | ringkasan form + foto; `POST /reports/:id/submit` pada tombol akhir | `ReportReview`, `ReviewSection`, `SubmitAction` | belum lengkap; siap kirim; sedang mengirim; gagal server; sukses |
| **Sukses & detail** `/field/reports/:reportId` | `US-13`; `AC-08.1`, `AC-14.1`; `BR-18`, `BR-23`, `BR-24`, `BR-26` | `GET /reports/:id`, URL foto bertanda tangan | `SubmissionSuccess`, `ReportDetail`, `PhotoGallery`, `SignatureBlock` | loading; tidak ditemukan/tidak berhak; gagal + coba lagi; terkirim/terlambat/direvisi |
| **Riwayat Saya** `/field/history` | `US-08`, `US-13`; `AC-07.1`, `AC-14.1`; `BR-03`, `BR-24` | `GET /reports` | `HistoryFilters`, `FieldReportCard`, pagination | loading; kosong; gagal; draf; terkirim; terlambat; direvisi |
| **Project Saya** `/projects` | `AC-23.1`, `AC-24.2`; `BR-03`, `BR-09`, `BR-40` | `GET /projects` | `SupervisorProjectCard`, pencarian ringkas | loading; tidak ada project; hasil filter kosong; gagal; daftar project |
| **Overview & Area** `/projects/:projectId` | `AC-23.1`, `AC-24.2`; `BR-03`, `BR-09` | `GET /projects/:id`, `GET /projects/:id/areas` | `ProjectSummary`, `AssignedAreaCard`, `ProjectSubnav` | loading; tidak berhak; area kosong; gagal; project dengan area |
| **Drawing In/Out** `/projects/:projectId/drawings` | `US-18`; `AC-18.1`; `BR-32`, `BR-33` | `GET /projects/:id/drawings` | `DrawingTabs`, `DrawingCard`, `DrawingPreview` | loading; tab kosong; gagal; galeri; pratinjau |

### Token dan komponen awal untuk desain manual

- **Arah visual:** antarmuka kerja lapangan yang tenang, terang, dan mudah dipindai; aksen biru hanya untuk aksi utama. Tema terang tetap hipotesis sampai diuji di HP pada lokasi kerja.
- **Hierarki:** satu CTA utama per layar; nama area/tanggal lebih menonjol daripada kode project; status memakai teks dan warna, bukan warna saja.
- **Tipografi:** satu keluarga sans yang jelas; teks isi utama 16 px atau lebih, metadata 12–14 px bila kontras tetap memadai; tanggal/angka dibuat tabular.
- **Jarak:** kelipatan 4/8 px, ruang antarseksi 20–24 px, kartu hanya untuk pengelompokan yang bermakna.
- **Interaksi:** tombol, pilihan alasan, tab, dan kontrol foto pada jalur Supervisor minimal 48 × 48 px; fokus terlihat; pesan kesalahan ditempatkan dekat bidang terkait.
- **Komponen minimum:** header konteks, bottom nav, kartu prioritas, baris area, tombol utama/sekunder, pilihan jenis laporan, field teks/angka, kartu status foto, status simpan, ringkasan periksa, kartu riwayat, kartu project, kartu drawing, pratinjau.

Perubahan di luar UI yang membutuhkan keputusan produk dicatat pada bagian sebelumnya; tidak diperlakukan sebagai aturan yang sudah disetujui.

## Urutan implementasi

### 1. Fondasi shell Supervisor

- Buat satu shell mobile Supervisor yang digunakan route `(field)` **dan** route `(project)` ketika role adalah `SUPERVISOR`. Pertahankan `OfficeAppShell` untuk Owner/Admin.
- Navigasi bawah selalu mempunyai tiga tujuan: **Tugas Lapor**, **Riwayat Saya**, **Project**. Pada project detail/drawing, tab Project tetap aktif. Pada editor dan detail laporan, tampilkan tombol Kembali yang jelas; bilah bawah boleh disembunyikan selama tugas fokus agar tidak bertabrakan dengan aksi formulir.
- Gunakan token visual khusus Supervisor dengan cakupan CSS yang jelas. Jangan mengubah `globals.css` secara global sehingga layar kantor ikut berubah. Siapkan pasangan warna gelap/terang sebagai bahan uji sebelum menetapkan tema akhir.
- Kandidat file: `src/components/layout/FieldAppShell.tsx`, `OfficeAppShell.tsx`, route `(project)/layout.tsx`, dan komponen shell baru bila diperlukan.

**Selesai bila:** perpindahan Tugas → Project → Drawing → Kembali tidak mengganti pola navigasi, header, atau ukuran kontrol secara mendadak; Owner/Admin tetap memakai shell kantor.

### 2. Tugas Lapor berbasis prioritas

- Olah daftar `SupervisorAreaTaskStatus` menjadi satu **prioritas sekarang**: tanggal tunggakan tertua lebih dulu, kemudian laporan hari ini yang wajib. Area lain menjadi daftar ringkas.
- Sediakan tampilan untuk `tertunggak`, `draf`, `wajib lapor`, `sudah terkirim`, `hari libur`, `belum mulai penugasan`, dan `tidak ada area`.
- Tanggal dan CTA mengikuti `nextRequiredDate` dari BE; tombol hari ini tidak aktif bila `isTodayLocked`. Setelah submit, refetch status dan pindahkan fokus ke tugas berikutnya.
- Kandidat file: `src/components/field/task/FieldTaskListContent.tsx`, `AreaTaskCard.tsx`, selector presentasi baru bila diperlukan, `src/hooks/report-lock.hooks.ts`.

**Selesai bila:** pengguna dapat menunjuk satu tombol utama dan menjelaskan tanggal yang sedang ia laporkan tanpa membuka detail lain.

### 3. Editor laporan dalam tiga langkah pada route yang sama

- Pertahankan URL `/field/reports/new?areaId=…&date=…` dan kontrak API yang ada. Kelola langkah `Kondisi → Foto → Periksa` sebagai state presentasi; nilai form dan antrean upload tetap hidup saat langkah berganti.
- **Kondisi:** tampilkan jenis `WORK` atau `NO_WORK`, bidang yang sesuai, area, dan tanggal. `Simpan Draf` boleh menyimpan isian parsial. Tombol lanjut memberi umpan balik pada bidang yang perlu diisi, tanpa menghapus pilihan tipe lain secara diam-diam.
- **Foto:** tampilkan ambil/pilih foto, jumlah dari maksimum 10, keterangan, progres per foto, hapus, dan ulangi gagal. Tombol ke Periksa baru aktif saat persyaratan 1–10 foto dan semua status `uploaded` terpenuhi.
- **Periksa:** ringkas area, tanggal, jenis, bidang penting, dan foto. Sediakan `Ubah` yang kembali ke bagian terkait. Tombol akhir menjelaskan laporan terkunci setelah dikirim dan paraf dibubuhkan otomatis.
- Bedakan status **tersimpan di perangkat**, **draf tersimpan di server**, dan **foto terunggah**. Indikator jaringan berbasis `navigator.onLine` tidak boleh diberi arti bahwa API/R2 pasti tersedia.
- Kandidat file: `DailyReportEditor.tsx`, `WorkReportFields.tsx`, `NoWorkReportFields.tsx`, `PhotoUploadQueue.tsx`, `ReportSubmitBar.tsx`, `local-form-backup.hooks.ts`, `upload-queue.hooks.ts`.

**Selesai bila:** berpindah langkah tidak menghilangkan isian/foto; unggah gagal mempunyai jalan pulih; submit tidak berjalan sebelum pemeriksaan akhir dan validasi BE; draf parsial tetap dapat disimpan.

### 4. Sukses, Riwayat, dan Detail

- Sesudah submit berhasil, tampilkan layar sukses dengan area/tanggal, waktu kirim, paraf tekstual, dan CTA **Lihat Detail** atau **Lanjut tugas berikutnya**. Rekomendasi implementasi: gunakan detail laporan yang sudah ada dengan state `submitted=1`, sehingga hasil bisa dimuat ulang tanpa menyimpan state sukses semata di memori.
- Riwayat menampilkan `Draf` dan `Terkirim` dengan filter sederhana; tampilkan status `Tepat Waktu`, `Terlambat`, dan `Direvisi Owner` sesuai data API. Sesuaikan istilah **Riwayat Saya** dengan keputusan cakupan BE pada bagian awal.
- Detail bersifat baca saja dan menampilkan isi, galeri foto, waktu foto bila tersedia, serta paraf otomatis. Jangan menyediakan revisi bagi Supervisor.
- Kandidat file: `FieldHistoryContent.tsx`, `FieldReportCard.tsx`, route `/field/reports/[reportId]`, komponen detail yang sekarang digunakan.

**Selesai bila:** draf dapat dibuka kembali, laporan terkirim tidak menampilkan aksi edit, dan status baru muncul setelah submit tanpa memuat ulang manual.

### 5. Project dan Drawing khusus Supervisor

- Di route `/projects`, gunakan **kartu satu kolom** untuk Supervisor sebagai pengganti tabel kantor. Tampilkan nama, lokasi, status, jumlah area yang ditugaskan, dan satu aksi detail. Tetap gunakan data dan hook API project yang ada.
- Pada detail project, dahulukan **Area Saya** dan link ke Tugas Lapor. Metadata project sekunder. Hanya area penugasan aktif yang dapat ditampilkan.
- Drawing In/Out tetap baca saja dengan dua tab, thumbnail, metadata, dan pratinjau. Tidak ada upload/arsip pada layar Supervisor.
- Komponen Owner/Admin saat ini tetap digunakan pada role masing-masing. Kandidat file: `ProjectListContent.tsx`, `ProjectDetailContent.tsx`, `DrawingGalleryContent.tsx`, atau komponen Supervisor khusus yang dirender pada route yang sama.

**Selesai bila:** tidak ada tabel horizontal atau tombol 32 px dalam perjalanan Supervisor; semua aksi project/drawing sesuai RBAC server.

### 6. Pemeriksaan desain dan penerapan

- Tinjau setiap layar pada lebar 320, 390, dan 430 px; keyboard HP terbuka; safe area; teks panjang; 10 foto; sinyal putus saat upload; dan draf yang dipulihkan.
- Cakup keadaan loading, kosong, gagal, dan sukses. Cek fokus keyboard, label, kontras, dan target sentuh.
- Uji alur inti di HP bersama beberapa Supervisor: buka tanggal tertunggak, simpan/lanjutkan draf, gagal lalu ulangi foto, kirim, cari riwayat, dan lihat Drawing. Catat salah tekan, waktu terhenti, dan istilah yang tidak dipahami; revisi desain sebelum memperluas ke halaman lain.
- Setelah perubahan kode selesai, verifikasi bahwa BE tetap menolak aksi Owner/Admin yang tidak boleh dilakukan Supervisor serta alur Owner/Admin tidak terdampak.

## Hasil implementasi pada branch ini

- Shell mobile Supervisor dipakai pada route field dan project, dengan tema terang yang dibatasi pada shell tersebut. Owner/Admin tetap memakai shell kantor.
- Tugas Lapor mengangkat area paling mendesak dan merangkum area lain; editor memakai langkah Kondisi → Foto → Periksa, menyimpan ID draf hasil API, dan setelah kirim membuka detail dengan konfirmasi sukses.
- Riwayat Saya memiliki filter status. BE memaksakan `supervisorId` akun aktif pada daftar laporan Supervisor. Project Saya dan detail area memakai kartu mobile; Drawing tetap baca saja.
- Pemeriksaan statis FE/BE dengan `npx tsc --noEmit` lulus. Uji visual pada HP, jaringan buruk, dan keyboard terbuka belum dijalankan di sesi ini.

## Batas cakupan

Rencana ini tidak menambah dashboard Supervisor, approval/reject, edit laporan terkirim, pengelolaan project/area, notifikasi, fitur offline penuh, atau perubahan sistem auth. Perbaikan keamanan penyimpanan token dapat menjadi pekerjaan terpisah dari redesign UI.

## File acuan kode saat perencanaan

- FE: `src/components/layout/FieldAppShell.tsx`, `OfficeAppShell.tsx`, `workspace-nav.config.ts`; `src/components/field/**`; `src/components/office/project/**`; `src/components/project/drawing/**`.
- BE: `src/features/report/report.guard.ts`, `report.service.ts`, `report-lock.service.ts`; `src/features/project/project.repository.ts`; `src/features/drawing/drawing.service.ts`.
