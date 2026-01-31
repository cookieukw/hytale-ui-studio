"use client";

import React from "react";

import { memo, useCallback } from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  MoreVertical,
  Copy,
  Trash2,
  Square,
  ScrollText,
  TextCursor,
  Hash,
  MousePointerClick,
  Type,
  Text,
  ImageIcon,
  Gauge,
  Timer,
  CheckSquare,
  List,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEditorStore } from "@/lib/editor-store";
import type { HytaleComponent, ComponentType } from "@/lib/hytale-types";
import { cn } from "@/lib/utils";

const componentIcons: Record<
  ComponentType,
  React.ComponentType<{ className?: string }>
> = {
  Group: Square,
  ScrollArea: ScrollText,
  Panel: Square,
  ContentSeparator: MoreVertical,
  VerticalSeparator: MoreVertical,
  PanelSeparatorFancy: MoreVertical,
  TextField: TextCursor,
  NumberField: Hash,
  Button: MousePointerClick,
  SecondaryButton: MousePointerClick,
  SecondaryTextButton: Type,
  TertiaryButton: MousePointerClick,
  TertiaryTextButton: Type,
  CancelButton: MousePointerClick,
  CancelTextButton: Type,
  Label: Text,
  Image: ImageIcon,
  ProgressBar: Gauge,
  TimerLabel: Timer,
  CheckBox: CheckSquare,
  Dropdown: List,
  Slider: SlidersHorizontal,
  Spinner: Loader2,
  Sprite: ImageIcon,
};

interface TreeNodeProps {
  component: HytaleComponent;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<HytaleComponent>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  parentVisible?: boolean;
}

const TreeNode = memo(function TreeNode({
  component,
  depth,
  selectedId,
  onSelect,
  onUpdate,
  onRemove,
  onDuplicate,
  parentVisible = true,
}: TreeNodeProps) {
  const isSelected = selectedId === component.id;
  const hasChildren = component.children && component.children.length > 0;
  const isExpanded = component.isExpanded ?? true;

  // Explicit visibility
  const isSelfVisible = component.isVisible ?? true;
  // Effective visibility (considering parent)
  const isVisible = isSelfVisible && parentVisible;

  const isLocked = component.isLocked ?? false;

  const Icon = componentIcons[component.type] || Square;

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(component.id, { isExpanded: !isExpanded });
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle the component's OWN visibility setting, not the effective one
    onUpdate(component.id, { isVisible: !isSelfVisible });
  };

  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(component.id, { isLocked: !isLocked });
  };

  return (
    <div>
      <div
        className={cn(
          "group flex cursor-pointer items-center gap-1 py-1 pr-2 text-xs transition-colors hover:bg-hover",
          isSelected && "bg-selection text-foreground",
          !isVisible && "opacity-50",
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onSelect(component.id)}
      >
        <button
          type="button"
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded hover:bg-secondary",
            !hasChildren && "invisible",
          )}
          onClick={handleToggleExpand}
        >
          {hasChildren &&
            (isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            ))}
        </button>

        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate">{component.name}</span>

        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-secondary"
            onClick={handleToggleVisibility}
            title={isVisible ? "Hide" : "Show"}
          >
            {isVisible ? (
              <Eye className="h-3 w-3 text-muted-foreground" />
            ) : (
              <EyeOff className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
          <button
            type="button"
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-secondary"
            onClick={handleToggleLock}
          >
            {isLocked ? (
              <Lock className="h-3 w-3 text-muted-foreground" />
            ) : (
              <Unlock className="h-3 w-3 text-muted-foreground" />
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-5 w-5 items-center justify-center rounded hover:bg-secondary"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onDuplicate(component.id)}>
                <Copy className="mr-2 h-3.5 w-3.5" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={cn(
                  "text-destructive focus:text-destructive",
                  component.isDeletable === false &&
                    "cursor-not-allowed opacity-50",
                )}
                disabled={component.isDeletable === false}
                onClick={
                  component.isDeletable === false
                    ? (e) => e.preventDefault()
                    : () => onRemove(component.id)
                }
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {component.children!.map((child) => (
            <TreeNode
              key={child.id}
              component={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onDuplicate={onDuplicate}
              parentVisible={isVisible} // Pass effective visibility to children
            />
          ))}
        </div>
      )}
    </div>
  );
});

export function ComponentTree() {
  const components = useEditorStore((state) => state.components);
  const selectedId = useEditorStore((state) => state.selectedId);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const updateComponent = useEditorStore((state) => state.updateComponent);
  const removeComponent = useEditorStore((state) => state.removeComponent);
  const duplicateComponent = useEditorStore(
    (state) => state.duplicateComponent,
  );

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
    },
    [setSelectedId],
  );

  const handleUpdate = useCallback(
    (id: string, updates: Partial<HytaleComponent>) => {
      updateComponent(id, updates);
    },
    [updateComponent],
  );

  const handleRemove = useCallback(
    (id: string) => {
      removeComponent(id);
    },
    [removeComponent],
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      duplicateComponent(id);
    },
    [duplicateComponent],
  );

  return (
    <div className="flex h-full flex-col border-t border-border bg-panel">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold text-foreground">Tree</span>
      </div>

      <ScrollArea className="flex-1">
        {components.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Square className="mb-2 h-6 w-6 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">No components</p>
          </div>
        ) : (
          <div className="py-1">
            {components.map((component) => (
              <TreeNode
                key={component.id}
                component={component}
                depth={0}
                selectedId={selectedId}
                onSelect={handleSelect}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
