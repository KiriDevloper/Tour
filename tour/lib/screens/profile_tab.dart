import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../services/favorite_store.dart';
import 'favorites_tab.dart';
import 'login_screen.dart';

class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  void _soon(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Chức năng đang được phát triển')),
    );
  }

  Future<void> _logout(BuildContext context) async {
    await AuthService.logout();
    FavoriteStore.clear();
    if (!context.mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Cá nhân')),
      body: ValueListenableBuilder<AppUser?>(
        valueListenable: AuthService.currentUser,
        builder: (context, user, _) {
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: const Color(0xFFE3EEFD),
                    child: Text(
                      (user?.name.isNotEmpty ?? false) ? user!.name[0].toUpperCase() : '?',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user?.name ?? '',
                            style: const TextStyle(
                                fontSize: 17, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 2),
                        Text(user?.email ?? '',
                            style: const TextStyle(color: AppColors.muted)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              const Divider(height: 1),
              _tile(Icons.person_outline, 'Thông tin cá nhân', () => _soon(context)),
              _tile(Icons.favorite_border, 'Danh sách yêu thích', () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const FavoritesTab()))),
              _tile(Icons.history, 'Lịch sử tìm kiếm', () => _soon(context)),
              _tile(Icons.settings_outlined, 'Cài đặt', () => _soon(context)),
              _tile(Icons.logout, 'Đăng xuất', () => _logout(context), danger: true),
            ],
          );
        },
      ),
    );
  }

  Widget _tile(IconData icon, String label, VoidCallback onTap, {bool danger = false}) {
    final color = danger ? AppColors.danger : AppColors.text;
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(icon, color: danger ? AppColors.danger : AppColors.primary),
      title: Text(label, style: TextStyle(color: color)),
      trailing: danger ? null : const Icon(Icons.chevron_right, color: AppColors.muted),
      onTap: onTap,
    );
  }
}
