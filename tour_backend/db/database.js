const path = require('path');
const { DatabaseSync } = require('node:sqlite'); // có sẵn trong Node, không cần cài

const db = new DatabaseSync(path.join(__dirname, 'tour.db'));
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT
);

CREATE TABLE IF NOT EXISTS places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  address TEXT,
  short_desc TEXT,
  description TEXT,
  lat REAL,
  lng REAL,
  open_hours TEXT,
  ticket_price TEXT,
  rating REAL DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  cover_image TEXT,
  is_visible INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS place_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS foods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  short_desc TEXT,
  description TEXT,
  image TEXT,
  kind TEXT NOT NULL DEFAULT 'Món đặc trưng',
  place_id INTEGER REFERENCES places(id) ON DELETE SET NULL
);

-- Nơi thưởng thức một món ăn (một món có thể có nhiều quán)
CREATE TABLE IF NOT EXISTS food_spots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  food_id INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  lat REAL,
  lng REAL,
  image TEXT
);

CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  lat REAL,
  lng REAL
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  created_at TEXT,
  PRIMARY KEY (user_id, place_id)
);
`);

// Nâng cấp database cũ (đã tạo từ phiên bản trước) mà không mất dữ liệu
function addColumnIfMissing(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!cols.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}
addColumnIfMissing('foods', 'kind', "TEXT NOT NULL DEFAULT 'Món đặc trưng'");
addColumnIfMissing('activities', 'lat', 'REAL');
addColumnIfMissing('activities', 'lng', 'REAL');
addColumnIfMissing('places', 'is_visible', 'INTEGER NOT NULL DEFAULT 1');
addColumnIfMissing('users', 'is_active', 'INTEGER NOT NULL DEFAULT 1');
addColumnIfMissing('food_spots', 'image', 'TEXT');
// Ngày thêm vào yêu thích (dùng cho thống kê theo tháng). Lượt yêu thích cũ không có ngày -> NULL.
addColumnIfMissing('favorites', 'created_at', 'TEXT');

module.exports = db;
