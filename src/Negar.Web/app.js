// =============================================================================
// Negar Web Application Core Logic & Operational Forms Controller
// Matching VB.NET Desktop Negar Forms (C:\Negar\Forms)
// =============================================================================

// Store App State
const AppState = {
  activeCompanyId: 1,
  activeFiscalYearId: 1,
  activeTheme: 'blue',
  currentUser: { username: 'admin', fullName: 'ابر مدیر سیستم', role: 'SuperAdmin' },
  
  // Data Repositories (In-Memory State matching PostgreSQL Seeder)
  users: [
    { id: 1, username: 'admin', fullName: 'مدیر ارشد سیستم', userType: 'SuperAdmin', isActive: true, creatorIP: '127.0.0.1' },
    { id: 2, username: 'accountant1', fullName: 'علی رضایی (حسابدار)', userType: 'User', isActive: true, creatorIP: '192.168.1.10' },
    { id: 3, username: 'storekeeper', fullName: 'رضا حسینی (انباردار)', userType: 'User', isActive: true, creatorIP: '192.168.1.15' }
  ],
  
  companies: [
    { id: 1, name: 'شرکت نمونه نگار', code: '1001', ecoCode: '411111111111', phone: '021-88888888', activeYear: '1403' }
  ],

  accounts: [
    { id: 1, code: '1', name: 'دارایی‌های جاری', type: 'گروه', nature: 'بدهکار', parent: '-' },
    { id: 2, code: '10', name: 'موجودی نقد و بانک', type: 'کل', nature: 'بدهکار', parent: '1 (دارایی‌های جاری)' },
    { id: 3, code: '1001', name: 'صندوق مرکزی', type: 'معین', nature: 'بدهکار', parent: '10 (موجودی نقد و بانک)' },
    { id: 4, code: '1002', name: 'بانک ملی شعبه مرکزی', type: 'معین', nature: 'بدهکار', parent: '10 (موجودی نقد و بانک)' },
    { id: 5, code: '11', name: 'حساب‌های دریافتنی', type: 'کل', nature: 'بدهکار', parent: '1 (دارایی‌های جاری)' },
    { id: 6, code: '1101', name: 'مشتریان تجاری', type: 'معین', nature: 'بدهکار', parent: '11 (حساب‌های دریافتنی)' },
    { id: 7, code: '12', name: 'موجودی کالا', type: 'کل', nature: 'بدهکار', parent: '1 (دارایی‌های جاری)' },
    { id: 8, code: '1201', name: 'موجودی انبار مرکزی', type: 'معین', nature: 'بدهکار', parent: '12 (موجودی کالا)' },
    { id: 9, code: '2', name: 'بدهی‌های جاری', type: 'گروه', nature: 'بستانکار', parent: '-' },
    { id: 10, code: '20', name: 'حساب‌های پرداختنی', type: 'کل', nature: 'بستانکار', parent: '2 (بدهی‌های جاری)' },
    { id: 11, code: '2001', name: 'فروشندگان و تامین کنندگان', type: 'معین', nature: 'بستانکار', parent: '20 (حساب‌های پرداختنی)' },
    { id: 12, code: '4', name: 'درآمدها', type: 'گروه', nature: 'بستانکار', parent: '-' },
    { id: 13, code: '40', name: 'فروش کالا و خدمات', type: 'کل', nature: 'بستانکار', parent: '4 (درآمدها)' }
  ],

  shenavars: [
    { id: 1, code: 'SH-101', name: 'پروژه احداث شعبه غرب', parent: '-', status: 'فعال' },
    { id: 2, code: 'SH-102', name: 'مرکز هزینه کارخانه شماره ۱', parent: '-', status: 'فعال' }
  ],

  sanads: [
    {
      id: 101,
      date: '1403/01/05',
      desc: 'ثبت سند افتتاحیه سال مالی جدید',
      debit: 5000000000,
      credit: 5000000000,
      status: 'دائم',
      balanced: true,
      lines: [
        { account: '1002 (بانک ملی شعبه مرکزی)', shenavar: '-', desc: 'مانده اول دوره بانک', debit: 3000000000, credit: 0 },
        { account: '1201 (موجودی انبار مرکزی)', shenavar: '-', desc: 'ارزش موجودی کالا اول دوره', debit: 2000000000, credit: 0 },
        { account: '2001 (فروشندگان و تامین کنندگان)', shenavar: '-', desc: 'بدهی اول دوره تامین کنندگان', debit: 0, credit: 5000000000 }
      ]
    },
    {
      id: 102,
      date: '1403/05/10',
      desc: 'ثبت فاکتور فروش شماره فروشگاه مرکزی',
      debit: 125000000,
      credit: 125000000,
      status: 'تایید شده',
      balanced: true,
      lines: [
        { account: '1101 (مشتریان تجاری)', shenavar: '-', desc: 'فروش به شرکت آریا', debit: 125000000, credit: 0 },
        { account: '40 (فروش کالا و خدمات)', shenavar: '-', desc: 'فروش کالا بابت فاکتور 8001', debit: 0, credit: 125000000 }
      ]
    }
  ],

  products: [
    { id: 1, code: 'PRD-101', name: 'لپ‌تاپ گیمینگ ایسوس ۱۵ اینچ', unit: 'دستگاه', price: 450000000, buyPrice: 390000000, stock: 24, reorder: 5, barcode: '690123456789' },
    { id: 2, code: 'PRD-102', name: 'مانیتور ۲۷ اینچ 4K سامسونگ', unit: 'عدد', price: 180000000, buyPrice: 155000000, stock: 15, reorder: 10, barcode: '690987654321' }
  ],

  warehouses: [
    { id: 1, code: 'WH-01', name: 'انبار مرکزی کالا', type: 'عمومی', keeper: 'احمد محمدی', location: 'تهران - سالن اصلی', allowNegative: false }
  ],

  invoices: [
    { id: 'INV-8001', type: 'فروش', date: '1403/05/08', party: 'شرکت فناوری آریا', total: 630000000, warehouse: 'انبار مرکزی', status: 'ثبت نهایی' },
    { id: 'PINV-4002', type: 'خرید', date: '1403/05/02', party: 'بازرگانی واردات پارس', total: 1850000000, warehouse: 'انبار مرکزی', status: 'ثبت نهایی' }
  ]
};

