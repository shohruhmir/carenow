import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:carenow_app/core/api/api_client.dart';

/// A minimal fake transport so these tests never touch the network — it
/// just returns whatever canned (statusCode, body) pair was queued.
class _FakeAdapter implements HttpClientAdapter {
  final int statusCode;
  final Map<String, dynamic> body;
  _FakeAdapter(this.statusCode, this.body);

  @override
  void close({bool force = false}) {}

  @override
  Future<ResponseBody> fetch(RequestOptions options, Stream<Uint8List>? requestStream, Future<void>? cancelFuture) async {
    final bytes = utf8.encode(jsonEncode(body));
    return ResponseBody.fromBytes(bytes, statusCode, headers: {
      Headers.contentTypeHeader: [Headers.jsonContentType],
    });
  }
}

Dio _dioWith(int statusCode, Map<String, dynamic> body) {
  final dio = Dio(BaseOptions(baseUrl: 'http://test.local'));
  dio.httpClientAdapter = _FakeAdapter(statusCode, body);
  return dio;
}

void main() {
  group('ApiClient envelope unwrapping', () {
    test('returns parsed data on success:true', () async {
      final dio = _dioWith(200, {'success': true, 'status': 200, 'message': 'ok', 'data': {'id': '1', 'name': 'Test'}});
      final client = ApiClient(dio);
      final result = await client.get('/whatever', (data) => data['name'] as String);
      expect(result, 'Test');
    });

    test('throws ApiException with the backend message on success:false', () async {
      final dio = _dioWith(200, {'success': false, 'status': 400, 'message': 'Invalid or expired code', 'data': null});
      final client = ApiClient(dio);
      await expectLater(
        client.get('/whatever', (data) => data),
        throwsA(isA<ApiException>().having((e) => e.message, 'message', 'Invalid or expired code')),
      );
    });

    test('extracts the first validation message when message is a list', () async {
      final dio = _dioWith(200, {
        'success': false,
        'status': 400,
        'message': ['phone must match /^\\+998\\d{9}\$/'],
        'data': null,
      });
      final client = ApiClient(dio);
      await expectLater(
        client.get('/whatever', (data) => data),
        throwsA(isA<ApiException>().having((e) => e.message, 'message', contains('phone must match'))),
      );
    });
  });
}
