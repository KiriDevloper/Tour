const router = require('express').Router();
const { listByPlace } = require('../../utils/activities');

// GET /api/places/:id/activities
router.get('/places/:id/activities', (req, res) => {
  res.json(listByPlace(req, Number(req.params.id)));
});

module.exports = router;
