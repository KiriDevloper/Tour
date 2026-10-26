module.exports = {
  PORT: process.env.PORT || 3000,
  // Đổi chuỗi này khi nộp/triển khai thật
  JWT_SECRET: process.env.JWT_SECRET || 'doi-chuoi-bi-mat-nay',
  JWT_EXPIRES: '7d',
};
