import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/theme.dart';
import '../services/location_service.dart';
import '../services/routing_service.dart';
import '../widgets/map_tile_layer.dart';

/// Chỉ đường từ vị trí hiện tại của người dùng đến một điểm, vẽ ngay trên bản đồ trong app.
class DirectionsScreen extends StatefulWidget {
  final String name;
  final String address;
  final LatLng destination;

  const DirectionsScreen({
    super.key,
    required this.name,
    required this.address,
    required this.destination,
  });

  @override
  State<DirectionsScreen> createState() => _DirectionsScreenState();
}

class _DirectionsScreenState extends State<DirectionsScreen> {
  final _map = MapController();
  RouteMode _mode = RouteMode.car;
  LatLng? _origin;
  RouteResult? _route;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _start();
  }

  /// relocate = true: lấy lại vị trí GPS; false: dùng vị trí đã có (khi chỉ đổi phương tiện)
  Future<void> _start({bool relocate = true}) async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final LatLng from = (relocate || _origin == null) ? await LocationService.fetch() : _origin!;
      if (!mounted) return;
      _origin = from;

      final r = await RoutingService.getRoute(from: from, to: widget.destination, mode: _mode);
      if (!mounted) return;
      setState(() {
        _route = r;
        _loading = false;
      });
      _fit(r);
    } on LocationException catch (e) {
      _fail(e.message);
    } on RouteException catch (e) {
      _fail(e.noRoute
          ? 'Không tìm thấy đường đi từ vị trí của bạn đến địa điểm này. '
              'Nếu bạn đang dùng máy ảo, hãy đặt vị trí giả lập ở Buôn Ma Thuột.'
          : e.message);
    } catch (e) {
      _fail('Có lỗi xảy ra khi tìm đường: $e');
    }
  }

  void _fail(String message) {
    if (!mounted) return;
    setState(() {
      _route = null;
      _error = message;
      _loading = false;
    });
  }

  // Thu phóng bản đồ để thấy trọn tuyến đường (chừa chỗ cho thanh chọn phương tiện và thẻ thông tin)
  void _fit(RouteResult r) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || r.points.length < 2) return;
      try {
        _map.fitCamera(CameraFit.coordinates(
          coordinates: r.points,
          padding: const EdgeInsets.fromLTRB(40, 110, 40, 240),
        ));
      } catch (_) {}
    });
  }

  void _changeMode(RouteMode m) {
    if (m == _mode || _loading) return;
    setState(() => _mode = m);
    _start(relocate: false);
  }

  Future<void> _openGoogleMaps() async {
    final o = _origin;
    final d = widget.destination;
    final uri = Uri.parse(
      'https://www.google.com/maps/dir/?api=1'
      '${o != null ? '&origin=${o.latitude},${o.longitude}' : ''}'
      '&destination=${d.latitude},${d.longitude}'
      '&travelmode=${_mode.googleMode}',
    );
    final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không mở được ứng dụng bản đồ')),
      );
    }
  }

  void _showSteps() {
    final r = _route;
    if (r == null) return;
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => SizedBox(
        height: MediaQuery.of(context).size.height * 0.6,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
              child: Text(
                'Các bước chỉ đường (${r.steps.length})',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
              ),
            ),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: r.steps.length,
                separatorBuilder: (_, __) => const Divider(height: 1),
                itemBuilder: (_, i) {
                  final s = r.steps[i];
                  return ListTile(
                    leading: CircleAvatar(
                      radius: 14,
                      backgroundColor: const Color(0xFFE3EEFD),
                      child: Text('${i + 1}',
                          style: const TextStyle(fontSize: 12, color: AppColors.primary)),
                    ),
                    title: Text(s.instruction),
                    trailing: s.distance > 0
                        ? Text(LocationService.format(s.distance),
                            style: const TextStyle(color: AppColors.muted, fontSize: 12))
                        : null,
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _modeBar() {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        child: Wrap(
          alignment: WrapAlignment.center,
          spacing: 6,
          children: [
            for (final m in RouteMode.values)
              ChoiceChip(
                avatar: Icon(m.icon,
                    size: 18, color: _mode == m ? Colors.white : AppColors.muted),
                label: Text(m.label, style: const TextStyle(fontSize: 12)),
                selected: _mode == m,
                showCheckmark: false,
                visualDensity: VisualDensity.compact,
                selectedColor: AppColors.primary,
                backgroundColor: Colors.white,
                labelStyle: TextStyle(color: _mode == m ? Colors.white : AppColors.text),
                onSelected: (_) => _changeMode(m),
              ),
          ],
        ),
      ),
    );
  }

  Widget _infoCard() {
    final r = _route;
    Widget content;

    if (_loading) {
      content = const Row(
        children: [
          SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.4)),
          SizedBox(width: 14),
          Expanded(child: Text('Đang xác định vị trí và tìm đường...')),
        ],
      );
    } else if (_error != null) {
      content = Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(_error!, style: const TextStyle(color: AppColors.danger, height: 1.4)),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(onPressed: () => _start(), child: const Text('Thử lại')),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton(
                    onPressed: _openGoogleMaps, child: const Text('Mở Google Maps')),
              ),
            ],
          ),
        ],
      );
    } else {
      content = Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(widget.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          if (widget.address.isNotEmpty)
            Text(widget.address,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 12, color: AppColors.muted)),
          const SizedBox(height: 10),
          Row(
            children: [
              Icon(_mode.icon, color: AppColors.primary, size: 20),
              const SizedBox(width: 8),
              Text(
                '${RoutingService.formatDuration(r!.duration)}  ·  ${LocationService.format(r.distance)}',
                style: const TextStyle(
                    fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.primary),
              ),
            ],
          ),
          if (_mode == RouteMode.car)
            const Padding(
              padding: EdgeInsets.only(top: 2),
              child: Text('Thời gian ước tính theo ô tô, đi xe máy có thể khác.',
                  style: TextStyle(fontSize: 11, color: AppColors.muted)),
            ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _showSteps,
                  icon: const Icon(Icons.list_alt, size: 18),
                  label: const Text('Các bước'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: FilledButton.icon(
                  onPressed: _openGoogleMaps,
                  icon: const Icon(Icons.navigation, size: 18),
                  label: const Text('Dẫn đường'),
                ),
              ),
            ],
          ),
        ],
      );
    }

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(padding: const EdgeInsets.all(16), child: content),
    );
  }

  @override
  Widget build(BuildContext context) {
    final dest = widget.destination;
    final origin = _origin;
    final route = _route;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chỉ đường'),
        actions: [
          IconButton(
            tooltip: 'Cập nhật vị trí của tôi',
            icon: const Icon(Icons.my_location),
            onPressed: _loading ? null : () => _start(),
          ),
        ],
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _map,
            options: MapOptions(initialCenter: dest, initialZoom: 14),
            children: [
              buildTileLayer(),
              if (route != null)
                PolylineLayer(
                  polylines: [
                    Polyline(
                      points: route.points,
                      strokeWidth: 6,
                      color: AppColors.primary,
                      borderStrokeWidth: 2,
                      borderColor: Colors.white,
                    ),
                  ],
                ),
              MarkerLayer(
                markers: [
                  if (origin != null)
                    Marker(
                      point: origin,
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
                  Marker(
                    point: dest,
                    width: 48,
                    height: 96,
                    child: const Align(
                      alignment: Alignment.topCenter,
                      child: Icon(Icons.location_on, size: 48, color: AppColors.danger),
                    ),
                  ),
                ],
              ),
              buildAttribution(),
            ],
          ),
          Positioned(top: 10, left: 12, right: 12, child: _modeBar()),
          Positioned(left: 16, right: 16, bottom: 16, child: _infoCard()),
        ],
      ),
    );
  }
}
