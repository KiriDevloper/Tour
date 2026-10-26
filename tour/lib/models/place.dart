class Place {
  final int id;
  final String name;
  final int categoryId;
  final String categoryName;
  final String address;
  final String shortDesc;
  final String description;
  final double? lat;
  final double? lng;
  final String openHours;
  final String ticketPrice;
  final double rating;
  final int ratingCount;
  final String? coverImage;
  final bool isFavorite;

  Place({
    required this.id,
    required this.name,
    required this.categoryId,
    required this.categoryName,
    required this.address,
    required this.shortDesc,
    required this.description,
    this.lat,
    this.lng,
    required this.openHours,
    required this.ticketPrice,
    required this.rating,
    required this.ratingCount,
    this.coverImage,
    required this.isFavorite,
  });

  factory Place.fromJson(Map<String, dynamic> j) => Place(
        id: j['id'] as int,
        name: j['name'] as String,
        categoryId: j['categoryId'] as int,
        categoryName: (j['categoryName'] as String?) ?? '',
        address: (j['address'] as String?) ?? '',
        shortDesc: (j['shortDesc'] as String?) ?? '',
        description: (j['description'] as String?) ?? '',
        lat: (j['lat'] as num?)?.toDouble(),
        lng: (j['lng'] as num?)?.toDouble(),
        openHours: (j['openHours'] as String?) ?? '',
        ticketPrice: (j['ticketPrice'] as String?) ?? '',
        rating: (j['rating'] as num?)?.toDouble() ?? 0,
        ratingCount: (j['ratingCount'] as num?)?.toInt() ?? 0,
        coverImage: j['coverImage'] as String?,
        isFavorite: (j['isFavorite'] as bool?) ?? false,
      );
}

/// Chi tiết một địa điểm: thông tin + danh sách ảnh
class PlaceDetail {
  final Place place;
  final List<String> images;

  PlaceDetail({required this.place, required this.images});

  factory PlaceDetail.fromJson(Map<String, dynamic> j) => PlaceDetail(
        place: Place.fromJson(j),
        images: ((j['images'] as List?) ?? []).map((e) => e.toString()).toList(),
      );
}
