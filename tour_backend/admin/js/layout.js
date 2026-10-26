// Khung chung: thanh bên + thanh trên. Gọi mountShell('places') ở đầu mỗi trang.
const BRAND = 'Đắk Lắk Travel';

const MENU = [
  // [khóa, trang, nhãn, biểu tượng, đã có trang chưa]
  ['dashboard', 'dashboard.html', 'Tổng quan', 'bi-grid-1x2', true],
  ['places', 'places.html', 'Địa điểm', 'bi-geo-alt', true],
  ['foods', 'foods.html', 'Món ăn', 'bi-cup-hot', true],
  ['spots', 'spots.html', 'Quán ăn', 'bi-shop', true],
  ['activities', 'activities.html', 'Hoạt động', 'bi-ticket-perforated', true],
  ['categories', '#', 'Loại địa điểm', 'bi-tags', false],
  ['users', 'users.html', 'Người dùng', 'bi-people', true],
  ['stats', 'stats.html', 'Thống kê', 'bi-bar-chart-line', true],
];

function mountShell(active) {
  const user = Auth.user() || {};

  const nav = MENU.map(([key, href, label, icon, ready]) => {
    if (!ready) {
      return `<span class="soon" title="Sắp có"><i class="bi ${icon}"></i><span>${label}</span></span>`;
    }
    return `<a href="${href}" class="${key === active ? 'active' : ''}"><i class="bi ${icon}"></i><span>${label}</span></a>`;
  }).join('');

  $('sidebar').innerHTML = `
    <div class="brand">
      <div class="brand-logo"><i class="bi bi-compass"></i></div>
      <div>
        <div class="fw-bold text-white">${esc(BRAND)}</div>
        <div class="small" style="opacity:.7">Admin</div>
      </div>
    </div>
    <nav class="side-nav">${nav}</nav>
    <div class="side-foot">
      <a href="#" id="logoutBtn"><i class="bi bi-box-arrow-left"></i><span>Đăng xuất</span></a>
    </div>`;

  let today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });
  today = today.charAt(0).toUpperCase() + today.slice(1);

  const name = user.name || 'Admin';
  $('topbar').innerHTML = `
    <button id="menuBtn" class="btn btn-light d-lg-none" type="button"><i class="bi bi-list"></i></button>
    <div class="ms-auto d-flex align-items-center gap-3">
      <span class="text-muted small d-none d-sm-inline">${esc(today)}</span>
      <div class="d-flex align-items-center gap-2">
        <span class="avatar">${esc(name.charAt(0).toUpperCase())}</span>
        <span class="fw-semibold small">${esc(name)}</span>
      </div>
    </div>`;

  $('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    Auth.clear();
    location.href = 'login.html';
  });
  $('menuBtn').addEventListener('click', () => $('sidebar').classList.toggle('open'));
  document.querySelector('.main').addEventListener('click', () => $('sidebar').classList.remove('open'));
}
