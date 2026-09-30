# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

CareNow is a dental-care marketplace for Central Asia (Uzbekistan first). Patients search for a doctor/clinic, compare price/rating/availability, and book a slot online. Clinics get a B2B surface (`/business`) to list themselves; doctors get their own portal; a super-admin panel manages the whole platform. Primary language is Uzbek, with Russian/English also supported.

This is a monorepo split into two independently-run apps:
- `backend/` — NestJS + Prisma + PostgreSQL API
- `frontend/` — Nuxt 3 (Vue 3, SPA mode) client

The full product/design system is documented in `DESIGN.md` — read it before touching UI (colors, typography, spacing, component conventions, and a "Known gaps" section listing things that look done but aren't wired up yet, e.g. `/login` has no submit handler and doctor/clinic listing filters are cosmetic-only in places).

## Commands

### Backend (`cd backend`)
- `npm run dev` — start NestJS in watch mode
- `npm run build` — `nest build`
- `npm test` — run all Jest specs (`*.spec.ts` under `src/`)
- `npx jest src/super-admin/super-admin.service.spec.ts` — run a single spec file
- `npx jest -t "removeClinic blocks deletion"` — run a single test by name
- `npm run prisma:generate` — regenerate the Prisma client after a schema change
- `npm run prisma:seed` — `ts-node prisma/seed.ts`

**Migrations:** `npm run prisma:migrate` (`prisma migrate dev`) requires an interactive TTY and fails in non-interactive environments. When that happens, hand-write the migration SQL under `prisma/migrations/<timestamp>_<name>/migration.sql` (match Prisma's naming convention) and apply it with `npx prisma migrate deploy`, then `npm run prisma:generate`.

### Frontend (`cd frontend`)
- `yarn dev` — start Nuxt dev server (package manager is yarn, see `packageManager` field)
- `yarn build` / `yarn generate` / `yarn preview`
- `npx eslint .` — lint (no `lint` script defined in package.json; `@nuxt/eslint` config lives in `eslint.config.mjs`)
- No frontend test suite currently exists.

### Running both together
Nuxt's default dev port and the backend's default `PORT` are both `3000`, so they collide if run with defaults. Set `PORT` in `backend/.env` to something else (e.g. `4001`) and set `FRONTEND_ORIGIN` in `backend/.env` to match whatever port the frontend actually runs on; set `API_BASE_URL` in `frontend/.env` to the backend's real port. See `backend/.env.example` and `frontend/.env.example` for the full variable list — `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN` are required; `SUPER_ADMIN_USERNAME`/`SUPER_ADMIN_PASSWORD` are optional (seed script skips username/password login for the super-admin if unset, phone+OTP still works either way).

## Backend architecture

One NestJS module per domain, all wired in `src/app.module.ts`: `auth`, `doctors`, `clinics`, `bookings`, `clinic-admin`, `doctor-portal`, `super-admin`, `favorites`, `business`. Each module follows the same shape: `*.controller.ts` (routes), `*.service.ts` (Prisma calls + business rules), `dto/*.ts` (class-validator DTOs), `*.service.spec.ts` (Jest unit tests with a hand-mocked `PrismaService`).

**Response contract (must not be broken):** every response — success or error — comes back as `{ data, status, message, success }`. This is enforced globally, not per-route:
- `src/common/response.interceptor.ts` wraps every successful controller return value.
- `src/common/http-exception.filter.ts` wraps every thrown `HttpException` into the same shape.
- The frontend's `service/Service.ts` depends on this exact shape (it reads `err.response.data.message` out of Axios errors). Don't return raw objects or throw non-`HttpException` errors from a controller/service without expecting this contract to break.

**Auth:** two login paths issue the same JWT payload shape (`{ sub, phone, role }`):
- Phone + OTP (`POST /auth/otp/request`, `POST /auth/otp/verify`) — public, patient-facing.
- Username + password (`POST /auth/admin-login`) — admin-only, backed by `User.username`/`User.passwordHash` (bcrypt), which are only ever set for accounts that need them.

Role model: `PATIENT | CLINIC_ADMIN | DOCTOR | SUPER_ADMIN` (`prisma/schema.prisma`'s `Role` enum). Protected routes use `@UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPER_ADMIN')` — **guard order matters**: `JwtAuthGuard` populates `request.user` first, `RolesGuard` reads it. Pull the current user in a handler with `@CurrentUser() user: JwtPayload` (`src/auth/current-user.decorator.ts`).

**Prisma delete-safety idiom** (used throughout `clinic-admin`, `super-admin`): `schema.prisma` does not show `onDelete` behavior when it's left at the default (`RESTRICT`) — check the actual generated SQL under `prisma/migrations/*/migration.sql` before assuming a relation's delete behavior.
- For a true `RESTRICT` FK: wrap the delete in try/catch, catch `Prisma.PrismaClientKnownRequestError` with `code === 'P2003'`, rethrow as `ConflictException`.
- For a `SET NULL` FK (e.g. `Clinic.ownerId`, `Doctor.userId`): the P2003 catch never fires — do an explicit `count()` precheck instead and block with a `ConflictException` naming what's still attached, or the delete will silently orphan data.
- Unique-constraint conflicts (e.g. clinic slug) use the same pattern with `code === 'P2002'`.
- Self-action guards (a super-admin editing/deleting their own account) compare the target id against `@CurrentUser().sub` and throw `ForbiddenException`.

Testing this: mock each Prisma model method as `jest.fn()` on a plain object cast to `PrismaService`, and construct real `Prisma.PrismaClientKnownRequestError` instances to simulate P2002/P2003 (see the `prismaError(code)` helper in `src/super-admin/super-admin.service.spec.ts`).

**Data model** (`backend/prisma/schema.prisma`): `User` → owns `Clinic`s (`ClinicOwner` relation) and/or has a linked `Doctor` profile (`DoctorUser` relation, one-to-one via `Doctor.userId`) and/or books appointments as a patient. `Clinic` has many `Branch`, `Doctor`, `Service`. `Doctor` belongs to one `Clinic`+`Branch`, has `Availability` slots and `Booking`s. `BusinessLead` is the B2B "list your clinic" contact-form submission, unrelated to any other model.

## Frontend architecture

Nuxt 3 in SPA mode (`ssr: false` in `nuxt.config.ts`). Key module choices: Tailwind v4 via `@tailwindcss/vite` (not the Nuxt Tailwind module), Pinia + `pinia-plugin-persistedstate` for the one store (`store/useful.store.ts`), `@nuxtjs/i18n` with `uz` (default) / `ru` / `en` locale files under `i18n/locales/`, `@nuxt/ui`, `@nuxt/icon` (Tabler icons — see `DESIGN.md` for the icon-meaning conventions), `nuxt-aos` for scroll-reveal, `nuxt-mapbox`/Yandex Maps for the clinic map view.

**API layer:** every network call goes through `service/Service.ts` — a thin Axios wrapper (`API.ts` builds the Axios instance from `runtimeConfig.public.apiBaseUrl`) exposing `get/post/patch/delete<T>()`, all returning `ApiResponse<T> = { data, status, message, success }` (`types/api.types.ts`) — never a raw Axios response or a thrown error, since `formatError()` catches Axios errors and normalizes them into the same shape (reading the backend's real error message off `err.response.data.message`).

On top of `Service.ts` there's one `composables/useXApi.ts` per backend module (`useAuth`, `useBookingApi`, `useClinicsApi`, `useDoctorsApi`, `useClinicAdminApi`, `useDoctorPortalApi`, `useSuperAdminApi`, `useFavoritesApi`, `useBusinessApi`, `useSpecialtiesApi`) — each wraps its domain's endpoints and defines the TypeScript row/response types for that domain. Follow this pattern for new endpoints rather than calling `Service` directly from a page.

**Auth token:** `composables/token.ts`'s `useToken()` is a cookie-backed reactive ref (`auth_token` cookie) shared across `useAuth()` and every `useXApi()` composable that needs `Authorization: Bearer`. `Service.ts` clears local auth state on a `401`.

**Pages layout convention:** every role-scoped panel (`pages/super-admin/*.vue`, `pages/clinic-admin/*.vue`, `pages/doctor-panel/*.vue`) repeats the same shell per file: an `onMounted`/`onActivated` `load()` guard that redirects to `/login` or `/admin-login` if unauthenticated, then checks `user.role` and redirects to `/` if wrong role, then a sidebar `navItems` array (kept in sync by hand across every file in that panel — when adding a nav item, update it in all sibling pages) plus a `<NuxtLink>` sidebar and a content `<section>`. List pages that support delete use a two-step confirm (first click turns the button into "Ishonchingiz komilmi?", second click confirms) with a `deletingXId`/error-message pair *scoped per row* — a single shared error ref will incorrectly render under every row in a `v-for`, not just the one that failed.

## Environment

- `backend/.env` (gitignored): `DATABASE_URL`, `PORT`, `FRONTEND_ORIGIN`, `JWT_SECRET`, `JWT_EXPIRES_IN`, optional `SUPER_ADMIN_USERNAME`/`SUPER_ADMIN_PASSWORD`.
- `frontend/.env` (gitignored): `API_BASE_URL`, `NUXT_PUBLIC_YANDEX_MAPS_API_KEY` (required for `/clinics/map`).
- Never hardcode a real secret/credential into a git-tracked file (e.g. `prisma/seed.ts`) — read it from `process.env` with no literal fallback, and document only the variable name (not the value) in the corresponding `.env.example`.
