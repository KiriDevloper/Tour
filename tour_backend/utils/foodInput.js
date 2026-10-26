const db = require('../db/database');
const { str, num, isSafeFilename } = require('./placeInput');

/** Kiểm tra dữ liệu món ăn. Trả về { error } hoặc { data }. */
function parseFoodInput(body) {
  const b = body || {};

  const name = str(b.name);
  if (!name) return { error: 'Vui lòng nhập tên món ăn' };
  if (name.length > 100) return { error: 'Tên món ăn tối đa 100 ký tự' };

  const kind = str(b.kind);
  if (!kind) return { error: 'Vui lòng chọn loại món ăn' };
  if (kind.length > 50) return { error: 'Loại món ăn tối đa 50 ký tự' };

  const shortDesc = str(b.shortDesc);
  if (!shortDesc) return { error: 'Vui lòng nhập mô tả ngắn' };
  const description = str(b.description);
  if (!description) return { error: 'Vui lòng nhập mô tả chi tiết' };

  const image = str(b.image);
  if (image !== null && !isSafeFilename(image)) return { error: 'Tên file ảnh không hợp lệ' };

  let placeId = null;
  if (b.placeId !== undefined && b.placeId !== null && b.placeId !== '') {
    placeId = Number(b.placeId);
    if (!Number.isInteger(placeId) || !db.prepare('SELECT 1 FROM places WHERE id = ?').get(placeId)) {
      return { error: 'Địa điểm liên quan không tồn tại' };
    }
  }

  return { data: { name, kind, shortDesc, description, image, placeId } };
}

/** Kiểm tra dữ liệu quán ăn (nơi thưởng thức). Cần tọa độ để hiện trên bản đồ. */
function parseSpotInput(body) {
  const b = body || {};

  const name = str(b.name);
  if (!name) return { error: 'Vui lòng nhập tên quán' };
  const address = str(b.address);
  if (!address) return { error: 'Vui lòng nhập địa chỉ quán' };

  const lat = num(b.lat);
  const lng = num(b.lng);
  if (lat === null || lng === null) return { error: 'Vui lòng nhập vĩ độ và kinh độ (cần để hiện trên bản đồ)' };
  if (Number.isNaN(lat) || Number.isNaN(lng)) return { error: 'Tọa độ phải là số' };
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return { error: 'Tọa độ không hợp lệ' };

  const image = str(b.image);
  if (image !== null && !isSafeFilename(image)) return { error: 'Tên file ảnh không hợp lệ' };

  return { data: { name, address, lat, lng, image } };
}

module.exports = { parseFoodInput, parseSpotInput };
