# ArchiStudio Frontend Web App (Next.js 16 App Router)

> Antarmuka web terintegrasi untuk sistem manajemen proyek konstruksi ArchiStudio Internal Office, dirancang dengan arsitektur **Dual AppShell** yang memisahkan pengalaman desktop kantor (*Office*) dengan antarmuka lapangan ramah perangkat genggam (*Field*).

---

## 🛠️ Stack Teknologi

- **Framework**: Next.js 16.x (App Router) + React 19
- **Bahasa**: TypeScript 5.x (Strict mode, no `any`, no `@ts-ignore`)
- **State & Data Fetching**: TanStack React Query v5 + Zustand (Auth store persisten)
- **Komponen UI & Styling**: Tailwind CSS v4 + `shadcn/ui` + Base UI primitives + Lucide React
- **Kompresi Gambar Browser**: `browser-image-compression` (kompresi foto HP sebelum upload)
- **Validasi Form**: React Hook Form + Zod resolver
- **Feedback & Notifikasi**: Toast Sonner + 4-state view `<AsyncStateView>` (*loading, error, empty, success*)
- **HTTP Client**: Axios dengan interceptor auto-refresh token (shared-promise)

---

## 🏛️ Arsitektur Antarmuka & Route Groups

Proyek ini membagi halaman ke dalam grup rute terisolasi:

```text
src/
├── app/
│   ├── (auth)/
│   │   └── login/             # Halaman login nomor HP / username + password
│   ├── (office)/              # Antarmuka Back-Office (OfficeAppShell: Sidebar + Header)
│   │   ├── dashboard/         # Dashboard monitoring KPI, status area, & export PDF Opsi A
│   │   ├── members/           # Manajemen anggota tim, hak akses peran, & dialog reset sandi
│   │   ├── projects/          # Master project & detail project per area (/projects/[projectId])
│   │   └── reports/           # Daftar laporan lengkap lintas proyek & detail view (/reports/[reportId])
│   └── (field)/               # Antarmuka Lapangan (FieldAppShell: Header + Bottom Navigation)
│       └── field/
│           ├── tasks/         # Antrean tugas harian per area & status kunci bertahap
│           ├── reports/new/   # Formulir laporan kerja & tanpa kerja + auto-backup localStorage
│           ├── reports/[id]/  # Detail laporan yang dikirim supervisor
│           └── history/       # Riwayat laporan yang telah dikirim pengawas
├── components/
│   ├── ui/                    # Primitives (button, card, dialog, table, tabs, AsyncStateView)
│   ├── office/                # Komponen modular back-office (dashboard, member, project, report)
│   └── field/                 # Komponen modular lapangan (task, report form, photo queue)
├── hooks/                     # Custom hooks data fetching (TanStack Query) & form backup
├── lib/
│   ├── api/                   # Client HTTP Axios terisolasi per domain fitur
│   └── validation/            # Skema validasi Zod form & parsing snapshot
├── stores/                    # Zustand store untuk status autentikasi & sesi
└── types/api/                 # Kontrak antarmuka TypeScript DTO
```

---

## 🛡️ Ergonomi Lapangan & Resiliensi Lemah Sinyal

1. **Kompresi Sisi Klien**: Seluruh foto dikompresi di browser pengawas sebelum diunggah langsung ke Cloudflare R2 menggunakan *presigned URL*, sehingga menghemat kuota dan menjaga kestabilan sinyal.
2. **Auto-Backup `localStorage`**: Draf formulir laporan lapangan disimpan secara berkala ke penyimpanan lokal browser HP (`local-form-backup.hooks.ts`) agar pekerjaan tidak hilang bila browser tertutup mendadak.
3. **Penyajian 4-State Terstandarisasi**: Seluruh tabel dan view data dibungkus komponen `<AsyncStateView>` untuk menjamin *loading skeleton*, penanganan error yang informatif dengan tombol *retry*, serta pesan *empty state* yang ramah pengguna.
4. **Touch Target Sesuai Standar**: Elemen tombol mobile dirancang dengan ukuran minimal 44×44px (48×48px untuk tombol utama lapangan) dan font form berukuran 16px untuk mencegah auto-zoom pada iOS Safari.

---

## 📜 Skrip Perintah (Scripts)

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan Next.js development server di `http://localhost:3000`. |
| `npm run build` | Melakukan kompilasi produksi Next.js. |
| `npm run start` | Menjalankan server Next.js mode produksi. |
| `npm run typecheck` | Menjalankan validasi tipe TypeScript (`tsc --noEmit`). |
| `npm run test` | Menjalankan seluruh test suite unit frontend bawaan Node test runner. |

---

## 🧪 Pengujian Otomatis

Seluruh logika komponen kritis dilindungi oleh **8 test suites (25 test cases)**:
- `auth-foundation.test.mts`: Validasi skema login, siklus auth store, dan interceptor auto-refresh.
- `user-member.test.mts`: Validasi form member dan pemanggilan API user management.
- `project-management.test.mts`: Validasi skema tanggal project dan pemanggilan API project.
- `area-management.test.mts`: Validasi skema form area & penugasan supervisor ber-tanggal.
- `upload-and-lock.test.mts`: Validasi batasan foto 1–10 dan mekanisme retry antrean upload.
- `daily-report-submission.test.mts`: Validasi form discriminated union kerja vs tanpa kerja dan cutoff 17:00.
- `report-revision.test.mts`: Validasi form revisi Owner dan parser snapshot audit JSON.
- `dashboard-and-pdf.test.mts`: Validasi form buka kunci manual dan kalkulasi persentase ketepatan waktu.
