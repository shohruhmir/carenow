/// Get a real key at https://developer.tech.yandex.ru/services/ — see
/// mobile/README.md. Passed at build time so no real key needs to live in
/// source: --dart-define=YANDEX_MAPKIT_API_KEY=xxxxx
const yandexMapkitApiKey = String.fromEnvironment('YANDEX_MAPKIT_API_KEY');
