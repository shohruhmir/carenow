import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/api/repository.dart';
import '../../../core/models/clinic.dart';
import '../../../core/widgets/state_views.dart';
import '../../../l10n/generated/app_localizations.dart';

enum _ClinicFilter { all, open247, kids, network, topRated }

class ClinicsListScreen extends ConsumerStatefulWidget {
  const ClinicsListScreen({super.key});

  @override
  ConsumerState<ClinicsListScreen> createState() => _ClinicsListScreenState();
}

class _ClinicsListScreenState extends ConsumerState<ClinicsListScreen> {
  late Future<List<ClinicSummary>> _future;
  final _searchController = TextEditingController();
  Timer? _debounce;
  _ClinicFilter _filter = _ClinicFilter.all;

  @override
  void initState() {
    super.initState();
    _future = ref.read(apiRepositoryProvider).fetchClinics();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      setState(() => _future = ref.read(apiRepositoryProvider).fetchClinics(q: value));
    });
  }

  Future<void> _refresh() async {
    setState(() => _future = ref.read(apiRepositoryProvider).fetchClinics(q: _searchController.text));
    await _future;
  }

  List<ClinicSummary> _applyFilter(List<ClinicSummary> clinics) {
    switch (_filter) {
      case _ClinicFilter.all:
        return clinics;
      case _ClinicFilter.open247:
        return clinics.where((c) => c.is247).toList();
      case _ClinicFilter.kids:
        return clinics.where((c) => c.hasKidsSpecialist).toList();
      case _ClinicFilter.network:
        return clinics.where((c) => c.branches.length > 1).toList();
      case _ClinicFilter.topRated:
        final sorted = [...clinics]..sort((a, b) => b.rating.compareTo(a.rating));
        return sorted;
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    final filters = <(_ClinicFilter, String)>[
      (_ClinicFilter.all, t.clinicsFilterAll),
      (_ClinicFilter.open247, t.clinicsFilter247),
      (_ClinicFilter.kids, t.clinicsFilterKids),
      (_ClinicFilter.network, t.clinicsFilterNetwork),
      (_ClinicFilter.topRated, t.clinicsFilterTopRated),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text(t.clinicsTitle),
        actions: [
          IconButton(
            icon: const Icon(Icons.map_outlined),
            tooltip: t.clinicsMapButton,
            onPressed: () => context.push('/patient/clinics/map'),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              decoration: InputDecoration(prefixIcon: const Icon(Icons.search), hintText: t.clinicsSearchHint),
            ),
          ),
          SizedBox(
            height: 52,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: filters.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (context, i) {
                final (value, label) = filters[i];
                return ChoiceChip(
                  label: Text(label),
                  selected: _filter == value,
                  onSelected: (_) => setState(() => _filter = value),
                );
              },
            ),
          ),
          Expanded(
            child: FutureBuilder<List<ClinicSummary>>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) return const LoadingView();
                if (snapshot.hasError) {
                  return ErrorRetryView(message: friendlyErrorMessage(context, snapshot.error!), onRetry: _refresh);
                }
                final clinics = _applyFilter(snapshot.data ?? []);
                if (clinics.isEmpty) {
                  return EmptyView(message: t.clinicsEmpty, icon: Icons.local_hospital_outlined);
                }
                return RefreshIndicator(
                  onRefresh: _refresh,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: clinics.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemBuilder: (context, index) => _ClinicTile(clinic: clinics[index]),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _ClinicTile extends StatelessWidget {
  final ClinicSummary clinic;
  const _ClinicTile({required this.clinic});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    return Card(
      margin: EdgeInsets.zero,
      child: ListTile(
        contentPadding: const EdgeInsets.all(12),
        title: Text(clinic.name, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (clinic.desc != null && clinic.desc!.isNotEmpty) Text(clinic.desc!, maxLines: 2, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 4),
            Row(children: [
              const Icon(Icons.star, size: 16, color: Colors.amber),
              const SizedBox(width: 4),
              Text(clinic.rating.toStringAsFixed(1)),
              const SizedBox(width: 8),
              Text('· ${t.clinicsDoctorsCount(clinic.doctorCount)}'),
              if (clinic.is247) ...[
                const SizedBox(width: 8),
                Chip(label: Text(t.clinicsFilter247), visualDensity: VisualDensity.compact),
              ],
            ]),
          ],
        ),
        isThreeLine: true,
        onTap: () => context.push('/patient/clinics/${clinic.slug}'),
      ),
    );
  }
}
