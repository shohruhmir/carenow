import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:yandex_maps_mapkit_lite/init.dart' as mapkit_init;

import 'core/auth/auth_state.dart';
import 'core/config/env.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'l10n/generated/app_localizations.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (yandexMapkitApiKey.isNotEmpty) {
    await mapkit_init.initMapkit(apiKey: yandexMapkitApiKey);
  }
  runApp(const ProviderScope(child: CareNowApp()));
}

class CareNowApp extends ConsumerWidget {
  const CareNowApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final authLoading = ref.watch(authNotifierProvider.select((s) => s.isLoading));

    return MaterialApp.router(
      title: 'CareNow',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: ThemeMode.system,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      routerConfig: router,
      builder: (context, child) {
        if (authLoading) {
          return const _SplashScreen();
        }
        return child ?? const SizedBox.shrink();
      },
    );
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
