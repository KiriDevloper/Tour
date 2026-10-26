// Đã đăng nhập sẵn bằng tài khoản admin thì vào thẳng
(function () {
  const u = Auth.user();
  if (Auth.token && u && u.role === 'admin') location.replace('dashboard.html');
})();

$('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = $('error');
  err.classList.add('d-none');
  $('submitBtn').disabled = true;

  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: { email: $('email').value.trim(), password: $('password').value },
    });
    if (data.user.role !== 'admin') {
      throw new Error('Tài khoản này không có quyền quản trị');
    }
    Auth.save(data.token, data.user);
    location.href = 'dashboard.html';
  } catch (ex) {
    err.textContent = ex.message;
    err.classList.remove('d-none');
  } finally {
    $('submitBtn').disabled = false;
  }
});
