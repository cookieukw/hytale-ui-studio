import { StateCreator } from "zustand";
import { EditorStore } from "./types";
import { componentsToCode } from "../tree-utils";
import { parseAndMapCode } from "../hytale-parser";
import { buildScopeFromProjectFiles } from "../import-scope";

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
      // First pass reads the import lines. Second pass re-parses with the
      // constants and templates those files export, so `$Common.@TitleStyle`
      // resolves instead of silently becoming undefined.
      const firstPass = parseAndMapCode(code);
      const state = get();
      const project = state.projects.find((p) => p.id === state.currentProjectId);
      const currentFile = project?.files.find((f) => f.id === state.currentFileId);
      const scope = project
        ? buildScopeFromProjectFiles(
            firstPass.imports,
            project.files,
            currentFile?.name,
          )
        : {};

      const parsed =
        Object.keys(scope).length > 0 ? parseAndMapCode(code, scope) : firstPass;
      const { imports } = parsed;
      // Templates are added to the same list as components, marked with
      // isTemplate. This way they inherit undo/redo, file switching, and
      // persistence without needing a parallel field in each slice.
      // They come first because definitions precede usage in the source.
      const components = [...parsed.templates, ...parsed.components];

      // Previously this guard was components.length > 0, so files that only
      // define templates (Common.ui, Container.ui) were imported as nothing.
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
