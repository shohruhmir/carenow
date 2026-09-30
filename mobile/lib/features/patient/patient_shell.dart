import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../l10n/generated/app_localizations.dart';

class PatientShell extends StatelessWidget {
  final StatefulNavigationShell navigationShell;
  const PatientShell({super.key, required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) => navigationShell.goBranch(index, initialLocation: index == navigationShell.currentIndex),
        destinations: [
          NavigationDestination(icon: const Icon(Icons.medical_services_outlined), selectedIcon: const Icon(Icons.medical_services), label: t.navDoctors),
          NavigationDestination(icon: const Icon(Icons.local_hospital_outlined), selectedIcon: const Icon(Icons.local_hospital), label: t.navClinics),
          NavigationDestination(icon: const Icon(Icons.event_note_outlined), selectedIcon: const Icon(Icons.event_note), label: t.navBookings),
          NavigationDestination(icon: const Icon(Icons.favorite_border), selectedIcon: const Icon(Icons.favorite), label: t.navFavorites),
          NavigationDestination(icon: const Icon(Icons.person_outline), selectedIcon: const Icon(Icons.person), label: t.navProfile),
        ],
      ),
    );
  }
}
