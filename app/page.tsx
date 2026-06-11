
import { EditorToolbar } from "@/components/editor/toolbar";
import {
  Undo2,
  Redo2,
  Download,
  Upload,
  FolderCode,
  Layers,
  ListTree,
  FileCode,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ComponentPalette } from "@/components/editor/component-palette";
import { ComponentTree } from "@/components/editor/component-tree";
import { EditorCanvas } from "@/components/editor/canvas";
import { Inspector } from "@/components/editor/inspector";
import { CodeEditor } from "@/components/editor/code-editor";
import { PluginManager } from "@/lib/plugin-sandbox";
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
import { EditorCommandPalette } from "@/components/editor/command-palette";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { StatusBar } from "@/components/editor/status-bar";
import { useSettings } from "@/components/editor/hooks/use-settings";

import { useEffect, useState } from "react";

export default function HytaleUIStudio() {
  const viewMode = useEditorStore((state) => state.viewMode);
  const activeMobileTab = useEditorStore((state) => state.activeMobileTab);
  const currentProjectId = useEditorStore((state) => state.currentProjectId);
  const activeDesktopTab = useEditorStore((state) => state.activeDesktopTab);
  const setActiveDesktopTab = useEditorStore((state) => state.setActiveDesktopTab);
  const [isLoaded, setIsLoaded] = useState(false);
  const appTheme = useSettings((state) => state.appTheme);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Apply Theme
  useEffect(() => {
    const html = document.documentElement;
    // Remove previous theme classes safely
    const classesToRemove = Array.from(html.classList).filter((cls) => cls.startsWith("theme-"));
    classesToRemove.forEach((cls) => html.classList.remove(cls));
    // Add current theme
    html.classList.add(`theme-${appTheme}`);
  }, [appTheme]);

  // Sync code on initial load / rehydration
  useEffect(() => {
    // Initialize Plugin Listener
    PluginManager.initListener();

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
            <Tabs value={activeDesktopTab} onValueChange={setActiveDesktopTab} className="flex h-full flex-col">
              <div className="flex shrink-0 items-center border-b border-border bg-panel px-2 py-1.5">
                <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
                  <Tooltip delayDuration={150}>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="workspace" className="px-0">
                        <FolderCode className="h-4 w-4" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Workspace</TooltipContent>
                  </Tooltip>
                  <Tooltip delayDuration={150}>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="components" className="px-0">
                        <Layers className="h-4 w-4" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Components</TooltipContent>
                  </Tooltip>
                  <Tooltip delayDuration={150}>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="tree" className="px-0">
                        <ListTree className="h-4 w-4" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Component Tree</TooltipContent>
                  </Tooltip>
                  <Tooltip delayDuration={150}>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="code" className="px-0">
                        <FileCode className="h-4 w-4" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">UI Code</TooltipContent>
                  </Tooltip>
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="workspace" className="h-full m-0 data-[state=active]:flex flex-col border-none p-0 outline-none">
                  <FileExplorer />
                </TabsContent>

                <TabsContent value="components" className="h-full m-0 data-[state=active]:flex flex-col border-none p-0 outline-none">
                  <ComponentPalette />
                </TabsContent>

                <TabsContent value="tree" className="h-full m-0 data-[state=active]:flex flex-col border-none p-0 outline-none">
                  <ComponentTree />
                </TabsContent>

                <TabsContent value="code" className="h-full m-0 data-[state=active]:flex flex-col border-none p-0 outline-none">
                  <CodeEditor />
                </TabsContent>
              </div>
            </Tabs>
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
      
      {/* Status Bar */}
      <StatusBar />

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
              onClick={() => useEditorStore.getState().exportProject()}
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
                    useEditorStore.getState().importProject(file);
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
      <EditorCommandPalette />
    </div>
  );
}
