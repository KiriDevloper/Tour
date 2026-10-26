import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../core/theme.dart';
import '../models/map_point.dart';
import 'map_tile_layer.dart';

/// Bản đồ nhỏ hiện một hay nhiều điểm; chạm vào để mở bản đồ lớn.
class MiniPointsMap extends StatelessWidget {
  final List<MapPoint> points; // phải có ít nhất 1 điểm
  final VoidCallback onTap;

  const MiniPointsMap({super.key, required this.points, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final coords = points.map((p) => LatLng(p.lat, p.lng)).toList();
    final options = coords.length >= 2
        ? MapOptions(
            initialCameraFit: CameraFit.coordinates(
              coordinates: coords,
              padding: const EdgeInsets.all(40),
              maxZoom: 16,
            ),
            interactionOptions: const InteractionOptions(flags: InteractiveFlag.none),
          )
        : MapOptions(
            initialCenter: coords.first,
            initialZoom: 15,
            interactionOptions: const InteractionOptions(flags: InteractiveFlag.none),
          );

    return ClipRRect(
      borderRadius: BorderRadius.circular(14),
      child: SizedBox(
        height: 180,
        child: Stack(
          children: [
            FlutterMap(
              options: options,
              children: [
                buildTileLayer(),
                MarkerLayer(
                  markers: [
                    for (final c in coords)
                      Marker(
                        point: c,
                        width: 40,
                        height: 80,
                        child: const Align(
                          alignment: Alignment.topCenter,
                          child: Icon(Icons.location_on, size: 40, color: AppColors.danger),
                        ),
                      ),
                  ],
                ),
              ],
            ),
            Positioned.fill(
              child: GestureDetector(behavior: HitTestBehavior.opaque, onTap: onTap),
            ),
            Positioned(
              left: 6,
              bottom: 6,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                color: Colors.white70,
                child: const Text('© OpenStreetMap contributors',
                    style: TextStyle(fontSize: 9, color: AppColors.text)),
              ),
            ),
            Positioned(
              right: 8,
              top: 8,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.open_in_full, size: 14, color: AppColors.primary),
                    SizedBox(width: 4),
                    Text('Xem bản đồ lớn',
                        style: TextStyle(fontSize: 11, color: AppColors.primary)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
