const db = require('../db/database');

const str = (v) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
};

// '' / null -> null, số hợp lệ -> number, còn lại -> NaN
const num = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

// true/false, 1/0, '1'/'0', 'true'/'false'; không gửi thì dùng mặc định
function parseBool(v, fallback) {
  if (v === undefined || v === null || v === '') return fallback;
  if (v === true || v === 1 || v === '1' || v === 'true') return 1;
  return 0;
}

const FILE_RE = /^[\w.\-]+$/; // tên file an toàn, không có dấu / hay ..

function isSafeFilename(f) {
  return typeof f === 'string' && FILE_RE.test(f) && !f.includes('..');
}

/** Kiểm tra dữ liệu địa điểm gửi lên. Trả về { error } hoặc { data }. */
function parsePlaceInput(body) {
  const b = body || {};

  const name = str(b.name);
  if (!name) return { error: 'Vui lòng nhập tên địa điểm' };

  const categoryId = Number(b.categoryId);
  if (!Number.isInteger(categoryId)) return { error: 'Vui lòng chọn loại địa điểm' };
  if (!db.prepare('SELECT 1 FROM categories WHERE id = ?').get(categoryId)) {
    return { error: 'Loại địa điểm không tồn tại' };
  }

  const address = str(b.address);
  if (!address) return { error: 'Vui lòng nhập địa chỉ' };
  const shortDesc = str(b.shortDesc);
  if (!shortDesc) return { error: 'Vui lòng nhập mô tả ngắn' };
  const description = str(b.description);
  if (!description) return { error: 'Vui lòng nhập mô tả chi tiết' };

  const lat = num(b.lat);
  const lng = num(b.lng);
  if (lat === null || lng === null) return { error: 'Vui lòng nhập vĩ độ và kinh độ (cần để hiện trên bản đồ)' };
  if (Number.isNaN(lat) || Number.isNaN(lng)) return { error: 'Tọa độ phải là số' };
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return { error: 'Tọa độ không hợp lệ' };

  let rating = num(b.rating);
  if (Number.isNaN(rating) || (rating !== null && (rating < 0 || rating > 5))) {
    return { error: 'Điểm đánh giá phải từ 0 đến 5' };
  }
  let ratingCount = num(b.ratingCount);
  if (Number.isNaN(ratingCount) || (ratingCount !== null && (ratingCount < 0 || !Number.isInteger(ratingCount)))) {
    return { error: 'Số lượt đánh giá phải là số nguyên không âm' };
  }

  const coverImage = str(b.coverImage);
  if (coverImage !== null && !isSafeFilename(coverImage)) return { error: 'Tên file ảnh bìa không hợp lệ' };

  return {
    data: {
      name,
      categoryId,
      address,
      shortDesc,
      description,
      lat,
      lng,
      openHours: str(b.openHours),
      ticketPrice: str(b.ticketPrice),
      rating: rating ?? 0,
      ratingCount: ratingCount ?? 0,
      coverImage,
      isVisible: parseBool(b.isVisible, 1),
    },
  };
}

module.exports = { parsePlaceInput, isSafeFilename, parseBool, str, num };
