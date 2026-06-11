import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ComponentType, HytaleComponent, Padding } from "@/lib/hytale-types";
import { useEditorStore } from "@/lib/editor-store";
import { useSettings } from "./hooks/use-settings";
import { useComponentDnD } from "./hooks/use-component-dnd";
import { getComponentStyle } from "./utils/style-mapper";
import { ComponentContentRenderer } from "./component-content-renderer";

interface RenderedComponentProps {
  component: HytaleComponent;
  parentId?: string | null;
  parentType?: ComponentType | null;
  parentLayoutMode?: string | null;
  parentPadding?: Padding;
  selectedId: string | null;
  onSelect: (id: string) => void;
  index?: number;
  isBlueprint: boolean;
}

export const RenderedComponent = React.memo(function RenderedComponent({
  component,
  parentId = null,
  parentType,
  parentLayoutMode,
  parentPadding,
  selectedId,
  onSelect,
  index,
  isBlueprint,
}: RenderedComponentProps) {
  const currentProjectId = useEditorStore((state) => state.currentProjectId);
  const showBoundingBoxes = useSettings((state) => state.showBoundingBoxes);

  const isSelected = selectedId === component.id;
  const isVisible = component.isVisible ?? true;

  // Lock dragging if parent is a Button (so the button itself is dragged)
  const isLockedInParent =
    parentType === "Button" || parentType === "CancelButton";

  const {
    dragState,
    wasDragging,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useComponentDnD({
    component,
    parentId,
    parentType,
    index,
    isLockedInParent,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isVisible) return null;

  const handleClick = (e: React.MouseEvent) => {
    // Suppress the click that fires right after a drag-drop completes
    if (wasDragging.current) {
      wasDragging.current = false;
      e.stopPropagation();
      return;
    }
    // Children locked inside a Button must not intercept the click —
    // let it bubble up so the parent Button's onClick fires.
    if (isLockedInParent) return;
    e.stopPropagation();
    onSelect(component.id);
  };

  const blueprintClass = isBlueprint
    ? "outline outline-1 outline-dashed outline-primary/50 bg-primary/5 -outline-offset-1"
    : "";

  const selectedClass = isSelected
    ? cn(
        "ring-2 ring-primary z-10",
        !parentId ? "ring-inset" : "ring-offset-1 ring-offset-canvas",
      )
    : "";

  const baseStyle = getComponentStyle(
    component,
    parentId,
    parentType,
    isBlueprint,
    parentLayoutMode,
    parentPadding
  );

  const baseProps = {
    className: cn(
      "transition-all duration-300 ease-in-out",
      isLockedInParent ? "pointer-events-none" : "cursor-pointer",
      blueprintClass,
      selectedClass,
      showBoundingBoxes && "outline outline-1 outline-dashed outline-red-500/80 outline-offset-[-1px]"
    ),
    style: baseStyle,
    onClick: handleClick,
    // Disable dragging if inside a button, so the button handles the drag
    draggable: !isLockedInParent && !component.isLocked,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  };

  // Helper to wrap content with drag position indicators.
  // Preserves position from baseProps.style (e.g. position:absolute for root elements).
  // Falls back to position:relative so indicator lines don't bleed out of the container.
  const renderWithIndicators = (
    content: React.ReactNode,
    extraClass?: string,
    extraStyle?: React.CSSProperties,
    extraProps?: Record<string, any>,
  ) => {
    // Only set position:relative if the component doesn't already have a position set
    // (root elements get position:absolute and must not be overridden)
    const resolvedPosition = baseProps.style?.position ?? "relative";
    return (
      <>
        <div
          {...baseProps}
          {...extraProps}
          style={{
            ...baseProps.style,
            position: resolvedPosition,
            ...extraStyle,
          }}
          className={cn(
            baseProps.className,
            extraClass,
            dragState?.position === "inside" &&
              cn(
                "ring-2 ring-cyan-400",
                !parentId ? "ring-inset" : "ring-offset-2",
              ),
          )}
        >
          {dragState?.position === "before" && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400 z-50 pointer-events-none shadow-[0_0_4px_rgba(34,211,238,0.8)]" />
          )}
          {content}
          {dragState?.position === "after" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 z-50 pointer-events-none shadow-[0_0_4px_rgba(34,211,238,0.8)]" />
          )}
          {showBoundingBoxes && isSelected && (
            <>
              {/* Margin Overlay (Orange) */}
              {(baseStyle.marginTop || baseStyle.marginBottom || baseStyle.marginLeft || baseStyle.marginRight) && (
                <div
                  className="absolute pointer-events-none z-[100]"
                  style={{
                    top: `calc(-1 * (${baseStyle.marginTop || '0px'}))`,
                    bottom: `calc(-1 * (${baseStyle.marginBottom || '0px'}))`,
                    left: `calc(-1 * (${baseStyle.marginLeft || '0px'}))`,
                    right: `calc(-1 * (${baseStyle.marginRight || '0px'}))`,
                    borderTop: `${baseStyle.marginTop || '0px'} solid rgba(255, 153, 51, 0.4)`,
                    borderBottom: `${baseStyle.marginBottom || '0px'} solid rgba(255, 153, 51, 0.4)`,
                    borderLeft: `${baseStyle.marginLeft || '0px'} solid rgba(255, 153, 51, 0.4)`,
                    borderRight: `${baseStyle.marginRight || '0px'} solid rgba(255, 153, 51, 0.4)`,
                    outline: "1px dashed rgba(255, 153, 51, 0.9)",
                    boxSizing: "border-box",
                  }}
                />
              )}
              {/* Padding (Green) and Content (Blue) Overlay */}
              <div
                className="absolute inset-0 pointer-events-none z-[100]"
                style={{
                  borderTop: `${baseStyle.paddingTop || '0px'} solid rgba(135, 206, 135, 0.4)`,
                  borderBottom: `${baseStyle.paddingBottom || '0px'} solid rgba(135, 206, 135, 0.4)`,
                  borderLeft: `${baseStyle.paddingLeft || '0px'} solid rgba(135, 206, 135, 0.4)`,
                  borderRight: `${baseStyle.paddingRight || '0px'} solid rgba(135, 206, 135, 0.4)`,
                  backgroundColor: "rgba(104, 171, 253, 0.25)",
                  backgroundClip: "content-box",
                  boxSizing: "border-box",
                }}
              />
            </>
          )}
        </div>
      </>
    );
  };

  return (
    <ComponentContentRenderer
      component={component}
      isBlueprint={isBlueprint}
      selectedId={selectedId}
      onSelect={onSelect}
      parentId={parentId}
      renderWithIndicators={renderWithIndicators}
      isDropdownOpen={isDropdownOpen}
      setIsDropdownOpen={setIsDropdownOpen}
    />
  );
});
