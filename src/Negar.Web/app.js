// =============================================================================
// Negar Web App - Core Controller
// Architecture: Each tile button shows its own form; Back button returns to tiles
// =============================================================================

// ---- App State ----
const AppState = {
  currentModule: 'system',   // active ribbon tab
  currentForm: null,          // null = tiles view, otherwise form id
  users: [
    { id: 1, username: 'admin', fullName: 'مدیر ارشد سیستم', userType: 'SuperAdmin', isActive: true, ip: '127.0.0.1' },
    { id: 2, username: 'accountant1', fullName: 'علی رضایی (حسابدار)', userType: 'User', isActive: true, ip: '192.168.1.10' },
    { id: 3, username: 'storekeeper', fullName: 'رضا حسینی (انباردار)', userType: 'User', isActive: true, ip: '192.168.1.15' }
  ],
  accounts: [
    { id: 1, code: '1', name: 'دارایی‌های جاری', type: 'گروه', nature: 'بدهکار', parent: '-' },
    { id: 2, code: '10', name: 'موجودی نقد و بانک', type: 'کل', nature: 'بدهکار', parent: '1 - دارایی‌های جاری' },
    { id: 3, code: '1001', name: 'صندوق مرکزی', type: 'معین', nature: 'بدهکار', parent: '10 - موجودی نقد و بانک' },
    { id: 4, code: '1002', name: 'بانک ملی شعبه مرکزی', type: 'معین', nature: 'بدهکار', parent: '10 - موجودی نقد و بانک' },
    { id: 5, code: '11', name: 'حساب‌های دریافتنی', type: 'کل', nature: 'بدهکار', parent: '1 - دارایی‌های جاری' },
    { id: 6, code: '1101', name: 'مشتریان تجاری', type: 'معین', nature: 'بدهکار', parent: '11 - حساب‌های دریافتنی' },
    { id: 7, code: '2', name: 'بدهی‌های جاری', type: 'گروه', nature: 'بستانکار', parent: '-' },
    { id: 8, code: '20', name: 'حساب‌های پرداختنی', type: 'کل', nature: 'بستانکار', parent: '2 - بدهی‌های جاری' },
    { id: 9, code: '2001', name: 'تامین‌کنندگان', type: 'معین', nature: 'بستانکار', parent: '20 - حساب‌های پرداختنی' },
    { id: 10, code: '4', name: 'درآمدها', type: 'گروه', nature: 'بستانکار', parent: '-' },
    { id: 11, code: '40', name: 'فروش کالا', type: 'کل', nature: 'بستانکار', parent: '4 - درآمدها' },
    { id: 12, code: '5', name: 'هزینه‌ها', type: 'گروه', nature: 'بدهکار', parent: '-' },
    { id: 13, code: '50', name: 'هزینه اداری', type: 'کل', nature: 'بدهکار', parent: '5 - هزینه‌ها' },
  ],
  shenavars: [
    { id: 1, code: 'SH-101', name: 'پروژه احداث شعبه غرب', parent: '-', status: 'فعال' },
    { id: 2, code: 'SH-102', name: 'مرکز هزینه کارخانه ۱', parent: '-', status: 'فعال' }
  ],
  sanads: [
    { id: 101, date: '1403/01/05', desc: 'سند افتتاحیه سال مالی', debit: 5000000000, credit: 5000000000, status: 'دائم' },
    { id: 102, date: '1403/05/10', desc: 'فاکتور فروش فروشگاه مرکزی', debit: 125000000, credit: 125000000, status: 'تایید شده' }
  ],
  sanadLines: [
    { account: '1001', desc: 'دریافت نقدی', debit: 50000000, credit: 0 },
    { account: '1101', desc: 'تسویه حساب مشتری', debit: 0, credit: 50000000 }
  ],
  products: [
    { id: 1, code: 'PRD-101', name: 'لپ‌تاپ گیمینگ ایسوس ۱۵ اینچ', unit: 'دستگاه', price: 450000000, stock: 24, barcode: '690123456789' },
    { id: 2, code: 'PRD-102', name: 'مانیتور ۲۷ اینچ 4K سامسونگ', unit: 'عدد', price: 180000000, stock: 15, barcode: '690987654321' }
  ],
  warehouses: [
    { id: 1, code: 'WH-01', name: 'انبار مرکزی کالا', type: 'عمومی', keeper: 'رضا حسینی', location: 'تهران - سالن اصلی', allowNeg: false }
  ],
  purchaseInvoices: [
    { id: 'PINV-4001', date: '1403/05/02', party: 'بازرگانی واردات پارس', total: 1850000000, warehouse: 'انبار مرکزی', status: 'ثبت نهایی' }
  ],
  salesInvoices: [
    { id: 'INV-8001', date: '1403/05/08', party: 'شرکت فناوری آریا', total: 630000000, warehouse: 'انبار مرکزی', status: 'ثبت نهایی' }
  ]
};

