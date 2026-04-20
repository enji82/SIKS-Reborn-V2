# Sultan Master System (SMS) v6.0
## The Official UI/UX Specification for SIKS-Reborn-V2

> [!IMPORTANT]
> **MAINTENANCE POLICY**: All modules MUST adhere to these semantic classes. Do NOT use inline Tailwind utility classes for core layout structures. Global changes are managed solely via `css_sultan.html`.

---

## 1. Physical Anatomy (The Skeleton)

Every page must follow this strict hierarchy to ensure visual parity:

```html
<div class="sms-layout-root">
    
    <!-- A. Executive Header -->
    <header class="sms-header-group">
        <h1 class="sms-header-title">Title Here</h1>
        <p class="sms-header-subtitle">Description follows Golden Standard guidelines.</p>
    </header>

    <!-- B. Interactive Cards (Filters, Info, etc.) -->
    <section class="sms-card-executive">
        <!-- Content here -->
    </section>

    <!-- C. Data Table Shell -->
    <section class="sms-table-card">
        <table class="w-full table-auto">
            <thead>
                <tr class="sms-thead-executive">
                    <th class="sms-th-executive">Label</th>
                </tr>
            </thead>
        </table>
    </section>

</div>
```

---

## 2. The Semantic Dictionary

| Element | SMS Class | Visual Standard |
| :--- | :--- | :--- |
| **Root Container** | `.sms-layout-root` | `flex-col`, `gap-6`, `reveal-animation` |
| **Page Title** | `.sms-header-title` | `font-900`, `text-3xl`, `tight-tracking` |
| **Subtitle** | `.sms-header-subtitle` | `font-500`, `text-sm`, `muted-60%` |
| **Primary Button** | `.sms-btn-primary` | `radius-10px`, `shadow-blue`, `font-800` |
| **Status Badge** | `.sms-badge-*` | `pill-shape`, `modern-tint-colors`, `font-900` |
| **Table Header Row** | `.sms-thead-executive` | `translucent-5%` (Dark), `slate-50` (Light) |
| **Table Labels** | `.sms-th-executive` | `uppercase`, `tracking-0.1em`, `font-900` |

---

## 3. Logic & JavaScript Standards

To prevent code fragmentation, all JavaScript must follow the **Namespace Isolation Protocol**:

1.  **Unique Prefix**: Every module must have a unique prefix (e.g., `SK_`, `LB_`, `PR_`).
2.  **Standard Variables**:
    - `[PREFIX]_CACHE_DATA`: Array for server data.
    - `[PREFIX]_TABEL_INSTANCE`: Reference to the DataTables object.
3.  **Standard Hooks**:
    - `[PREFIX]_tarikDataServer()`: Standard fetch function.
    - `[PREFIX]_renderTabel()`: Standard rendering function.

---

## 4. Maintenance Guide

- **To Change Colors**: Edit `:root` variables in `css_sultan.html`.
- **To Change SPACING**: Edit `.sms-layout-root` in `css_sultan.html`.
- **To add a New Module**: Copy `page_blueprint_template.html` and only change the Prefix and Title.

---

*Confirmed as of 2026-04-20 by Sultan Design Authority.*
