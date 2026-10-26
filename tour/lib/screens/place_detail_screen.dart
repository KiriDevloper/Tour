import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/theme.dart';
import '../models/activity.dart';
import '../models/place.dart';
import '../services/activity_service.dart';
import '../services/location_service.dart';
import '../services/place_service.dart';
import '../widgets/activity_tile.dart';
import '../widgets/favorite_button.dart';
import '../widgets/mini_map.dart';
import '../widgets/net_image.dart';
import '../widgets/primary_button.dart';
import 'directions_screen.dart';
import 'map_screen.dart';

class PlaceDetailScreen extends StatefulWidget {
  final Place place; // dữ liệu từ danh sách, hiển thị ngay

  const PlaceDetailScreen({super.key, required this.place});

  @override
  State<PlaceDetailScreen> createState() => _PlaceDetailScreenState();
}

class _PlaceDetailScreenState extends State<PlaceDetailScreen> {
  late Place _place;
  List<String> _images = [];
  List<Activity> _activities = [];

  @override
  void initState() {
    super.initState();
    _place = widget.place;
    PlaceService.getDetail(_place.id).then((d) {
      if (!mounted) return;
      setState(() {
        _place = d.place;
        _images = d.images;
      });
    }).catchError((_) {});
    ActivityService.getByPlace(_place.id).then((list) {
      if (mounted) setState(() => _activities = list);
    }).catchError((_) {});
  }

  // Có tọa độ: chỉ đường ngay trong app. Chưa có tọa độ: tìm theo tên/địa chỉ trên Google Maps.
  void _goDirections() {
    final p = _place;
    if (p.lat != null && p.lng != null) {
      Navigator.of(context).push(MaterialPageRoute(
        builder: (_) => DirectionsScreen(
          name: p.name,
          address: p.address,
          destination: LatLng(p.lat!, p.lng!),
        ),
      ));
    } else {
      _openMap();
    }
  }

  Future<void> _openMap() async {
    final Uri uri;
    if (_place.lat != null && _place.lng != null) {
      uri = Uri.parse(
          'https://www.google.com/maps/dir/?api=1&destination=${_place.lat},${_place.lng}');
    } else {
      final q = Uri.encodeQueryComponent('${_place.name}, ${_place.address}');
      uri = Uri.parse('https://www.google.com/maps/search/?api=1&query=$q');
    }
    final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không mở được ứng dụng bản đồ')),
      );
    }
  }

  Widget _infoRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: AppColors.primary),
          const SizedBox(width: 10),
          Expanded(child: Text(text, style: const TextStyle(height: 1.4))),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = _place;
    final hasVisitInfo = p.openHours.isNotEmpty || p.ticketPrice.isNotEmpty;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 260,
            leading: Padding(
              padding: const EdgeInsets.all(6),
              child: CircleAvatar(
                backgroundColor: Colors.white,
                child: IconButton(
                  icon: const Icon(Icons.arrow_back, size: 20),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ),
            ),
            actions: [FavoriteButton(place: p, onImage: true)],
            flexibleSpace: FlexibleSpaceBar(
              background: NetImage(url: p.coverImage, height: 260),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    p.name,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: AppColors.text,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      if (p.ratingCount > 0) ...[
                        const Icon(Icons.star, color: Color(0xFFFFB400), size: 18),
                        const SizedBox(width: 4),
                        Text(p.rating.toStringAsFixed(1),
                            style: const TextStyle(fontWeight: FontWeight.w700)),
                        Text(' (${p.ratingCount} đánh giá)',
                            style: const TextStyle(color: AppColors.muted, fontSize: 12)),
                        const SizedBox(width: 12),
                      ],
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE3EEFD),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(p.categoryName,
                            style: const TextStyle(fontSize: 12, color: AppColors.primary)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _infoRow(Icons.location_on_outlined, p.address),
                  ValueListenableBuilder<LatLng?>(
                    valueListenable: LocationService.current,
                    builder: (context, _, __) {
                      final d = LocationService.distanceTo(p);
                      if (d == null) return const SizedBox.shrink();
                      return _infoRow(Icons.near_me_outlined,
                          'Cách bạn ${LocationService.format(d)}');
                    },
                  ),
                  if (p.description.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(p.description,
                        style: const TextStyle(height: 1.55, color: AppColors.text)),
                  ],
                  if (_images.isNotEmpty) ...[
                    const SizedBox(height: 20),
                    SizedBox(
                      height: 96,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _images.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 10),
                        itemBuilder: (_, i) => ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: NetImage(url: _images[i], width: 130, height: 96),
                        ),
                      ),
                    ),
                  ],
                  if (_activities.isNotEmpty) ...[
                    const SizedBox(height: 22),
                    const Text('Hoạt động tại địa điểm',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    for (final a in _activities) ActivityTile(activity: a),
                  ],
                  if (p.lat != null && p.lng != null) ...[
                    const SizedBox(height: 22),
                    const Text('Vị trí',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 10),
                    MiniMap(
                      place: p,
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => MapScreen(focus: p)),
                      ),
                    ),
                  ],
                  if (hasVisitInfo) ...[
                    const SizedBox(height: 22),
                    const Text('Thông tin tham quan',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 10),
                    if (p.openHours.isNotEmpty)
                      _infoRow(Icons.schedule, 'Giờ mở cửa: ${p.openHours}'),
                    if (p.ticketPrice.isNotEmpty)
                      _infoRow(Icons.payments_outlined, 'Giá vé: ${p.ticketPrice}'),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
          child: PrimaryButton(text: 'Chỉ đường', onPressed: _goDirections),
        ),
      ),
    );
  }
}
