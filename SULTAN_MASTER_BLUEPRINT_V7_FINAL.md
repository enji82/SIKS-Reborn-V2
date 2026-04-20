# SULTAN MASTER BLUEPRINT v7.0
## THE GOLDEN DESIGN AUTHORITY (KITAB SUCI DESAIN FINAL)

Dokumen ini adalah **Satu-satunya Sumber Kebenaran (Single Source of Truth)** untuk seluruh antarmuka SIKS-Reborn-V2. Seluruh spesifikasi di bawah ini bersifat mutlak (Fixed) dan telah disinkronkan dengan elemen jangkar visual: **Brand Link** dan **Sidebar Menu**.

---

### 1. TATANAN RUANG (GRID & SPACING)
Ruang kosong bukan sekadar jarak, melainkan ritme navigasi.
*   **Jarak Antar Blok Utama (Gap)**: **24 Pixel**. (Wajib digunakan antar kontainer besar).
*   **Margin Utama Halaman**: **12 Pixel**. (Jarak aman sisi kiri/kanan layar).
*   **Ruang Dalam Komponen (Padding)**: **16 Pixel**. (Standard padding untuk Card dan Tabel).

---

### 2. HIERARKI TIPOGRAFI (TYPOGRAPHY)
Ukuran teks dikunci pada batas maksimal (Brand) dan minimal (Sidebar) untuk harmoni 100%.

*   **Judul Utama (H1)**: **20 Pixel**. (Sesuai Brand Logo).
    *   Gaya: **Black (900)**, **UPPERCASE**, Tracking **-0.03em**.
*   **Teks Operasional (Body/Table)**: **15 Pixel**. (Sesuai Sidebar Menu).
    *   Gaya: **Medium (500-600)**.
*   **Teks Kecil (Badge/Label)**: **11 Pixel**.
    *   Gaya: **Black (900)**, **UPPERCASE**.

---

### 3. ARSITEKTUR KEPALA HALAMAN (THE HEADER)
Kepala halaman adalah identitas utama modul.
*   **Struktur**: Hanya Judul Utama (Tanpa Sub-judul/Deskripsi).
*   **Aksen Underline (Garis Sultan)**:
    *   Lebar: **30 Pixel**, Tebal: **3 Pixel**.
    *   Jarak: **4 Pixel** tepat di bawah baris teks judul.
    *   Warna: `#3C50E0` (Biru Sultan).

---

### 4. BARIS FILTER & AKSI (ACTION BAR)
Pusat kontrol data sebelum disajikan dalam tabel.
*   **Tinggi Komponen (Select/Input)**: **38 Pixel**.
*   **Radius Sudut**: **12 Pixel**.
*   **Tipografi**: **15 Pixel**, **Black (900)**.
*   **Aksen Visual**: Wajib memiliki **Garis Sisi Kiri (Border-left)** setebal **4 Pixel** (Warna: Biru Muda).

---

### 5. REGISTRI TOMBOL (BUTTON SYSTEM)
Tinggi seragam 38px untuk keselarasan horizontal sempurna.

| Jenis | Latar (BG) | Teks | Aksen |
| :--- | :--- | :--- | :--- |
| **PRIMARY** | `#3C50E0` | Putih | Shadow Blue `0 4px 12px` |
| **GHOST** | `rgba(60,80,224,0.05)` | `#3C50E0` | Border 1px Solid |
| **ICON** | `#F1F5F9` | `#64748B` | Ukuran **36x36px**, Radius 10px |
| **DANGER** | `#FEE2E2` | `#991B1B` | Merah Sultan Tint |

*   **Lengkungan (Radius)**: **10 Pixel**.
*   **Hover Effect**: Terangkat **1 Pixel** ke atas.
*   **Active Effect**: Mengecil (**Scale 0.96**).

---

### 6. LABEL STATUS (BADGE SYSTEM)
*   **Bentuk Dasar**: **Pill Shape** (Radius 99px).
*   **Dimensi Fizikal**: Tinggi **22 Pixel**, Padding Horizontal **12 Pixel**.
*   **Warna**: Menggunakan gaya **Modern Tint** (Soft BG + Darker Text).

---

### 7. PRESTASI DATA (DATATABLE SYSTEM)
*   **Kotak Pencarian (Search Box)**: Radius **20 Pixel**, Lebar **200 Pixel**.
*   **Header Tabel (Th)**: **15 Pixel**, **KAPITAL**, **Black 900**, BG `#F7F9FC`.
*   **Efek Baris**: Zebra Stripes (`#F9FBFF`) & Hover Highlight (`#F1F5F9`).

---

### 8. ARSITEKTUR FORMULIR (FORM & INPUTS)
*   **Label Input**: **12 Pixel**, **Black 800**, **UPPERCASE**.
*   **Input Field**: Tinggi **38 Pixel**, Radius **12 Pixel**, Font **15 Pixel**.
*   **Status Validasi (Error)**: Border Merah Sultan (`#E53E3E`).

---

### 9. SISTEM JENDELA (MODAL ARCHITECTURE)
*   **Modal CRUD**: Radius **18 Pixel**, Border-Bottom Header: **0** (Seamless).
*   **Modal Preview**: Lebar **95%**, Tinggi **Hampir Penuh**, Header **44 Pixel**.
*   **Overlay**: Black 50% + **Backdrop Blur**.

---

### 10. NOTIFIKASI & ALERT
*   **Lonceng Navbar**: Badge diameter **17 Pixel**, Border **2 Pixel**, Text **9 Pixel**.
*   **Toast (Pesan Melayang)**: Letak **Kanan Atas**, Radius **12 Pixel**, Durasi **3-5 Detik**.

---

### 11. LOGIKA TEMA ADAPTIF (ADAPTIVE THEME LOGIC)
Pemetaan warna mutlak untuk Mode Terang & Gelap.

| Komponen | Mode Terang (Light) | Mode Gelap (Dark) |
| :--- | :--- | :--- |
| **Latar Halaman** | `#F7F9FC` | `#1A222C` |
| **Latar Kartu** | `#FFFFFF` | `#24303F` |
| **Teks Utama** | `#1C2434` | `#FFFFFF` |
| **Teks Muted** | `#64748B` | `#AEB7C0` |
| **Garis/Border** | `#E2E8F0` | `rgba(255,255,255,0.05)` |

---

### 12. KODE ETIK CSS (CODING ETHICS)
*   **Namespace Utama**: Selalu gunakan awalan `sms-` untuk seluruh kelas Sultan Master System.
*   **Sentralisasi**: Semua logika visual wajib berada di `css_sultan.html`.
*   **Zero Inline Styles**: Dilarang menulis gaya CSS di dalam atribut `style=""` pada elemen HTML.

---

**STATUS DOKUMEN**: **FINAL & APPROVED**.
**Diterbitkan oleh**: Sultan Design Authority (v7.0).
