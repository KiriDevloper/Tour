# Khám phá Buôn Ma Thuột

Ứng dụng di động giúp du khách khám phá các địa điểm nổi tiếng, món ăn đặc trưng và hoạt động trải nghiệm tại Buôn Ma Thuột (Đắk Lắk), kèm trang quản trị web để quản lý nội dung.

Đồ án học phần **Lập trình di động**.

## Thành phần

| Thư mục | Nội dung | Công nghệ |
|---|---|---|
| `tour/` | Ứng dụng di động | Flutter (Dart) |
| `tour_backend/` | API và trang quản trị web (`/admin`) | Node.js, Express, SQLite |

## Tính năng

**Ứng dụng di động**
- Đăng ký, đăng nhập (giữ phiên đăng nhập)
- Trang chủ, danh sách địa điểm, lọc theo loại, tìm kiếm không cần gõ dấu
- Chi tiết địa điểm: ảnh, mô tả, giờ mở cửa, giá vé, hoạt động tại địa điểm
- Yêu thích (lưu theo tài khoản)
- Món ăn và các quán thưởng thức, hoạt động trải nghiệm
- Bản đồ trong ứng dụng (OpenStreetMap), vị trí của người dùng và khoảng cách
- Chỉ đường từ vị trí hiện tại đến địa điểm, vẽ tuyến ngay trên bản đồ (ô tô/xe máy, xe đạp, đi bộ)

**Trang quản trị web**
- Tổng quan và thống kê (theo tháng, theo loại địa điểm, địa điểm được yêu thích nhất)
- Quản lý địa điểm (ẩn/hiện, ảnh bìa, ảnh phụ), món ăn, quán ăn, hoạt động
- Quản lý người dùng (khóa/mở khóa, đổi quyền, xóa)

## Yêu cầu

- [Node.js](https://nodejs.org) **22.13 trở lên** (dùng SQLite tích hợp sẵn của Node, không cần cài thêm gì để biên dịch)
- [Flutter SDK](https://docs.flutter.dev/get-started/install) và Android Studio (hoặc điện thoại Android)

## Chạy backend

```bash
cd tour_backend
npm install
npm run seed     # tạo database, loại địa điểm, dữ liệu mẫu và tài khoản admin
npm start        # chạy tại http://localhost:3000
```

- Trang quản trị: <http://localhost:3000/admin>
- Tài khoản admin mặc định: `admin@tour.local` / `admin123` — **hãy đổi mật khẩu trước khi dùng thật**.
- Đặt biến môi trường `JWT_SECRET` bằng một chuỗi bí mật riêng khi triển khai.
- Database (`db/tour.db`) không nằm trong repo. Dữ liệu mẫu nằm trong `db/seed.js`; chạy lại `npm run seed` bao nhiêu lần cũng được.

## Chạy ứng dụng

```bash
cd tour
flutter pub get
flutter run
```

Địa chỉ backend cấu hình trong `tour/lib/core/config.dart`:

| Chạy trên | Giá trị `host` |
|---|---|
| Máy ảo Android (emulator) | `10.0.2.2` (mặc định) |
| Điện thoại thật cùng Wi-Fi với máy tính | IP của máy tính, ví dụ `192.168.1.5` |

Khi dùng máy ảo, hãy đặt vị trí giả lập ở Buôn Ma Thuột (khoảng `12.667, 108.038`) để chức năng khoảng cách và chỉ đường cho kết quả hợp lý.

Build file cài đặt: `flutter build apk --release`

## Ghi chú

- Bản đồ dùng máy chủ ảnh nền và dịch vụ tìm đường miễn phí của OpenStreetMap, phù hợp cho đồ án và lưu lượng nhỏ. Nếu phát hành rộng rãi nên chuyển sang nhà cung cấp có khóa API riêng.
- Ứng dụng cần kết nối mạng để tải bản đồ và tìm đường.
