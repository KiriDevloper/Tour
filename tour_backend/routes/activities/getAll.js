const router = require('express').Router();
const { optionalAuth } = require('../../middleware/auth');
const { listAll } = require('../../utils/activities');

// GET /api/activities          (khách: chỉ hoạt động của địa điểm đang hiển thị)
// GET /api/activities?all=1    (admin: tất cả)
router.get('/activities', optionalAuth, (req, res) => {
  const includeHidden = req.user?.role === 'admin' && req.query.all === '1';
  res.json(listAll(req, includeHidden));
});

module.exports = router;
