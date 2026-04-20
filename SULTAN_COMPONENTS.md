# SULTAN COMPONENT MANIFEST (v4.1)

This document contains the "Golden Standard" code for all UI elements in SIKS-Reborn. Use these snippets to ensure 100% visual consistency across all modules.

---

## 1. Page Header (Title & Subtitle)
Every page must start with this header for consistent typography and branding.

```html
<div class="mb-2 flex flex-col">
    <h1 class="sultan-title-sync text-black dark:text-white">
        NAMA MODUL ANDA
    </h1>
    <p class="sk-section-title mt-1">
        Deskripsi singkat mengenai fungsi modul ini.
    </p>
</div>
```

---

## 2. Standard Card (Surface)
The container for almost all content. It handles borders, padding, and dark mode automatically.

```html
<div class="sk-card !p-6">
   <!-- Konten Anda -->
</div>
```

*Note: Use `!p-0` if the card contains a table to allow the table to bleed to the edges.*

---

## 3. Info Accordion (Panduan)
Collapsible information block with standard icons and colors.

```html
<div class="sk-card !p-0 overflow-hidden" x-data="{ isOpen: false }">
    <div class="sk-card-header cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10" @click="isOpen = !isOpen">
        <h3 class="font-black text-black dark:text-white flex items-center gap-2 text-sm uppercase tracking-[0.1em]">
            <i class="fas fa-info-circle text-primary"></i> Panduan Pengisian
        </h3>
        <i class="fas fa-chevron-down text-gray-400 text-sm transition-transform" :class="{ 'rotate-180': isOpen }"></i>
    </div>
    <div x-show="isOpen" x-transition x-cloak class="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-boxdark">
        <!-- Konten Panduan -->
    </div>
</div>
```

---

## 4. Filter Bar (Responsive)
A unified control bar for data filtering.

```html
<div class="sk-card p-4">
    <div class="flex flex-col md:flex-row items-center gap-4">
        <div class="flex flex-wrap flex-1 items-center gap-3 w-full">
            <!-- Filter Unit (Standard min-w 250px) -->
            <select class="sk-form-input !py-2.5 !px-4 !text-sm !w-auto min-w-[250px]">
                <option value="">- SEMUA UNIT -</option>
            </select>
            
            <!-- Filter Lain (Standard min-w 120px-140px) -->
            <select class="sk-form-input !py-2.5 !px-4 !text-sm !w-auto min-w-[140px]">
                <option value="">- STATUS -</option>
            </select>

            <!-- Refresh Button (Turbo Brand Icon) -->
            <button class="flex h-10 w-10 items-center justify-center rounded-xl sk-bg-section text-gray-500 hover:text-primary transition-all active:scale-95">
                <i class="fab fa-gg"></i>
            </button>
        </div>

        <!-- Main Action Button -->
        <button class="sk-btn sk-btn-primary w-full md:w-auto !py-2.5 !px-8">
            <i class="fas fa-plus mr-2"></i> TAMBAH DATA
        </button>
    </div>
</div>
```

---

## 5. Premium Skeleton Loader
Display this while fetching data to prevent layout shift and "blank screen" anxiety.

```html
<div id="loadingState" class="py-20 animate-reveal">
    <div class="flex flex-col items-center justify-center">
        <div class="sk-spinner-premium mb-5"></div>
        <h6 class="sk-loading-text">Sinkronisasi Data...</h6>
    </div>
</div>
```

---

## 6. Action Buttons (Standard Row)
Use this structure for action buttons inside tables or modals.

```html
<div class="flex items-center gap-2">
    <button class="sk-btn sk-btn-secondary !h-8 !px-4 !text-[10px]">EDIT</button>
    <button class="sk-btn sk-btn-primary !h-8 !px-4 !text-[10px]">UNDUH</button>
</div>
```

### Pro-Tips:
1. **No Local Styles**: Never add `<style>` blocks inside your module files. Use the classes above.
2. **Standard Spacing**: Always use Tailwind `gap-4`, `p-6`, and `mb-2` for alignment.
3. **Primary Color**: Use `var(--sk-primary)` for custom accents to ensure the theme follows your module's color.
