import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../l10n/generated/app_localizations.dart';

class DoctorShell extends StatelessWidget {
  final StatefulNavigationShell navigationShell;
  const DoctorShell({super.key, required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) => navigationShell.goBranch(index, initialLocation: index == navigationShell.currentIndex),
        destinations: [
          NavigationDestination(icon: const Icon(Icons.dashboard_outlined), selectedIcon: const Icon(Icons.dashboard), label: t.doctorPanelDashboardTitle),
          NavigationDestination(icon: const Icon(Icons.schedule_outlined), selectedIcon: const Icon(Icons.schedule), label: t.doctorPanelAvailabilityTitle),
          NavigationDestination(icon: const Icon(Icons.event_note_outlined), selectedIcon: const Icon(Icons.event_note), label: t.doctorPanelBookingsTitle),
        ],
      ),
    );
  }
}
