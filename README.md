# Hytale UI Studio

[![Portuguese](https://img.shields.io/badge/lang-pt--br-green.svg)](README.pt-br.md)

Hytale UI Studio is a powerful, web-based visual editor designed specifically for creating and managing user interfaces for **Hytale**. Built with modern web technologies, it provides an intuitive drag-and-drop experience coupled with a real-time code editor and live preview.

![Hytale UI Studio Preview](/public/hytale-studio_foreground.png)

## 🚀 Key Features

- **Visual Canvas**: Drag and drop components to build your UI visually.
- **Real-time Preview**: See your changes instantly with a live rendered view.
- **Component Palette**: A vast library of ready-to-use Hytale-style components.
- **Hierarchy Tree**: Easily manage complex UI structures with a nested tree view.
- **Inspector**: Fine-tune component properties, styles, and events.
- **Full Code Control**: Direct access to the underlying `.ui` XML/JSON structure for advanced users.
- **Undo/Redo**: Full history support for your editing session.
- **Export/Import**: Seamlessly save and load your designs using the `.ui` format.
- **Mobile Friendly**: Fully responsive design for editing on the go.

## 🛠️ Built With

- **[Next.js](https://nextjs.org/)** - React Framework for the Web.
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework.
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible UI components.
- **[Zustand](https://github.com/pmndrs/zustand)** - State management.
- **[Lucide React](https://lucide.dev/)** - Beautiful & consistent icons.
- **[Typescript](https://www.typescriptlang.org/)** - For type safety and better DX.

## 📥 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- pnpm (or npm/yarn)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/hytale-ui-studio-2.git
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

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
1. Push a tag starting with `v` (e.g., `git tag v1.0.0 && git push --tags`).
2. GitHub will automatically create a draft release with all the installers attached.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

_Made with ❤️ for the Hytale community._
