const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { imageUrl } = require('../../utils/media');

// Giờ Việt Nam = UTC+7. SQLite lưu giờ UTC nên cộng 7 tiếng trước khi gom theo ngày/tháng.
const VN = "'+7 hours'";
const q = (sql, ...p) => db.prepare(sql).get(...p).n;

function monthsList() {
  const now = new Date(Date.now() + 7 * 3600000);
  const list = [];
  for (let i = 0; i < 12; i++) {
    list.push(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)).toISOString().slice(0, 7));
  }
  return list; // mới nhất trước
}

// GET /api/admin/stats/overview?month=YYYY-MM   (admin) — trang Thống kê
// Không có month = toàn bộ thời gian (biểu đồ theo 12 tháng gần nhất).
router.get('/admin/stats/overview', requireAuth, requireAdmin, (req, res) => {
  const month = req.query.month || null;
  if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return res.status(400).json({ message: 'Tháng không hợp lệ (định dạng YYYY-MM)' });
  }

  const counts = {
    places: q('SELECT COUNT(*) AS n FROM places'),
    placesVisible: q('SELECT COUNT(*) AS n FROM places WHERE is_visible = 1'),
    foods: q('SELECT COUNT(*) AS n FROM foods'),
    spots: q('SELECT COUNT(*) AS n FROM food_spots'),
    activities: q('SELECT COUNT(*) AS n FROM activities'),
    users: q("SELECT COUNT(*) AS n FROM users WHERE role = 'user'"),
    favorites: q('SELECT COUNT(*) AS n FROM favorites'),
  };

  // Số liệu trong kỳ đang chọn
  const inPeriod = month
    ? {
        newUsers: q(`SELECT COUNT(*) AS n FROM users WHERE role = 'user' AND strftime('%Y-%m', created_at, ${VN}) = ?`, month),
        newFavorites: q(`SELECT COUNT(*) AS n FROM favorites WHERE created_at IS NOT NULL AND strftime('%Y-%m', created_at, ${VN}) = ?`, month),
      }
    : { newUsers: counts.users, newFavorites: counts.favorites };

  // Top 5 địa điểm được yêu thích nhiều nhất trong kỳ
  const topRows = db.prepare(`
    SELECT p.id, p.name, p.cover_image, c.name AS category, COUNT(*) AS favorites
    FROM favorites f
    JOIN places p ON p.id = f.place_id
    JOIN categories c ON c.id = p.category_id
    ${month ? `WHERE f.created_at IS NOT NULL AND strftime('%Y-%m', f.created_at, ${VN}) = ?` : ''}
    GROUP BY p.id ORDER BY favorites DESC, p.name LIMIT 5
  `).all(...(month ? [month] : []));
  const topPlaces = topRows.map((r) => ({
    id: r.id, name: r.name, category: r.category, favorites: r.favorites,
    coverImage: imageUrl(req, r.cover_image),
  }));

  const byCategory = db.prepare(`
    SELECT c.id, c.name, c.color, COUNT(p.id) AS count
    FROM categories c LEFT JOIN places p ON p.category_id = c.id
    GROUP BY c.id ORDER BY c.id
  `).all();

  // Biểu đồ: theo ngày của tháng đã chọn, hoặc theo tháng trong 12 tháng gần nhất
  let series;
  if (month) {
    const [y, m] = month.split('-').map(Number);
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const labels = Array.from({ length: days }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`);
    const users = {};
    const favs = {};
    db.prepare(`SELECT date(created_at, ${VN}) AS k, COUNT(*) AS n FROM users
                WHERE role = 'user' AND strftime('%Y-%m', created_at, ${VN}) = ? GROUP BY k`)
      .all(month).forEach((r) => { users[r.k] = r.n; });
    db.prepare(`SELECT date(created_at, ${VN}) AS k, COUNT(*) AS n FROM favorites
                WHERE created_at IS NOT NULL AND strftime('%Y-%m', created_at, ${VN}) = ? GROUP BY k`)
      .all(month).forEach((r) => { favs[r.k] = r.n; });
    series = { unit: 'day', labels, users: labels.map((l) => users[l] || 0), favorites: labels.map((l) => favs[l] || 0) };
  } else {
    const labels = monthsList().reverse(); // cũ nhất trước
    const users = {};
    const favs = {};
    db.prepare(`SELECT strftime('%Y-%m', created_at, ${VN}) AS k, COUNT(*) AS n FROM users
                WHERE role = 'user' GROUP BY k`).all().forEach((r) => { users[r.k] = r.n; });
    db.prepare(`SELECT strftime('%Y-%m', created_at, ${VN}) AS k, COUNT(*) AS n FROM favorites
                WHERE created_at IS NOT NULL GROUP BY k`).all().forEach((r) => { favs[r.k] = r.n; });
    series = { unit: 'month', labels, users: labels.map((l) => users[l] || 0), favorites: labels.map((l) => favs[l] || 0) };
  }

  res.json({
    month,
    months: monthsList(),
    counts,
    inPeriod,
    topPlaces,
    byCategory,
    series,
    undatedFavorites: q('SELECT COUNT(*) AS n FROM favorites WHERE created_at IS NULL'),
  });
});

module.exports = router;
