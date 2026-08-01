// =============================================================================
// Negar Web App - Core Controller
// Architecture: Each tile button shows its own form; Back button returns to tiles
// =============================================================================

// ============================
// AUTHENTICATION - Credentials
// ============================
const CREDENTIALS = [
  { username: 'admin',        password: 'admin123',    fullName: 'ابر مدیر سیستم',         role: 'SuperAdmin' },
  { username: 'accountant1',  password: 'acc2024',     fullName: 'علی رضایی (حسابدار)',     role: 'User' },
  { username: 'storekeeper',  password: 'store2024',   fullName: 'رضا حسینی (انباردار)',    role: 'User' }
];

let currentUser = null;  // will be set after successful login

function doLogin() {
  const usernameEl = document.getElementById('loginUsername');
  const passwordEl = document.getElementById('loginPassword');
  const errorEl   = document.getElementById('loginError');
  const btnText   = document.getElementById('loginBtnText');
  const btnSpinner= document.getElementById('loginBtnSpinner');
  const loginBtn  = document.getElementById('loginBtn');

  const username = usernameEl?.value?.trim();
  const password = passwordEl?.value;

  // Basic empty check
  if (!username) {
    usernameEl?.focus();
    showLoginError('لطفاً نام کاربری را وارد کنید.');
    return;
  }
  if (!password) {
    passwordEl?.focus();
    showLoginError('لطفاً رمز عبور را وارد کنید.');
    return;
  }

  // Show loading state
  if (btnText)   btnText.style.display = 'none';
  if (btnSpinner) btnSpinner.style.display = 'inline';
  if (loginBtn)  loginBtn.disabled = true;

  // Simulate a short delay (like a real server call)
  setTimeout(() => {
    const found = CREDENTIALS.find(
      c => c.username === username && c.password === password
    );

    if (found) {
      // ✅ Success
      currentUser = found;
      if (errorEl) errorEl.style.display = 'none';

      // Update header info
      const headerUser = document.getElementById('headerUsername');
      if (headerUser) headerUser.textContent = found.fullName + ' (' + found.username + ')';

      // Animate out login, animate in app
      const overlay  = document.getElementById('loginOverlay');
      const mainApp  = document.getElementById('mainApp');

      overlay.classList.add('login-fade-out');
      setTimeout(() => {
        overlay.style.display = 'none';
        mainApp.style.display = 'block';
        mainApp.classList.add('app-fade-in');

        // Initialize session: default to first company and its active (or latest) fiscal year
        if (AppState.companies.length > 0) {
          SessionState.company = AppState.companies[0];
          const activeYears = AppState.fiscalYears
            .filter(fy => fy.company === SessionState.company.code)
            .sort((a, b) => Number(b.year) - Number(a.year));
          const activeOne = activeYears.find(fy => fy.status === 'فعال') || activeYears[0];
          if (activeOne) SessionState.year = activeOne.year;
        }

        // Update header and status bar with user + company + year
        updateHeaderBar();

        // Show main tiles
        showTiles('system');
      }, 400);

    } else {
      // ❌ Wrong credentials
      showLoginError('نام کاربری یا رمز عبور اشتباه است. لطفاً دوباره تلاش کنید.');
      if (passwordEl) { passwordEl.value = ''; passwordEl.focus(); }
      // Reset button
      if (btnText)    btnText.style.display = 'inline';
      if (btnSpinner) btnSpinner.style.display = 'none';
      if (loginBtn)   loginBtn.disabled = false;
    }
  }, 700);
}

function showLoginError(msg) {
  const el = document.getElementById('loginError');
  if (!el) return;
  el.textContent = '❌ ' + msg;
  el.style.display = 'block';
  // Re-trigger shake animation
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = 'shake 0.4s ease';
}

function togglePasswordVisibility() {
  const input = document.getElementById('loginPassword');
  const btn   = document.querySelector('.login-eye-btn');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.textContent = '🙈';
  } else {
    input.type = 'password';
    if (btn) btn.textContent = '👁';
  }
}

