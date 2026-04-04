import { StateCreator } from "zustand";
import { EditorStore } from "./types";
import { componentsToCode } from "../tree-utils";
import { parseAndMapCode } from "../hytale-parser";

export const createCodeSlice: StateCreator<
  EditorStore,
  [],
  [],
  Pick<
    EditorStore,
    | "code"
    | "setCode"
    | "syncCodeFromComponents"
    | "exportToUI"
    | "importFromUI"
    | "loadComponents"
  >
> = (set, get) => ({
  code: "",

  setCode: (code) => set({ code }),

  syncCodeFromComponents: () => {
    const state = get();
    const code = componentsToCode(state.components, 0, state.imports);
    set({ code });
  },

  exportToUI: () => {
    const state = get();
    return componentsToCode(state.components, 0, state.imports);
  },

  importFromUI: (code) => {
    try {
      const { components, imports } = parseAndMapCode(code);
      if (components.length > 0) {
        set((state) => ({
          components,
          code,
          imports,
          projects: state.projects.map((p) =>
            p.id === state.currentProjectId
              ? {
                  ...p,
                  files: p.files.map(f => f.id === state.currentFileId ? { ...f, components, imports, lastModified: Date.now() } : f),
                  lastModified: Date.now(),
                }
              : p,
          ),
        }));
        get().saveToHistory();
      }

    } catch (e) {
      console.error("Failed to parse", e);
    }
  },

  loadComponents: (components) => {
    set((state) => ({
      components,
      projects: state.projects.map((p) =>
        p.id === state.currentProjectId
          ? { 
              ...p, 
              files: p.files.map(f => f.id === state.currentFileId ? { ...f, components, lastModified: Date.now() } : f),
              lastModified: Date.now() 
            }
          : p,
      ),
    }));
    get().saveToHistory();
    get().syncCodeFromComponents();
  },
});
