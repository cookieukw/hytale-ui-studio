import { useEffect } from "react";
import { useEditorStore } from "@/lib/editor-store";
import { handleExportImage } from "@/lib/export-utils";

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const store = useEditorStore.getState();
      const { 
        selectedId, 
        removeComponent, 
        copyComponent,
        pasteComponent,
        undo, 
        redo, 
        setCommandPaletteOpen,
        exportProject,
        duplicateComponent,
        toggleGrid,
        toggleSnap,
        setActiveDesktopTab,
        exitProject,
      } = store;

      const isCtrl = (e: KeyboardEvent) => e.ctrlKey || e.metaKey;

      const activeTag = document.activeElement?.tagName;
      const isInputActive =
        activeTag === "INPUT" ||
        activeTag === "TEXTAREA" ||
        (document.activeElement as HTMLElement)?.isContentEditable;

      // Command Palette (Ctrl+K or Cmd+K)
      if (isCtrl(e) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // Undo/Redo
      if (isCtrl(e) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (isCtrl(e) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }

      // Copy / Paste / Delete
      if (isCtrl(e) && e.key.toLowerCase() === "c" && selectedId) {
        e.preventDefault();
        copyComponent(selectedId);
        return;
      }
      if (isCtrl(e) && e.key.toLowerCase() === "v") {
        e.preventDefault();
        pasteComponent();
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && !isInputActive && selectedId) {
        e.preventDefault();
        removeComponent(selectedId);
        return;
      }

      // Save/Export Project (Ctrl+S)
      if (isCtrl(e) && !e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        exportProject();
        return;
      }

      // Duplicate Component (Ctrl+D)
      if (isCtrl(e) && e.key.toLowerCase() === "d" && !isInputActive && selectedId) {
        e.preventDefault();
        duplicateComponent(selectedId);
        return;
      }

      // Toggle Grid (Alt+G)
      if (e.altKey && !e.shiftKey && e.key.toLowerCase() === "g") {
        e.preventDefault();
        toggleGrid();
        return;
      }

      // Toggle Snap (Alt+S)
      if (e.altKey && !e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        toggleSnap();
        return;
      }

      // Export Image (Ctrl+Shift+E)
      if (isCtrl(e) && e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        handleExportImage();
        return;
      }

      // Toggle Fit to Screen (Alt+F)
      if (e.altKey && !e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        const { fitToScreen, setFitToScreen } = useEditorStore.getState();
        setFitToScreen(!fitToScreen);
        return;
      }

      // Exit Project (Alt+Q)
      if (e.altKey && !e.shiftKey && e.key.toLowerCase() === "q") {
        e.preventDefault();
        exitProject();
        return;
      }

      // Workspace Tabs (Alt+1 to Alt+4)
      if (e.altKey && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        const tabMap: Record<string, string> = {
          "1": "workspace",
          "2": "components",
          "3": "tree",
          "4": "code",
        };
        setActiveDesktopTab(tabMap[e.key]);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
