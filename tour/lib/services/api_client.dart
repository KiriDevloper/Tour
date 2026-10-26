import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/config.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Gọi API chung: tự gắn token, tự đọc lỗi từ backend.
class ApiClient {
  static String? token;

  static Map<String, String> get _headers => {
        'Content-Type': 'application/json; charset=utf-8',
        if (token != null) 'Authorization': 'Bearer $token',
      };

  static Uri _uri(String path) => Uri.parse('${AppConfig.baseUrl}$path');

  static Future<dynamic> get(String path) =>
      _send(() => http.get(_uri(path), headers: _headers));

  static Future<dynamic> post(String path, [Map<String, dynamic>? body]) =>
      _send(() => http.post(_uri(path),
          headers: _headers, body: jsonEncode(body ?? {})));

  static Future<dynamic> delete(String path) =>
      _send(() => http.delete(_uri(path), headers: _headers));

  static Future<dynamic> _send(Future<http.Response> Function() request) async {
    http.Response res;
    try {
      res = await request().timeout(const Duration(seconds: 10));
    } on TimeoutException {
      throw ApiException('Máy chủ phản hồi quá lâu');
    } catch (_) {
      throw ApiException(
          'Không kết nối được máy chủ. Hãy kiểm tra backend và địa chỉ trong core/config.dart');
    }

    dynamic data;
    try {
      final text = utf8.decode(res.bodyBytes);
      data = text.isEmpty ? null : jsonDecode(text);
    } catch (_) {
      data = null;
    }

    if (res.statusCode >= 200 && res.statusCode < 300) return data;

    final msg = (data is Map && data['message'] != null)
        ? data['message'].toString()
        : 'Có lỗi xảy ra (${res.statusCode})';
    throw ApiException(msg, statusCode: res.statusCode);
  }
}
