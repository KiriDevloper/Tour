const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { listUsers } = require('../../utils/users');

// GET /api/admin/users   (admin) — tất cả tài khoản kèm số địa điểm đã yêu thích
router.get('/admin/users', requireAuth, requireAdmin, (req, res) => {
  res.json(listUsers());
});

module.exports = router;
