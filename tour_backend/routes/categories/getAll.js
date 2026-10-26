const router = require('express').Router();
const db = require('../../db/database');

// GET /api/categories  -> kèm số địa điểm (tự đếm)
router.get('/categories', (req, res) => {
  const rows = db.prepare(`
    SELECT c.id, c.name, c.icon, c.color, COUNT(p.id) AS placeCount
    FROM categories c LEFT JOIN places p ON p.category_id = c.id AND p.is_visible = 1
    GROUP BY c.id ORDER BY c.id
  `).all();
  res.json(rows);
});

module.exports = router;
