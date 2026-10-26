import 'package:flutter/foundation.dart';
import '../models/place.dart';
import 'api_client.dart';

/// Giữ danh sách yêu thích của người dùng hiện tại, đồng bộ với backend.
class FavoriteStore {
  static final ValueNotifier<List<Place>> items = ValueNotifier([]);

  static bool isFav(int placeId) => items.value.any((p) => p.id == placeId);

  static Future<void> load() async {
    try {
      final data = await ApiClient.get('/favorites') as List;
      items.value =
          data.map((e) => Place.fromJson(e as Map<String, dynamic>)).toList();
    } on ApiException {
      // giữ nguyên danh sách cũ nếu lỗi mạng
    }
  }

  static void clear() => items.value = [];

  /// Cập nhật giao diện ngay, nếu gọi API lỗi thì hoàn lại và ném lỗi ra.
  static Future<void> toggle(Place place) async {
    final wasFav = isFav(place.id);
    items.value = wasFav
        ? items.value.where((p) => p.id != place.id).toList()
        : [...items.value, place];
    try {
      if (wasFav) {
        await ApiClient.delete('/favorites/${place.id}');
      } else {
        await ApiClient.post('/favorites/${place.id}');
      }
    } on ApiException {
      items.value = wasFav
          ? [...items.value, place]
          : items.value.where((p) => p.id != place.id).toList();
      rethrow;
    }
  }
}
