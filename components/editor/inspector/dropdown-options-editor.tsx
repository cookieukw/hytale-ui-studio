"use client";

import { useState } from "react";
import { Plus, Trash, GripVertical, Settings } from "lucide-react";
import { HytaleComponent } from "@/lib/hytale-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditorStore } from "@/lib/editor-store";
import { generateId } from "@/lib/tree-utils";
import { CollapsibleSection } from "./collapsible-section";

interface DropdownOptionsEditorProps {
  component: HytaleComponent;
}

export function DropdownOptionsEditor({
  component,
}: DropdownOptionsEditorProps) {
  const updateComponent = useEditorStore((state) => state.updateComponent);

  const entries = (component.children || []).filter(
    (c) => c.type === "DropdownEntry",
  );

  const handleAddEntry = () => {
    const newEntry: HytaleComponent = {
      id: generateId(),
      type: "DropdownEntry",
      name: `Option${entries.length + 1}`,
      text: `Option ${entries.length + 1}`,
      value: `Option ${entries.length + 1}`,
      isVisible: true,
    };

    const newChildren = [...(component.children || []), newEntry];
    updateComponent(component.id, { children: newChildren });
  };

  const handleUpdateEntry = (id: string, updates: Partial<HytaleComponent>) => {
    updateComponent(id, updates);
  };

  const handleRemoveEntry = (id: string) => {
    const newChildren = (component.children || []).filter((c) => c.id !== id);
    updateComponent(component.id, { children: newChildren });
  };

  if (component.type !== "Dropdown" && component.type !== "DropdownBox") {
    return null;
  }

  return (
    <CollapsibleSection title="Dropdown Options" defaultOpen>
      <div className="space-y-2">
        {/* Helper for Dropdown Properties */}
        <div className="flex flex-col gap-2 rounded border border-border bg-secondary/20 p-2 mb-2">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
            Generic Settings
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] text-muted-foreground">
                Forced Label
              </Label>
              <Input
                className="h-6 text-xs"
                value={component.forcedLabel || ""}
                placeholder="Automatic"
                onChange={(e) =>
                  updateComponent(component.id, {
                    forcedLabel: e.target.value || undefined,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] text-muted-foreground">
                Placeholder
              </Label>
              <Input
                className="h-6 text-xs"
                value={component.noItemsText || ""}
                placeholder="Select..."
                onChange={(e) =>
                  updateComponent(component.id, { noItemsText: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="flex flex-col gap-2 rounded border border-border bg-secondary/10 p-2 relative group"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground/70">
                #{index + 1}
              </span>
              <div className="flex-1 flex gap-2">
                <Input
                  className="h-6 text-xs flex-1 border-dashed focus:border-solid bg-transparent"
                  value={entry.text || ""}
                  placeholder="Display Text"
                  onChange={(e) =>
                    handleUpdateEntry(entry.id, { text: e.target.value })
                  }
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveEntry(entry.id)}
              >
                <Trash className="h-3 w-3" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 pl-6">
              <div className="flex flex-col gap-1">
                <Label className="text-[9px] text-muted-foreground">
                  Value (Code)
                </Label>
                <Input
                  className="h-5 text-[10px] px-1"
                  value={String(entry.value || "")}
                  onChange={(e) =>
                    handleUpdateEntry(entry.id, {
                      value: String(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[9px] text-muted-foreground">
                  Name (ID)
                </Label>
                <Input
                  className="h-5 text-[10px] px-1 font-mono"
                  value={entry.name}
                  onChange={(e) =>
                    handleUpdateEntry(entry.id, { name: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs h-8 border-dashed border-primary/30 text-primary hover:bg-primary/10"
          onClick={handleAddEntry}
        >
          <Plus className="mr-1 h-3 w-3" /> Add Option
        </Button>
      </div>
    </CollapsibleSection>
  );
}
