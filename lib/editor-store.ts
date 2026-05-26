"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EditorStore, MobileTab } from "./store/types";
export type { MobileTab, EditorStore };
import { createViewSlice } from "./store/view-slice";
import { createProjectSlice } from "./store/project-slice";
import { createFileSlice } from "./store/file-slice";
import { createComponentSlice } from "./store/component-slice";
import { createHistorySlice } from "./store/history-slice";
import { createCodeSlice } from "./store/code-slice";
import { componentsToCode } from "./tree-utils";

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get, store) => ({
      ...createViewSlice(set, get, store),
      ...createProjectSlice(set, get, store),
      ...createFileSlice(set, get, store),
      ...createComponentSlice(set, get, store),
      ...createHistorySlice(set, get, store),
      ...createCodeSlice(set, get, store),
    }),
    {
      name: "hytale-ui-studio-storage",
      // Only persist the project data and UI preferences.
      // components/imports/code are derived from projects[] and restored via onRehydrateStorage.
      partialize: (state) => ({
        projects: state.projects,
        currentProjectId: state.currentProjectId,
        currentFileId: state.currentFileId,
        viewMode: state.viewMode,
        devicePreview: state.devicePreview,
        showGrid: state.showGrid,
        snapToGrid: state.snapToGrid,
        zoom: state.zoom,
        showFileExplorer: state.showFileExplorer,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Restore working state from the active file after localStorage hydration
        const project = state.projects.find(
          (p) => p.id === state.currentProjectId,
        );
        const activeFile =
          project?.files.find((f) => f.id === state.currentFileId) ??
          project?.files[0];
        if (activeFile) {
          state.components = activeFile.components;
          state.imports   = activeFile.imports;
          state.history   = [
            { components: activeFile.components, imports: activeFile.imports },
          ];
          state.historyIndex = 0;
          state.code = componentsToCode(
            activeFile.components,
            0,
            activeFile.imports,
          );
        }
      },
    },
  ),
);
