import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../core/theme.dart';
import '../models/map_point.dart';
import '../services/location_service.dart';
import '../widgets/map_tile_layer.dart';
import 'directions_screen.dart';

/// Bản đồ lớn trong app cho một nhóm điểm (quán ăn, hoạt động...).
class PointsMapScreen extends StatefulWidget {
  final String title;
  final List<MapPoint> points;
  final int? initialIndex; // điểm được chọn/phóng to khi mở

  const PointsMapScreen({
    super.key,
    required this.title,
    required this.points,
    this.initialIndex,
  });

  @override
  State<PointsMapScreen> createState() => _PointsMapScreenState();
}

class _PointsMapScreenState extends State<PointsMapScreen> {
  final _mapController = MapController();
  int? _selected;
  bool _locating = false;

  @override
  void initState() {
    super.initState();
    _selected = widget.initialIndex;
  }

  MapOptions _options() {
    void clear(TapPosition _, LatLng __) => setState(() => _selected = null);
    final pts = widget.points;
    final i = widget.initialIndex;
    if (i != null && i >= 0 && i < pts.length) {
      return MapOptions(
        initialCenter: LatLng(pts[i].lat, pts[i].lng),
        initialZoom: 16,
        onTap: clear,
      );
    }
    final coords = pts.map((p) => LatLng(p.lat, p.lng)).toList();
    if (coords.length >= 2) {
      return MapOptions(
        initialCameraFit: CameraFit.coordinates(
          coordinates: coords,
          padding: const EdgeInsets.all(60),
          maxZoom: 16,
        ),
        onTap: clear,
      );
    }
    return MapOptions(initialCenter: coords.first, initialZoom: 16, onTap: clear);
  }

  Future<void> _locate() async {
    setState(() => _locating = true);
    try {
      final p = await LocationService.fetch();
      _mapController.move(p, 15);
    } on LocationException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => _locating = false);
    }
  }

  Marker _marker(int index) {
    final p = widget.points[index];
    final selected = _selected == index;
    return Marker(
      point: LatLng(p.lat, p.lng),
      width: 48,
      height: 96,
      child: GestureDetector(
        onTap: () => setState(() => _selected = index),
        child: Align(
          alignment: Alignment.topCenter,
          child: Icon(
            Icons.location_on,
            size: selected ? 48 : 40,
            color: selected ? AppColors.danger : AppColors.primary,
          ),
        ),
      ),
    );
  }

  Widget _userLayer() {
    return ValueListenableBuilder<LatLng?>(
      valueListenable: LocationService.current,
      builder: (context, pos, _) {
        if (pos == null) return const SizedBox.shrink();
        return MarkerLayer(
          markers: [
            Marker(
              point: pos,
              width: 24,
              height: 24,
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF2F80ED),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 3),
                  boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 4)],
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _infoCard(MapPoint p) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(p.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                  if (p.subtitle.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(p.subtitle,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 12, color: AppColors.muted)),
                  ],
                  ValueListenableBuilder<LatLng?>(
                    valueListenable: LocationService.current,
                    builder: (context, _, __) {
                      final d = LocationService.distanceToLatLng(p.lat, p.lng);
                      if (d == null) return const SizedBox.shrink();
                      return Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text('Cách bạn ${LocationService.format(d)}',
                            style: const TextStyle(fontSize: 12, color: AppColors.primary)),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (p.onAction != null) ...[
                  FilledButton(onPressed: p.onAction, child: Text(p.actionLabel ?? 'Chi tiết')),
                  const SizedBox(height: 6),
                ],
                OutlinedButton(
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => DirectionsScreen(
                        name: p.title,
                        address: p.subtitle,
                        destination: LatLng(p.lat, p.lng),
                      ),
                    ),
                  ),
                  child: const Text('Chỉ đường'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final selectedPoint = (_selected != null && _selected! < widget.points.length)
        ? widget.points[_selected!]
        : null;

    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: _options(),
            children: [
              buildTileLayer(),
              MarkerLayer(
                markers: [
                  for (var i = 0; i < widget.points.length; i++) _marker(i),
                ],
              ),
              _userLayer(),
              buildAttribution(),
            ],
          ),
          Positioned(
            right: 16,
            bottom: selectedPoint != null ? 168 : 24,
            child: FloatingActionButton.small(
              heroTag: 'locate_points',
              backgroundColor: Colors.white,
              foregroundColor: AppColors.primary,
              onPressed: _locating ? null : _locate,
              child: _locating
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.my_location),
            ),
          ),
          if (selectedPoint != null)
            Positioned(left: 16, right: 16, bottom: 16, child: _infoCard(selectedPoint)),
        ],
      ),
    );
  }
}
