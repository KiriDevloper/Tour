import 'package:flutter/material.dart';
import '../core/theme.dart';

/// Ảnh từ mạng, có khung thay thế khi chưa có ảnh hoặc tải lỗi.
class NetImage extends StatelessWidget {
  final String? url;
  final double? width;
  final double? height;
  final BoxFit fit;

  const NetImage({super.key, this.url, this.width, this.height, this.fit = BoxFit.cover});

  @override
  Widget build(BuildContext context) {
    final placeholder = Container(
      width: width,
      height: height,
      color: AppColors.background,
      child: const Icon(Icons.landscape_outlined, color: AppColors.muted, size: 32),
    );
    if (url == null || url!.isEmpty) return placeholder;
    return Image.network(
      url!,
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (_, __, ___) => placeholder,
    );
  }
}
