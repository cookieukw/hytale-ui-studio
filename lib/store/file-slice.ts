import { StateCreator } from "zustand";
import { EditorStore } from "./types";
import { generateId } from "../tree-utils";

export const createFileSlice: StateCreator<
  EditorStore,
  [],
  [],
  Pick<
    EditorStore,
    | "currentFileId"
    | "createFile"
    | "switchFile"
    | "deleteFile"
    | "renameFile"
    | "duplicateFile"
  >
> = (set, get) => ({
  currentFileId: null,

  createFile: (name) => {
      const state = get();
      if (!state.currentProjectId) return;

      const fileId = generateId();
      const newFile = {
          id: fileId,
          name: name.endsWith(".ui") ? name : `${name}.ui`,
          components: [],
          imports: [],
          lastModified: Date.now(),
      };

      set((state) => ({
          projects: state.projects.map(p => 
              p.id === state.currentProjectId 
              ? { ...p, files: [...p.files, newFile], activeFileId: fileId, lastModified: Date.now() }
              : p
          ),
          currentFileId: fileId,
          components: [],
          imports: [],
          selectedId: null,
          history: [[]],
          historyIndex: 0,
          code: "",
      }));
  },

  switchFile: (id) => {
      const state = get();
      const project = state.projects.find(p => p.id === state.currentProjectId);
      if (!project) return;

      const file = project.files.find(f => f.id === id);
      if (!file) return;

      set((state) => ({
          projects: state.projects.map(p => 
              p.id === state.currentProjectId ? { ...p, activeFileId: id } : p
          ),
          currentFileId: id,
          components: file.components,
          imports: file.imports,
          selectedId: null,
          history: [file.components],
          historyIndex: 0,
      }));
      get().syncCodeFromComponents();
  },

  deleteFile: (id) => {
      set((state) => {
          const project = state.projects.find(p => p.id === state.currentProjectId);
          if (!project || project.files.length <= 1) return state;

          const newFiles = project.files.filter(f => f.id !== id);
          let newActiveId = project.activeFileId;

          if (project.activeFileId === id) {
              newActiveId = newFiles[0].id;
          }

          const activeFile = newFiles.find(f => f.id === newActiveId)!;

          return {
              projects: state.projects.map(p => 
                  p.id === state.currentProjectId ? { ...p, files: newFiles, activeFileId: newActiveId } : p
              ),
              currentFileId: newActiveId,
              components: activeFile.components,
              imports: activeFile.imports,
              selectedId: null,
              history: [activeFile.components],
              historyIndex: 0,
          };
      });
      get().syncCodeFromComponents();
  },

  renameFile: (id, name) => {
      const newName = name.endsWith(".ui") ? name : `${name}.ui`;
      set((state) => ({
          projects: state.projects.map(p => 
              p.id === state.currentProjectId 
              ? { ...p, files: p.files.map(f => f.id === id ? { ...f, name: newName, lastModified: Date.now() } : f) }
              : p
          ),
      }));
  },

  duplicateFile: (id) => {
      const state = get();
      const project = state.projects.find(p => p.id === state.currentProjectId);
      if (!project) return;

      const file = project.files.find(f => f.id === id);
      if (!file) return;

      const newId = generateId();
      const newFile = {
          ...file,
          id: newId,
          name: file.name.replace(".ui", " (Copy).ui"),
          lastModified: Date.now(),
      };

      set((state) => ({
          projects: state.projects.map(p => 
              p.id === state.currentProjectId ? { ...p, files: [...p.files, newFile] } : p
          ),
      }));
  },
});
