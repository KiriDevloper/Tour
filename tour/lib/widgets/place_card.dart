import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../core/theme.dart';
import '../models/place.dart';
import '../screens/place_detail_screen.dart';
import '../services/location_service.dart';
import 'favorite_button.dart';
import 'net_image.dart';

class PlaceCard extends StatelessWidget {
  final Place place;

  const PlaceCard({super.key, required this.place});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => PlaceDetailScreen(place: place)),
      ),
      borderRadius: BorderRadius.circular(14),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: NetImage(url: place.coverImage, width: 92, height: 92),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    place.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.text,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE3EEFD),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      place.categoryName,
                      style: const TextStyle(fontSize: 11, color: AppColors.primary),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    place.address,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 12, color: AppColors.muted),
                  ),
                  ValueListenableBuilder<LatLng?>(
                    valueListenable: LocationService.current,
                    builder: (context, _, __) {
                      final d = LocationService.distanceTo(place);
                      if (d == null) return const SizedBox.shrink();
                      return Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Row(
                          children: [
                            const Icon(Icons.near_me, size: 13, color: AppColors.primary),
                            const SizedBox(width: 4),
                            Text(LocationService.format(d),
                                style: const TextStyle(
                                    fontSize: 12, color: AppColors.primary)),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
            FavoriteButton(place: place),
          ],
        ),
      ),
    );
  }
}
