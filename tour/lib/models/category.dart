import 'package:flutter/material.dart';

class AppCategory {
  final int id;
  final String name;
  final String icon;
  final String color;
  final int placeCount;

  AppCategory({
    required this.id,
    required this.name,
    required this.icon,
    required this.color,
    required this.placeCount,
  });

  factory AppCategory.fromJson(Map<String, dynamic> j) => AppCategory(
        id: j['id'] as int,
        name: j['name'] as String,
        icon: (j['icon'] as String?) ?? '',
        color: (j['color'] as String?) ?? '#1E6FE8',
        placeCount: (j['placeCount'] as num?)?.toInt() ?? 0,
      );

  Color get colorValue {
    try {
      return Color(int.parse(color.replaceFirst('#', '0xFF')));
    } catch (_) {
      return const Color(0xFF1E6FE8);
    }
  }

  IconData get iconData {
    switch (icon) {
      case 'museum':
        return Icons.account_balance;
      case 'history':
        return Icons.history_edu;
      case 'nature':
        return Icons.park;
      case 'architecture':
        return Icons.temple_buddhist;
      case 'cafe':
        return Icons.local_cafe;
      case 'experience':
        return Icons.explore;
      default:
        return Icons.place;
    }
  }
}
