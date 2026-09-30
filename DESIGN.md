# CareNow — Design System

**Status:** extracted from the implemented codebase (`frontend/`), 2026-08-07. This is not a new direction — it documents what's already built across the 11 implemented pages, so future work stays coherent instead of drifting.

## Product

CareNow is a dental-care marketplace for Central Asia (Uzbekistan first). Patients search for a doctor or clinic, compare price/rating/availability, and book a slot online. Clinics get a separate B2B surface (`/business`) to list themselves and manage bookings. Primary language is Uzbek, with Russian and English (`i18n/locales/{uz,ru,en}.json`); prices are in so'm; city selection (Toshkent, Samarqand, Buxoro, Andijon, Namangan, Farg'ona, Nukus, Qarshi) gates the experience on first visit.

**The one thing:** trust, fast. The palette, the ✓-verified badges on every doctor card, the star ratings, the "yashirin komissiyasiz" (no hidden fees) messaging, and the confirmation toasts all point the same direction — a stranger's medical booking should feel as safe and immediate as a bank app, not as anonymous as a classifieds listing.

## Color

Two accent colors carry meaning, not decoration: **sky blue = primary action/brand**, **emerald = trust/success/verified**. Amber is reserved for ratings and highlight-priced items. Everything else is neutral.

```css
--color-main:              #0369A1   /* primary CTAs, links, active states */
--color-main-hover:        #0284C7

--color-brand-sky:         #0EA5E9   /* brand accent, secondary emphasis */
--color-brand-sky-light:   #E0F2FE
--color-brand-sky-border:  #BAE6FD

--color-brand-emerald:     #10B981   /* verified, success, "trust" signals */
--color-brand-emerald-light: #D1FAE5
--color-brand-emerald-text:  #047857

--color-brand-amber:       #F59E0B   /* ratings (★), promo highlights */
--color-brand-amber-light: #FEF3C7
--color-brand-amber-text:  #B45309

--color-brand-pink:        #DB2777   /* rare — one specialty avatar, tertiary only */
--color-brand-pink-light:  #FCE7F3
```

Neutrals (both themes defined, dark overrides the same variable names — never hardcode a neutral hex in a component):

```css
/* light */                          /* dark */
--color-ink:      #0F172A            --color-ink:      #F1F5F9
--color-ink-soft:  #475569           --color-ink-soft:  #CBD5E1
--color-ink-mute:  #64748B           --color-ink-mute:  #94A3B8
--color-line:      #E2E8F0           --color-line:      #334155
--color-line-soft: #EEF2F7           --color-line-soft: #293548
--color-surface:   #F8FAFC           --color-surface:   #1E293B
--color-card:      #ffffff           --color-card:      #16213A
```

Rule: brand/accent colors (`main`, `brand-*`) stay identical in light and dark mode — only the neutral scaffolding (`ink`, `line`, `surface`, `card`) flips. Dark mode is a real, maintained mode (toggle in the header), not an afterthought — check both when adding a screen.

Two gradients exist and are used sparingly, only for hero/CTA surfaces, never body content:
```css
--gradient:      linear-gradient(135deg, #0EA5E9, #10B981)   /* brand mark, small accents */
--gradient-hero: linear-gradient(160deg, #0EA5E9, #0284C7 55%, #0E7490)  /* login split-panel, hero banners */
```
The B2B banner on the homepage breaks this pattern deliberately with a dark navy gradient (`#0F172A → #1E293B`) — that's intentional, marking "this section is for clinics, not patients," and should stay the one place that palette appears.

## Typography

**Inter** is the only typeface actually in use — body text, headings, everything. Loaded via `@nuxt/fonts` + local `@font-face` (regular + italic). No secondary display face is active.

`Prosto One` is defined in `assets/css/main.css` (`--font-prosto`) and has font files loaded, but nothing in the codebase applies it — it's dead weight right now. Either wire it into a deliberate moment (e.g. the "CareNow" wordmark, or big hero numbers like "2 004") to give the brand a distinct display voice, or delete the font files/face declaration. Leaving it half-wired is the worst of both — flagging rather than deciding for you.

Scale in practice (Tailwind utility classes, no custom type scale defined beyond one token):
- Hero H1: `text-4xl md:text-5xl font-extrabold tracking-tight`
- Section H2: `text-2xl md:text-3xl font-extrabold tracking-tight`
- Card title: `text-base font-bold` / `text-lg font-extrabold`
- Body: default size, `text-ink-soft` for secondary copy, `text-ink-mute` for tertiary/meta
- Micro/labels: `text-xs font-bold` (uppercase tracking-wide for section eyebrows like "KLINIKALAR UCHUN")
- One custom token: `--text-tiny: 10px` for the smallest badge text

Weight vocabulary is narrow and consistent: `font-bold` and `font-extrabold` for anything that needs attention, regular weight for body. No `font-medium` / `font-semibold` middle ground in practice — keep it that way, it's part of why the UI reads as confident rather than fussy.

## Spacing & radius

Radius is one of the strongest signals of the brand — almost nothing is sharp:
- `rounded-xl` / `rounded-2xl` — the default for buttons, inputs, badges, small cards (most common by a wide margin)
- `rounded-3xl` / arbitrary `rounded-[28px]` — large feature cards, CTA banners, hero image frames
- `rounded-full` — pills (search filters, city buttons, avatar circles, verified badge backgrounds)

