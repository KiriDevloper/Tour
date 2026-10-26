const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');

// DELETE /api/places/:id   (admin) — kéo theo yêu thích, ảnh phụ, hoạt động của địa điểm đó
router.delete('/places/:id', requireAuth, requireAdmin, (req, res) => {
  const info = db.prepare('DELETE FROM places WHERE id = ?').run(Number(req.params.id));
  if (info.changes === 0) return res.status(404).json({ message: 'Không tìm thấy địa điểm' });
  res.json({ deleted: true });
});

module.exports = router;
