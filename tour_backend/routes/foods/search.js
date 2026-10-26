const router = require('express').Router();
const { listFoods } = require('../../utils/foods');

// GET /api/foods/search?q=bun do   (không cần gõ dấu)
router.get('/foods/search', (req, res) => {
  res.json(listFoods(req, { q: req.query.q || '' }));
});

module.exports = router;
