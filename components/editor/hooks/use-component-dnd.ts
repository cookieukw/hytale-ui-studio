import React, { useRef, useState } from "react";
import { useEditorStore } from "@/lib/editor-store";
import { COMPONENT_DEFINITIONS } from "@/lib/component-definitions";
import type { ComponentType, HytaleComponent } from "@/lib/hytale-types";
import type { UseComponentDnDProps } from "../types";

export function useComponentDnD({
  component,
  parentId,
  parentType,
  index,
  isLockedInParent,
}: UseComponentDnDProps) {
  const moveComponent = useEditorStore((state) => state.moveComponent);
  const addComponent = useEditorStore((state) => state.addComponent);
  const setDraggingId = useEditorStore((state) => state.setDraggingId);

  const [dragState, setDragState] = useState<{
    position: "before" | "after" | "inside";
  } | null>(null);

  // Track whether a drag just ended so we can suppress the subsequent click event
  const wasDragging = useRef(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (isLockedInParent || component.isLocked) return;

    e.stopPropagation();
    setDraggingId(component.id);
    e.dataTransfer.setData("componentId", component.id);
    e.dataTransfer.setData("componentType", component.type);
    e.dataTransfer.setData("text/plain", component.id); // Fallback
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setDragImage(e.currentTarget as Element, 0, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    wasDragging.current = true;
    setDraggingId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    // Locked components are not valid drop targets
    if (component.isLocked) return;

    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    // Buttons are NOT containers — never allow "inside" drops
    const isButton = ["Button", "CancelButton"].includes(component.type);

    // Check if this component is a container
    const isContainer =
      ["Layout", "Div", "Column", "Row", "Card", "Panel", "Group"].includes(
        component.type,
      ) && !isButton;

    let position: "before" | "after" | "inside" = "inside";

    const isEmptyContainer =
      isContainer && (!component.children || component.children.length === 0);

    // pixels zone for before/after detection
    // Using 15% zone for before/after, but if container is large, limit to max 15px
    // This makes the 'inside' zone much larger and easier to hit.
    const zone = Math.min(height * 0.15, 15);

    if (isContainer) {
      if (isEmptyContainer) {
        position = "inside"; // ALWAYS drop inside an empty container
      } else {
        if (y < zone) position = "before";
        else if (y > height - zone) position = "after";
        else position = "inside";
      }
    } else {
      if (y < height * 0.5) position = "before";
      else position = "after";
    }

    // If this is a root container, force everything to drop inside it
    // otherwise dragging near the edges creates overlapping full-screen siblings
    if (!parentId && isContainer) {
      position = "inside";
    }

    setDragState({ position });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (component.isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    // Capture dragState BEFORE resetting it so we can use it below
    const currentDragState = dragState;
    setDragState(null);

    const storeDraggingId = useEditorStore.getState().draggingId;
    const droppedId = storeDraggingId || e.dataTransfer.getData("componentId");
    const droppedType = e.dataTransfer.getData(
      "componentType",
    ) as ComponentType;

    // Buttons are not valid drop containers.
    // Case 1: this component IS a button — redirect "inside" → "after"
    const isButton = ["Button", "CancelButton"].includes(component.type);
    // Case 2: this component lives inside a Button (e.g. a Label child) —
    //         any drop landing here should be swallowed so the parent Button's
    //         drop handler can place the item correctly as a sibling.
    const parentIsButton = ["Button", "CancelButton"].includes(
      parentType ?? "",
    );
    if (parentIsButton) return;

    let resolvedPosition = currentDragState?.position;
    if (isButton && resolvedPosition === "inside") {
      resolvedPosition = "after";
    }

    // Move existing component
    if (droppedId) {
      if (droppedId === component.id) return; // Dropped on self

      if (resolvedPosition === "inside") {
        moveComponent(droppedId, component.id, component.children?.length || 0);
      } else if (resolvedPosition === "before") {
        moveComponent(droppedId, parentId, index ?? 0);
      } else if (resolvedPosition === "after") {
        moveComponent(droppedId, parentId, (index ?? 0) + 1);
      }
    }
    // New component from palette
    else if (droppedType) {
      const def = COMPONENT_DEFINITIONS.find((d) => d.type === droppedType);
      if (def) {
        let newComp: any;

        if (def.create) {
          newComp = def.create();
        } else {
          newComp = {
            type: def.type,
            name: def.label,
            ...def.defaultProps,
          };
        }

        if (resolvedPosition === "inside") {
          addComponent(newComp, component.id);
        } else if (resolvedPosition === "before") {
          addComponent(newComp, parentId, index ?? 0);
        } else if (resolvedPosition === "after") {
          addComponent(newComp, parentId, (index ?? 0) + 1);
        }
      }
    }
  };

  return {
    dragState,
    wasDragging,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
