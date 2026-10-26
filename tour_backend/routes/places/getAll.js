const router = require('express').Router();
const { optionalAuth } = require('../../middleware/auth');
const { toDto, findPlaces } = require('../../utils/places');

// GET /api/places?category=<id>
router.get('/places', optionalAuth, (req, res) => {
  const rows = findPlaces({
    userId: req.user?.id || 0,
    categoryId: req.query.category ? Number(req.query.category) : null,
    includeHidden: req.user?.role === 'admin' && req.query.all === '1',
  });
  res.json(rows.map((r) => toDto(r, req)));
});

module.exports = router;
