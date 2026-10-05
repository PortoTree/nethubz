# Rencana Implementasi Kategori Project & Form Dinamis

## 1. Latar Belakang & Tujuan
Platform **NetHubz** memiliki potensi yang luas tidak hanya untuk anak IT, tapi juga desainer, seniman, pebisnis, akademisi, dan kreator hardware. 
Tujuan dari update ini adalah:
1. Mendukung berbagai kategori project.
2. Membuat UI form pembuatan project (*Create/Edit Project*) beradaptasi secara dinamis agar relevan dengan tiap bidang kategori (tanpa membebani database dengan puluhan kolom spesifik).
3. Meningkatkan UX pencarian & filter berdasarkan kategori.

---

## 2. Struktur Database (Prisma Schema)

Kita akan memodifikasi model `Project` dengan menambahkan enum kategori dan tipe kolaborasi.

```prisma
// Enum untuk Kategori Spesifik (24 Kategori)
enum ProjectCategory {
  WEB_DEV
  MOBILE_APP
  GAME_DEV
  DATA_AI
  DESKTOP_APP
  OPEN_SOURCE
  UI_UX
  GRAPHIC_DESIGN
  ANIMATION_3D
  VIDEO_FILM
  MUSIC_AUDIO
  ECOMMERCE
  SAAS
  FINTECH
  SOCIAL_IMPACT
  IOT
  ROBOTICS
  ELECTRONICS
  EDTECH
  RESEARCH
  COURSE
  COMIC
  BOOK
  OTHER
}

// Enum untuk Jenis Bantuan/Kolaborasi yang dicari
enum CollabType {
  FINDING_TEAM        // Mencari anggota tim/partner
  FINDING_MENTOR      // Mencari mentor/advisor
  FINDING_TESTER      // Mencari penguji/feedback
  FINDING_INVESTOR    // Mencari pendanaan/sponsor
}

model Project {
  // ... kolom eksisting ...
  
  // Penambahan Kolom Baru:
  category       ProjectCategory @default(SOFTWARE_IT)
  customCategory String?         // Hanya diisi jika category == "OTHER"
  collabTypes    CollabType[]    // Bisa milih lebih dari 1 tipe kolaborasi
}
```

---

## 3. Logika Form Dinamis (UI Frontend)

Di halaman **Add/Edit Project**, kita akan menggunakan State React (`selectedCategory`) untuk merubah Label dan Placeholder dari field generik. Database tetap menyimpan pada kolom yang sama.

### Mapping Label Dinamis:
| Kategori yang Dipilih | Label untuk `techStack` | Label untuk `repoUrl` | Label untuk `demoUrl` |
| :--- | :--- | :--- | :--- |
| **Software & IT** | Tech Stack / Framework | Link Repository (GitHub) | Live Demo / Production |
| **Design & Creative** | Software & Tools (Figma, dll) | Link Source File (Drive) | Portofolio / Hasil Karya |
| **Business & Startup** | Model Bisnis (B2B, B2C) | Link Pitch Deck / Proposal| Website / Landing Page |
| **Hardware & IoT** | Komponen Hardware / Sensor | Link Skema / Blueprint | Video Demo Alat |
| **Research & Education**| Bidang Studi / Disiplin Ilmu | Link Data Pendukung | Jurnal / Hasil Riset |
| **Arts & Literature** | Genre / Tema Kesenian | Link Draft Tulisan / Script | Link Publikasi (Webtoon) |
| **Other (Lainnya)** | Keahlian / Tools Utama | Link Referensi Utama | Link Hasil / Portofolio |

### Penanganan Khusus Kategori "OTHER":
Jika dropdown Kategori dipilih `OTHER`, form akan merender satu `<input type="text">` tambahan dengan placeholder: *"Kategori project kamu (misal: Podcast, Hidroponik)"*. Value-nya akan disimpan ke kolom `customCategory`.

---

## 4. Sistem Filter & Pencarian

- **UI Filter (Sidebar `/project`)**: 
  Akan ada sekumpulan checkbox untuk setiap kategori utama, dan satu checkbox untuk "Lainnya (Other)".
- **UI Card Project**:
  Akan ada badge kecil di kartu project. Jika `category == OTHER`, badge mengambil teks dari `customCategory` (jika ada). Jika tidak, tampilkan label default-nya.
- **Backend Search / Prisma Query**:
  Logika pencarian (Searchbox) harus diperluas agar bisa menemukan project dari input kustom user.
  ```typescript
  where: {
    OR: [
      { title: { contains: searchQuery, mode: 'insensitive' } },
      { description: { contains: searchQuery, mode: 'insensitive' } },
      { customCategory: { contains: searchQuery, mode: 'insensitive' } } // Cek kategori kustom
    ]
  }
  ```

---

## 5. Urutan Langkah Pengerjaan (Roadmap)

1. **Tahap 1: Database Setup**
   - Tambahkan enum `ProjectCategory` dan `CollabType` ke `schema.prisma`.
   - Update model `Project`.
   - Jalankan `npx prisma db push` atau `prisma migrate dev`.
   - Perbarui/Generate tipe typescript dari Prisma.

2. **Tahap 2: Lokalisasi & Bahasa**
   - Tambahkan translasi baru di `en.json` dan `id.json` untuk semua list kategori, label form dinamis, dan placeholder.

3. **Tahap 3: Update Backend Actions**
   - Modifikasi `src/app/actions/projects.ts` (fungsi `createProject`, `updateProject`, dan fetch project) untuk menerima parameter `category`, `customCategory`, dan `collabTypes`.

4. **Tahap 4: Refactor UI Form (Create/Edit)**
   - Buat fungsi `getDynamicLabels(category)` yang me-return object label berdasarkan enum.
   - Ganti *hardcoded* label di form input menjadi dinamis.
   - Tambahkan logika *conditional rendering* untuk input `customCategory` jika opsi "Lainnya" dipilih.

5. **Tahap 5: Update Halaman Showcase & Detail**
   - Tambahkan badge kategori di komponen `ProjectCard`.
   - Implementasikan Filter Checkbox kategori di sidebar `ProjectShowcase`.
   - Pastikan fungsi pencarian backend sudah terhubung dan membaca `customCategory`.
