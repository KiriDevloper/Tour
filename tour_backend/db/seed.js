// Chạy: npm run seed
// - Chạy lại bao nhiêu lần cũng được, KHÔNG mất tài khoản/yêu thích.
// - Địa điểm đã có (theo tên) sẽ được CẬP NHẬT các trường bạn điền (khác null).
// - Địa điểm mới thêm vào danh sách sẽ được tạo.
const bcrypt = require('bcryptjs');
const db = require('./database');

// Đặt = false khi bạn đã bắt đầu quản lý dữ liệu bằng trang admin:
// seed chỉ còn THÊM địa điểm/món ăn/hoạt động mới, KHÔNG ghi đè những gì đã sửa trong admin.
const UPDATE_EXISTING = true;

const categories = [
  ['Văn hóa', 'museum', '#1E6FE8'],
  ['Lịch sử', 'history', '#E8505B'],
  ['Thiên nhiên', 'nature', '#2E9E5B'],
  ['Kiến trúc', 'architecture', '#E88A1E'],
  ['Cà phê', 'cafe', '#8B5A2B'],
  ['Trải nghiệm', 'experience', '#7A4FD6'],
];

// HƯỚNG DẪN ĐIỀN:
//  lat, lng     : chuột phải vào địa điểm trên Google Maps -> bấm dòng tọa độ để sao chép
//  openHours    : ví dụ '7:30 - 22:00'
//  ticketPrice  : ví dụ '50.000đ/người' hoặc 'Miễn phí'
//  coverImage   : tên file ảnh đã chép vào public/images, ví dụ 'bao-tang-ca-phe.jpg'
// Trường nào để null thì giữ nguyên giá trị hiện có trong database.
// Địa chỉ lấy theo bản thiết kế, hãy kiểm tra lại cho chính xác.
const places = [
  {
    name: 'Bảo tàng Thế giới Cà phê', cat: 'Cà phê',
    address: 'Phan Chu Trinh, TP. Buôn Ma Thuột',
    lat: 12.6736, lng: 108.0451,
    openHours: null, ticketPrice: null,
    shortDesc: null, description: null, coverImage: null,
  },
  {
    name: 'Tượng đài chiến thắng', cat: 'Lịch sử',
    address: 'Nguyễn Tất Thành, TP. Buôn Ma Thuột',
    lat: 12.6808, lng: 108.0506,
    openHours: null, ticketPrice: null,
    shortDesc: null, description: null, coverImage: null,
  },
  {
    name: 'Buôn Ako Dhông', cat: 'Văn hóa',
    address: 'Buôn Ako Dhông, TP. Buôn Ma Thuột',
    lat: 12.69647, lng: 108.04913,
    openHours: null, ticketPrice: null,
    shortDesc: null, description: null, coverImage: null,
  },
  {
    name: 'Chùa Sắc Tứ Khải Đoan', cat: 'Kiến trúc',
    address: 'Mai Hắc Đế, TP. Buôn Ma Thuột',
    lat: 12.6764, lng: 108.0489,
    openHours: null, ticketPrice: null,
    shortDesc: null, description: null, coverImage: null,
  },
  {
    name: 'Thác Dray Nur', cat: 'Thiên nhiên',
    address: 'Huyện Buôn Đôn, Đắk Lắk',
    lat: 12.874, lng: 108.798,
    openHours: null, ticketPrice: null,
    shortDesc: null, description: null, coverImage: null,
  },
  {
    name: 'Bảo tàng Đắk Lắk', cat: 'Lịch sử',
    address: 'TP. Buôn Ma Thuột',
    lat: 12.6840, lng: 108.0520,
    openHours: null, ticketPrice: null,
    shortDesc: null, description: null, coverImage: null,
  },
];

// MÓN ĂN. Mỗi món có nhiều "spots" = quán/nơi thưởng thức (có tọa độ để hiện trên bản đồ).
// Ví dụ một quán:  { name: 'Tên quán', address: 'Địa chỉ', lat: 12.xxxx, lng: 108.xxxx }
// kind: 'Món đặc trưng' hoặc 'Đặc sản' (dùng cho bộ lọc trong app)
// image: tên file trong public/images
// MÓN ĂN
// lat: vĩ độ, lng: kinh độ
// Tọa độ tham khảo; cần kiểm tra lại ghim trên Google Maps.

