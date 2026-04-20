# SULTAN MASTER BLUEPRINT v7.0
## THE ULTIMATE DESIGN SPECIFICATION (PANDUAN BAKU)

Dokumen ini adalah **Spesifikasi Desain Tertulis** yang bersifat mutlak. Seluruh angka di bawah ini diambil dari audit presisi terhadap elemen `Brand` dan `Sidebar` untuk memastikan harmoni 100% di semua modul.

---

### 1. TATANAN RUANG & GRID (SPACING)
*   **Gap Antar Blok Utama**: **24 Pixel**.
*   **Margin Utama Halaman**: **12 Pixel**.
*   **Ruang Dalam Komponen (Padding)**: **16 Pixel**.

---

### 2. STANDAR TIPOGRAFI (TYPOGRAPHY MATRIX)
*   **Judul Halaman (H1)**: **20 Pixel** (Sama dengan Logo). Black 900. Kapital.
*   **Aksen Underline**: Lebar **30 Pixel**, Tebal **3 Pixel**, Garis di bawah teks berjarak **4 Pixel**.
*   **Teks Operasional (Tabel/Menu)**: **15 Pixel** (Sama dengan Sidebar).

---

### 3. BARIS FILTER & AKSI (ACTION BAR)
*   **Tinggi Komponen**: **38 Pixel**.
*   **Radius Sudut**: **12 Pixel**.
*   **Jarak Antar Item**: **12 Pixel**.

---

### 4. ARSITEKTUR FORMULIR (INPUT ELEMENTS)
Menjamin penginputan data tetap rapi dan mudah dibaca.

| Elemen | Spesifikasi Presisi |
| :--- | :--- |
| **Label Input** | **12 Pixel**, **Ketebalan 800**, **Uppercase**. |
| **Tinggi Input/Select** | **38 Pixel**. |
| **Ukuran Teks Input** | **15 Pixel**. |
| **Radius Input** | **12 Pixel**. |
| **Warna Focus** | Border `#3C50E0` (Sultan Blue). |
| **Warna Error/Gagal** | Border `#E53E3E` (Red). |

---

### 5. KOMPONEN TOMBOL (BUTTONS)
*   **Tinggi**: **38 Pixel**.
*   **Radius**: **10 Pixel**.
*   **Font**: **13 Pixel**, Ketebalan **800**.

---

### 6. KOMPONEN BADGE (LABEL STATUS)
*   **Bentuk**: **Pill Shape** (Radius 99px).
*   **Ukuran Font**: **11 Pixel**, Ketebalan **900**, Uppercase.

---

### 7. LOGIKA ADAPTIF TEMA (DARK/LIGHT LOGIC)
Aturan transisi warna antar mode harus konsisten tanpa merubah ukuran fisik.

| Komponen | Mode Terang (Light) | Mode Gelap (Dark) |
| :--- | :--- | :--- |
| **Latar Halaman** | `#F7F9FC` (Gray-2) | `#1A222C` (Boxdark) |
| **Latar Kartu** | `#FFFFFF` (Putih) | `#24303F` (Boxdark-2) |
| **Teks Utama** | `#1C2434` (Hitam) | `#FFFFFF` (Putih Bersih) |
| **Teks Muted** | `#64748B` (Slate) | `#AEB7C0` (Opal) |
| **Garis/Border** | `#E2E8F0` (Solid) | `rgba(255,255,255,0.05)` (Trans) |
| **Tabel Header** | `#F7F9FC` | `rgba(255,255,255,0.02)` |

---

### 8. ARSITEKTUR JENDELA MODAL
*   **Radius**: **18 Pixel**.
*   **Overlay**: Black 50% + Backdrop Blur.

---

### 9. SISTEM TABEL DATA (DATATABLES)
*   **Search/Length Radius**: **20 Pixel**.
*   **Row Hover Color**: `#F1F5F9` (Light) / `#313D4A` (Dark).

---

### 10. ARSITEKTUR NOTIFIKASI
*   **Badge Diameter**: **17 Pixel**.
*   **Toast Radius**: **12 Pixel**.

---

**Konfirmasi Dokumen**: Spesifikasi ini bersifat final. Seluruh elemen adaptif telah dipetakan untuk memastikan estetika SaaS yang premium di semua kondisi pencahayaan.
