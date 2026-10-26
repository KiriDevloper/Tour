const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth } = require('../../middleware/auth');

// DELETE /api/favorites/:placeId
router.delete('/favorites/:placeId', requireAuth, (req, res) => {
  const placeId = Number(req.params.placeId);
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND place_id = ?').run(req.user.id, placeId);
  res.json({ placeId, isFavorite: false });
});

module.exports = router;
