import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/repository.dart';
import '../../core/models/doctor.dart';
import '../../core/widgets/state_views.dart';
import '../../l10n/generated/app_localizations.dart';

class DoctorDashboardScreen extends ConsumerStatefulWidget {
  const DoctorDashboardScreen({super.key});

  @override
  ConsumerState<DoctorDashboardScreen> createState() => _DoctorDashboardScreenState();
}

class _DoctorDashboardScreenState extends ConsumerState<DoctorDashboardScreen> {
  late Future<Doctor> _future;

  @override
  void initState() {
    super.initState();
    _future = ref.read(apiRepositoryProvider).doctorPortalMe();
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(t.doctorPanelDashboardTitle)),
      body: FutureBuilder<Doctor>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const LoadingView();
          if (snapshot.hasError) {
            return ErrorRetryView(
              message: friendlyErrorMessage(context, snapshot.error!),
              onRetry: () => setState(() => _future = ref.read(apiRepositoryProvider).doctorPortalMe()),
            );
          }
          final doctor = snapshot.data!;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text(doctor.name, style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 4),
              Text(doctor.specialty),
              const SizedBox(height: 12),
              Row(children: [
                const Icon(Icons.star, size: 18, color: Colors.amber),
                const SizedBox(width: 4),
                Text('${doctor.rating.toStringAsFixed(1)} · ${t.doctorDetailReviews(doctor.reviewsCount)}'),
              ]),
              const Divider(height: 32),
              if (doctor.clinic != null) ...[
                Text(doctor.clinic!.name, style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 4),
              ],
              if (doctor.branch != null) Text(doctor.branch!.address),
            ],
          );
        },
      ),
    );
  }
}
