// Negar Web Client Application Logic

function switchView(viewId) {
  // Hide all sections
  const sections = document.querySelectorAll('.view-section');
  sections.forEach(s => s.classList.remove('active'));

  // Remove active class from nav items
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(n => n.classList.remove('active'));

  // Show target section
  const targetSection = document.getElementById('view-' + viewId);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Highlight active menu item
  event.currentTarget?.classList?.add('active');
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'blue';
  let nextTheme = 'dark';
  if (currentTheme === 'dark') nextTheme = 'light';
  else if (currentTheme === 'light') nextTheme = 'blue';

  changeTheme(nextTheme);
}

function changeTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  const labels = { 'blue': 'آبی', 'dark': 'تیره', 'light': 'روشن' };
  const labelEl = document.getElementById('themeLabel');
  if (labelEl) labelEl.textContent = labels[themeName] || themeName;

  const selectEl = document.getElementById('themeSelect');
  if (selectEl) selectEl.value = themeName;
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

// Service Worker for Mobile PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
