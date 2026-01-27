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

// Helper to find parent and index (0-based)
function findComponentLocation(
  components: HytaleComponent[],
  targetId: string,
  parentId: string | null = null,
): { parentId: string | null; index: number } | null {
  for (let i = 0; i < components.length; i++) {
    if (components[i].id === targetId) {
      return { parentId, index: i };
    }
    if (components[i].children) {
      const result = findComponentLocation(
        components[i].children!,
        targetId,
        components[i].id,
      );
      if (result) return result;
    }
  }
  return null;
}

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

// Helper to format Hytale colors: #RRGGBB or #RRGGBB(Alpha) checks if hex is 3 or 6 digits
const formatHytaleColor = (hex?: string, opacity?: number): string => {
  if (!hex) return "";

  // Normalize hex to 6 digits
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  if (opacity !== undefined && opacity < 1) {
    return `#${cleanHex}(${opacity})`;
  }

  return `#${cleanHex}`;
};

function componentsToCode(components: HytaleComponent[], depth = 0): string {
  let code = "";
  const spaces = "  ".repeat(depth);

  components.forEach((comp) => {
    // Header: Type #ID or Type
    const idPart = comp.name && comp.name !== comp.type ? ` #${comp.name}` : "";
    code += `${spaces}${comp.type}${idPart} {\n`;

    // Visible
    if (typeof comp.isVisible === "boolean") {
      code += `${spaces}  Visible: ${comp.isVisible};\n`;
    }

    // Text (quoted)
    if (comp.text) {
      code += `${spaces}  Text: "${comp.text}";\n`;
    }
    if (comp.placeholderText) {
      code += `${spaces}  Text: "${comp.placeholderText}";\n`;
    }

    // Value
    if (comp.value !== undefined) {
      code += `${spaces}  Value: ${comp.value};\n`;
    }
    if (comp.max !== undefined) {
      code += `${spaces}  Max: ${comp.max};\n`;
    }

    // Anchor: (Key: Val, ...) syntax
    if (comp.anchor) {
      if (comp.anchor.full) {
        code += `${spaces}  Anchor: (Full: true);\n`;
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
          code += `${spaces}  Anchor: (${parts.join(", ")});\n`;
        }
      }
    }

    // Padding: (Key: Val, ...)
    if (comp.padding) {
      const parts: string[] = [];
      if (comp.padding.top !== undefined)
        parts.push(`Top: ${comp.padding.top}`);
      if (comp.padding.bottom !== undefined)
        parts.push(`Bottom: ${comp.padding.bottom}`);
      if (comp.padding.left !== undefined)
        parts.push(`Left: ${comp.padding.left}`);
      if (comp.padding.right !== undefined)
        parts.push(`Right: ${comp.padding.right}`);
      if (parts.length > 0) {
        code += `${spaces}  Padding: (${parts.join(", ")});\n`;
      }
    }

    // LayoutMode
    if (comp.layoutMode) {
      code += `${spaces}  LayoutMode: ${comp.layoutMode};\n`;
    }
    if (comp.direction) {
      code += `${spaces}  Direction: ${comp.direction};\n`;
    }
    if (comp.flexWeight !== undefined) {
      code += `${spaces}  FlexWeight: ${comp.flexWeight};\n`;
    }

    // Background: (Key: Val, ...)
    if (comp.background) {
      const parts: string[] = [];

      // Color: #RRGGBB(Opacity) format, no quotes
      const colorString = formatHytaleColor(
        comp.background.color,
        comp.background.opacity,
      );
      if (colorString) parts.push(`Color: ${colorString}`);

      // Border: Value (Radius)
      if (comp.background.border) {
        parts.push(`Border: ${comp.background.border}`);
      }

      // Opacity is now merged into Color, so we don't list it separately for Background
      // unless user wants standalone Opacity property? Request said: "opacidade nao é um atributo. ele vai sempre do lado da cor"

      if (parts.length > 0) {
        code += `${spaces}  Background: (${parts.join(", ")});\n`;
      }
    }

    // TimerLabel Seconds
    if (comp.type === "TimerLabel" && comp.seconds !== undefined) {
      code += `${spaces}  Seconds: ${comp.seconds};\n`;
    }

    // TextStyle
    // TimerLabel uses Style: (...) syntax
    if (comp.textStyle) {
      if (comp.type === "TimerLabel") {
        const parts: string[] = [];
        if (comp.textStyle.fontSize)
          parts.push(`FontSize: ${comp.textStyle.fontSize}`);
        if (comp.textStyle.alignment)
          parts.push(`Alignment: ${comp.textStyle.alignment}`);
        if (comp.textStyle.textColor)
          parts.push(`Color: ${formatHytaleColor(comp.textStyle.textColor)}`);
        if (comp.textStyle.renderBold) parts.push(`RenderBold: true`);

        if (parts.length > 0) {
          code += `${spaces}  Style: (${parts.join(", ")});\n`;
        }
      } else {
        // Standard Element export
        if (comp.textStyle.fontSize)
          code += `${spaces}  FontSize: ${comp.textStyle.fontSize};\n`;

        // Color: #RRGGBB(Opacity), no quotes
        if (comp.textStyle.textColor) {
          const textColor = formatHytaleColor(comp.textStyle.textColor);
          code += `${spaces}  Color: ${textColor};\n`;
        }

        if (comp.textStyle.renderBold) code += `${spaces}  RenderBold: true;\n`;
        if (comp.textStyle.renderUppercase)
          code += `${spaces}  RenderUppercase: true;\n`;
        if (comp.textStyle.alignment)
          code += `${spaces}  Alignment: ${comp.textStyle.alignment};\n`;
      }
    }

    // Recursively process children
    if (comp.children && comp.children.length > 0) {
      code += componentsToCode(comp.children, depth + 1);
    }

    code += `${spaces}}\n`;
  });

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
