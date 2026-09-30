import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:carenow_app/core/auth/auth_state.dart';
import 'package:carenow_app/main.dart';

/// In-memory stand-in for [FlutterSecureStore] — the real plugin talks to a
/// platform channel that isn't available (and can hang, rather than throw)
/// under `flutter test`, so widget tests never touch it.
class FakeSecureStore implements SecureStore {
  final Map<String, String> _values = {};

  @override
  Future<String?> read({required String key}) async => _values[key];

  @override
  Future<void> write({required String key, required String value}) async => _values[key] = value;

  @override
  Future<void> delete({required String key}) async => _values.remove(key);
}

void main() {
  testWidgets('boots to the login screen when logged out', (WidgetTester tester) async {
    await tester.pumpWidget(ProviderScope(
      overrides: [secureStorageProvider.overrideWithValue(FakeSecureStore())],
      child: const CareNowApp(),
    ));

    // First frame: auth restore hasn't resolved yet.
    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    // Let the async auth restore + router redirect settle.
    await tester.pumpAndSettle();

    // Locale-independent: the app name and the phone/continue login form.
    expect(find.text('CareNow'), findsOneWidget);
    expect(find.byType(TextField), findsOneWidget);
    expect(find.byType(ElevatedButton), findsOneWidget);
  });
}
