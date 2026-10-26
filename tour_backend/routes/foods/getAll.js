const router = require('express').Router();
const { listFoods } = require('../../utils/foods');

// GET /api/foods?kind=Đặc sản
router.get('/foods', (req, res) => {
  res.json(listFoods(req, { kind: req.query.kind || null }));
});

module.exports = router;
