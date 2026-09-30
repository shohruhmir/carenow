import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../../../core/api/api_client.dart';
import '../../../core/api/repository.dart';
import '../../../core/auth/auth_state.dart';
import '../../../l10n/generated/app_localizations.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phoneController = TextEditingController(text: '+998');
  bool _submitting = false;
  String? _error;

  final _googleSignIn = GoogleSignIn(scopes: ['email']);

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  bool _isValidPhone(String phone) => RegExp(r'^\+998\d{9}$').hasMatch(phone);

  Future<void> _submitPhone() async {
    final t = AppLocalizations.of(context)!;
    final phone = _phoneController.text.trim();
    if (!_isValidPhone(phone)) {
      setState(() => _error = t.authInvalidPhone);
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final result = await ref.read(apiRepositoryProvider).requestOtp(phone);
      if (!mounted) return;
      final devCode = result['devCode']?.toString();
      final query = {
        'phone': phone,
        // ignore: use_null_aware_elements
        if (devCode != null) 'devCode': devCode,
      };
      context.push('/login/otp?${Uri(queryParameters: query).query}');
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _signInWithGoogle() async {
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final account = await _googleSignIn.signIn();
      if (account == null) {
        setState(() => _submitting = false);
        return;
      }
      final auth = await account.authentication;
      final accessToken = auth.accessToken;
      if (accessToken == null) throw Exception('No Google access token');

      final (token, user) = await ref.read(apiRepositoryProvider).googleLogin(accessToken);
      await ref.read(authNotifierProvider.notifier).setSession(token, user);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Google sign-in failed');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(t.appTitle, style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 32),
                Text(t.authLoginTitle, style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 16),
                Text(t.authPhoneLabel),
                const SizedBox(height: 8),
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(hintText: t.authPhoneHint),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                ],
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: _submitting ? null : _submitPhone,
                  child: _submitting ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2)) : Text(t.authContinueButton),
                ),
                const SizedBox(height: 20),
                Row(children: [
                  const Expanded(child: Divider()),
                  Padding(padding: const EdgeInsets.symmetric(horizontal: 12), child: Text(t.authOrDivider)),
                  const Expanded(child: Divider()),
                ]),
                const SizedBox(height: 20),
                OutlinedButton.icon(
                  onPressed: _submitting ? null : _signInWithGoogle,
                  icon: const Icon(Icons.g_mobiledata),
                  label: Text(t.authGoogleButton),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
