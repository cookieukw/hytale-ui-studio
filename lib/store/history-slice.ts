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
    | "jumpToHistory"
  >
> = (set, get) => ({
  history: [{ components: [], imports: [], actionName: "Initial State" }],
  historyIndex: 0,

  undo: () => {
    get().jumpToHistory(get().historyIndex - 1);
  },

  redo: () => {
    get().jumpToHistory(get().historyIndex + 1);
  },

  jumpToHistory: (index: number) => {
    const state = get();
    if (index >= 0 && index < state.history.length && index !== state.historyIndex) {
      const entry = state.history[index];
      set((state) => ({
        historyIndex: index,
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

  saveToHistory: (actionName?: string) => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    // Deep-copy components, shallow-copy imports (strings are immutable)
    newHistory.push({
      components: JSON.parse(JSON.stringify(state.components)),
      imports: [...state.imports],
      actionName: actionName || "State Change",
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
