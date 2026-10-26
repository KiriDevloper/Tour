import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';

/// Phương tiện di chuyển. Mỗi loại dùng một máy chủ tìm đường riêng (OpenStreetMap, miễn phí).
enum RouteMode {
  car('Ô tô / xe máy', Icons.directions_car, 'routed-car', 'driving'),
  bike('Xe đạp', Icons.pedal_bike, 'routed-bike', 'bicycling'),
  foot('Đi bộ', Icons.directions_walk, 'routed-foot', 'walking');

  final String label;
  final IconData icon;
  final String osrmPath; // đường dẫn trên routing.openstreetmap.de
  final String googleMode; // travelmode của Google Maps

  const RouteMode(this.label, this.icon, this.osrmPath, this.googleMode);
}

class RouteException implements Exception {
  final String message;
  final bool noRoute; // true: máy chủ trả lời được nhưng không có đường nối hai điểm

  RouteException(this.message, {this.noRoute = false});

  @override
  String toString() => message;
}

class RouteStep {
  final String instruction;
  final double distance; // mét

  const RouteStep({required this.instruction, required this.distance});
}

class RouteResult {
  final List<LatLng> points; // các điểm vẽ tuyến đường
  final double distance; // mét
  final double duration; // giây
  final List<RouteStep> steps;

  const RouteResult({
    required this.points,
    required this.distance,
    required this.duration,
    required this.steps,
  });
}

class RoutingService {
  static const _query = '?overview=full&geometries=geojson&steps=true';

  /// Tìm đường từ [from] đến [to]. Ném [RouteException] nếu thất bại.
  static Future<RouteResult> getRoute({
    required LatLng from,
    required LatLng to,
    RouteMode mode = RouteMode.car,
  }) async {
    // OSRM nhận tọa độ theo thứ tự: kinh độ, vĩ độ
    final coords = '${from.longitude},${from.latitude};${to.longitude},${to.latitude}';
    final urls = <String>[
      'https://routing.openstreetmap.de/${mode.osrmPath}/route/v1/driving/$coords$_query',
      // Máy chủ dự phòng (chỉ có ô tô)
      if (mode == RouteMode.car) 'https://router.project-osrm.org/route/v1/driving/$coords$_query',
    ];

    RouteException? last;
    for (final url in urls) {
      try {
        return await _fetch(url);
      } on RouteException catch (e) {
        if (e.noRoute) rethrow; // không có đường thật thì khỏi thử máy chủ khác
        last = e;
      }
    }
    throw last ?? RouteException('Không tìm được đường đi');
  }

  static Future<RouteResult> _fetch(String url) async {
    http.Response res;
    try {
      res = await http.get(
        Uri.parse(url),
        headers: {'User-Agent': 'com.example.tour (do an lap trinh di dong)'},
      ).timeout(const Duration(seconds: 15));
    } on TimeoutException {
      throw RouteException('Dịch vụ chỉ đường phản hồi quá lâu');
    } catch (_) {
      throw RouteException('Không kết nối được dịch vụ chỉ đường. Hãy kiểm tra kết nối mạng');
    }

    dynamic json;
    try {
      json = jsonDecode(utf8.decode(res.bodyBytes));
    } catch (_) {
      json = null;
    }
    if (json is! Map) {
      throw RouteException('Dịch vụ chỉ đường trả về dữ liệu không hợp lệ (mã ${res.statusCode})');
    }
    final data = json as Map<String, dynamic>;

    final code = data['code'];
    if (code == 'NoRoute' || code == 'NoSegment') {
      throw RouteException('Không có đường đi giữa hai vị trí', noRoute: true);
    }
    if (code != 'Ok') {
      throw RouteException((data['message'] as String?) ?? 'Không tìm được đường đi');
    }

    final routes = data['routes'] as List?;
    if (routes == null || routes.isEmpty) {
      throw RouteException('Không có đường đi giữa hai vị trí', noRoute: true);
    }
    return _parse(routes.first as Map<String, dynamic>);
  }

