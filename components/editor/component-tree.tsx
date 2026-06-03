"use client";

import React, { memo, useCallback, useState } from "react";
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
  FileCode,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useEditorStore } from "@/lib/editor-store";
import type { HytaleComponent, ComponentType } from "@/lib/hytale-types";
import { cn } from "@/lib/utils";
import { findComponentLocation, isDescendant, isContainerType } from "@/lib/tree-utils";

const componentIcons: Record<
  ComponentType,
  React.ComponentType<{ className?: string }>
> = {
  Group: Square,
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
  DropdownBox: List,
  DropdownEntry: Type,
  ImportedUI: FileCode,
};

type DropPosition = "before" | "after" | "inside" | null;

interface TreeNodeProps {
  component: HytaleComponent;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<HytaleComponent>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopy: (id: string) => void;
  onPaste: () => void;
  hasClipboard: boolean;
  parentVisible?: boolean;
  
  // Drag and drop props
  dragOverId: string | null;
  dropPosition: DropPosition;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, component: HytaleComponent) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
  onDragEnd: () => void;
}

const TreeNode = memo(function TreeNode({
  component,
  depth,
  selectedId,
  onSelect,
  onUpdate,
  onRemove,
  onDuplicate,
  onCopy,
  onPaste,
  hasClipboard,
  parentVisible = true,
  dragOverId,
  dropPosition,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
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

  const isDragTarget = dragOverId === component.id;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div>
          <div
            draggable
            onDragStart={(e) => onDragStart(e, component.id)}
            onDragOver={(e) => onDragOver(e, component)}
            onDrop={(e) => onDrop(e, component.id)}
            onDragEnd={onDragEnd}
            className={cn(
              "group relative flex cursor-pointer items-center gap-1 py-1 pr-2 text-xs transition-colors hover:bg-hover",
              isSelected && "bg-selection text-foreground",
              !isVisible && "opacity-50",
              isDragTarget && dropPosition === "inside" && "bg-primary/20 ring-1 ring-inset ring-primary"
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={() => onSelect(component.id)}
            onContextMenu={() => onSelect(component.id)} // Select on right click
          >
            {/* Drop Indicators */}
            {isDragTarget && dropPosition === "before" && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary z-10" />
            )}
            {isDragTarget && dropPosition === "after" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary z-10" />
            )}

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
                  onCopy={onCopy}
                  onPaste={onPaste}
                  hasClipboard={hasClipboard}
                  parentVisible={isVisible}
                  dragOverId={dragOverId}
                  dropPosition={dropPosition}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                />
              ))}
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => onCopy(component.id)}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Copy</span>
          <span className="ml-auto text-[10px] tracking-widest text-muted-foreground">Ctrl+C</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={onPaste} disabled={!hasClipboard}>
          <ScrollText className="mr-2 h-4 w-4" />
          <span>Paste</span>
          <span className="ml-auto text-[10px] tracking-widest text-muted-foreground">Ctrl+V</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onDuplicate(component.id)}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Duplicate</span>
          <span className="ml-auto text-[10px] tracking-widest text-muted-foreground">Ctrl+D</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={
            component.isDeletable === false
              ? undefined
              : () => onRemove(component.id)
          }
          disabled={component.isDeletable === false}
          className={component.isDeletable !== false ? "text-destructive focus:text-destructive" : ""}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
          <span className="ml-auto text-[10px] tracking-widest text-muted-foreground">Del</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
});

