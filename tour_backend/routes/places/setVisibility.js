const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { parseBool } = require('../../utils/placeInput');

// PATCH /api/places/:id/visibility   body: { isVisible: true|false }   (admin)
router.patch('/places/:id/visibility', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const isVisible = parseBool(req.body && req.body.isVisible, null);
  if (isVisible === null) return res.status(400).json({ message: 'Thiếu trạng thái hiển thị' });

  const info = db.prepare('UPDATE places SET is_visible = ? WHERE id = ?').run(isVisible, id);
  if (info.changes === 0) return res.status(404).json({ message: 'Không tìm thấy địa điểm' });
  res.json({ id, isVisible: !!isVisible });
});

module.exports = router;
