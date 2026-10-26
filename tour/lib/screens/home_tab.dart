import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../models/category.dart';
import '../models/place.dart';
import '../services/auth_service.dart';
import '../services/place_service.dart';
import '../widgets/net_image.dart';
import 'activities_screen.dart';
import 'category_places_screen.dart';
import 'foods_screen.dart';
import 'place_detail_screen.dart';
import 'search_screen.dart';

class _HomeData {
  final List<AppCategory> categories;
  final List<Place> places;
  _HomeData(this.categories, this.places);
}

class HomeTab extends StatefulWidget {
  final VoidCallback onSeeAll; // chuyển sang tab Địa điểm

  const HomeTab({super.key, required this.onSeeAll});

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  late Future<_HomeData> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<_HomeData> _load() async {
    final cats = PlaceService.getCategories();
    final places = PlaceService.getPlaces();
    return _HomeData(await cats, await places);
  }

  void _reload() => setState(() => _future = _load());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: FutureBuilder<_HomeData>(
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
                      OutlinedButton(onPressed: _reload, child: const Text('Thử lại')),
                    ],
                  ),
                ),
              );
            }
            final data = snap.data!;
            final featured = [...data.places]
              ..sort((a, b) => b.rating.compareTo(a.rating));
            return RefreshIndicator(
              onRefresh: () async {
                _reload();
                try {
                  await _future;
                } catch (_) {}
              },
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _header(),
                  const SizedBox(height: 16),
                  _searchBox(context),
                  const SizedBox(height: 16),
                  _banner(),
                  const SizedBox(height: 20),
                  _categoryGrid(context, data.categories),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Địa điểm nổi bật',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                      TextButton(
                        onPressed: widget.onSeeAll,
                        child: const Text('Xem tất cả →'),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 190,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: featured.length > 6 ? 6 : featured.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 12),
                      itemBuilder: (_, i) => _featuredCard(context, featured[i]),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _header() {
    return ValueListenableBuilder(
      valueListenable: AuthService.currentUser,
      builder: (context, user, _) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              user == null ? 'Xin chào 👋' : 'Xin chào, ${user.name} 👋',
              style: const TextStyle(color: AppColors.muted),
            ),
            const SizedBox(height: 2),
            const Text(
              'Khám phá Buôn Ma Thuột',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: AppColors.text,
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _searchBox(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const SearchScreen()),
      ),
      child: Container(
        height: 48,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Row(
          children: [
            Icon(Icons.search, color: AppColors.muted),
            SizedBox(width: 10),
            Text('Tìm kiếm địa điểm...', style: TextStyle(color: AppColors.muted)),
          ],
        ),
      ),
    );
  }

  Widget _banner() {
    return Container(
      height: 150,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF3B8BF0), Color(0xFF0F3F94)],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Buôn Ma Thuột',
                  style: TextStyle(
                      color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
              SizedBox(height: 4),
              Text('Thành phố của cà phê',
                  style: TextStyle(color: Colors.white70)),
            ],
          ),
          FilledButton(
            onPressed: widget.onSeeAll,
            style: FilledButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: AppColors.primary,
              visualDensity: VisualDensity.compact,
            ),
            child: const Text('Khám phá ngay →'),
          ),
        ],
      ),
    );
  }

  Widget _gridTile(BuildContext context,
      {required IconData icon,
      required Color color,
      required String label,
      required VoidCallback onTap}) {
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: onTap,
      child: Column(
        children: [
          CircleAvatar(
            radius: 26,
            backgroundColor: color.withAlpha(30),
            child: Icon(icon, color: color),
          ),
          const SizedBox(height: 6),
          Text(label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 12, color: AppColors.text)),
        ],
      ),
    );
  }

  Widget _categoryGrid(BuildContext context, List<AppCategory> cats) {
    return GridView.count(
      crossAxisCount: 4,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 0.85,
      children: [
        for (final c in cats)
          _gridTile(
            context,
            icon: c.iconData,
            color: c.colorValue,
            label: c.name,
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => CategoryPlacesScreen(category: c)),
            ),
          ),
        _gridTile(
          context,
          icon: Icons.restaurant,
          color: const Color(0xFFE88A1E),
          label: 'Món ăn',
          onTap: () => Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const FoodsScreen()),
          ),
        ),
        _gridTile(
          context,
          icon: Icons.local_activity,
          color: const Color(0xFF2E9E5B),
          label: 'Hoạt động',
          onTap: () => Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const ActivitiesScreen()),
          ),
        ),
      ],
    );
  }

  Widget _featuredCard(BuildContext context, Place p) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => PlaceDetailScreen(place: p)),
      ),
      child: SizedBox(
        width: 160,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: NetImage(url: p.coverImage, width: 160, height: 130),
            ),
            const SizedBox(height: 8),
            Text(p.name,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}
