"use client";

import { EditorToolbar } from "@/components/editor/toolbar";
import {
  Layout,
  FileCode,
  Layers,
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
import { useEditorStore } from "@/lib/editor-store";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/editor/mobile-nav";
import { LoadingScreen } from "@/components/loading-screen";

import { useEffect, useState } from "react";

export default function HytaleUIStudio() {
  const viewMode = useEditorStore((state) => state.viewMode);
  const devicePreview = useEditorStore((state) => state.devicePreview);
  const activeMobileTab = useEditorStore((state) => state.activeMobileTab);
  const selectedId = useEditorStore((state) => state.selectedId);
  const removeComponent = useEditorStore((state) => state.removeComponent);
  const [isLoaded, setIsLoaded] = useState(false);

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

  /* Main Content - Desktop Layout */
  /* Hidden on mobile, visible on desktop */
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Toolbar */}
      <EditorToolbar />

      {/* Main Content - Desktop */}
      <div className="hidden md:block flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Palette & Tree */}
          <ResizablePanel
            defaultSize={18}
            minSize={12}
            maxSize={25}
            collapsible
            collapsedSize={0}
          >
            <ResizablePanelGroup direction="vertical" className="h-full">
              <ResizablePanel
                defaultSize={45}
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
                const code = useEditorStore.getState().exportToUI();
                const blob = new Blob([code], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "interface.ui";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".ui,.txt";
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const text = await file.text();
                    useEditorStore.getState().importFromUI(text);
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
