class AppConfig {
  // Emulator Android: 10.0.2.2
  // Điện thoại thật: đổi thành IP LAN của máy tính, ví dụ '192.168.1.5'
  static const String host = '10.0.2.2';
  static const int port = 3000;

  static String get baseUrl => 'http://$host:$port/api';
}
