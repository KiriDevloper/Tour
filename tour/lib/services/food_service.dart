import '../models/food.dart';
import 'api_client.dart';

class FoodService {
  static Future<List<Food>> getFoods() async {
    final data = await ApiClient.get('/foods') as List;
    return data.map((e) => Food.fromJson(e as Map<String, dynamic>)).toList();
  }
}
