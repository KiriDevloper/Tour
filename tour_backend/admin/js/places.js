requireAdmin();
mountShell('places');

const PAGE_SIZE = 10;
let places = [];
let page = 1;

async function load() {
  try {
    const [categories, list] = await Promise.all([api('/categories'), api('/places?all=1')]);
    places = list;
    const keep = $('filterCategory').value;
    $('filterCategory').innerHTML = '<option value="">Tất cả loại</option>' +
      categories.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
    $('filterCategory').value = keep;
    render();
  } catch (e) {
    $('tbody').innerHTML = '';
    showAlert(e.message, 'danger');
  }
}

function filtered() {
  const q = norm($('search').value).trim();
  const cat = $('filterCategory').value;
  const status = $('filterStatus').value;
  return places.filter((p) =>
    (!cat || String(p.categoryId) === cat) &&
    (!status || (status === 'visible') === p.isVisible) &&
    (!q || norm(p.name + ' ' + p.address).includes(q)));
}

function rowHtml(p, index) {
  const img = p.coverImage
    ? `<img src="${esc(p.coverImage)}" class="thumb" alt="">`
    : '<div class="thumb thumb-empty"><i class="bi bi-image"></i></div>';
  const noCoords = (p.lat == null || p.lng == null)
    ? ' <span class="badge text-bg-warning" title="Cần có tọa độ để hiện trên bản đồ">Chưa có tọa độ</span>' : '';
  return `
    <tr>
      <td>${index}</td>
      <td>${img}</td>
      <td><div class="fw-semibold">${esc(p.name)}${noCoords}</div></td>
      <td><span class="badge text-bg-primary">${esc(p.categoryName)}</span></td>
      <td class="small">${esc(p.address)}</td>
      <td>
        <button class="status-pill ${p.isVisible ? 'ok' : 'off'}" data-toggle="${p.id}"
                title="Bấm để ${p.isVisible ? 'ẩn' : 'hiện'}">${p.isVisible ? 'Hiển thị' : 'Đã ẩn'}</button>
      </td>
      <td class="text-nowrap">
        <a class="icon-btn" href="place-form.html?id=${p.id}" title="Sửa"><i class="bi bi-pencil-square"></i></a>
        <button class="icon-btn danger" data-del="${p.id}" title="Xóa"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;
}

function render() {
  const rows = filtered();
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  if (page > pages) page = pages;
  const start = (page - 1) * PAGE_SIZE;
  const slice = rows.slice(start, start + PAGE_SIZE);

  $('tbody').innerHTML = slice.length
    ? slice.map((p, i) => rowHtml(p, start + i + 1)).join('')
    : '<tr><td colspan="7" class="text-center text-muted py-4">Không có địa điểm nào</td></tr>';

  $('info').textContent = rows.length
    ? `Hiển thị ${start + 1}–${start + slice.length} / ${rows.length}`
    : '';

  let html = `<li class="page-item ${page === 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${page - 1}">‹</a></li>`;
  for (let i = 1; i <= pages; i++) {
    html += `<li class="page-item ${i === page ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }
  html += `<li class="page-item ${page === pages ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${page + 1}">›</a></li>`;
  $('pager').innerHTML = pages > 1 ? html : '';
}

$('search').addEventListener('input', () => { page = 1; render(); });
$('filterCategory').addEventListener('change', () => { page = 1; render(); });
$('filterStatus').addEventListener('change', () => { page = 1; render(); });

$('pager').addEventListener('click', (e) => {
  const a = e.target.closest('[data-page]');
  if (!a) return;
  e.preventDefault();
  if (a.closest('.disabled')) return;
  page = Number(a.dataset.page);
  render();
});

$('tbody').addEventListener('click', async (e) => {
  const toggle = e.target.closest('[data-toggle]');
  const del = e.target.closest('[data-del]');
  try {
    if (toggle) {
      const p = places.find((x) => x.id === Number(toggle.dataset.toggle));
      const res = await api(`/places/${p.id}/visibility`, { method: 'PATCH', body: { isVisible: !p.isVisible } });
      p.isVisible = res.isVisible;
      render();
      showAlert(res.isVisible ? `Đã hiển thị "${p.name}" trên ứng dụng` : `Đã ẩn "${p.name}" khỏi ứng dụng`);
    } else if (del) {
      const p = places.find((x) => x.id === Number(del.dataset.del));
      const ok = confirm(`Xóa "${p.name}"?\n\nCác hoạt động, ảnh phụ và lượt yêu thích của địa điểm này cũng sẽ bị xóa.\nNếu chỉ muốn tạm dừng hiển thị, hãy bấm vào trạng thái để ẩn.`);
      if (!ok) return;
      await api('/places/' + p.id, { method: 'DELETE' });
      places = places.filter((x) => x.id !== p.id);
      render();
      showAlert('Đã xóa địa điểm');
    }
  } catch (ex) {
    showAlert(ex.message, 'danger');
  }
});

const f = popFlash();
if (f) showAlert(f.message, f.type);
load();
