import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/api/repository.dart';
import '../../../core/models/favorite.dart';
import '../../../core/widgets/state_views.dart';
import '../../../l10n/generated/app_localizations.dart';

class FavoritesScreen extends ConsumerStatefulWidget {
  const FavoritesScreen({super.key});

  @override
  ConsumerState<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends ConsumerState<FavoritesScreen> {
  late Future<List<Favorite>> _future;

  @override
  void initState() {
    super.initState();
    _future = ref.read(apiRepositoryProvider).myFavorites();
  }

  Future<void> _refresh() async {
    setState(() => _future = ref.read(apiRepositoryProvider).myFavorites());
    await _future;
  }

  Future<void> _remove(Favorite favorite) async {
    try {
      await ref.read(apiRepositoryProvider).removeFavorite(favorite.doctorId);
      await _refresh();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyErrorMessage(context, e))));
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(t.favoritesTitle)),
      body: FutureBuilder<List<Favorite>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const LoadingView();
          if (snapshot.hasError) {
            return ErrorRetryView(message: friendlyErrorMessage(context, snapshot.error!), onRetry: _refresh);
          }
          final favorites = snapshot.data ?? [];
          if (favorites.isEmpty) {
            return EmptyView(message: t.favoritesEmpty, icon: Icons.favorite_border);
          }
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: favorites.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, i) {
                final f = favorites[i];
                final doctor = f.doctor;
                return Card(
                  margin: EdgeInsets.zero,
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(12),
                    title: Text(doctor?.name ?? ''),
                    subtitle: doctor != null
                        ? Text('${doctor.specialty}${doctor.clinic != null ? ' · ${doctor.clinic!.name}' : ''}')
                        : null,
                    trailing: IconButton(icon: const Icon(Icons.favorite), color: Colors.red, onPressed: () => _remove(f)),
                    onTap: () => context.push('/patient/doctors/${f.doctorId}'),
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
