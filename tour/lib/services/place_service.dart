import '../models/category.dart';
import '../models/place.dart';
import 'api_client.dart';

class PlaceService {
  static List<Place> _places(dynamic data) =>
      (data as List).map((e) => Place.fromJson(e as Map<String, dynamic>)).toList();

  static Future<List<Place>> getPlaces({int? categoryId}) async {
    final q = categoryId != null ? '?category=$categoryId' : '';
    return _places(await ApiClient.get('/places$q'));
  }

  static Future<List<Place>> search(String keyword) async {
    final q = Uri.encodeQueryComponent(keyword);
    return _places(await ApiClient.get('/places/search?q=$q'));
  }

  static Future<PlaceDetail> getDetail(int id) async {
    final data = await ApiClient.get('/places/$id');
    return PlaceDetail.fromJson(data as Map<String, dynamic>);
  }

  static Future<List<AppCategory>> getCategories() async {
    final data = await ApiClient.get('/categories') as List;
    return data.map((e) => AppCategory.fromJson(e as Map<String, dynamic>)).toList();
  }
}
