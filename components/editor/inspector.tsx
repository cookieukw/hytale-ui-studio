"use client";

import {
  Square,
  Palette,
  MousePointer,
  Settings2,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditorStore } from "@/lib/editor-store";
import type {
  HytaleComponent,
} from "@/lib/hytale-types";
import {
  COMMON_UI_DEFINITIONS,
  COMMON_UI_KEYS,
} from "@/lib/common-definitions";
import { LayoutTab } from "./inspector/layout-tab";
import { StyleTab } from "./inspector/style-tab";
import { StatesTab } from "./inspector/states-tab";
import { AdvancedTab } from "./inspector/advanced-tab";

export function Inspector() {
  const selectedId = useEditorStore((state) => state.selectedId);
  const components = useEditorStore((state) => state.components);
  const updateComponent = useEditorStore((state) => state.updateComponent);

  // Find component by ID
  const findById = (
    comps: HytaleComponent[],
    id: string,
  ): HytaleComponent | null => {
    for (const c of comps) {
      if (c.id === id) return c;
      if (c.children) {
        const found = findById(c.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const component = selectedId ? findById(components, selectedId) : null;

  if (!component) {
    return (
      <div className="flex h-full flex-col border-l border-border bg-panel">
        <div className="border-b border-border px-3 py-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Inspector
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <MousePointer className="mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">
            Select a component to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<HytaleComponent>) => {
    updateComponent(component.id, updates);
  };

  const hasStates = [
    "Button",
    "TextButton",
    "TextField",
    "ProgressBar",
  ].includes(component.type);

  // Check if component is a root component (top-level)
  const isRoot = components.some((c) => c.id === component.id);

  return (
    <div className="flex h-full flex-col border-l border-border bg-panel">
      {/* Header */}
      <div className="border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Square className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {component.type}
          </span>
          {isRoot && (
            <span className="ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
              ROOT
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="layout"
        className="flex flex-1 flex-col overflow-hidden"
      >
        <TabsList className="mx-2 mt-2 grid h-8 grid-cols-4 bg-secondary">
          <TabsTrigger value="layout" className="h-6 text-xs">
            <Square className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="style" className="h-6 text-xs">
            <Palette className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger
            value="states"
            className="h-6 text-xs"
            disabled={!hasStates}
          >
            <MousePointer className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="advanced" className="h-6 text-xs">
            <Settings2 className="h-3 w-3" />
          </TabsTrigger>
        </TabsList>

        <div className="px-3 py-2 border-b border-border bg-secondary/20">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-16">
              Inherits:
            </span>
            <Select
              value={component.inheritance || "None"}
              onValueChange={(val) => {
                if (val === "None") {
                  handleUpdate({ inheritance: undefined });
                } else {
                  // Apply inheritance and props
                  const def = COMMON_UI_DEFINITIONS[val];
                  handleUpdate({
                    inheritance: val,
                    ...def, // Merge properties
                  });
                }
              }}
            >
              <SelectTrigger className="h-6 text-xs flex-1">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                {COMMON_UI_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Nested UI Selector for ImportedUI */}
        {component.type === "ImportedUI" && (
          <div className="px-3 py-2 border-b border-border bg-primary/5">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-primary uppercase">
                Linked UI File
              </span>
              <Select
                value={component.importPath || ""}
                onValueChange={(val) => handleUpdate({ importPath: val })}
              >
                <SelectTrigger className="h-8 text-xs flex-1 bg-background border-primary/30">
                  <SelectValue placeholder="Select UI file..." />
                </SelectTrigger>
                <SelectContent className="bg-panel border-border">
                  {useEditorStore.getState().projects
                    .find(p => p.id === useEditorStore.getState().currentProjectId)
                    ?.files.filter(f => f.id !== useEditorStore.getState().currentFileId)
                    .map((file) => (
                      <SelectItem key={file.id} value={file.name}>
                        {file.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              {component.importPath && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-full border-primary/20 hover:bg-primary/10 hover:text-primary transition-all text-[11px] mt-2 bg-background"
                  onClick={() => {
                    const project = useEditorStore.getState().projects.find(p => p.id === useEditorStore.getState().currentProjectId);
                    const file = project?.files.find(f => f.name === component.importPath);
                    if (file) {
                      useEditorStore.getState().switchFile(file.id);
                    }
                  }}
                >
                  <Edit2 className="h-3 w-3 mr-2" />
                  Edit {component.importPath}
                </Button>
              )}
            </div>
          </div>
        )}

        <ScrollArea className="flex-1">
          {/* Layout Tab */}
          <TabsContent value="layout" className="m-0 mt-2">
            <LayoutTab
              component={component}
              onUpdate={handleUpdate}
              isRoot={isRoot}
            />
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="m-0 mt-2">
            <StyleTab component={component} onUpdate={handleUpdate} />
          </TabsContent>

          {/* States Tab */}
          <TabsContent value="states" className="m-0 mt-2">
            <StatesTab component={component} onUpdate={handleUpdate} />
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="m-0 mt-2">
            <AdvancedTab component={component} onUpdate={handleUpdate} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
