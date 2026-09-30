import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:yandex_maps_mapkit_lite/mapkit.dart';
import 'package:yandex_maps_mapkit_lite/yandex_map.dart';

import '../../../core/api/repository.dart';
import '../../../core/config/env.dart';
import '../../../core/models/branch.dart';
import '../../../core/models/clinic.dart';
import '../../../core/widgets/state_views.dart';
import '../../../l10n/generated/app_localizations.dart';

class ClinicsMapScreen extends ConsumerStatefulWidget {
  const ClinicsMapScreen({super.key});

  @override
  ConsumerState<ClinicsMapScreen> createState() => _ClinicsMapScreenState();
}

class _ClinicBranchTapListener implements MapObjectTapListener {
  final void Function(String clinicSlug) onTap;
  _ClinicBranchTapListener(this.onTap);

  @override
  bool onMapObjectTap(MapObject mapObject, Point point) {
    final slug = mapObject.userData;
    if (slug is String) onTap(slug);
    return true;
  }
}

class _ClinicsMapScreenState extends ConsumerState<ClinicsMapScreen> {
  late Future<List<ClinicSummary>> _future;

  @override
  void initState() {
    super.initState();
    _future = ref.read(apiRepositoryProvider).fetchClinics();
  }

  List<({ClinicSummary clinic, Branch branch})> _allBranches(List<ClinicSummary> clinics) =>
      clinics.expand((c) => c.branches.map((b) => (clinic: c, branch: b))).toList();

  void _placeMarks(Map map, List<({ClinicSummary clinic, Branch branch})> branches) {
    map.mapObjects.clear();
    final listener = _ClinicBranchTapListener((slug) => context.push('/patient/clinics/$slug'));
    for (final entry in branches) {
      final placemark = map.mapObjects.addPlacemarkWithPoint(
        Point(latitude: entry.branch.lat, longitude: entry.branch.lng),
      );
      placemark.userData = entry.clinic.slug;
      placemark.addTapListener(listener);
    }
    if (branches.isNotEmpty) {
      map.move(
        CameraPosition(
          Point(latitude: branches.first.branch.lat, longitude: branches.first.branch.lng),
          zoom: 11,
          azimuth: 0,
          tilt: 0,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(t.clinicsTitle)),
      body: FutureBuilder<List<ClinicSummary>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const LoadingView();
          if (snapshot.hasError) {
            return ErrorRetryView(
              message: friendlyErrorMessage(context, snapshot.error!),
              onRetry: () => setState(() => _future = ref.read(apiRepositoryProvider).fetchClinics()),
            );
          }
          final branches = _allBranches(snapshot.data ?? []);

          if (yandexMapkitApiKey.isEmpty) {
            return _NoKeyFallback(branches: branches);
          }

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Align(alignment: Alignment.centerLeft, child: Text(t.mapBranchesCount(branches.length))),
              ),
              Expanded(
                child: YandexMap(
                  onMapCreated: (mapWindow) => _placeMarks(mapWindow.map, branches),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _NoKeyFallback extends StatelessWidget {
  final List<({ClinicSummary clinic, Branch branch})> branches;
  const _NoKeyFallback({required this.branches});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          color: Theme.of(context).colorScheme.surfaceContainerHighest,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(t.mapNoKeyTitle, style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 4),
              Text(t.mapNoKeyMessage),
            ],
          ),
        ),
        Expanded(
          child: branches.isEmpty
              ? EmptyView(message: t.clinicsEmpty)
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: branches.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 8),
                  itemBuilder: (context, i) {
                    final entry = branches[i];
                    return Card(
                      margin: EdgeInsets.zero,
                      child: ListTile(
                        title: Text(entry.clinic.name),
                        subtitle: Text(entry.branch.address),
                        onTap: () => context.push('/patient/clinics/${entry.clinic.slug}'),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
