const router = require('express').Router();
const { optionalAuth } = require('../../middleware/auth');
const { getActivity } = require('../../utils/activities');

// GET /api/activities/:id
router.get('/activities/:id', optionalAuth, (req, res) => {
  const a = getActivity(req, Number(req.params.id), req.user?.role === 'admin');
  if (!a) return res.status(404).json({ message: 'Không tìm thấy hoạt động' });
  res.json(a);
});

module.exports = router;
