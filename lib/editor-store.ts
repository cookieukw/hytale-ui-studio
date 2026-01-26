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

function generateId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function findComponentById(
  components: HytaleComponent[],
  id: string,
): HytaleComponent | null {
  for (const comp of components) {
    if (comp.id === id) return comp;
    if (comp.children) {
      const found = findComponentById(comp.children, id);
      if (found) return found;
    }
  }
  return null;
}

function updateComponentInTree(
  components: HytaleComponent[],
  id: string,
  updates: Partial<HytaleComponent>,
): HytaleComponent[] {
  return components.map((comp) => {
    if (comp.id === id) {
      return { ...comp, ...updates };
    }
    if (comp.children) {
      return {
        ...comp,
        children: updateComponentInTree(comp.children, id, updates),
      };
    }
    return comp;
  });
}

function removeComponentFromTree(
  components: HytaleComponent[],
  id: string,
): HytaleComponent[] {
  return components
    .filter((comp) => comp.id !== id)
    .map((comp) => {
      if (comp.children) {
        return {
          ...comp,
          children: removeComponentFromTree(comp.children, id),
        };
      }
      return comp;
    });
}

function addComponentToParent(
  components: HytaleComponent[],
  parentId: string | null,
  newComponent: HytaleComponent,
  index?: number,
): HytaleComponent[] {
  if (!parentId) {
    if (index !== undefined) {
      const newComps = [...components];
      newComps.splice(index, 0, newComponent);
      return newComps;
    }
    return [...components, newComponent];
  }

  return components.map((comp) => {
    if (comp.id === parentId) {
      const children = comp.children || [];
      if (index !== undefined) {
        const newChildren = [...children];
        newChildren.splice(index, 0, newComponent);
        return { ...comp, children: newChildren };
      }
      return { ...comp, children: [...children, newComponent] };
    }
    if (comp.children) {
      return {
        ...comp,
        children: addComponentToParent(
          comp.children,
          parentId,
          newComponent,
          index,
        ),
      };
    }
    return comp;
  });
}

function duplicateComponent(component: HytaleComponent): HytaleComponent {
  const newId = generateId();
  return {
    ...component,
    id: newId,
    name: `${component.name} (copy)`,
    children: component.children?.map(duplicateComponent),
  };
}

