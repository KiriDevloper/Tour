const path = require('path');
const crypto = require('crypto');
const router = require('express').Router();
const multer = require('multer');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const { imageUrl } = require('../../utils/media');

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'public', 'images'),
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${EXT[file.mimetype]}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (EXT[file.mimetype]) return cb(null, true);
    cb(new Error('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP'));
  },
}).single('image');

// POST /api/uploads   (admin) — form-data, trường "image"
router.post('/uploads', requireAuth, requireAdmin, (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'Ảnh tối đa 5MB' : err.message;
      return res.status(400).json({ message });
    }
    if (!req.file) return res.status(400).json({ message: 'Chưa chọn ảnh' });
    res.status(201).json({ filename: req.file.filename, url: imageUrl(req, req.file.filename) });
  });
});

module.exports = router;
