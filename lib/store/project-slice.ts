import { StateCreator } from "zustand";
import { EditorStore } from "./types";
import { generateId, regenerateIds, componentsToCode } from "../tree-utils";
import { parseAndMapCode } from "../hytale-parser";
import JSZip from "jszip";
import type { UIFile } from "../hytale-types";
import { isTauri } from "../tauri-utils";
import { getUniqueFileName } from "../utils";

export const createProjectSlice: StateCreator<
  EditorStore,
  [],
  [],
  Pick<
    EditorStore,
    | "projects"
    | "currentProjectId"
    | "createProject"
    | "switchProject"
    | "deleteProject"
    | "renameProject"
    | "duplicateProject"
    | "exitProject"
    | "exportProject"
    | "importProject"
  >
> = (set, get) => ({
  projects: [],
  currentProjectId: null,

  createProject: (name) => {
    const id = generateId();
    const mainFileId = generateId();
    
    const mainFile = {
        id: mainFileId,
        name: "Main.ui",
        components: [],
        imports: [],
        lastModified: Date.now(),
    };

    const newProject = {
      id,
      name,
      files: [mainFile],
      activeFileId: mainFileId,
      lastModified: Date.now(),
    };

    set((state) => ({
      projects: [...state.projects, newProject],
      currentProjectId: id,
      currentFileId: mainFileId,
      components: [],
      imports: [],
      selectedId: null,
      history: [{ components: [], imports: [], actionName: "Initial State" }],
      historyIndex: 0,
      code: "",
    }));
  },

  switchProject: (id) => {
    const project = get().projects.find((p) => p.id === id);
    if (!project) return;

    const activeFile = project.files.find(f => f.id === project.activeFileId) || project.files[0];
    
    set({
      currentProjectId: id,
      currentFileId: activeFile.id,
      components: activeFile.components,
      imports: activeFile.imports,
      selectedId: null,
      history: [{ components: activeFile.components, imports: activeFile.imports, actionName: "Initial State" }],
      historyIndex: 0,
    });
    get().syncCodeFromComponents();
  },

  deleteProject: (id) => {
    set((state) => {
      const newProjects = state.projects.filter((p) => p.id !== id);
      let newCurrentId = state.currentProjectId;

      if (state.currentProjectId === id) {
        newCurrentId = newProjects.length > 0 ? newProjects[0].id : null;
      }

      const projectToLoad = newProjects.find((p) => p.id === newCurrentId);
      const activeFile = projectToLoad ? (projectToLoad.files.find(f => f.id === projectToLoad.activeFileId) || projectToLoad.files[0]) : null;

      return {
        projects: newProjects,
        currentProjectId: newCurrentId,
        currentFileId: activeFile ? activeFile.id : null,
        components: activeFile ? activeFile.components : [],
        imports: activeFile ? activeFile.imports : [],
        selectedId: null,
        history: activeFile
        ? [{ components: activeFile.components, imports: activeFile.imports, actionName: "Initial State" }]
        : [{ components: [], imports: [], actionName: "Initial State" }],
        historyIndex: 0,
      };
    });
    get().syncCodeFromComponents();
  },

  renameProject: (id, name) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, name, lastModified: Date.now() } : p,
      ),
    }));
  },

  duplicateProject: (id) => {
    const project = get().projects.find((p) => p.id === id);
    if (!project) return;

    const newId = generateId();
    // Map original fileIds → new fileIds so activeFileId reference stays consistent
    const fileIdMap = new Map<string, string>();
    const newFiles = project.files.map((file) => {
      const newFileId = generateId();
      fileIdMap.set(file.id, newFileId);
      return {
        ...file,
        id: newFileId,
        // Regenerate all component IDs to prevent ID collisions across projects
        components: file.components.map((c) => regenerateIds(c, new Set())),
        lastModified: Date.now(),
      };
    });

    const newProject = {
      ...project,
      id: newId,
      name: `${project.name} (Copy)`,
      files: newFiles,
      activeFileId: fileIdMap.get(project.activeFileId ?? "") ?? newFiles[0]?.id ?? "",
      lastModified: Date.now(),
    };

    set((state) => ({
      projects: [...state.projects, newProject],
    }));
  },

  exitProject: () => {
    set({
      currentProjectId: null,
      currentFileId: null,
      components: [],
      imports: [],
      selectedId: null,
      history: [{ components: [], imports: [], actionName: "Initial State" }],
      historyIndex: 0,
      code: "",
    });
  },

  exportProject: async () => {
    const state = get();
    const project = state.projects.find((p) => p.id === state.currentProjectId);
    if (!project) return;

    const zip = new JSZip();
    const projectFolder = zip.folder(project.name);

    project.files.forEach((file) => {
      const code = componentsToCode(file.components, 0, file.imports);
      projectFolder?.file(file.name, code);
    });

    const content = await zip.generateAsync({ type: "blob" });

    if (isTauri()) {
      try {
        const { save } = await import("@tauri-apps/plugin-dialog");
        const { writeFile } = await import("@tauri-apps/plugin-fs");
        const filePath = await save({
          defaultPath: `${project.name}.zip`,
          filters: [{ name: "ZIP Archive", extensions: ["zip"] }],
        });

        if (filePath) {
          const buffer = await content.arrayBuffer();
          await writeFile(filePath, new Uint8Array(buffer));
        }
      } catch (e) {
        console.error("Tauri export failed", e);
      }
    } else {
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${project.name}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    }
  },

  importProject: async (zipFile?: File) => {
    try {
      let finalFile: any = zipFile;

      if (!finalFile && isTauri()) {
        const { open } = await import("@tauri-apps/plugin-dialog");
        const { readFile } = await import("@tauri-apps/plugin-fs");
        const filePath = await open({
          multiple: false,
          filters: [{ name: "ZIP Archive", extensions: ["zip"] }],
        });

        if (filePath && typeof filePath === "string") {
          const content = await readFile(filePath);
          finalFile = new File(
            [content],
            filePath.split(/[\/\\]/).pop() || "project.zip",
            { type: "application/zip" },
          );
        } else {
          return;
        }
      }

      if (!finalFile) return;

      const zip = await JSZip.loadAsync(finalFile);

      // Collect entries first so async resolution preserves ZIP entry order
      const zipEntries: [string, JSZip.JSZipObject][] = [];
      zip.forEach((relativePath, zipFile) => {
        if (relativePath.endsWith(".ui")) {
          zipEntries.push([relativePath, zipFile]);
        }
      });

      const parsedFiles = await Promise.all(
        zipEntries.map(async ([relativePath, zipFile]) => {
          const content = await zipFile.async("string");
          const { components, imports } = parseAndMapCode(content);
          return {
            name: relativePath.split("/").pop() || "unnamed.ui",
            components,
            imports,
          };
        }),
      );

      const files: UIFile[] = [];
      const existingNames: string[] = [];

      for (const pf of parsedFiles) {
        const uniqueName = getUniqueFileName(existingNames, pf.name);
        existingNames.push(uniqueName);
        files.push({
          id: generateId(),
          name: uniqueName,
          components: pf.components,
          imports: pf.imports,
          lastModified: Date.now(),
        });
      }

      if (files.length > 0) {
        const projectId = generateId();
        const newProject = {
          id: projectId,
          name: (finalFile as File).name.replace(".zip", ""),
          files,
          activeFileId: files[0].id,
          lastModified: Date.now(),
        };

        set((state) => ({
          projects: [...state.projects, newProject],
          currentProjectId: projectId,
          currentFileId: files[0].id,
          components: files[0].components,
          imports: files[0].imports,
          selectedId: null,
          history: [{ components: files[0].components, imports: files[0].imports, actionName: "Initial State" }],
          historyIndex: 0,
        }));
        get().syncCodeFromComponents();
      }
    } catch (e) {
      console.error("Failed to import ZIP", e);
    }
  },
});
