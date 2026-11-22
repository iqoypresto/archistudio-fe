# Supervisor: kirim langsung dan halaman sukses

Keputusan user: Supervisor tidak membuat draf baru. Foto hanya ada di perangkat sampai tombol **Kirim Laporan** ditekan. Halaman sukses tampil setelah BE mengonfirmasi laporan `SUBMITTED`.

## Alur aktif

1. Kondisi dan foto terkompresi disimpan sementara di IndexedDB pada perangkat, dengan kunci `userId:areaId:reportDate`. Pratinjau foto memakai object URL lokal. UI menyebut status ini **Belum dikirim**.
2. Pada langkah Foto, tidak ada permintaan signed URL atau PUT ke object storage. Pada Periksa, pengguna meninjau isi dan jumlah foto.
3. Tombol Kirim memulai signed URL per foto, PUT langsung ke storage, lalu `POST /api/v1/reports/submit` dengan isian serta `storageKey`. Jika foto gagal, isian dan foto lokal tetap ada untuk pengiriman ulang.
4. BE memvalidasi penugasan, urutan tanggal, 1–10 foto, kelengkapan isi, prefix foto yang terikat pada user dan tanggal, serta keberadaan objek. Satu operasi database membuat laporan langsung `SUBMITTED`, dengan waktu, keterlambatan, paraf, dan foto. Pengiriman ulang oleh pembuat yang sama pada area/tanggal yang sama mengembalikan laporan yang sudah berhasil dibuat.
5. Setelah respons berhasil, FE menghapus salinan lokal dan memakai `replace` ke `/field/reports/:id/success`. Halaman sukses memuat ulang detail dari BE dan menyediakan **Kembali ke Tugas Lapor** serta **Lihat Laporan**.

## Transisi dan batasan

- Route pembuatan/perubahan draf server dinonaktifkan. Laporan `DRAFT` lama tetap ada dan dapat dikirim melalui endpoint submit lama; tidak ada migrasi atau penghapusan data lama otomatis.
- Cache browser tidak menjamin penyimpanan permanen atau sinkronisasi antar perangkat. Jika IndexedDB gagal, UI menampilkan status kegagalan penyimpanan lokal dan pengguna masih dapat mengirim selama halaman terbuka.
- Setiap percobaan kirim memakai sesi upload. Backend mencatat storage key sebelum signed URL diberikan, lalu transaksi database menautkan foto dan menandai sesi berhasil bersama pembuatan laporan. Jika submit gagal, scheduler backend menghapus foto `PENDING` dari sesi kedaluwarsa; foto `ATTACHED` pada laporan terkirim tidak dipilih untuk dihapus.
- Cleanup siap dipanggil melalui `POST /api/v1/reports/upload-sessions/cleanup` dengan secret `UPLOAD_CLEANUP_TOKEN` minimal 32 karakter. Deployment perlu menerapkan migration, menyiapkan secret, lalu menjadwalkan endpoint minimal per jam sesuai `be/docs/report-upload-cleanup.md`.
- Pemeriksaan di HP nyata, sinyal putus, tab ditutup saat upload, dan respons submit hilang masih perlu dilakukan sebelum rilis. Implementasi menambah skema sesi upload dan migration; migration serta `prisma generate` perlu dijalankan manual sesuai prosedur deployment.
