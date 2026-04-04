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
  >
> = (set) => ({
  selectedId: null,
  viewMode: "Design",
  devicePreview: "Desktop",
  showGrid: true,
  snapToGrid: true,
  zoom: 80,
  fitToScreen: true,
  draggingId: null,
  showFileExplorer: true,
  activeMobileTab: "View",

  setShowFileExplorer: (show) => set({ showFileExplorer: show }),
  setSelectedId: (id) => set({ selectedId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setDevicePreview: (preview) => {
    let newZoom = 80;
    if (preview === "Desktop") newZoom = 80;
    if (preview === "Hytale") newZoom = 50;
    if (preview === "Tablet") newZoom = 70;
    if (preview === "Mobile") newZoom = 100;
    set({ devicePreview: preview, zoom: newZoom, fitToScreen: false });
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