export function ComponentTree() {
  const components = useEditorStore((state) => state.components);
  const selectedId = useEditorStore((state) => state.selectedId);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const updateComponent = useEditorStore((state) => state.updateComponent);
  const removeComponent = useEditorStore((state) => state.removeComponent);
  const duplicateComponent = useEditorStore((state) => state.duplicateComponent);
  const copyComponent = useEditorStore((state) => state.copyComponent);
  const pasteComponent = useEditorStore((state) => state.pasteComponent);
  const hasClipboard = useEditorStore((state) => !!state.clipboardComponent);
  const moveComponent = useEditorStore((state) => state.moveComponent);

  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition>(null);
  const [localDraggingId, setLocalDraggingId] = useState<string | null>(null);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, [setSelectedId]);

  const handleUpdate = useCallback((id: string, updates: Partial<HytaleComponent>) => {
    updateComponent(id, updates);
  }, [updateComponent]);

  const handleRemove = useCallback((id: string) => {
    removeComponent(id);
  }, [removeComponent]);

  const handleDuplicate = useCallback((id: string) => {
    duplicateComponent(id);
  }, [duplicateComponent]);

  // Drag & Drop Handlers
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.stopPropagation();
    setLocalDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("componentId", id);
    e.dataTransfer.setData("source", "tree");
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetComponent: HytaleComponent) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent dragging an item into itself or its children
    if (localDraggingId === targetComponent.id || (localDraggingId && isDescendant(components, localDraggingId, targetComponent.id))) {
      setDragOverId(null);
      setDropPosition(null);
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    // Can this target accept children?
    const isContainer = isContainerType(targetComponent.type);

    // 35% top = before, 35% bottom = after, 30% middle = inside (if container)
    // This makes it much easier to drop elements above/below a container without accidentally dropping inside
    if (y < height * 0.35) {
      setDropPosition("before");
    } else if (y > height * 0.65) {
      setDropPosition("after");
    } else {
      if (isContainer) {
        setDropPosition("inside");
      } else {
        setDropPosition(y < height * 0.5 ? "before" : "after");
      }
    }

    setDragOverId(targetComponent.id);
  }, [localDraggingId]);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = e.dataTransfer.getData("componentId");
    
    if (draggedId && draggedId !== targetId && dropPosition) {
      if (isDescendant(components, draggedId, targetId)) {
        setDragOverId(null);
        setDropPosition(null);
        setLocalDraggingId(null);
        return;
      }
      // Find where the target is currently located
      const targetLocation = findComponentLocation(components, targetId);
      
      if (targetLocation) {
        let newParentId = targetLocation.parentId;
        let newIndex = targetLocation.index;

        if (dropPosition === "before") {
          newIndex = targetLocation.index;
        } else if (dropPosition === "after") {
          newIndex = targetLocation.index + 1;
        } else if (dropPosition === "inside") {
          newParentId = targetId;
          const targetComponent = targetLocation.parentId === null 
            ? components.find(c => c.id === targetId) 
            : null; // Simplification, need actual component lookup if nested deeply
          // Alternatively, we just append to the end of the children array
          newIndex = 9999; 
        }

        moveComponent(draggedId, newParentId, newIndex);
        
        // If we dropped inside, make sure the target is expanded
        if (dropPosition === "inside") {
          updateComponent(targetId, { isExpanded: true });
        }
      }
    }

    setDragOverId(null);
    setDropPosition(null);
    setLocalDraggingId(null);
  }, [components, dropPosition, moveComponent, updateComponent]);

  const handleDragEnd = useCallback(() => {
    setDragOverId(null);
    setDropPosition(null);
    setLocalDraggingId(null);
  }, []);

  return (
    <div className="flex h-full flex-col border-t border-border bg-panel">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold text-foreground">Tree</span>
      </div>

      <ScrollArea className="flex-1"
        onDragOver={(e) => {
          e.preventDefault(); // allow drops on empty space
        }}
        onDrop={(e) => {
          e.preventDefault();
          const draggedId = e.dataTransfer.getData("componentId");
          if (draggedId && !dragOverId) {
            moveComponent(draggedId, null, components.length);
          }
          handleDragEnd();
        }}
      >
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
                onCopy={copyComponent}
                onPaste={pasteComponent}
                hasClipboard={hasClipboard}
                dragOverId={dragOverId}
                dropPosition={dropPosition}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
