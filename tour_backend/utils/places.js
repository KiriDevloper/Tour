const db = require('../db/database');

// Bỏ dấu tiếng Việt để tìm "bao tang" ra "Bảo tàng"
function normalize(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase();
}

function toDto(row, req) {
  const base = `${req.protocol}://${req.get('host')}/images/`;
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    categoryName: row.category_name,
    address: row.address,
    shortDesc: row.short_desc,
    description: row.description,
    lat: row.lat,
    lng: row.lng,
    openHours: row.open_hours,
    ticketPrice: row.ticket_price,
    rating: row.rating,
    ratingCount: row.rating_count,
    coverImage: row.cover_image ? base + row.cover_image : null,
    isFavorite: !!row.is_favorite,
    isVisible: !!row.is_visible,
  };
}

const SELECT = `
  SELECT p.*, c.name AS category_name,
    EXISTS (SELECT 1 FROM favorites f WHERE f.place_id = p.id AND f.user_id = ?) AS is_favorite
  FROM places p JOIN categories c ON c.id = p.category_id
`;

function findPlaces({ userId = 0, categoryId = null, q = '', includeHidden = false }) {
  const where = [];
  const params = [userId];
  if (!includeHidden) where.push('p.is_visible = 1');
  if (categoryId) {
    where.push('p.category_id = ?');
    params.push(categoryId);
  }
  let rows = db
    .prepare(`${SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY p.name`)
    .all(...params);
  const key = normalize(q).trim();
  if (key) {
    rows = rows.filter((r) =>
      normalize(`${r.name} ${r.address} ${r.short_desc}`).includes(key)
    );
  }
  return rows;
}

// Địa điểm đang bị ẩn chỉ admin (includeHidden) mới xem được
function findPlaceById(id, userId = 0, includeHidden = false) {
  const row = db.prepare(`${SELECT} WHERE p.id = ?`).get(userId, id);
  if (!row) return undefined;
  if (!row.is_visible && !includeHidden) return undefined;
  return row;
}

function findImages(placeId, req) {
  const base = `${req.protocol}://${req.get('host')}/images/`;
  return db.prepare('SELECT image_url FROM place_images WHERE place_id = ?')
    .all(placeId).map((r) => base + r.image_url);
}

// Ảnh phụ kèm id (admin cần id để xóa)
function findImageItems(placeId, req) {
  const base = `${req.protocol}://${req.get('host')}/images/`;
  return db.prepare('SELECT id, image_url FROM place_images WHERE place_id = ? ORDER BY id')
    .all(placeId).map((r) => ({ id: r.id, url: base + r.image_url }));
}

module.exports = { normalize, toDto, findPlaces, findPlaceById, findImages, findImageItems };
