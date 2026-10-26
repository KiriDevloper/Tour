import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../models/place.dart';
import '../services/place_service.dart';
import 'place_card.dart';

/// Danh sách địa điểm (có thể lọc theo loại), có tải lại và xử lý lỗi.
class PlaceListView extends StatefulWidget {
  final int? categoryId;

  const PlaceListView({super.key, this.categoryId});

  @override
  State<PlaceListView> createState() => _PlaceListViewState();
}

class _PlaceListViewState extends State<PlaceListView> {
  late Future<List<Place>> _future;

  @override
  void initState() {
    super.initState();
    _future = PlaceService.getPlaces(categoryId: widget.categoryId);
  }

  void _reload() => setState(
      () => _future = PlaceService.getPlaces(categoryId: widget.categoryId));

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Place>>(
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
        final places = snap.data!;
        if (places.isEmpty) {
          return const Center(
            child: Text('Chưa có địa điểm nào', style: TextStyle(color: AppColors.muted)),
          );
        }
        return RefreshIndicator(
          onRefresh: () async {
            _reload();
            try {
              await _future;
            } catch (_) {}
          },
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            itemCount: places.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (_, i) => PlaceCard(place: places[i]),
          ),
        );
      },
    );
  }
}