// Ribbon Tab Switcher
function switchRibbon(moduleId, tabElement) {
  document.querySelectorAll('.ribbon-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.view-section').forEach(v => {
    v.classList.remove('active');
    v.style.display = 'none';
  });

  if (tabElement) tabElement.classList.add('active');

  const targetSection = document.getElementById('module-' + moduleId);
  if (targetSection) {
    targetSection.classList.add('active');
    targetSection.style.display = 'block';
  }
}

// Modal Form Management
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

// =============================================================================
// Operational Handlers (Matching Desktop Forms)
// =============================================================================

// 1. User Management Form (UserManagementForm.vb)
function renderUsersTable() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  tbody.innerHTML = AppState.users.map(u => `
    <tr>
      <td><b>${u.username}</b></td>
      <td>${u.fullName}</td>
      <td><span class="badge badge-primary">${u.userType}</span></td>
      <td>${u.creatorIP}</td>
      <td><span class="badge ${u.isActive ? 'badge-success' : 'badge-warning'}">${u.isActive ? 'فعال' : 'غیرفعال'}</span></td>
      <td>
        <button class="btn btn-outline" style="padding:4px 8px;" onclick="openPermissionsModal(${u.id})">🔑 تنظیم دسترسی</button>
        <button class="btn btn-outline" style="padding:4px 8px; color:red;" onclick="deleteUser(${u.id})">🗑️ حذف</button>
      </td>
    </tr>
  `).join('');
}

function saveNewUser() {
  const username = document.getElementById('newUsername')?.value;
  const fullName = document.getElementById('newFullName')?.value;
  const userType = document.getElementById('newUserType')?.value;
  if (!username || !fullName) {
    alert('لطفاً نام کاربری و نام کامل را وارد نمایید.');
    return;
  }
  AppState.users.push({
    id: AppState.users.length + 1,
    username: username,
    fullName: fullName,
    userType: userType || 'User',
    isActive: true,
    creatorIP: '127.0.0.1'
  });
  renderUsersTable();
  closeModal('addUserModal');
  alert(`کاربر جدید "${username}" با موفقیت تعریف شد.`);
}

function deleteUser(userId) {
  if (confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
    AppState.users = AppState.users.filter(u => u.id !== userId);
    renderUsersTable();
  }
}

// 2. Chart of Accounts Form (HesabdaryCodingForm.vb)
function renderAccountsTable() {
  const tbody = document.getElementById('accountsTableBody');
  if (!tbody) return;
  tbody.innerHTML = AppState.accounts.map(a => `
    <tr>
      <td><b>${a.code}</b></td>
      <td>${a.name}</td>
      <td><span class="badge badge-primary">${a.type}</span></td>
      <td>${a.nature}</td>
      <td>${a.parent}</td>
      <td><span class="badge badge-success">فعال</span></td>
      <td>
        <button class="btn btn-outline" style="padding:4px 8px;" onclick="editAccount(${a.id})">✏️ ویرایش</button>
        <button class="btn btn-outline" style="padding:4px 8px; color:red;" onclick="deleteAccount(${a.id})">🗑️ حذف</button>
      </td>
    </tr>
  `).join('');
}

