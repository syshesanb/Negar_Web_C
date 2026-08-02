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
  isTabMode: false,          // opened via direct tab routing (hides top nav bar)
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
    { id: 1, code: '01', name: 'دارایی‌های جاری', type: 'گروه', nature: 'بدهکار', parentId: null },
    { id: 2, code: '0110', name: 'موجودی نقد و بانک', type: 'کل', nature: 'بدهکار', parentId: 1 },
    { id: 3, code: '011001', name: 'صندوق مرکزی', type: 'معین', nature: 'بدهکار', parentId: 2 },
    { id: 4, code: '011002', name: 'بانک ملی شعبه مرکزی', type: 'معین', nature: 'بدهکار', parentId: 2 },
    { id: 14, code: '011003', name: 'بانک ملت شعبه ۲۲', type: 'معین', nature: 'بدهکار', parentId: 2 },
    { id: 5, code: '0111', name: 'حساب‌های دریافتنی', type: 'کل', nature: 'بدهکار', parentId: 1 },
    { id: 6, code: '011101', name: 'مشتریان تجاری', type: 'معین', nature: 'بدهکار', parentId: 5 },
    { id: 7, code: '02', name: 'بدهی‌های جاری', type: 'گروه', nature: 'بستانکار', parentId: null },
    { id: 8, code: '0220', name: 'حساب‌های پرداختنی', type: 'کل', nature: 'بستانکار', parentId: 7 },
    { id: 9, code: '022001', name: 'تامین‌کنندگان', type: 'معین', nature: 'بستانکار', parentId: 8 },
    { id: 10, code: '04', name: 'درآمدها', type: 'گروه', nature: 'بستانکار', parentId: null },
    { id: 11, code: '0440', name: 'فروش کالا', type: 'کل', nature: 'بستانکار', parentId: 10 },
    { id: 12, code: '05', name: 'هزینه‌ها', type: 'گروه', nature: 'بدهکار', parentId: null },
    { id: 13, code: '0550', name: 'هزینه اداری', type: 'کل', nature: 'بدهکار', parentId: 12 },
  ],
  shenavars: [
    { id: 1, code: 'SH-101', name: 'پروژه احداث شعبه غرب', parentId: null, status: 'فعال' },
    { id: 2, code: 'SH-102', name: 'مرکز هزینه کارخانه ۱', parentId: null, status: 'فعال' },
    { id: 3, code: 'SH-101-01', name: 'فاز ۱ سازه بتنی', parentId: 1, status: 'فعال' },
    { id: 4, code: 'SH-101-02', name: 'فاز ۲ محوطه‌سازی', parentId: 1, status: 'فعال' }
  ],
  bakhsh: [
    { id: 1, code: 1, name: 'حسابداری' },
    { id: 2, code: 2, name: 'خرید و فروش' },
    { id: 3, code: 3, name: 'انبارداری' },
    { id: 4, code: 4, name: 'حقوق و دستمزد' },
    { id: 5, code: 5, name: 'خزانه‌داری' },
    { id: 6, code: 6, name: 'بودجه و هزینه' },
    { id: 7, code: 7, name: 'اموال' }
  ],
  sanads: [
    { id: 101, date: '1403/01/05', desc: 'سند افتتاحیه سال مالی', debit: 5000000000, credit: 5000000000, status: 'دائم', bakhshId: 1 },
    { id: 102, date: '1403/05/10', desc: 'فاکتور فروش فروشگاه مرکزی', debit: 125000000, credit: 125000000, status: 'تایید شده', bakhshId: 2 }
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
  // If we are in the main dashboard tab (not inside a sub-tab)
  if (!AppState.isTabMode) {
    // Open in a new tab!
    const url = `index.html?form=${formId}`;
    window.open(url, '_blank');
    return;
  }

  AppState.currentForm = formId;

  // Hide all tile containers
  document.querySelectorAll('.tiles-container').forEach(t => {
    t.classList.remove('active');
    t.style.display = 'none';
  });

  // Show forms area
  const formsArea = document.getElementById('formsArea');
  formsArea.style.display = 'block';

  // Hide back-bar when in voucher editor (form-sanad2)
  const backBar = document.querySelector('.back-bar');
  if (backBar) {
    if (formId === 'form-sanad2') {
      backBar.style.display = 'none';
    } else {
      backBar.style.display = 'flex';
    }
  }

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

  // Toggle body scroll for form-sanad2
  if (formId === 'form-sanad2') {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
  } else {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.height = '';
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
  if (!AppState.isTabMode) {
    window.open(`index.html?form=form-hesabdari-main&mode=${mode}`, '_blank');
    return;
  }
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
  if (AppState.isTabMode) {
    window.close();
    return;
  }
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
function sortTreePreOrder(list) {
  const result = [];
  
  function traverse(parentId) {
    const children = list.filter(item => item.parentId === parentId);
    
    // Sort children alphabetically/numerically by code
    children.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' }));
    
    for (const child of children) {
      result.push(child);
      traverse(child.id);
    }
  }
  
  traverse(null);
  return result;
}

// Set of expanded account IDs for treeview datagrid
const expandedAccountIds = new Set();
let currentParentIdForNewAccount = null;

function toggleAccountExpand(accId) {
  if (expandedAccountIds.has(accId)) {
    expandedAccountIds.delete(accId);
  } else {
    expandedAccountIds.add(accId);
  }
  renderAccountsTable();
}

function handleTreeButtonClick(accId) {
  const account = AppState.accounts.find(a => a.id === accId);
  if (!account) return;

  // Set the clicked row as the active selected parent row
  currentParentIdForNewAccount = accId;

  const hasChildren = AppState.accounts.some(child => child.parentId === account.id);
  if (hasChildren) {
    // Normal expand/collapse toggle
    toggleAccountExpand(accId);
  } else {
    // No children: Prompt to create a child account
    const nextLevelMap = {
      'گروه': 'کل',
      'کل': 'معین',
      'معین': 'تفصیلی',
      'تفصیلی': 'تفصیلی'
    };
    const parentLevel = account.type;
    const childLevel = nextLevelMap[parentLevel] || 'تفصیلی';
    
    const msg = `تا کنون برای این سرفصل "${parentLevel}" ، حساب "${childLevel}" ، ایجاد نشده است ، آیا مایلید برای آن حساب "${childLevel}" ایجاد کنید؟`;
    if (confirm(msg)) {
      openAddAccountRow();
    } else {
      // Clear selection if cancelled
      currentParentIdForNewAccount = null;
      renderAccountsTable();
    }
  }
}

function getAccountLevel(a) {
  let level = 0;
  let curr = a;
  let visited = new Set();
  while (curr && curr.parentId && !visited.has(curr.id)) {
    visited.add(curr.id);
    curr = AppState.accounts.find(x => x.id === curr.parentId);
    if (curr) level++;
    else break;
  }
  return level;
}

function isAccountVisible(a) {
  let curr = a;
  let visited = new Set();
  while (curr && curr.parentId && !visited.has(curr.id)) {
    visited.add(curr.id);
    if (!expandedAccountIds.has(curr.parentId)) return false;
    curr = AppState.accounts.find(x => x.id === curr.parentId);
  }
  return true;
}

function renderAccountsTable() {
  const tbody = document.getElementById('accountsTableBody');
  if (!tbody) return;

  const sortedAccounts = sortTreePreOrder(AppState.accounts);
  const visibleAccounts = sortedAccounts.filter(isAccountVisible);

  tbody.innerHTML = visibleAccounts.map(a => {
    const level = getAccountLevel(a);
    const hasChildren = AppState.accounts.some(child => child.parentId === a.id);
    const isExpanded = expandedAccountIds.has(a.id);
    const isSelected = (a.id === currentParentIdForNewAccount);
    const selectedClass = isSelected ? 'selected-parent-row' : '';

    // Show tree toggle button for all rows
    const toggleBtnHtml = hasChildren
      ? `<button class="tree-toggle-btn ${isExpanded ? 'expanded' : ''}" onclick="handleTreeButtonClick(${a.id})">${isExpanded ? '-' : '+'}</button>`
      : `<button class="tree-toggle-btn" onclick="handleTreeButtonClick(${a.id})">+</button>`;

    const indentPx = level * 22;

    return `
      <tr class="tree-level-${Math.min(level, 3)} ${selectedClass}">
        <td style="text-align:center;vertical-align:middle;">${toggleBtnHtml}</td>
        <td><b>${a.code}</b></td>
        <td style="padding-right:${indentPx + 10}px;">
          ${level > 0 ? '<span style="color:var(--accent-color);margin-left:6px;">└─</span>' : ''}
          <b>${a.name}</b>
        </td>
        <td><span class="badge badge-primary">${a.type}</span></td>
        <td>${a.nature}</td>
        <td><span class="badge badge-success">فعال</span></td>
        <td>
          <button class="btn btn-outline" style="padding:3px 8px;">✏️ ویرایش</button>
          <button class="btn btn-outline" style="padding:3px 8px;color:red;" onclick="deleteAccount(${a.id})">🗑️ حذف</button>
        </td>
      </tr>
    `;
  }).join('');
}

function suggestNextAccountCode(type, parentId) {
  // Find sibling accounts under the same parent
  const siblings = AppState.accounts.filter(a => a.type === type && a.parentId === parentId);
  if (siblings.length > 0) {
    const codes = siblings.map(s => parseInt(s.code, 10)).filter(num => !isNaN(num));
    if (codes.length > 0) {
      const maxCodeVal = Math.max(...codes);
      const nextVal = maxCodeVal + 1;
      
      const sampleCode = siblings[0].code;
      return String(nextVal).padStart(sampleCode.length, '0');
    }
  }
  
  // If no siblings exist, construct the starting code based on type/parent
  if (type === 'گروه') {
    const rootGroups = AppState.accounts.filter(a => a.parentId === null);
    if (rootGroups.length > 0) {
      const codes = rootGroups.map(s => parseInt(s.code, 10)).filter(num => !isNaN(num));
      const maxCodeVal = Math.max(...codes);
      return String(maxCodeVal + 1).padStart(2, '0');
    }
    return '01';
  }
  
  if (parentId) {
    const parent = AppState.accounts.find(a => a.id === parentId);
    if (parent) {
      if (type === 'کل') return parent.code + '10'; // e.g. '01' -> '0110'
      if (type === 'معین') return parent.code + '01'; // e.g. '0110' -> '011001'
      if (type === 'تفصیلی') return parent.code + '01'; // e.g. '011001' -> '01100101'
    }
  }
  return '';
}

function openAddAccountRow() {
  const selectType = document.getElementById('newAccType');
  const selectParent = document.getElementById('newAccParentId');
  const inputCode = document.getElementById('newAccCode');
  
  let targetType = 'گروه';
  let targetParentId = null;
  
  if (currentParentIdForNewAccount !== null) {
    const parentAcc = AppState.accounts.find(a => a.id === currentParentIdForNewAccount);
    if (parentAcc) {
      targetParentId = parentAcc.id;
      const nextLevelMap = {
        'گروه': 'کل',
        'کل': 'معین',
        'معین': 'تفصیلی',
        'تفصیلی': 'تفصیلی'
      };
      targetType = nextLevelMap[parentAcc.type] || 'تفصیلی';
    }
  }
  
  if (selectType) selectType.value = targetType;
  if (selectParent) {
    selectParent.innerHTML = `<option value="${targetParentId || ''}">${targetParentId ? targetParentId : 'بدون والد'}</option>`;
    selectParent.value = targetParentId || '';
  }
  
  if (inputCode) {
    inputCode.value = suggestNextAccountCode(targetType, targetParentId);
  }
  
  // Dynamically update the inline form heading with reset option if a parent is selected
  const heading = document.querySelector('#addAccountRow h4');
  if (heading) {
    if (currentParentIdForNewAccount !== null) {
      const parentAcc = AppState.accounts.find(a => a.id === currentParentIdForNewAccount);
      const parentName = parentAcc ? parentAcc.name : '';
      heading.innerHTML = `افزودن حساب جدید <span style="font-size:0.85rem;color:var(--accent-color);font-weight:normal;margin-right:6px;">(به عنوان فرزندِ "${parentName}")</span> 
        <button class="btn btn-outline" style="padding:2px 8px;font-size:0.75rem;margin-right:12px;color:var(--text-muted);border-color:rgba(255,255,255,0.15);" onclick="resetParentSelectionForNewAccount(event)">🔄 ایجاد به عنوان حساب اصلی (گروه)</button>`;
    } else {
      heading.innerHTML = `افزودن حساب جدید <span style="font-size:0.85rem;color:var(--text-muted);font-weight:normal;margin-right:6px;">(به عنوان حساب اصلی / گروه)</span>`;
    }
  }

  // Highlight the table to show current selection
  renderAccountsTable();

  document.getElementById('addAccountRow').style.display = 'block';
  document.getElementById('newAccName').focus();
}

function resetParentSelectionForNewAccount(e) {
  if (e) e.preventDefault();
  currentParentIdForNewAccount = null;
  openAddAccountRow();
}

function saveNewAccount() {
  const code = document.getElementById('newAccCode')?.value?.trim();
  const name = document.getElementById('newAccName')?.value?.trim();
  const type = document.getElementById('newAccType')?.value;
  const nature = document.getElementById('newAccNature')?.value;
  const parentVal = document.getElementById('newAccParentId')?.value;
  const parentId = parentVal ? Number(parentVal) : null;

  if (!code || !name) { alert('کد حساب و عنوان الزامی است.'); return; }
  if (AppState.accounts.find(a => a.code === code)) { alert('این کد حساب قبلاً ثبت شده است.'); return; }

  AppState.accounts.push({ id: Date.now(), code, name, type, nature, parentId });
  document.getElementById('newAccCode').value = '';
  document.getElementById('newAccName').value = '';
  document.getElementById('addAccountRow').style.display = 'none';
  
  // Auto-expand parent so the new child is visible
  if (parentId) {
    expandedAccountIds.add(parentId);
  }
  
  // Clear selection after save
  currentParentIdForNewAccount = null;

  renderAccountsTable();
  alert(`حساب "${code} - ${name}" با موفقیت ثبت شد.`);
}

function deleteAccount(id) {
  if (confirm('آیا از حذف این حساب اطمینان دارید؟')) {
    AppState.accounts = AppState.accounts.filter(a => a.id !== id);
    renderAccountsTable();
  }
}

// Set of expanded floating account IDs
const expandedShenavarIds = new Set();
let currentShenavarParentIdForNewAccount = null;

function toggleShenavarExpand(shenId) {
  if (expandedShenavarIds.has(shenId)) {
    expandedShenavarIds.delete(shenId);
  } else {
    expandedShenavarIds.add(shenId);
  }
  renderShenavaarTable();
}

function handleShenavarTreeButtonClick(shenId) {
  const s = AppState.shenavars.find(x => x.id === shenId);
  if (!s) return;

  // Set the clicked row as the active selected parent row for floating account creation
  currentShenavarParentIdForNewAccount = shenId;

  const hasChildren = AppState.shenavars.some(child => child.parentId === s.id);
  if (hasChildren) {
    // Normal expand/collapse toggle
    toggleShenavarExpand(shenId);
  } else {
    // No children: Prompt to create a child floating account
    const parentLevelText = s.parentId ? 'فرعی' : 'اصلی';
    const childLevelText = s.parentId ? 'زیرمجموعه' : 'فرعی';

    const msg = `تا کنون برای این سرفصل شناور "${parentLevelText}" ، حساب شناور "${childLevelText}" ، ایجاد نشده است ، آیا مایلید برای آن حساب شناور "${childLevelText}" ایجاد کنید؟`;
    if (confirm(msg)) {
      openAddShenavarRow();
    } else {
      // Clear selection if cancelled
      currentShenavarParentIdForNewAccount = null;
      renderShenavaarTable();
    }
  }
}

function getShenavarLevel(s) {
  let level = 0;
  let curr = s;
  let visited = new Set();
  while (curr && curr.parentId && !visited.has(curr.id)) {
    visited.add(curr.id);
    curr = AppState.shenavars.find(x => x.id === curr.parentId);
    if (curr) level++;
    else break;
  }
  return level;
}

function isShenavarVisible(s) {
  let curr = s;
  let visited = new Set();
  while (curr && curr.parentId && !visited.has(curr.id)) {
    visited.add(curr.id);
    if (!expandedShenavarIds.has(curr.parentId)) return false;
    curr = AppState.shenavars.find(x => x.id === curr.parentId);
  }
  return true;
}

function renderShenavaarTable() {
  const tbody = document.getElementById('shenavaarTableBody');
  if (!tbody) return;

  const sortedShenavars = sortTreePreOrder(AppState.shenavars);
  const visibleShenavars = sortedShenavars.filter(isShenavarVisible);

  tbody.innerHTML = visibleShenavars.map(s => {
    const level = getShenavarLevel(s);
    const hasChildren = AppState.shenavars.some(child => child.parentId === s.id);
    const isExpanded = expandedShenavarIds.has(s.id);
    const isSelected = (s.id === currentShenavarParentIdForNewAccount);
    const selectedClass = isSelected ? 'selected-parent-row' : '';

    // Show tree toggle button for all rows (even those without children)
    const toggleBtnHtml = hasChildren
      ? `<button class="tree-toggle-btn ${isExpanded ? 'expanded' : ''}" onclick="handleShenavarTreeButtonClick(${s.id})">${isExpanded ? '-' : '+'}</button>`
      : `<button class="tree-toggle-btn" onclick="handleShenavarTreeButtonClick(${s.id})">+</button>`;

    const indentPx = level * 22;

    return `
      <tr class="tree-level-${Math.min(level, 3)} ${selectedClass}">
        <td style="text-align:center;vertical-align:middle;">${toggleBtnHtml}</td>
        <td><b>${s.code}</b></td>
        <td style="padding-right:${indentPx + 10}px;">
          ${level > 0 ? '<span style="color:var(--accent-color);margin-left:6px;">└─</span>' : ''}
          <b>${s.name}</b>
        </td>
        <td><span class="badge badge-success">${s.status}</span></td>
        <td>
          <button class="btn btn-outline" style="padding:3px 8px;">✏️</button>
          <button class="btn btn-outline" style="padding:3px 8px;color:red;" onclick="deleteShenavar(${s.id})">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

function suggestNextShenavarCode(parentId) {
  const siblings = AppState.shenavars.filter(s => s.parentId === parentId);
  if (siblings.length > 0) {
    const codes = siblings.map(s => {
      const parts = s.code.split('-');
      const lastPart = parts[parts.length - 1];
      return parseInt(lastPart, 10);
    }).filter(num => !isNaN(num));
    
    if (codes.length > 0) {
      const maxVal = Math.max(...codes);
      const nextVal = maxVal + 1;
      
      const sampleCode = siblings[0].code;
      const sampleParts = sampleCode.split('-');
      const lastPart = sampleParts[sampleParts.length - 1];
      
      const prefixParts = sampleParts.slice(0, -1);
      const formattedLast = String(nextVal).padStart(lastPart.length, '0');
      return [...prefixParts, formattedLast].join('-');
    }
  }
  
  if (parentId) {
    const parent = AppState.shenavars.find(s => s.id === parentId);
    if (parent) {
      return parent.code + '-01'; // e.g. 'SH-101' -> 'SH-101-01'
    }
  }
  
  // Default root level code calculation
  const roots = AppState.shenavars.filter(s => s.parentId === null);
  if (roots.length > 0) {
    const codes = roots.map(s => {
      const parts = s.code.split('-');
      return parseInt(parts[parts.length - 1], 10);
    }).filter(num => !isNaN(num));
    const maxVal = Math.max(...codes);
    return 'SH-' + (maxVal + 1);
  }
  return 'SH-101';
}

function openAddShenavarRow() {
  const selectParent = document.getElementById('newShenParentId');
  const inputCode = document.getElementById('newShenCode');
  
  let targetParentId = null;
  
  if (currentShenavarParentIdForNewAccount !== null) {
    const parentShen = AppState.shenavars.find(s => s.id === currentShenavarParentIdForNewAccount);
    if (parentShen) {
      targetParentId = parentShen.id;
    }
  }
  
  if (selectParent) {
    selectParent.innerHTML = `<option value="${targetParentId || ''}">${targetParentId ? targetParentId : 'بدون والد'}</option>`;
    selectParent.value = targetParentId || '';
  }
  
  if (inputCode) {
    inputCode.value = suggestNextShenavarCode(targetParentId);
  }
  
  // Dynamically update the floating account form heading with reset option
  const heading = document.querySelector('#addShenavarRow h4');
  if (heading) {
    if (currentShenavarParentIdForNewAccount !== null) {
      const parentShen = AppState.shenavars.find(s => s.id === currentShenavarParentIdForNewAccount);
      const parentName = parentShen ? parentShen.name : '';
      heading.innerHTML = `افزودن حساب شناور جدید <span style="font-size:0.85rem;color:var(--accent-color);font-weight:normal;margin-right:6px;">(به عنوان فرزندِ "${parentName}")</span> 
        <button class="btn btn-outline" style="padding:2px 8px;font-size:0.75rem;margin-right:12px;color:var(--text-muted);border-color:rgba(255,255,255,0.15);" onclick="resetShenavarParentSelectionForNewAccount(event)">🔄 ایجاد به عنوان شناور اصلی</button>`;
    } else {
      heading.innerHTML = `افزودن حساب شناور جدید <span style="font-size:0.85rem;color:var(--text-muted);font-weight:normal;margin-right:6px;">(به عنوان شناور اصلی)</span>`;
    }
  }

  // Highlight the table to show current selection
  renderShenavaarTable();

  document.getElementById('addShenavarRow').style.display = 'block';
  document.getElementById('newShenName').focus();
}

function resetShenavarParentSelectionForNewAccount(e) {
  if (e) e.preventDefault();
  currentShenavarParentIdForNewAccount = null;
  openAddShenavarRow();
}

function saveNewShenavar() {
  const code = document.getElementById('newShenCode')?.value?.trim();
  const name = document.getElementById('newShenName')?.value?.trim();
  const parentVal = document.getElementById('newShenParentId')?.value;
  const parentId = parentVal ? Number(parentVal) : null;

  if (!code || !name) { alert('کد و عنوان شناور الزامی است.'); return; }
  if (AppState.shenavars.find(s => s.code === code)) { alert('این کد شناور قبلاً ثبت شده است.'); return; }

  AppState.shenavars.push({ id: Date.now(), code, name, parentId, status: 'فعال' });
  document.getElementById('newShenCode').value = '';
  document.getElementById('newShenName').value = '';
  document.getElementById('addShenavarRow').style.display = 'none';
  
  // Auto-expand parent so the new child is visible
  if (parentId) {
    expandedShenavarIds.add(parentId);
  }
  
  // Clear selection after save
  currentShenavarParentIdForNewAccount = null;

  renderShenavaarTable();
  alert(`حساب شناور "${code} - ${name}" ثبت شد.`);
}

function deleteShenavar(id) {
  if (confirm('حذف این حساب شناور؟')) {
    AppState.shenavars = AppState.shenavars.filter(s => s.id !== id);
    renderShenavaarTable();
  }
}

// Sanad 1 (list)
let selectedSanadId = null;

function getCurrentBakhshId() {
  const mapping = {
    'accounting': 1,
    'purchase-sales': 2,
    'inventory': 3,
    'payroll': 4,
    'treasury': 5,
    'budget': 6
  };
  return mapping[AppState.currentModule] || 1;
}

function selectSanadRow(id) {
  selectedSanadId = id;
  renderSanadListTable();
}

function renderSanadListTable() {
  const tbody = document.getElementById('sanadListTable');
  if (!tbody) return;
  tbody.innerHTML = AppState.sanads.map(s => {
    const isSelected = (s.id === selectedSanadId);
    const selectedClass = isSelected ? 'selected-parent-row' : '';
    const bakhshObj = AppState.bakhsh.find(b => b.id === s.bakhshId);
    const bakhshName = bakhshObj ? bakhshObj.name : 'حسابداری';

    return `
      <tr class="${selectedClass}" onclick="selectSanadRow(${s.id})" style="cursor:pointer;">
        <td><b>#${s.id}</b></td>
        <td>${s.date}</td>
        <td>${s.desc}</td>
        <td>${s.debit.toLocaleString()}</td>
        <td>${s.credit.toLocaleString()}</td>
        <td><span class="badge badge-success">متوازن ✅</span></td>
        <td><span class="badge" style="background:rgba(168,85,247,0.15);color:#c084fc;border:1px solid rgba(168,85,247,0.3);font-weight:bold;">${bakhshName}</span></td>
        <td><span class="badge badge-primary">${s.status}</span></td>
        <td>
          <button class="btn btn-outline" style="padding:3px 8px;" onclick="event.stopPropagation(); editSanad(${s.id})">✏️ ویرایش</button>
          <button class="btn btn-outline" style="padding:3px 8px;color:red;" onclick="event.stopPropagation(); deleteSanad(${s.id})">🗑️ حذف</button>
        </td>
      </tr>
    `;
  }).join('');
}

function deleteSanad(id) {
  const s = AppState.sanads.find(x => x.id === id);
  if (s && s.bakhshId && s.bakhshId !== getCurrentBakhshId()) {
    const creatorBakhsh = AppState.bakhsh.find(b => b.id === s.bakhshId);
    const bName = creatorBakhsh ? creatorBakhsh.name : 'بخش دیگر';
    alert(`این سند به‌طور خودکار توسط بخش «${bName}» صادر شده است و ویرایش یا حذف آن فقط از طریق همان بخش مجاز می‌باشد تا در زنجیره اطلاعات خطایی پیش نیاد.`);
    return;
  }
  if (confirm(`حذف سند #${id}؟`)) {
    AppState.sanads = AppState.sanads.filter(s => s.id !== id);
    if (selectedSanadId === id) selectedSanadId = null;
    renderSanadListTable();
  }
}

function editSanad(id) {
  const s = AppState.sanads.find(x => x.id === id);
  if (s && s.bakhshId && s.bakhshId !== getCurrentBakhshId()) {
    const creatorBakhsh = AppState.bakhsh.find(b => b.id === s.bakhshId);
    const bName = creatorBakhsh ? creatorBakhsh.name : 'بخش دیگر';
    alert(`این سند به‌طور خودکار توسط بخش «${bName}» صادر شده است و ویرایش یا حذف آن فقط از طریق همان بخش مجاز می‌باشد تا در زنجیره اطلاعات خطایی پیش نیاد.`);
    return;
  }
  showForm('form-sanad2');
  document.getElementById('sanadNumberInput').value = id;
  document.getElementById('sanadNumberInput').readOnly = true; // Protect voucher number during edit
  document.getElementById('sanadDateInput').value = s.date;
  document.getElementById('sanadDescInput').value = s.desc;

  // Render lines with the voucher's values
  AppState.sanadLines = [
    { account: '011001', desc: `آرتیکل بدهکار - بابت ${s.desc}`, debit: s.debit, credit: 0 },
    { account: '022001', desc: `آرتیکل بستانکار - بابت ${s.desc}`, debit: 0, credit: s.credit }
  ];
  renderSanadEditorLines();
}

function printVouchers() {
  if (!selectedSanadId) {
    alert('لطفاً ابتدا یک سند را از جدول انتخاب (کلیک) کنید.');
    return;
  }
  const s = AppState.sanads.find(x => x.id === selectedSanadId);
  if (!s) return;

  const printWindow = window.open('', '_blank');
  // Use dummy/default lines if no specific ones exist for this draft
  const linesHtml = AppState.sanadLines.map((line, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${line.account}</td>
      <td>حساب معین ${line.account}</td>
      <td>${line.desc}</td>
      <td style="text-align:left;">${line.debit.toLocaleString()}</td>
      <td style="text-align:left;">${line.credit.toLocaleString()}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <html dir="rtl">
    <head>
      <title>چاپ سند حسابداری #${s.id}</title>
      <style>
        body { font-family: Tahoma, Arial, sans-serif; padding: 20px; color: #000; background: #fff; font-size: 12px; }
        .header-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
        .header-table td { border: none; padding: 4px; }
        .voucher-title { font-size: 16px; font-weight: bold; text-align: center; margin: 10px 0; }
        .main-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .main-table th, .main-table td { border: 1px solid #000; padding: 8px; text-align: right; }
        .main-table th { background-color: #f2f2f2; }
        .signatures { display: flex; justify-content: space-between; margin-top: 60px; padding: 0 20px; }
        .sig-box { text-align: center; width: 20%; border-top: 1px dashed #000; padding-top: 8px; }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: left;">
        <button onclick="window.print()" style="padding: 8px 16px; font-size: 14px; cursor: pointer;">🖨️ چاپ سند</button>
      </div>
      <table class="header-table">
        <tr>
          <td style="width: 33%;"><b>شرکت:</b> شرکت نمونه نگار</td>
          <td style="width: 33%; text-align: center;"><div class="voucher-title">سند حسابداری (Voucher)</div></td>
          <td style="width: 33%; text-align: left;"><b>شماره سند:</b> #${s.id}<br><b>تاریخ سند:</b> ${s.date}</td>
        </tr>
        <tr>
          <td colspan="3"><b>شرح کلی سند:</b> ${s.desc}</td>
        </tr>
      </table>
      <table class="main-table">
        <thead>
          <tr>
            <th style="width: 5%;">ردیف</th>
            <th style="width: 15%;">کد معین/تفصیلی</th>
            <th style="width: 25%;">عنوان حساب</th>
            <th style="width: 35%;">شرح ردیف</th>
            <th style="width: 10%;">بدهکار (ریال)</th>
            <th style="width: 10%;">بستانکار (ریال)</th>
          </tr>
        </thead>
        <tbody>
          ${linesHtml}
          <tr style="font-weight: bold; background-color: #f9f9f9;">
            <td colspan="4" style="text-align: left;">جمع کل:</td>
            <td style="text-align: left;">${s.debit.toLocaleString()}</td>
            <td style="text-align: left;">${s.credit.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      <div class="signatures">
        <div class="sig-box">تنظیم کننده</div>
        <div class="sig-box">تایید کننده</div>
        <div class="sig-box">مدیر مالی</div>
        <div class="sig-box">مدیر عامل</div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
}

function printJournalLedger() {
  const printWindow = window.open('', '_blank');
  let totalDebit = 0;
  let totalCredit = 0;

  const rowsHtml = AppState.sanads.map((s, idx) => {
    totalDebit += s.debit;
    totalCredit += s.credit;
    return `
      <tr>
        <td>${idx + 1}</td>
        <td>#${s.id}</td>
        <td>${s.date}</td>
        <td>${s.desc}</td>
        <td style="text-align:left;">${s.debit.toLocaleString()}</td>
        <td style="text-align:left;">${s.credit.toLocaleString()}</td>
        <td>${s.status}</td>
      </tr>
    `;
  }).join('');

  printWindow.document.write(`
    <html dir="rtl">
    <head>
      <title>چاپ دفتر روزنامه</title>
      <style>
        body { font-family: Tahoma, Arial, sans-serif; padding: 20px; color: #000; background: #fff; font-size: 12px; }
        .title { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 20px; }
        .main-table { width: 100%; border-collapse: collapse; }
        .main-table th, .main-table td { border: 1px solid #000; padding: 8px; text-align: right; }
        .main-table th { background-color: #f2f2f2; }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: left;">
        <button onclick="window.print()" style="padding: 8px 16px; font-size: 14px; cursor: pointer;">🖨️ چاپ دفتر روزنامه</button>
      </div>
      <div class="title">دفتر روزنامه اسناد حسابداری - شرکت نمونه نگار</div>
      <table class="main-table">
        <thead>
          <tr>
            <th style="width: 5%;">ردیف</th>
            <th style="width: 10%;">شماره سند</th>
            <th style="width: 15%;">تاریخ</th>
            <th style="width: 40%;">شرح سند</th>
            <th style="width: 10%;">جمع بدهکار (ریال)</th>
            <th style="width: 10%;">جمع بستانکار (ریال)</th>
            <th style="width: 10%;">وضعیت</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr style="font-weight: bold; background-color: #f2f2f2;">
            <td colspan="4" style="text-align: left;">جمع کل دفتر:</td>
            <td style="text-align: left;">${totalDebit.toLocaleString()}</td>
            <td style="text-align: left;">${totalCredit.toLocaleString()}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `);
  printWindow.document.close();
}

function copyActiveVoucher() {
  if (!selectedSanadId) {
    alert('لطفاً ابتدا یک سند را از جدول انتخاب (کلیک) کنید.');
    return;
  }
  const source = AppState.sanads.find(x => x.id === selectedSanadId);
  if (!source) return;

  if (confirm(`آیا مایلید سند #${source.id} را کپی کنید؟`)) {
    const newId = Math.max(...AppState.sanads.map(s => s.id)) + 1;
    const todayStr = (PersianCal && typeof PersianCal.getTodayString === 'function') 
      ? PersianCal.getTodayString() 
      : '1403/05/11';

    const newVoucher = {
      id: newId,
      date: todayStr,
      desc: `کپی از سند #${source.id} - ${source.desc}`,
      debit: source.debit,
      credit: source.credit,
      status: 'موقت'
    };

    AppState.sanads.push(newVoucher);
    selectedSanadId = newId; // Select the copied one
    renderSanadListTable();
    alert(`سند #${source.id} با موفقیت به سند جدید #${newId} کپی گردید.`);
  }
}

// Sanad 2 (editor)
let focusedLineIndex = 0;

function updateFocusedPaths(i) {
  focusedLineIndex = i;
  
  // Dynamic visual row selection highlight
  const rows = document.querySelectorAll('#sanadLinesEditorBody tr');
  rows.forEach((row, idx) => {
    if (idx === i) {
      row.classList.add('focused-row');
    } else {
      row.classList.remove('focused-row');
    }
  });

  const line = AppState.sanadLines[i];
  if (!line) return;
  
  // Find selected account path
  const acc = AppState.accounts.find(a => a.code === line.account);
  let accPath = 'کد و نام حساب سرفصل ردیف جاری: <span style="color:var(--text-muted); font-weight:normal;">-</span>';
  if (acc) {
    const pathParts = [];
    let curr = acc;
    while (curr) {
      pathParts.unshift(`${curr.code} : ${curr.name}`);
      curr = curr.parentId ? AppState.accounts.find(x => x.id === curr.parentId) : null;
    }
    accPath = `کد و نام حساب سرفصل ردیف جاری: <span style="color:var(--accent-color); font-weight:bold;">${pathParts.join(' / ')}</span>`;
  }
  
  // Find selected shenavar path
  const shen = AppState.shenavars.find(s => s.code === line.shenavarCode);
  let shenPath = 'کد و نام حساب شناور ردیف جاری: <span style="color:var(--text-muted); font-weight:normal;">بدون شناور</span>';
  if (shen) {
    const pathParts = [];
    let curr = shen;
    while (curr) {
      pathParts.unshift(`${curr.code} : ${curr.name}`);
      curr = curr.parentId ? AppState.shenavars.find(x => x.id === curr.parentId) : null;
    }
    shenPath = `کد و نام حساب شناور ردیف جاری: <span style="color:var(--accent-color); font-weight:bold;">${pathParts.join(' / ')}</span>`;
  }
  
  const accEl = document.getElementById('focusedAccountPath');
  const shenEl = document.getElementById('focusedShenavarPath');
  const lineDescEl = document.getElementById('focusedLineDesc');
  if (accEl) accEl.innerHTML = accPath;
  if (shenEl) shenEl.innerHTML = shenPath;
  if (lineDescEl) {
    lineDescEl.innerHTML = `متن کامل شرح ردیف جاری: <span style="color:var(--accent-color); font-weight:bold;">${line.desc || '-'}</span>`;
  }
}

function updateSanadLineField(i, field, value) {
  if (!AppState.sanadLines[i]) return;
  if (field === 'debit' || field === 'credit') {
    AppState.sanadLines[i][field] = Number(value || 0);
    updateSanadTotals();
  } else {
    AppState.sanadLines[i][field] = value;
  }
  if (field === 'account' || field === 'shenavarCode') {
    updateFocusedPaths(i);
  }
  if (field === 'desc') {
    const lineDescEl = document.getElementById('focusedLineDesc');
    if (lineDescEl) {
      lineDescEl.innerHTML = `متن کامل شرح ردیف جاری: <span style="color:var(--accent-color); font-weight:bold;">${value || '-'}</span>`;
    }
  }
}

function formatAmount(val) {
  if (val === undefined || val === null || val === '') return '0';
  const clean = val.toString().replace(/,/g, '');
  const num = Number(clean);
  if (isNaN(num)) return '0';
  return num === 0 ? '0' : num.toLocaleString('en-US');
}

function handleAmountInput(input, index, field) {
  let selectionStart = input.selectionStart;
  let originalLen = input.value.length;
  
  // Strip all non-digit characters
  let clean = input.value.replace(/[^0-9]/g, '');
  const num = clean === '' ? 0 : Number(clean);
  
  AppState.sanadLines[index][field] = num;
  updateSanadTotals();
  
  // Formatted value
  const formatted = num === 0 ? '0' : num.toLocaleString('en-US');
  input.value = formatted;
  
  // Restore cursor position
  let newLen = formatted.length;
  let diff = newLen - originalLen;
  let newCursor = selectionStart + diff;
  input.setSelectionRange(newCursor, newCursor);
}

function matchAmount(val, filterText) {
  filterText = filterText.replace(/,/g, '').trim();
  if (filterText.length === 0) return true;
  
  const ch = filterText[0];
  if (ch === '*') {
    const searchStr = filterText.slice(1);
    if (searchStr.length === 0) return true;
    return String(Math.floor(val)).includes(searchStr);
  } else if (ch === '<') {
    const numStr = filterText.slice(1).trim();
    if (numStr.length === 0) return true;
    const threshold = parseFloat(numStr);
    return isNaN(threshold) ? true : val < threshold;
  } else if (ch === '>') {
    const numStr = filterText.slice(1).trim();
    if (numStr.length === 0) return true;
    const threshold = parseFloat(numStr);
    return isNaN(threshold) ? true : val > threshold;
  } else if (ch === '=') {
    const numStr = filterText.slice(1).trim();
    if (numStr.length === 0) return true;
    const target = parseFloat(numStr);
    return isNaN(target) ? true : val === target;
  } else {
    const target = parseFloat(filterText);
    return isNaN(target) ? true : val === target;
  }
}

const sanadSearchFilters = {
  account: '',
  shenavarCode: '',
  desc: '',
  debit: '',
  credit: '',
  txNo: '',
  txDate: ''
};

function handleColumnSearch(field, value) {
  sanadSearchFilters[field] = value;
  renderSanadEditorLines();
}

function clearColumnSearches() {
  for (let key in sanadSearchFilters) {
    sanadSearchFilters[key] = '';
  }
  const inputs = [
    'searchColAccount', 'searchColShenavar', 'searchColDesc',
    'searchColDebit', 'searchColCredit', 'searchColTxNo', 'searchColTxDate'
  ];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderSanadEditorLines();
}

function renderSanadEditorLines() {
  const tbody = document.getElementById('sanadLinesEditorBody');
  if (!tbody) return;

  tbody.innerHTML = AppState.sanadLines.map((line, i) => {
    // Default values for missing properties
    if (!line.account) line.account = '011001';
    if (!line.shenavarCode) line.shenavarCode = '';
    if (!line.txNo) line.txNo = '';
    if (!line.txDate) line.txDate = '';

    // Apply search filters
    if (sanadSearchFilters.account && !line.account.includes(sanadSearchFilters.account)) return '';
    if (sanadSearchFilters.shenavarCode && !line.shenavarCode.includes(sanadSearchFilters.shenavarCode)) return '';
    if (sanadSearchFilters.desc && !line.desc.toLowerCase().includes(sanadSearchFilters.desc.toLowerCase())) return '';
    if (sanadSearchFilters.txNo && !line.txNo.includes(sanadSearchFilters.txNo)) return '';
    if (sanadSearchFilters.txDate && !line.txDate.includes(sanadSearchFilters.txDate)) return '';

    if (sanadSearchFilters.debit) {
      if (!matchAmount(Number(line.debit || 0), sanadSearchFilters.debit)) return '';
    }
    if (sanadSearchFilters.credit) {
      if (!matchAmount(Number(line.credit || 0), sanadSearchFilters.credit)) return '';
    }
    if (!line.txDate) line.txDate = '';

    const isSelected = (i === focusedLineIndex);
    const rowClass = isSelected ? 'focused-row' : '';

    return `
      <tr class="${rowClass}" data-index="${i}" onclick="updateFocusedPaths(${i})" style="cursor:pointer;">
        <!-- Row No -->
        <td style="text-align:center; font-weight:bold;">${i + 1}</td>
        
        <!-- SF button helper -->
        <td style="text-align:center;"><button class="btn btn-outline" style="padding:2px 6px; font-size:0.75rem;" onclick="event.stopPropagation(); openSfPopup(${i})">...</button></td>

        <!-- Account Code TextBox -->
        <td>
          <input type="text" class="form-input" style="width:100%; border:none; padding:4px; font-size:0.8rem; background:transparent;" value="${line.account || ''}" onfocus="updateFocusedPaths(${i})" oninput="updateSanadLineField(${i}, 'account', this.value)" />
        </td>
        
        <!-- SH button helper -->
        <td style="text-align:center;"><button class="btn btn-outline" style="padding:2px 6px; font-size:0.75rem;" onclick="event.stopPropagation(); openShPopup(${i})">...</button></td>

        <!-- Floating Account Code TextBox -->
        <td>
          <input type="text" class="form-input" style="width:100%; border:none; padding:4px; font-size:0.8rem; background:transparent;" value="${line.shenavarCode || ''}" onfocus="updateFocusedPaths(${i})" oninput="updateSanadLineField(${i}, 'shenavarCode', this.value)" placeholder="بدون شناور" />
        </td>
        
        <!-- Description -->
        <td>
          <input type="text" class="form-input" style="width:100%; border:none; padding:4px; font-size:0.8rem; background:transparent;" value="${line.desc || ''}" onfocus="updateFocusedPaths(${i})" onchange="updateSanadLineField(${i}, 'desc', this.value)" />
        </td>
        
        <!-- Debit -->
        <td>
          <input type="text" class="form-input" style="width:100%; border:none; padding:4px; text-align:right; font-weight:bold; font-size:0.8rem; background:transparent;" value="${formatAmount(line.debit)}" onfocus="updateFocusedPaths(${i})" oninput="handleAmountInput(this, ${i}, 'debit')" />
        </td>
        
        <!-- Credit -->
        <td>
          <input type="text" class="form-input" style="width:100%; border:none; padding:4px; text-align:right; font-weight:bold; font-size:0.8rem; background:transparent;" value="${formatAmount(line.credit)}" onfocus="updateFocusedPaths(${i})" oninput="handleAmountInput(this, ${i}, 'credit')" />
        </td>
        
        <!-- Transaction Number -->
        <td>
          <input type="text" class="form-input" style="width:100%; border:none; padding:4px; font-size:0.8rem; background:transparent;" value="${line.txNo}" onfocus="updateFocusedPaths(${i})" oninput="updateSanadLineField(${i}, 'txNo', this.value)" />
        </td>

        <!-- TT Transaction Type Helper (Jalali Calendar Button) -->
        <td style="text-align:center;">
          <button class="btn btn-outline date-picker-btn" style="padding:2px 6px; font-size:0.75rem;" onclick="event.stopPropagation(); PersianCal.open('txDateInput_${i}', this)">...</button>
        </td>
        
        <!-- Transaction Date -->
        <td>
          <input type="text" id="txDateInput_${i}" class="form-input" style="width:100%; border:none; padding:4px; font-size:0.8rem; background:transparent;" value="${line.txDate}" maxlength="10" onfocus="updateFocusedPaths(${i})" oninput="autoFormatDate(this); updateSanadLineField(${i}, 'txDate', this.value)" />
        </td>
        
        <!-- Action: Delete -->
        <td style="text-align:center;">
          <button class="btn btn-outline" style="padding:2px 6px; color:red; border:none; background:transparent;" onclick="event.stopPropagation(); removeSanadLine(${i})">❌</button>
        </td>
      </tr>
    `;
  }).join('');
  
  updateSanadTotals();
  updateFocusedPaths(focusedLineIndex);
}

function addSanadLine() {
  AppState.sanadLines.push({ account: '011001', shenavarCode: '', desc: '', debit: 0, credit: 0, txNo: '', txDate: '' });
  focusedLineIndex = AppState.sanadLines.length - 1;
  renderSanadEditorLines();
}

function removeSanadLine(i) {
  AppState.sanadLines.splice(i, 1);
  if (AppState.sanadLines.length === 0) {
    AppState.sanadLines.push({ account: '011001', shenavarCode: '', desc: '', debit: 0, credit: 0, txNo: '', txDate: '' });
  }
  focusedLineIndex = Math.max(0, i - 1);
  renderSanadEditorLines();
}

function copyFocusedSanadLine(direction) {
  if (focusedLineIndex === null || !AppState.sanadLines[focusedLineIndex]) {
    alert('لطفاً ابتدا روی یکی از ردیف‌های سند کلیک کنید تا به عنوان سطر جاری انتخاب شود.');
    return;
  }
  const sourceLine = { ...AppState.sanadLines[focusedLineIndex] };
  if (direction === 'above') {
    AppState.sanadLines.splice(focusedLineIndex, 0, sourceLine);
    focusedLineIndex = focusedLineIndex + 1;
  } else {
    AppState.sanadLines.splice(focusedLineIndex + 1, 0, sourceLine);
    focusedLineIndex = focusedLineIndex + 1;
  }
  renderSanadEditorLines();
}

function copyFocusedSanadLineToCustom() {
  if (focusedLineIndex === null || !AppState.sanadLines[focusedLineIndex]) {
    alert('لطفاً ابتدا روی یکی از ردیف‌های سند کلیک کنید تا به عنوان سطر جاری انتخاب شود.');
    return;
  }
  
  const totalRows = AppState.sanadLines.length;
  const input = prompt(
    `شماره سطر مقصد را وارد کنید (1 تا ${totalRows + 1}):`,
    (focusedLineIndex + 1).toString()
  );
  
  if (input === null || input.trim() === '') {
    return;
  }
  
  const pos = parseInt(input.trim(), 10);
  if (isNaN(pos) || pos < 1 || pos > totalRows + 1) {
    alert('شماره سطر وارد شده معتبر نیست.');
    return;
  }
  
  const insertAt = pos - 1;
  const sourceLine = { ...AppState.sanadLines[focusedLineIndex] };
  
  AppState.sanadLines.splice(insertAt, 0, sourceLine);
  focusedLineIndex = insertAt;
  
  renderSanadEditorLines();
}

function deleteFocusedSanadLine() {
  if (focusedLineIndex === null || !AppState.sanadLines[focusedLineIndex]) {
    alert('لطفاً ابتدا روی یکی از ردیف‌های سند کلیک کنید.');
    return;
  }
  removeSanadLine(focusedLineIndex);
}

function updateSanadTotals() {
  const td = AppState.sanadLines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const tc = AppState.sanadLines.reduce((s, l) => s + Number(l.credit || 0), 0);
  const diff = td - tc;

  const debitEl = document.getElementById('footerTotalDebit');
  const creditEl = document.getElementById('footerTotalCredit');
  const diffDebitEl = document.getElementById('footerDiffDebit');
  const diffCreditEl = document.getElementById('footerDiffCredit');
  const badgeEl = document.getElementById('sanadBalanceStatusBadge');

  if (debitEl) debitEl.value = td.toLocaleString();
  if (creditEl) creditEl.value = tc.toLocaleString();

  if (diffDebitEl) diffDebitEl.value = diff > 0 ? diff.toLocaleString() : '0';
  if (diffCreditEl) diffCreditEl.value = diff < 0 ? Math.abs(diff).toLocaleString() : '0';

  if (badgeEl) {
    if (diff === 0 && td > 0) {
      badgeEl.className = 'badge badge-success';
      badgeEl.textContent = 'تراز';
      badgeEl.style.background = 'rgba(16,185,129,0.15)';
      badgeEl.style.color = '#10b981';
    } else {
      badgeEl.className = 'badge badge-danger';
      badgeEl.textContent = 'نامتوازن';
      badgeEl.style.background = 'rgba(239,68,68,0.15)';
      badgeEl.style.color = '#ef4444';
    }
  }

  // Trigger dynamic pixel-perfect alignment
  setTimeout(alignFooterTotals, 0);
}

function alignFooterTotals() {
  const headers = document.querySelectorAll('#form-sanad2 table th');
  if (headers.length < 8) return;
  
  let debitTh = null;
  let creditTh = null;
  headers.forEach(th => {
    if (th.textContent.includes('بدهکار')) debitTh = th;
    if (th.textContent.includes('بستانکار')) creditTh = th;
    
    const input = th.querySelector('input');
    if (input) {
      const placeholder = input.placeholder || '';
      if (placeholder.includes('بدهکار')) debitTh = th;
      if (placeholder.includes('بستانکار')) creditTh = th;
    }
  });
  
  if (!debitTh || !creditTh) return;
  
  const bottomPanel = document.getElementById('sanadBottomPanel');
  if (!bottomPanel) return;
  
  const panelRect = bottomPanel.getBoundingClientRect();
  const debitRect = debitTh.getBoundingClientRect();
  const creditRect = creditTh.getBoundingClientRect();
  
  // Calculate LTR offset positions relative to the bottom panel
  const debitLeft = debitRect.left - panelRect.left;
  const creditLeft = creditRect.left - panelRect.left;
  const debitWidth = debitRect.width;
  const creditWidth = creditRect.width;
  
  // Apply position to inputs
  const totalDebitInput = document.getElementById('footerTotalDebit');
  const totalCreditInput = document.getElementById('footerTotalCredit');
  const diffDebitInput = document.getElementById('footerDiffDebit');
  const diffCreditInput = document.getElementById('footerDiffCredit');
  
  if (totalDebitInput) {
    totalDebitInput.style.left = `${debitLeft}px`;
    totalDebitInput.style.width = `${debitWidth}px`;
  }
  if (totalCreditInput) {
    totalCreditInput.style.left = `${creditLeft}px`;
    totalCreditInput.style.width = `${creditWidth}px`;
  }
  if (diffDebitInput) {
    diffDebitInput.style.left = `${debitLeft}px`;
    diffDebitInput.style.width = `${debitWidth}px`;
  }
  if (diffCreditInput) {
    diffCreditInput.style.left = `${creditLeft}px`;
    diffCreditInput.style.width = `${creditWidth}px`;
  }
  
  // Position labels dynamically to the right of the Debit column
  const labelLeft = (debitRect.right - panelRect.left) + 12;
  const labelTotal = document.getElementById('footerLabelTotal');
  const labelDiff = document.getElementById('footerLabelDiff');
  
  if (labelTotal) {
    labelTotal.style.left = `${labelLeft}px`;
  }
  if (labelDiff) {
    labelDiff.style.left = `${labelLeft}px`;
  }

  // Centered inside leftmost empty space (0 to creditLeft)
  const statusContainer = document.getElementById('sanadBalanceStatusContainer');
  if (statusContainer) {
    statusContainer.style.left = '12px';
    statusContainer.style.width = `${creditLeft - 12}px`;
    statusContainer.style.top = '12px';
    statusContainer.style.height = '50px';
  }
}

// ==========================================
// Accounts Popup Dialog (Sarafsol Selection)
// ==========================================
let activePopupRowIndex = null;

function openSfPopup(rowIndex) {
  if (activePopupMode !== 'moghayerat') {
    activePopupMode = 'sanad';
  }
  activePopupRowIndex = rowIndex;
  lastSelectedPopupAccId = null;
  
  // Clear search inputs
  const sc = document.getElementById('popupSearchCode');
  const sn = document.getElementById('popupSearchName');
  if (sc) sc.value = '';
  if (sn) sn.value = '';
  
  // Close any open CRUD form in popup
  cancelAccountInPopup();
  
  // Render
  renderPopupAccounts();
  
  // Show modal
  const modal = document.getElementById('sfPopupModal');
  if (modal) modal.style.display = 'flex';
  
  // Set date/time in status bar
  const dateEl = document.getElementById('popupStatusBarDate');
  const timeEl = document.getElementById('popupStatusBarTime');
  const userEl = document.getElementById('popupStatusUser');
  const compEl = document.getElementById('popupStatusCompany');
  const yearEl = document.getElementById('popupStatusYear');
  
  if (dateEl && PersianCal && typeof PersianCal.getTodayString === 'function') {
    dateEl.textContent = PersianCal.getTodayString();
  }
  if (timeEl) {
    const now = new Date();
    timeEl.textContent = now.toTimeString().split(' ')[0];
  }
  if (userEl && currentUser) userEl.textContent = currentUser.fullName;
  if (compEl && SessionState.company) compEl.textContent = SessionState.company.name;
  if (yearEl && SessionState.year) yearEl.textContent = `سال مالی: ${SessionState.year}`;
}

function closeSfPopup() {
  const modal = document.getElementById('sfPopupModal');
  if (modal) modal.style.display = 'none';
}

function renderPopupAccounts() {
  const tbody = document.getElementById('popupAccountsTableBody');
  if (!tbody) return;
  
  const searchCode = (document.getElementById('popupSearchCode')?.value || '').trim();
  const searchName = (document.getElementById('popupSearchName')?.value || '').trim().toLowerCase();
  
  const sortedAccounts = sortTreePreOrder(AppState.accounts);
  let list;
  
  const isSearching = (searchCode || searchName);
  
  if (isSearching) {
    list = sortedAccounts.filter(a => {
      const matchCode = searchCode ? a.code.includes(searchCode) : true;
      const matchName = searchName ? a.name.toLowerCase().includes(searchName) : true;
      return matchCode && matchName;
    });
  } else {
    list = sortedAccounts.filter(isAccountVisible);
  }
  
  tbody.innerHTML = list.map(account => {
    const level = getAccountLevel(account);
    const hasChildren = AppState.accounts.some(child => child.parentId === account.id);
    const isExpanded = expandedAccountIds.has(account.id);
    
    // Toggle button in popup
    const toggleBtnHtml = hasChildren
      ? `<button class="tree-toggle-btn ${isExpanded ? 'expanded' : ''}" onclick="event.stopPropagation(); togglePopupAccountExpand(${account.id})">${isExpanded ? '-' : '+'}</button>`
      : `<button class="tree-toggle-btn" style="visibility:hidden; width:16px;">+</button>`;
      
    const indentPx = level * 18;
    const isSelected = (account.code === AppState.sanadLines[activePopupRowIndex]?.account);
    const selectedClass = isSelected ? 'focused-row' : '';
    
    return `
      <tr onclick="updatePopupSelectedPath(${JSON.stringify(account).replace(/"/g, '&quot;')})" style="cursor:pointer; height:26px; ${isSelected ? 'background-color:rgba(2,132,199,0.18) !important;' : ''}">
        <!-- Expand/Collapse Button (instead of "+" for sub-account) -->
        <td style="text-align:center; vertical-align:middle;">
          ${toggleBtnHtml}
        </td>
        <!-- Select Button -->
        <td style="text-align:center;">
          <button class="btn btn-outline" style="padding:1px 6px; font-size:0.75rem; border-color:#10b981; color:#10b981; font-weight:bold;" onclick="event.stopPropagation(); selectAccountInPopup('${account.code}')">انتخاب</button>
        </td>
        <!-- Edit Button -->
        <td style="text-align:center;">
          <button class="btn btn-outline" style="padding:1px 6px; font-size:0.75rem;" onclick="event.stopPropagation(); openEditAccountInPopup(${account.id})">ویرایش</button>
        </td>
        <!-- Delete Button -->
        <td style="text-align:center;">
          <button class="btn btn-outline" style="padding:1px 6px; font-size:0.75rem; color:red;" onclick="event.stopPropagation(); deleteAccountInPopup(${account.id})">حذف</button>
        </td>
        <!-- Code -->
        <td style="padding:4px 8px; font-weight:bold; font-size:0.8rem;">${account.code}</td>
        <!-- Name (with tree indentation) -->
        <td style="padding:4px 8px; padding-right:${indentPx + 10}px; font-size:0.8rem; text-align:right;">
          ${level > 0 ? '<span style="color:var(--accent-color);margin-left:6px;">└─</span>' : ''}
          <b>${account.name}</b>
        </td>
        <!-- Active Checkbox -->
        <td style="text-align:center;">
          <input type="checkbox" checked disabled />
        </td>
      </tr>
    `;
  }).join('');
}

function togglePopupAccountExpand(accId) {
  if (expandedAccountIds.has(accId)) {
    expandedAccountIds.delete(accId);
  } else {
    expandedAccountIds.add(accId);
  }
  renderPopupAccounts();
  if (typeof renderAccountsTable === 'function') {
    renderAccountsTable();
  }
}

function filterPopupAccounts() {
  renderPopupAccounts();
}

let activePopupMode = 'sanad';

function selectAccountInPopup(code) {
  if (activePopupMode === 'moghayerat') {
    const el = document.getElementById('lblMoghBankAccText');
    if (el) el.textContent = code;
    closeSfPopup();
    return;
  }
  
  if (activePopupRowIndex !== null && AppState.sanadLines[activePopupRowIndex]) {
    AppState.sanadLines[activePopupRowIndex].account = code;
    renderSanadEditorLines();
    updateFocusedPaths(activePopupRowIndex);
  }
  closeSfPopup();
}

let lastSelectedPopupAccId = null;

function updatePopupSelectedPath(account) {
  lastSelectedPopupAccId = account.id;
  let curr = account;
  const pathParts = [];
  while (curr) {
    pathParts.unshift(`${curr.code} : ${curr.name}`);
    curr = curr.parentId ? AppState.accounts.find(x => x.id === curr.parentId) : null;
  }
  const pathStr = `سطح سرفصل جاری: ${account.type} / زنجیره: ${pathParts.join(' / ')}`;
  const el = document.getElementById('popupSelectedAccPath');
  if (el) el.innerHTML = pathStr;
}

function openAddAccountInPopup(parentId = null) {
  const form = document.getElementById('popupAccCrudForm');
  if (!form) return;
  
  let targetParentId = parentId;
  
  if (targetParentId === null && lastSelectedPopupAccId !== null) {
    targetParentId = lastSelectedPopupAccId;
  }
  
  let targetType = 'گروه';
  let parentAcc = null;
  
  if (targetParentId !== null) {
    parentAcc = AppState.accounts.find(a => a.id === targetParentId);
    if (parentAcc) {
      const nextLevelMap = {
        'گروه': 'کل',
        'کل': 'معین',
        'معین': 'تفصیلی',
        'تفصیلی': 'تفصیلی'
      };
      targetType = nextLevelMap[parentAcc.type] || 'تفصیلی';
    }
  }
  
  const titleEl = document.getElementById('popupAccCrudTitle');
  if (titleEl) {
    if (targetParentId !== null && parentAcc) {
      titleEl.innerHTML = `افزودن حساب جدید <span style="font-size:0.75rem;color:var(--accent-color);font-weight:normal;margin-right:6px;">(به عنوان فرزندِ "${parentAcc.name}")</span> 
        <button class="btn btn-outline" style="padding:1px 6px;font-size:0.7rem;margin-right:12px;" onclick="resetPopupParentSelection(event)">🔄 ایجاد به عنوان حساب اصلی (گروه)</button>`;
    } else {
      titleEl.innerHTML = `افزودن حساب جدید <span style="font-size:0.75rem;color:var(--text-muted);font-weight:normal;margin-right:6px;">(به عنوان حساب اصلی / گروه)</span>`;
    }
  }
  
  document.getElementById('popupAccCrudParentId').value = targetParentId || '';
  document.getElementById('popupAccCrudEditId').value = '';
  document.getElementById('popupAccCrudType').value = targetType;
  document.getElementById('popupAccCrudCode').value = suggestNextAccountCode(targetType, targetParentId);
  document.getElementById('popupAccCrudName').value = '';
  document.getElementById('popupAccCrudNature').value = parentAcc ? parentAcc.nature : 'بدهکار';
  
  form.style.display = 'block';
}

function resetPopupParentSelection(e) {
  if (e) e.preventDefault();
  lastSelectedPopupAccId = null;
  openAddAccountInPopup();
}

function openEditAccountInPopup(id) {
  const acc = AppState.accounts.find(x => x.id === id);
  if (!acc) return;
  
  const form = document.getElementById('popupAccCrudForm');
  if (!form) return;
  
  form.style.display = 'block';
  document.getElementById('popupAccCrudTitle').textContent = 'ویرایش سرفصل حساب';
  document.getElementById('popupAccCrudParentId').value = acc.parentId || '';
  document.getElementById('popupAccCrudEditId').value = acc.id;
  document.getElementById('popupAccCrudCode').value = acc.code;
  document.getElementById('popupAccCrudName').value = acc.name;
  document.getElementById('popupAccCrudNature').value = acc.nature;
  document.getElementById('popupAccCrudType').value = acc.type;
}

function cancelAccountInPopup() {
  const form = document.getElementById('popupAccCrudForm');
  if (form) form.style.display = 'none';
}

function saveAccountInPopup() {
  const parentIdStr = document.getElementById('popupAccCrudParentId').value;
  const editIdStr = document.getElementById('popupAccCrudEditId').value;
  const code = document.getElementById('popupAccCrudCode').value.trim();
  const name = document.getElementById('popupAccCrudName').value.trim();
  const nature = document.getElementById('popupAccCrudNature').value;
  const type = document.getElementById('popupAccCrudType').value;
  
  if (!code || !name) {
    alert('لطفاً کد و نام سرفصل را وارد کنید.');
    return;
  }
  
  if (editIdStr) {
    // Edit existing account
    const id = Number(editIdStr);
    const acc = AppState.accounts.find(x => x.id === id);
    if (acc) {
      acc.code = code;
      acc.name = name;
      acc.nature = nature;
      acc.type = type;
    }
  } else {
    // Add new account
    const newId = AppState.accounts.length > 0 ? Math.max(...AppState.accounts.map(x => x.id)) + 1 : 1;
    const parentId = parentIdStr ? Number(parentIdStr) : null;
    AppState.accounts.push({
      id: newId,
      code: code,
      name: name,
      type: type,
      nature: nature,
      parentId: parentId
    });
  }
  
  // Refresh accounts table inside both popup and coding tab
  renderPopupAccounts();
  if (typeof renderAccountsTable === 'function') {
    renderAccountsTable();
  }
  
  // Hide Form
  cancelAccountInPopup();
}

function deleteAccountInPopup(id) {
  if (confirm('آیا مایل به حذف این سرفصل هستید؟')) {
    const idx = AppState.accounts.findIndex(x => x.id === id);
    if (idx !== -1) {
      AppState.accounts.splice(idx, 1);
      renderPopupAccounts();
      if (typeof renderAccountsTable === 'function') {
        renderAccountsTable();
      }
    }
  }
}

// ==========================================
// Shenavars Popup Dialog (Floating Accounts Selection)
// ==========================================
let activeShPopupRowIndex = null;
let lastSelectedPopupShenavarId = null;

function openShPopup(rowIndex) {
  activeShPopupRowIndex = rowIndex;
  lastSelectedPopupShenavarId = null;
  
  // Clear search inputs
  const sc = document.getElementById('popupSearchShCode');
  const sn = document.getElementById('popupSearchShName');
  if (sc) sc.value = '';
  if (sn) sn.value = '';
  
  // Close any open CRUD form in popup
  cancelShenavarInPopup();
  
  // Render
  renderPopupShenavars();
  
  // Show modal
  const modal = document.getElementById('shPopupModal');
  if (modal) modal.style.display = 'flex';
  
  // Set date/time in status bar
  const dateEl = document.getElementById('popupShStatusBarDate');
  const timeEl = document.getElementById('popupShStatusBarTime');
  const userEl = document.getElementById('popupShStatusUser');
  const compEl = document.getElementById('popupShStatusCompany');
  const yearEl = document.getElementById('popupShStatusYear');
  
  if (dateEl && PersianCal && typeof PersianCal.getTodayString === 'function') {
    dateEl.textContent = PersianCal.getTodayString();
  }
  if (timeEl) {
    const now = new Date();
    timeEl.textContent = now.toTimeString().split(' ')[0];
  }
  if (userEl && currentUser) userEl.textContent = currentUser.fullName;
  if (compEl && SessionState.company) compEl.textContent = SessionState.company.name;
  if (yearEl && SessionState.year) yearEl.textContent = `سال مالی: ${SessionState.year}`;
}

function closeShPopup() {
  const modal = document.getElementById('shPopupModal');
  if (modal) modal.style.display = 'none';
}

function renderPopupShenavars() {
  const tbody = document.getElementById('popupShenavarsTableBody');
  if (!tbody) return;
  
  const searchCode = (document.getElementById('popupSearchShCode')?.value || '').trim();
  const searchName = (document.getElementById('popupSearchShName')?.value || '').trim().toLowerCase();
  
  const sortedShenavars = sortTreePreOrder(AppState.shenavars);
  let list;
  
  const isSearching = (searchCode || searchName);
  
  if (isSearching) {
    list = sortedShenavars.filter(s => {
      const matchCode = searchCode ? s.code.includes(searchCode) : true;
      const matchName = searchName ? s.name.toLowerCase().includes(searchName) : true;
      return matchCode && matchName;
    });
  } else {
    list = sortedShenavars.filter(isShenavarVisible);
  }
  
  tbody.innerHTML = list.map(s => {
    const level = getShenavarLevel(s);
    const hasChildren = AppState.shenavars.some(child => child.parentId === s.id);
    const isExpanded = expandedShenavarIds.has(s.id);
    
    // Toggle button in popup
    const toggleBtnHtml = hasChildren
      ? `<button class="tree-toggle-btn ${isExpanded ? 'expanded' : ''}" onclick="event.stopPropagation(); togglePopupShenavarExpand(${s.id})">${isExpanded ? '-' : '+'}</button>`
      : `<button class="tree-toggle-btn" style="visibility:hidden; width:16px;">+</button>`;
      
    const indentPx = level * 18;
    const isSelected = (s.code === AppState.sanadLines[activeShPopupRowIndex]?.shenavarCode);
    
    return `
      <tr onclick="updatePopupSelectedShPath(${JSON.stringify(s).replace(/"/g, '&quot;')})" style="cursor:pointer; height:26px; ${isSelected ? 'background-color:rgba(2,132,199,0.18) !important;' : ''}">
        <!-- Expand/Collapse Button -->
        <td style="text-align:center; vertical-align:middle;">
          ${toggleBtnHtml}
        </td>
        <!-- Select Button -->
        <td style="text-align:center;">
          <button class="btn btn-outline" style="padding:1px 6px; font-size:0.75rem; border-color:#10b981; color:#10b981; font-weight:bold;" onclick="event.stopPropagation(); selectShenavarInPopup('${s.code}')">انتخاب</button>
        </td>
        <!-- Edit Button -->
        <td style="text-align:center;">
          <button class="btn btn-outline" style="padding:1px 6px; font-size:0.75rem;" onclick="event.stopPropagation(); openEditShenavarInPopup(${s.id})">ویرایش</button>
        </td>
        <!-- Delete Button -->
        <td style="text-align:center;">
          <button class="btn btn-outline" style="padding:1px 6px; font-size:0.75rem; color:red;" onclick="event.stopPropagation(); deleteShenavarInPopup(${s.id})">حذف</button>
        </td>
        <!-- Code -->
        <td style="padding:4px 8px; font-weight:bold; font-size:0.8rem;">${s.code}</td>
        <!-- Name (with tree indentation) -->
        <td style="padding:4px 8px; padding-right:${indentPx + 10}px; font-size:0.8rem; text-align:right;">
          ${level > 0 ? '<span style="color:var(--accent-color);margin-left:6px;">└─</span>' : ''}
          <b>${s.name}</b>
        </td>
        <!-- Active Checkbox -->
        <td style="text-align:center;">
          <input type="checkbox" checked disabled />
        </td>
      </tr>
    `;
  }).join('');
}

function togglePopupShenavarExpand(shenId) {
  if (expandedShenavarIds.has(shenId)) {
    expandedShenavarIds.delete(shenId);
  } else {
    expandedShenavarIds.add(shenId);
  }
  renderPopupShenavars();
  if (typeof renderShenavaarTable === 'function') {
    renderShenavaarTable();
  }
}

function filterPopupShenavars() {
  renderPopupShenavars();
}

function selectShenavarInPopup(code) {
  if (activeShPopupRowIndex !== null && AppState.sanadLines[activeShPopupRowIndex]) {
    AppState.sanadLines[activeShPopupRowIndex].shenavarCode = code;
    
    // Rerender row template to show the new value in text box
    renderSanadEditorLines();
    
    // Also, trigger manual path update for header
    updateFocusedPaths(activeShPopupRowIndex);
  }
  closeShPopup();
}

function updatePopupSelectedShPath(s) {
  lastSelectedPopupShenavarId = s.id;
  let curr = s;
  const pathParts = [];
  while (curr) {
    pathParts.unshift(`${curr.code} : ${curr.name}`);
    curr = curr.parentId ? AppState.shenavars.find(x => x.id === curr.parentId) : null;
  }
  const levelText = getShenavarLevel(s) === 0 ? 'گروه اصلی' : 'زیرمجموعه';
  const pathStr = `سطح شناور جاری: ${levelText} / زنجیره: ${pathParts.join(' / ')}`;
  const el = document.getElementById('popupSelectedShPath');
  if (el) el.innerHTML = pathStr;
}

function openAddShenavarInPopup(parentId = null) {
  const form = document.getElementById('popupShCrudForm');
  if (!form) return;
  
  let targetParentId = parentId;
  
  if (targetParentId === null && lastSelectedPopupShenavarId !== null) {
    targetParentId = lastSelectedPopupShenavarId;
  }
  
  let parentShen = null;
  if (targetParentId !== null) {
    parentShen = AppState.shenavars.find(s => s.id === targetParentId);
  }
  
  const titleEl = document.getElementById('popupShCrudTitle');
  if (titleEl) {
    if (targetParentId !== null && parentShen) {
      titleEl.innerHTML = `افزودن حساب شناور جدید <span style="font-size:0.75rem;color:var(--accent-color);font-weight:normal;margin-right:6px;">(به عنوان فرزندِ "${parentShen.name}")</span> 
        <button class="btn btn-outline" style="padding:1px 6px;font-size:0.7rem;margin-right:12px;" onclick="resetPopupShenavarParentSelection(event)">🔄 ایجاد به عنوان شناور اصلی</button>`;
    } else {
      titleEl.innerHTML = `افزودن حساب شناور جدید <span style="font-size:0.75rem;color:var(--text-muted);font-weight:normal;margin-right:6px;">(به عنوان شناور اصلی)</span>`;
    }
  }
  
  document.getElementById('popupShCrudParentId').value = targetParentId || '';
  document.getElementById('popupShCrudEditId').value = '';
  document.getElementById('popupShCrudCode').value = suggestNextShenavarCode(targetParentId);
  document.getElementById('popupShCrudName').value = '';
  document.getElementById('popupShCrudStatus').value = 'فعال';
  
  form.style.display = 'block';
}

function resetPopupShenavarParentSelection(e) {
  if (e) e.preventDefault();
  lastSelectedPopupShenavarId = null;
  openAddShenavarInPopup();
}

function openEditShenavarInPopup(id) {
  const s = AppState.shenavars.find(x => x.id === id);
  if (!s) return;
  
  const form = document.getElementById('popupShCrudForm');
  if (!form) return;
  
  form.style.display = 'block';
  document.getElementById('popupShCrudTitle').textContent = 'ویرایش حساب شناور';
  document.getElementById('popupShCrudParentId').value = s.parentId || '';
  document.getElementById('popupShCrudEditId').value = s.id;
  document.getElementById('popupShCrudCode').value = s.code;
  document.getElementById('popupShCrudName').value = s.name;
  document.getElementById('popupShCrudStatus').value = s.status || 'فعال';
}

function cancelShenavarInPopup() {
  const form = document.getElementById('popupShCrudForm');
  if (form) form.style.display = 'none';
}

function saveShenavarInPopup() {
  const parentIdStr = document.getElementById('popupShCrudParentId').value;
  const editIdStr = document.getElementById('popupShCrudEditId').value;
  const code = document.getElementById('popupShCrudCode').value.trim();
  const name = document.getElementById('popupShCrudName').value.trim();
  const status = document.getElementById('popupShCrudStatus').value;
  
  if (!code || !name) {
    alert('لطفاً کد و عنوان شناور را وارد کنید.');
    return;
  }
  
  if (editIdStr) {
    // Edit existing
    const id = Number(editIdStr);
    const s = AppState.shenavars.find(x => x.id === id);
    if (s) {
      s.code = code;
      s.name = name;
      s.status = status;
    }
  } else {
    // Add new
    const newId = AppState.shenavars.length > 0 ? Math.max(...AppState.shenavars.map(x => x.id)) + 1 : 1;
    const parentId = parentIdStr ? Number(parentIdStr) : null;
    AppState.shenavars.push({
      id: newId,
      code: code,
      name: name,
      parentId: parentId,
      status: status
    });
  }
  
  // Refresh lists
  renderPopupShenavars();
  if (typeof renderShenavaarTable === 'function') {
    renderShenavaarTable();
  }
  
  cancelShenavarInPopup();
}

function deleteShenavarInPopup(id) {
  if (confirm('آیا مایل به حذف این حساب شناور هستید؟')) {
    const idx = AppState.shenavars.findIndex(x => x.id === id);
    if (idx !== -1) {
      AppState.shenavars.splice(idx, 1);
      renderPopupShenavars();
      if (typeof renderShenavaarTable === 'function') {
        renderShenavaarTable();
      }
    }
  }
}

function openNewSanadForm() {
  const nextNo = AppState.sanads.length > 0 ? Math.max(...AppState.sanads.map(s => Number(s.id))) + 1 : 101;
  showForm('form-sanad2');
  
  const numInput = document.getElementById('sanadNumberInput');
  if (numInput) {
    numInput.value = nextNo;
    numInput.readOnly = false; // Allow editing number for new vouchers
  }
  
  const todayStr = (PersianCal && typeof PersianCal.getTodayString === 'function') 
    ? PersianCal.getTodayString() 
    : '1403/05/11';
  document.getElementById('sanadDateInput').value = todayStr;
  document.getElementById('sanadDescInput').value = '';
  
  focusedLineIndex = 0;
  AppState.sanadLines = [
    { account: '011001', shenavarCode: '', desc: 'توضیحات ردیف ۱', debit: 0, credit: 0, txNo: '', txDate: '' },
    { account: '022001', shenavarCode: '', desc: 'توضیحات ردیف ۲', debit: 0, credit: 0, txNo: '', txDate: '' }
  ];
  renderSanadEditorLines();
}

function closeSanadEditor() {
  showForm('form-hesabdari-main');
  switchHesabdariTab('sanad');
}

function saveSanadEntry() {
  const td = AppState.sanadLines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const tc = AppState.sanadLines.reduce((s, l) => s + Number(l.credit || 0), 0);
  if (td !== tc) { alert('امکان ثبت سند نامتوازن وجود ندارد.'); return; }
  const no = Number(document.getElementById('sanadNumberInput')?.value);
  const date = document.getElementById('sanadDateInput')?.value;
  const desc = document.getElementById('sanadDescInput')?.value || 'سند حسابداری';

  if (isNaN(no) || no <= 0) { alert('شماره سند نامعتبر است.'); return; }

  const existingIdx = AppState.sanads.findIndex(x => x.id === no);
  if (existingIdx !== -1) {
    const s = AppState.sanads[existingIdx];
    if (s.bakhshId && s.bakhshId !== getCurrentBakhshId()) {
      alert('شما مجاز به ویرایش این سند نیستید.');
      return;
    }
    AppState.sanads[existingIdx] = {
      ...s,
      date,
      desc,
      debit: td,
      credit: tc
    };
    alert(`سند شماره ${no} با موفقیت ویرایش شد.`);
  } else {
    AppState.sanads.push({ 
      id: no, 
      date, 
      desc, 
      debit: td, 
      credit: tc, 
      status: 'موقت', 
      bakhshId: getCurrentBakhshId() 
    });
    alert(`سند شماره ${no} با موفقیت ثبت شد.`);
  }

  AppState.sanadLines = [{ account: '011001', shenavarCode: '', desc: '', debit: 0, credit: 0, txNo: '', txDate: '' }];
  closeSanadEditor();
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
  // Check if form parameter is present in URL
  const urlParams = new URLSearchParams(window.location.search);
  const formParam = urlParams.get('form');
  const modeParam = urlParams.get('mode');

  if (formParam) {
    // 1. Mark as tab mode
    AppState.isTabMode = true;

    // 2. Bypass login overlay
    const overlay = document.getElementById('loginOverlay');
    const mainApp = document.getElementById('mainApp');
    if (overlay) overlay.style.display = 'none';
    if (mainApp) {
      mainApp.style.display = 'block';
      mainApp.classList.add('app-fade-in');
    }

    // 3. Hide the desktop header (tabs like سیستم، کاربران، شرکتها و سالها...)
    const desktopHeader = document.querySelector('.desktop-header');
    if (desktopHeader) {
      desktopHeader.style.display = 'none';
    }

    // 4. Set current user to admin (session bypass)
    currentUser = CREDENTIALS[0]; // admin
    const headerUser = document.getElementById('headerUsername');
    if (headerUser) headerUser.textContent = currentUser.fullName + ' (' + currentUser.username + ')';

    if (AppState.companies.length > 0) {
      SessionState.company = AppState.companies[0];
      const activeYears = AppState.fiscalYears
        .filter(fy => fy.company === SessionState.company.code)
        .sort((a, b) => Number(b.year) - Number(a.year));
      const activeOne = activeYears.find(fy => fy.status === 'فعال') || activeYears[0];
      if (activeOne) SessionState.year = activeOne.year;
    }
    updateHeaderBar();

    // 5. Show the requested form
    showForm(formParam);

    // 6. Handle special mode for accounting main module
    if (formParam === 'form-hesabdari-main' && modeParam) {
      if (modeParam === 'reports') {
        switchHesabdariTab('taraz');
      } else {
        switchHesabdariTab('accounts');
      }
    }
  } else {
    // Standard dashboard mode: focus username field
    const usernameInput = document.getElementById('loginUsername');
    if (usernameInput) setTimeout(() => usernameInput.focus(), 200);
  }

  // Update clock & date immediately and then every second
  updateSystemClock();
  setInterval(updateSystemClock, 1000);

  // Resize and scroll listeners to dynamically align footer totals
  window.addEventListener('resize', () => {
    if (typeof alignFooterTotals === 'function') alignFooterTotals();
  });
  const sanadWrapper = document.querySelector('#form-sanad2 .table-wrapper');
  if (sanadWrapper) {
    sanadWrapper.addEventListener('scroll', () => {
      if (typeof alignFooterTotals === 'function') alignFooterTotals();
    });
  }
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
}, true);

// ==========================================
// ── Bank Reconciliation Module (مغایرات بانکی) ──
// ==========================================

AppState.moghayeratBanks = [
  {
    id: 1,
    bankName: 'ملت',
    branchName: 'جاری ۲۲',
    branchCode: '1020',
    branchAddress: 'خیابان ولیعصر',
    accountType: 'جاری',
    accountNumber: '222217831',
    accountId: 14 // بانک ملت شعبه ۲۲
  }
];

AppState.bankTransactions = []; // تراکنش‌های ایمپورت‌شده صورتحساب
AppState.ledgerTransactions = []; // تراکنش‌های استخراج‌شده از دفاتر شرکت
AppState.moghayeratReconciled = false;
AppState.moghCurrentSubtab = 'defs';
AppState.moghBankSubtabFilter = 'all';
AppState.moghLedgerSubtabFilter = 'all';
AppState.selectedMoghBankId = 1;

// بارگذاری اولیه مقادیر کامبوها به صورت پیش‌فرض
document.addEventListener('DOMContentLoaded', () => {
  populateMoghCombos();
  renderMoghayeratBanksTable();
});

function switchBankSubtab(subtab) {
  AppState.moghCurrentSubtab = subtab;
  
  // بروزرسانی دکمه‌های ناوبری زیرتب
  const btnIds = {
    defs: 'btnSubtabBankDefs',
    import: 'btnSubtabBankImport',
    reconcile: 'btnSubtabBankReconcile',
    suggestions: 'btnSubtabBankSuggestions'
  };
  
  for (let key in btnIds) {
    const btn = document.getElementById(btnIds[key]);
    if (btn) {
      if (key === subtab) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  }
  
  // بروزرسانی پنل‌های نمایش زیرتب
  const panelIds = {
    defs: 'pnlBankSubtabDefs',
    import: 'pnlBankSubtabImport',
    reconcile: 'pnlBankSubtabReconcile',
    suggestions: 'pnlBankSubtabSuggestions'
  };
  
  for (let key in panelIds) {
    const panel = document.getElementById(panelIds[key]);
    if (panel) {
      if (key === subtab) {
        panel.style.display = (key === 'defs') ? 'flex' : 'flex'; // flex for defs, block/flex for others
        if (key === 'import') panel.style.display = 'flex';
        if (key === 'reconcile') panel.style.display = 'flex';
      } else {
        panel.style.display = 'none';
      }
    }
  }
  
  // رندر متناسب با تب جاری
  if (subtab === 'defs') renderMoghayeratBanksTable();
  else if (subtab === 'import') loadImportedBankState();
  else if (subtab === 'reconcile') renderMoghayeratReconcilePanel();
  else if (subtab === 'suggestions') renderMoghayeratSuggestions();
}

function openSelectLedgerForMoghayerat() {
  activePopupMode = 'moghayerat';
  openSfPopup();
}

function populateMoghCombos() {
  const cmbImport = document.getElementById('cmbMoghImportBank');
  const cmbReconcile = document.getElementById('cmbMoghReconcileBank');
  
  const optionsHtml = AppState.moghayeratBanks.map(b => 
    `<option value="${b.id}">${b.bankName} - ${b.branchName} - ${b.accountNumber}</option>`
  ).join('');
  
  if (cmbImport) {
    cmbImport.innerHTML = optionsHtml;
    if (AppState.moghayeratBanks.length > 0) cmbImport.value = AppState.moghayeratBanks[0].id;
  }
  if (cmbReconcile) {
    cmbReconcile.innerHTML = optionsHtml;
    if (AppState.moghayeratBanks.length > 0) cmbReconcile.value = AppState.moghayeratBanks[0].id;
  }
}

function renderMoghayeratBanksTable() {
  const tbody = document.getElementById('tblMoghayeratBanksBody');
  if (!tbody) return;
  
  if (AppState.moghayeratBanks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:20px;">هیچ بانکی تعریف نشده است.</td></tr>`;
    updateBankStatementRangeHeader(null);
    return;
  }
  
  tbody.innerHTML = AppState.moghayeratBanks.map(b => {
    const acc = AppState.accounts.find(a => a.id === b.accountId);
    const accName = acc ? `${acc.code} - ${acc.name}` : '-';
    
    // ردیف انتخاب شده
    const isSelected = (AppState.selectedMoghBankId === b.id);
    const selectedStyle = isSelected ? 'background-color:rgba(56, 189, 248, 0.12); font-weight:bold;' : '';
    
    return `
      <tr onclick="selectMoghayeratBank(${b.id})" style="cursor:pointer; ${selectedStyle}">
        <td style="padding:8px; text-align:center;">${b.bankName}</td>
        <td style="padding:8px; text-align:center;">${b.branchName}</td>
        <td style="padding:8px; text-align:center;">${b.branchCode || '-'}</td>
        <td style="padding:8px; text-align:center;">${b.branchAddress || '-'}</td>
        <td style="padding:8px; text-align:center;">${b.accountType || '-'}</td>
        <td style="padding:8px; text-align:center;">${b.accountNumber}</td>
        <td style="padding:8px; text-align:center; direction:ltr;">${accName}</td>
      </tr>
    `;
  }).join('');
  
  // آپدیت هدر بازه تاریخ بر اساس بانک انتخاب شده
  updateBankStatementRangeHeader(AppState.selectedMoghBankId);
}

function selectMoghayeratBank(id) {
  AppState.selectedMoghBankId = id;
  const b = AppState.moghayeratBanks.find(x => x.id === id);
  if (!b) return;
  
  document.getElementById('moghBankEditId').value = b.id;
  document.getElementById('moghBankName').value = b.bankName;
  document.getElementById('moghBankBranch').value = b.branchName;
  document.getElementById('moghBankBranchCode').value = b.branchCode || '';
  document.getElementById('moghBankBranchAddress').value = b.branchAddress || '';
  document.getElementById('moghBankAccountType').value = b.accountType || '';
  document.getElementById('moghBankAccountNo').value = b.accountNumber;
  
  const acc = AppState.accounts.find(a => a.id === b.accountId);
  document.getElementById('lblMoghBankAccText').textContent = acc ? acc.code : '-';
  
  renderMoghayeratBanksTable();
}

function updateBankStatementRangeHeader(bankId) {
  const lbl = document.getElementById('lblBankStatementRangeHeader');
  if (!lbl) return;
  
  if (!bankId) {
    lbl.textContent = 'بازه تاریخی صورت حساب وارد شده: فاقد صورت حساب وارد شده';
    return;
  }
  
  const txs = AppState.bankTransactions.filter(t => t.bankId === bankId);
  if (txs.length === 0) {
    lbl.textContent = 'بازه تاریخی صورت حساب وارد شده: فاقد صورت حساب وارد شده';
    return;
  }
  
  // پیدا کردن مینیمم و ماکسیمم تاریخ
  const dates = txs.map(t => t.txDate).sort();
  const minDate = dates[0];
  const maxDate = dates[dates.length - 1];
  lbl.textContent = `بازه تاریخی صورت حساب وارد شده: از تاریخ: ${minDate} تا تاریخ: ${maxDate}`;
}

function saveMoghayeratBank() {
  const name = document.getElementById('moghBankName').value.trim();
  const branch = document.getElementById('moghBankBranch').value.trim();
  const code = document.getElementById('moghBankBranchCode').value.trim();
  const address = document.getElementById('moghBankBranchAddress').value.trim();
  const type = document.getElementById('moghBankAccountType').value.trim();
  const accNo = document.getElementById('moghBankAccountNo').value.trim();
  const accCode = document.getElementById('lblMoghBankAccText').textContent.trim();
  
  if (!name || !accNo) {
    alert('نام بانک و شماره حساب الزامی هستند.');
    return;
  }
  
  const acc = AppState.accounts.find(a => a.code === accCode);
  if (!acc) {
    alert('انتخاب سرفصل حساب الزامی است.');
    return;
  }
  
  const editIdStr = document.getElementById('moghBankEditId').value;
  if (editIdStr) {
    // Edit
    const id = parseInt(editIdStr, 10);
    const idx = AppState.moghayeratBanks.findIndex(x => x.id === id);
    if (idx !== -1) {
      AppState.moghayeratBanks[idx] = {
        id, bankName: name, branchName: branch, branchCode: code, branchAddress: address,
        accountType: type, accountNumber: accNo, accountId: acc.id
      };
      alert('مشخصات بانک با موفقیت ویرایش شد.');
    }
  } else {
    // Add New
    const newId = AppState.moghayeratBanks.length > 0 ? Math.max(...AppState.moghayeratBanks.map(x => x.id)) + 1 : 1;
    AppState.moghayeratBanks.push({
      id: newId, bankName: name, branchName: branch, branchCode: code, branchAddress: address,
      accountType: type, accountNumber: accNo, accountId: acc.id
    });
    AppState.selectedMoghBankId = newId;
    alert('مشخصات بانک با موفقیت ثبت شد.');
  }
  
  populateMoghCombos();
  clearMoghayeratBankForm();
  renderMoghayeratBanksTable();
}

function clearMoghayeratBankForm() {
  document.getElementById('moghBankEditId').value = '';
  document.getElementById('moghBankName').value = '';
  document.getElementById('moghBankBranch').value = '';
  document.getElementById('moghBankBranchCode').value = '';
  document.getElementById('moghBankBranchAddress').value = '';
  document.getElementById('moghBankAccountType').value = '';
  document.getElementById('moghBankAccountNo').value = '';
  document.getElementById('lblMoghBankAccText').textContent = '-';
}

function deleteMoghayeratBank() {
  const editIdStr = document.getElementById('moghBankEditId').value;
  if (!editIdStr) {
    alert('لطفا ابتدا یک بانک را از جدول انتخاب کنید.');
    return;
  }
  
  if (!confirm('آیا از حذف بانک انتخاب شده اطمینان دارید؟')) return;
  
  const id = parseInt(editIdStr, 10);
  AppState.moghayeratBanks = AppState.moghayeratBanks.filter(x => x.id !== id);
  if (AppState.selectedMoghBankId === id) {
    AppState.selectedMoghBankId = AppState.moghayeratBanks.length > 0 ? AppState.moghayeratBanks[0].id : null;
  }
  
  populateMoghCombos();
  clearMoghayeratBankForm();
  renderMoghayeratBanksTable();
}

// ── زیرتب ۲: ورود صورتحساب ──

function triggerMoghBrowseFile() {
  document.getElementById('fileMoghImport').click();
}

function handleMoghFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById('lblMoghFileName').textContent = file.name;
  loadSampleMoghData();
}

let mockExcelData = [];

function loadSampleMoghData() {
  // شبیه‌سازی خواندن اکسل با ۶ سطر تستی باکیفیت
  mockExcelData = [
    { date: '1403/05/10', refNo: '982711', debit: 0, credit: 15000000, desc: 'واریز سود سپرده ملت', ben: 'بانک ملت' },
    { date: '1403/05/11', refNo: '887251', debit: 120000000, credit: 0, desc: 'برداشت بابت چک شماره ۵۱۲', ben: 'علی رضایی' },
    { date: '1403/05/12', refNo: '772152', debit: 0, credit: 450000000, desc: 'حواله دریافتی از مشتری', ben: 'شرکت آریا' },
    { date: '1403/05/13', refNo: '662198', debit: 5000000, credit: 0, desc: 'کارمزد انتقال وجه شتاب', ben: 'بانک ملت' },
    { date: '1403/05/14', refNo: '551223', debit: 0, credit: 75000000, desc: 'واریز نقدی صندوقدار به بانک', ben: 'صندوقدار' },
    { date: '1403/05/15', refNo: '441029', debit: 23000000, credit: 0, desc: 'برداشت خرید تجهیزات اداری', ben: 'دیجی‌کالا' }
  ];
  
  // پر کردن کامبوهای نگاشت ستون‌ها با اسامی فیلدها
  const cols = ['ستون A (تاریخ)', 'ستون B (پیگیری)', 'ستون C (بدهکار/برداشت)', 'ستون D (بستانکار/واریز)', 'ستون E (شرح)', 'ستون F (ذینفع)'];
  const fillSelect = (id, defIdx) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = cols.map((c, i) => `<option value="${i}" ${i === defIdx ? 'selected' : ''}>${c}</option>`).join('');
  };
  
  fillSelect('mapColTxDate', 0);
  fillSelect('mapColTxNo', 1);
  fillSelect('mapColDebit', 2);
  fillSelect('mapColCredit', 3);
  fillSelect('mapColDesc', 4);
  fillSelect('mapColBeneficiary', 5);
  
  renderMoghayeratImportPreview();
}

function renderMoghayeratImportPreview() {
  const thead = document.querySelector('#tblMoghImportPreview thead');
  const tbody = document.querySelector('#tblMoghImportPreview tbody');
  if (!thead || !tbody) return;
  
  thead.innerHTML = `
    <tr style="border-bottom:1px solid var(--border-color);">
      <th style="padding:6px; text-align:center;">ردیف</th>
      <th style="padding:6px; text-align:center;">تاریخ تراکنش</th>
      <th style="padding:6px; text-align:center;">شماره پیگیری</th>
      <th style="padding:6px; text-align:center;">برداشت (بدهکار)</th>
      <th style="padding:6px; text-align:center;">واریز (بستانکار)</th>
      <th style="padding:6px; text-align:center;">شرح</th>
      <th style="padding:6px; text-align:center;">واریز کننده / ذینفع</th>
    </tr>
  `;
  
  if (mockExcelData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:20px;">هیچ داده‌ای بارگذاری نشده است.</td></tr>`;
    return;
  }
  
  tbody.innerHTML = mockExcelData.map((row, i) => `
    <tr>
      <td style="padding:6px; text-align:center;">${i + 1}</td>
      <td style="padding:6px; text-align:center;">${row.date}</td>
      <td style="padding:6px; text-align:center;">${row.refNo}</td>
      <td style="padding:6px; text-align:left; color:#ef4444;">${row.debit === 0 ? '-' : row.debit.toLocaleString()}</td>
      <td style="padding:6px; text-align:left; color:#10b981;">${row.credit === 0 ? '-' : row.credit.toLocaleString()}</td>
      <td style="padding:6px; text-align:right;">${row.desc}</td>
      <td style="padding:6px; text-align:right;">${row.ben}</td>
    </tr>
  `).join('');
}

function loadImportedBankState() {
  const bankId = Number(document.getElementById('cmbMoghImportBank')?.value || 1);
  const fileLabel = document.getElementById('lblMoghFileName');
  
  const hasData = AppState.bankTransactions.some(t => t.bankId === bankId);
  if (hasData) {
    if (fileLabel) fileLabel.textContent = 'صورت حساب ذخیره شده در سیستم';
    mockExcelData = AppState.bankTransactions.filter(t => t.bankId === bankId).map(t => ({
      date: t.txDate, refNo: t.refNo, debit: t.debit, credit: t.credit, desc: t.desc, ben: t.beneficiary
    }));
    renderMoghayeratImportPreview();
  } else {
    if (fileLabel) fileLabel.textContent = 'فایلی انتخاب نشده است';
    mockExcelData = [];
    renderMoghayeratImportPreview();
  }
}

function saveMoghImportedTransactions() {
  const bankId = Number(document.getElementById('cmbMoghImportBank')?.value || 1);
  if (mockExcelData.length === 0) {
    alert('لطفاً ابتدا داده‌های صورتحساب را بارگذاری کنید.');
    return;
  }
  
  // پاکسازی تراکنش‌های قدیمی این بانک
  AppState.bankTransactions = AppState.bankTransactions.filter(t => t.bankId !== bankId);
  
  // درج تراکنش‌های جدید
  mockExcelData.forEach((row, i) => {
    AppState.bankTransactions.push({
      id: i + 1,
      bankId: bankId,
      txDate: row.date,
      refNo: row.refNo,
      debit: row.debit,
      credit: row.credit,
      desc: row.desc,
      beneficiary: row.ben,
      isClosed: false
    });
  });
  
  alert('اطلاعات صورت‌حساب بانکی با موفقیت در پایگاه داده ذخیره شد.');
  updateBankStatementRangeHeader(bankId);
}

// ── زیرتب ۳: مغایرت گیری ──

function toggleMoghDateInputs(show) {
  const el = document.getElementById('divMoghCustomDates');
  if (el) el.style.display = show ? 'flex' : 'none';
}

function runMoghReconciliation() {
  const bankId = Number(document.getElementById('cmbMoghReconcileBank')?.value || 1);
  const bank = AppState.moghayeratBanks.find(b => b.id === bankId);
  if (!bank) {
    alert('لطفاً ابتدا مشخصات بانک را در تب اول تعریف کنید.');
    return;
  }
  
  const bankTxs = AppState.bankTransactions.filter(t => t.bankId === bankId);
  if (bankTxs.length === 0) {
    alert('صورتحسابی برای این بانک یافت نشد. ابتدا باید صورتحساب را در تب دوم بارگذاری و ذخیره کنید.');
    return;
  }
  
  // استخراج اقلام دفاتر بر اساس سرفصل متناظر بانک
  // برای ایجاد یک سناریوی جذاب، ما ۶ تراکنش در دفاتر ایجاد می‌کنیم که تعدادی مطابقت داشته باشند
  AppState.ledgerTransactions = [
    { id: 1, date: '1403/05/11', sanadNo: '102', debit: 0, credit: 120000000, desc: 'صدور چک ۵۱۲ در وجه علی رضایی', isClosed: false },
    { id: 2, date: '1403/05/12', sanadNo: '103', debit: 450000000, credit: 0, desc: 'دریافت حواله بانکی از شرکت آریا', isClosed: false },
    { id: 3, date: '1403/05/14', sanadNo: '104', debit: 75000000, credit: 0, desc: 'واریز نقدی صندوق به بانک', isClosed: false },
    { id: 4, date: '1403/05/14', sanadNo: '105', debit: 90000000, credit: 0, desc: 'حواله دریافتی بابت طلب شرکت سارا (ثبت اشتباه در دفتر)', isClosed: false },
    { id: 5, date: '1403/05/15', sanadNo: '106', debit: 0, credit: 20000000, desc: 'پرداخت بابت هزینه‌های خرید تجهیزات اداری (اختلاف با فاکتور بانک)', isClosed: false }
  ];
  
  // الگوریتم تطابق مغایرت
  // بانک:
  // ۱. واریز سود ۱۵,۰۰۰,۰۰۰ (بستانکار بانک) -> دفتری وجود ندارد (تراکنش باز)
  // ۲. چک ۵۱۲ ۱۲۰,۰۰۰,۰۰۰ (بدهکار بانک) -> در دفاتر بستانکار است (بسته می‌شود)
  // ۳. حواله مشتری ۴۵۰,۰۰۰,۰۰۰ (بستانکار بانک) -> در دفاتر بدهکار است (بسته می‌شود)
  // ۴. کارمزد ۵,۰۰۰ (بدهکار بانک) -> دفتری وجود ندارد (تراکنش باز)
  // ۵. واریز نقدی ۷۵,۰۰۰,۰۰۰ (بستانکار بانک) -> در دفاتر بدهکار است (بسته می‌شود)
  // ۶. خرید ۲۳,۰۰۰,۰۰۰ (بدهکار بانک) -> در دفاتر ۲۰,۰۰۰,۰۰۰ ثبت شده (تراکنش باز به دلیل اختلاف مبلغ)
  
  // بازنشانی
  bankTxs.forEach(t => t.isClosed = false);
  AppState.ledgerTransactions.forEach(t => t.isClosed = false);
  
  // تطبیق بدهکار بانک با بستانکار دفتر
  bankTxs.forEach(bt => {
    if (bt.debit > 0) {
      const match = AppState.ledgerTransactions.find(lt => lt.credit === bt.debit && !lt.isClosed);
      if (match) {
        bt.isClosed = true;
        match.isClosed = true;
      }
    } else if (bt.credit > 0) {
      const match = AppState.ledgerTransactions.find(lt => lt.debit === bt.credit && !lt.isClosed);
      if (match) {
        bt.isClosed = true;
        match.isClosed = true;
      }
    }
  });
  
  AppState.moghayeratReconciled = true;
  alert('مغایرت‌گیری بانکی با موفقیت انجام شد! نتایج تطابق در جداول نمایش داده می‌شوند.');
  
  renderMoghayeratReconcilePanel();
}

function switchBankGridSubtab(filter) {
  AppState.moghBankSubtabFilter = filter;
  renderMoghayeratReconcilePanel();
}

function switchLedgerGridSubtab(filter) {
  AppState.moghLedgerSubtabFilter = filter;
  renderMoghayeratReconcilePanel();
}

function renderMoghayeratReconcilePanel() {
  const tbodyBank = document.getElementById('tblMoghBankStatementBody');
  const tbodyLedger = document.getElementById('tblMoghLedgerBody');
  if (!tbodyBank || !tbodyLedger) return;
  
  const bankId = Number(document.getElementById('cmbMoghReconcileBank')?.value || 1);
  
  // سوییچ کلاس فعال دکمه‌های گرید بانک
  const bankSubtabs = ['all', 'debit', 'credit', 'closed', 'closedDebit', 'closedCredit', 'dup'];
  bankSubtabs.forEach(s => {
    const el = document.getElementById('btnBankSubtab' + s.charAt(0).toUpperCase() + s.slice(1));
    if (el) {
      if (s === AppState.moghBankSubtabFilter) el.classList.add('active');
      else el.classList.remove('active');
    }
  });
  
  // سوییچ کلاس فعال دکمه‌های گرید دفتر
  const ledgerSubtabs = ['all', 'debit', 'credit', 'closed', 'closedDebit', 'closedCredit', 'dup'];
  ledgerSubtabs.forEach(s => {
    const el = document.getElementById('btnLedgerSubtab' + s.charAt(0).toUpperCase() + s.slice(1));
    if (el) {
      if (s === AppState.moghLedgerSubtabFilter) el.classList.add('active');
      else el.classList.remove('active');
    }
  });
  
  // فیلترینگ تراکنش‌های بانک
  let bankList = AppState.bankTransactions.filter(t => t.bankId === bankId);
  if (AppState.moghayeratReconciled) {
    if (AppState.moghBankSubtabFilter === 'debit') bankList = bankList.filter(t => !t.isClosed && t.debit > 0);
    else if (AppState.moghBankSubtabFilter === 'credit') bankList = bankList.filter(t => !t.isClosed && t.credit > 0);
    else if (AppState.moghBankSubtabFilter === 'closed') bankList = bankList.filter(t => t.isClosed);
    else if (AppState.moghBankSubtabFilter === 'closedDebit') bankList = bankList.filter(t => t.isClosed && t.debit > 0);
    else if (AppState.moghBankSubtabFilter === 'closedCredit') bankList = bankList.filter(t => t.isClosed && t.credit > 0);
    else if (AppState.moghBankSubtabFilter === 'dup') bankList = []; // در سناریو ما تراکنش تکراری تعبیه نشده
  }
  
  document.getElementById('lblCountBankTransactions').textContent = `تعداد رکورد در این تب: ${bankList.length}`;
  
  tbodyBank.innerHTML = bankList.map((t, i) => {
    const statusText = t.isClosed 
      ? '<span class="badge badge-success">✓ بسته شده</span>' 
      : '<span class="badge badge-danger">✗ باز</span>';
      
    const rowColor = t.isClosed ? 'background-color:rgba(16, 185, 129, 0.08);' : 'background-color:rgba(239, 68, 68, 0.04);';
    
    return `
      <tr style="${rowColor}">
        <td style="padding:4px; text-align:center;">${i + 1}</td>
        <td style="padding:4px; text-align:center;">${t.txDate}</td>
        <td style="padding:4px; text-align:center;">${t.refNo}</td>
        <td style="padding:4px; text-align:left; color:#ef4444;">${t.debit === 0 ? '-' : t.debit.toLocaleString()}</td>
        <td style="padding:4px; text-align:left; color:#10b981;">${t.credit === 0 ? '-' : t.credit.toLocaleString()}</td>
        <td style="padding:4px; text-align:right;">${t.desc}</td>
        <td style="padding:4px; text-align:center;">${statusText}</td>
      </tr>
    `;
  }).join('');
  
  // فیلترینگ تراکنش‌های دفاتر
  let ledgerList = AppState.ledgerTransactions;
  if (AppState.moghayeratReconciled) {
    if (AppState.moghLedgerSubtabFilter === 'debit') ledgerList = ledgerList.filter(t => !t.isClosed && t.debit > 0);
    else if (AppState.moghLedgerSubtabFilter === 'credit') ledgerList = ledgerList.filter(t => !t.isClosed && t.credit > 0);
    else if (AppState.moghLedgerSubtabFilter === 'closed') ledgerList = ledgerList.filter(t => t.isClosed);
    else if (AppState.moghLedgerSubtabFilter === 'closedDebit') ledgerList = ledgerList.filter(t => t.isClosed && t.debit > 0);
    else if (AppState.moghLedgerSubtabFilter === 'closedCredit') ledgerList = ledgerList.filter(t => t.isClosed && t.credit > 0);
    else if (AppState.moghLedgerSubtabFilter === 'dup') ledgerList = [];
  }
  
  document.getElementById('lblCountLedgerTransactions').textContent = `تعداد رکورد در این تب: ${ledgerList.length}`;
  
  tbodyLedger.innerHTML = ledgerList.map((t, i) => {
    const statusText = t.isClosed 
      ? '<span class="badge badge-success">✓ بسته شده</span>' 
      : '<span class="badge badge-danger">✗ باز</span>';
      
    const rowColor = t.isClosed ? 'background-color:rgba(16, 185, 129, 0.08);' : 'background-color:rgba(239, 68, 68, 0.04);';
    
    return `
      <tr style="${rowColor}">
        <td style="padding:4px; text-align:center;">${i + 1}</td>
        <td style="padding:4px; text-align:center;">${t.date}</td>
        <td style="padding:4px; text-align:center;">${t.sanadNo}</td>
        <td style="padding:4px; text-align:left; color:#10b981;">${t.debit === 0 ? '-' : t.debit.toLocaleString()}</td>
        <td style="padding:4px; text-align:left; color:#ef4444;">${t.credit === 0 ? '-' : t.credit.toLocaleString()}</td>
        <td style="padding:4px; text-align:right;">${t.desc}</td>
        <td style="padding:4px; text-align:center;">${statusText}</td>
      </tr>
    `;
  }).join('');
}

// ── زیرتب ۴: پیشنهاد برای رفع مغایرت ──

function renderMoghayeratSuggestions() {
  const container = document.getElementById('divMoghSuggestionsList');
  if (!container) return;
  
  if (!AppState.moghayeratReconciled) {
    container.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted); text-align:center; padding:30px;">هیچ مغایرت بازی جهت ارائه پیشنهاد یافت نشد. لطفاً ابتدا در تب «مغایرت گیری» دکمه تهیه مغایرت را فشار دهید.</div>`;
    return;
  }
  
  // یافتن اقلام باز
  const openBank = AppState.bankTransactions.filter(t => !t.isClosed);
  const openLedger = AppState.ledgerTransactions.filter(t => !t.isClosed);
  
  if (openBank.length === 0 && openLedger.length === 0) {
    container.innerHTML = `<div style="font-size:0.8rem; color:#10b981; text-align:center; padding:30px; font-weight:bold;">✓ تبریک! هیچ مغایرتی بین صورت‌حساب بانک و دفاتر مالی شرکت وجود ندارد.</div>`;
    return;
  }
  
  let html = '';
  
  // ۱. اقلامی که در بانک هستند اما در دفاتر ثبت نشده‌اند
  openBank.forEach(b => {
    if (b.credit > 0) {
      // بانک بستانکار شده (دریافت شده) اما دفتر ثبت نکرده
      html += `
        <div style="background:rgba(56, 189, 248, 0.05); border:1px solid rgba(56, 189, 248, 0.2); border-radius:4px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="color:var(--accent-color); font-weight:bold; font-size:0.8rem;">[ثبت نشده در دفاتر]</span>
            <span style="font-size:0.8rem; margin-right:8px;">مبلغ <b>${b.credit.toLocaleString()} ریال</b> بابت <b>${b.desc}</b> در بانک واریز شده ولی در دفاتر ثبت نگردیده است.</span>
          </div>
          <button class="btn btn-primary btn-xs" onclick="generateAdjustmentSanad(${b.credit}, 'debit', '${b.desc}')">ثبت آرتیکل اصلاحی</button>
        </div>
      `;
    } else if (b.debit > 0) {
      // بانک بدهکار شده (کارمزد یا برداشت) اما دفتر ثبت نکرده
      html += `
        <div style="background:rgba(239, 68, 68, 0.05); border:1px solid rgba(239, 68, 68, 0.2); border-radius:4px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="color:#ef4444; font-weight:bold; font-size:0.8rem;">[هزینه ثبت نشده]</span>
            <span style="font-size:0.8rem; margin-right:8px;">مبلغ <b>${b.debit.toLocaleString()} ریال</b> بابت <b>${b.desc}</b> از بانک کسر شده ولی در دفاتر ثبت نگردیده است.</span>
          </div>
          <button class="btn btn-primary btn-xs" onclick="generateAdjustmentSanad(${b.debit}, 'credit', '${b.desc}')">ثبت آرتیکل اصلاحی</button>
        </div>
      `;
    }
  });
  
  // ۲. اقلامی که در دفاتر ثبت شده‌اند اما در بانک وصول نشده‌اند (مانند چک‌های معوق)
  openLedger.forEach(l => {
    if (l.credit > 0) {
      html += `
        <div style="background:rgba(245, 158, 11, 0.05); border:1px solid rgba(245, 158, 11, 0.2); border-radius:4px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="color:#f59e0b; font-weight:bold; font-size:0.8rem;">[چک معوق وصول نشده]</span>
            <span style="font-size:0.8rem; margin-right:8px;">چک شماره <b>${l.sanadNo}</b> به مبلغ <b>${l.credit.toLocaleString()} ریال</b> صادر شده ولی هنوز از بانک برداشت نشده است.</span>
          </div>
          <span style="font-size:0.75rem; color:var(--text-muted);">نیاز به اقدام اصلاحی ندارد (پیگیری وصول)</span>
        </div>
      `;
    }
  });
  
  container.innerHTML = html;
}

function generateAdjustmentSanad(amount, side, desc) {
  // شبیه‌سازی ایجاد آرتیکل اصلاحی در فرم ویرایش سند
  alert(`سند اصلاحی با شرح "${desc}" و مبلغ ${amount.toLocaleString()} ریال در دفاتر ثبت گردید.`);
  
  // تبدیل تراکنش به حالت بسته
  const bankTx = AppState.bankTransactions.find(t => t.debit === amount || t.credit === amount);
  if (bankTx) bankTx.isClosed = true;
  
  renderMoghayeratSuggestions();
  renderMoghayeratReconcilePanel();
}

// ── دکمه‌های نوار ابزار اصلی پایین ──

function exportMoghayeratExcel() {
  alert('گزارش اقلام مغایرت بانکی با فرمت اکسل تولید و در مسیر دانلودهای سیستم ذخیره شد.');
}

function printMoghStatementReport() {
  alert('گزارش چاپی صورتحساب بانکی صادر گردید.');
}

function transferMoghDescToLedger() {
  alert('انتقال شرح صورتحساب بانک به شرح ردیف دفاتر با موفقیت برای تمامی اقلام بسته شده انجام گرفت.');
}

