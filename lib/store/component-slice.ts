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
  isContainerType,
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
    | "clipboardComponent"
    | "copyComponent"
    | "pasteComponent"
    | "refreshDefinitions"
  >
> = (set, get) => ({
  components: [],
  imports: [],
  clipboardComponent: null,

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

    get().saveToHistory("Add Component");
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
    get().saveToHistory("Update Component");
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

    get().saveToHistory("Delete Component");
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

      get().saveToHistory("Duplicate Component");
      get().syncCodeFromComponents();
    }
  },

  copyComponent: (id) => {
    const state = get();
    const comp = findComponentById(state.components, id);
    if (!comp) return;

    // Deep clone the component to put it in clipboard, ensuring we don't hold references
    const clone = JSON.parse(JSON.stringify(comp));
    set({ clipboardComponent: clone });
  },

  pasteComponent: () => {
    const state = get();
    if (!state.clipboardComponent) return;

    const existingNames = collectAllNames(state.components);
    // Duplicate the clipboard component to get fresh IDs and unique names
    const duplicate = duplicateComponentUtil(state.clipboardComponent, existingNames);
    
    // Determine where to paste
    let targetParentId: string | null = null;
    let targetIndex: number | undefined = undefined;

    if (state.selectedId) {
      const selectedComp = findComponentById(state.components, state.selectedId);
      if (selectedComp) {
        // If selected component can have children (Group, Panel), paste inside it at the end
        if (isContainerType(selectedComp.type)) {
          targetParentId = selectedComp.id;
        } else {
          // Otherwise, paste as a sibling right after it
          const location = findComponentLocation(state.components, state.selectedId);
          if (location) {
            targetParentId = location.parentId;
            targetIndex = location.index + 1;
          }
        }
      }
    }

    set((state) => {
      const newComponents = addComponentToParent(
        state.components,
        targetParentId,
        duplicate,
        targetIndex,
      );
      return {
        components: newComponents,
        selectedId: duplicate.id, // Select the newly pasted component
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

    get().saveToHistory("Paste Component");
    get().syncCodeFromComponents();
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

    get().saveToHistory("Move Component");
    get().syncCodeFromComponents();
  },

  getSelectedComponent: () => {
    const state = get();
    if (!state.selectedId) return null;
    return findComponentById(state.components, state.selectedId);
  },

  refreshDefinitions: () => {
    const state = get();

    const updateRecursive = (comps: HytaleComponent[]): HytaleComponent[] =>
      comps.map((comp) => {
        const def = COMPONENT_DEFINITIONS.find((d) => d.type === comp.type);
        // Build a new object only if something actually changes
        let updated: HytaleComponent = comp;
        if (def?.defaultProps) {
          const overrides: Partial<HytaleComponent> = {};
          if (def.defaultProps.alias !== undefined) overrides.alias = def.defaultProps.alias;
          if (def.defaultProps.scrollbarStyle !== undefined) overrides.scrollbarStyle = def.defaultProps.scrollbarStyle;
          if (Object.keys(overrides).length > 0) updated = { ...comp, ...overrides };
        }
        if (comp.children) {
          const newChildren = updateRecursive(comp.children);
          // Only create new object if children actually changed
          if (newChildren !== comp.children) updated = { ...updated, children: newChildren };
        }
        return updated;
      });

    const updatedComponents = updateRecursive(state.components);
    set((state) => ({
      components: updatedComponents,
      projects: state.projects.map((p) =>
        p.id === state.currentProjectId
          ? {
              ...p,
              files: p.files.map((f) =>
                f.id === state.currentFileId
                  ? { ...f, components: updatedComponents, lastModified: Date.now() }
                  : f,
              ),
              lastModified: Date.now(),
            }
          : p,
      ),
    }));
    get().syncCodeFromComponents();
  },
});
