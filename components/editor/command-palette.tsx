"use client";

import React, { useEffect } from "react";
import { useEditorStore } from "@/lib/editor-store";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Undo2,
  Redo2,
  Grid3X3,
  Magnet,
  FolderCode,
  FileDown,
  LogOut,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Trash2,
  Image as ImageIcon,
  Layers,
  ListTree,
  FileCode,
} from "lucide-react";
import { handleExportImage } from "@/lib/export-utils";

export function EditorCommandPalette() {
  const isOpen = useEditorStore((s) => s.isCommandPaletteOpen);
  const setOpen = useEditorStore((s) => s.setCommandPaletteOpen);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const toggleGrid = useEditorStore((s) => s.toggleGrid);
  const toggleSnap = useEditorStore((s) => s.toggleSnap);
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const fitToScreen = useEditorStore((s) => s.fitToScreen);
  const setFitToScreen = useEditorStore((s) => s.setFitToScreen);
  const exportProject = useEditorStore((s) => s.exportProject);
  const exitProject = useEditorStore((s) => s.exitProject);
  const currentProjectId = useEditorStore((s) => s.currentProjectId);
  const selectedId = useEditorStore((s) => s.selectedId);
  const duplicateComponent = useEditorStore((s) => s.duplicateComponent);
  const removeComponent = useEditorStore((s) => s.removeComponent);
  const setActiveDesktopTab = useEditorStore((s) => s.setActiveDesktopTab);

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      command();
    },
    [setOpen]
  );

  // If there's no project open, don't show project-specific commands
  if (!currentProjectId) {
    return null;
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Editor Actions">
          <CommandItem onSelect={() => runCommand(undo)}>
            <Undo2 className="mr-2 h-4 w-4" />
            <span>Undo</span>
            <CommandShortcut>Ctrl+Z</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(redo)}>
            <Redo2 className="mr-2 h-4 w-4" />
            <span>Redo</span>
            <CommandShortcut>Ctrl+Y</CommandShortcut>
          </CommandItem>
          
          {selectedId && (
            <>
              <CommandItem onSelect={() => runCommand(() => duplicateComponent(selectedId))}>
                <Copy className="mr-2 h-4 w-4" />
                <span>Duplicate Component</span>
                <CommandShortcut>Ctrl+D</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => removeComponent(selectedId))}>
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Component</span>
                <CommandShortcut>Del</CommandShortcut>
              </CommandItem>
            </>
          )}
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="View">
          <CommandItem onSelect={() => runCommand(toggleGrid)}>
            <Grid3X3 className="mr-2 h-4 w-4" />
            <span>Toggle Grid</span>
            <CommandShortcut>Alt+G</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(toggleSnap)}>
            <Magnet className="mr-2 h-4 w-4" />
            <span>Snap to Grid</span>
            <CommandShortcut>Alt+S</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setZoom(zoom + 10))}>
            <ZoomIn className="mr-2 h-4 w-4" />
            <span>Zoom In</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setZoom(zoom - 10))}>
            <ZoomOut className="mr-2 h-4 w-4" />
            <span>Zoom Out</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setFitToScreen(!fitToScreen))}>
            <Maximize2 className="mr-2 h-4 w-4" />
            <span>Toggle Fit to Screen</span>
            <CommandShortcut>Alt+F</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Panels & Workspace">
          <CommandItem onSelect={() => runCommand(() => setActiveDesktopTab("workspace"))}>
            <FolderCode className="mr-2 h-4 w-4" />
            <span>Workspace</span>
            <CommandShortcut>Alt+1</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setActiveDesktopTab("components"))}>
            <Layers className="mr-2 h-4 w-4" />
            <span>Components</span>
            <CommandShortcut>Alt+2</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setActiveDesktopTab("tree"))}>
            <ListTree className="mr-2 h-4 w-4" />
            <span>Component Tree</span>
            <CommandShortcut>Alt+3</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setActiveDesktopTab("code"))}>
            <FileCode className="mr-2 h-4 w-4" />
            <span>Code Panel</span>
            <CommandShortcut>Alt+4</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Project">
          <CommandItem onSelect={() => runCommand(exportProject)}>
            <FileDown className="mr-2 h-4 w-4" />
            <span>Export Project</span>
            <CommandShortcut>Ctrl+S</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(handleExportImage)}>
            <ImageIcon className="mr-2 h-4 w-4" />
            <span>Export Image</span>
            <CommandShortcut>Ctrl+Shift+E</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(exitProject)}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Exit Project</span>
            <CommandShortcut>Alt+Q</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
