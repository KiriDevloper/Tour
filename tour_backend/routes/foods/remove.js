const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');

// DELETE /api/foods/:id   (admin) — kéo theo các quán của món đó
router.delete('/foods/:id', requireAuth, requireAdmin, (req, res) => {
  const info = db.prepare('DELETE FROM foods WHERE id = ?').run(Number(req.params.id));
  if (info.changes === 0) return res.status(404).json({ message: 'Không tìm thấy món ăn' });
  res.json({ deleted: true });
});

module.exports = router;
