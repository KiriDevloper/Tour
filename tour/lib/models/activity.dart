class Activity {
  final int id;
  final int placeId;
  final String placeName;
  final String placeAddress;
  final String name;
  final String description;
  final String? image;
  final double? lat;
  final double? lng;

  Activity({
    required this.id,
    required this.placeId,
    required this.placeName,
    required this.placeAddress,
    required this.name,
    required this.description,
    this.image,
    this.lat,
    this.lng,
  });

  bool get hasLocation => lat != null && lng != null;

  factory Activity.fromJson(Map<String, dynamic> j) => Activity(
        id: j['id'] as int,
        placeId: j['placeId'] as int,
        placeName: (j['placeName'] as String?) ?? '',
        placeAddress: (j['placeAddress'] as String?) ?? '',
        name: j['name'] as String,
        description: (j['description'] as String?) ?? '',
        image: j['image'] as String?,
        lat: (j['lat'] as num?)?.toDouble(),
        lng: (j['lng'] as num?)?.toDouble(),
      );
}
