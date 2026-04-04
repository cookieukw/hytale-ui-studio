import type {
  HytaleComponent,
  EditorState,
  ViewMode,
  DevicePreview,
} from "../hytale-types";

export type MobileTab = "View" | "Event" | "Component";

export interface EditorStore extends EditorState {
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

  // Projects
  createProject: (name: string) => void;
  switchProject: (id: string) => void;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  duplicateProject: (id: string) => void;
  exitProject: () => void;

  // Files (within project)
  createFile: (name: string) => void;
  switchFile: (id: string) => void;
  deleteFile: (id: string) => void;
  renameFile: (id: string, name: string) => void;
  duplicateFile: (id: string) => void;

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
  refreshDefinitions: () => void;

  // Multi-File Export (ZIP)
  exportProject: () => Promise<void>;
  importProject: (file: File) => Promise<void>;

  showFileExplorer: boolean;
  setShowFileExplorer: (show: boolean) => void;
}
