import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import '../models/place.dart';

class LocationException implements Exception {
  final String message;
  LocationException(this.message);

  @override
  String toString() => message;
}

/// Lấy vị trí người dùng và tính khoảng cách đến các địa điểm.
class LocationService {
  /// Vị trí gần nhất đã biết (null nếu chưa lấy được)
  static final ValueNotifier<LatLng?> current = ValueNotifier(null);

  /// Lấy vị trí hiện tại, có xin quyền nếu cần.
  static Future<LatLng> fetch() async {
    if (!await Geolocator.isLocationServiceEnabled()) {
      throw LocationException('Vui lòng bật định vị (GPS) trên thiết bị');
    }

    var perm = await Geolocator.checkPermission();
    if (perm == LocationPermission.denied) {
      perm = await Geolocator.requestPermission();
    }
    if (perm == LocationPermission.denied) {
      throw LocationException('Bạn chưa cho phép ứng dụng truy cập vị trí');
    }
    if (perm == LocationPermission.deniedForever) {
      throw LocationException(
          'Quyền vị trí đã bị từ chối. Hãy bật lại trong Cài đặt của thiết bị');
    }

    try {
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 15),
        ),
      );
      final p = LatLng(pos.latitude, pos.longitude);
      current.value = p;
      return p;
    } catch (_) {
      throw LocationException('Không lấy được vị trí hiện tại');
    }
  }

  /// Chỉ lấy vị trí khi đã được cấp quyền từ trước (không hiện hộp thoại xin quyền).
  static Future<void> refreshSilently() async {
    try {
      if (!await Geolocator.isLocationServiceEnabled()) return;
      final perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.whileInUse || perm == LocationPermission.always) {
        await fetch();
      }
    } catch (_) {}
  }

  /// Khoảng cách (mét) từ vị trí hiện tại đến địa điểm; null nếu thiếu dữ liệu.
  static double? distanceTo(Place p) {
    final c = current.value;
    if (c == null || p.lat == null || p.lng == null) return null;
    return Geolocator.distanceBetween(c.latitude, c.longitude, p.lat!, p.lng!);
  }

  /// Khoảng cách (mét) từ vị trí hiện tại đến một tọa độ bất kỳ.
  static double? distanceToLatLng(double lat, double lng) {
    final c = current.value;
    if (c == null) return null;
    return Geolocator.distanceBetween(c.latitude, c.longitude, lat, lng);
  }

  static String format(double meters) {
    if (meters < 1000) return '${meters.round()} m';
    final km = meters / 1000;
    if (km >= 100) return '${km.round()} km';
    return '${km.toStringAsFixed(1).replaceAll('.', ',')} km';
  }
}