const foods = [
  {
    name: 'Bún đỏ',
    kind: 'Món đặc trưng',
    shortDesc: 'Món bún đặc trưng của Buôn Ma Thuột.',
    description:
      'Bún đỏ có nước dùng đậm đà, sợi bún đặc trưng và thường ăn kèm riêu, trứng cút cùng rau.',
    image: null,
    spots: [
      {
        name: 'Bún đỏ Thu',
        address: '26 Đinh Tiên Hoàng, Buôn Ma Thuột, Đắk Lắk',
        lat: 12.6766,
        lng: 108.0458,
      },
    ],
  },
  {
    name: 'Gà nướng',
    kind: 'Món đặc trưng',
    shortDesc: 'Gà nướng thơm ngon mang phong vị Tây Nguyên.',
    description:
      'Gà nướng thường được ăn kèm muối chấm, rau rừng và cơm lam.',
    image: null,
    spots: [
      {
        name: 'Gà Nướng Cơm Lam (Lĩnh)',
        address: 'Đường Phạm Văn Đồng, Buôn Ma Thuột, Đắk Lắk',
        lat: 12.6760,
        lng: 108.0750,
      },
    ],
  },
  {
    name: 'Cơm lam',
    kind: 'Đặc sản',
    shortDesc: 'Cơm nếp nấu trong ống tre hoặc nứa.',
    description:
      'Cơm lam là món ăn truyền thống của nhiều cộng đồng dân tộc Tây Nguyên, thường dùng cùng gà nướng và muối vừng.',
    image: null,
    spots: [
      {
        name: 'Cơm Lam Gà Nướng Hồ Lắk',
        address: '30 Y Jut, Liên Sơn, khu vực hồ Lắk, Đắk Lắk',
        lat: 12.4420,
        lng: 108.1770,
      },
      {
        name: 'Gà Nướng Cơm Lam (Lĩnh)',
        address: 'Đường Phạm Văn Đồng, Buôn Ma Thuột, Đắk Lắk',
        lat: 12.6760,
        lng: 108.0750,
      },
    ],
  },
  {
    name: 'Cà đắng',
    kind: 'Đặc sản',
    shortDesc: 'Nguyên liệu đặc trưng trong ẩm thực Tây Nguyên.',
    description:
      'Cà đắng thường được chế biến cùng cá, thịt hoặc nấu canh theo cách của người dân địa phương.',
    image: null,
    spots: [
      {
        name: 'Quán Yangsin',
        address: 'Cuối đường Trần Nhật Duật, Buôn Ma Thuột, Đắk Lắk',
        lat: 12.6800,
        lng: 108.0400,
      },
    ],
  },
];

// HOẠT ĐỘNG tại địa điểm. 'place' phải trùng tên địa điểm ở trên.
// lat/lng để null thì app lấy vị trí của địa điểm; điền nếu hoạt động diễn ra ở chỗ khác.
const activities = [
  { place: 'Bảo tàng Thế giới Cà phê', name: 'Thưởng thức cà phê', description: null, image: null, lat: null, lng: null },
  { place: 'Buôn Ako Dhông', name: 'Tham quan nhà dài Ê Đê', description: null, image: null, lat: null, lng: null },
  { place: 'Thác Dray Nur', name: 'Ngắm thác và chụp ảnh', description: null, image: null, lat: null, lng: null },
];

// tên trường trong object -> tên cột trong bảng places
const FIELDS = {
  address: 'address',
  shortDesc: 'short_desc',
  description: 'description',
  lat: 'lat',
  lng: 'lng',
  openHours: 'open_hours',
  ticketPrice: 'ticket_price',
  coverImage: 'cover_image',
};

