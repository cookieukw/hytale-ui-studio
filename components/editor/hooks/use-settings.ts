import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CanvasBackgroundType = "transparent" | "solid" | "image";

export interface SettingsState {
  // Editor
  editorFontSize: number;
  editorWordWrap: boolean;
  editorMinimap: boolean;
  
  // Canvas
  canvasBackgroundType: CanvasBackgroundType;
  canvasBackgroundColor: string;
  canvasBackgroundImage: string | null;
  showBoundingBoxes: boolean;
  
  // Project
  defaultAuthorName: string;
  autoSaveEnabled: boolean;

  // Actions
  updateSetting: <K extends keyof Omit<SettingsState, "updateSetting">>(
    key: K,
    value: SettingsState[K]
  ) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      // Defaults
      editorFontSize: 14,
      editorWordWrap: true,
      editorMinimap: false,
      
      canvasBackgroundType: "transparent",
      canvasBackgroundColor: "#1a1a1a",
      canvasBackgroundImage: null,
      showBoundingBoxes: false,
      
      defaultAuthorName: "Hytale Modder",
      autoSaveEnabled: true,

      updateSetting: (key, value) => set((state) => ({ ...state, [key]: value })),
    }),
    {
      name: 'hytale-ui-studio-settings', // name of the item in the storage (must be unique)
    }
  )
);
