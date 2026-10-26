requireAdmin();
mountShell('spots');

let spots = [];
let foods = [];

async function load() {
  try {
    [spots, foods] = await Promise.all([api('/admin/spots'), api('/foods')]);
    const keep = $('filterFood').value;
    $('filterFood').innerHTML = '<option value="">Tất cả món ăn</option>' +
      foods.map((f) => `<option value="${f.id}">${esc(f.name)}</option>`).join('');
    $('filterFood').value = keep;
    render();
  } catch (e) {
    $('tbody').innerHTML = '';
    showAlert(e.message, 'danger');
  }
}

function filtered() {
  const q = norm($('search').value).trim();
  const food = $('filterFood').value;
  return spots.filter((s) =>
    (!food || String(s.foodId) === food) && (!q || norm(s.name + ' ' + s.address).includes(q)));
}

function rowHtml(s, index) {
  const img = s.image
    ? `<img src="${esc(s.image)}" class="thumb" alt="">`
    : '<div class="thumb thumb-empty"><i class="bi bi-shop"></i></div>';
  return `
    <tr>
      <td>${index}</td>
      <td>${img}</td>
      <td class="fw-semibold">${esc(s.name)}</td>
      <td><a class="text-decoration-none" href="food-detail.html?id=${s.foodId}">${esc(s.foodName)}</a></td>
      <td class="small">${esc(s.address)}</td>
      <td class="small text-muted">${esc(coordText(s.lat, s.lng))}</td>
      <td class="text-nowrap">
        <button class="icon-btn" data-edit="${s.id}" title="Sửa"><i class="bi bi-pencil-square"></i></button>
        <button class="icon-btn danger" data-del="${s.id}" title="Xóa"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;
}

function render() {
  const rows = filtered();
  $('tbody').innerHTML = rows.length
    ? rows.map((s, i) => rowHtml(s, i + 1)).join('')
    : '<tr><td colspan="7" class="text-center text-muted py-4">Không có quán nào</td></tr>';
  $('info').textContent = `${rows.length}/${spots.length} quán`;
}

$('search').addEventListener('input', render);
$('filterFood').addEventListener('change', render);

$('addSpotBtn').addEventListener('click', () => {
  if (!foods.length) {
    showAlert('Hãy thêm món ăn trước, rồi mới thêm quán cho món đó.', 'warning');
    return;
  }
  openSpotModal({ foods, onSaved: load });
});

$('tbody').addEventListener('click', async (e) => {
  const edit = e.target.closest('[data-edit]');
  const del = e.target.closest('[data-del]');
  if (edit) {
    const s = spots.find((x) => x.id === Number(edit.dataset.edit));
    openSpotModal({ foodId: s.foodId, spot: s, onSaved: load });
  } else if (del) {
    const s = spots.find((x) => x.id === Number(del.dataset.del));
    if (!confirm(`Xóa quán "${s.name}" (món ${s.foodName})?`)) return;
    try {
      await api(`/foods/${s.foodId}/spots/${s.id}`, { method: 'DELETE' });
      await load();
      showAlert('Đã xóa quán');
    } catch (ex) {
      showAlert(ex.message, 'danger');
    }
  }
});

load();
