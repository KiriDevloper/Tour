requireAdmin();
mountShell('stats');

let donut = null;
let seriesChart = null;
let periodBuilt = false;

function monthLabel(ym) {
  return 'Tháng ' + ym.slice(5, 7) + '/' + ym.slice(0, 4);
}

function buildPeriod(months) {
  if (periodBuilt) return;
  periodBuilt = true;
  $('period').innerHTML = '<option value="">Tất cả thời gian</option>' +
    months.map((m) => `<option value="${m}">${monthLabel(m)}</option>`).join('');
}

function card(icon, color, value, label, sub) {
  return `
    <div class="col-xl-3 col-sm-6">
      <div class="card-box stat">
        <div class="stat-icon" style="background:${color}"><i class="bi ${icon}"></i></div>
        <div>
          <div class="stat-value">${esc(value)}</div>
          <div class="stat-label">${esc(label)}</div>
          <div class="stat-sub">${esc(sub)}</div>
        </div>
      </div>
    </div>`;
}

function renderCards(s) {
  const c = s.counts;
  const month = s.month;
  $('cards').innerHTML =
    card('bi-geo-alt-fill', '#1e6fe8', c.places, 'Địa điểm', `${c.placesVisible} đang hiển thị`) +
    card('bi-people-fill', '#2e9e5b', c.users, 'Người dùng',
         month ? `+${s.inPeriod.newUsers} đăng ký trong ${monthLabel(month).toLowerCase()}` : 'Tổng số tài khoản đăng ký') +
    card('bi-shop', '#e88a1e', c.spots, 'Quán ăn', `${c.foods} món ăn`) +
    card('bi-ticket-perforated-fill', '#7a4fd6', c.activities, 'Hoạt động', 'Hoạt động tại các địa điểm');
}

function renderTop(s) {
  const list = s.topPlaces;
  $('favTotal').textContent = s.month
    ? `${s.inPeriod.newFavorites} lượt yêu thích trong ${monthLabel(s.month).toLowerCase()}`
    : `${s.counts.favorites} lượt yêu thích`;

  if (!list.length) {
    $('top').innerHTML = '<div class="text-muted py-4 text-center"><i class="bi bi-heart fs-3 d-block mb-2"></i>Chưa có lượt yêu thích nào trong kỳ này.</div>';
    return;
  }

  const first = list[0];
  const cover = first.coverImage
    ? `<img src="${esc(first.coverImage)}" class="top-cover" alt="">`
    : '<div class="top-cover thumb-empty" style="display:flex;font-size:40px"><i class="bi bi-image"></i></div>';
  const max = first.favorites;

  const rest = list.slice(1).map((p, i) => `
    <div class="mb-2">
      <div class="d-flex justify-content-between small">
        <span class="text-truncate me-2">${i + 2}. ${esc(p.name)}</span>
        <span class="text-muted text-nowrap"><i class="bi bi-heart-fill text-danger"></i> ${p.favorites}</span>
      </div>
      <div class="rank-bar"><span style="width:${Math.round((p.favorites / max) * 100)}%"></span></div>
    </div>`).join('');

  $('top').innerHTML = `
    <div class="row g-3">
      <div class="col-md-5">
        ${cover}
        <div class="fw-bold mt-2">${esc(first.name)}</div>
        <div class="small text-muted">${esc(first.category)}</div>
        <div class="mt-1"><i class="bi bi-heart-fill text-danger"></i> <b>${first.favorites}</b> lượt yêu thích</div>
      </div>
      <div class="col-md-7">${rest || '<div class="text-muted small">Chưa có địa điểm nào khác được yêu thích.</div>'}</div>
    </div>`;
}

function renderDonut(s) {
  const cats = s.byCategory;
  const total = cats.reduce((a, c) => a + c.count, 0);

  $('legend').innerHTML = cats.map((c) => `
    <div class="d-flex align-items-center gap-2 small mb-2">
      <span class="legend-dot" style="background:${esc(c.color || '#999')}"></span>
      <span class="me-auto">${esc(c.name)}</span>
      <b>${c.count}</b>
    </div>`).join('');

  if (donut) { donut.destroy(); donut = null; }
  if (!total) {
    $('donutMsg').textContent = 'Chưa có địa điểm nào.';
    return;
  }
  $('donutMsg').textContent = '';
  if (typeof Chart === 'undefined') {
    $('donutMsg').textContent = 'Không tải được thư viện biểu đồ (cần kết nối mạng).';
    return;
  }
  donut = new Chart($('chartCategory'), {
    type: 'doughnut',
    data: {
      labels: cats.map((c) => c.name),
      datasets: [{ data: cats.map((c) => c.count), backgroundColor: cats.map((c) => c.color || '#999'), borderWidth: 2 }],
    },
    options: { cutout: '62%', plugins: { legend: { display: false } } },
  });
}

function seriesLabel(unit, key) {
  if (unit === 'day') return key.slice(8, 10) + '/' + key.slice(5, 7);
  return key.slice(5, 7) + '/' + key.slice(2, 4);
}

function renderSeries(s) {
  const se = s.series;
  $('seriesTitle').textContent = s.month
    ? `Hoạt động theo ngày – ${monthLabel(s.month)}`
    : 'Hoạt động theo tháng – 12 tháng gần nhất';

  const note = $('undatedNote');
  if (s.month && s.undatedFavorites > 0) {
    note.textContent = `Có ${s.undatedFavorites} lượt yêu thích được tạo trước khi hệ thống ghi nhận ngày, nên chỉ được tính ở chế độ "Tất cả thời gian".`;
    note.classList.remove('d-none');
  } else {
    note.classList.add('d-none');
  }

  if (seriesChart) { seriesChart.destroy(); seriesChart = null; }
  if (typeof Chart === 'undefined') {
    $('seriesMsg').textContent = 'Không tải được thư viện biểu đồ (cần kết nối mạng).';
    return;
  }
  $('seriesMsg').textContent = '';
  seriesChart = new Chart($('chartSeries'), {
    type: 'bar',
    data: {
      labels: se.labels.map((l) => seriesLabel(se.unit, l)),
      datasets: [
        { label: 'Người dùng mới', data: se.users, backgroundColor: '#1e6fe8', borderRadius: 4 },
        { label: 'Lượt yêu thích mới', data: se.favorites, backgroundColor: '#e8505b', borderRadius: 4 },
      ],
    },
    options: {
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
    },
  });
}

async function load() {
  try {
    const month = $('period').value;
    const s = await api('/admin/stats/overview' + (month ? '?month=' + month : ''));
    buildPeriod(s.months);
    $('period').value = s.month || '';
    renderCards(s);
    renderTop(s);
    renderDonut(s);
    renderSeries(s);
  } catch (e) {
    showAlert(e.message, 'danger');
  }
}

$('period').addEventListener('change', load);
load();
