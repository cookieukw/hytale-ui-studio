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

  const handleOpenLocal = () => {
    if (isTauri()) {
      importProject();
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
            importFromUI(text);
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
      {/* Projects Header */}
      <div className="p-8 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Hytale UI Studio
        </h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreating(true)}
            className="h-9 px-4 font-bold shadow-md shadow-primary/40"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
          <Button
            variant="outline"
            className="h-9 px-4 border-border bg-panel hover:bg-hover text-foreground"
            onClick={handleOpenLocal}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Open
          </Button>
        </div>
      </div>

      {/* Search and List */}
      <div className="flex-1 flex flex-col px-8 overflow-hidden">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name..."
            className="pl-10 h-10 bg-panel border-border text-foreground focus-visible:ring-primary/40"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isCreating && (
          <div className="mb-6 p-4 rounded-lg bg-panel border border-primary/40 animate-in fade-in slide-in-from-top-2 shadow-xl shadow-primary/5">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Project Name"
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  className="bg-background border-border h-9 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary/50 transition-colors"
                />
              </div>
              <Button size="sm" onClick={handleCreate} className="h-9 px-4 font-bold">
                Create
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsCreating(false)}
                className="h-9"
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
