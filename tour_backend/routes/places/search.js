const router = require('express').Router();
const { optionalAuth } = require('../../middleware/auth');
const { toDto, findPlaces } = require('../../utils/places');

// GET /api/places/search?q=bao tang&category=<id>   (không cần gõ dấu)
router.get('/places/search', optionalAuth, (req, res) => {
  const rows = findPlaces({
    userId: req.user?.id || 0,
    categoryId: req.query.category ? Number(req.query.category) : null,
    q: req.query.q || '',
    includeHidden: req.user?.role === 'admin' && req.query.all === '1',
  });
  res.json(rows.map((r) => toDto(r, req)));
});

module.exports = router;
