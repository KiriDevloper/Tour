// Tạo đường dẫn ảnh đầy đủ từ tên file trong public/images
function imageUrl(req, file) {
  return file ? `${req.protocol}://${req.get('host')}/images/${file}` : null;
}

module.exports = { imageUrl };
