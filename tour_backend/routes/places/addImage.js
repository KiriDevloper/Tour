const router = require('express').Router();
const db = require('../../db/database');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { isSafeFilename } = require('../../utils/placeInput');
const { imageUrl } = require('../../utils/media');

// POST /api/places/:id/images   body: { filename }   (admin; ảnh đã upload qua /api/uploads)
router.post('/places/:id/images', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!db.prepare('SELECT 1 FROM places WHERE id = ?').get(id)) {
    return res.status(404).json({ message: 'Không tìm thấy địa điểm' });
  }
  const filename = req.body && req.body.filename;
  if (!isSafeFilename(filename)) return res.status(400).json({ message: 'Tên file ảnh không hợp lệ' });

  const n = db.prepare('SELECT COUNT(*) AS n FROM place_images WHERE place_id = ?').get(id).n;
  if (n >= 5) return res.status(400).json({ message: 'Mỗi địa điểm chỉ có tối đa 5 ảnh phụ' });

  const info = db.prepare('INSERT INTO place_images (place_id, image_url) VALUES (?, ?)').run(id, filename);
  res.status(201).json({ id: Number(info.lastInsertRowid), url: imageUrl(req, filename) });
});

module.exports = router;
