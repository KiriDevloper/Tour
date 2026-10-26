const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { parsePlaceInput } = require('../../utils/placeInput');
const { toDto, findPlaceById } = require('../../utils/places');

// POST /api/places   (admin)
router.post('/places', requireAuth, requireAdmin, (req, res) => {
  const { error, data: d } = parsePlaceInput(req.body);
  if (error) return res.status(400).json({ message: error });

  if (db.prepare('SELECT 1 FROM places WHERE name = ?').get(d.name)) {
    return res.status(409).json({ message: 'Đã có địa điểm trùng tên' });
  }

  const info = db.prepare(
    `INSERT INTO places (name, category_id, address, short_desc, description, lat, lng,
                         open_hours, ticket_price, rating, rating_count, cover_image, is_visible)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(d.name, d.categoryId, d.address, d.shortDesc, d.description, d.lat, d.lng,
        d.openHours, d.ticketPrice, d.rating, d.ratingCount, d.coverImage, d.isVisible);

  const row = findPlaceById(Number(info.lastInsertRowid), 0, true);
  res.status(201).json({ ...toDto(row, req), images: [], imageItems: [] });
});

module.exports = router;
