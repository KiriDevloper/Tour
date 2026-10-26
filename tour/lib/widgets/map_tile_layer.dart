import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';

/// Lớp nền bản đồ OpenStreetMap (miễn phí, không cần API key).
TileLayer buildTileLayer() => TileLayer(
      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      // Đổi thành applicationId của app nếu bạn đã đổi (xem android/app/build.gradle)
      userAgentPackageName: 'com.example.tour',
    );

/// Ghi nguồn bản đồ (yêu cầu bắt buộc của OpenStreetMap)
Widget buildAttribution() => RichAttributionWidget(
      attributions: [
        TextSourceAttribution('© OpenStreetMap contributors'),
      ],
    );
