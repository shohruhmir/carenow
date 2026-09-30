# CareNow — Android app

Flutter app for the CareNow clinic/doctor booking platform, consuming the existing NestJS backend (`../backend`) directly — no backend changes were needed. Covers:

- **Patient**: browse/search doctors and clinics, clinic map, book/cancel appointments, favorites, profile, login by phone+OTP or Google.
- **Doctor cabinet**: profile view, weekly availability editor, own bookings.

Clinic-admin and super-admin are out of scope (desktop/admin tooling, not built here).

## Setup

1. **Backend URL** — the app defaults to `http://10.0.2.2:3000` (the special alias an Android emulator uses to reach `localhost:3000` on the host machine, matching the backend's default port from `backend/.env.example`). For a real device on the same network, run with:
   ```
   flutter run --dart-define=API_BASE_URL=http://<your-lan-ip>:3000
   ```

2. **Yandex MapKit key** (clinics map screen) — get a real key at https://developer.tech.yandex.ru/services/. Without one, the map screen falls back to a plain branch list (no broken/blank screen). Once you have a key:
   ```
   flutter run --dart-define=YANDEX_MAPKIT_API_KEY=your-real-key
   ```
   The key is passed at build time (`String.fromEnvironment` in `lib/core/config/env.dart`) — never hardcoded in source.

3. **Google Sign-In** — the app calls `google_sign_in` for an OAuth *access token* (not idToken) and posts it to `POST /auth/google`, matching what `frontend/composables/useGoogleAuth.ts` already does on the web. You'll need to register the app's SHA-1 (debug + release) in the Google Cloud Console OAuth client and drop the resulting `google-services.json` under `android/app/` if you switch to the Google Sign-In plugin's manifest-based setup — the default `google_sign_in` flow used here works without it for basic testing, but production sign-in typically wants the client ID configured.

## Running

```
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000
```

Building a release/debug APK:
```
flutter build apk --debug
```
Output: `build/app/outputs/flutter-apk/app-debug.apk`.

## Toolchain notes (things that took real effort to get working)

- **Min SDK 26** — required by the Yandex MapKit native SDK.
- **Java 21** — `yandex_maps_mapkit_lite`'s own Android module compiles against Java 21 bytecode; the app module's `compileOptions`/Kotlin `jvmTarget` in `android/app/build.gradle.kts` must match (Java 17 causes a `class file has wrong version 65.0, should be 61.0` build failure).
- **Yandex Maps package**: this app uses `yandex_maps_mapkit_lite` (official, Yandex-maintained, `package:yandex_maps_mapkit_lite`), **not** the older community `yandex_mapkit` package. The community package (last published 4.3.0) uses a legacy Android Gradle DSL that's incompatible with modern AGP (9+) — its native Java wrapper code fails with dozens of `cannot find symbol` errors regardless of which `maps.mobile` AAR flavor (`lite`/`full`) is wired in, because AGP 9+ only reads the new declarative DSL for subprojects. If a future project needs the community package's extra features (driving/pedestrian/bicycle routing, search), check whether it has been updated for AGP 9+ compatibility first.
- **API key**: `yandex_maps_mapkit_lite` sets the key via a Dart call (`initMapkit(apiKey: ...)` in `main.dart`), not native Android manifest/resource config — simpler than the community package's native `Application.onCreate()` approach.

## Architecture

- **State**: Riverpod (`flutter_riverpod`).
- **HTTP**: `dio`, wrapped by `lib/core/api/api_client.dart` which unwraps the backend's uniform `{data, status, message, success}` response envelope and throws `ApiException` on failure (mirrors `frontend/service/Service.ts`).
- **Routing**: `go_router`, with `StatefulShellRoute` bottom-nav shells for the patient and doctor areas, and an auth/role-aware `redirect`.
- **Auth**: JWT stored via `flutter_secure_storage`, behind a small `SecureStore` interface (`lib/core/auth/auth_state.dart`) so tests can swap in an in-memory fake — the real plugin's platform channel can hang (not throw) under `flutter test`.
- **Models**: one Dart class per actual backend response shape (not one shared `Doctor`/`Clinic` model reused everywhere) — the backend nests doctors/clinics differently per endpoint (see `backend/src/clinics/clinics.controller.ts` vs `backend/src/doctors/doctors.controller.ts`), so a single shared model would need every field optional and lose type safety.
- **i18n**: `uz` (default) / `ru` / `en` via `flutter gen-l10n`, ARB files in `lib/l10n/`.

## Verification done

- `flutter analyze` — 0 issues.
- `flutter test` — 10/10 passing (API envelope unwrap/error-path tests, model parsing tests against real endpoint response shapes, an auth-flow widget test).
- `flutter build apk --debug` — succeeds, produces an installable APK.

Not done (no Android emulator/device available in the environment this was built in): actually running the app against a live backend, or testing the Yandex map with a real key, or testing Google Sign-In end-to-end. Recommend testing all three manually before shipping.
