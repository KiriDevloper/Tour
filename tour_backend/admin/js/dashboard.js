requireAdmin();
mountShell('dashboard');

const me = Auth.user() || {};
$('hello').textContent = `Xin chào, ${me.name || 'Admin'}!`;
$('welcome').textContent = `Chào mừng bạn đến với trang quản trị ${BRAND}.`;

function statCard({ icon, color, value, label, sub, href }) {
  const inner = `
    <div class="card-box stat">
      <div class="stat-icon" style="background:${color}"><i class="bi ${icon}"></i></div>
      <div class="min-w-0">
        <div class="stat-value">${esc(value)}</div>
        <div class="stat-label">${esc(label)}</div>
        <div class="stat-sub">${esc(sub)}</div>
      </div>
    </div>`;
  return `<div class="col-xl-4 col-sm-6">${href ? `<a href="${href}" class="text-decoration-none text-reset">${inner}</a>` : inner}</div>`;
}

function renderStats(s) {
  const c = s.counts;
  const top = s.topFavorite;
  $('stats').innerHTML = [
    { icon: 'bi-geo-alt-fill', color: '#1e6fe8', value: c.places, label: 'Địa điểm', sub: `${c.placesVisible} đang hiển thị trên ứng dụng`, href: 'places.html' },
    { icon: 'bi-cup-hot-fill', color: '#2e9e5b', value: c.foods, label: 'Món ăn', sub: 'Món đặc trưng và đặc sản', href: 'foods.html' },
    { icon: 'bi-shop', color: '#e88a1e', value: c.spots, label: 'Quán ăn', sub: 'Nơi thưởng thức các món', href: 'spots.html' },
    { icon: 'bi-ticket-perforated-fill', color: '#7a4fd6', value: c.activities, label: 'Hoạt động', sub: 'Hoạt động tại các địa điểm', href: 'activities.html' },
    { icon: 'bi-people-fill', color: '#19a7b8', value: c.users, label: 'Người dùng', sub: 'Tài khoản đã đăng ký', href: 'users.html' },
    {
      icon: 'bi-heart-fill', color: '#e8505b',
      value: top ? top.name : 'Chưa có',
      label: 'Địa điểm được yêu thích nhất',
      sub: top ? `${top.favorites} lượt yêu thích` : 'Chưa có lượt yêu thích nào',
    },
  ].map(statCard).join('');
}

function renderChart(s) {
  if (typeof Chart === 'undefined') {
    $('chartMsg').textContent = 'Không tải được thư viện biểu đồ (cần kết nối mạng).';
    return;
  }
  new Chart($('chartUsers'), {
    type: 'bar',
    data: {
      labels: s.usersByDay.map((d) => d.date.slice(8, 10) + '/' + d.date.slice(5, 7)),
      datasets: [{
        label: 'Người dùng mới',
        data: s.usersByDay.map((d) => d.count),
        backgroundColor: '#1e6fe8',
        borderRadius: 6,
      }],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
    },
  });
}

function formatTime(sqlDate) {
  // SQLite lưu 'YYYY-MM-DD HH:MM:SS' theo giờ UTC
  const d = new Date(String(sqlDate).replace(' ', 'T') + 'Z');
  return isNaN(d) ? '' : d.toLocaleString('vi-VN');
}

function renderRecent(s) {
  $('recent').innerHTML = s.recentUsers.length
    ? s.recentUsers.map((u) => `
        <div class="d-flex align-items-center gap-3 py-2 border-bottom">
          <span class="avatar">${esc((u.name || '?').charAt(0).toUpperCase())}</span>
          <div class="flex-grow-1" style="min-width:0">
            <div class="fw-semibold small text-truncate">${esc(u.name)}</div>
            <div class="text-muted small text-truncate">${esc(u.email)}</div>
          </div>
          <div class="text-muted small text-end">${esc(formatTime(u.createdAt))}</div>
        </div>`).join('')
    : '<div class="text-muted small">Chưa có người dùng nào đăng ký.</div>';
}

(async () => {
  try {
    const s = await api('/admin/stats');
    renderStats(s);
    renderChart(s);
    renderRecent(s);
  } catch (e) {
    showAlert(e.message, 'danger');
  }
})();
