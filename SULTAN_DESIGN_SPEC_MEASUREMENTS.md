# Sultan Master System (SMS) v6.0
## Design Specification & Measurement Guide

Dokumen ini adalah pedoman tertulis mengenai jarak (*spacing*), ukuran (*sizing*), dan tatanan visual yang digunakan di seluruh modul SIKS-Reborn-V2.

---

### 1. Tata Letak Global (Layout Engine)
Seluruh elemen dibungkus dalam container utama `.sms-layout-root` yang mengatur ritme halaman secara otomatis.

| Aturan | Nilai (Pixel) | Nilai (Tailwind/CSS) |
| :--- | :--- | :--- |
| **Jarak Antar Modul (Gap)** | **24px** | `gap-6` |
| **Padding Sisi (Content)** | **12px** | `px-3` |
| **Animasi Muncul** | **600ms** | `sms-reveal` (Translate-Y 10px) |

---

### 2. Header Halaman (Executive Header)
Bagian paling atas yang menentukan identitas setiap modul.

#### **A. Judul Modul (H1)**
- **Ukuran Font**: `30px` (`text-3xl`)
- **Ketebalan**: `900` (`font-black`)
- **Letter Spacing**: `-0.025em` (Rapat/Tight)
- **Warna**: Black (Light) / White (Dark)

#### **B. Deskripsi/Subtitle (P)**
- **Ukuran Font**: `14px` (`text-sm`)
- **Ketebalan**: `500` (`font-medium`)
- **Warna**: Muted Slate (`opacity-60`)
- **Jarak dari Judul**: `4px` (`mt-1`)

---

### 3. Komponen Kartu (SMS Card)
Semua filter, panduan, dan tabel harus dibungkus dalam kartu ini.

| Elemen | Spesifikasi | Detail |
| :--- | :--- | :--- |
| **Radius Sudut** | **12px** | `rounded-xl` |
| **Ketebalan Border** | **1px** | Solid / Translucent 5% |
| **Efek Bayangan** | **Soft** | `shadow-sm` |
| **Indikator Kiri** | **4px** | `border-l-4` (Untuk Filter & Info) |

---

### 4. Tabel Data (Executive DataTable)
Standar emas untuk penyajian data ribuan baris.

#### **A. Baris Header (thead)**
- **Background**: Soft Gray (#F7F9FC) atau White Translucent 5% (Dark Mode).
- **Border Bawah**: `1px` Solid.

#### **B. Sel Label (th)**
- **Ukuran Font**: **11px**
- **Ketebalan**: **900** (Black)
- **Transform**: **UPPERCASE**
- **Jarak Antar Huruf**: `0.1em` (Lebar/Widest)
- **Padding Dalam**: **16px** (`p-4` / `1rem`) di semua sisi.

#### **C. Sel Data (td)**
- **Ukuran Font**: **12px** (`text-xs`)
- **Warna Teks**: Black (Light) / DEE4EE (Dark)
- **Tinggi Baris**: Otomatis menyesuaikan konten agar tetap *compact*.

---

### 5. Hirarki Jarak (Visual Hierarchy)
1.  **Judul ke Deskripsi**: 4px
2.  **Header ke Filter**: 24px (Gap-6)
3.  **Filter ke Tabel**: 24px (Gap-6)
4.  **Tabel ke Footer**: 16px (Padding kartu)

---

> [!TIP]
> Semua nilai di atas telah dikunci secara teknis di dalam **`css_sultan.html`**. Anda tidak perlu menghafal angkanya, cukup gunakan kelas `.sms-*` yang telah disediakan.
