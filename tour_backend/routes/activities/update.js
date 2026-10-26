const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { parseActivityInput } = require('../../utils/activityInput');
const { getActivity } = require('../../utils/activities');

// PUT /api/activities/:id   (admin)
router.put('/activities/:id', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!db.prepare('SELECT 1 FROM activities WHERE id = ?').get(id)) {
    return res.status(404).json({ message: 'Không tìm thấy hoạt động' });
  }

  const { error, data: d } = parseActivityInput(req.body);
  if (error) return res.status(400).json({ message: error });

  if (db.prepare('SELECT 1 FROM activities WHERE place_id = ? AND name = ? AND id <> ?').get(d.placeId, d.name, id)) {
    return res.status(409).json({ message: 'Địa điểm này đã có hoạt động trùng tên' });
  }

  db.prepare(
    'UPDATE activities SET place_id = ?, name = ?, description = ?, image = ?, lat = ?, lng = ? WHERE id = ?'
  ).run(d.placeId, d.name, d.description, d.image, d.lat, d.lng, id);

  res.json(getActivity(req, id, true));
});

module.exports = router;
