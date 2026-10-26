const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { parsePlaceInput } = require('../../utils/placeInput');
const { toDto, findPlaceById } = require('../../utils/places');

// PUT /api/places/:id   (admin)
router.put('/places/:id', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!db.prepare('SELECT 1 FROM places WHERE id = ?').get(id)) {
    return res.status(404).json({ message: 'Không tìm thấy địa điểm' });
  }

  const { error, data: d } = parsePlaceInput(req.body);
  if (error) return res.status(400).json({ message: error });

  if (db.prepare('SELECT 1 FROM places WHERE name = ? AND id <> ?').get(d.name, id)) {
    return res.status(409).json({ message: 'Đã có địa điểm trùng tên' });
  }

  db.prepare(
    `UPDATE places SET name = ?, category_id = ?, address = ?, short_desc = ?, description = ?,
       lat = ?, lng = ?, open_hours = ?, ticket_price = ?, rating = ?, rating_count = ?, cover_image = ?, is_visible = ?
     WHERE id = ?`
  ).run(d.name, d.categoryId, d.address, d.shortDesc, d.description, d.lat, d.lng,
        d.openHours, d.ticketPrice, d.rating, d.ratingCount, d.coverImage, d.isVisible, id);

  res.json(toDto(findPlaceById(id, 0, true), req));
});

module.exports = router;
