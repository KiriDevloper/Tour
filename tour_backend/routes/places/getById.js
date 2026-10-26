const router = require('express').Router();
const { optionalAuth } = require('../../middleware/auth');
const { toDto, findPlaceById, findImages, findImageItems } = require('../../utils/places');

// GET /api/places/:id
router.get('/places/:id', optionalAuth, (req, res) => {
  const row = findPlaceById(
    Number(req.params.id),
    req.user?.id || 0,
    req.user?.role === 'admin'
  );
  if (!row) return res.status(404).json({ message: 'Không tìm thấy địa điểm' });
  res.json({
    ...toDto(row, req),
    images: findImages(row.id, req),
    imageItems: findImageItems(row.id, req),
  });
});

module.exports = router;
