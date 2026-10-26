import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../models/place.dart';
import '../services/favorite_store.dart';
import '../widgets/place_card.dart';

class FavoritesTab extends StatelessWidget {
  const FavoritesTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Địa điểm yêu thích')),
      body: ValueListenableBuilder<List<Place>>(
        valueListenable: FavoriteStore.items,
        builder: (context, items, _) {
          if (items.isEmpty) {
            return const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.favorite_border, size: 56, color: AppColors.muted),
                  SizedBox(height: 12),
                  Text('Chưa có địa điểm yêu thích',
                      style: TextStyle(color: AppColors.muted)),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: FavoriteStore.load,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: items.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (_, i) => PlaceCard(place: items[i]),
            ),
          );
        },
      ),
    );
  }
}
