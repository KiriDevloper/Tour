const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth } = require('../../middleware/auth');
const { toDto } = require('../../utils/places');

// GET /api/favorites
router.get('/favorites', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT p.*, c.name AS category_name, 1 AS is_favorite
    FROM favorites f
    JOIN places p ON p.id = f.place_id
    JOIN categories c ON c.id = p.category_id
    WHERE f.user_id = ? AND p.is_visible = 1 ORDER BY p.name
  `).all(req.user.id);
  res.json(rows.map((r) => toDto(r, req)));
});

module.exports = router;
