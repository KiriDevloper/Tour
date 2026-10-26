import 'package:flutter/material.dart';
import '../models/category.dart';
import '../widgets/place_list_view.dart';

class CategoryPlacesScreen extends StatelessWidget {
  final AppCategory category;

  const CategoryPlacesScreen({super.key, required this.category});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(category.name)),
      body: PlaceListView(categoryId: category.id),
    );
  }
}
