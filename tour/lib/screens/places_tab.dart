import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../models/category.dart';
import '../services/place_service.dart';
import '../widgets/place_list_view.dart';
import 'map_screen.dart';
import 'search_screen.dart';

class PlacesTab extends StatefulWidget {
  const PlacesTab({super.key});

  @override
  State<PlacesTab> createState() => _PlacesTabState();
}

class _PlacesTabState extends State<PlacesTab> {
  List<AppCategory> _categories = [];
  int? _selected; // null = Tất cả

  @override
  void initState() {
    super.initState();
    PlaceService.getCategories().then((c) {
      if (mounted) setState(() => _categories = c);
    }).catchError((_) {});
  }

  Widget _chip(String label, int? id) {
    final selected = _selected == id;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        showCheckmark: false,
        selectedColor: AppColors.primary,
        backgroundColor: Colors.white,
        labelStyle: TextStyle(
          color: selected ? Colors.white : AppColors.text,
          fontWeight: FontWeight.w600,
        ),
        onSelected: (_) => setState(() => _selected = id),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Danh sách địa điểm'),
        actions: [
          IconButton(
            icon: const Icon(Icons.map_outlined),
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const MapScreen()),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const SearchScreen()),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _chip('Tất cả', null),
                for (final c in _categories) _chip(c.name, c.id),
              ],
            ),
          ),
          Expanded(
            child: PlaceListView(key: ValueKey(_selected), categoryId: _selected),
          ),
        ],
      ),
    );
  }
}
