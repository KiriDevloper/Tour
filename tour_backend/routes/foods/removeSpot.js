const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');

// DELETE /api/foods/:id/spots/:spotId   (admin)
router.delete('/foods/:id/spots/:spotId', requireAuth, requireAdmin, (req, res) => {
  const info = db.prepare('DELETE FROM food_spots WHERE id = ? AND food_id = ?')
    .run(Number(req.params.spotId), Number(req.params.id));
  if (info.changes === 0) return res.status(404).json({ message: 'Không tìm thấy quán' });
  res.json({ deleted: true });
});

module.exports = router;
