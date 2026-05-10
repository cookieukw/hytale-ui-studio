# Hytale UI Studio

[![Português](https://img.shields.io/badge/🇧🇷_Português-green.svg)](README.pt-br.md)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

Hytale UI Studio is a powerful visual editor designed specifically for creating and managing user interfaces for **Hytale**. Built with modern web technologies and packaged as a native desktop app via **Tauri 2**, it provides an intuitive drag-and-drop experience coupled with a real-time code editor and live preview.

![Hytale UI Studio Preview](/public/hytale-studio_foreground.png)

---

## 📸 Screenshots

| Project List | Editor (Empty Canvas) | Login Layout Example |
|:---:|:---:|:---:|
| ![Projects](/public/screenshot-projects.png) | ![Editor](/public/screenshot-editor.png) | ![Login Layout](/public/screenshot-login-layout.png) |

---

## 🚀 Features

| Category | Feature | Description |
|---|---|---|
| 🎨 **Editor** | Visual Canvas | Drag and drop components to build your UI visually |
| 🎨 **Editor** | Real-time Preview | See your changes instantly with a live rendered view |
| 🎨 **Editor** | Design / Blueprint / Split views | Switch between visual design, blueprint, and split modes |
| 🧩 **Components** | Component Palette | A library of ready-to-use Hytale-style components (Group, Panel, Scroll Area, etc.) |
| 🧩 **Components** | Input Components | Text Field, Number Field, and more |
| 🧩 **Components** | Imported UI | Import and reuse UI files within your layouts |
| 🌳 **Hierarchy** | Tree View | Easily manage complex UI structures with a nested tree view |
| 🌳 **Hierarchy** | Multi-file Workspace | Work with multiple `.ui` files in a single project |
| 🔍 **Inspector** | Property Editor | Fine-tune Anchor, Padding, Margin, Layout, and more |
| 🔍 **Inspector** | Style Editor | Adjust component styles, inheritance, and visual properties |
| 💻 **Code** | Code View | Direct access to the underlying `.ui` markup for advanced users |
| 💻 **Code** | Live Sync | Code and visual canvas stay in sync in real-time |
| 📂 **Project** | Project Management | Create, open, search, and manage multiple UI projects |
| 📂 **Project** | Export/Import | Seamlessly save and load your designs using the `.ui` format |
| ⏪ **History** | Undo/Redo | Full history support for your editing session |
| 📱 **Platform** | Desktop App | Native desktop app for Linux and Windows via Tauri 2 |

---

## 🛠️ Built With

| Technology | Purpose |
|---|---|
| [Vite](https://vitejs.dev/) | Fast frontend build tool |
| [React](https://react.dev/) | UI library |
| [Tauri 2](https://v2.tauri.app/) | Native desktop app framework |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework |
| [Radix UI](https://www.radix-ui.com/) | Unstyled, accessible UI components |
| [Zustand](https://github.com/pmndrs/zustand) | State management |
| [Lucide React](https://lucide.dev/) | Beautiful & consistent icons |
| [TypeScript](https://www.typescriptlang.org/) | Type safety and better DX |

---

## 📥 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [pnpm](https://pnpm.io/) (or npm/yarn)
- [Rust](https://rustup.rs/) (for Tauri builds)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/cookieukw/hytale-ui-studio.git
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm tauri:dev
   ```

---

## 📦 Building

You can build Hytale UI Studio for Linux and Windows.

### 🐧 Build for Linux (Local)

To build the application on your Linux machine, run the provided script:

```bash
./scripts/build.sh
```

The output will be in `src-tauri/target/release/bundle/`.

### 🪟 Build for Windows & Linux (CI/CD)

The project is configured with **GitHub Actions**. Every time you push to the `main` branch:
1. It automatically builds for both Windows and Linux.
2. You can download the binaries from the **Actions** tab on GitHub.

To create an official **Release**:
1. Push a tag starting with `v` (e.g., `git tag v2.0.0 && git push --tags`).
2. GitHub will automatically create a draft release with all the installers attached.

---

## 📄 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

---

_Made with ❤️ for the Hytale community._
