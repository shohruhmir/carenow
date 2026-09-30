import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_client.dart';
import '../../../core/api/repository.dart';
import '../../../core/auth/auth_state.dart';
import '../../../l10n/generated/app_localizations.dart';

class OtpScreen extends ConsumerStatefulWidget {
  final String phone;
  final String? devCode;
  const OtpScreen({super.key, required this.phone, this.devCode});

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _codeController = TextEditingController();
  bool _submitting = false;
  bool _resending = false;
  String? _error;

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    final t = AppLocalizations.of(context)!;
    final code = _codeController.text.trim();
    if (code.length != 4) {
      setState(() => _error = t.authInvalidCode);
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final (token, user) = await ref.read(apiRepositoryProvider).verifyOtp(widget.phone, code);
      await ref.read(authNotifierProvider.notifier).setSession(token, user);
      // Router redirect handles navigation once auth state flips.
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _resend() async {
    setState(() => _resending = true);
    try {
      await ref.read(apiRepositoryProvider).requestOtp(widget.phone);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _resending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(t.authOtpTitle)),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(t.authOtpSubtitle(widget.phone)),
              if (widget.devCode != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: Colors.amber.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                  child: Text(t.authDevCodeHint(widget.devCode!)),
                ),
              ],
              const SizedBox(height: 20),
              TextField(
                controller: _codeController,
                keyboardType: TextInputType.number,
                maxLength: 4,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 28, letterSpacing: 8),
                decoration: InputDecoration(labelText: t.authOtpLabel),
              ),
              if (_error != null) ...[
                const SizedBox(height: 8),
                Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              ],
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _submitting ? null : _verify,
                child: _submitting ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2)) : Text(t.authVerifyButton),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: _resending ? null : _resend,
                child: Text(t.authResendCode),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
