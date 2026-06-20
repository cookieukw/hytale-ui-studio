import { StateCreator } from "zustand";
import { EditorStore } from "./types";
import { EditorState } from "../hytale-types";

// Extracted from types to keep initial state clean
export const initialPluginState: Pick<EditorState, "pluginComponents"> = {
  pluginComponents: {},
};

export const createPluginSlice: StateCreator<
  EditorStore,
  [],
  [],
  Pick<EditorStore, "pluginComponents" | "registerPluginComponent" | "clearPluginComponents">
> = (set) => ({
  ...initialPluginState,

  registerPluginComponent: (def) =>
    set((state) => ({
      pluginComponents: {
        ...state.pluginComponents,
        [def.type]: def,
      },
    })),

  clearPluginComponents: (pluginId) =>
    set((state) => {
      if (!pluginId) {
        return { pluginComponents: {} };
      }
      
      const nextComponents = { ...state.pluginComponents };
      for (const [type, def] of Object.entries(nextComponents)) {
        if (def.pluginId === pluginId) {
          delete nextComponents[type];
        }
      }
      return { pluginComponents: nextComponents };
    }),
});
