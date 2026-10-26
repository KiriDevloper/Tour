const db = require('../db/database');
const { str, num, isSafeFilename } = require('./placeInput');

/** Kiểm tra dữ liệu hoạt động. Trả về { error } hoặc { data }. */
function parseActivityInput(body) {
  const b = body || {};

  const placeId = str(b.placeId) === null ? NaN : Number(b.placeId);
  if (!Number.isInteger(placeId)) return { error: 'Vui lòng chọn địa điểm' };
  if (!db.prepare('SELECT 1 FROM places WHERE id = ?').get(placeId)) {
    return { error: 'Địa điểm không tồn tại' };
  }

  const name = str(b.name);
  if (!name) return { error: 'Vui lòng nhập tên hoạt động' };
  if (name.length > 100) return { error: 'Tên hoạt động tối đa 100 ký tự' };

  const description = str(b.description);
  if (!description) return { error: 'Vui lòng nhập mô tả hoạt động' };

  const image = str(b.image);
  if (image !== null && !isSafeFilename(image)) return { error: 'Tên file ảnh không hợp lệ' };

  // Tọa độ riêng: không bắt buộc (bỏ trống = lấy vị trí của địa điểm), nhưng đã nhập thì phải đủ cả hai
  const lat = num(b.lat);
  const lng = num(b.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return { error: 'Tọa độ phải là số' };
  if ((lat === null) !== (lng === null)) return { error: 'Phải nhập đủ cả vĩ độ và kinh độ (hoặc để trống cả hai)' };
  if (lat !== null && (lat < -90 || lat > 90 || lng < -180 || lng > 180)) return { error: 'Tọa độ không hợp lệ' };

  return { data: { placeId, name, description, image, lat, lng } };
}

module.exports = { parseActivityInput };
