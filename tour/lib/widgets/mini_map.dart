import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../core/theme.dart';
import '../models/place.dart';
import 'map_tile_layer.dart';

/// Bản đồ nhỏ trong trang chi tiết, chạm vào để mở bản đồ lớn.
class MiniMap extends StatelessWidget {
  final Place place;
  final VoidCallback onTap;

  const MiniMap({super.key, required this.place, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final point = LatLng(place.lat!, place.lng!);
    return ClipRRect(
      borderRadius: BorderRadius.circular(14),
      child: SizedBox(
        height: 170,
        child: Stack(
          children: [
            FlutterMap(
              options: MapOptions(
                initialCenter: point,
                initialZoom: 15,
                interactionOptions:
                    const InteractionOptions(flags: InteractiveFlag.none),
              ),
              children: [
                buildTileLayer(),
                MarkerLayer(
                  markers: [
                    Marker(
                      point: point,
                      width: 44,
                      height: 88,
                      child: const Align(
                        alignment: Alignment.topCenter,
                        child: Icon(Icons.location_on, size: 44, color: AppColors.danger),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            Positioned.fill(
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: onTap,
              ),
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
