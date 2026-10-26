const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { JWT_SECRET } = require('../config');

function readToken(req) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Đọc token rồi đối chiếu database: tài khoản phải còn tồn tại và chưa bị khóa.
// Quyền (role) lấy từ database nên đổi quyền/khóa tài khoản có hiệu lực ngay.
function resolveUser(req) {
  const payload = readToken(req);
  if (!payload) return null;
  const row = db.prepare('SELECT id, role, is_active FROM users WHERE id = ?').get(payload.id);
  if (!row || !row.is_active) return null;
  return { id: row.id, role: row.role };
}

// Bắt buộc đăng nhập
function requireAuth(req, res, next) {
  const user = resolveUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Chưa đăng nhập, phiên đã hết hạn hoặc tài khoản đã bị khóa' });
  }
  req.user = user; // { id, role }
  next();
}

// Không bắt buộc, có token hợp lệ thì gắn req.user
function optionalAuth(req, res, next) {
  const user = resolveUser(req);
  if (user) req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ quản trị viên mới được thực hiện' });
  }
  next();
}

module.exports = { requireAuth, optionalAuth, requireAdmin };