// ============================
// Navigation: Ribbon Tab Switch
// ============================
function switchRibbon(moduleId, tabEl) {
  AppState.currentModule = moduleId;
  AppState.currentForm = null;

  // Update active ribbon tab
  document.querySelectorAll('.ribbon-tab').forEach(t => t.classList.remove('active'));
  if (tabEl) tabEl.classList.add('active');

  // Hide forms area, show tiles
  showTiles(moduleId);
}

function showTiles(moduleId) {
  // Hide forms area
  document.getElementById('formsArea').style.display = 'none';

  // Hide all tile containers
  document.querySelectorAll('.tiles-container').forEach(t => {
    t.classList.remove('active');
    t.style.display = 'none';
  });

  // Show only selected module's tiles
  const target = document.getElementById('tiles-' + moduleId);
  if (target) {
    target.classList.add('active');
    target.style.display = 'block';
  }
}

// ============================
// Show Form (called when a tile is clicked)
// ============================
function showForm(formId) {
  AppState.currentForm = formId;

  // Hide all tile containers
  document.querySelectorAll('.tiles-container').forEach(t => {
    t.classList.remove('active');
    t.style.display = 'none';
  });

  // Show forms area
  const formsArea = document.getElementById('formsArea');
  formsArea.style.display = 'block';

  // Hide all individual form sections
  document.querySelectorAll('.form-section').forEach(f => {
    f.style.display = 'none';
  });

  // Show selected form
  const targetForm = document.getElementById(formId);
  if (targetForm) {
    targetForm.style.display = 'block';

    // Set back-bar title
    const heading = targetForm.querySelector('.form-heading');
    const titleEl = document.getElementById('currentFormTitle');
    if (titleEl && heading) titleEl.textContent = heading.textContent;

    // Scroll to top
    window.scrollTo(0, 0);
  }

  // Re-render dynamic tables when their form is shown
  if (formId === 'form-users-list') renderUsersTable();
  if (formId === 'form-accounts-chart') renderAccountsTable();
  if (formId === 'form-shenavar') renderShenavaarTable();
  if (formId === 'form-sanad1') renderSanadListTable();
  if (formId === 'form-sanad2') renderSanadEditorLines();
  if (formId === 'form-products') renderProductsTable();
  if (formId === 'form-warehouses') renderWarehousesTable();
  if (formId === 'form-purchase-invoice') renderPurchaseInvoicesTable();
  if (formId === 'form-sales-invoice') renderSalesInvoicesTable();
  if (formId === 'form-permissions-matrix') renderPermissionsMatrix();
}

// ============================
// Back Button
// ============================
function goBack() {
  AppState.currentForm = null;
  showTiles(AppState.currentModule);
}

// ============================
// USERS MODULE
// ============================
function renderUsersTable() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  tbody.innerHTML = AppState.users.map(u => `
    <tr>
      <td><b>${u.username}</b></td>
      <td>${u.fullName}</td>
      <td><span class="badge badge-primary">${u.userType}</span></td>
      <td>${u.ip}</td>
      <td><span class="badge ${u.isActive ? 'badge-success' : 'badge-warning'}">${u.isActive ? 'فعال' : 'غیرفعال'}</span></td>
      <td>
        <button class="btn btn-outline" style="padding:3px 8px;" onclick="toggleUserStatus(${u.id})">
          ${u.isActive ? '🔴 غیرفعال' : '🟢 فعال'}
        </button>
        <button class="btn btn-outline" style="padding:3px 8px;color:red;" onclick="deleteUser(${u.id})">🗑️ حذف</button>
      </td>
    </tr>
  `).join('');
}

