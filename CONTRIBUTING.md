# Contributing to AquaLabel 💧

Thank you for your interest in contributing to AquaLabel! We welcome all kinds of contributions — bug fixes, feature improvements, design enhancements, and documentation.

---

## 🚀 Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/aqua-label.git
   cd aqua-label
   ```
3. Open `index.html` in a browser to verify it works
4. Create a **new branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## 📁 Project Overview

This is a **100% static frontend** project (HTML + CSS + Vanilla JS). There is no build system, no package manager, and no backend. All changes are in:

| File/Folder | Purpose |
|---|---|
| `css/style.css` | The entire design system — edit only here for styles |
| `js/editor.js` | Canvas editor logic (`LabelEditor` class) |
| `js/main.js` | Navigation, theme, and toast notifications |
| `js/data.js` | localStorage API and mock data |
| `*.html` | Page templates |

---

## 🎨 Style Guide

### CSS
- All design tokens are defined as CSS custom properties in `:root` in `style.css`
- Use tokens instead of hardcoded values: `var(--primary)` not `#6366f1`
- Follow the existing HSL-based palette
- Add dark-mode overrides in the `[data-theme="dark"]` block

### JavaScript
- Use `const` and arrow functions where possible
- All editor functionality should be methods of the `LabelEditor` class
- Use `window.App.showToast(message, type)` for user feedback
- After mutating `editor.elements`, always call `editor.render()` and `editor.updateLayers()`

### HTML
- Use semantic elements (`<header>`, `<main>`, `<section>`, `<footer>`, `<aside>`)
- Every page should have a unique `<title>` and `<meta name="description">`
- IDs must be unique and descriptive

---

## 🐛 Bug Reports

When filing a bug, please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and OS information
- Console errors (if any)

---

## 💡 Feature Requests

Open an issue with the `enhancement` label. Include:
- A clear description of the feature
- Why it would be useful
- Any mockups or examples (optional but helpful)

---

## ✅ Pull Request Checklist

Before opening a PR, please ensure:

- [ ] The code works in Chrome, Firefox, and Edge
- [ ] Dark mode is tested and looks correct
- [ ] Mobile responsiveness is maintained
- [ ] No backend or server dependencies are added
- [ ] CSS changes use existing design tokens
- [ ] The `README.md` is updated if necessary

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
