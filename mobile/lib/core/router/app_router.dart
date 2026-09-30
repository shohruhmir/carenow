import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../auth/auth_state.dart';
import '../models/enums.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/otp_screen.dart';
import '../../features/doctor/availability_screen.dart';
import '../../features/doctor/bookings_screen.dart';
import '../../features/doctor/dashboard_screen.dart';
import '../../features/doctor/doctor_shell.dart';
import '../../features/patient/bookings/my_bookings_screen.dart';
import '../../features/patient/clinics/clinic_detail_screen.dart';
import '../../features/patient/clinics/clinics_list_screen.dart';
import '../../features/patient/clinics/clinics_map_screen.dart';
import '../../features/patient/doctors/doctor_detail_screen.dart';
import '../../features/patient/doctors/doctors_list_screen.dart';
import '../../features/patient/favorites/favorites_screen.dart';
import '../../features/patient/patient_shell.dart';
import '../../features/patient/profile/profile_screen.dart';

class _RouterRefreshNotifier extends ChangeNotifier {
  _RouterRefreshNotifier(Ref ref) {
    ref.listen(authNotifierProvider, (previous, next) {
      if (previous?.isAuthenticated != next.isAuthenticated || previous?.isLoading != next.isLoading) {
        notifyListeners();
      }
    });
  }
}

final _routerRefreshProvider = Provider<_RouterRefreshNotifier>((ref) => _RouterRefreshNotifier(ref));

final routerProvider = Provider<GoRouter>((ref) {
  final refresh = ref.watch(_routerRefreshProvider);

  return GoRouter(
    initialLocation: '/login',
    refreshListenable: refresh,
    redirect: (context, state) {
      final auth = ref.read(authNotifierProvider);
      final loc = state.matchedLocation;
      final loggingIn = loc.startsWith('/login');

      if (auth.isLoading) return null;

      if (!auth.isAuthenticated) {
        return loggingIn ? null : '/login';
      }

      final isDoctor = auth.user!.role == Role.doctor;
      if (loggingIn) return isDoctor ? '/doctor/dashboard' : '/patient/doctors';

      if (loc.startsWith('/doctor') && !isDoctor) return '/patient/doctors';
      if (loc.startsWith('/patient') && isDoctor) return '/doctor/dashboard';

      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/login/otp',
        builder: (context, state) => OtpScreen(
          phone: state.uri.queryParameters['phone'] ?? '',
          devCode: state.uri.queryParameters['devCode'],
        ),
      ),

      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) => PatientShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/patient/doctors',
              builder: (context, state) => const DoctorsListScreen(),
              routes: [
                GoRoute(
                  path: ':id',
                  builder: (context, state) => DoctorDetailScreen(doctorId: state.pathParameters['id']!),
                ),
              ],
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/patient/clinics',
              builder: (context, state) => const ClinicsListScreen(),
              routes: [
                GoRoute(path: 'map', builder: (context, state) => const ClinicsMapScreen()),
                GoRoute(
                  path: ':slug',
                  builder: (context, state) => ClinicDetailScreen(slug: state.pathParameters['slug']!),
                ),
              ],
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/patient/bookings', builder: (context, state) => const MyBookingsScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/patient/favorites', builder: (context, state) => const FavoritesScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/patient/profile', builder: (context, state) => const ProfileScreen()),
          ]),
        ],
      ),

      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) => DoctorShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(path: '/doctor/dashboard', builder: (context, state) => const DoctorDashboardScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/doctor/availability', builder: (context, state) => const DoctorAvailabilityScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/doctor/bookings', builder: (context, state) => const DoctorBookingsScreen()),
          ]),
        ],
      ),
    ],
  );
});