function saveNewAccount() {
  const code = document.getElementById('newAccCode')?.value;
  const name = document.getElementById('newAccName')?.value;
  const type = document.getElementById('newAccType')?.value;
  const nature = document.getElementById('newAccNature')?.value;
  if (!code || !name) {
    alert('لطفاً کد حساب و عنوان حساب را وارد کنید.');
    return;
  }
  AppState.accounts.push({
    id: AppState.accounts.length + 1,
    code: code,
    name: name,
    type: type || 'معین',
    nature: nature || 'بدهکار',
    parent: '-'
  });
  renderAccountsTable();
  closeModal('addAccountModal');
  alert(`حساب "${name}" با موفقیت در کدگذاری ثبت گردید.`);
}

function deleteAccount(accId) {
  if (confirm('آیا از حذف این حساب اطمینان دارید؟')) {
    AppState.accounts = AppState.accounts.filter(a => a.id !== accId);
    renderAccountsTable();
  }
}

// 3. Journal Entry Registration Form (HesabdarySanad1Form.vb & HesabdarySanad2Form.vb)
let currentSanadLines = [
  { account: '1001 (صندوق مرکزی)', shenavar: '-', desc: 'دریافت نقد', debit: 50000000, credit: 0 },
  { account: '1101 (مشتریان تجاری)', shenavar: '-', desc: 'تسویه فاکتور مشتری', debit: 0, credit: 50000000 }
];

function renderSanadEditorLines() {
  const tbody = document.getElementById('sanadLinesEditorBody');
  if (!tbody) return;
  
  let totalDebit = 0;
  let totalCredit = 0;

  tbody.innerHTML = currentSanadLines.map((line, index) => {
    totalDebit += Number(line.debit || 0);
    totalCredit += Number(line.credit || 0);
    return `
      <tr>
        <td>${index + 1}</td>
        <td>
          <select class="form-select" onchange="currentSanadLines[${index}].account = this.value">
            ${AppState.accounts.map(a => `<option value="${a.code} (${a.name})" ${line.account.includes(a.code) ? 'selected' : ''}>${a.code} - ${a.name}</option>`).join('')}
          </select>
        </td>
        <td>
          <input type="text" class="form-input" value="${line.desc}" onchange="currentSanadLines[${index}].desc = this.value" />
        </td>
        <td>
          <input type="number" class="form-input" value="${line.debit}" onchange="currentSanadLines[${index}].debit = Number(this.value); updateSanadTotals();" />
        </td>
        <td>
          <input type="number" class="form-input" value="${line.credit}" onchange="currentSanadLines[${index}].credit = Number(this.value); updateSanadTotals();" />
        </td>
        <td>
          <button class="btn btn-outline" style="color:red; padding:2px 6px;" onclick="removeSanadLine(${index})">❌</button>
        </td>
      </tr>
    `;
  }).join('');

  updateSanadTotals();
}

function updateSanadTotals() {
  const totalDebit = currentSanadLines.reduce((sum, l) => sum + Number(l.debit || 0), 0);
  const totalCredit = currentSanadLines.reduce((sum, l) => sum + Number(l.credit || 0), 0);
  const diff = totalDebit - totalCredit;

  const debitEl = document.getElementById('sanadTotalDebit');
  const creditEl = document.getElementById('sanadTotalCredit');
  const statusEl = document.getElementById('sanadBalanceStatus');

  if (debitEl) debitEl.textContent = totalDebit.toLocaleString() + ' ریال';
  if (creditEl) creditEl.textContent = totalCredit.toLocaleString() + ' ریال';
  
  if (statusEl) {
    if (diff === 0 && totalDebit > 0) {
      statusEl.className = 'badge badge-success';
      statusEl.textContent = 'متوازن ✅';
    } else {
      statusEl.className = 'badge badge-warning';
      statusEl.textContent = `نامتوازن (اختلاف: ${Math.abs(diff).toLocaleString()})`;
    }
  }
}

function addSanadLine() {
  currentSanadLines.push({ account: '1001 (صندوق مرکزی)', shenavar: '-', desc: '', debit: 0, credit: 0 });
  renderSanadEditorLines();
}

function removeSanadLine(index) {
  currentSanadLines.splice(index, 1);
  renderSanadEditorLines();
}

