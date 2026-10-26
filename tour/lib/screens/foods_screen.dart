import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../models/food.dart';
import '../services/food_service.dart';
import '../widgets/net_image.dart';
import 'food_detail_screen.dart';

class FoodsScreen extends StatefulWidget {
  const FoodsScreen({super.key});

  @override
  State<FoodsScreen> createState() => _FoodsScreenState();
}

class _FoodsScreenState extends State<FoodsScreen> {
  late Future<List<Food>> _future;
  String? _kind; // null = Tất cả

  @override
  void initState() {
    super.initState();
    _future = FoodService.getFoods();
  }

  void _reload() => setState(() => _future = FoodService.getFoods());

  Widget _chip(String label, String? value) {
    final selected = _kind == value;
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
        onSelected: (_) => setState(() => _kind = value),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Khám phá món ăn')),
      body: FutureBuilder<List<Food>>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('${snap.error}',
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: AppColors.muted)),
                    const SizedBox(height: 12),
                    OutlinedButton(onPressed: _reload, child: const Text('Thử lại')),
                  ],
                ),
              ),
            );
          }

          final all = snap.data!;
          final kinds = all.map((f) => f.kind).where((k) => k.isNotEmpty).toSet().toList();
          final foods = _kind == null ? all : all.where((f) => f.kind == _kind).toList();

          return Column(
            children: [
              SizedBox(
                height: 48,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    _chip('Tất cả', null),
                    for (final k in kinds) _chip(k, k),
                  ],
                ),
              ),
              Expanded(
                child: foods.isEmpty
                    ? const Center(
                        child: Text('Chưa có món ăn nào',
                            style: TextStyle(color: AppColors.muted)))
                    : RefreshIndicator(
                        onRefresh: () async {
                          _reload();
                          try {
                            await _future;
                          } catch (_) {}
                        },
                        child: ListView.separated(
                          padding:
                              const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          itemCount: foods.length,
                          separatorBuilder: (_, __) => const Divider(height: 1),
                          itemBuilder: (_, i) => _FoodTile(food: foods[i]),
                        ),
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _FoodTile extends StatelessWidget {
  final Food food;

  const _FoodTile({required this.food});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => FoodDetailScreen(food: food)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: NetImage(url: food.image, width: 80, height: 80),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(food.name,
                      style: const TextStyle(
                          fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.text)),
                  const SizedBox(height: 4),
                  Text(food.shortDesc,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 12, color: AppColors.muted)),
                  if (food.spots.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.storefront_outlined,
                            size: 14, color: AppColors.primary),
                        const SizedBox(width: 4),
                        Text('${food.spots.length} nơi thưởng thức',
                            style:
                                const TextStyle(fontSize: 12, color: AppColors.primary)),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.muted),
          ],
        ),
      ),
    );
  }
}
