requireAdmin();
mountShell('users');

const PAGE_SIZE = 10;
const meId = (Auth.user() || {}).id;
const userModal = new bootstrap.Modal($('userModal'));

let users = [];
let page = 1;
let editingId = null;

async function load() {
  try {
    users = await api('/admin/users');
    render();
  } catch (e) {
    $('tbody').innerHTML = '';
    showAlert(e.message, 'danger');
  }
}

function filtered() {
  const q = norm($('search').value).trim();
  const role = $('filterRole').value;
  const status = $('filterStatus').value;
  return users.filter((u) =>
    (!role || u.role === role) &&
    (!status || (status === 'active') === u.isActive) &&
    (!q || norm(u.name + ' ' + u.email + ' ' + (u.phone || '')).includes(q)));
}

function rowHtml(u, index) {
  const self = u.id === meId;
  const roleLabel = u.role === 'admin' ? 'Quản trị viên' : 'Người dùng';
  const status = u.isActive
    ? `<button class="status-pill ok" data-toggle="${u.id}" ${self ? 'disabled' : ''} title="${self ? 'Tài khoản của bạn' : 'Bấm để khóa'}">Hoạt động</button>`
    : `<button class="status-pill bad" data-toggle="${u.id}" title="Bấm để mở khóa">Bị khóa</button>`;
  const del = self ? '' : `<button class="icon-btn danger" data-del="${u.id}" title="Xóa"><i class="bi bi-trash"></i></button>`;
  return `
    <tr>
      <td>${index}</td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <span class="avatar">${esc((u.name || '?').charAt(0).toUpperCase())}</span>
          <div>
            <div class="fw-semibold">${esc(u.name)}${self ? ' <span class="badge text-bg-light border">Bạn</span>' : ''}</div>
            ${u.phone ? `<div class="small text-muted">${esc(u.phone)}</div>` : ''}
          </div>
        </div>
      </td>
      <td class="small">${esc(u.email)}</td>
      <td><span class="role-pill ${u.role === 'admin' ? 'admin' : 'user'}">${roleLabel}</span></td>
      <td>${status}</td>
      <td class="small text-muted">${esc(fmtDate(u.createdAt))}</td>
      <td>${u.favorites}</td>
      <td class="text-nowrap">
        <button class="icon-btn" data-edit="${u.id}" title="Sửa"><i class="bi bi-pencil-square"></i></button>
        ${del}
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
    ? slice.map((u, i) => rowHtml(u, start + i + 1)).join('')
    : '<tr><td colspan="8" class="text-center text-muted py-4">Không có người dùng nào</td></tr>';

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
$('filterRole').addEventListener('change', () => { page = 1; render(); });
$('filterStatus').addEventListener('change', () => { page = 1; render(); });

$('pager').addEventListener('click', (e) => {
  const a = e.target.closest('[data-page]');
  if (!a) return;
  e.preventDefault();
  if (a.closest('.disabled')) return;
  page = Number(a.dataset.page);
  render();
});

function replaceUser(updated) {
  users = users.map((u) => (u.id === updated.id ? updated : u));
  render();
}

$('tbody').addEventListener('click', async (e) => {
  const toggle = e.target.closest('[data-toggle]');
  const edit = e.target.closest('[data-edit]');
  const del = e.target.closest('[data-del]');
  try {
    if (toggle) {
      const u = users.find((x) => x.id === Number(toggle.dataset.toggle));
      if (u.id === meId) return;
      if (u.isActive && !confirm(`Khóa tài khoản "${u.name}"?\n\nNgười này sẽ bị đăng xuất và không thể đăng nhập cho đến khi được mở khóa.`)) return;
      const updated = await api(`/admin/users/${u.id}/status`, { method: 'PATCH', body: { isActive: !u.isActive } });
      replaceUser(updated);
      showAlert(updated.isActive ? `Đã mở khóa "${u.name}"` : `Đã khóa "${u.name}"`);
    } else if (edit) {
      openEdit(users.find((x) => x.id === Number(edit.dataset.edit)));
    } else if (del) {
      const u = users.find((x) => x.id === Number(del.dataset.del));
      const ok = confirm(`Xóa tài khoản "${u.name}" (${u.email})?\n\nDanh sách yêu thích của người này (${u.favorites} địa điểm) cũng sẽ bị xóa.\nNếu chỉ muốn chặn đăng nhập, hãy khóa tài khoản thay vì xóa.`);
      if (!ok) return;
      await api('/admin/users/' + u.id, { method: 'DELETE' });
      users = users.filter((x) => x.id !== u.id);
      render();
      showAlert('Đã xóa người dùng');
    }
  } catch (ex) {
    showAlert(ex.message, 'danger');
  }
});

// ---------- sửa ----------
function userAlert(message) {
  $('userAlert').innerHTML = message ? `<div class="alert alert-danger py-2">${esc(message)}</div>` : '';
}

function openEdit(u) {
  editingId = u.id;
  userAlert('');
  $('u-name').value = u.name;
  $('u-email').value = u.email;
  $('u-role').value = u.role;
  const self = u.id === meId;
  $('u-role').disabled = self;
  $('u-roleHint').textContent = self
    ? 'Bạn không thể tự đổi quyền của chính mình.'
    : 'Quản trị viên có thể đăng nhập trang quản trị và thay đổi mọi dữ liệu.';
  userModal.show();
}

$('userForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('userSaveBtn').disabled = true;
  try {
    const updated = await api('/admin/users/' + editingId, {
      method: 'PUT',
      body: { name: $('u-name').value.trim(), role: $('u-role').value },
    });
    userModal.hide();
    replaceUser(updated);
    showAlert('Đã cập nhật người dùng');
  } catch (ex) {
    userAlert(ex.message);
  } finally {
    $('userSaveBtn').disabled = false;
  }
});

load();
