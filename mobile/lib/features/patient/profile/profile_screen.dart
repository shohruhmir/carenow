import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/repository.dart';
import '../../../core/auth/auth_state.dart';
import '../../../core/widgets/state_views.dart';
import '../../../l10n/generated/app_localizations.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  late final TextEditingController _nameController;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authNotifierProvider).user;
    _nameController = TextEditingController(text: user?.name ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final updated = await ref.read(apiRepositoryProvider).updateProfile(_nameController.text.trim());
      await ref.read(authNotifierProvider.notifier).updateUser(updated);
      if (mounted) {
        final t = AppLocalizations.of(context)!;
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(t.profileSavedMessage)));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyErrorMessage(context, e))));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _logout() async {
    final t = AppLocalizations.of(context)!;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        content: Text(t.profileLogoutConfirm),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: Text(t.commonCancel)),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: Text(t.profileLogoutButton)),
        ],
      ),
    );
    if (confirmed == true) {
      await ref.read(authNotifierProvider.notifier).clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    final user = ref.watch(authNotifierProvider).user;
    return Scaffold(
      appBar: AppBar(title: Text(t.profileTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (user?.phone != null) Text(user!.phone!, style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 16),
          Text(t.profileNameLabel),
          const SizedBox(height: 8),
          TextField(controller: _nameController),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _saving ? null : _save,
            child: _saving ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2)) : Text(t.profileSaveButton),
          ),
          const SizedBox(height: 32),
          OutlinedButton.icon(onPressed: _logout, icon: const Icon(Icons.logout), label: Text(t.profileLogoutButton)),
        ],
      ),
    );
  }
}
