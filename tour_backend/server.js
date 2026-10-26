const path = require('path');
const express = require('express');
const cors = require('cors');
const { PORT } = require('./config');

const app = express();
app.use(cors());
app.use(express.json());

// Ảnh được phục vụ tại http://<host>:3000/images/<tên file>
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Trang quản trị: http://localhost:3000/admin
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.get('/', (req, res) => res.redirect('/admin/'));

app.use('/api', require('./routes'));

app.use((req, res) => res.status(404).json({ message: 'Không tìm thấy đường dẫn' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Lỗi máy chủ' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend chạy tại http://localhost:${PORT}`);
});
