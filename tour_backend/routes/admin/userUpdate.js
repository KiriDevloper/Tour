const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { str } = require('../../utils/placeInput');
const { getUser } = require('../../utils/users');

// PUT /api/admin/users/:id   body: { name, role: 'user'|'admin' }   (admin)
router.put('/admin/users/:id', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const current = getUser(id);
  if (!current) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

  const b = req.body || {};
  const name = str(b.name);
  if (!name) return res.status(400).json({ message: 'Vui lòng nhập họ tên' });
  if (name.length > 100) return res.status(400).json({ message: 'Họ tên tối đa 100 ký tự' });

  const role = str(b.role) || current.role;
  if (role !== 'user' && role !== 'admin') return res.status(400).json({ message: 'Vai trò không hợp lệ' });
  if (id === req.user.id && role !== current.role) {
    return res.status(400).json({ message: 'Bạn không thể tự đổi quyền của chính mình' });
  }

  db.prepare('UPDATE users SET name = ?, role = ? WHERE id = ?').run(name, role, id);
  res.json(getUser(id));
});

module.exports = router;
