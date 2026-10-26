const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth } = require('../../middleware/auth');

// POST /api/favorites/:placeId
router.post('/favorites/:placeId', requireAuth, (req, res) => {
  const placeId = Number(req.params.placeId);
  if (!db.prepare('SELECT 1 FROM places WHERE id = ?').get(placeId)) {
    return res.status(404).json({ message: 'Không tìm thấy địa điểm' });
  }
  db.prepare("INSERT OR IGNORE INTO favorites (user_id, place_id, created_at) VALUES (?, ?, datetime('now'))").run(req.user.id, placeId);
  res.status(201).json({ placeId, isFavorite: true });
});

module.exports = router;
