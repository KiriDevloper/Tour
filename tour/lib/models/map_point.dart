import 'package:flutter/foundation.dart';

/// Một điểm trên bản đồ (quán ăn, hoạt động...) dùng chung cho màn bản đồ.
class MapPoint {
  final String title;
  final String subtitle;
  final double lat;
  final double lng;
  final String? actionLabel; // ví dụ 'Chi tiết'
  final VoidCallback? onAction;

  const MapPoint({
    required this.title,
    required this.subtitle,
    required this.lat,
    required this.lng,
    this.actionLabel,
    this.onAction,
  });
}
