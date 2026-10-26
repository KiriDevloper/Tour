requireAdmin();
mountShell('foods');

let foods = [];

async function load() {
  try {
    foods = await api('/foods');
    const kinds = [...new Set(foods.map((f) => f.kind).filter(Boolean))];
    const keep = $('filterKind').value;
    $('filterKind').innerHTML = '<option value="">Tất cả loại</option>' +
      kinds.map((k) => `<option value="${esc(k)}">${esc(k)}</option>`).join('');
    $('filterKind').value = keep;
    render();
  } catch (e) {
    $('tbody').innerHTML = '';
    showAlert(e.message, 'danger');
  }
}

function filtered() {
  const q = norm($('search').value).trim();
  const kind = $('filterKind').value;
  return foods.filter((f) =>
    (!kind || f.kind === kind) && (!q || norm(f.name + ' ' + f.shortDesc).includes(q)));
}

function rowHtml(f, index) {
  const img = f.image
    ? `<img src="${esc(f.image)}" class="thumb" alt="">`
    : '<div class="thumb thumb-empty"><i class="bi bi-image"></i></div>';
  return `
    <tr>
      <td>${index}</td>
      <td>${img}</td>
      <td><a class="fw-semibold text-decoration-none text-reset" href="food-detail.html?id=${f.id}">${esc(f.name)}</a></td>
      <td>${kindBadge(f.kind)}</td>
      <td class="small text-muted" style="max-width:320px"><div class="clamp-2">${esc(f.shortDesc)}</div></td>
      <td>${f.spots.length}</td>
      <td class="text-nowrap">
        <a class="icon-btn" href="food-detail.html?id=${f.id}" title="Xem chi tiết và các quán"><i class="bi bi-eye"></i></a>
        <a class="icon-btn" href="food-form.html?id=${f.id}" title="Sửa"><i class="bi bi-pencil-square"></i></a>
        <button class="icon-btn danger" data-del="${f.id}" title="Xóa"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;
}

function render() {
  const rows = filtered();
  $('tbody').innerHTML = rows.length
    ? rows.map((f, i) => rowHtml(f, i + 1)).join('')
    : '<tr><td colspan="7" class="text-center text-muted py-4">Không có món ăn nào</td></tr>';
  $('info').textContent = `${rows.length}/${foods.length} món ăn`;
}

$('search').addEventListener('input', render);
$('filterKind').addEventListener('change', render);

$('tbody').addEventListener('click', async (e) => {
  const del = e.target.closest('[data-del]');
  if (!del) return;
  const f = foods.find((x) => x.id === Number(del.dataset.del));
  const ok = confirm(`Xóa món "${f.name}"?\n\n${f.spots.length} quán của món này cũng sẽ bị xóa.`);
  if (!ok) return;
  try {
    await api('/foods/' + f.id, { method: 'DELETE' });
    foods = foods.filter((x) => x.id !== f.id);
    render();
    showAlert('Đã xóa món ăn');
  } catch (ex) {
    showAlert(ex.message, 'danger');
  }
});

const flashMsg = popFlash();
if (flashMsg) showAlert(flashMsg.message, flashMsg.type);
load();
