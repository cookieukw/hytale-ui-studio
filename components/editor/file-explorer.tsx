"use client";

import { useEditorStore } from "@/lib/editor-store";
import { FileCode, Plus, Trash2, Edit2, Copy, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function FileExplorer() {
  const currentProjectId = useEditorStore((state) => state.currentProjectId);
  const currentFileId = useEditorStore((state) => state.currentFileId);
  const projects = useEditorStore((state) => state.projects);
  
  const createFile = useEditorStore((state) => state.createFile);
  const switchFile = useEditorStore((state) => state.switchFile);
  const deleteFile = useEditorStore((state) => state.deleteFile);
  const renameFile = useEditorStore((state) => state.renameFile);
  const duplicateFile = useEditorStore((state) => state.duplicateFile);
  const importFromUI = useEditorStore((state) => state.importFromUI);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [editingFileId, setEditingFileId] = useState<string | null>(null);

  const project = projects.find((p) => p.id === currentProjectId);
  if (!project) return null;

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      createFile(newFileName.trim());
      setNewFileName("");
      setIsCreateDialogOpen(false);
    }
  };

  const handleImportFile = async () => {
    // Import tauri conditionally or handle via standard input
    try {
      const { isTauri } = await import("@/lib/tauri-utils");
      if (isTauri()) {
        const { open } = await import("@tauri-apps/plugin-dialog");
        const { readTextFile } = await import("@tauri-apps/plugin-fs");
        const filePath = await open({
          multiple: false,
          filters: [{ name: "Hytale UI", extensions: ["ui"] }],
        });
        if (filePath && typeof filePath === "string") {
          const content = await readTextFile(filePath);
          const name = filePath.split(/[\/\\]/).pop() || "Imported.ui";
          createFile(name);
          importFromUI(content);
        }
      } else {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".ui";
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const text = await file.text();
            createFile(file.name);
            importFromUI(text);
          }
        };
        input.click();
      }
    } catch (e) {
      console.error("Failed to import file", e);
    }
  };

  const handleRenameFile = () => {
    if (editingFileId && newFileName.trim()) {
      renameFile(editingFileId, newFileName.trim());
      setNewFileName("");
      setIsRenameDialogOpen(false);
      setEditingFileId(null);
    }
  };

  const openRenameDialog = (id: string, currentName: string) => {
    setEditingFileId(id);
    setNewFileName(currentName);
    setIsRenameDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-sidebar animate-in slide-in-from-left duration-300">
      <div className="p-3 border-b border-border flex items-center justify-between bg-panel-header/20">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground/90">
          <FileCode className="h-4 w-4 text-primary" />
          Workspace
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={handleImportFile}
            title="Import .ui file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => setIsCreateDialogOpen(true)}
            title="New file"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {project.files.map((file) => (
          <div
            key={file.id}
            className={cn(
              "group flex items-center justify-between p-2 rounded-md cursor-pointer transition-all duration-200",
              currentFileId === file.id
                ? "bg-primary/20 text-primary border border-primary/20"
                : "hover:bg-hover/50 text-muted-foreground hover:text-foreground border border-transparent"
            )}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("type", "file");
              e.dataTransfer.setData("fileName", file.name);
              e.dataTransfer.setData("fileId", file.id);
              e.dataTransfer.effectAllowed = "copyMove";
            }}
            onClick={() => switchFile(file.id)}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <FileCode className={cn("h-4 w-4 shrink-0", currentFileId === file.id ? "text-primary" : "text-muted-foreground")} />
              <span className="text-sm truncate font-medium">{file.name}</span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateFile(file.id);
                }}
                className="p-1 hover:text-primary transition-colors"
                title="Duplicate"
              >
                <Copy className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openRenameDialog(file.id, file.name);
                }}
                className="p-1 hover:text-primary transition-colors"
                title="Rename"
              >
                <Edit2 className="h-3 w-3" />
              </button>
              {project.files.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file.id);
                  }}
                  className="p-1 hover:text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dialogs */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-panel border-border">
          <DialogHeader>
            <DialogTitle>New UI File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="filename.ui"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFile()}
              className="bg-background border-border focus:ring-primary/30 active:border-primary/50"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFile} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Create File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="bg-panel border-border">
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="filename.ui"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRenameFile()}
              className="bg-background border-border focus:ring-primary/30 active:border-primary/50"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameFile} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