function openAddUserRow() {
  document.getElementById('addUserRow').style.display = 'block';
  document.getElementById('newUsername').focus();
}

function saveNewUser() {
  const username = document.getElementById('newUsername')?.value?.trim();
  const fullName = document.getElementById('newFullName')?.value?.trim();
  const userType = document.getElementById('newUserType')?.value;
  if (!username || !fullName) { alert('نام کاربری و نام کامل الزامی هستند.'); return; }
  if (AppState.users.find(u => u.username === username)) { alert('این نام کاربری قبلاً ثبت شده است.'); return; }
  AppState.users.push({ id: Date.now(), username, fullName, userType, isActive: true, ip: '127.0.0.1' });
  document.getElementById('newUsername').value = '';
  document.getElementById('newFullName').value = '';
  document.getElementById('addUserRow').style.display = 'none';
  renderUsersTable();
  alert(`کاربر "${username}" با موفقیت اضافه شد.`);
}

function toggleUserStatus(userId) {
  const user = AppState.users.find(u => u.id === userId);
  if (user) { user.isActive = !user.isActive; renderUsersTable(); }
}

function deleteUser(userId) {
  if (userId === 1) { alert('حذف مدیر ارشد سیستم مجاز نیست.'); return; }
  if (confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
    AppState.users = AppState.users.filter(u => u.id !== userId);
    renderUsersTable();
  }
}

function renderPermissionsMatrix() {
  const modules = ['حسابداری', 'کاربران', 'انبارداری', 'خرید', 'فروش', 'حقوق', 'اموال', 'اتوماسیون', 'CRM', 'خزانه'];
  const tbody = document.getElementById('permissionsMatrixBody');
  if (!tbody) return;
  tbody.innerHTML = modules.map(m => `
    <tr>
      <td>${m}</td>
      ${['مشاهده','ایجاد','ویرایش','حذف','چاپ','خروجی'].map(p => `
        <td style="text-align:center;"><input type="checkbox" checked style="width:16px;height:16px;cursor:pointer;" /></td>
      `).join('')}
    </tr>
  `).join('');
}

// ============================
// ACCOUNTING MODULE
// ============================
function renderAccountsTable() {
  const tbody = document.getElementById('accountsTableBody');
  if (!tbody) return;
  tbody.innerHTML = AppState.accounts.map(a => `
    <tr>
      <td><b>${a.code}</b></td>
      <td>${a.name}</td>
      <td><span class="badge badge-primary">${a.type}</span></td>
      <td>${a.nature}</td>
      <td style="color:var(--text-muted);font-size:0.82rem;">${a.parent}</td>
      <td><span class="badge badge-success">فعال</span></td>
      <td>
        <button class="btn btn-outline" style="padding:3px 8px;">✏️ ویرایش</button>
        <button class="btn btn-outline" style="padding:3px 8px;color:red;" onclick="deleteAccount(${a.id})">🗑️ حذف</button>
      </td>
    </tr>
  `).join('');
}

function openAddAccountRow() {
  document.getElementById('addAccountRow').style.display = 'block';
  document.getElementById('newAccCode').focus();
}

function saveNewAccount() {
  const code = document.getElementById('newAccCode')?.value?.trim();
  const name = document.getElementById('newAccName')?.value?.trim();
  const type = document.getElementById('newAccType')?.value;
  const nature = document.getElementById('newAccNature')?.value;
  if (!code || !name) { alert('کد حساب و عنوان الزامی است.'); return; }
  if (AppState.accounts.find(a => a.code === code)) { alert('این کد حساب قبلاً ثبت شده است.'); return; }
  AppState.accounts.push({ id: Date.now(), code, name, type, nature, parent: '-' });
  document.getElementById('newAccCode').value = '';
  document.getElementById('newAccName').value = '';
  document.getElementById('addAccountRow').style.display = 'none';
  renderAccountsTable();
  alert(`حساب "${code} - ${name}" با موفقیت ثبت شد.`);
}

