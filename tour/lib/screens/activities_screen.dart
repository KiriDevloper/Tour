import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../models/activity.dart';
import '../services/activity_service.dart';
import '../widgets/activity_tile.dart';

class ActivitiesScreen extends StatefulWidget {
  const ActivitiesScreen({super.key});

  @override
  State<ActivitiesScreen> createState() => _ActivitiesScreenState();
}

class _ActivitiesScreenState extends State<ActivitiesScreen> {
  late Future<List<Activity>> _future;

  @override
  void initState() {
    super.initState();
    _future = ActivityService.getAll();
  }

  void _reload() => setState(() => _future = ActivityService.getAll());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hoạt động trải nghiệm')),
      body: FutureBuilder<List<Activity>>(
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
          final items = snap.data!;
          if (items.isEmpty) {
            return const Center(
                child: Text('Chưa có hoạt động nào',
                    style: TextStyle(color: AppColors.muted)));
          }
          return RefreshIndicator(
            onRefresh: () async {
              _reload();
              try {
                await _future;
              } catch (_) {}
            },
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: items.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (_, i) => ActivityTile(activity: items[i], showPlace: true),
            ),
          );
        },
      ),
    );
  }
}
