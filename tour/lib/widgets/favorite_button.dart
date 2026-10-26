import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../models/place.dart';
import '../services/api_client.dart';
import '../services/favorite_store.dart';

class FavoriteButton extends StatelessWidget {
  final Place place;
  final bool onImage; // true: nền tròn trắng để nhìn rõ trên ảnh

  const FavoriteButton({super.key, required this.place, this.onImage = false});

  Future<void> _toggle(BuildContext context) async {
    try {
      await FavoriteStore.toggle(place);
    } on ApiException catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<List<Place>>(
      valueListenable: FavoriteStore.items,
      builder: (context, items, _) {
        final fav = items.any((p) => p.id == place.id);
        final button = IconButton(
          icon: Icon(
            fav ? Icons.favorite : Icons.favorite_border,
            color: fav ? AppColors.danger : AppColors.muted,
          ),
          onPressed: () => _toggle(context),
        );
        if (!onImage) return button;
        return Padding(
          padding: const EdgeInsets.all(6),
          child: CircleAvatar(backgroundColor: Colors.white, child: button),
        );
      },
    );
  }
}
