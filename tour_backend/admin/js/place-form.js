requireAdmin();
mountShell('places');

const MAX_GALLERY = 5;
const editId = Number(new URLSearchParams(location.search).get('id')) || null;

let gallery = []; // { id (null nếu chưa lưu), filename, url }
let busy = 0;

const val = (id) => $(id).value.trim();

function showFormAlert(message, type = 'danger') {
  $('formAlert').innerHTML = message ? `<div class="alert alert-${type}">${esc(message)}</div>` : '';
}

function setBusy(on) {
  busy += on ? 1 : -1;
  $('saveBtn').disabled = busy > 0;
}

// ---------- ảnh bìa ----------
function setCover(url) {
  const wrap = $('coverWrap');
  if (url) {
    $('coverPreview').src = url;
    wrap.classList.remove('d-none');
  } else {
    $('coverPreview').removeAttribute('src');
    wrap.classList.add('d-none');
  }
}

async function uploadFile(file) {
  const fd = new FormData();
  fd.append('image', file);
  return api('/uploads', { method: 'POST', form: fd });
}

$('f-cover').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setBusy(true);
  try {
    const r = await uploadFile(file);
    $('f-coverImage').value = r.filename;
    setCover(r.url);
    showFormAlert('');
  } catch (ex) {
    showFormAlert(ex.message);
  } finally {
    setBusy(false);
    e.target.value = '';
  }
});

$('removeCover').addEventListener('click', () => {
  $('f-coverImage').value = '';
  setCover(null);
});

// ---------- ảnh phụ ----------
function renderGallery() {
  const tiles = gallery.map((g, i) =>
    `<div class="gtile"><img src="${esc(g.url)}" alt="">` +
    `<button type="button" class="btn btn-danger rm" data-rm="${i}" title="Xóa ảnh">×</button></div>`).join('');
  const add = gallery.length < MAX_GALLERY
    ? `<label class="gtile"><i class="bi bi-plus-lg fs-4"></i><span>Thêm ảnh</span>` +
      `<input type="file" multiple hidden accept="image/jpeg,image/png,image/webp"></label>`
    : '';
  $('gallery').innerHTML = tiles + add;
}

$('gallery').addEventListener('change', async (e) => {
  if (!e.target.matches('input[type=file]')) return;
  const files = [...e.target.files].slice(0, MAX_GALLERY - gallery.length);
  if (!files.length) return;
  setBusy(true);
  try {
    for (const f of files) {
      const r = await uploadFile(f);
      if (editId) {
        // địa điểm đã có: lưu ngay vào database
        const saved = await api(`/places/${editId}/images`, { method: 'POST', body: { filename: r.filename } });
        gallery.push({ id: saved.id, filename: r.filename, url: r.url });
      } else {
        // địa điểm mới: giữ tạm, lưu cùng lúc khi bấm Lưu
        gallery.push({ id: null, filename: r.filename, url: r.url });
      }
    }
    showFormAlert('');
  } catch (ex) {
    showFormAlert(ex.message);
  } finally {
    setBusy(false);
    renderGallery();
  }
});

$('gallery').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-rm]');
  if (!btn) return;
  const i = Number(btn.dataset.rm);
  const g = gallery[i];
  try {
    if (g.id) await api(`/places/${editId}/images/${g.id}`, { method: 'DELETE' });
    gallery.splice(i, 1);
    renderGallery();
  } catch (ex) {
    showFormAlert(ex.message);
  }
});

// ---------- tọa độ ----------
// Dán "12.667, 108.038" -> tự tách vào vĩ độ / kinh độ
$('f-coords').addEventListener('input', () => {
  const m = $('f-coords').value.match(/(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)/);
  if (m) {
    $('f-lat').value = m[1];
    $('f-lng').value = m[2];
  }
});

// ---------- nạp dữ liệu ----------
function fill(p) {
  $('f-name').value = p.name ?? '';
  $('f-category').value = p.categoryId ?? '';
  $('f-address').value = p.address ?? '';
  $('f-short').value = p.shortDesc ?? '';
  $('f-desc').value = p.description ?? '';
  $('f-lat').value = p.lat ?? '';
  $('f-lng').value = p.lng ?? '';
  $('f-hours').value = p.openHours ?? '';
  $('f-ticket').value = p.ticketPrice ?? '';
  $('f-rating').value = p.rating ?? 0;
  $('f-ratingCount').value = p.ratingCount ?? 0;
  $('f-coverImage').value = p.coverImage ? p.coverImage.split('/').pop() : '';
  setCover(p.coverImage);
  $('f-visible').checked = p.isVisible !== false;
}

async function init() {
  try {
    const cats = await api('/categories');
    $('f-category').innerHTML = '<option value="">-- Chọn loại địa điểm --</option>' +
      cats.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('');

    if (editId) {
      $('pageTitle').textContent = 'Sửa địa điểm';
      const p = await api('/places/' + editId);
      fill(p);
      gallery = (p.imageItems || []).map((i) => ({ id: i.id, filename: i.url.split('/').pop(), url: i.url }));
    }
    renderGallery();

    const f = popFlash();
    if (f) showFormAlert(f.message, f.type);
  } catch (ex) {
    showFormAlert(ex.message);
    renderGallery();
  }
}

// ---------- lưu ----------
$('placeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (busy > 0) return;

  const body = {
    name: val('f-name'),
    categoryId: val('f-category'),
    address: val('f-address'),
    shortDesc: val('f-short'),
    description: val('f-desc'),
    lat: val('f-lat'),
    lng: val('f-lng'),
    openHours: val('f-hours'),
    ticketPrice: val('f-ticket'),
    rating: val('f-rating'),
    ratingCount: val('f-ratingCount'),
    coverImage: val('f-coverImage'),
    isVisible: $('f-visible').checked,
  };

  setBusy(true);
  try {
    if (editId) {
      await api('/places/' + editId, { method: 'PUT', body });
      flash('Đã cập nhật địa điểm');
      location.href = 'places.html';
      return;
    }

    const created = await api('/places', { method: 'POST', body });
    let failed = 0;
    for (const g of gallery.filter((x) => !x.id)) {
      try {
        await api(`/places/${created.id}/images`, { method: 'POST', body: { filename: g.filename } });
      } catch {
        failed++;
      }
    }
    if (failed) {
      flash(`Đã tạo địa điểm nhưng ${failed} ảnh phụ chưa thêm được. Hãy thêm lại ở đây.`, 'warning');
      location.href = 'place-form.html?id=' + created.id;
    } else {
      flash('Đã thêm địa điểm mới');
      location.href = 'places.html';
    }
  } catch (ex) {
    showFormAlert(ex.message);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } finally {
    setBusy(false);
  }
});

init();
