const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');

// DELETE /api/places/:id/images/:imageId   (admin)
router.delete('/places/:id/images/:imageId', requireAuth, requireAdmin, (req, res) => {
  const info = db.prepare('DELETE FROM place_images WHERE id = ? AND place_id = ?')
    .run(Number(req.params.imageId), Number(req.params.id));
  if (info.changes === 0) return res.status(404).json({ message: 'Không tìm thấy ảnh' });
  res.json({ deleted: true });
});

module.exports = router;
