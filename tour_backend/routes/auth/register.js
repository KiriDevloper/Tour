const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../db/database');
const { JWT_SECRET, JWT_EXPIRES } = require('../../config');

// POST /api/auth/register   body: { name, email, phone?, password }
router.post('/auth/register', (req, res) => {
  const { name, email, phone, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập họ tên, email và mật khẩu' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'Email không hợp lệ' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }

  const mail = email.trim().toLowerCase();
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(mail)) {
    return res.status(409).json({ message: 'Email đã được đăng ký' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare(
    'INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)'
  ).run(name.trim(), mail, phone || null, hash);

  const token = jwt.sign({ id: info.lastInsertRowid, role: 'user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.status(201).json({
    token,
    user: { id: info.lastInsertRowid, name: name.trim(), email: mail, phone: phone || null, role: 'user' },
  });
});

module.exports = router;
