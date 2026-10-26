const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { parseFoodInput } = require('../../utils/foodInput');
const { getFood } = require('../../utils/foods');

// PUT /api/foods/:id   (admin)
router.put('/foods/:id', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!db.prepare('SELECT 1 FROM foods WHERE id = ?').get(id)) {
    return res.status(404).json({ message: 'Không tìm thấy món ăn' });
  }

  const { error, data: d } = parseFoodInput(req.body);
  if (error) return res.status(400).json({ message: error });

  if (db.prepare('SELECT 1 FROM foods WHERE name = ? AND id <> ?').get(d.name, id)) {
    return res.status(409).json({ message: 'Đã có món ăn trùng tên' });
  }

  db.prepare(
    'UPDATE foods SET name = ?, kind = ?, short_desc = ?, description = ?, image = ?, place_id = ? WHERE id = ?'
  ).run(d.name, d.kind, d.shortDesc, d.description, d.image, d.placeId, id);

  res.json(getFood(req, id));
});

module.exports = router;
