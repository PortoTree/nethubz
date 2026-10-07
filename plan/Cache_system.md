# NetHubz Caching Architecture

Dokumen ini berisi pedoman dan cetak biru (blueprint) strategi caching untuk platform NetHubz. Tujuan utama dari arsitektur ini adalah untuk menyeimbangkan **Performa Skala Besar (Global Cache)** agar database tidak jebol saat viral, dengan **Interaktivitas Realtime (Client-Side Cache)** agar UX tetap terasa hidup dan tidak ada data basi (stale data).

Pendekatan yang digunakan adalah **Sistem Hybrid (Global Cache + SWR)** dengan implementasi `revalidatePath` yang sangat agresif.

---

## 1. KASTA 1: GLOBAL CACHE PERMANENT + AGGRESSIVE REVALIDATION
*Tujuan: Memastikan halaman publik dapat diakses dalam hitungan milidetik oleh seluruh pengunjung di dunia, meminimalisir beban query ke database (Supabase/PostgreSQL).*

Kategori ini ditujukan untuk data yang sifatnya "Semi-Statis": Data yang jarang berubah setiap detik, namun ketika diubah oleh pemiliknya, perubahan tersebut **wajib** langsung terlihat oleh pengunjung lain saat itu juga.

### Entitas yang Masuk Kategori Ini:
- **Project & Post (Detail Konten):** Judul, isi, tag, media, kategori.
- **Biodata User:** Bio, lokasi, tanggal lahir, link sosmed, avatar, dan data profil lainnya.
- **Media (Gallery/Images):** URL asset yang sudah ter-upload (Sifatnya immutable/tidak berubah).

### Logika & Aturan Main:
1. **Default State:** Saat pertama kali di-load, server Next.js menarik data dari DB lalu menyimpannya sebagai **Global Permanent Cache**. Pengunjung kedua, ketiga, hingga sepersejuta akan menerima data dari cache ini (0 query ke database).
2. **Aggressive Invalidation (Ranjau `revalidatePath`):**
   - **CREATE:** Setiap ada request pembuatan Project/Post baru via Server Actions, wajib memanggil `revalidatePath('/project/[username]')`.
   - **UPDATE:** Setiap user menekan tombol "Save Profile" atau "Update Project", wajib memanggil `revalidatePath` untuk URL terkait. Contoh: Update bio memanggil `revalidatePath('/[username]')`. Ini akan langsung membunuh/menghapus cache global lama detik itu juga.
   - **DELETE:** Jika user menghapus post, panggil `revalidatePath` agar URL post tersebut seketika memberikan response 404 (Not Found) untuk semua orang, mencegah pengunjung melihat post yang sudah dihapus pemiliknya.

---

## 2. KASTA KHUSUS: BUSINESS LOGIC CACHING
*Tujuan: Memanfaatkan aturan batas limitasi fitur dari sisi bisnis untuk mencapai performa caching paling maksimal.*

### A. Username
- **Logika:** Bersifat abadi atau super jarang diganti.
- **Caching:** **Permanent Global Cache.** Bebas disimpan selamanya. Jika ada fitur ganti username (misal batas 1 tahun sekali), cukup panggil revalidation satu kali dalam setahun tersebut.

### B. Display Name (Spesial)
- **Aturan Bisnis:** User hanya boleh mengganti Display Name maksimal **2x dalam 15 Hari**.
- **Logika Caching:** 
  1. Ganti ke-1 ➡️ Eksekusi perubahan di DB ➡️ `revalidatePath`.
  2. Ganti ke-2 ➡️ Eksekusi perubahan di DB ➡️ `revalidatePath`.
  3. **Fase Lock (15 Hari):** Karena sistem telah mengunci tombol/fungsi ubah nama di sisi backend, maka data Display Name terjamin 100% tidak akan termutasi.
  4. Selama Fase Lock, server dapat menerapkan **Aggressive Permanent Global Cache (Durasi 15 Hari)** tanpa perlu repot menyiapkan trigger revalidation. Ini menghemat beban server secara luar biasa.

---

## 3. KASTA 2: CLIENT-SIDE CACHE (SWR - Stale While Revalidate)
*Tujuan: Menyajikan interaksi yang sangat personal dan dinamis. Menghindari bentrok data antar user yang berbeda.*

Kategori ini ditujukan untuk data yang bersifat privasi, memiliki otorisasi kepemilikan, atau berubah secara konstan setiap saat. HARAM hukumnya masuk ke dalam Global Cache.

### Entitas yang Masuk Kategori Ini:
- **Status Interaksi (hasLiked, hasSaved, hasFollowed):** Menandakan apakah user yang sedang login sudah menyukai postingan. Bersifat sangat personal per-perangkat.
- **List Komentar (Comments):** Highly dynamic. User berharap komentar yang baru diketik langsung muncul.
- **Notifikasi:** Sangat privat dan sensitif terhadap waktu (time-sensitive). (Direkomendasikan menggunakan Supabase Realtime).
- **Hak Akses (IsOwner):** Penentu apakah tombol "Edit" atau "Delete" boleh ditampilkan. Wajib dicek di sisi client berdasarkan token sesi yang aktif.

### Logika & Aturan Main (SWR Pattern):
1. Menggunakan memori browser (Local Storage / Map Cache di `utils/cache.ts`).
2. Saat user mengunjungi halaman, UI langsung dirender seketika (0 ms) menggunakan data sisa kunjungan sebelumnya (Stale Data). Skeleton loader tidak akan muncul jika cache ada.
3. Di belakang layar (background), aplikasi melakukan fetch diam-diam ke server untuk memeriksa pembaruan (Revalidate).
4. Jika ada like baru atau komentar baru, UI akan ter-update secara mulus tanpa layar berkedip (no blink/layout shift).


### FILE INI AKAN MENADI STANDART CACHE SYSTEM PADA NETHUBZ, JIKA ADA FITUR BARU HARAP MEMASTIKAN KEPADA SAYA UNTUK DI POSISIKAN SEBAGAI GLOBAL CACHE ATAU SWR KEDEPANNYA, JANGAN MEMUTUSKAN SENDIRI.
Pastikan system cache fitur terbaru nantinya bekerja sesuai penjelasan diatas.