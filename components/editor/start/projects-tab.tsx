"use client";

import { useState } from "react";
import { Plus, FolderOpen, Search, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/lib/editor-store";
import { ProjectItem } from "./project-item";
import { isTauri } from "@/lib/tauri-utils";

export function ProjectsTab() {
  const projects = useEditorStore((s) => s.projects);
  const createProject = useEditorStore((s) => s.createProject);
  const switchProject = useEditorStore((s) => s.switchProject);
  const deleteProject = useEditorStore((s) => s.deleteProject);
  const renameProject = useEditorStore((s) => s.renameProject);
  const duplicateProject = useEditorStore((s) => s.duplicateProject);
  const importFromUI = useEditorStore((s) => s.importFromUI);
  const importProject = useEditorStore((s) => s.importProject);

  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const filteredProjects = projects
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.lastModified - a.lastModified);

  const handleCreate = () => {
    if (!newProjectName.trim()) return;
    createProject(newProjectName);
    setIsCreating(false);
    setNewProjectName("");
  };

  const handleOpenLocal = async () => {
    if (isTauri()) {
      try {
        const { open } = await import("@tauri-apps/plugin-dialog");
        const { readTextFile, readFile } = await import("@tauri-apps/plugin-fs");
        const filePath = await open({
          multiple: false,
          filters: [
            { name: "Hytale UI or ZIP", extensions: ["zip", "ui"] },
          ],
        });
        
        if (filePath && typeof filePath === "string") {
          if (filePath.endsWith(".zip")) {
            const content = await readFile(filePath);
            const finalFile = new File(
              [content],
              filePath.split(/[\/\\]/).pop() || "project.zip",
              { type: "application/zip" },
            );
            importProject(finalFile);
          } else if (filePath.endsWith(".ui")) {
            const content = await readTextFile(filePath);
            const name = filePath.split(/[\/\\]/).pop() || "Imported.ui";
            createProject(name.replace(".ui", ""));
            importFromUI(content);
          }
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".zip,.ui";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          if (file.name.endsWith(".zip")) {
            importProject(file);
          } else {
            const text = await file.text();
            createProject(file.name.replace(".ui", ""));
            importFromUI(text);
          }
        }
      };
      input.click();
    }
  };

  return (
    <>
      {/* Search and Action Bar (IntelliJ Style) */}
      <div className="px-8 py-5 flex items-center justify-between border-b border-border">
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#868A91]" />
          <Input
            placeholder="Search projects"
            className="pl-9 h-8 bg-transparent border-none text-[#BCBEC4] placeholder:text-[#868A91] text-xs focus-visible:ring-0 focus-visible:bg-[#2B2D30]/50 rounded-md transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreating(true)}
            className="h-8 px-3 text-xs font-medium bg-[#3574F0] hover:bg-[#3574F0]/90 text-white rounded-md border-none shadow-none"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Project
          </Button>
          <Button
            variant="outline"
            className="h-8 px-3 text-xs font-medium border-[#3A3D41] bg-[#2B2D30] hover:bg-[#35373B] text-[#BCBEC4] rounded-md"
            onClick={handleOpenLocal}
          >
            <FolderOpen className="h-3.5 w-3.5 mr-1.5" />
            Open
          </Button>
        </div>
      </div>

      {/* Projects List Container */}
      <div className="flex-1 flex flex-col px-8 py-4 overflow-hidden">
        {isCreating && (
          <div className="mb-4 p-3 rounded-md bg-[#2B2D30] border border-[#3A3D41] shadow-sm">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Project Name"
                autoFocus
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="bg-[#1E1F22] border-[#3A3D41] h-8 text-xs text-[#BCBEC4] focus-visible:ring-0"
              />
              <Button size="sm" onClick={handleCreate} className="h-8 px-3 text-xs bg-[#3574F0] text-white">
                Create
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsCreating(false)}
                className="h-8 px-3 text-xs text-[#868A91] hover:text-[#BCBEC4]"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="space-y-1 pb-8">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  onOpen={() => switchProject(project.id)}
                  onRename={(name) => renameProject(project.id, name)}
                  onDelete={() => deleteProject(project.id)}
                  onDuplicate={() => duplicateProject(project.id)}
                />
              ))
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-xl bg-panel/20">
                <Layout className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-sm">No recent projects found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
