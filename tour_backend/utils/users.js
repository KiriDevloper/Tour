const db = require('../db/database');

const SELECT = `
  SELECT u.*, (SELECT COUNT(*) FROM favorites f WHERE f.user_id = u.id) AS favorites
  FROM users u
`;

function userDto(r) {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    role: r.role,
    isActive: !!r.is_active,
    createdAt: r.created_at,
    favorites: r.favorites ?? 0,
  };
}

const listUsers = () => db.prepare(`${SELECT} ORDER BY u.id`).all().map(userDto);

function getUser(id) {
  const r = db.prepare(`${SELECT} WHERE u.id = ?`).get(id);
  return r ? userDto(r) : null;
}

module.exports = { listUsers, getUser };