Never use `rounded-none`, `rounded-sm`, or `rounded-md` on anything user-facing outside of small utility chrome — it reads off-brand immediately next to everything else.

Custom spacing tokens beyond Tailwind defaults: `--spacing-4.5: 18px`, `--spacing-7.5: 30px`, `--spacing-15: 60px`, `--spacing-45: 180px` — used for the in-between cases default Tailwind steps don't hit cleanly (card padding, section rhythm).

Section rhythm: `py-12` to `py-16` between major homepage sections, `gap-4`/`gap-5` inside card grids, `gap-3` inside a single card's internal stack.

## Shadows

Two named shadows only — resist adding more:
```css
--shadow-card:  0px 0px 10px 2px rgba(0,0,0,.1)   /* resting elevation for cards */
--shadow-modal: 0px -4px 18px 0px #0000000F        /* sheets/modals rising from the bottom */
```
Most elevation in practice comes from `border border-line-soft` + a light shadow, not shadow alone — cards read as "outlined, gently lifted," not "floating." Keep that combination; a shadow-only card (no border) looks inconsistent against the rest of the UI.

## Iconography

**Tabler icons** exclusively, via `<UIcon name="tabler:...">` (`@nuxt/icon`). Consistent usage: `tabler:rosette-discount-check-filled` = verified badge (always `text-brand-sky`), `tabler:star-filled` = rating (always `text-brand-amber`), `tabler:map-pin` = location, `tabler:clock` = hours. Keep this mapping — a viewer should learn "sky checkmark = verified" once and reuse it everywhere.

Specialty categories use **raw emoji** (🦷😁🔩🧸⚕️🪥🫧👑) instead of icons, each on a tinted rounded-2xl chip matching that specialty's accent color. This is a deliberate, slightly playful counterpoint to the otherwise clinical Tabler icons — keep emoji scoped to "specialty/category" identity only, don't mix emoji and Tabler icons in the same role (e.g. don't emoji-ify a verified badge).

## Components

- **Buttons** (`components/Base/Button.vue`): two variants only — `primary` (`bg-main` solid, white text) and `secondary` (white bg, `text-main`). Always `rounded-2xl`, `px-8 py-2.5`. Most buttons in the newer CareNow-prefixed components inline these same classes directly rather than using the shared component — worth consolidating back onto `Base/Button.vue` next time buttons are touched, so the primary/secondary contract lives in one place.
- **Cards** (`ClinicCard`, `DoctorCard`): `bg-card`, `border border-line-soft`, `rounded-2xl`/`rounded-3xl`, internal `gap-3`/`gap-4` stack, verified badge top-right of the name, rating row directly under the name, location row with `tabler:map-pin`.
- **Pills/badges**: `rounded-full`, small `px-4 py-2`, used for city selector, search filters ("Bugun bo'sh joy bor"), and the "24/7 onlayn yozilish" hero eyebrow.
- **Promo pricing**: strikethrough old price (`text-ink-mute line-through`) next to bold new price, with a small `−17%` style emerald/green discount chip — this pattern repeats on doctor cards, clinic cards, and service pricing tables; keep the three elements (old price / new price / discount chip) together as a unit.

## Motion

`nuxt-aos` (AOS.js) scroll-reveal is applied broadly via `data-aos="fade-up"` / `fade-right` / `fade-left`, `duration: 700`. It's subtle and consistent — new sections should follow the same `fade-up` default unless there's a specific reason for a directional variant. (Verified during `/qa`: elements do reveal correctly on real scroll — a full-page screenshot tool showing them as blank was a tooling artifact, not a motion bug.)

Standard hover: `transition-colors` on interactive borders/backgrounds, no scale/transform hover effects anywhere currently — don't introduce them in one place only, it'd read as inconsistent.

## Layout

Centered container, `max-width: 1280px` (`--xl`), with its own breakpoint-driven max-width steps down through `lg`/`md`/`sm`/`xs` rather than just going fluid — replicate this `.container` class rather than inventing a new wrapper. Side padding `20px`, dropping to `16px` under 600px.

## Voice & content

- Uzbek is the primary/default locale; copy is direct and benefit-first ("Ishonchli stomatologni toping va 3 bosqichda yoziling" — not generic SaaS-speak).
- Numbers do real work as trust signals: "2 000+ shifokor", "500+ klinika", "4.9 ★ o'rtacha reyting", "Bugun 340 bemor yozildi" — keep surfacing concrete counts rather than vague claims.
- Currency always so'm, formatted with thin spaces as thousand separators (`250 000 so'm`).

## Known gaps (not fixed here — flagging for whoever picks this up)

- `Prosto One` font is loaded but unused (see Typography above).
- `plugins/swiper.ts` is broken (no default export, ignored at build) and nothing in the app currently uses Swiper — either wire it up or remove it.
- `/login` is visual-only: no submit handler, OTP flow, or auth wired yet.
- Doctor/clinic listings are static mock data — specialty filters change the page heading but not the actual results yet.

These were found during a `/qa` pass on 2026-08-07 (see `.gstack/qa-reports/qa-report-carenow-2026-08-07.md`) and are product/engineering work, not design-system issues — listed here only so they don't get mistaken for "the design is unfinished" when it's actually the wiring behind it.
