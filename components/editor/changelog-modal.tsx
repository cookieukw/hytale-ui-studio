"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import packageJson from "@/package.json";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Bug, RefreshCw, GitPullRequest } from "lucide-react";

interface ChangelogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangelogModal({ open, onOpenChange }: ChangelogModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-panel border-border text-foreground shadow-2xl rounded-xl p-0 overflow-hidden">
        {/* Premium header banner */}
        <div className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent p-6 relative border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/20 border border-primary/30 rounded-lg flex items-center justify-center shadow-lg text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                Release Notes
                <Badge variant="default" className="bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                  v{packageJson.version}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Explore all premium features, architecture improvements, and bug fixes introduced in Hytale UI Studio v{packageJson.version}.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="features" className="w-full flex flex-col h-[400px]">
          <TabsList className="bg-secondary/40 border-b border-border px-4 py-2 flex gap-1 h-auto justify-start rounded-none">
            <TabsTrigger
              value="features"
              className="text-xs gap-1.5 px-3 py-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Features & Updates
            </TabsTrigger>
            <TabsTrigger
              value="bugs"
              className="text-xs gap-1.5 px-3 py-1.5 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive"
            >
              <Bug className="h-3.5 w-3.5" />
              Bug Fixes
            </TabsTrigger>
            <TabsTrigger
              value="quality"
              className="text-xs gap-1.5 px-3 py-1.5 data-[state=active]:bg-secondary data-[state=active]:text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Code Quality
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            {/* FEATURES TAB */}
            <TabsContent value="features" className="h-full m-0 p-0">
              <ScrollArea className="h-full p-6">
                <div className="space-y-5 pr-3">
                  <div className="sticky top-0 bg-panel/95 backdrop-blur-sm z-10 pb-2 mb-2 border-b border-border">
                    <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                      <Badge className="bg-primary/20 text-primary">v{packageJson.version}</Badge>
                      New Features
                    </h3>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-6 w-6 shrink-0 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">1:1 Hytale Engine Parity</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        The visual editor now 100% replicates Hytale's native padding, stack anchoring, and margin behaviors. What you build in the visual canvas is mathematically guaranteed to render perfectly in the game client.
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="flex gap-3">
                    <div className="h-6 w-6 shrink-0 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Massive Component Refactoring</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        The monolithic RenderedComponent was completely dismantled. The Drag-and-Drop mechanics, styles, and visual rendering factory were extracted, significantly improving editor performance and maintainability.
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="flex gap-3">
                    <div className="h-6 w-6 shrink-0 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Quality of Life Improvements</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Added a new "Export as Image" feature to easily share your layouts. We also implemented resizable panels for better workspace organization, fixed mouse-wheel scrolling in the canvas, and locked the engine to Hytale.
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="flex gap-3">
                    <div className="h-6 w-6 shrink-0 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">4</div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Template Gallery</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Added a brand new "Templates" tab on the start screen! You can now start projects instantly using production-ready, fully-functional Hytale UI templates (like RPG Inventory and Skill Tree).
                      </p>
                    </div>
                  </div>

                  <div className="sticky top-0 bg-panel/95 backdrop-blur-sm z-10 pb-2 mt-8 mb-2 border-b border-border">
                    <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                      <Badge variant="outline" className="text-muted-foreground">v3.0.0</Badge>
                      Previous Updates
                    </h3>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-6 w-6 shrink-0 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Migration & Full Tauri 2 Support</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Hytale UI Studio has been completely updated and optimized for Tauri 2, bringing much faster native desktop builds for Windows and Linux, better OS integration, and improved process security.
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="flex gap-3">
                    <div className="h-6 w-6 shrink-0 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Undo/Redo with Import Tracking</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        The undo/redo system now saves your imports of other UI interfaces along with the components. This prevents inconsistencies where components change state but imports remain outdated.
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="flex gap-3">
                    <div className="h-6 w-6 shrink-0 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Secure Component ID Isolation on Clones</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        When duplicating projects or files, all unique IDs of components are recursively regenerated. This avoids serious state collisions where changes in a duplicated file would cause unwanted mutations in other files.
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="flex gap-3">
                    <div className="h-6 w-6 shrink-0 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">4</div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Workspace Restoration & Rehydration</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Never start with a blank screen again! The application now intelligently hydrates the working state (components, imports, active code, and history) on startup, keeping your session exactly where you left off.
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="flex gap-3 text-xs mb-4">
                    <div className="h-6 w-6 shrink-0 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">5</div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Ordered ZIP Imports</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Importing multiple UI files from zipped archives (.zip) now resolves and displays them deterministically and in order, preserving the structural layout of your project.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* BUGS TAB */}
            <TabsContent value="bugs" className="h-full m-0 p-0">
              <ScrollArea className="h-full p-6">
                <div className="space-y-4 pr-3">
                  <div className="sticky top-0 bg-panel/95 backdrop-blur-sm z-10 pb-2 mb-2 border-b border-border">
                    <h3 className="text-sm font-bold text-destructive flex items-center gap-2">
                      <Badge className="bg-destructive/20 text-destructive">v{packageJson.version}</Badge>
                      Critical Fixes
                    </h3>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold px-1.5 py-0.2">Medium</Badge>
                      <h4 className="text-xs font-semibold text-white">Export Filename Resolution</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                      Exported image files previously defaulted to the generic project name, causing files to overwrite each other. The exporter now automatically detects the currently active `.ui` file and uses its name for the export.
                    </p>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold px-1.5 py-0.2">Medium</Badge>
                      <h4 className="text-xs font-semibold text-white">Recursive Component Counter</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                      Fixed a bug on the start screen where the project component count only displayed the root elements. It now recursively scans all files and deeply nested UI elements to show the true total component sum.
                    </p>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[9px] font-bold px-1.5 py-0.2">High</Badge>
                      <h4 className="text-xs font-semibold text-white">Cross-Axis Stretch (Anchor Full: 1)</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                      Fixed an issue where `Anchor: (Full: 1)` failed to stretch containers correctly when placed inside `Top` or `Bottom` Vertical flex layouts. Elements now expand their height/width natively.
                    </p>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[9px] font-bold px-1.5 py-0.2">High</Badge>
                      <h4 className="text-xs font-semibold text-white">CenterMiddle Layout Flow</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                      `MiddleCenter` layouts now correctly stack components vertically, rather than misaligning them as horizontal blocks, ensuring parity with the engine.
                    </p>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[9px] font-bold px-1.5 py-0.2">High</Badge>
                      <h4 className="text-xs font-semibold text-white">CI Build Fix</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                      Resolved a GitHub Actions build failure for Windows MSI targets by standardizing the `package.json` version string to comply with strict numeric SemVer requirements (`4.0.0`) expected by the Tauri bundler.
                    </p>
                  </div>

                  <div className="sticky top-0 bg-panel/95 backdrop-blur-sm z-10 pb-2 mt-8 mb-2 border-b border-border">
                    <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                      <Badge variant="outline" className="text-muted-foreground">v3.0.0</Badge>
                      Previous Fixes
                    </h3>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[9px] font-bold px-1.5 py-0.2">High</Badge>
                      <h4 className="text-xs font-semibold text-white">Canvas Click Events Propagation</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                      Resolved a bug where clicks on locked elements inside a Button in the visual canvas did not propagate to the parent element, making it impossible to click the button to select or test it.
                    </p>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold px-1.5 py-0.2">Medium</Badge>
                      <h4 className="text-xs font-semibold text-white">Absolute Stacking Width Collapse</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                      Fixed a bug where elements using absolute-style anchors inside stack layouts collapsed to zero width. Added automatic fallback rules for proper size rendering.
                    </p>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[9px] font-bold px-1.5 py-0.2">High</Badge>
                      <h4 className="text-xs font-semibold text-white">Zustand Direct Mutation (`refreshDefinitions`)</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                      The component alias refresh routine directly mutated the global state without using Zustand's immutable mechanism. This led to silent bugs where the editor visual state and code went out of sync.
                    </p>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[9px] font-bold px-1.5 py-0.2">High</Badge>
                      <h4 className="text-xs font-semibold text-white">Preserving Alpha Channel in Hex Colors (8-digit)</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                      Colors with transparency (RGBA 8-digit hex strings like `#00000099`) were truncated to 6 digits during code generation. The alpha channel is now preserved perfectly on export.
                    </p>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold px-1.5 py-0.2">Medium</Badge>
                      <h4 className="text-xs font-semibold text-white">Overlapping Spacings (Margin vs Gap)</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                      Explicit margin properties broke the automatic gap layout logic in MiddleCenter containers. Reordered inline CSS priority to follow logical precedence: Padding → Margin → Layout Gap.
                    </p>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold px-1.5 py-0.2">Medium</Badge>
                      <h4 className="text-xs font-semibold text-white">Style Leakage in Dropdown Parser</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                      Lack of a break statement in the parser loop caused Dropdown style definitions to bleed into text styles of adjacent components.
                    </p>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold px-1.5 py-0.2">Low</Badge>
                      <h4 className="text-xs font-semibold text-white">Anchor Fields Disabled Typing Error</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                      Fixed type-checking errors in production builds where anchor field elements passed empty or incorrect data types to the `disabled` property.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* QUALITY TAB */}
            <TabsContent value="quality" className="h-full m-0 p-0">
              <ScrollArea className="h-full p-6">
                <div className="space-y-5 pr-3">
                  <div className="sticky top-0 bg-panel/95 backdrop-blur-sm z-10 pb-2 mb-2 border-b border-border">
                    <h3 className="text-sm font-bold text-emerald-500 flex items-center gap-2">
                      <Badge className="bg-emerald-500/20 text-emerald-500">v{packageJson.version}</Badge>
                      Quality Improvements
                    </h3>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded bg-muted text-muted-foreground flex items-center justify-center mt-0.5">
                      <RefreshCw className="h-3 w-3" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Component Content Renderer Abstraction</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Abstracted the visual UI node generator into an independent `ComponentContentRenderer` factory. The UI shell is now completely decoupled from the Hytale tags switch statement.
                      </p>
                    </div>
                  </div>

                  <div className="sticky top-0 bg-panel/95 backdrop-blur-sm z-10 pb-2 mt-8 mb-2 border-b border-border">
                    <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                      <Badge variant="outline" className="text-muted-foreground">v3.0.0</Badge>
                      Previous Updates
                    </h3>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded bg-muted text-muted-foreground flex items-center justify-center mt-0.5">
                      <RefreshCw className="h-3 w-3" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Static Utility Imports</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Replaced dynamic imports (`await import`) of synchronous utilities like `isTauri` and `componentsToCode` with static imports. This eliminates micro-delays when clicking export and file menus.
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded bg-muted text-muted-foreground flex items-center justify-center mt-0.5">
                      <RefreshCw className="h-3 w-3" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Unified Unique Identifier Generator</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Consolidated multiple copies of the `generateId()` function under a single utility in `lib/tree-utils.ts` to keep a single source of truth.
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-5 w-5 rounded bg-muted text-muted-foreground flex items-center justify-center mt-0.5">
                      <RefreshCw className="h-3 w-3" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Layout & Structure Cleanup</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Removed redundant wrappers (like `handleExportZip` in the toolbar) and duplicated comments inside the markup parser.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <DialogFooter className="bg-secondary/20 px-6 py-4 flex items-center justify-between border-t border-border flex-row sm:justify-between">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <GitPullRequest className="h-3.5 w-3.5 text-primary" />
            <span>Hytale UI Studio is open-source.</span>
          </div>
          <Button
            onClick={() => onOpenChange(false)}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