function logout() {
  currentUser = null;
  // Clear fields
  const u = document.getElementById('loginUsername');
  const p = document.getElementById('loginPassword');
  if (u) u.value = '';
  if (p) { p.value = ''; p.type = 'password'; }
  const btn = document.querySelector('.login-eye-btn');
  if (btn) btn.textContent = '👁';
  // Hide error
  const err = document.getElementById('loginError');
  if (err) err.style.display = 'none';
  // Reset button state
  const btnText    = document.getElementById('loginBtnText');
  const btnSpinner = document.getElementById('loginBtnSpinner');
  const loginBtn   = document.getElementById('loginBtn');
  if (btnText)    { btnText.style.display = 'inline'; }
  if (btnSpinner) { btnSpinner.style.display = 'none'; }
  if (loginBtn)   { loginBtn.disabled = false; }

  // Show login, hide app
  const overlay = document.getElementById('loginOverlay');
  const mainApp = document.getElementById('mainApp');
  if (mainApp)  { mainApp.style.display = 'none'; mainApp.classList.remove('app-fade-in'); }
  if (overlay)  { overlay.style.display = 'flex'; overlay.classList.remove('login-fade-out'); }
  // Focus username field
  setTimeout(() => { if (u) u.focus(); }, 100);
}

// ---- App State ----

const AppState = {
  currentModule: 'system',   // active ribbon tab
  currentForm: null,          // null = tiles view, otherwise form id
  companies: [
    {
      id: 1,
      code: '1001',
      name: 'شرکت نمونه نگار',
      ecoCode: '411111111111',
      phone: '021-88888888',
      fax: '021-88888889',
      postalCode: '1234567890',
      email: 'info@negar-erp.ir',
      website: 'www.negar-erp.ir',
      address: 'تهران، خیابان ولیعصر، پلاک ۱۰۰',
      notes: 'شرکت اصلی و پیش‌فرض سیستم نگار',
      activeYear: '1403'
    }
  ],
  fiscalYears: [
    { id: 1, year: '1403', startDate: '1403/01/01', endDate: '1403/12/29', company: '1001', notes: 'سال مالی جاری', status: 'فعال' },
    { id: 2, year: '1402', startDate: '1402/01/01', endDate: '1402/12/29', company: '1001', notes: 'سال مالی قبل', status: 'بسته' },
    { id: 3, year: '1401', startDate: '1401/01/01', endDate: '1401/12/29', company: '1001', notes: 'سال مالی بسته', status: 'بسته' }
  ],
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
  if (formId === 'form-companies-list') renderCompaniesTable();
  if (formId === 'form-fiscal-years') renderFiscalYearsTable();
  if (formId === 'form-switch-company') renderSwitchCompanyForm();
  if (formId === 'form-switch-year') renderSwitchYearOnlyForm();
  if (formId === 'form-hesabdari-main') {
    const activeSub = document.querySelector('.hesabdari-subtabs-bar .subtab-item.active');
    const tabId = activeSub ? activeSub.getAttribute('data-tab') : 'accounts';
    switchHesabdariTab(tabId);
  }
}

// ============================
// HESABDARI MAIN MODULE & SUB-TABS
// ============================
function openHesabdariMain(mode) {
  showForm('form-hesabdari-main');
  if (mode === 'reports') {
    switchHesabdariTab('taraz');
  } else {
    switchHesabdariTab('accounts');
  }
}

