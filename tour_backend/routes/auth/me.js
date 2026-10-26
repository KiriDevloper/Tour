const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth } = require('../../middleware/auth');

// GET /api/auth/me   (cần token)
router.get('/auth/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'Tài khoản không tồn tại' });
  res.json(user);
});

module.exports = router;