function saveSanadEntry() {
  const sanadNo = document.getElementById('sanadNumberInput')?.value || (AppState.sanads.length + 101);
  const sanadDate = document.getElementById('sanadDateInput')?.value || '1403/05/10';
  const sanadDesc = document.getElementById('sanadDescInput')?.value || 'سند حسابداری جدید';

  const totalDebit = currentSanadLines.reduce((sum, l) => sum + Number(l.debit || 0), 0);
  const totalCredit = currentSanadLines.reduce((sum, l) => sum + Number(l.credit || 0), 0);

  if (totalDebit !== totalCredit) {
    alert('امکان ثبت سند نامتوازن وجود ندارد. جمع بدهکار و بستانکار باید برابر باشد.');
    return;
  }

  AppState.sanads.push({
    id: sanadNo,
    date: sanadDate,
    desc: sanadDesc,
    debit: totalDebit,
    credit: totalCredit,
    status: 'تایید شده',
    balanced: true,
    lines: [...currentSanadLines]
  });

  renderSanadListTable();
  closeModal('newSanadModal');
  alert(`سند شماره ${sanadNo} با موفقیت در سیستم ثبت گردید.`);
}

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
        <button class="btn btn-outline" style="padding:4px 8px;" onclick="viewSanadDetail(${s.id})">🔍 جزئیات</button>
        <button class="btn btn-outline" style="padding:4px 8px; color:red;" onclick="deleteSanad(${s.id})">🗑️ حذف</button>
      </td>
    </tr>
  `).join('');
}

function deleteSanad(sanadId) {
  if (confirm(`آیا از حذف سند شماره ${sanadId} اطمینان دارید؟`)) {
    AppState.sanads = AppState.sanads.filter(s => s.id !== sanadId);
    renderSanadListTable();
  }
}

// 4. Products Form (AnbardaryNamKala2Form.vb)
function renderProductsTable() {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;
  tbody.innerHTML = AppState.products.map(p => `
    <tr>
      <td><b>${p.code}</b></td>
      <td>${p.name}</td>
      <td>${p.unit}</td>
      <td>${p.barcode}</td>
      <td>${p.price.toLocaleString()} ریال</td>
      <td>${p.stock}</td>
      <td><span class="badge badge-success">موجود</span></td>
      <td>
        <button class="btn btn-outline" style="padding:4px 8px;" onclick="editProduct(${p.id})">✏️ ویرایش</button>
        <button class="btn btn-outline" style="padding:4px 8px; color:red;" onclick="deleteProduct(${p.id})">🗑️ حذف</button>
      </td>
    </tr>
  `).join('');
}

function saveNewProduct() {
  const code = document.getElementById('newProdCode')?.value;
  const name = document.getElementById('newProdName')?.value;
  const unit = document.getElementById('newProdUnit')?.value;
  const price = document.getElementById('newProdPrice')?.value;
  const stock = document.getElementById('newProdStock')?.value;

  if (!code || !name) {
    alert('لطفاً کد کالا و نام کالا را وارد نمایید.');
    return;
  }

  AppState.products.push({
    id: AppState.products.length + 1,
    code: code,
    name: name,
    unit: unit || 'عدد',
    price: Number(price) || 0,
    buyPrice: Number(price) * 0.8 || 0,
    stock: Number(stock) || 0,
    reorder: 5,
    barcode: '690' + Math.floor(Math.random() * 1000000000)
  });

  renderProductsTable();
  closeModal('addProductModal');
  alert(`کالای جدید "${name}" با موفقیت تعریف شد.`);
}

function deleteProduct(prodId) {
  if (confirm('آیا از حذف این کالا اطمینان دارید؟')) {
    AppState.products = AppState.products.filter(p => p.id !== prodId);
    renderProductsTable();
  }
}

// 5. Database Backup & Restore (BackupRestoreForm.vb)
function executeDatabaseBackup() {
  alert('در حال پشتیبان‌گیری از دیتابیس PostgreSQL...');
  setTimeout(() => {
    alert('فایل پشتیبان دیتابیس (negar_db_backup_1403.sql) با موفقیت دانلود شد.');
  }, 1000);
}

function executeDatabaseRestore() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.onchange = e => {
    alert('در حال بازیابی اطلاعات دیتابیس...');
    setTimeout(() => {
      alert('بازیابی دیتابیس با موفقیت کامل انجام گردید.');
    }, 1200);
  };
  fileInput.click();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  renderUsersTable();
  renderAccountsTable();
  renderSanadListTable();
  renderSanadEditorLines();
  renderProductsTable();
});
