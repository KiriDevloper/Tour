import 'package:flutter/material.dart';
import '../services/favorite_store.dart';
import '../services/location_service.dart';
import 'favorites_tab.dart';
import 'home_tab.dart';
import 'places_tab.dart';
import 'profile_tab.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _index = 0;
  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    FavoriteStore.load(); // tải danh sách yêu thích của tài khoản
    LocationService.refreshSilently(); // lấy vị trí nếu đã được cấp quyền
    _pages = [
      HomeTab(onSeeAll: () => setState(() => _index = 1)),
      const PlacesTab(),
      const FavoritesTab(),
      const ProfileTab(),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _index, children: _pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home),
              label: 'Trang chủ'),
          NavigationDestination(
              icon: Icon(Icons.place_outlined),
              selectedIcon: Icon(Icons.place),
              label: 'Địa điểm'),
          NavigationDestination(
              icon: Icon(Icons.favorite_border),
              selectedIcon: Icon(Icons.favorite),
              label: 'Yêu thích'),
          NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person),
              label: 'Cá nhân'),
        ],
      ),
    );
  }
}
