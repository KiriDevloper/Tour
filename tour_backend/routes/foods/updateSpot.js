const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { parseSpotInput } = require('../../utils/foodInput');
const { getSpot } = require('../../utils/foods');

// PUT /api/foods/:id/spots/:spotId   (admin)
router.put('/foods/:id/spots/:spotId', requireAuth, requireAdmin, (req, res) => {
  const foodId = Number(req.params.id);
  const spotId = Number(req.params.spotId);
  if (!db.prepare('SELECT 1 FROM food_spots WHERE id = ? AND food_id = ?').get(spotId, foodId)) {
    return res.status(404).json({ message: 'Không tìm thấy quán' });
  }

  const { error, data: d } = parseSpotInput(req.body);
  if (error) return res.status(400).json({ message: error });

  if (db.prepare('SELECT 1 FROM food_spots WHERE food_id = ? AND name = ? AND id <> ?').get(foodId, d.name, spotId)) {
    return res.status(409).json({ message: 'Món này đã có quán trùng tên' });
  }

  db.prepare('UPDATE food_spots SET name = ?, address = ?, lat = ?, lng = ?, image = ? WHERE id = ?')
    .run(d.name, d.address, d.lat, d.lng, d.image, spotId);

  res.json(getSpot(req, spotId));
});

module.exports = router;
