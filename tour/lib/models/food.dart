class FoodSpot {
  final int id;
  final String name;
  final String address;
  final double? lat;
  final double? lng;
  final String? image;

  FoodSpot({
    required this.id,
    required this.name,
    required this.address,
    this.lat,
    this.lng,
    this.image,
  });

  bool get hasLocation => lat != null && lng != null;

  factory FoodSpot.fromJson(Map<String, dynamic> j) => FoodSpot(
        id: j['id'] as int,
        name: j['name'] as String,
        address: (j['address'] as String?) ?? '',
        lat: (j['lat'] as num?)?.toDouble(),
        lng: (j['lng'] as num?)?.toDouble(),
        image: j['image'] as String?,
      );
}

class Food {
  final int id;
  final String name;
  final String kind;
  final String shortDesc;
  final String description;
  final String? image;
  final String placeName;
  final List<FoodSpot> spots;

  Food({
    required this.id,
    required this.name,
    required this.kind,
    required this.shortDesc,
    required this.description,
    this.image,
    required this.placeName,
    required this.spots,
  });

  factory Food.fromJson(Map<String, dynamic> j) => Food(
        id: j['id'] as int,
        name: j['name'] as String,
        kind: (j['kind'] as String?) ?? '',
        shortDesc: (j['shortDesc'] as String?) ?? '',
        description: (j['description'] as String?) ?? '',
        image: j['image'] as String?,
        placeName: (j['placeName'] as String?) ?? '',
        spots: ((j['spots'] as List?) ?? [])
            .map((e) => FoodSpot.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}
