import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../core/theme.dart';
import '../models/place.dart';
import '../services/location_service.dart';
import '../services/place_service.dart';
import '../widgets/map_tile_layer.dart';
import 'directions_screen.dart';
import 'place_detail_screen.dart';

class MapScreen extends StatefulWidget {
  final Place? focus; // địa điểm cần phóng to ngay khi mở (có thể null)

  const MapScreen({super.key, this.focus});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  static const _cityCenter = LatLng(12.6675, 108.0383); // trung tâm Buôn Ma Thuột

  final _mapController = MapController();
  late Future<List<Place>> _future;
  Place? _selected;
  bool _locating = false;

  @override
  void initState() {
    super.initState();
    _future = PlaceService.getPlaces();
    _selected = widget.focus;
  }

  MapOptions _options(List<Place> withCoords) {
    void clearSelection(TapPosition _, LatLng __) => setState(() => _selected = null);

    final f = widget.focus;
    if (f != null && f.lat != null && f.lng != null) {
      return MapOptions(
          initialCenter: LatLng(f.lat!, f.lng!), initialZoom: 15, onTap: clearSelection);
    }
    final coords = withCoords.map((p) => LatLng(p.lat!, p.lng!)).toList();
    if (coords.length >= 2) {
      return MapOptions(
        initialCameraFit: CameraFit.coordinates(
          coordinates: coords,
          padding: const EdgeInsets.all(60),
          maxZoom: 16,
        ),
        onTap: clearSelection,
      );
    }
    if (coords.length == 1) {
      return MapOptions(initialCenter: coords.first, initialZoom: 15, onTap: clearSelection);
    }
    return MapOptions(initialCenter: _cityCenter, initialZoom: 12.5, onTap: clearSelection);
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

  Marker _placeMarker(Place p) {
    final selected = _selected?.id == p.id;
    return Marker(
      point: LatLng(p.lat!, p.lng!),
      width: 48,
      height: 96,
      child: GestureDetector(
        onTap: () => setState(() => _selected = p),
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

  Widget _userMarkerLayer() {
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

  Widget _infoCard(Place p) {
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
                  Text(p.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text(p.address,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 12, color: AppColors.muted)),
                  ValueListenableBuilder<LatLng?>(
                    valueListenable: LocationService.current,
                    builder: (context, _, __) {
                      final d = LocationService.distanceTo(p);
                      if (d == null) return const SizedBox.shrink();
                      return Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text('Cách bạn ${LocationService.format(d)}',
                            style: const TextStyle(
                                fontSize: 12, color: AppColors.primary)),
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
                FilledButton(
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => PlaceDetailScreen(place: p)),
                  ),
                  child: const Text('Chi tiết'),
                ),
                const SizedBox(height: 6),
                OutlinedButton(
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => DirectionsScreen(
                        name: p.name,
                        address: p.address,
                        destination: LatLng(p.lat!, p.lng!),
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
    return Scaffold(
      appBar: AppBar(title: const Text('Bản đồ địa điểm')),
      body: FutureBuilder<List<Place>>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('${snap.error}',
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: AppColors.muted)),
                    const SizedBox(height: 12),
                    OutlinedButton(
                      onPressed: () =>
                          setState(() => _future = PlaceService.getPlaces()),
                      child: const Text('Thử lại'),
                    ),
                  ],
                ),
              ),
            );
          }

          final withCoords =
              snap.data!.where((p) => p.lat != null && p.lng != null).toList();

          return Stack(
            children: [
              FlutterMap(
                mapController: _mapController,
                options: _options(withCoords),
                children: [
                  buildTileLayer(),
                  MarkerLayer(markers: withCoords.map(_placeMarker).toList()),
                  _userMarkerLayer(),
                  buildAttribution(),
                ],
              ),
              if (withCoords.isEmpty)
                Positioned(
                  top: 12,
                  left: 16,
                  right: 16,
                  child: Card(
                    child: const Padding(
                      padding: EdgeInsets.all(12),
                      child: Text(
                        'Chưa có địa điểm nào có tọa độ. Hãy điền lat/lng trong db/seed.js rồi chạy lại npm run seed.',
                        style: TextStyle(fontSize: 12),
                      ),
                    ),
                  ),
                ),
              Positioned(
                right: 16,
                bottom: _selected != null ? 168 : 24,
                child: FloatingActionButton.small(
                  heroTag: 'locate',
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
              if (_selected != null)
                Positioned(left: 16, right: 16, bottom: 16, child: _infoCard(_selected!)),
            ],
          );
        },
      ),
    );
  }
}
