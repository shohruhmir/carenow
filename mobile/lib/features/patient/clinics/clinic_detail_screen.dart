import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/api/repository.dart';
import '../../../core/models/branch.dart';
import '../../../core/models/clinic.dart';
import '../../../core/models/doctor.dart';
import '../../../core/models/service.dart';
import '../../../core/widgets/state_views.dart';
import '../../../l10n/generated/app_localizations.dart';

class ClinicDetailScreen extends ConsumerStatefulWidget {
  final String slug;
  const ClinicDetailScreen({super.key, required this.slug});

  @override
  ConsumerState<ClinicDetailScreen> createState() => _ClinicDetailScreenState();
}

class _ClinicDetailScreenState extends ConsumerState<ClinicDetailScreen> {
  late Future<ClinicDetail> _future;

  @override
  void initState() {
    super.initState();
    _future = ref.read(apiRepositoryProvider).fetchClinic(widget.slug);
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    return FutureBuilder<ClinicDetail>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Scaffold(appBar: AppBar(), body: const LoadingView());
        }
        if (snapshot.hasError) {
          return Scaffold(
            appBar: AppBar(),
            body: ErrorRetryView(
              message: friendlyErrorMessage(context, snapshot.error!),
              onRetry: () => setState(() => _future = ref.read(apiRepositoryProvider).fetchClinic(widget.slug)),
            ),
          );
        }
        final clinic = snapshot.data!;
        return DefaultTabController(
          length: 3,
          child: Scaffold(
            appBar: AppBar(
              title: Text(clinic.name),
              bottom: TabBar(tabs: [
                Tab(text: t.clinicDetailTabBranches),
                Tab(text: t.clinicDetailTabDoctors),
                Tab(text: t.clinicDetailTabServices),
              ]),
            ),
            body: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(children: [
                    const Icon(Icons.star, size: 18, color: Colors.amber),
                    const SizedBox(width: 4),
                    Text(clinic.rating.toStringAsFixed(1)),
                    if (clinic.is247) ...[
                      const SizedBox(width: 12),
                      Chip(label: Text(t.clinicsFilter247), visualDensity: VisualDensity.compact),
                    ],
                  ]),
                ),
                if (clinic.desc != null && clinic.desc!.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Align(alignment: Alignment.centerLeft, child: Text(clinic.desc!)),
                  ),
                const SizedBox(height: 8),
                Expanded(
                  child: TabBarView(children: [
                    _BranchesTab(branches: clinic.branches),
                    _DoctorsTab(doctors: clinic.doctors),
                    _ServicesTab(services: clinic.services),
                  ]),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _BranchesTab extends StatelessWidget {
  final List<Branch> branches;
  const _BranchesTab({required this.branches});

  @override
  Widget build(BuildContext context) {
    if (branches.isEmpty) return const EmptyView(message: '—');
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: branches.length,
      separatorBuilder: (_, _) => const SizedBox(height: 8),
      itemBuilder: (context, i) {
        final b = branches[i];
        return Card(
          margin: EdgeInsets.zero,
          child: ListTile(
            title: Text(b.name),
            subtitle: Text('${b.address}\n${b.phone}'),
            isThreeLine: true,
          ),
        );
      },
    );
  }
}

class _DoctorsTab extends StatelessWidget {
  final List<Doctor> doctors;
  const _DoctorsTab({required this.doctors});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    if (doctors.isEmpty) return EmptyView(message: t.doctorsEmpty);
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: doctors.length,
      separatorBuilder: (_, _) => const SizedBox(height: 8),
      itemBuilder: (context, i) {
        final d = doctors[i];
        return Card(
          margin: EdgeInsets.zero,
          child: ListTile(
            title: Text(d.name),
            subtitle: Text('${d.specialty} · ${t.doctorDetailExperience(d.experienceYrs.toString())}'),
            trailing: Row(mainAxisSize: MainAxisSize.min, children: [
              const Icon(Icons.star, size: 16, color: Colors.amber),
              const SizedBox(width: 4),
              Text(d.rating.toStringAsFixed(1)),
            ]),
            onTap: () => context.push('/patient/doctors/${d.id}'),
          ),
        );
      },
    );
  }
}

class _ServicesTab extends StatelessWidget {
  final List<ClinicService> services;
  const _ServicesTab({required this.services});

  @override
  Widget build(BuildContext context) {
    if (services.isEmpty) return const EmptyView(message: '—');
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: services.length,
      separatorBuilder: (_, _) => const Divider(height: 1),
      itemBuilder: (context, i) {
        final s = services[i];
        return ListTile(
          title: Text(s.name),
          trailing: Text("${s.price} UZS"),
        );
      },
    );
  }
}