function componentsToCode(components: HytaleComponent[], indent = 0): string {
  const spaces = "  ".repeat(indent);
  let code = "";

  for (const comp of components) {
    // Type with optional #name selector
    const nameSelector = comp.name ? `#${comp.name}` : "";

    // Header line
    code += `${spaces}${comp.type}${nameSelector} {\n`;

    // Core properties
    if (comp.isVisible === false) code += `${spaces}  Visible: false\n`;
    else code += `${spaces}  Visible: true\n`; // Explicitly export true for clarity if desired, or skip strict boolean default.
    // User sample showed Visible: true unless default implies it. Let's keep explicit if defined.

    if (comp.text) code += `${spaces}  Text: "${comp.text}"\n`;
    if (comp.placeholderText)
      code += `${spaces}  PlaceholderText: "${comp.placeholderText}"\n`;
    if (comp.value !== undefined) code += `${spaces}  Value: ${comp.value}\n`;
    if (comp.source) code += `${spaces}  Source: "${comp.source}"\n`;

    // Anchor: (Key: Val, ...) syntax
    if (comp.anchor) {
      if (comp.anchor.full) {
        code += `${spaces}  Anchor: (Full: true)\n`;
      } else {
        const parts: string[] = [];
        if (comp.anchor.width !== undefined)
          parts.push(`Width: ${comp.anchor.width}`);
        if (comp.anchor.height !== undefined)
          parts.push(`Height: ${comp.anchor.height}`);
        if (comp.anchor.top !== undefined)
          parts.push(`Top: ${comp.anchor.top}`);
        if (comp.anchor.bottom !== undefined)
          parts.push(`Bottom: ${comp.anchor.bottom}`);
        if (comp.anchor.left !== undefined)
          parts.push(`Left: ${comp.anchor.left}`);
        if (comp.anchor.right !== undefined)
          parts.push(`Right: ${comp.anchor.right}`);
        if (comp.anchor.centerX !== undefined)
          parts.push(`CenterX: ${comp.anchor.centerX}`);
        if (comp.anchor.centerY !== undefined)
          parts.push(`CenterY: ${comp.anchor.centerY}`);

        if (parts.length > 0) {
          code += `${spaces}  Anchor: (${parts.join(", ")})\n`;
        }
      }
    }

    // Layout
    if (comp.layoutMode) code += `${spaces}  LayoutMode: ${comp.layoutMode}\n`;
    if (comp.flexWeight) code += `${spaces}  FlexWeight: ${comp.flexWeight}\n`;
    if (comp.direction) code += `${spaces}  Direction: ${comp.direction}\n`;

    // Padding: (Key: Val, ...)
    if (comp.padding) {
      const parts: string[] = [];
      // Check for uniform padding first? Or just list sides.
      // If all equal, maybe use Full? The types don't strictly track 'full' prop for padding, just numbers.
      if (comp.padding.top !== undefined)
        parts.push(`Top: ${comp.padding.top}`);
      if (comp.padding.bottom !== undefined)
        parts.push(`Bottom: ${comp.padding.bottom}`);
      if (comp.padding.left !== undefined)
        parts.push(`Left: ${comp.padding.left}`);
      if (comp.padding.right !== undefined)
        parts.push(`Right: ${comp.padding.right}`);

      if (parts.length > 0) {
        code += `${spaces}  Padding: (${parts.join(", ")})\n`;
      }
    }

    // Background - usually Hytale uses Background: (Color: "#...") or similar if object syntax is preferred.
    // The previous implementation used dot notation. "Background.Color".
    // User request implies full object structure. "Anchor: (...)"
    // Let's deduce Background syntax: Background is usually a struct.
    if (comp.background) {
      const parts: string[] = [];
      if (comp.background.color)
        parts.push(`Color: "${comp.background.color}"`);
      if (comp.background.border)
        parts.push(`Border: "${comp.background.border}"`);
      if (comp.background.opacity !== undefined)
        parts.push(`Opacity: ${comp.background.opacity}`);

      if (parts.length > 0) {
        // Check if user prefers "Background: (...)" or keep legacy?
        // "Anchor: (...)" implies a pattern. Let's use Tuple syntax for Background too to be safe.
        code += `${spaces}  Background: (${parts.join(", ")})\n`;
      }
    }

    // Text Style - often mixed properties like FontSize, or a style object?
    // User prompt didn't strictly specify text style grouping, but existing codebase treated them as top-level props (FontSize, TextColor).
    // The parser Global Variables section has "@DefaultLabelStyle": { props: { FontSize: 14... } }.
    // So strictly speaking, these are top-level properties on the component OR inside a style mixin.
    // I will keep them as top-level properties consistent with the parser's examples unless they are inside a defined style object.
    if (comp.textStyle) {
      if (comp.textStyle.fontSize)
        code += `${spaces}  FontSize: ${comp.textStyle.fontSize}\n`;
      if (comp.textStyle.renderBold) code += `${spaces}  RenderBold: true\n`;
      if (comp.textStyle.renderUppercase)
        code += `${spaces}  RenderUppercase: true\n`;
      if (comp.textStyle.textColor)
        code += `${spaces}  TextColor: "${comp.textStyle.textColor}"\n`;
      if (comp.textStyle.alignment)
        code += `${spaces}  Alignment: ${comp.textStyle.alignment}\n`;
    }

    // Children
    if (comp.children && comp.children.length > 0) {
      code += componentsToCode(comp.children, indent + 1);
    }

    code += `${spaces}}\n`;
  }

  return code;
}

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

  addComponent: (component, parentId = null, index) => {
    const id = generateId();
    const newComponent: HytaleComponent = {
      ...component,
      id,
      isVisible: true,
      isLocked: false,
      isExpanded: true,
    };

    set((state) => ({
      components: addComponentToParent(
        state.components,
        parentId,
        newComponent,
        index,
      ),
      selectedId: id,
    }));

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

    const duplicate = duplicateComponent(comp);

    // Find parent and add duplicate as sibling
    const findParentAndIndex = (
      components: HytaleComponent[],
      targetId: string,
      parent: string | null = null,
    ): { parentId: string | null; index: number } | null => {
      for (let i = 0; i < components.length; i++) {
        if (components[i].id === targetId) {
          return { parentId: parent, index: i + 1 };
        }
        if (components[i].children) {
          const result = findParentAndIndex(
            components[i].children!,
            targetId,
            components[i].id,
          );
          if (result) return result;
        }
      }
      return null;
    };

    const location = findParentAndIndex(state.components, id);
    if (location) {
      set((state) => ({
        components: addComponentToParent(
          state.components,
          location.parentId,
          duplicate,
          location.index,
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

    // Remove from current position
    let newComponents = removeComponentFromTree(state.components, id);
    // Add to new position
    newComponents = addComponentToParent(
      newComponents,
      newParentId,
      comp,
      index,
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
    const code = componentsToCode(state.components);
    set({ code });
  },

  exportToUI: () => {
    const state = get();
    return componentsToCode(state.components);
  },

  importFromUI: (code) => {
    try {
      const components = parseComponentsFromCode(code);
      if (components.length > 0) {
        set({ components, code });
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

// Basic parser implementation replaced by full Hytale Parser
import { parseAndMapCode } from "./hytale-parser";

// Helper/Wrapper to match existing signature if needed, or simply use parseAndMapCode
function parseComponentsFromCode(code: string): HytaleComponent[] {
  return parseAndMapCode(code);
}
