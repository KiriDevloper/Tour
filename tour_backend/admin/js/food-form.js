requireAdmin();
mountShell('foods');

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

function fill(f) {
  $('f-name').value = f.name ?? '';
  $('f-kind').value = f.kind ?? '';
  $('f-place').value = f.placeId ?? '';
  $('f-short').value = f.shortDesc ?? '';
  $('f-desc').value = f.description ?? '';
  $('f-image').value = f.image ? f.image.split('/').pop() : '';
  setImage(f.image);
}

async function init() {
  try {
    const places = await api('/places?all=1');
    $('f-place').innerHTML = '<option value="">-- Không gắn --</option>' +
      places.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('');

    if (editId) {
      $('pageTitle').textContent = 'Sửa món ăn';
      $('backLink').href = 'food-detail.html?id=' + editId;
      fill(await api('/foods/' + editId));
    }
  } catch (ex) {
    showFormAlert(ex.message);
  }
}

$('foodForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (busy > 0) return;

  const body = {
    name: val('f-name'),
    kind: val('f-kind'),
    placeId: val('f-place'),
    shortDesc: val('f-short'),
    description: val('f-desc'),
    image: val('f-image'),
  };

  setBusy(true);
  try {
    if (editId) {
      await api('/foods/' + editId, { method: 'PUT', body });
      flash('Đã cập nhật món ăn');
      location.href = 'food-detail.html?id=' + editId;
    } else {
      const created = await api('/foods', { method: 'POST', body });
      flash('Đã thêm món ăn. Hãy thêm các quán thưởng thức món này ở bên dưới.');
      location.href = 'food-detail.html?id=' + created.id;
    }
  } catch (ex) {
    showFormAlert(ex.message);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } finally {
    setBusy(false);
  }
});

init();
