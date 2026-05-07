"use client";

import React from "react";
import { isTauri } from "@/lib/tauri-utils";

import {
  Undo2,
  Redo2,
  Grid3X3,
  Magnet,
  Monitor,
  Tablet,
  Smartphone,
  Columns2,
  Eye,
  Home,
  ChevronRight,
  FolderCode,
  FileCode,
  FileDown,
  FileUp,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEditorStore } from "@/lib/editor-store";
import type { ViewMode, DevicePreview } from "@/lib/hytale-types";
import { cn } from "@/lib/utils";



export function EditorToolbar() {
  const viewMode = useEditorStore((s) => s.viewMode);
  const setViewMode = useEditorStore((s) => s.setViewMode);
  const devicePreview = useEditorStore((s) => s.devicePreview);
  const setDevicePreview = useEditorStore((s) => s.setDevicePreview);
  const showGrid = useEditorStore((s) => s.showGrid);
  const toggleGrid = useEditorStore((s) => s.toggleGrid);
  const snapToGrid = useEditorStore((s) => s.snapToGrid);
  const toggleSnap = useEditorStore((s) => s.toggleSnap);
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const fitToScreen = useEditorStore((s) => s.fitToScreen);
  const setFitToScreen = useEditorStore((s) => s.setFitToScreen);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const historyIndex = useEditorStore((s) => s.historyIndex);
  const historyLength = useEditorStore((s) => s.history.length);
  const exportToUI = useEditorStore((s) => s.exportToUI);
  const projects = useEditorStore((s) => s.projects);
  const currentProjectId = useEditorStore((s) => s.currentProjectId);
  const exitProject = useEditorStore((s) => s.exitProject);
  const showFileExplorer = useEditorStore((s) => s.showFileExplorer);
  const setShowFileExplorer = useEditorStore((s) => s.setShowFileExplorer);
  const exportProject = useEditorStore((s) => s.exportProject);
  const importProject = useEditorStore((s) => s.importProject);

  const currentProject = projects.find((p) => p.id === currentProjectId);



  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyLength - 1;

  const handleExportZip = () => {
      exportProject();
  };

  const handleImportZip = () => {
    if (isTauri()) {
      importProject();
    } else {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".zip";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          importProject(file);
        }
      };
      input.click();
    }
  };

  const viewModeOptions: {
    value: ViewMode;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { value: "Design", label: "Design", icon: <Eye className="h-4 w-4" /> },
    {
      value: "Blueprint",
      label: "Blueprint",
      icon: <Layers className="h-4 w-4" />,
    },
    { value: "Split", label: "Split", icon: <Columns2 className="h-4 w-4" /> },
  ];

  const deviceOptions: { value: DevicePreview; icon: React.ReactNode }[] = [
    { value: "Desktop", icon: <Monitor className="h-4 w-4" /> },
    { value: "Hytale", icon: <Maximize2 className="h-4 w-4" /> },
    { value: "Tablet", icon: <Tablet className="h-4 w-4" /> },
    { value: "Mobile", icon: <Smartphone className="h-4 w-4" /> },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-12 items-center justify-between border-b border-border bg-panel-header px-3">
        {/* Left section */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3">
             <div 
               className="h-8 w-8 bg-primary rounded flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
               onClick={exitProject}
               title="Back to Projects"
             >
                <img
                  src="/hytale-studio_foreground.png"
                  alt="Logo"
                  className="h-6 w-6"
                />
             </div>
             
             <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={exitProject}
                >
                  <Home className="h-4 w-4" />
                </Button>
                
                {currentProject && (
                  <>
                    <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                    <span className="text-xs font-bold text-foreground truncate max-w-[150px]">
                      {currentProject.name}
                    </span>
                  </>
                )}
             </div>
          </div>



          <Separator orientation="vertical" className="mx-2 h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={undo}
                disabled={!canUndo}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={redo}
                disabled={!canRedo}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-2 h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  showFileExplorer && "bg-primary/20 text-primary hover:bg-primary/30",
                )}
                onClick={() => setShowFileExplorer(!showFileExplorer)}
              >
                <FolderCode className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Workspace Browser</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-2 h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  showGrid && "bg-secondary text-secondary-foreground",
                )}
                onClick={toggleGrid}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Grid</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  snapToGrid && "bg-secondary text-secondary-foreground",
                )}
                onClick={toggleSnap}
              >
                <Magnet className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Snap to Grid</TooltipContent>
          </Tooltip>
        </div>

        {/* Center section - View Mode */}
        <div className="hidden md:flex items-center gap-1 rounded-lg bg-secondary p-1">
          {viewModeOptions.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 gap-1.5 px-3 text-xs",
                viewMode === option.value &&
                  "bg-background text-foreground shadow-sm",
              )}
              onClick={() => setViewMode(option.value)}
            >
              {option.icon}
              <span className="hidden sm:inline">{option.label}</span>
            </Button>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1">
          {/* Device Preview */}
          <div className="mr-2 hidden md:flex items-center gap-0.5 rounded-lg bg-secondary p-1">
            {deviceOptions.map((option) => (
              <Tooltip key={option.value}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-7 w-7",
                      devicePreview === option.value &&
                        "bg-background text-foreground shadow-sm",
                    )}
                    onClick={() => setDevicePreview(option.value)}
                  >
                    {option.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{option.value}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Separator orientation="vertical" className="mx-2 h-6" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setZoom(zoom - 10)}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-14 px-2 font-mono text-xs"
                >
                  {fitToScreen ? "Fit" : `${zoom}%`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {[50, 75, 100, 125, 150, 200].map((z) => (
                  <DropdownMenuItem key={z} onClick={() => setZoom(z)}>
                    {z}%
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setZoom(zoom + 10)}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8",
                    fitToScreen && "bg-secondary text-secondary-foreground",
                  )}
                  onClick={() => setFitToScreen(!fitToScreen)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {fitToScreen ? "Disable Fit" : "Fit to Screen"}
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="mx-2 h-6" />

          {/* Import/Export ZIP */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleImportZip}
              >
                <FileUp className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Import Project (.zip)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleExportZip}
              >
                <FileDown className="h-4 w-4 text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export Project (.zip)</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
