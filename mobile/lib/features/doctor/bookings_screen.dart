import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/api/repository.dart';
import '../../core/models/booking.dart';
import '../../core/widgets/state_views.dart';
import '../../l10n/generated/app_localizations.dart';

class DoctorBookingsScreen extends ConsumerStatefulWidget {
  const DoctorBookingsScreen({super.key});

  @override
  ConsumerState<DoctorBookingsScreen> createState() => _DoctorBookingsScreenState();
}

class _DoctorBookingsScreenState extends ConsumerState<DoctorBookingsScreen> {
  late Future<List<Booking>> _future;

  @override
  void initState() {
    super.initState();
    _future = ref.read(apiRepositoryProvider).doctorPortalBookings();
  }

  Future<void> _refresh() async {
    setState(() => _future = ref.read(apiRepositoryProvider).doctorPortalBookings());
    await _future;
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(t.doctorPanelBookingsTitle)),
      body: FutureBuilder<List<Booking>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const LoadingView();
          if (snapshot.hasError) {
            return ErrorRetryView(message: friendlyErrorMessage(context, snapshot.error!), onRetry: _refresh);
          }
          final bookings = snapshot.data ?? [];
          if (bookings.isEmpty) {
            return EmptyView(message: t.doctorPanelNoBookings, icon: Icons.event_busy_outlined);
          }
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: bookings.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, i) {
                final b = bookings[i];
                return Card(
                  margin: EdgeInsets.zero,
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(12),
                    title: Text('${DateFormat.yMMMd().format(b.date)} · ${b.time}'),
                    subtitle: b.patient != null
                        ? Text('${t.doctorPanelPatientLabel}: ${b.patient!.name ?? b.patient!.phone ?? ''}')
                        : null,
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
