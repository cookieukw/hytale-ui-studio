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
  history: [{ components: [], imports: [] }],
  historyIndex: 0,

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      // Capture entry outside set() to avoid closure over stale state
      const entry = state.history[newIndex];
      set((state) => ({
        historyIndex: newIndex,
        components: entry.components,
        imports: entry.imports,
        projects: state.projects.map((p) =>
          p.id === state.currentProjectId
            ? {
                ...p,
                files: p.files.map((f) =>
                  f.id === state.currentFileId
                    ? {
                        ...f,
                        components: entry.components,
                        imports: entry.imports,
                        lastModified: Date.now(),
                      }
                    : f,
                ),
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
      const entry = state.history[newIndex];
      set((state) => ({
        historyIndex: newIndex,
        components: entry.components,
        imports: entry.imports,
        projects: state.projects.map((p) =>
          p.id === state.currentProjectId
            ? {
                ...p,
                files: p.files.map((f) =>
                  f.id === state.currentFileId
                    ? {
                        ...f,
                        components: entry.components,
                        imports: entry.imports,
                        lastModified: Date.now(),
                      }
                    : f,
                ),
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
    // Deep-copy components, shallow-copy imports (strings are immutable)
    newHistory.push({
      components: JSON.parse(JSON.stringify(state.components)),
      imports: [...state.imports],
    });

    // Cap at 50 entries to avoid unbounded memory growth
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },
});
