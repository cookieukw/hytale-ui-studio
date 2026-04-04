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
      // Partialize to avoid persisting everything (like history or dragging state) if desired
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
    }
  )
);
