"use client";

import { create } from "zustand";
import type {
  HytaleComponent,
  EditorState,
  ViewMode,
  DevicePreview,
  ComponentType,
} from "./hytale-types";

export type MobileTab = "View" | "Event" | "Component";

import {
  addComponentToParent,
  componentsToCode,
  duplicateComponent as duplicateComponentUtil,
  findComponentById,
  findComponentLocation,
  generateId,
  removeComponentFromTree,
  updateComponentInTree,
} from "./tree-utils";
import { parseAndMapCode } from "./hytale-parser";

interface EditorStore extends EditorState {
  // Selection
  setSelectedId: (id: string | null) => void;

  // View
  setViewMode: (mode: ViewMode) => void;
  setDevicePreview: (preview: DevicePreview) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  setCalculatedZoom: (zoom: number) => void;
  setZoom: (zoom: number) => void;

  activeMobileTab: MobileTab;
  setActiveMobileTab: (tab: MobileTab) => void;

  fitToScreen: boolean;
  setFitToScreen: (fit: boolean) => void;

  draggingId: string | null;
  setDraggingId: (id: string | null) => void;

  // Components
  addComponent: (
    component: Omit<HytaleComponent, "id">,
    parentId?: string | null,
    index?: number,
  ) => string;
  updateComponent: (id: string, updates: Partial<HytaleComponent>) => void;
  removeComponent: (id: string) => void;
  duplicateComponent: (id: string) => void;
  moveComponent: (
    id: string,
    newParentId: string | null,
    index: number,
  ) => void;
  getSelectedComponent: () => HytaleComponent | null;

  // History
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  // Code
  setCode: (code: string) => void;
  syncCodeFromComponents: () => void;

  // Import/Export
  exportToUI: () => string;
  importFromUI: (code: string) => void;
  loadComponents: (components: HytaleComponent[]) => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  components: [],
  selectedId: null,
  viewMode: "Design",
  devicePreview: "Desktop",
  showGrid: true,
  snapToGrid: true,
  zoom: 80,
  code: "",
  history: [[]],
  historyIndex: 0,
  imports: [],

  setSelectedId: (id) => set({ selectedId: id }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setDevicePreview: (preview) => {
    let newZoom = 80; // Default Desktop
    if (preview === "Desktop") newZoom = 80;
    if (preview === "Tablet") newZoom = 70;
    if (preview === "Mobile") newZoom = 100;
    set({ devicePreview: preview, zoom: newZoom, fitToScreen: false });
  },

  fitToScreen: true,

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

  toggleSnap: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

  setCalculatedZoom: (zoom) => set({ zoom: Math.max(25, Math.min(200, zoom)) }),
  setZoom: (zoom) =>
    set({ zoom: Math.max(25, Math.min(200, zoom)), fitToScreen: false }),

  activeMobileTab: "View",
  setActiveMobileTab: (tab) => set({ activeMobileTab: tab }),

  setFitToScreen: (fit) => set({ fitToScreen: fit }),

  draggingId: null,
  setDraggingId: (id: string | null) => set({ draggingId: id }),

  addComponent: (component, parentId = null, index) => {
    const id = generateId();
    const newComponent: HytaleComponent = {
      ...component,
      id,
      isVisible: true,
      isLocked: false,
      isExpanded: true,
    };

    set((state) => {
      let imports = state.imports;
      if (newComponent.alias && newComponent.alias.startsWith("$C")) {
        const hasImport = imports.some((i) => i.trim().startsWith("$C"));
        if (!hasImport) {
          imports = [`$C = "../Common.ui";`, ...imports];
        }
      }

      return {
        components: addComponentToParent(
          state.components,
          parentId,
          newComponent,
          index,
        ),
        selectedId: id,
        imports,
      };
    });

    get().saveToHistory();
    get().syncCodeFromComponents();
    return id;
  },

  updateComponent: (id, updates) => {
    set((state) => ({
      components: updateComponentInTree(state.components, id, updates),
    }));
    get().saveToHistory();
    get().syncCodeFromComponents();
  },

  removeComponent: (id) => {
    set((state) => ({
      components: removeComponentFromTree(state.components, id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
    get().saveToHistory();
    get().syncCodeFromComponents();
  },

  duplicateComponent: (id) => {
    const state = get();
    const comp = findComponentById(state.components, id);
    if (!comp) return;

    const duplicate = duplicateComponentUtil(comp);
    const location = findComponentLocation(state.components, id);

    if (location) {
      set((state) => ({
        components: addComponentToParent(
          state.components,
          location.parentId,
          duplicate,
          location.index + 1, // Add after original
        ),
        selectedId: duplicate.id,
      }));
      get().saveToHistory();
      get().syncCodeFromComponents();
    }
  },

  moveComponent: (id, newParentId, index) => {
    const state = get();
    const comp = findComponentById(state.components, id);
    if (!comp) return;

    // Determine if we need to adjust the index
    // If moving within the same parent, and moving downwards (sourceIndex < targetIndex),
    // we need to decrement targetIndex by 1 because removal shifts subsequent items up.
    let targetIndex = index;
    const location = findComponentLocation(state.components, id);

    if (location && location.parentId === newParentId) {
      if (location.index < index) {
        targetIndex = index - 1;
      }
    }

    // Remove from current position
    let newComponents = removeComponentFromTree(state.components, id);
    // Add to new position
    newComponents = addComponentToParent(
      newComponents,
      newParentId,
      comp,
      targetIndex,
    );

    set({ components: newComponents });
    get().saveToHistory();
    get().syncCodeFromComponents();
  },

  getSelectedComponent: () => {
    const state = get();
    if (!state.selectedId) return null;
    return findComponentById(state.components, state.selectedId);
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      set({
        historyIndex: newIndex,
        components: state.history[newIndex],
      });
      get().syncCodeFromComponents();
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      set({
        historyIndex: newIndex,
        components: state.history[newIndex],
      });
      get().syncCodeFromComponents();
    }
  },

  saveToHistory: () => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(state.components)));

    // Keep max 50 history entries
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

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
        set({ components, code, imports });
        get().saveToHistory();
      }
    } catch (e) {
      console.error("Failed to parse", e);
    }
  },

  loadComponents: (components) => {
    set({ components });
    get().saveToHistory();
    get().syncCodeFromComponents();
  },
}));
