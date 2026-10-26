// Hộp thoại thêm / sửa quán, dùng chung cho trang Chi tiết món ăn và trang Quán ăn.
// Gọi: openSpotModal({ foodId, spot, foods, onSaved })
//  - foodId: thêm/sửa quán của món này (trang chi tiết món)
//  - foods : danh sách món để chọn (trang Quán ăn, khi thêm quán mới và chưa biết món)
//  - spot  : quán đang sửa (không truyền = thêm mới)
const SPOT_MODAL_HTML = `
<div class="modal fade" id="spotModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-scrollable">
    <form class="modal-content" id="spotForm" novalidate>
      <div class="modal-header">
        <h5 class="modal-title" id="spotTitle">Thêm quán</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div id="spotAlert"></div>
        <div class="mb-3 d-none" id="spotFoodRow">
          <label class="form-label" for="s-food">Món ăn <span class="text-danger">*</span></label>
          <select id="s-food" class="form-select"></select>
        </div>
        <div class="mb-3">
          <label class="form-label" for="s-name">Tên quán <span class="text-danger">*</span></label>
          <input id="s-name" class="form-control" placeholder="Ví dụ: Bún đỏ Cô Ba">
        </div>
        <div class="mb-3">
          <label class="form-label" for="s-address">Địa chỉ <span class="text-danger">*</span></label>
          <input id="s-address" class="form-control" placeholder="Số nhà, đường, phường">
        </div>
        <div class="mb-3">
          <label class="form-label" for="s-coords">Dán tọa độ từ Google Maps</label>
          <input id="s-coords" class="form-control" placeholder="Ví dụ: 12.6761, 108.0456">
        </div>
        <div class="row g-3 mb-3">
          <div class="col-6">
            <label class="form-label" for="s-lat">Vĩ độ <span class="text-danger">*</span></label>
            <input id="s-lat" class="form-control" inputmode="decimal">
          </div>
          <div class="col-6">
            <label class="form-label" for="s-lng">Kinh độ <span class="text-danger">*</span></label>
            <input id="s-lng" class="form-control" inputmode="decimal">
          </div>
        </div>
        <div>
          <label class="form-label" for="s-image-file">Ảnh quán (không bắt buộc)</label>
          <input id="s-image-file" type="file" accept="image/jpeg,image/png,image/webp" class="form-control">
          <input id="s-image" type="hidden">
          <div id="s-imageWrap" class="mt-2 d-none">
            <img id="s-imagePreview" alt="" style="max-height:110px;border-radius:10px">
            <div><button type="button" id="s-removeImage" class="btn btn-link btn-sm text-danger px-0">Xóa ảnh</button></div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Đóng</button>
        <button id="spotSaveBtn" type="submit" class="btn btn-primary">Lưu</button>
      </div>
    </form>
  </div>
</div>`;

let spotModal = null;
const spotState = { foodId: null, spotId: null, onSaved: null, busy: 0 };

function spotAlert(message, type = 'danger') {
  $('spotAlert').innerHTML = message ? `<div class="alert alert-${type} py-2">${esc(message)}</div>` : '';
}

function setSpotImage(url) {
  if (url) {
    $('s-imagePreview').src = url;
    $('s-imageWrap').classList.remove('d-none');
  } else {
    $('s-imagePreview').removeAttribute('src');
    $('s-imageWrap').classList.add('d-none');
  }
}

function setSpotBusy(on) {
  spotState.busy += on ? 1 : -1;
  $('spotSaveBtn').disabled = spotState.busy > 0;
}

async function saveSpot(e) {
  e.preventDefault();
  if (spotState.busy > 0) return;

  const foodId = spotState.foodId || Number($('s-food').value);
  if (!foodId) return spotAlert('Vui lòng chọn món ăn');

  const body = {
    name: $('s-name').value.trim(),
    address: $('s-address').value.trim(),
    lat: $('s-lat').value.trim(),
    lng: $('s-lng').value.trim(),
    image: $('s-image').value.trim(),
  };

  setSpotBusy(true);
  try {
    if (spotState.spotId) {
      await api(`/foods/${foodId}/spots/${spotState.spotId}`, { method: 'PUT', body });
    } else {
      await api(`/foods/${foodId}/spots`, { method: 'POST', body });
    }
    spotModal.hide();
    if (spotState.onSaved) await spotState.onSaved();
    showAlert('Đã lưu quán');
  } catch (ex) {
    spotAlert(ex.message);
  } finally {
    setSpotBusy(false);
  }
}

function ensureSpotModal() {
  if (spotModal) return;
  document.body.insertAdjacentHTML('beforeend', SPOT_MODAL_HTML);
  spotModal = new bootstrap.Modal($('spotModal'));

  // Dán "12.6761, 108.0456" -> tự tách vào vĩ độ / kinh độ
  $('s-coords').addEventListener('input', () => {
    const m = $('s-coords').value.match(/(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)/);
    if (m) {
      $('s-lat').value = m[1];
      $('s-lng').value = m[2];
    }
  });

  $('s-image-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSpotBusy(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const r = await api('/uploads', { method: 'POST', form: fd });
      $('s-image').value = r.filename;
      setSpotImage(r.url);
      spotAlert('');
    } catch (ex) {
      spotAlert(ex.message);
    } finally {
      setSpotBusy(false);
      e.target.value = '';
    }
  });

  $('s-removeImage').addEventListener('click', () => {
    $('s-image').value = '';
    setSpotImage(null);
  });

  $('spotForm').addEventListener('submit', saveSpot);
}

function openSpotModal({ foodId = null, spot = null, foods = null, onSaved = null } = {}) {
  ensureSpotModal();
  spotState.foodId = foodId;
  spotState.spotId = spot ? spot.id : null;
  spotState.onSaved = onSaved;

  ['s-name', 's-address', 's-coords', 's-lat', 's-lng', 's-image'].forEach((id) => { $(id).value = ''; });
  setSpotImage(null);
  spotAlert('');
  $('spotTitle').textContent = spot ? 'Sửa quán' : 'Thêm quán';

  const needFood = !foodId && !!foods;
  $('spotFoodRow').classList.toggle('d-none', !needFood);
  if (needFood) {
    $('s-food').innerHTML = '<option value="">-- Chọn món ăn --</option>' +
      foods.map((f) => `<option value="${f.id}">${esc(f.name)}</option>`).join('');
    $('s-food').value = '';
  }

  if (spot) {
    $('s-name').value = spot.name ?? '';
    $('s-address').value = spot.address ?? '';
    $('s-lat').value = spot.lat ?? '';
    $('s-lng').value = spot.lng ?? '';
    $('s-image').value = spot.image ? spot.image.split('/').pop() : '';
    setSpotImage(spot.image);
  }
  spotModal.show();
}
