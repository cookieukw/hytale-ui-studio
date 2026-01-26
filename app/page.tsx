"use client";

import { EditorToolbar } from "@/components/editor/toolbar";
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

export default function HytaleUIStudio() {
  const viewMode = useEditorStore((state) => state.viewMode);
  const devicePreview = useEditorStore((state) => state.devicePreview);
  const activeMobileTab = useEditorStore((state) => state.activeMobileTab);

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
              <ResizablePanel defaultSize={45} minSize={25}>
                <ComponentPalette />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={30} minSize={20}>
                <ComponentTree />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={15}>
                <CodeEditor />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center - Canvas */}
          <ResizablePanel defaultSize={62} minSize={40}>
            {viewMode === "Split" ? (
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={65} minSize={30}>
                  <EditorCanvas />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={35} minSize={20}>
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

      {/* Main Content - Mobile (only shown on small screens) */}
      <div className="md:hidden flex-1 overflow-hidden relative flex flex-col">
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