  static RouteResult _parse(Map<String, dynamic> route) {
    final geometry = route['geometry'] as Map<String, dynamic>;
    final points = (geometry['coordinates'] as List).map((c) {
      final p = c as List; // [kinh độ, vĩ độ]
      return LatLng((p[1] as num).toDouble(), (p[0] as num).toDouble());
    }).toList();

    final steps = <RouteStep>[];
    for (final leg in (route['legs'] as List? ?? [])) {
      for (final s in ((leg as Map<String, dynamic>)['steps'] as List? ?? [])) {
        final step = s as Map<String, dynamic>;
        steps.add(RouteStep(
          instruction: _instruction(step),
          distance: (step['distance'] as num?)?.toDouble() ?? 0,
        ));
      }
    }

    return RouteResult(
      points: points,
      distance: (route['distance'] as num).toDouble(),
      duration: (route['duration'] as num).toDouble(),
      steps: steps,
    );
  }

  static String _dir(String modifier) {
    switch (modifier) {
      case 'left':
        return 'trái';
      case 'right':
        return 'phải';
      case 'slight left':
        return 'nhẹ sang trái';
      case 'slight right':
        return 'nhẹ sang phải';
      case 'sharp left':
        return 'gắt sang trái';
      case 'sharp right':
        return 'gắt sang phải';
      default:
        return '';
    }
  }

  /// Dịch một bước chỉ đường của OSRM sang tiếng Việt.
  static String _instruction(Map<String, dynamic> step) {
    final m = (step['maneuver'] as Map<String, dynamic>?) ?? {};
    final type = (m['type'] as String?) ?? '';
    final modifier = (m['modifier'] as String?) ?? '';
    final name = ((step['name'] as String?) ?? '').trim();
    final onRoad = name.isEmpty ? '' : ' vào $name';

    switch (type) {
      case 'depart':
        return name.isEmpty ? 'Bắt đầu di chuyển' : 'Bắt đầu di chuyển trên $name';
      case 'arrive':
        return 'Bạn đã đến nơi';
      case 'turn':
      case 'end of road':
        if (modifier == 'uturn') return 'Quay đầu';
        if (modifier == 'straight') return 'Đi thẳng$onRoad';
        final turnDir = _dir(modifier);
        return turnDir.isEmpty ? 'Đi tiếp$onRoad' : 'Rẽ $turnDir$onRoad';
      case 'fork':
        return 'Đi theo nhánh bên ${modifier.contains('left') ? 'trái' : 'phải'}$onRoad';
      case 'merge':
        return 'Nhập làn$onRoad';
      case 'on ramp':
        return 'Đi lên đường dẫn$onRoad';
      case 'off ramp':
        return 'Đi xuống đường dẫn$onRoad';
      case 'roundabout':
      case 'rotary':
        final exitNo = m['exit'];
        return exitNo is int
            ? 'Vào vòng xuyến, đi theo lối ra thứ $exitNo$onRoad'
            : 'Vào vòng xuyến$onRoad';
      case 'exit roundabout':
      case 'exit rotary':
        return 'Ra khỏi vòng xuyến$onRoad';
      case 'roundabout turn':
        final roundDir = _dir(modifier);
        return roundDir.isEmpty ? 'Đi tiếp tại vòng xuyến' : 'Rẽ $roundDir tại vòng xuyến';
      default: // continue, new name, notification...
        return 'Đi tiếp$onRoad';
    }
  }

  /// 90 giây -> "2 phút", 4000 giây -> "1 giờ 7 phút"
  static String formatDuration(double seconds) {
    final minutes = (seconds / 60).round();
    if (minutes < 1) return 'dưới 1 phút';
    if (minutes < 60) return '$minutes phút';
    final h = minutes ~/ 60;
    final r = minutes % 60;
    return r == 0 ? '$h giờ' : '$h giờ $r phút';
  }
}
