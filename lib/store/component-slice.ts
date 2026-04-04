import { StateCreator } from "zustand";
import { EditorStore } from "./types";
import {
  addComponentToParent,
  duplicateComponent as duplicateComponentUtil,
  findComponentById,
  findComponentLocation,
  generateId,
  removeComponentFromTree,
  updateComponentInTree,
  regenerateIds,
  collectAllNames,
} from "../tree-utils";
import { COMPONENT_DEFINITIONS } from "../component-definitions";
import type { HytaleComponent } from "../hytale-types";

export const createComponentSlice: StateCreator<
  EditorStore,
  [],
  [],
  Pick<
    EditorStore,
    | "components"
    | "imports"
    | "addComponent"
    | "updateComponent"
    | "removeComponent"
    | "duplicateComponent"
    | "moveComponent"
    | "getSelectedComponent"
    | "refreshDefinitions"
  >
> = (set, get) => ({
  components: [],
  imports: [],

  addComponent: (component, parentId = null, index) => {
    const tempComponent = {
      ...component,
      id: generateId(),
      isVisible: true,
      isLocked: false,
      isExpanded: true,
    } as HytaleComponent;

    const existingNames = collectAllNames(get().components);
    const newComponent = regenerateIds(tempComponent, existingNames);
    const id = newComponent.id;

    set((state) => {
      let imports = state.imports;
      let needsImport = false;

      if (newComponent.alias && newComponent.alias.startsWith("$C")) {
        needsImport = true;
      }

      if (
        !needsImport &&
        newComponent.scrollbarStyle &&
        newComponent.scrollbarStyle.startsWith("$C")
      ) {
        needsImport = true;
      }

      if (needsImport) {
        const hasImport = imports.some((i) => i.trim().startsWith("$C"));
        if (!hasImport) {
          imports = [`$C = "../Common.ui";`, ...imports];
        }
      }

      const newComponents = addComponentToParent(
        state.components,
        parentId,
        newComponent,
        index,
      );

      return {
        components: newComponents,
        selectedId: id,
        imports,
        projects: state.projects.map((p) =>
          p.id === state.currentProjectId
            ? {
                ...p,
                files: p.files.map((f) =>
                    f.id === state.currentFileId
                    ? { ...f, components: newComponents, imports, lastModified: Date.now() }
                    : f
                ),
                lastModified: Date.now(),
              }
            : p,
        ),
      };
    });

    get().saveToHistory();
    get().syncCodeFromComponents();
    return id;
  },

  updateComponent: (id, updates) => {
    set((state) => {
      const newComponents = updateComponentInTree(state.components, id, updates);
      return {
        components: newComponents,
        projects: state.projects.map((p) =>
          p.id === state.currentProjectId
            ? { 
                ...p, 
                files: p.files.map(f => f.id === state.currentFileId ? { ...f, components: newComponents, lastModified: Date.now() } : f),
                lastModified: Date.now() 
              }
            : p,
        ),
      };
    });
    get().saveToHistory();
    get().syncCodeFromComponents();
  },

  removeComponent: (id) => {
    const state = get();
    const component = findComponentById(state.components, id);

    if (component && component.isDeletable === false) {
      return;
    }

    set((state) => {
      const newComponents = removeComponentFromTree(state.components, id);
      return {
        components: newComponents,
        selectedId: state.selectedId === id ? null : state.selectedId,
        projects: state.projects.map((p) =>
          p.id === state.currentProjectId
            ? { 
                ...p, 
                files: p.files.map(f => f.id === state.currentFileId ? { ...f, components: newComponents, lastModified: Date.now() } : f),
                lastModified: Date.now() 
              }
            : p,
        ),
      };
    });

    get().saveToHistory();
    get().syncCodeFromComponents();
  },

  duplicateComponent: (id) => {
    const state = get();
    const comp = findComponentById(state.components, id);
    if (!comp) return;

    const existingNames = collectAllNames(state.components);
    const duplicate = duplicateComponentUtil(comp, existingNames);
    const location = findComponentLocation(state.components, id);

    if (location) {
      set((state) => {
        const newComponents = addComponentToParent(
          state.components,
          location.parentId,
          duplicate,
          location.index + 1,
        );
        return {
          components: newComponents,
          selectedId: duplicate.id,
          projects: state.projects.map((p) =>
            p.id === state.currentProjectId
              ? {
                  ...p,
                  files: p.files.map(f => f.id === state.currentFileId ? { ...f, components: newComponents, lastModified: Date.now() } : f),
                  lastModified: Date.now(),
                }
              : p,
          ),
        };
      });

      get().saveToHistory();
      get().syncCodeFromComponents();
    }
  },

  moveComponent: (id, newParentId, index) => {
    const state = get();
    const comp = findComponentById(state.components, id);
    if (!comp) return;

    let targetIndex = index;
    const location = findComponentLocation(state.components, id);

    if (location && location.parentId === newParentId) {
      if (location.index < index) {
        targetIndex = index - 1;
      }
    }

    let newComponents = removeComponentFromTree(state.components, id);
    newComponents = addComponentToParent(
      newComponents,
      newParentId,
      comp,
      targetIndex,
    );

    set((state) => ({
      components: newComponents,
      projects: state.projects.map((p) =>
        p.id === state.currentProjectId
          ? { 
              ...p, 
              files: p.files.map(f => f.id === state.currentFileId ? { ...f, components: newComponents, lastModified: Date.now() } : f),
              lastModified: Date.now() 
            }
          : p,
      ),
    }));

    get().saveToHistory();
    get().syncCodeFromComponents();
  },

  getSelectedComponent: () => {
    const state = get();
    if (!state.selectedId) return null;
    return findComponentById(state.components, state.selectedId);
  },

  refreshDefinitions: () => {
    const state = get();
    const components = [...state.components];

    const updateRecursive = (comps: HytaleComponent[]) => {
      comps.forEach((comp) => {
        const def = COMPONENT_DEFINITIONS.find((d) => d.type === comp.type);
        if (def && def.defaultProps) {
          if (def.defaultProps.alias) comp.alias = def.defaultProps.alias;
          if (def.defaultProps.scrollbarStyle) comp.scrollbarStyle = def.defaultProps.scrollbarStyle;
        }
        if (comp.children) updateRecursive(comp.children);
      });
    };

    updateRecursive(components);
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
    get().syncCodeFromComponents();
  },
});
