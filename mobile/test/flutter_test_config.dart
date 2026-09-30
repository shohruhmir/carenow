import 'dart:async';

import 'package:google_fonts/google_fonts.dart';

/// google_fonts tries to fetch font files over the network on first use;
/// in the test sandbox that either hangs pumpAndSettle or throws. Disabling
/// runtime fetching falls back to the platform's default font instead,
/// which is all a test needs (see google_fonts' own testing docs).
Future<void> testExecutable(FutureOr<void> Function() testMain) async {
  GoogleFonts.config.allowRuntimeFetching = false;
  await testMain();
}