function deleteAccount(id) {
  if (confirm('آیا از حذف این حساب اطمینان دارید؟')) {
    AppState.accounts = AppState.accounts.filter(a => a.id !== id);
    renderAccountsTable();
  }
}

function renderShenavaarTable() {
  const tbody = document.getElementById('shenavaarTableBody');
  if (!tbody) return;
  tbody.innerHTML = AppState.shenavars.map(s => `
    <tr>
      <td><b>${s.code}</b></td>
      <td>${s.name}</td>
      <td>${s.parent}</td>
      <td><span class="badge badge-success">${s.status}</span></td>
      <td>
        <button class="btn btn-outline" style="padding:3px 8px;">✏️</button>
        <button class="btn btn-outline" style="padding:3px 8px;color:red;" onclick="deleteShenavar('${s.code}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function addShenavaar() {
  const code = prompt('کد شناور جدید:');
  const name = prompt('عنوان شناور:');
  if (code && name) {
    AppState.shenavars.push({ id: Date.now(), code, name, parent: '-', status: 'فعال' });
    renderShenavaarTable();
  }
}

function deleteShenavar(code) {
  if (confirm('حذف این حساب شناور؟')) {
    AppState.shenavars = AppState.shenavars.filter(s => s.code !== code);
    renderShenavaarTable();
  }
}

// Sanad 1 (list)
function renderSanadListTable() {
  const tbody = document.getElementById('sanadListTable');
  if (!tbody) return;
  tbody.innerHTML = AppState.sanads.map(s => `
    <tr>
      <td><b>#${s.id}</b></td>
      <td>${s.date}</td>
      <td>${s.desc}</td>
      <td>${s.debit.toLocaleString()}</td>
      <td>${s.credit.toLocaleString()}</td>
      <td><span class="badge badge-success">متوازن ✅</span></td>
      <td><span class="badge badge-primary">${s.status}</span></td>
      <td>
        <button class="btn btn-outline" style="padding:3px 8px;" onclick="editSanad(${s.id})">✏️ ویرایش</button>
        <button class="btn btn-outline" style="padding:3px 8px;color:red;" onclick="deleteSanad(${s.id})">🗑️ حذف</button>
      </td>
    </tr>
  `).join('');
}

function deleteSanad(id) {
  if (confirm(`حذف سند #${id}؟`)) {
    AppState.sanads = AppState.sanads.filter(s => s.id !== id);
    renderSanadListTable();
  }
}

function editSanad(id) {
  showForm('form-sanad2');
  document.getElementById('sanadNumberInput').value = id;
}

