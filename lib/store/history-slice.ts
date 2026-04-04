import { StateCreator } from "zustand";
import { EditorStore } from "./types";

export const createHistorySlice: StateCreator<
  EditorStore,
  [],
  [],
  Pick<
    EditorStore,
    | "history"
    | "historyIndex"
    | "undo"
    | "redo"
    | "saveToHistory"
  >
> = (set, get) => ({
  history: [[]],
  historyIndex: 0,

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      set((state) => ({
        historyIndex: newIndex,
        components: state.history[newIndex],
        projects: state.projects.map((p) =>
          p.id === state.currentProjectId
            ? {
                ...p,
                files: p.files.map(f => f.id === state.currentFileId ? { ...f, components: state.history[newIndex], lastModified: Date.now() } : f),
                lastModified: Date.now(),
              }
            : p,
        ),
      }));

      get().syncCodeFromComponents();
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      set((state) => ({
        historyIndex: newIndex,
        components: state.history[newIndex],
        projects: state.projects.map((p) =>
          p.id === state.currentProjectId
            ? {
                ...p,
                files: p.files.map(f => f.id === state.currentFileId ? { ...f, components: state.history[newIndex], lastModified: Date.now() } : f),
                lastModified: Date.now(),
              }
            : p,
        ),
      }));

      get().syncCodeFromComponents();
    }
  },

  saveToHistory: () => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(state.components)));

    if (newHistory.length > 50) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },
});
