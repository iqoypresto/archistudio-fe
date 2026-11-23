# Rancangan Splash Login Mobile — ArchiStudio

Status: **tambahan rancangan dari spesifikasi pengguna — 23 November 2026**

Sumber: kebutuhan tambahan pengguna untuk animasi sebelum login pada semua role.

## Tujuan dan cakupan

- Splash tampil hanya pada route `/login`, untuk pengguna yang belum login, pada viewport mobile di bawah `768px`.
- Semua role internal (`OWNER`, `ADMIN`, `SUPERVISOR`) memakai tampilan dan animasi yang sama.
- Halaman login dirender sebagai `children` di bawah satu lapisan splash. Splash tidak menunggu request, pemuatan data, atau API.
- Pengguna hanya melihat splash sekali per sesi tab. Desktop, sesi yang sudah melihat splash, pengguna terautentikasi, dan preferensi `prefers-reduced-motion: reduce` melewati animasi.
- Implementasi memakai dependency `motion` yang sudah ada (`motion/react`). Tidak menambah library animasi lain.

## Komposisi komponen

`LoginSplashLayer.tsx` menjadi client wrapper pada halaman login:

```tsx
<LoginSplashLayer>
  <LoginFormCard />
</LoginSplashLayer>
```

Wrapper hanya mengelola lapisan visual; isi dan state form tetap milik halaman login. AuthBootstrap tetap menentukan sesi dan redirect role. Guard pra-paint melewati splash saat payload auth valid tersimpan, sehingga pengguna aktif tidak melihat splash ketika redirect berlangsung. Jika tidak ada sesi, form dan overlay dirender bersamaan.

## Gaya

- Latar splash: warna brand gelap login, `#161719`.
- Mark ArchiStudio putih dan kontras di tengah. Gunakan SVG inline kecil yang mempertahankan bentuk mark pada `public/brand/archistudio-logo.webp`; jangan menunggu raster atau file animasi terunduh.
- SVG diberi `role="img"`, `aria-label="ArchiStudio"`, dan `focusable="false"`. Overlay memakai `aria-hidden="true"`, tidak memiliki kontrol atau tab stop, dan tidak mengambil atau menjebak fokus.
- Tidak ada teks visual tambahan, progress bar, partikel, suara, blur, atau shadow berat.

## Urutan Motion

| Waktu sejak splash tampil | Animasi |
| --- | --- |
| `0.0s` | Satu lapisan splash layar penuh berwarna `#161719` sudah ada tanpa animasi masuk. Login sudah dirender di bawahnya. |
| `0.0–0.8s` | Mark fade in dan scale `0.7 → 1` dengan `easeOut`. |
| `0.8–1.3s` | Mark diam. Waktu tunggu dimulai setelah `onAnimationComplete` logo; tidak memakai `setTimeout` terpisah. |
| `1.3–2.0s` | `AnimatePresence` menjalankan exit satu layer dengan translate Y ke `-100%`, durasi `0.7s`, kurva `easeInOut`. Sesudah exit, overlay hilang dari DOM. |

Urutan implementasi yang disarankan: animasikan logo sebagai satu-satunya elemen aktif; setelah selesai, set kondisi render overlay menjadi false. Transition `exit` pada overlay menggunakan jeda `0.5s` lalu wipe `0.7s`. Ini membuat jeda terikat ke penyelesaian animasi logo dan memastikan wipe adalah exit animation `AnimatePresence`, tanpa timer eksternal. Total target `2.0s`, tidak boleh diperpanjang.

## Guard SSR dan sesi

- Gunakan key `archistudio:login-splash-seen` di `sessionStorage` agar reload dan navigasi dalam tab yang sama tidak mengulang splash; tab baru memiliki sesi sendiri.
- Jangan membaca storage saat render server atau render React. Script same-origin `/login-splash-guard.js` memakai strategi Next `beforeInteractive` untuk membaca marker sesi, preferensi reduced motion, dan payload auth berbentuk valid di browser sebelum hydration. Script hanya mengubah atribut `<html>` untuk CSS skip; keputusan autentikasi tetap milik AuthBootstrap. `LoginSplashLayer` memeriksa ulang kondisi lewat `useLayoutEffect` setelah Zustand menyelesaikan hidrasi agar navigasi client-side juga tidak berkedip.
- Payload auth tersimpan menyembunyikan splash saat AuthBootstrap mengarahkan pengguna ke halaman role. Jika token tersimpan ditolak dan sesi dibersihkan, layer memeriksa ulang dan dapat memulai splash untuk tampilan login guest.
- Guard client yang sama melewati splash pada desktop dan ketika reduced motion aktif. Pemeriksaan hanya berlaku untuk viewport mobile.
- Setelah diketahui belum pernah tampil dan preferensi gerak normal, tandai key sebelum animasi mulai agar reload di tengah animasi tidak mengulangnya.
- Setelah wipe, jangan pasang listener resume yang memulai ulang animasi. Jika akses storage gagal, lewati splash untuk kunjungan tersebut agar animasi tidak terulang tanpa kendali.
- Bila marker, preferensi reduced motion, desktop, sesi auth tersimpan, atau kegagalan akses storage melewati splash, guard pra-paint dan `useLayoutEffect` menyelaraskan state agar overlay tidak berkedip. `AnimatePresence` melepas layer setelah wipe selesai.

## Reduced motion dan aksesibilitas

- Untuk `prefers-reduced-motion: reduce`, lewati splash langsung. Tidak ada jeda logo atau wipe; tandai sesi sebagai sudah diproses bila `sessionStorage` tersedia.
- Overlay tidak dapat menerima fokus, tidak memindahkan fokus, dan tidak menjadi focus trap. Form login mengikuti urutan tab halaman dan dapat digunakan segera setelah overlay hilang.
- Tidak ada pesan status yang perlu diumumkan karena splash tidak menyampaikan perubahan bisnis atau menunggu proses.

## Konfigurasi Motion bersama

Simpan easing dan durasi bersama di `src/lib/motion/animation.config.ts`. Gunakan konfigurasi tersebut untuk `LoginSplashLayer` dan `ReportSuccessMotion.tsx` agar keduanya berbagi karakter `easeOut` saat masuk dan `easeInOut` saat keluar. Splash hanya menganimasikan opacity, scale, dan translate Y. Tidak ada animasi width/height, blur, atau shadow.

## Kriteria penerimaan

- Login mobile pertama kali menampilkan overlay sejak frame pertama; halaman login sudah tersedia di bawahnya dan animasi tidak menunggu jaringan.
- Animasi selesai dalam maksimal dua detik dan hanya muncul sekali per sesi tab.
- Reload dalam sesi yang sama tidak menampilkan flash; sesi terautentikasi langsung mengikuti redirect role tanpa splash.
- Desktop dan reduced motion melewati splash.
- Setelah exit, overlay benar-benar dilepas dari DOM, tidak menyerap interaksi, dan login langsung dapat digunakan.
- Periksa animasi pada HP fisik kelas menengah selain emulator.
