const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { parseActivityInput } = require('../../utils/activityInput');
const { getActivity } = require('../../utils/activities');

// POST /api/activities   (admin)
router.post('/activities', requireAuth, requireAdmin, (req, res) => {
  const { error, data: d } = parseActivityInput(req.body);
  if (error) return res.status(400).json({ message: error });

  if (db.prepare('SELECT 1 FROM activities WHERE place_id = ? AND name = ?').get(d.placeId, d.name)) {
    return res.status(409).json({ message: 'Địa điểm này đã có hoạt động trùng tên' });
  }

  const info = db.prepare(
    'INSERT INTO activities (place_id, name, description, image, lat, lng) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(d.placeId, d.name, d.description, d.image, d.lat, d.lng);

  res.status(201).json(getActivity(req, Number(info.lastInsertRowid), true));
});

module.exports = router;
