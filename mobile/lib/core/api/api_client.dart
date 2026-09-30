import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/auth_state.dart';

/// The backend's default port when running locally is 3000, with no global
/// path prefix (bare routes like /doctors, not /api/doctors).
/// 10.0.2.2 is the special alias the Android emulator uses to reach the
/// host machine's localhost — override with --dart-define=API_BASE_URL=...
/// for a real device on the same network.
const _defaultBaseUrl = 'http://10.0.2.2:3000';
const apiBaseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: _defaultBaseUrl);

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, [this.statusCode]);

  @override
  String toString() => message;
}

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: apiBaseUrl,
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
  ));

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) {
      final token = ref.read(authNotifierProvider).token;
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      handler.next(options);
    },
    onError: (error, handler) {
      if (error.response?.statusCode == 401) {
        ref.read(authNotifierProvider.notifier).clear();
      }
      handler.next(error);
    },
  ));

  return dio;
});

/// Thin wrapper that unwraps the backend's uniform
/// `{ data, status, message, success }` response envelope (see
/// backend/src/common/response.interceptor.ts) and turns any failure —
/// network error, non-2xx, or `success: false` — into an [ApiException].
class ApiClient {
  final Dio _dio;
  ApiClient(this._dio);

  Future<T> get<T>(String path, T Function(dynamic) parse, {Map<String, dynamic>? query}) =>
      _unwrap(() => _dio.get(path, queryParameters: query), parse);

  Future<T> post<T>(String path, dynamic body, T Function(dynamic) parse) =>
      _unwrap(() => _dio.post(path, data: body), parse);

  Future<T> patch<T>(String path, dynamic body, T Function(dynamic) parse) =>
      _unwrap(() => _dio.patch(path, data: body), parse);

  Future<T> delete<T>(String path, T Function(dynamic) parse) =>
      _unwrap(() => _dio.delete(path), parse);

  Future<T> _unwrap<T>(Future<Response> Function() request, T Function(dynamic) parse) async {
    try {
      final res = await request();
      final body = res.data;
      if (body is Map && body['success'] == true) {
        return parse(body['data']);
      }
      throw ApiException(_extractMessage(body) ?? 'Unknown error', res.statusCode);
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        throw ApiException('network_error', e.response?.statusCode);
      }
      throw ApiException(_extractMessage(e.response?.data) ?? 'network_error', e.response?.statusCode);
    }
  }

  String? _extractMessage(dynamic body) {
    if (body is Map && body['message'] != null) {
      final message = body['message'];
      if (message is List && message.isNotEmpty) return message.first.toString();
      return message.toString();
    }
    return null;
  }
}

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient(ref.watch(dioProvider)));
