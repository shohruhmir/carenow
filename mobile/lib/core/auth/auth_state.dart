import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../models/user.dart';

const _tokenKey = 'auth_token';
const _userKey = 'auth_user';

/// Thin seam over [FlutterSecureStorage] so widget/unit tests can swap in
/// an in-memory fake instead of hitting the real platform channel (which
/// hangs rather than throwing under `flutter test` on some platforms).
abstract class SecureStore {
  Future<String?> read({required String key});
  Future<void> write({required String key, required String value});
  Future<void> delete({required String key});
}

class FlutterSecureStore implements SecureStore {
  const FlutterSecureStore();
  static const _storage = FlutterSecureStorage();

  @override
  Future<String?> read({required String key}) => _storage.read(key: key);

  @override
  Future<void> write({required String key, required String value}) => _storage.write(key: key, value: value);

  @override
  Future<void> delete({required String key}) => _storage.delete(key: key);
}

class AuthState {
  final String? token;
  final User? user;
  final bool isLoading;

  const AuthState({this.token, this.user, this.isLoading = true});

  bool get isAuthenticated => token != null && user != null;

  AuthState copyWith({String? token, User? user, bool? isLoading}) => AuthState(
        token: token ?? this.token,
        user: user ?? this.user,
        isLoading: isLoading ?? this.isLoading,
      );
}

class AuthNotifier extends StateNotifier<AuthState> {
  final SecureStore _storage;

  AuthNotifier(this._storage) : super(const AuthState()) {
    _restore();
  }

  Future<void> _restore() async {
    try {
      final token = await _storage.read(key: _tokenKey);
      final userJson = await _storage.read(key: _userKey);
      if (token != null && userJson != null) {
        state = AuthState(token: token, user: User.fromJson(jsonDecode(userJson) as Map<String, dynamic>), isLoading: false);
        return;
      }
    } catch (_) {
      // Corrupt/unreadable cache — fall through to a clean logged-out state.
    }
    state = const AuthState(isLoading: false);
  }

  Future<void> setSession(String token, User user) async {
    await _storage.write(key: _tokenKey, value: token);
    await _storage.write(key: _userKey, value: jsonEncode(user.toJson()));
    state = AuthState(token: token, user: user, isLoading: false);
  }

  Future<void> updateUser(User user) async {
    await _storage.write(key: _userKey, value: jsonEncode(user.toJson()));
    state = state.copyWith(user: user);
  }

  Future<void> clear() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _userKey);
    state = const AuthState(isLoading: false);
  }
}

final secureStorageProvider = Provider<SecureStore>((ref) => const FlutterSecureStore());

final authNotifierProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(ref.watch(secureStorageProvider)),
);
