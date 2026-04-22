# 🏛️ SULTAN EXECUTIVE BLUEPRINT (v3.11.0)
> Definitive Design Standards for SIKS-Reborn Modernization

This document serves as the master template for all future UI development in the SIKS-Reborn-V2 ecosystem.

## 🎨 1. Color Palette (Semantic Mapping)

| Context | Base Color | Gradient (135deg) | Variable |
| :--- | :--- | :--- | :--- |
| **Primary / Add** | `#3C50E0` | `var(--sk-primary)` | `--sk-primary` |
| **Success / Verify** | `#10B981` | `#10B981 → #059669` | `.sms-btn-success` |
| **Warning / Edit** | `#F59E0B` | `#F59E0B → #D97706` | `.sms-btn-warning` |
| **Danger / Delete** | `#F43F5E` | `#F43F5E → #E11D48` | `.sms-btn-danger` |
| **Neutral / Ghost** | `rgba(60, 80, 224, 0.05)` | - | `.sms-btn-ghost` |

---

## 📦 2. Core Components

### 🔲 2.1 The Floating Modal (sk-modal-box)
All modals must follow this structural hierarchy for consistency:

```html
<div class="sk-modal-overlay hidden items-center justify-center">
    <div class="w-full max-w-[500px] sk-modal-box shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="sk-modal-header sk-modal-header-[primary|success|warning|danger] !h-16">
            <div class="flex-1 flex items-center gap-4">
                <div class="badge-icon-style">...</div>
                <h3 class="sk-modal-title">TITLE HERE</h3>
            </div>
            <button class="sk-modal-close">...</button>
        </div>
        <!-- Body -->
        <div class="sk-modal-body-adaptive">
            ...
        </div>
        <!-- Footer -->
        <div class="sk-modal-footer">
            <button class="sms-btn sms-btn-ghost">BATAL</button>
            <button class="sms-btn sms-btn-[primary|success|warning|danger]">ACTION</button>
        </div>
    </div>
</div>
```

### 🪪 2.2 The Identity Box
Used in Verification and Deletion modals to show record context.

```html
<div class="sk-modal-identity-box mb-6">
    <div class="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
        <i class="fas fa-id-card text-success"></i>
        <span class="text-[10px] font-black uppercase tracking-widest text-success">Detail Dokumen</span>
    </div>
    <div class="grid grid-cols-2 gap-4">
        <div class="sk-verif-row">
            <span class="sk-verif-label">Label</span>
            <span class="sk-verif-value">Value</span>
        </div>
    </div>
</div>
```

---

## 🔡 3. Typography Standards
- **Font Family**: Satoshi (Primary), Inter (Fallback)
- **Base Text**: 14px (`text-sm`)
- **Headers**: 16px - 18px (`text-base/lg`)
- **Labels**: 10px - 11px (`text-[10px]`), Bold, Uppercase, Tracking-widest.

---

## ⚡ 4. Global CSS Classes (`css_premium_sk.html`)
- `.sk-modal-overlay`: Centered backdrop with 8px blur.
- `.sk-modal-box`: 24px rounded, adaptive background.
- `.sk-modal-body-adaptive`: Force inherits `--sk-surface` (crucial for dark mode).
- `.sms-btn`: Base executive button style (scale 0.98 on active).
- `.sms-status-tag`: Modern capsule status indicators.

---

## ⚡ 5. Dashboard Table Standards
- **Aksi Column**: Circular icon buttons with standard tooltips.
- **Badge Status**: Standardized mapping via `tugas_buildBadgeStatus`.
- **Pagination**: Minimalist blue circles for active states.

---

## 🛠️ 6. JS Best Practices
- **Modal Toggle**: Use `fadeIn()` / `fadeOut()` with `flex`/`hidden` swap.
- **Button Sync**: Always synchronize the action button color with the modal's header theme.
- **Notes Modal**: Use `Sultan.catatan(title, text)` for a minimalist reliable dialog.
