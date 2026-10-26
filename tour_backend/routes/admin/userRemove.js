const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');

// DELETE /api/admin/users/:id   (admin) — kéo theo danh sách yêu thích của người đó
router.delete('/admin/users/:id', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ message: 'Bạn không thể xóa chính tài khoản của mình' });

  const info = db.prepare('DELETE FROM users WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  res.json({ deleted: true });
});

module.exports = router;
