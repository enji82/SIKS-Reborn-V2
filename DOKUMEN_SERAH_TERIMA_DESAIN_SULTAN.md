# Dokumen Serah Terima Desain (UI/UX Handoff)
## Proyek: SIKS-Reborn-V2 - Standar "Sultan Executive"

Dokumen ini berisi spesifikasi desain mendetail untuk diimplementasikan oleh tim Web Developer. Seluruh elemen harus mengikuti aturan jarak dan ukuran di bawah ini tanpa deviasi untuk menjaga konsistensi premium di seluruh platform.

---

### 1. Prinsip Dasar Desain (Core Principles)
*   **AESTHETIC**: Bersih, SaaS-Look, Eksekutif.
*   **TYPOGRAPHY**: Menggunakan font **Satoshi** (atau Inter sebagai cadangan).
*   **SPACING**: Menggunakan sistem kelipatan **4px/8px**.
*   **COLOR PALETTE**:
    *   *Primary*: #3C50E0 (TailAdmin Blue)
    *   *Muted Text*: Slate-500 (#64748B) 
    *   *Background Section*: #F7F9FC (Gray-2)

---

### 2. Struktur Anatomi Halaman (Top to Bottom)

#### **A. Area Judul (Page Header)**
*   **Jarak Atas**: Halaman harus dimulai dengan padding atas yang lega.
*   **Judul (H1)**: 
    *   Ukuran: **30px** (Besar dan Tegas).
    *   Ketebalan: **Black (900)**.
    *   Spasi Antar Huruf: Rapat (**-0.025em**).
    *   Warna: Hitam pekat di mode terang, putih bersih di mode gelap.
*   **Deskripsi (P)**: 
    *   Jarak dari judul: **4px** di bawahnya.
    *   Ukuran: **14px** (Satoshi Medium).
    *   Warna: Abu-abu redup (transparansi 60%-70%).
    *   Fungsi: Menjelaskan apa yang bisa dilakukan user di halaman tersebut.

#### **B. Jarak Antar Komponen (Global Spacing)**
*   Setiap grup elemen (Header ke Filter, Filter ke Tabel) dipisahkan oleh **Jarak Kosong sebesar 24px (1.5rem)**. Ini adalah "nafas" dari desain eksekutif.

#### **C. Papan Informasi (Info/Guidance Board)**
*   **Wadah (Wrapper)**: 
    *   Harus memiliki **Border-Left** setebal **4px** berwarna Biru (#3C50E0) sebagai penanda visual.
    *   Sudut (Radius): **12px**.
*   **Header Papan**: 
    *   Teks "PANDUAN PENGISIAN" menggunakan ukuran **11px, Bold (900), UPPERCASE**.
    *   Jarak antar huruf lebar (**tracking widest**).
*   **Isi Papan**: Daftar list harus memiliki indentasi ke dalam dan jarak antar poin sebesar **4px**.

#### **D. Komponen Tombol (Buttons)**
*   **Arsitektur Bentuk**: Wajib memiliki radius sudut **10px** (Rounded Square). Jangan gunakan tombol bulat sempurna atau siku tajam.
*   **Tombol Utama (Primary)**: Background Biru (#3C50E0) dengan bayangan halus berwarna biru transparan.
*   **Tombol Sekunder (Ghost)**: Background biru sangat tipis (5%) dengan garis tepi tipis dan teks biru.
*   **Tombol Ikon (Icon Only)**: Berukuran **36px x 36px**. Ikon harus berada tepat di tengah.
*   **Efek Klik (Active State)**: Tombol harus mengecil sedikit (**0.96 scale**) saat diklik untuk memberikan umpan balik nyata.

#### **E. Label Status (Badges)**
*   **Bentuk**: Berbentuk Lonjong Sempurna (Pill Shape).
*   **Gaya Warna (Modern Tint)**: Menggunakan background warna pastel yang sangat muda dan teks warna pekat yang senada (contoh: Latar Hijau Muda, Teks Hijau Tua).
*   **Tipografi**: Ukuran **11px**, Ketebalan **Maksimum (900)**, dan **UPPERCASE**.
*   **Garis Tepi**: Harus memiliki garis tepi tipis dengan warna sedikit lebih gelap dari background.

#### **F. Baris Filter & Aksi (Action Bar)**
*   **Tinggi Komponen**: Seluruh input (Select) dan tombol harus memiliki tinggi yang seragam (sekitar **36px**).
*   **Input Select**: Menggunakan radius **12px (X-Large)** agar terlihat modern dan melengkung.
*   **Jarak Antar Item**: Antar dropdown dipisahkan jarak **12px**.
*   **Tombol Refresh**: Berbentuk kotak melengkung (12px) dengan ikon di tengah.
*   **Tombol Utama (Tambah Data)**: 
    *   Teks tebal (**Font-Bold 700/800**).
    *   Ikon "Plus" di sisi kiri teks.
    *   Warna Biru pekat dengan efek bayangan halus (*Soft Shadow*).

#### **E. Tabel Data Utama (The Executive Datatable)**
Bagian paling kritikal dalam desain ini.

1.  **Kontainer Tabel**:
    *   Sudut: **12px**.
    *   Garis Tepi (Border): **1px** halus warna Slate-200.
    *   Latar Belakang: Putih bersih.
2.  **Header Tabel (Thead)**:
    *   Warna Background: Abu-abu sangat muda (#F7F9FC).
    *   **Teks Th (Label Kolom)**: 
        *   Ukuran: Sangat Kecil (**11px**).
        *   Ketebalan: **Maksimum (900)**.
        *   Transform: **SEMUA HURUF KAPITAL (UPPERCASE)**.
        *   Tracking: Lebar (**0.1em**) agar mudah dibaca meski font kecil.
        *   Padding: **16px** (Atas, Bawah, Kiri, Kanan).
3.  **Baris Data (Tbody)**:
    *   Teks berukuran **12px**.
    *   Padding sel yang proporsional sehingga data tidak terasa berhimpitan.
    *   Setiap baris dipisahkan garis tipis berukuran **1px**.

---

### 3. Ketentuan Responsif (Mobile & Table Modes)
*   **Lebar Kontainer**: Harus fleksibel (Fluid) mengikuti lebar layar Admin Panel.
*   **Sticky Header**: Label kolom pada tabel tidak boleh menghilang saat di-scroll ke bawah (Floating Header).

### 4. Mode Gelap (Dark Mode Standards)
*   Background utama berubah menjadi Biru Gelap/Hitam (#1A222C).
*   Border kartu yang tadinya Slate berubah menjadi Transparan/Putih Tipis (opacity 5%-10%).
*   Warna teks body berubah menjadi abu-abu terang (#DEE4EE).

---

**Dibuat oleh**: Sultan AI Design Authority
**Status**: Final & Ready for Production