// Sanad 2 (editor)
function renderSanadEditorLines() {
  const tbody = document.getElementById('sanadLinesEditorBody');
  if (!tbody) return;
  tbody.innerHTML = AppState.sanadLines.map((line, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>
        <select class="form-select" onchange="AppState.sanadLines[${i}].account=this.value" style="min-width:200px;">
          ${AppState.accounts.map(a =>
            `<option value="${a.code}" ${line.account === a.code ? 'selected' : ''}>${a.code} - ${a.name}</option>`
          ).join('')}
        </select>
      </td>
      <td><input type="text" class="form-input" value="${line.desc}" onchange="AppState.sanadLines[${i}].desc=this.value" /></td>
      <td><input type="number" class="form-input" value="${line.debit}" onchange="AppState.sanadLines[${i}].debit=Number(this.value);updateSanadTotals();" style="width:130px;" /></td>
      <td><input type="number" class="form-input" value="${line.credit}" onchange="AppState.sanadLines[${i}].credit=Number(this.value);updateSanadTotals();" style="width:130px;" /></td>
      <td><button class="btn btn-outline" style="padding:2px 6px;color:red;" onclick="removeSanadLine(${i})">❌</button></td>
    </tr>
  `).join('');
  updateSanadTotals();
}

function addSanadLine() {
  AppState.sanadLines.push({ account: '1001', desc: '', debit: 0, credit: 0 });
  renderSanadEditorLines();
}

function removeSanadLine(i) {
  AppState.sanadLines.splice(i, 1);
  renderSanadEditorLines();
}

function updateSanadTotals() {
  const td = AppState.sanadLines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const tc = AppState.sanadLines.reduce((s, l) => s + Number(l.credit || 0), 0);
  const diff = td - tc;
  const debitEl = document.getElementById('sanadTotalDebit');
  const creditEl = document.getElementById('sanadTotalCredit');
  const statusEl = document.getElementById('sanadBalanceStatus');
  if (debitEl) debitEl.textContent = td.toLocaleString() + ' ریال';
  if (creditEl) creditEl.textContent = tc.toLocaleString() + ' ریال';
  if (statusEl) {
    if (diff === 0 && td > 0) {
      statusEl.className = 'badge badge-success';
      statusEl.textContent = 'متوازن ✅';
    } else {
      statusEl.className = 'badge badge-warning';
      statusEl.textContent = `نامتوازن (اختلاف: ${Math.abs(diff).toLocaleString()})`;
    }
  }
}

function saveSanadEntry() {
  const td = AppState.sanadLines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const tc = AppState.sanadLines.reduce((s, l) => s + Number(l.credit || 0), 0);
  if (td !== tc) { alert('امکان ثبت سند نامتوازن وجود ندارد.'); return; }
  const no = document.getElementById('sanadNumberInput')?.value;
  const date = document.getElementById('sanadDateInput')?.value;
  const desc = document.getElementById('sanadDescInput')?.value || 'سند حسابداری';
  AppState.sanads.push({ id: no, date, desc, debit: td, credit: tc, status: 'موقت' });
  AppState.sanadLines = [{ account: '1001', desc: '', debit: 0, credit: 0 }, { account: '1101', desc: '', debit: 0, credit: 0 }];
  alert(`سند شماره ${no} با موفقیت ثبت شد.`);
  showForm('form-sanad1');
}

// ============================
// INVENTORY MODULE
// ============================
function renderProductsTable() {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;
  tbody.innerHTML = AppState.products.map(p => `
    <tr>
      <td><b>${p.code}</b></td>
      <td>${p.name}</td>
      <td>${p.unit}</td>
      <td style="font-size:0.8rem;">${p.barcode}</td>
      <td>${p.price.toLocaleString()} ریال</td>
      <td>${p.stock}</td>
      <td>
        <button class="btn btn-outline" style="padding:3px 8px;">✏️ ویرایش</button>
        <button class="btn btn-outline" style="padding:3px 8px;color:red;" onclick="deleteProduct(${p.id})">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function openAddProductRow() {
  document.getElementById('addProductRow').style.display = 'block';
  document.getElementById('newProdCode').focus();
}

function saveNewProduct() {
  const code = document.getElementById('newProdCode')?.value?.trim();
  const name = document.getElementById('newProdName')?.value?.trim();
  const unit = document.getElementById('newProdUnit')?.value;
  const price = Number(document.getElementById('newProdPrice')?.value || 0);
  const stock = Number(document.getElementById('newProdStock')?.value || 0);
  if (!code || !name) { alert('کد کالا و نام کالا الزامی است.'); return; }
  AppState.products.push({ id: Date.now(), code, name, unit, price, stock, barcode: '690' + Math.floor(Math.random() * 1e9) });
  document.getElementById('newProdCode').value = '';
  document.getElementById('newProdName').value = '';
  document.getElementById('addProductRow').style.display = 'none';
  renderProductsTable();
  alert(`کالای "${name}" با موفقیت ثبت شد.`);
}

function deleteProduct(id) {
  if (confirm('حذف این کالا؟')) {
    AppState.products = AppState.products.filter(p => p.id !== id);
    renderProductsTable();
  }
}

function renderWarehousesTable() {
  const tbody = document.getElementById('warehousesTableBody');
  if (!tbody) return;
  tbody.innerHTML = AppState.warehouses.map(w => `
    <tr>
      <td><b>${w.code}</b></td>
      <td>${w.name}</td>
      <td>${w.type}</td>
      <td>${w.keeper}</td>
      <td>${w.location}</td>
      <td>${w.allowNeg ? 'بله' : 'خیر'}</td>
      <td><button class="btn btn-outline" style="padding:3px 8px;">✏️ ویرایش</button></td>
    </tr>
  `).join('');
}

function renderPurchaseInvoicesTable() {
  const tbody = document.getElementById('purchaseInvoicesBody');
  if (!tbody) return;
  tbody.innerHTML = AppState.purchaseInvoices.map(inv => `
    <tr>
      <td><b>${inv.id}</b></td>
      <td>${inv.date}</td>
      <td>${inv.party}</td>
      <td>${inv.warehouse}</td>
      <td>${inv.total.toLocaleString()} ریال</td>
      <td><span class="badge badge-success">${inv.status}</span></td>
      <td><button class="btn btn-outline" style="padding:3px 8px;">📋 جزئیات</button></td>
    </tr>
  `).join('');
}

function renderSalesInvoicesTable() {
  const tbody = document.getElementById('salesInvoicesBody');
  if (!tbody) return;
  tbody.innerHTML = AppState.salesInvoices.map(inv => `
    <tr>
      <td><b>${inv.id}</b></td>
      <td>${inv.date}</td>
      <td>${inv.party}</td>
      <td>${inv.warehouse}</td>
      <td>${inv.total.toLocaleString()} ریال</td>
      <td><span class="badge badge-success">${inv.status}</span></td>
      <td><button class="btn btn-outline" style="padding:3px 8px;">📋 جزئیات</button></td>
    </tr>
  `).join('');
}

function showCardex() {
  document.getElementById('cardexResult').style.display = 'block';
  document.getElementById('cardexTableBody').innerHTML = `
    <tr><td>1403/01/05</td><td>موجودی اول دوره</td><td>100</td><td>-</td><td>100</td><td>390,000,000</td><td>39,000,000,000</td></tr>
    <tr><td>1403/05/02</td><td>رسید خرید PINV-4001</td><td>50</td><td>-</td><td>150</td><td>392,000,000</td><td>58,800,000,000</td></tr>
    <tr><td>1403/05/08</td><td>حواله فروش INV-8001</td><td>-</td><td>25</td><td>125</td><td>391,333,333</td><td>48,916,666,625</td></tr>
  `;
}

// ============================
// SYSTEM MODULE
// ============================
function doBackup() {
  const name = document.getElementById('backupFileName')?.value || 'backup.sql';
  const log = document.getElementById('backupLog');
  if (log) {
    log.style.display = 'block';
    log.innerHTML = `
      <div class="log-line">▶ شروع پشتیبان‌گیری از دیتابیس negar_db ...</div>
      <div class="log-line">✔ جدول users: 3 رکورد</div>
      <div class="log-line">✔ جدول accounts: 13 رکورد</div>
      <div class="log-line">✔ جدول sanads: 2 رکورد</div>
      <div class="log-line">✔ جدول products: 2 رکورد</div>
      <div class="log-line" style="color:var(--success-color);">✅ پشتیبان‌گیری با موفقیت کامل شد → ${name}</div>
    `;
  }
}

function doRestore() {
  const file = document.getElementById('restoreFile')?.files[0];
  if (!file) { alert('لطفاً فایل پشتیبان را انتخاب کنید.'); return; }
  if (confirm(`آیا از بازیابی فایل "${file.name}" اطمینان دارید؟ این عملیات تمامی داده‌های فعلی را جایگزین می‌کند!`)) {
    setTimeout(() => alert('✅ بازیابی دیتابیس با موفقیت انجام شد.'), 1000);
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  alert(`تم "${theme}" با موفقیت اعمال شد.`);
}

function lockApp() {
  const pwd = document.getElementById('lockPassword')?.value;
  if (!pwd) { alert('لطفاً رمز قفل را وارد کنید.'); return; }
  alert('برنامه قفل شد. برای ورود مجدد رمز عبور خود را وارد کنید.');
}

// ============================
// Init on page load
// ============================
document.addEventListener('DOMContentLoaded', () => {
  // Show system tiles by default
  showTiles('system');
  // Update system clock every second
  setInterval(() => {
    const el = document.getElementById('statusBarTime');
    if (el) {
      const now = new Date();
      el.innerHTML = `ساعت سیستم: <b>${now.toLocaleTimeString('fa-IR')}</b>`;
    }
  }, 1000);
});
