const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { parseFoodInput } = require('../../utils/foodInput');
const { getFood } = require('../../utils/foods');

// POST /api/foods   (admin)
router.post('/foods', requireAuth, requireAdmin, (req, res) => {
  const { error, data: d } = parseFoodInput(req.body);
  if (error) return res.status(400).json({ message: error });

  if (db.prepare('SELECT 1 FROM foods WHERE name = ?').get(d.name)) {
    return res.status(409).json({ message: 'Đã có món ăn trùng tên' });
  }

  const info = db.prepare(
    'INSERT INTO foods (name, kind, short_desc, description, image, place_id) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(d.name, d.kind, d.shortDesc, d.description, d.image, d.placeId);

  res.status(201).json(getFood(req, Number(info.lastInsertRowid)));
});

module.exports = router;
