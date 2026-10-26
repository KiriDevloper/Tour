const db = require('../db/database');
const { imageUrl } = require('./media');

// Vị trí hoạt động: dùng tọa độ riêng nếu có, nếu không lấy theo địa điểm
const SELECT = `
  SELECT a.*, p.name AS place_name, p.address AS place_address, p.is_visible AS place_visible,
         COALESCE(a.lat, p.lat) AS lat_eff, COALESCE(a.lng, p.lng) AS lng_eff
  FROM activities a JOIN places p ON p.id = a.place_id
`;

// Khách chỉ thấy hoạt động của địa điểm đang hiển thị; admin (includeHidden) thấy tất cả
const visible = (includeHidden) => (includeHidden ? '' : 'AND p.is_visible = 1');

function toDto(row, req) {
  return {
    id: row.id,
    placeId: row.place_id,
    placeName: row.place_name,
    placeAddress: row.place_address,
    placeVisible: !!row.place_visible,
    name: row.name,
    description: row.description,
    image: imageUrl(req, row.image),
    lat: row.lat_eff, // vị trí dùng để hiện trên bản đồ (riêng hoặc theo địa điểm)
    lng: row.lng_eff,
    ownLat: row.lat, // tọa độ riêng của hoạt động (null = theo địa điểm), admin dùng để sửa
    ownLng: row.lng,
  };
}

const listAll = (req, includeHidden = false) =>
  db.prepare(`${SELECT} WHERE 1 = 1 ${visible(includeHidden)} ORDER BY p.name, a.name`)
    .all().map((r) => toDto(r, req));

const listByPlace = (req, placeId, includeHidden = false) =>
  db.prepare(`${SELECT} WHERE a.place_id = ? ${visible(includeHidden)} ORDER BY a.name`)
    .all(placeId).map((r) => toDto(r, req));

function getActivity(req, id, includeHidden = false) {
  const row = db.prepare(`${SELECT} WHERE a.id = ? ${visible(includeHidden)}`).get(id);
  return row ? toDto(row, req) : null;
}

module.exports = { listAll, listByPlace, getActivity };
