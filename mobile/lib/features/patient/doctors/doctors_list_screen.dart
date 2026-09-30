import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/api/repository.dart';
import '../../../core/models/doctor.dart';
import '../../../core/widgets/state_views.dart';
import '../../../l10n/generated/app_localizations.dart';

class DoctorsListScreen extends ConsumerStatefulWidget {
  const DoctorsListScreen({super.key});

  @override
  ConsumerState<DoctorsListScreen> createState() => _DoctorsListScreenState();
}

class _DoctorsListScreenState extends ConsumerState<DoctorsListScreen> {
  late Future<List<Doctor>> _future;
  final _searchController = TextEditingController();
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _future = ref.read(apiRepositoryProvider).fetchDoctors();
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
      setState(() => _future = ref.read(apiRepositoryProvider).fetchDoctors(q: value));
    });
  }

  Future<void> _refresh() async {
    setState(() => _future = ref.read(apiRepositoryProvider).fetchDoctors(q: _searchController.text));
    await _future;
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(t.doctorsTitle)),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.search),
                hintText: t.doctorsSearchHint,
              ),
            ),
          ),
          Expanded(
            child: FutureBuilder<List<Doctor>>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) return const LoadingView();
                if (snapshot.hasError) {
                  return ErrorRetryView(message: friendlyErrorMessage(context, snapshot.error!), onRetry: _refresh);
                }
                final doctors = snapshot.data ?? [];
                if (doctors.isEmpty) {
                  return EmptyView(message: t.doctorsEmpty, icon: Icons.medical_services_outlined);
                }
                return RefreshIndicator(
                  onRefresh: _refresh,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: doctors.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemBuilder: (context, index) => _DoctorTile(doctor: doctors[index]),
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

class _DoctorTile extends StatelessWidget {
  final Doctor doctor;
  const _DoctorTile({required this.doctor});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    return Card(
      margin: EdgeInsets.zero,
      child: ListTile(
        contentPadding: const EdgeInsets.all(12),
        leading: CircleAvatar(
          radius: 26,
          child: Text(doctor.name.isNotEmpty ? doctor.name.substring(0, 1).toUpperCase() : '?'),
        ),
        title: Text(doctor.name, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${doctor.specialty} · ${t.doctorDetailExperience(doctor.experienceYrs.toString())}'),
            if (doctor.clinic != null) Text(doctor.clinic!.name, style: Theme.of(context).textTheme.bodySmall),
            Row(children: [
              const Icon(Icons.star, size: 16, color: Colors.amber),
              const SizedBox(width: 4),
              Text(doctor.rating.toStringAsFixed(1)),
              const SizedBox(width: 8),
              Text('· ${t.doctorDetailReviews(doctor.reviewsCount)}'),
            ]),
          ],
        ),
        isThreeLine: true,
        onTap: () => context.push('/patient/doctors/${doctor.id}'),
      ),
    );
  }
}
