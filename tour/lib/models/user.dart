class AppUser {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final String role;

  AppUser({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    required this.role,
  });

  factory AppUser.fromJson(Map<String, dynamic> j) => AppUser(
        id: j['id'] as int,
        name: j['name'] as String,
        email: j['email'] as String,
        phone: j['phone'] as String?,
        role: (j['role'] as String?) ?? 'user',
      );
}
