# AquaLabel 💧

> **Design beautiful custom water bottle labels — directly in your browser.**

[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Backend](https://img.shields.io/badge/Backend-None-28a745)](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

## 🌟 Overview

**AquaLabel** is a fully client-side, drag-and-drop label design platform for water bottles. Create professional, brand-ready labels in minutes — no design skills, no account required, no backend.

Whether you're planning a wedding, running a corporate event, or launching a product line, AquaLabel makes label creation fast, fun, and beautiful.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎨 **Drag-and-Drop Editor** | Intuitive canvas editor with multi-element support |
| 🗂️ **Layers Panel** | View, select, and delete elements from a visual layers list |
| ✍️ **Rich Typography** | Multiple fonts, sizes, and colors for text elements |
| ⬜⚪ **Shape Drawing** | Add rectangles and circles to your label designs |
| 🖼️ **Image Upload** | Upload logos and photos, or drag-and-drop from desktop |
| 🔍 **Live 3D Bottle Preview** | See your label wrapped on a virtual bottle before exporting |
| 🖨️ **PNG Export** | Export crisp, print-ready images instantly |
| 💾 **Auto-Save Projects** | Designs are saved in `localStorage` — no account needed |
| 🌐 **Community Gallery** | Browse, like, and use templates from other designers |
| 🌙 **Dark / Light Mode** | System-preference aware theme with manual toggle |
| ↩️ **Undo / Redo** | Up to 20-step undo history |
| 📐 **Multiple Label Sizes** | 250ml, 500ml, 1L, and Square presets |

---

## 🗂️ Project Structure

```
BOTTLE CUSTOMIZE/
├── index.html          # Landing page
├── login.html          # Sign-in page
├── signup.html         # Registration page
├── dashboard.html      # User dashboard with stats
├── design.html         # Label editor (canvas)
├── saved-designs.html  # User's saved label collection
├── community.html      # Community design gallery
├── profile.html        # User profile & preferences
├── css/
│   └── style.css       # Full design system (single stylesheet)
├── js/
│   ├── data.js         # Mock data & localStorage API
│   ├── main.js         # Navbar, theme, toast notifications
│   └── editor.js       # Canvas editor engine (LabelEditor class)
├── .gitignore
├── LICENSE
├── CONTRIBUTING.md
└── README.md
```

---

## 🚀 Getting Started

AquaLabel is a **static web application** — no installation, no build step, no server required.

### Option 1 — Open Directly (Recommended)

1. Clone or download this repository
2. Open `index.html` in any modern browser

```bash
git clone https://github.com/YOUR_USERNAME/aqua-label.git
cd aqua-label
# Open index.html in your browser
```

### Option 2 — Local Dev Server (optional)

For a clean localhost URL, use any static file server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js (npx)
npx serve .

# Using VS Code
# Install "Live Server" extension → right-click index.html → "Open with Live Server"
```

Then visit `http://localhost:8080` in your browser.

---

## 🎨 Design System

AquaLabel uses a single-source CSS design system (`css/style.css`) with:

- **HSL-based color tokens** for harmonious palette management
- **Glassmorphism** — backdrop-blur, semi-transparent backgrounds, subtle borders
- **CSS custom properties** for both light and dark themes
- **Micro-animations** — scroll-reveal, hover spring effects, float animations
- **Responsive layouts** — mobile-first grid with `clamp()` typography

### Theme Tokens

| Token | Light | Dark |
|---|---|---|
| `--primary` | `hsl(244, 82%, 62%)` | same |
| `--bg-body` | `hsl(220, 30%, 97%)` | `hsl(220, 28%, 7%)` |
| `--bg-card` | `rgba(255,255,255,0.75)` | `rgba(30,34,54,0.72)` |
| `--text-heading` | `hsl(222, 47%, 11%)` | `hsl(222, 30%, 97%)` |

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────┐
│              Browser (Pure Frontend)               │
├──────────────┬────────────────────────────────────┤
│  Presentation│  index.html, design.html, etc.     │
├──────────────┼────────────────────────────────────┤
│  Logic       │  js/editor.js (LabelEditor class)   │
│              │  js/main.js   (App, Navbar, Toast)  │
├──────────────┼────────────────────────────────────┤
│  Data        │  js/data.js + window.localStorage  │
└──────────────┴────────────────────────────────────┘
```

**No backend, no database, no API calls.** All state is persisted in the browser's `localStorage`.

---

## 🔑 Key Components

### `LabelEditor` class (`js/editor.js`)
The core canvas engine. Methods include:

| Method | Description |
|---|---|
| `addText(text, color, size, font)` | Add a text element to the canvas |
| `addImage(src)` | Add an image/logo element |
| `addShape(type)` | Add `rect` or `circle` shapes |
| `deleteSelected()` | Remove the currently selected element |
| `undo()` | Restore the previous canvas state |
| `resize(w, h)` | Resize the label canvas |
| `exportImage()` | Export canvas as a PNG data URL |
| `updateLayers()` | Sync the layers panel UI |
| `saveState()` | Push current state onto undo history |

### `App.Data` API (`js/data.js`)
Lightweight localStorage wrapper:

| Method | Description |
|---|---|
| `getUser()` | Retrieve the current user profile |
| `getDesigns()` | Get all saved designs |
| `addDesign(design)` | Save a new design |
| `deleteDesign(id)` | Delete a design by ID |
| `getCommunityDesigns()` | Get community template data |

---

## 📸 Screenshots

> Coming — replace with your own screenshots once deployed.

| Page | Preview |
|---|---|
| Landing Page | `index.html` — Hero, Features, Steps, CTA |
| Editor | `design.html` — 3-column layout with Layers Panel |
| Dashboard | `dashboard.html` — Stats + Quick Actions |
| Community | `community.html` — Filterable gallery with likes |

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.

---

## 👨‍💻 Author

Built with ❤️ by [Your Name](https://github.com/YOUR_USERNAME)

---

*AquaLabel — Because every bottle deserves a beautiful label.*
