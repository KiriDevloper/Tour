import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../models/activity.dart';
import '../models/map_point.dart';
import '../widgets/mini_points_map.dart';
import '../widgets/net_image.dart';
import '../widgets/primary_button.dart';
import 'points_map_screen.dart';

class ActivityDetailScreen extends StatelessWidget {
  final Activity activity;

  const ActivityDetailScreen({super.key, required this.activity});

  List<MapPoint> get _points => [
        MapPoint(
          title: activity.name,
          subtitle: activity.placeName.isEmpty
              ? activity.placeAddress
              : '${activity.placeName} · ${activity.placeAddress}',
          lat: activity.lat!,
          lng: activity.lng!,
        ),
      ];

  void _openMap(BuildContext context) {
    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => PointsMapScreen(title: activity.name, points: _points, initialIndex: 0),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final a = activity;
    return Scaffold(
      appBar: AppBar(title: const Text('Hoạt động tại địa điểm')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: NetImage(url: a.image, height: 200, width: double.infinity),
          ),
          const SizedBox(height: 16),
          Text(a.name,
              style: const TextStyle(
                  fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.text)),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.location_on_outlined, size: 16, color: AppColors.primary),
              const SizedBox(width: 4),
              Expanded(
                child: Text(a.placeName,
                    style: const TextStyle(color: AppColors.primary)),
              ),
            ],
          ),
          if (a.description.isNotEmpty) ...[
            const SizedBox(height: 14),
            Text(a.description,
                style: const TextStyle(height: 1.55, color: AppColors.text)),
          ],
          const SizedBox(height: 22),
          const Text('Vị trí',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          if (a.placeAddress.isNotEmpty)
            Text(a.placeAddress, style: const TextStyle(color: AppColors.muted)),
          const SizedBox(height: 10),
          if (a.hasLocation)
            MiniPointsMap(points: _points, onTap: () => _openMap(context))
          else
            const Text('Chưa có tọa độ cho hoạt động này.',
                style: TextStyle(color: AppColors.muted)),
        ],
      ),
      bottomNavigationBar: a.hasLocation
          ? SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
                child: PrimaryButton(
                    text: 'Xem trên bản đồ', onPressed: () => _openMap(context)),
              ),
            )
          : null,
    );
  }
}
