// Hàm dùng chung cho mọi trang admin. Định nghĩa MỘT lần ở đây, các file khác không khai báo lại.
const API = '/api';

const Auth = {
  get token() { return localStorage.getItem('admin_token'); },
  user() {
    try { return JSON.parse(localStorage.getItem('admin_user') || 'null'); } catch { return null; }
  },
  save(token, user) {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },
};

const $ = (id) => document.getElementById(id);

// Chống chèn HTML khi hiển thị dữ liệu do người dùng nhập
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Bỏ dấu tiếng Việt để tìm kiếm "bao tang" ra "Bảo tàng"
function norm(s) {
  return String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase();
}

/**
 * Gọi API. options: { method, body (JSON), form (FormData) }
 * Tự gắn token, tự đọc lỗi từ backend, tự về trang đăng nhập khi hết phiên.
 */
async function api(path, options = {}) {
  const { method = 'GET', body, form } = options;
  const headers = {};
  if (Auth.token) headers.Authorization = 'Bearer ' + Auth.token;

  let payload;
  if (form) {
    payload = form; // trình duyệt tự đặt Content-Type cho FormData
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(API + path, { method, headers, body: payload });
  } catch {
    throw new Error('Không kết nối được máy chủ. Backend có đang chạy không?');
  }

  let data = null;
  try { data = await res.json(); } catch { /* không có nội dung */ }

  if (res.status === 401 && Auth.token) {
    Auth.clear();
    location.href = 'login.html';
    throw new Error('Phiên đăng nhập đã hết hạn');
  }
  if (!res.ok) throw new Error((data && data.message) || 'Có lỗi xảy ra (' + res.status + ')');
  return data;
}

// Chỉ cho admin vào trang
function requireAdmin() {
  const u = Auth.user();
  if (!Auth.token || !u || u.role !== 'admin') {
    Auth.clear();
    location.href = 'login.html';
  }
}

// ---------- thông báo ----------
// Thông báo hiện ở thẻ <div id="alerts"> của trang
function showAlert(message, type = 'success') {
  const box = $('alerts');
  if (!box) return;
  box.innerHTML =
    `<div class="alert alert-${type} alert-dismissible fade show">${esc(message)}` +
    `<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
}

// Thông báo giữ lại qua lần chuyển trang (ví dụ lưu xong rồi về danh sách)
function flash(message, type = 'success') {
  sessionStorage.setItem('admin_flash', JSON.stringify({ message, type }));
}
function popFlash() {
  const raw = sessionStorage.getItem('admin_flash');
  if (!raw) return null;
  sessionStorage.removeItem('admin_flash');
  try { return JSON.parse(raw); } catch { return null; }
}

// Nhãn loại món ăn: "Món đặc trưng" màu đỏ nhạt, loại khác màu cam nhạt (như thiết kế)
function kindBadge(kind) {
  const special = kind === 'Món đặc trưng';
  const style = special ? 'background:#fdeaec;color:#e8505b' : 'background:#fff1e0;color:#e88a1e';
  return `<span class="kind-pill" style="${style}">${esc(kind)}</span>`;
}

// Tọa độ hiển thị gọn
function coordText(lat, lng) {
  return lat == null || lng == null ? '—' : `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
}

// Ngày giờ từ database (SQLite lưu 'YYYY-MM-DD HH:MM:SS' theo giờ UTC) -> giờ địa phương
function fmtDate(sqlDate, withTime = false) {
  const d = new Date(String(sqlDate).replace(' ', 'T') + 'Z');
  if (isNaN(d)) return '';
  return withTime ? d.toLocaleString('vi-VN') : d.toLocaleDateString('vi-VN');
}
