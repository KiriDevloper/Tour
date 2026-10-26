const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { spotDto } = require('../../utils/foods');

// GET /api/admin/spots   (admin) — tất cả quán của mọi món (trang "Quán ăn")
router.get('/admin/spots', requireAuth, requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT s.*, f.name AS food_name
    FROM food_spots s JOIN foods f ON f.id = s.food_id
    ORDER BY f.name, s.name
  `).all();
  res.json(rows.map((r) => ({ ...spotDto(r, req), foodId: r.food_id, foodName: r.food_name })));
});

module.exports = router;
