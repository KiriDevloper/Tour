requireAdmin();
mountShell('activities');

const editId = Number(new URLSearchParams(location.search).get('id')) || null;
let busy = 0;

const val = (id) => $(id).value.trim();

function showFormAlert(message, type = 'danger') {
  $('formAlert').innerHTML = message ? `<div class="alert alert-${type}">${esc(message)}</div>` : '';
}

function setBusy(on) {
  busy += on ? 1 : -1;
  $('saveBtn').disabled = busy > 0;
}

function setImage(url) {
  if (url) {
    $('imagePreview').src = url;
    $('imageWrap').classList.remove('d-none');
  } else {
    $('imagePreview').removeAttribute('src');
    $('imageWrap').classList.add('d-none');
  }
}

$('f-image-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setBusy(true);
  try {
    const fd = new FormData();
    fd.append('image', file);
    const r = await api('/uploads', { method: 'POST', form: fd });
    $('f-image').value = r.filename;
    setImage(r.url);
    showFormAlert('');
  } catch (ex) {
    showFormAlert(ex.message);
  } finally {
    setBusy(false);
    e.target.value = '';
  }
});

$('removeImage').addEventListener('click', () => {
  $('f-image').value = '';
  setImage(null);
});

// Công tắc "vị trí riêng": tắt thì xóa tọa độ riêng, hoạt động sẽ theo vị trí của địa điểm
function syncOwn() {
  const on = $('f-own').checked;
  $('ownBox').classList.toggle('d-none', !on);
  if (!on) {
    $('f-lat').value = '';
    $('f-lng').value = '';
    $('f-coords').value = '';
  }
}
$('f-own').addEventListener('change', syncOwn);

// Dán "12.667, 108.038" -> tự tách vào vĩ độ / kinh độ
$('f-coords').addEventListener('input', () => {
  const m = $('f-coords').value.match(/(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)/);
  if (m) {
    $('f-lat').value = m[1];
    $('f-lng').value = m[2];
  }
});

function fill(a) {
  $('f-place').value = a.placeId ?? '';
  $('f-name').value = a.name ?? '';
  $('f-desc').value = a.description ?? '';
  $('f-image').value = a.image ? a.image.split('/').pop() : '';
  setImage(a.image);
  const hasOwn = a.ownLat != null && a.ownLng != null;
  $('f-own').checked = hasOwn;
  $('f-lat').value = hasOwn ? a.ownLat : '';
  $('f-lng').value = hasOwn ? a.ownLng : '';
  $('ownBox').classList.toggle('d-none', !hasOwn);
}

async function init() {
  try {
    const places = await api('/places?all=1');
    $('f-place').innerHTML = '<option value="">-- Chọn địa điểm --</option>' +
      places.map((p) => `<option value="${p.id}">${esc(p.name)}${p.isVisible ? '' : ' (đang ẩn)'}</option>`).join('');

    // thêm hoạt động từ một địa điểm: activity-form.html?place=3
    const preset = new URLSearchParams(location.search).get('place');
    if (preset && !editId) $('f-place').value = preset;

    if (editId) {
      $('pageTitle').textContent = 'Sửa hoạt động';
      fill(await api('/activities/' + editId));
    }
  } catch (ex) {
    showFormAlert(ex.message);
  }
}

$('activityForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (busy > 0) return;

  const own = $('f-own').checked;
  const body = {
    placeId: val('f-place'),
    name: val('f-name'),
    description: val('f-desc'),
    image: val('f-image'),
    lat: own ? val('f-lat') : '',
    lng: own ? val('f-lng') : '',
  };

  setBusy(true);
  try {
    if (editId) {
      await api('/activities/' + editId, { method: 'PUT', body });
      flash('Đã cập nhật hoạt động');
    } else {
      await api('/activities', { method: 'POST', body });
      flash('Đã thêm hoạt động mới');
    }
    location.href = 'activities.html';
  } catch (ex) {
    showFormAlert(ex.message);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } finally {
    setBusy(false);
  }
});

init();
