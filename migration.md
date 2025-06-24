# Roxbury Design System  
## Proposal – Remove `vue-i18n` From Library Code & Embrace Locale‑Agnostic Components  
*Author — Roxbury Core Team • June 24 2025*

---

### 1 | Executive Summary
Roxbury currently calls `useI18n()` from *inside* several components (e.g. **AccountCard**, **AccountCardItem**).  
This couples the library to **vue‑i18n**, bloats bundle size, complicates testing, and forces every consuming
application to mirror our key structure. We recommend:

* **Stop importing / using `vue-i18n` in the component source.**  
* **Expose *all* user-visible strings via props or slots (with optional defaults).**  
* **Document how consumer SPAs should localize strings using the toolchain of their choice
  (vue‑i18n, FormatJS, Lingui, custom).**

---

### 2 | Why Locale‑Agnostic Components?

| Concern | Impact of keeping `vue-i18n` inside the library | Benefit when removed |
|---------|-----------------------------------------------|----------------------|
| **Bundle size & parse time** | ~16 kB min+gzipped runtime + compiled message blocks (non‑tree‑shakable) | Shaves 1–3 % off initial JS payload for most apps (actual savings depend on message volume). |
| **Framework lock‑in** | Consumers *must* install and configure vue‑i18n—even if they prefer another solution or no i18n. | Library works in any Vue project, regardless of i18n strategy. |
| **Storybook / unit tests** | Extra boilerplate to mount `I18nProvider` or stub keys. | Components render out‑of‑the‑box, easing demos and snapshot tests. |
| **Key collision & scaling** | Library dictates key naming; hard to extend or override per brand/region. | Apps own keys, locales, plural rules, and can swap at runtime. |
| **DX for consumers** | Mixed responsibility: “Which strings live where?” | Single rule: **“All text comes in as props or slots.”** |
| **Maintenance cost** | Need to update messages, plural rules, fallback logic across all locales. | Library developers focus on visuals & behavior only. |

---

### 3 | Performance Snapshot

* **Raw cost**: `vue-i18n` runtime ≈ 16 kB gzipped.  
  Compiled message objects grow linearly with locale count.  
* **Execution cost**: Each `t()` call performs key lookup + fallback logic.  
  Removing them eliminates dozens of runtime calls in a typical page of **AccountCard** grids.  
* **Tree‑shaking**: When the library no longer imports `vue-i18n`, apps that
  *don’t* use i18n avoid pulling the runtime altogether.

> **Rule of thumb**: If 20 % of components in a dashboard are Roxbury elements and
> each previously made ~5 calls to `t()`, eliminating those calls saves ~100 lookups
> per render cycle.

---

### 4 | Design Guidelines After the Migration

1. **All visible text = Prop or Slot**  
   ```vue
   <!-- AccountCard.vue -->
   defineProps({
     title:       { type: String, required: true },
     amountLabel: { type: String, default: 'Amount' },  // optional sensible default
     ariaLabel:   { type: String, default: '' }          // encourage consumer override
   })
   ```
2. **No direct `useI18n()` imports** in `src/` of the library.  
   (Exception: docs site or dev sandbox.)  
3. **Minimal defaults**  
   * OK for micro‑copy such as “×” close icons or visually‑hidden ARIA text.  
   * Do **not** default core content (titles, tooltips, help text).  
4. **Document the contract** in Storybook → *“Localization”* tab:  
   > *“Roxbury components are locale‑agnostic.  
   >  All user‑facing strings are supplied by the parent app.  
   >  Example with vue‑i18n is shown below.”*

---

### 5 | How Consumers Localize With `vue-i18n`

```ts
// main.ts (consumer SPA)
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import Roxbury from '@cnodigital/roxbury'

const messages = {
  en: {
    dashboard: {
      savingsTitle: 'Savings Account',
      balance: 'Balance'
    }
  },
  es: { /* … */ }
}

const i18n = createI18n({ locale: 'en', messages })

createApp(App)
  .use(i18n)
  .use(Roxbury)         // ← no internal i18n dependency
  .mount('#app')
```

```vue
<!-- Dashboard.vue in consumer SPA -->
<script setup>
import { useI18n } from 'vue-i18n'
import AccountCard from '@cnodigital/roxbury/AccountCard.vue'
const { t } = useI18n()
const balance = 2500
</script>

<template>
  <AccountCard
    :title="t('dashboard.savingsTitle')"
    :amount="formatCurrency(balance)"
    :amount-label="t('dashboard.balance')"
  />
</template>
```

_No warnings appear as long as the consumer defines the keys._

---

### 6 | Migration Checklist

| Step | Owner | Notes |
|------|-------|-------|
| Audit components for `useI18n()` imports | Roxbury Core | Script or grep for `t(` |
| Add new props/slots where strings were hard‑coded | Component owners | Keep prop names consistent (`title`, `ctaLabel`, `ariaLabel`, …) |
| Remove `vue-i18n` from **package.json** peerDeps | Core | Document change in release notes (major version) |
| Update Storybook stories to pass plain strings | Docs team | Provide i18n demo in “Usage” tab |
| Publish **vX+1** prerelease | DevOps | Verify bundle size drop in CI |
| Notify consuming teams & provide upgrade guide | DX | Include ESLint codemod for catching missing props |

---

### 7 | Demonstrating i18n in Docs & Tests

* **Storybook**  
  - Add a global decorator that injects a dummy `vue-i18n` instance **only in
    playground stories**.  
  - Show side‑by‑side “English vs. Spanish” controls with
    Storybook Globals.  
* **Unit tests**  
  - Default: mount components with plain strings — no provider needed.  
  - i18n example: mount with a one‑off `I18nPlugin` if a test must verify RTL text direction or
    plural logic.  
* **Docs site (vite‑press)**  
  - Keep `intlify/unplugin-vue-i18n` only for the docs site, not the library build.  
  - Provide a “Copy‑paste consumer snippet” section as shown above.

---

### 8 | Future Enhancements

1. **Optional helper package**  
   `@cnodigital/roxbury-i18n-messages` exporting common English strings that
   consumers can extend (`deepMerge`). Completely optional.  
2. **ESLint rule** to forbid direct `vue-i18n` imports in `packages/ui/src/`.  
3. **Codemod** via `jscodeshift` to replace `t('some.key')` with a prop reference
   during migration.

---

### 9 | Conclusion
Removing `vue-i18n` from Roxbury:

* **Shrinks** every consumer’s bundle and speeds hydration.  
* **Decouples** the design system from a single localization approach.  
* **Simplifies** Storybook, tests, and developer onboarding.  
* **Empowers** product teams to own translation workflows without hidden magic.

Adopting a locale‑agnostic philosophy keeps Roxbury lean, portable, and future‑proof — exactly what a design system should be.

---

*Prepared for the Roxbury Design System steering committee.  
Feedback welcome — open a discussion in `#roxbury-library` Slack or comment on RFC‑019.*
