requireAdmin();
mountShell('foods');

const foodId = Number(new URLSearchParams(location.search).get('id')) || null;
let food = null;

function infoHtml(f) {
  const img = f.image
    ? `<img src="${esc(f.image)}" class="w-100 rounded-3" style="max-height:260px;object-fit:cover" alt="">`
    : '<div class="thumb-empty rounded-3 w-100" style="height:180px;display:flex;font-size:40px"><i class="bi bi-image"></i></div>';
  const place = f.placeName
    ? `<div class="small text-muted mt-3"><i class="bi bi-geo-alt"></i> Địa điểm liên quan: <b>${esc(f.placeName)}</b></div>` : '';
  return `
    <div class="row g-4">
      <div class="col-md-4">${img}</div>
      <div class="col-md-8">
        <h3 class="fw-bold mb-2">${esc(f.name)}</h3>
        <div class="mb-3">${kindBadge(f.kind)}</div>
        <div class="fw-semibold small mb-1">Mô tả ngắn</div>
        <p>${esc(f.shortDesc)}</p>
        <div class="fw-semibold small mb-1">Mô tả chi tiết</div>
        <p style="white-space:pre-line">${esc(f.description)}</p>
        ${place}
      </div>
    </div>`;
}

function spotRow(s, i) {
  const img = s.image
    ? `<img src="${esc(s.image)}" class="thumb me-2" style="width:40px;height:40px" alt="">` : '';
  return `
    <tr>
      <td>${i + 1}</td>
      <td><div class="d-flex align-items-center">${img}<span class="fw-semibold">${esc(s.name)}</span></div></td>
      <td class="small">${esc(s.address)}</td>
      <td class="small text-muted">${esc(coordText(s.lat, s.lng))}</td>
      <td class="text-nowrap">
        <button class="icon-btn" data-edit-spot="${s.id}" title="Sửa"><i class="bi bi-pencil-square"></i></button>
        <button class="icon-btn danger" data-del-spot="${s.id}" title="Xóa"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;
}

function render() {
  $('foodInfo').innerHTML = infoHtml(food);
  $('editLink').href = 'food-form.html?id=' + food.id;
  $('spotBody').innerHTML = food.spots.length
    ? food.spots.map(spotRow).join('')
    : '<tr><td colspan="5" class="text-center text-muted py-4">Chưa có quán nào. Bấm "Thêm quán" để thêm nơi thưởng thức món này.</td></tr>';
}

async function load() {
  if (!foodId) {
    showAlert('Thiếu mã món ăn', 'danger');
    return;
  }
  try {
    food = await api('/foods/' + foodId);
    render();
  } catch (e) {
    $('foodInfo').innerHTML = '';
    showAlert(e.message, 'danger');
  }
}

$('addSpotBtn').addEventListener('click', () => {
  if (food) openSpotModal({ foodId: food.id, onSaved: load });
});

$('spotBody').addEventListener('click', async (e) => {
  const edit = e.target.closest('[data-edit-spot]');
  const del = e.target.closest('[data-del-spot]');
  if (edit) {
    const s = food.spots.find((x) => x.id === Number(edit.dataset.editSpot));
    openSpotModal({ foodId: food.id, spot: s, onSaved: load });
  } else if (del) {
    const s = food.spots.find((x) => x.id === Number(del.dataset.delSpot));
    if (!confirm(`Xóa quán "${s.name}"?`)) return;
    try {
      await api(`/foods/${food.id}/spots/${s.id}`, { method: 'DELETE' });
      await load();
      showAlert('Đã xóa quán');
    } catch (ex) {
      showAlert(ex.message, 'danger');
    }
  }
});

const flashMsg = popFlash();
load().then(() => { if (flashMsg) showAlert(flashMsg.message, flashMsg.type); });
