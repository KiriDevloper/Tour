requireAdmin();
mountShell('activities');

let activities = [];

async function load() {
  try {
    activities = await api('/activities?all=1');
    // ô lọc địa điểm: chỉ liệt kê địa điểm đang có hoạt động
    const seen = new Map();
    activities.forEach((a) => seen.set(a.placeId, a.placeName));
    const keep = $('filterPlace').value;
    $('filterPlace').innerHTML = '<option value="">Tất cả địa điểm</option>' +
      [...seen].map(([id, name]) => `<option value="${id}">${esc(name)}</option>`).join('');
    $('filterPlace').value = keep;
    render();
  } catch (e) {
    $('tbody').innerHTML = '';
    showAlert(e.message, 'danger');
  }
}

function filtered() {
  const q = norm($('search').value).trim();
  const place = $('filterPlace').value;
  return activities.filter((a) =>
    (!place || String(a.placeId) === place) &&
    (!q || norm(a.name + ' ' + a.placeName + ' ' + a.description).includes(q)));
}

function locationText(a) {
  if (a.ownLat != null && a.ownLng != null) {
    return `<span class="badge text-bg-info">Riêng</span> <small class="text-muted">${esc(coordText(a.ownLat, a.ownLng))}</small>`;
  }
  if (a.lat != null && a.lng != null) {
    return '<span class="badge text-bg-secondary">Theo địa điểm</span>';
  }
  return '<span class="badge text-bg-warning" title="Địa điểm chưa có tọa độ nên hoạt động chưa hiện trên bản đồ">Chưa có tọa độ</span>';
}

function rowHtml(a, index) {
  const img = a.image
    ? `<img src="${esc(a.image)}" class="thumb" alt="">`
    : '<div class="thumb thumb-empty"><i class="bi bi-image"></i></div>';
  const hidden = a.placeVisible ? '' : ' <span class="badge text-bg-secondary" title="Địa điểm đang bị ẩn nên khách chưa thấy hoạt động này">Địa điểm đang ẩn</span>';
  return `
    <tr>
      <td>${index}</td>
      <td>${img}</td>
      <td><div class="fw-semibold">${esc(a.name)}</div><div class="small text-muted clamp-2" style="max-width:340px">${esc(a.description)}</div></td>
      <td class="small">${esc(a.placeName)}${hidden}</td>
      <td>${locationText(a)}</td>
      <td class="text-nowrap">
        <a class="icon-btn" href="activity-form.html?id=${a.id}" title="Sửa"><i class="bi bi-pencil-square"></i></a>
        <button class="icon-btn danger" data-del="${a.id}" title="Xóa"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;
}

function render() {
  const rows = filtered();
  $('tbody').innerHTML = rows.length
    ? rows.map((a, i) => rowHtml(a, i + 1)).join('')
    : '<tr><td colspan="6" class="text-center text-muted py-4">Không có hoạt động nào</td></tr>';
  $('info').textContent = `${rows.length}/${activities.length} hoạt động`;
}

$('search').addEventListener('input', render);
$('filterPlace').addEventListener('change', render);

$('tbody').addEventListener('click', async (e) => {
  const del = e.target.closest('[data-del]');
  if (!del) return;
  const a = activities.find((x) => x.id === Number(del.dataset.del));
  if (!confirm(`Xóa hoạt động "${a.name}" (${a.placeName})?`)) return;
  try {
    await api('/activities/' + a.id, { method: 'DELETE' });
    activities = activities.filter((x) => x.id !== a.id);
    render();
    showAlert('Đã xóa hoạt động');
  } catch (ex) {
    showAlert(ex.message, 'danger');
  }
});

const flashMsg = popFlash();
if (flashMsg) showAlert(flashMsg.message, flashMsg.type);
load();
