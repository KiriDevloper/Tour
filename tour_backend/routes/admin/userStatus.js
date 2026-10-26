const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { parseBool } = require('../../utils/placeInput');
const { getUser } = require('../../utils/users');

// PATCH /api/admin/users/:id/status   body: { isActive: true|false }   (admin)
// Khóa tài khoản có hiệu lực ngay: token cũ bị từ chối ở lần gọi API kế tiếp.
router.patch('/admin/users/:id/status', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const isActive = parseBool(req.body && req.body.isActive, null);
  if (isActive === null) return res.status(400).json({ message: 'Thiếu trạng thái tài khoản' });
  if (!getUser(id)) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  if (id === req.user.id) return res.status(400).json({ message: 'Bạn không thể khóa chính tài khoản của mình' });

  db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(isActive, id);
  res.json(getUser(id));
});

module.exports = router;