function seed() {
  db.exec('BEGIN');
  try {
    // Loại địa điểm: thêm nếu chưa có
    const insCat = db.prepare('INSERT OR IGNORE INTO categories (name, icon, color) VALUES (?, ?, ?)');
    categories.forEach((c) => insCat.run(...c));

    const findCat = db.prepare('SELECT id FROM categories WHERE name = ?');
    const findPlace = db.prepare('SELECT id FROM places WHERE name = ?');
    let added = 0;
    let updated = 0;

    for (const p of places) {
      const catId = findCat.get(p.cat).id;
      const existing = findPlace.get(p.name);

      if (!existing) {
        db.prepare(
          `INSERT INTO places (name, category_id, address, short_desc, description,
                               lat, lng, open_hours, ticket_price, cover_image)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          p.name, catId, p.address,
          p.shortDesc ?? '(điền mô tả ngắn)',
          p.description ?? '(điền mô tả chi tiết)',
          p.lat, p.lng, p.openHours, p.ticketPrice, p.coverImage
        );
        added++;
      } else if (UPDATE_EXISTING) {
        const sets = ['category_id = ?'];
        const vals = [catId];
        for (const [key, col] of Object.entries(FIELDS)) {
          if (p[key] !== null && p[key] !== undefined) {
            sets.push(`${col} = ?`);
            vals.push(p[key]);
          }
        }
        db.prepare(`UPDATE places SET ${sets.join(', ')} WHERE id = ?`).run(...vals, existing.id);
        updated++;
      }
    }
    console.log(`Địa điểm: thêm ${added}, cập nhật ${updated}`);

    // ----- Món ăn + quán -----
    let foodAdded = 0;
    let foodUpdated = 0;
    for (const f of foods) {
      let row = db.prepare('SELECT id FROM foods WHERE name = ?').get(f.name);
      const isNewFood = !row;
      if (!row) {
        const info = db.prepare(
          'INSERT INTO foods (name, kind, short_desc, description, image) VALUES (?, ?, ?, ?, ?)'
        ).run(f.name, f.kind, f.shortDesc ?? '(điền mô tả ngắn)', f.description ?? '(điền mô tả chi tiết)', f.image);
        row = { id: Number(info.lastInsertRowid) };
        foodAdded++;
      } else if (UPDATE_EXISTING) {
        const sets = ['kind = ?'];
        const vals = [f.kind];
        if (f.shortDesc != null) { sets.push('short_desc = ?'); vals.push(f.shortDesc); }
        if (f.description != null) { sets.push('description = ?'); vals.push(f.description); }
        if (f.image != null) { sets.push('image = ?'); vals.push(f.image); }
        db.prepare(`UPDATE foods SET ${sets.join(', ')} WHERE id = ?`).run(...vals, row.id);
        foodUpdated++;
      }
      for (const sp of (UPDATE_EXISTING || isNewFood ? f.spots : [])) {
        const ex = db.prepare('SELECT id FROM food_spots WHERE food_id = ? AND name = ?').get(row.id, sp.name);
        if (ex) {
          db.prepare('UPDATE food_spots SET address = ?, lat = ?, lng = ? WHERE id = ?')
            .run(sp.address ?? null, sp.lat ?? null, sp.lng ?? null, ex.id);
        } else {
          db.prepare('INSERT INTO food_spots (food_id, name, address, lat, lng) VALUES (?, ?, ?, ?, ?)')
            .run(row.id, sp.name, sp.address ?? null, sp.lat ?? null, sp.lng ?? null);
        }
      }
    }
    console.log(`Món ăn: thêm ${foodAdded}, cập nhật ${foodUpdated}`);

    // ----- Hoạt động -----
    let actAdded = 0;
    let actUpdated = 0;
    for (const a of activities) {
      const place = findPlace.get(a.place);
      if (!place) { console.warn(`Bỏ qua hoạt động "${a.name}": không có địa điểm "${a.place}"`); continue; }
      const ex = db.prepare('SELECT id FROM activities WHERE place_id = ? AND name = ?').get(place.id, a.name);
      if (!ex) {
        db.prepare('INSERT INTO activities (place_id, name, description, image, lat, lng) VALUES (?, ?, ?, ?, ?, ?)')
          .run(place.id, a.name, a.description ?? '(điền mô tả)', a.image, a.lat, a.lng);
        actAdded++;
      } else if (UPDATE_EXISTING) {
        const sets = [];
        const vals = [];
        if (a.description != null) { sets.push('description = ?'); vals.push(a.description); }
        if (a.image != null) { sets.push('image = ?'); vals.push(a.image); }
        if (a.lat != null) { sets.push('lat = ?'); vals.push(a.lat); }
        if (a.lng != null) { sets.push('lng = ?'); vals.push(a.lng); }
        if (sets.length) db.prepare(`UPDATE activities SET ${sets.join(', ')} WHERE id = ?`).run(...vals, ex.id);
        actUpdated++;
      }
    }
    console.log(`Hoạt động: thêm ${actAdded}, cập nhật ${actUpdated}`);

    if (!db.prepare("SELECT 1 FROM users WHERE role = 'admin'").get()) {
      db.prepare(
        `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')`
      ).run('Quản trị viên', 'admin@tour.local', bcrypt.hashSync('admin123', 10));
      console.log('Đã tạo admin: admin@tour.local / admin123 (hãy đổi mật khẩu sau)');
    }

    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

seed();
console.log('Seed xong.');
