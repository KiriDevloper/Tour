import 'package:flutter/material.dart';
import '../core/theme.dart';

class ComingSoonTab extends StatelessWidget {
  final String title;
  final IconData icon;

  const ComingSoonTab({super.key, required this.title, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 56, color: AppColors.muted),
            const SizedBox(height: 12),
            const Text('Đang được xây dựng',
                style: TextStyle(color: AppColors.muted)),
          ],
        ),
      ),
    );
  }
}