function switchHesabdariTab(tabId) {
  // 1. Update sub-tab navigation items
  const items = document.querySelectorAll('.hesabdari-subtabs-bar .subtab-item');
  items.forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 2. Update sub-tab panels
  const panels = document.querySelectorAll('.hesabdari-tab-panel');
  panels.forEach(panel => {
    if (panel.id === 'tab-panel-' + tabId) {
      panel.classList.add('active');
      panel.style.display = 'block';
    } else {
      panel.classList.remove('active');
      panel.style.display = 'none';
    }
  });

  // 3. Render dynamic content for specific tab
  if (tabId === 'accounts') renderAccountsTable();
  if (tabId === 'shenavar') renderShenavaarTable();
  if (tabId === 'sanad') renderSanadListTable();
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
// COMPANIES MODULE
// ============================
function renderCompaniesTable() {
  const tbody = document.getElementById('companiesTableBody');
  if (!tbody) return;
  tbody.innerHTML = AppState.companies.map(c => `
    <tr>
      <td><b>${c.code}</b></td>
      <td><b>${c.name}</b></td>
      <td style="font-size:0.82rem;">${c.ecoCode || '-'}</td>
      <td>${c.phone || '-'}</td>
      <td style="font-size:0.82rem;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${c.address || ''}">${c.address || '-'}</td>
      <td style="text-align:center;"><span class="badge badge-success">${c.activeYear}</span></td>
      <td>
        <button class="btn btn-outline" style="padding:3px 10px;" onclick="openCompanyForm(${c.id})">✏️ ویرایش</button>
        <button class="btn btn-outline" style="padding:3px 10px;color:red;" onclick="deleteCompany(${c.id})">🗑️ حذف</button>
      </td>
    </tr>
  `).join('');
}

function openCompanyForm(companyId) {
  const panel = document.getElementById('companyFormPanel');
  const title = document.getElementById('companyFormTitle');
  if (!panel) return;

  // Scroll the inline form into view
  panel.style.display = 'block';

  if (companyId === null) {
    // NEW company mode
    title.textContent = '➕ تعریف شرکت جدید';
    document.getElementById('editingCompanyId').value = '';
    document.getElementById('compCode').value = '';
    document.getElementById('compName').value = '';
    document.getElementById('compEcoCode').value = '';
    document.getElementById('compPhone').value = '';
    document.getElementById('compFax').value = '';
    document.getElementById('compPostalCode').value = '';
    document.getElementById('compEmail').value = '';
    document.getElementById('compWebsite').value = '';
    document.getElementById('compAddress').value = '';
    document.getElementById('compNotes').value = '';
    document.getElementById('compActiveYear').value = '1403';
  } else {
    // EDIT mode: load existing data
    const company = AppState.companies.find(c => c.id === companyId);
    if (!company) return;
    title.textContent = `✏️ ویرایش شرکت: ${company.name}`;
    document.getElementById('editingCompanyId').value = company.id;
    document.getElementById('compCode').value = company.code;
    document.getElementById('compName').value = company.name;
    document.getElementById('compEcoCode').value = company.ecoCode || '';
    document.getElementById('compPhone').value = company.phone || '';
    document.getElementById('compFax').value = company.fax || '';
    document.getElementById('compPostalCode').value = company.postalCode || '';
    document.getElementById('compEmail').value = company.email || '';
    document.getElementById('compWebsite').value = company.website || '';
    document.getElementById('compAddress').value = company.address || '';
    document.getElementById('compNotes').value = company.notes || '';
    document.getElementById('compActiveYear').value = company.activeYear || '1403';
  }

  // Scroll panel into view smoothly
  setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  document.getElementById('compCode').focus();
}

function closeCompanyForm() {
  const panel = document.getElementById('companyFormPanel');
  if (panel) panel.style.display = 'none';
}

function saveCompany() {
  const editingId = document.getElementById('editingCompanyId')?.value;
  const code = document.getElementById('compCode')?.value?.trim();
  const name = document.getElementById('compName')?.value?.trim();
  const ecoCode = document.getElementById('compEcoCode')?.value?.trim();
  const phone = document.getElementById('compPhone')?.value?.trim();
  const fax = document.getElementById('compFax')?.value?.trim();
  const postalCode = document.getElementById('compPostalCode')?.value?.trim();
  const email = document.getElementById('compEmail')?.value?.trim();
  const website = document.getElementById('compWebsite')?.value?.trim();
  const address = document.getElementById('compAddress')?.value?.trim();
  const notes = document.getElementById('compNotes')?.value?.trim();
  const activeYear = document.getElementById('compActiveYear')?.value;

  // Validation
  if (!code) { alert('کد شرکت الزامی است.'); document.getElementById('compCode').focus(); return; }
  if (!name) { alert('نام شرکت الزامی است.'); document.getElementById('compName').focus(); return; }

  if (editingId) {
    // UPDATE existing company
    const idx = AppState.companies.findIndex(c => c.id === Number(editingId));
    if (idx !== -1) {
      AppState.companies[idx] = { ...AppState.companies[idx], code, name, ecoCode, phone, fax, postalCode, email, website, address, notes, activeYear };
      alert(`شرکت "${name}" با موفقیت بروزرسانی شد.`);
    }
  } else {
    // CHECK duplicate code
    if (AppState.companies.find(c => c.code === code)) {
      alert(`کد شرکت "${code}" قبلاً ثبت شده است. لطفاً کد منحصربفرد وارد کنید.`);
      document.getElementById('compCode').focus();
      return;
    }
    // CREATE new company
    AppState.companies.push({
      id: Date.now(),
      code, name, ecoCode, phone, fax, postalCode, email, website, address, notes, activeYear
    });
    alert(`شرکت جدید "${name}" با موفقیت ثبت شد.`);
  }

  closeCompanyForm();
  renderCompaniesTable();
}

function deleteCompany(companyId) {
  const company = AppState.companies.find(c => c.id === companyId);
  if (!company) return;
  if (AppState.companies.length === 1) {
    alert('حداقل یک شرکت باید در سیستم تعریف شده باشد. امکان حذف آخرین شرکت وجود ندارد.');
    return;
  }
  if (confirm(`آیا از حذف شرکت "${company.name}" (کد: ${company.code}) اطمینان دارید؟`)) {
    AppState.companies = AppState.companies.filter(c => c.id !== companyId);
    renderCompaniesTable();
    alert(`شرکت "${company.name}" با موفقیت حذف شد.`);
  }
}

// ============================
// FISCAL YEARS MODULE
// ============================
function renderFiscalYearsTable() {
  const tbody = document.getElementById('fiscalYearsTableBody');
  if (!tbody) return;

  // Sort by year descending (newest first)
  const sorted = [...AppState.fiscalYears].sort((a, b) => Number(b.year) - Number(a.year));

  tbody.innerHTML = sorted.map(fy => {
    const companyName = AppState.companies.find(c => c.code === fy.company)?.name || fy.company;
    const statusBadge = fy.status === 'فعال'
      ? '<span class="badge badge-success">فعال ✅</span>'
      : '<span class="badge badge-warning">بسته 🔒</span>';
    return `
      <tr>
        <td><b>${fy.year}</b></td>
        <td>${fy.startDate}</td>
        <td>${fy.endDate}</td>
        <td>${companyName}</td>
        <td style="color:var(--text-muted);font-size:0.82rem;">${fy.notes || '-'}</td>
        <td style="text-align:center;">${statusBadge}</td>
        <td>
          <button class="btn btn-outline" style="padding:3px 10px;" onclick="openFiscalYearForm(${fy.id})">✏️ ویرایش</button>
          <button class="btn btn-outline" style="padding:3px 10px;color:red;" onclick="deleteFiscalYear(${fy.id})">🗑️ حذف</button>
        </td>
      </tr>
    `;
  }).join('');
}

function openFiscalYearForm(fiscalYearId) {
  const panel = document.getElementById('fiscalYearFormPanel');
  const title = document.getElementById('fiscalYearFormTitle');
  if (!panel) return;

  // Refresh company dropdown from AppState
  const select = document.getElementById('fyCompany');
  if (select) {
    select.innerHTML = AppState.companies.map(c =>
      `<option value="${c.code}">${c.name} (${c.code})</option>`
    ).join('');
  }

  panel.style.display = 'block';

  if (fiscalYearId === null) {
    // NEW mode
    title.textContent = '➕ تعریف سال مالی جدید';
    document.getElementById('editingFiscalYearId').value = '';
    document.getElementById('fyYear').value = '';
    document.getElementById('fyStartDate').value = '';
    document.getElementById('fyEndDate').value = '';
    document.getElementById('fyNotes').value = '';
    if (select && AppState.companies.length > 0) {
      select.value = AppState.companies[0].code;
    }
  } else {
    // EDIT mode
    const fy = AppState.fiscalYears.find(f => f.id === fiscalYearId);
    if (!fy) return;
    title.textContent = `✏️ ویرایش سال مالی: ${fy.year}`;
    document.getElementById('editingFiscalYearId').value = fy.id;
    document.getElementById('fyYear').value = fy.year;
    document.getElementById('fyStartDate').value = fy.startDate;
    document.getElementById('fyEndDate').value = fy.endDate;
    document.getElementById('fyNotes').value = fy.notes || '';
    if (select) select.value = fy.company;
  }

  setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  document.getElementById('fyYear').focus();
}

function closeFiscalYearForm() {
  const panel = document.getElementById('fiscalYearFormPanel');
  if (panel) panel.style.display = 'none';
}

function saveFiscalYear() {
  const editingId = document.getElementById('editingFiscalYearId')?.value;
  const year = document.getElementById('fyYear')?.value?.trim();
  const startDate = document.getElementById('fyStartDate')?.value?.trim();
  const endDate = document.getElementById('fyEndDate')?.value?.trim();
  const company = document.getElementById('fyCompany')?.value;
  const notes = document.getElementById('fyNotes')?.value?.trim();

  // Validation
  if (!year) { alert('سال مالی الزامی است.'); document.getElementById('fyYear').focus(); return; }
  if (!/^\d{4}$/.test(year)) { alert('سال مالی باید یک عدد ۴ رقمی باشد. مثال: 1404'); document.getElementById('fyYear').focus(); return; }
  if (!startDate) { alert('تاریخ شروع الزامی است.'); document.getElementById('fyStartDate').focus(); return; }
  if (!endDate) { alert('تاریخ پایان الزامی است.'); document.getElementById('fyEndDate').focus(); return; }

  if (editingId) {
    // UPDATE
    const idx = AppState.fiscalYears.findIndex(f => f.id === Number(editingId));
    if (idx !== -1) {
      AppState.fiscalYears[idx] = { ...AppState.fiscalYears[idx], year, startDate, endDate, company, notes };
      alert(`سال مالی ${year} با موفقیت بروزرسانی شد.`);
    }
  } else {
    // Check duplicate year for same company
    if (AppState.fiscalYears.find(f => f.year === year && f.company === company)) {
      alert(`سال مالی "${year}" قبلاً برای این شرکت تعریف شده است.`);
      document.getElementById('fyYear').focus();
      return;
    }
    // CREATE
    AppState.fiscalYears.push({
      id: Date.now(),
      year, startDate, endDate, company, notes,
      status: 'بسته'  // New fiscal years start as closed until activated
    });
    alert(`سال مالی ${year} با موفقیت تعریف شد.`);
  }

  closeFiscalYearForm();
  renderFiscalYearsTable();
}

function deleteFiscalYear(fyId) {
  const fy = AppState.fiscalYears.find(f => f.id === fyId);
  if (!fy) return;
  if (fy.status === 'فعال') {
    alert('امکان حذف سال مالی فعال وجود ندارد. ابتدا سال مالی دیگری را فعال کنید.');
    return;
  }
  if (confirm(`آیا از حذف سال مالی "${fy.year}" اطمینان دارید؟`)) {
    AppState.fiscalYears = AppState.fiscalYears.filter(f => f.id !== fyId);
    renderFiscalYearsTable();
    alert(`سال مالی ${fy.year} با موفقیت حذف شد.`);
  }
}

// ============================
// SWITCH COMPANY / FISCAL YEAR
// ============================

// Current session state
const SessionState = {
  company: null,   // currently active company object
  year:    null    // currently active year string
};

function renderSwitchCompanyForm() {
  const compSel = document.getElementById('switchCompany');
  if (!compSel) return;

  // Build company dropdown
  compSel.innerHTML = AppState.companies.map(c =>
    `<option value="${c.code}" ${SessionState.company && SessionState.company.code === c.code ? 'selected' : ''}>${c.name} (${c.code})</option>`
  ).join('');

  refreshSwitchYearList();
}

function refreshSwitchYearList() {
  const compSel = document.getElementById('switchCompany');
  const yearSel = document.getElementById('switchYear');
  if (!compSel || !yearSel) return;

  const selectedCode = compSel.value;
  const years = AppState.fiscalYears
    .filter(fy => fy.company === selectedCode)
    .sort((a, b) => Number(b.year) - Number(a.year));

  if (years.length === 0) {
    yearSel.innerHTML = '<option value="">-- سال مالی تعریف نشده --</option>';
  } else {
    yearSel.innerHTML = years.map(fy =>
      `<option value="${fy.year}" ${SessionState.year === fy.year ? 'selected' : ''}>${fy.year} (${fy.status})</option>`
    ).join('');
  }
}

function applyCompanySwitch() {
  const compSel = document.getElementById('switchCompany');
  const yearSel = document.getElementById('switchYear');
  if (!compSel || !yearSel) return;

  const selectedCode = compSel.value;
  const selectedYear = yearSel.value;

  if (!selectedCode) { alert('لطفاً یک شرکت انتخاب کنید.'); return; }
  if (!selectedYear) { alert('برای این شرکت هیچ سال مالی تعریف نشده است. ابتدا سال مالی اضافه کنید.'); return; }

  const company = AppState.companies.find(c => c.code === selectedCode);
  if (!company) return;

  // Update session
  SessionState.company = company;
  SessionState.year    = selectedYear;

  // Update header
  updateHeaderBar();

  // Feedback
  alert(`✅ تغییر با موفقیت اعمال شد.\n\nشرکت فعال: ${company.name}\nسال مالی فعال: ${selectedYear}`);

  // Go back to tiles
  goBack();
}

function renderSwitchYearOnlyForm() {
  const yearSel = document.getElementById('quickSwitchYear');
  const subTitle = document.getElementById('switchYearSubtitle');
  if (!yearSel) return;

  const currentComp = SessionState.company || (AppState.companies.length > 0 ? AppState.companies[0] : null);
  const compCode = currentComp ? currentComp.code : '';
  const compName = currentComp ? currentComp.name : '';

  if (subTitle) {
    subTitle.textContent = `سال مالی جاری شرکت "${compName}" را انتخاب کنید:`;
  }

  const years = AppState.fiscalYears
    .filter(fy => fy.company === compCode)
    .sort((a, b) => Number(b.year) - Number(a.year));

  if (years.length === 0) {
    yearSel.innerHTML = '<option value="">-- سال مالی تعریف نشده --</option>';
  } else {
    yearSel.innerHTML = years.map(fy =>
      `<option value="${fy.year}" ${SessionState.year === fy.year ? 'selected' : ''}>${fy.year} (${fy.status})</option>`
    ).join('');
  }
}

function applyYearOnlySwitch() {
  const yearSel = document.getElementById('quickSwitchYear');
  if (!yearSel) return;

  const selectedYear = yearSel.value;
  if (!selectedYear) {
    alert('برای این شرکت هیچ سال مالی تعریف نشده است.');
    return;
  }

  // Update session
  SessionState.year = selectedYear;

  // Update header
  updateHeaderBar();

  // Feedback
  alert(`✅ سال مالی جاری با موفقیت به "${selectedYear}" تغییر یافت.`);

  // Go back to tiles
  goBack();
}

function updateHeaderBar() {
  const company = SessionState.company;
  const year    = SessionState.year;

  // Header title bar
  const headerComp = document.getElementById('headerCompany');
  const headerYear = document.getElementById('headerYear');
  if (headerComp && company) headerComp.textContent = company.name;
  if (headerYear && year)    headerYear.textContent  = 'سال مالی: ' + year;
}

function updateSystemClock() {
  const timeEl = document.getElementById('headerTime');
  const dateEl = document.getElementById('headerDate');
  const now = new Date();
  if (timeEl) timeEl.textContent = now.toLocaleTimeString('fa-IR');
  if (dateEl && typeof PersianCal !== 'undefined') {
    dateEl.textContent = PersianCal.getTodayString();
  }
}

// ============================
// Init on page load
// ============================
document.addEventListener('DOMContentLoaded', () => {
  // On startup: show login page, focus username field
  const usernameInput = document.getElementById('loginUsername');
  if (usernameInput) setTimeout(() => usernameInput.focus(), 200);

  // Update clock & date immediately and then every second
  updateSystemClock();
  setInterval(updateSystemClock, 1000);
});

// ============================
// Global Keyboard Shortcuts
// ============================
window.addEventListener('keydown', (e) => {
  const loginOverlay = document.getElementById('loginOverlay');
  if (loginOverlay && loginOverlay.style.display !== 'none') {
    return; // Do not open if still at login screen
  }

  // Alt + A (KeyA / ش): Switch Company & Year Form
  const isAKey = e.code === 'KeyA' || e.key === 'a' || e.key === 'A' || e.key === 'ش';
  if (e.altKey && isAKey) {
    e.preventDefault();
    e.stopPropagation();
    const systemTab = document.querySelector('.ribbon-tab[onclick*="system"]');
    if (systemTab) switchRibbon('system', systemTab);
    showForm('form-switch-company');
    return;
  }

  // Alt + S (KeyS / س): Quick Switch Year Form
  const isSKey = e.code === 'KeyS' || e.key === 's' || e.key === 'S' || e.key === 'س';
  if (e.altKey && isSKey) {
    e.preventDefault();
    e.stopPropagation();
    const systemTab = document.querySelector('.ribbon-tab[onclick*="system"]');
    if (systemTab) switchRibbon('system', systemTab);
    showForm('form-switch-year');
    return;
  }
}, true);




