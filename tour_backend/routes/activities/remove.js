const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');

// DELETE /api/activities/:id   (admin)
router.delete('/activities/:id', requireAuth, requireAdmin, (req, res) => {
  const info = db.prepare('DELETE FROM activities WHERE id = ?').run(Number(req.params.id));
  if (info.changes === 0) return res.status(404).json({ message: 'Không tìm thấy hoạt động' });
  res.json({ deleted: true });
});

module.exports = router;
