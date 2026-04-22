# CHANGELOG - SIKS-Reborn-V2

Semua perubahan penting pada proyek ini akan dicatat di sini.

---

## [v8.0] - 2026-04-22

### ✨ Sultan Executive Design System (Satu Pintu Kendali)

**Ditambahkan:**
- **CSS Variables Lengkap** di `css_premium_sk.html`:
  - `--sk-badge-*` → Warna badge status (Disetujui, Revisi, Ditolak, Proses) untuk Light & Dark Mode
  - `--sk-radius-*` → Border radius terpusat untuk kartu, badge, input, dan modal
  - `--sk-transition-speed` → Kecepatan animasi global
  - `--sk-size-*` → Ukuran font terpusat untuk semua elemen tabel
- **Semantic CSS Classes** di `css_premium_sk.html`:
  - `.sk-badge-approved`, `.sk-badge-revision`, `.sk-badge-rejected`, `.sk-badge-process`
  - `.sk-text-header`, `.sk-text-body-main`, `.sk-text-body-sub`, `.sk-text-filter`, `.sk-text-badge`
  - `.sk-cell-padding` untuk spasi tabel yang konsisten
- **Panduan Maintenance** dalam komentar di bagian atas `css_premium_sk.html`
- **Fungsi Global Terpusat** di `sk_logic.js.html`:
  - `window.buildBadgeSultan(s)` — fungsi badge yang digunakan bersama semua halaman
  - `window.skEscapeHtml(t)` — fungsi sanitasi HTML global

**Diubah:**
- `css_premium_sk.html`: Versi dinaikan dari v7.5 ke v8.0
- `.sms-th-executive`: Font size dan padding kini menggunakan variabel CSS
- `.sms-table-executive td`: Padding kini menggunakan variabel CSS
- `.sk-row-title` & `.sk-row-subtitle`: Font size kini menggunakan variabel CSS
- `page_sk_status.html`: Menggunakan fungsi dan kelas global dari Design System
- `page_blueprint_template.html`: Diperbarui ke v7.4 (full Design System)

**Panduan Cepat — Cara Mengubah Tampilan:**
| Yang ingin diubah | File yang diedit | Variabel/Fungsi |
|---|---|---|
| Warna badge status | `css_premium_sk.html` | `--sk-badge-approved-*`, dll. |
| Label badge ("DISETUJUI") | `sk_logic.js.html` | `window.buildBadgeSultan()` |
| Ukuran font header tabel | `css_premium_sk.html` | `--sk-size-header` |
| Ukuran font isi tabel | `css_premium_sk.html` | `--sk-size-body-main` |
| Tinggi baris tabel | `css_premium_sk.html` | `--sk-table-py` |
| Jenis font seluruh aplikasi | `css_premium_sk.html` | aturan `body { font-family: ... }` |
| Kecepatan animasi | `css_premium_sk.html` | `--sk-transition-speed` |
| Radius sudut kartu | `css_premium_sk.html` | `--sk-radius-card` |

---

## [v7.3] - 2026-04-22

### 🧹 Clean Architecture & One-Door Typography

**Ditambahkan:**
- Font **Satoshi** dikunci sebagai font global di `css_premium_sk.html`
- CSS Variables awal untuk tipografi (`--sk-size-*`, `--sk-header-color`)

**Diubah:**
- `page_sk_status.html`: Hapus semua font hardcode, gunakan CSS global
- `page_blueprint_template.html`: Diperbarui ke v7.3

---

## [v7.0] - 2026-04-22

### 📐 Standarisasi Template & Status Data SK

**Ditambahkan:**
- `page_blueprint_template.html` sebagai "Kitab Suci" desain
- Aturan tinggi baris otomatis (`h-auto`)
- Aturan penyetaraan font header tabel biasa dan matriks

**Diubah:**
- `page_sk_status.html`: Total sinkronisasi visual dengan Kelola Data SK
- Hapus fungsi freeze kolom dari seluruh sistem

---

## [v6.x] - 2026-04-16

### 🎨 Modernisasi Awal Dashboard SK

- Standardisasi badge status dari ikon ke teks pill
- Implementasi skeleton shimmer
- Standarisasi dark mode header
