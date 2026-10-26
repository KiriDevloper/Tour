import '../models/activity.dart';
import 'api_client.dart';

class ActivityService {
  static List<Activity> _parse(dynamic data) =>
      (data as List).map((e) => Activity.fromJson(e as Map<String, dynamic>)).toList();

  static Future<List<Activity>> getAll() async => _parse(await ApiClient.get('/activities'));

  static Future<List<Activity>> getByPlace(int placeId) async =>
      _parse(await ApiClient.get('/places/$placeId/activities'));
}
