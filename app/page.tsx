
import { EditorToolbar } from "@/components/editor/toolbar";
import {
  Undo2,
  Redo2,
  Download,
  Upload,
} from "lucide-react";
import { ComponentPalette } from "@/components/editor/component-palette";
import { ComponentTree } from "@/components/editor/component-tree";
import { EditorCanvas } from "@/components/editor/canvas";
import { Inspector } from "@/components/editor/inspector";
import { CodeEditor } from "@/components/editor/code-editor";
import { FileExplorer } from "@/components/editor/file-explorer";
import { useEditorStore } from "@/lib/editor-store";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/editor/mobile-nav";
import { LoadingScreen } from "@/components/loading-screen";
import { StartScreen } from "@/components/editor/start-screen";

import { useEffect, useRef, useState } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";

export default function HytaleUIStudio() {
  const viewMode = useEditorStore((state) => state.viewMode);
  const devicePreview = useEditorStore((state) => state.devicePreview);
  const activeMobileTab = useEditorStore((state) => state.activeMobileTab);
  const selectedId = useEditorStore((state) => state.selectedId);
  const removeComponent = useEditorStore((state) => state.removeComponent);
  const currentProjectId = useEditorStore((state) => state.currentProjectId);
  const showFileExplorer = useEditorStore((state) => state.showFileExplorer);
  const importProject = useEditorStore((state) => state.importProject);
  const exportProject = useEditorStore((state) => state.exportProject);
  const [isLoaded, setIsLoaded] = useState(false);
  const fileExplorerPanelRef = useRef<ImperativePanelHandle>(null);

  // Collapse/expand the file explorer panel imperatively to avoid panel group layout bugs
  useEffect(() => {
    if (showFileExplorer) {
      fileExplorerPanelRef.current?.expand();
    } else {
      fileExplorerPanelRef.current?.collapse();
    }
  }, [showFileExplorer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const activeTag = document.activeElement?.tagName;
        const isInputActive =
          activeTag === "INPUT" ||
          activeTag === "TEXTAREA" ||
          (document.activeElement as HTMLElement)?.isContentEditable;

        if (!isInputActive && selectedId) {
          e.preventDefault(); // Prevent back navigation on some browsers
          removeComponent(selectedId);
        }
      }

      // Undo / Redo
      if (
        (e.ctrlKey || e.metaKey) &&
        !e.shiftKey &&
        e.key.toLowerCase() === "z"
      ) {
        e.preventDefault();
        useEditorStore.getState().undo();
      }

      if (
        (e.ctrlKey || e.metaKey) &&
        ((e.shiftKey && e.key.toLowerCase() === "z") ||
          e.key.toLowerCase() === "y")
      ) {
        e.preventDefault();
        useEditorStore.getState().redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, removeComponent]);

  // Sync code on initial load / rehydration
  useEffect(() => {
    // 1.5s delay to ensure hydration AND give visual feedback (user requested "better loading")
    setTimeout(() => {
      // Refresh definitions (aliases) from code to fix stale cache
      useEditorStore.getState().refreshDefinitions();
      setIsLoaded(true);
    }, 1500);
  }, []);

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  // If no project is selected, show the Start Screen (Android Studio style)
  if (!currentProjectId) {
    return <StartScreen />;
  }


  /* Main Content - Desktop Layout */
  /* Hidden on mobile, visible on desktop */
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Toolbar */}
      <EditorToolbar />

      {/* Main Content - Desktop */}
      <div className="hidden md:block flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Workspace, Palette & Tree */}
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            maxSize={30}
            collapsible
            collapsedSize={0}
          >
            <ResizablePanelGroup direction="vertical" className="h-full">
              <ResizablePanel
                ref={fileExplorerPanelRef}
                defaultSize={showFileExplorer ? 25 : 0}
                minSize={15}
                collapsible={true}
                collapsedSize={0}
              >
                <FileExplorer />
              </ResizablePanel>
              <ResizableHandle withHandle />
              
              <ResizablePanel
                defaultSize={40}
                minSize={25}
                collapsible={true}
                collapsedSize={2}
              >
                <ComponentPalette />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel
                style={{
                  transition: "transform 0.2s ease-in-out",
                  transform: "translateX(0)",
                }}
                defaultSize={30}
                minSize={20}
                collapsible={true}
                collapsedSize={2}
              >
                <ComponentTree />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel
                defaultSize={25}
                minSize={15}
                collapsible={true}
                collapsedSize={1}
              >
                <CodeEditor />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center - Canvas */}
          <ResizablePanel
            defaultSize={62}
            minSize={40}
            collapsible={true}
            collapsedSize={0}
          >
            {viewMode === "Split" ? (
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel
                  defaultSize={65}
                  minSize={30}
                  collapsible={true}
                  collapsedSize={0}
                >
                  <EditorCanvas />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                  defaultSize={35}
                  minSize={20}
                  collapsible={true}
                  collapsedSize={0}
                >
                  <CodeEditor />
                </ResizablePanel>
              </ResizablePanelGroup>
            ) : (
              <EditorCanvas />
            )}
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Inspector */}
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            maxSize={30}
            collapsible
            collapsedSize={0}
          >
            <Inspector />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex h-full flex-col bg-background">
        {/* Mobile Header with Actions */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-panel-header px-3">
          <div className="flex items-center gap-2">
            <img
              src="/hytale-studio_foreground.png"
              alt="Logo"
              className="h-8 w-8 rounded bg-primary"
            />
            <span className="text-sm font-semibold mb-0.5">Studio</span>
            <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Beta
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => useEditorStore.getState().undo()}
              className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => useEditorStore.getState().redo()}
              className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted"
            >
              <Redo2 className="h-4 w-4" />
            </button>
            <div className="w-px h-6 bg-border mx-1" />
            <button
              onClick={() => {
                exportProject();
              }}
              className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
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
              }}
              className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted"
            >
              <Upload className="h-4 w-4" />
            </button>
          </div>
        </div>

        <MobileNav />
        <div className="flex-1 overflow-hidden relative flex">
          {/* VIEW TAB */}
          <div
            className={cn(
              "absolute inset-0 flex bg-background",
              activeMobileTab === "View" ? "flex" : "hidden",
            )}
          >
            {/* Split View: Palette (Left) + Canvas (Right) */}
            <div className="w-[120px] shrink-0 border-r border-border bg-panel overflow-hidden flex flex-col">
              {/* Minimal Palette for Split View */}
              <ComponentPalette />
            </div>
            <div className="flex-1 overflow-hidden bg-canvas relative">
              <EditorCanvas />
            </div>
          </div>

          {/* EVENT TAB (Code) */}
          <div
            className={cn(
              "absolute inset-0",
              activeMobileTab === "Event" ? "block" : "hidden",
            )}
          >
            <CodeEditor />
          </div>

          {/* COMPONENT TAB (Tree + Inspector) */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col",
              activeMobileTab === "Component" ? "flex" : "hidden",
            )}
          >
            {/* We can split this too or toggle, for now split vertically 50/50 or top/bottom */}
            <div className="flex-1 border-b border-border overflow-hidden">
              <ComponentTree />
            </div>
            <div className="flex-1 overflow-hidden">
              <Inspector />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
