const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { parseSpotInput } = require('../../utils/foodInput');
const { getSpot } = require('../../utils/foods');

// POST /api/foods/:id/spots   (admin) — thêm quán cho một món
router.post('/foods/:id/spots', requireAuth, requireAdmin, (req, res) => {
  const foodId = Number(req.params.id);
  if (!db.prepare('SELECT 1 FROM foods WHERE id = ?').get(foodId)) {
    return res.status(404).json({ message: 'Không tìm thấy món ăn' });
  }

  const { error, data: d } = parseSpotInput(req.body);
  if (error) return res.status(400).json({ message: error });

  if (db.prepare('SELECT 1 FROM food_spots WHERE food_id = ? AND name = ?').get(foodId, d.name)) {
    return res.status(409).json({ message: 'Món này đã có quán trùng tên' });
  }

  const info = db.prepare(
    'INSERT INTO food_spots (food_id, name, address, lat, lng, image) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(foodId, d.name, d.address, d.lat, d.lng, d.image);

  res.status(201).json(getSpot(req, Number(info.lastInsertRowid)));
});

module.exports = router;
