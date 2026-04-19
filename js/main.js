// Main Application Logic & Navigation
window.App = window.App || {};

(function () {
  // ── Path helpers (works from root OR /pages/) ──────────────────
  const inPages = window.location.pathname.replace(/\\/g, '/').includes('/pages/');
  const home    = inPages ? '../index.html'   : 'index.html';
  const P       = inPages ? ''               : 'pages/';   // prefix for page links

  // ── Theme Management ───────────────────────────────────────────
  const initTheme = () => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };
  initTheme();

  const toggleTheme = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
    updateThemeIcon();
  };

  const updateThemeIcon = () => {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.innerHTML = isDark ? '☀️' : '🌙';
    btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    btn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  };

  // ── Navbar Renderer ────────────────────────────────────────────
  const renderNavbar = () => {
    const pathParts = window.location.pathname.replace(/\\/g, '/').split('/');
    const page = pathParts.pop() || 'index.html';

    const isAuthPage  = page === 'login.html'  || page === 'signup.html';
    const isLanding   = page === 'index.html'  || page === '';

    const themeBtn = `<button id="theme-toggle" class="btn btn-ghost btn-sm" style="width:40px;height:40px;padding:0;font-size:1.15rem;" aria-label="Toggle Theme"></button>`;

    let navContent = '';

    if (isAuthPage) {
      navContent = `
        <div class="container nav-container">
          <a href="${home}" class="logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            AquaLabel
          </a>
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <a href="${home}" class="btn btn-outline btn-sm">← Home</a>
            ${themeBtn}
          </div>
        </div>`;

    } else if (isLanding) {
      navContent = `
        <div class="container nav-container">
          <a href="${home}" class="logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            AquaLabel
          </a>
          <div class="nav-links" style="align-items:center;">
            <a href="${P}community.html">Community</a>
            <a href="${P}login.html">Login</a>
            <a href="${P}signup.html" class="btn btn-primary btn-sm" style="color:white;">Sign Up Free</a>
            ${themeBtn}
          </div>
        </div>`;

    } else {
      // App pages (dashboard, design, saved-designs, community, profile)
      navContent = `
        <div class="container nav-container">
          <a href="${P}dashboard.html" class="logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            AquaLabel
          </a>
          <div class="nav-links" style="align-items:center;">
            <a href="${P}dashboard.html"      class="${page === 'dashboard.html'      ? 'active' : ''}">Dashboard</a>
            <a href="${P}design.html"         class="${page === 'design.html'         ? 'active' : ''}">Create</a>
            <a href="${P}saved-designs.html"  class="${page === 'saved-designs.html'  ? 'active' : ''}">My Designs</a>
            <a href="${P}community.html"      class="${page === 'community.html'      ? 'active' : ''}">Community</a>
            <a href="${P}profile.html"        class="${page === 'profile.html'        ? 'active' : ''}">Profile</a>
            <a href="${home}" style="color:var(--danger);font-weight:600;font-size:0.88rem;">Logout</a>
            ${themeBtn}
          </div>
        </div>`;
    }

    const nav = document.createElement('nav');
    nav.className = 'navbar';
    nav.innerHTML = navContent;
    document.body.prepend(nav);

    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggleTheme);
    updateThemeIcon();
  };

  // ── Toast Notifications ────────────────────────────────────────
  const showToast = (message, type = 'info') => {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const icon = icons[type] || 'ℹ️';

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
        <div class="toast-msg">${message}</div>
      </div>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // ── Public API ─────────────────────────────────────────────────
  window.App.showToast = showToast;
  window.App.inPages   = inPages;
  window.App.home      = home;
  window.App.P         = P;

  // ── Init ───────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', renderNavbar);
})();
