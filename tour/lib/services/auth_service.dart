import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import 'api_client.dart';

class AuthService {
  static final ValueNotifier<AppUser?> currentUser = ValueNotifier(null);
  static const _tokenKey = 'auth_token';

  static Future<void> _saveSession(dynamic data) async {
    final token = data['token'] as String;
    ApiClient.token = token;
    currentUser.value = AppUser.fromJson(data['user'] as Map<String, dynamic>);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  static Future<void> login(String email, String password) async {
    final data = await ApiClient.post(
        '/auth/login', {'email': email, 'password': password});
    await _saveSession(data);
  }

  static Future<void> register({
    required String name,
    required String email,
    String? phone,
    required String password,
  }) async {
    final data = await ApiClient.post('/auth/register', {
      'name': name,
      'email': email,
      'phone': (phone == null || phone.isEmpty) ? null : phone,
      'password': password,
    });
    await _saveSession(data);
  }

  /// Khôi phục phiên đăng nhập từ token đã lưu. Trả về true nếu còn hiệu lực.
  static Future<bool> restoreSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    if (token == null) return false;

    ApiClient.token = token;
    try {
      final data = await ApiClient.get('/auth/me');
      currentUser.value = AppUser.fromJson(data as Map<String, dynamic>);
      return true;
    } on ApiException catch (e) {
      if (e.statusCode == 401 || e.statusCode == 404) {
        await logout(); // token hết hạn hoặc tài khoản không còn
      }
      return false;
    }
  }

  static Future<void> logout() async {
    ApiClient.token = null;
    currentUser.value = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }
}
