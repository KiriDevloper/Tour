import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../core/theme.dart';
import '../models/food.dart';
import '../models/map_point.dart';
import '../services/location_service.dart';
import '../widgets/mini_points_map.dart';
import '../widgets/net_image.dart';
import '../widgets/primary_button.dart';
import 'points_map_screen.dart';

class FoodDetailScreen extends StatelessWidget {
  final Food food;

  const FoodDetailScreen({super.key, required this.food});

  List<FoodSpot> get _located => food.spots.where((s) => s.hasLocation).toList();

  List<MapPoint> get _points => [
        for (final s in _located)
          MapPoint(title: s.name, subtitle: s.address, lat: s.lat!, lng: s.lng!),
      ];

  void _openMap(BuildContext context, {int? index}) {
    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => PointsMapScreen(
        title: 'Nơi thưởng thức ${food.name}',
        points: _points,
        initialIndex: index,
      ),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final located = _located;
    return Scaffold(
      appBar: AppBar(title: Text(food.name)),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: NetImage(url: food.image, height: 210, width: double.infinity),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Text(food.name,
                    style: const TextStyle(
                        fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.text)),
              ),
              if (food.kind.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE3EEFD),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(food.kind,
                      style: const TextStyle(fontSize: 12, color: AppColors.primary)),
                ),
            ],
          ),
          if (food.description.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(food.description,
                style: const TextStyle(height: 1.55, color: AppColors.text)),
          ],
          const SizedBox(height: 24),
          const Text('Nơi thưởng thức',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          if (food.spots.isEmpty)
            const Text('Chưa có thông tin quán cho món này.',
                style: TextStyle(color: AppColors.muted))
          else ...[
            if (located.isNotEmpty) ...[
              MiniPointsMap(points: _points, onTap: () => _openMap(context)),
              const SizedBox(height: 8),
            ],
            for (final s in food.spots)
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: s.image != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: NetImage(url: s.image, width: 48, height: 48),
                      )
                    : const CircleAvatar(
                        backgroundColor: Color(0xFFE3EEFD),
                        child: Icon(Icons.storefront_outlined, color: AppColors.primary),
                      ),
                title: Text(s.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                subtitle: _subtitle(s),
                trailing: s.hasLocation
                    ? const Icon(Icons.map_outlined, color: AppColors.primary)
                    : null,
                onTap: s.hasLocation
                    ? () => _openMap(context, index: located.indexOf(s))
                    : null,
              ),
          ],
        ],
      ),
      bottomNavigationBar: located.isNotEmpty
          ? SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
                child: PrimaryButton(
                    text: 'Xem bản đồ nơi thưởng thức',
                    onPressed: () => _openMap(context)),
              ),
            )
          : null,
    );
  }

  Widget _subtitle(FoodSpot s) {
    return ValueListenableBuilder<LatLng?>(
      valueListenable: LocationService.current,
      builder: (context, _, __) {
        final d = s.hasLocation ? LocationService.distanceToLatLng(s.lat!, s.lng!) : null;
        final text = d == null ? s.address : '${s.address} · ${LocationService.format(d)}';
        return Text(text, maxLines: 2, overflow: TextOverflow.ellipsis);
      },
    );
  }
}
