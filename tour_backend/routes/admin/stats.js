const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { imageUrl } = require('../../utils/media');

const count = (sql) => db.prepare(sql).get().n;

// GET /api/admin/stats   (admin) — số liệu cho trang Tổng quan và Thống kê
router.get('/admin/stats', requireAuth, requireAdmin, (req, res) => {
  const counts = {
    places: count('SELECT COUNT(*) AS n FROM places'),
    placesVisible: count('SELECT COUNT(*) AS n FROM places WHERE is_visible = 1'),
    foods: count('SELECT COUNT(*) AS n FROM foods'),
    spots: count('SELECT COUNT(*) AS n FROM food_spots'),
    activities: count('SELECT COUNT(*) AS n FROM activities'),
    users: count("SELECT COUNT(*) AS n FROM users WHERE role = 'user'"),
    favorites: count('SELECT COUNT(*) AS n FROM favorites'),
  };

  const top = db.prepare(`
    SELECT p.id, p.name, p.cover_image, COUNT(f.user_id) AS favorites
    FROM places p JOIN favorites f ON f.place_id = p.id
    GROUP BY p.id ORDER BY favorites DESC, p.name LIMIT 1
  `).get();

  const byCategory = db.prepare(`
    SELECT c.id, c.name, c.color, COUNT(p.id) AS count
    FROM categories c LEFT JOIN places p ON p.category_id = c.id
    GROUP BY c.id ORDER BY c.id
  `).all();

  // Người dùng mới đăng ký 7 ngày gần nhất (tính theo giờ Việt Nam, UTC+7)
  const perDay = {};
  db.prepare(`
    SELECT date(created_at, '+7 hours') AS d, COUNT(*) AS n FROM users
    WHERE role = 'user' AND date(created_at, '+7 hours') >= date('now', '+7 hours', '-6 days')
    GROUP BY d
  `).all().forEach((r) => { perDay[r.d] = r.n; });
  const usersByDay = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() + 7 * 3600000 - i * 86400000).toISOString().slice(0, 10);
    usersByDay.push({ date: d, count: perDay[d] || 0 });
  }

  const recentUsers = db.prepare(
    "SELECT id, name, email, created_at AS createdAt FROM users WHERE role = 'user' ORDER BY id DESC LIMIT 5"
  ).all();

  res.json({
    counts,
    topFavorite: top
      ? { id: top.id, name: top.name, favorites: top.favorites, coverImage: imageUrl(req, top.cover_image) }
      : null,
    byCategory,
    usersByDay,
    recentUsers,
  });
});

module.exports = router;
