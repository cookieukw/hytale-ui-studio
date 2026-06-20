import { StateCreator } from "zustand";
import { EditorStore } from "./types";

export const createViewSlice: StateCreator<
  EditorStore,
  [],
  [],
  Pick<
    EditorStore,
    | "selectedId"
    | "viewMode"
    | "devicePreview"
    | "showGrid"
    | "snapToGrid"
    | "zoom"
    | "fitToScreen"
    | "draggingId"
    | "showFileExplorer"
    | "activeMobileTab"
    | "setSelectedId"
    | "setViewMode"
    | "setDevicePreview"
    | "toggleGrid"
    | "toggleSnap"
    | "setCalculatedZoom"
    | "setZoom"
    | "setFitToScreen"
    | "setDraggingId"
    | "setShowFileExplorer"
    | "setActiveMobileTab"
    | "activeDesktopTab"
    | "setActiveDesktopTab"
    | "isCommandPaletteOpen"
    | "setCommandPaletteOpen"
  >
> = (set) => ({
  selectedId: null,
  viewMode: "Design",
  devicePreview: "Hytale",
  showGrid: true,
  snapToGrid: true,
  zoom: 35,
  fitToScreen: false,
  draggingId: null,
  showFileExplorer: true,
  activeMobileTab: "View",
  activeDesktopTab: "workspace",
  isCommandPaletteOpen: false,

  setActiveDesktopTab: (tab) => set({ activeDesktopTab: tab }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setShowFileExplorer: (show) => set({ showFileExplorer: show }),
  setSelectedId: (id) => set({ selectedId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setDevicePreview: (preview) => {
    const zoomByDevice: Record<typeof preview, number> = {
      Desktop: 80,
      Hytale: 35,
      Tablet: 70,
      Mobile: 100,
    };
    set({ devicePreview: preview, zoom: zoomByDevice[preview], fitToScreen: false });
  },

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleSnap: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

  setCalculatedZoom: (zoom) =>
    set({ zoom: Math.max(25, Math.min(200, zoom)) }),
  
  setZoom: (zoom) =>
    set({ zoom: Math.max(25, Math.min(200, zoom)), fitToScreen: false }),

  setActiveMobileTab: (tab) => set({ activeMobileTab: tab }),
  setFitToScreen: (fit) => set({ fitToScreen: fit }),
  setDraggingId: (id) => set({ draggingId: id }),
});
