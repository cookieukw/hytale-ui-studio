import React, { memo, useRef, useState } from "react";
import { useEditorStore } from "@/lib/editor-store";
import { COMPONENT_DEFINITIONS } from "@/lib/component-definitions";
import type { HytaleComponent, ComponentType } from "@/lib/hytale-types";
import { cn } from "@/lib/utils";
import { SpriteRenderer } from "./renderers/sprite-renderer";

interface RenderedComponentProps {
  component: HytaleComponent;
  isBlueprint: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  index?: number;
  parentId?: string | null;
  parentType?: ComponentType | null;
}

export const RenderedComponent = memo(function RenderedComponent({
  component,
  isBlueprint,
  selectedId,
  onSelect,
  index,
  parentId = null,
  parentType,
}: RenderedComponentProps) {
  // Use store directly for actions to avoid prop drilling
  const moveComponent = useEditorStore((state) => state.moveComponent);
  const addComponent = useEditorStore((state) => state.addComponent);
  const setDraggingId = useEditorStore((state) => state.setDraggingId);

  const isSelected = selectedId === component.id;
  const isVisible = component.isVisible ?? true;

  // Lock dragging if parent is a Button (so the button itself is dragged)
  const isLockedInParent =
    parentType === "Button" || parentType === "CancelButton";

  const [dragState, setDragState] = useState<{
    position: "before" | "after" | "inside";
  } | null>(null);

  // Track whether a drag just ended so we can suppress the subsequent click event
  const wasDragging = useRef(false);

  // Dropdown specific state (at top level because hooks cannot be conditional)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isVisible) return null;

  const handleClick = (e: React.MouseEvent) => {
    // Suppress the click that fires right after a drag-drop completes
    if (wasDragging.current) {
      wasDragging.current = false;
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    // When a child is locked into a Button/CancelButton, clicks should select the parent button
    if (isLockedInParent) {
      // Don't call onSelect — let the event NOT propagate further (parent button has its own onClick)
      // Actually we need to bubble UP so the button's onClick fires.
      // Remove stopPropagation and let parent handle it.
      return;
    }
    onSelect(component.id);
  };

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
      [
        "Layout",
        "Div",
        "Column",
        "Row",
        "Card",
        "Panel",
        "Group",
        "ScrollArea",
      ].includes(component.type) && !isButton;

    let position: "before" | "after" | "inside" = "inside";

    // pixels zone for before/after detection
    // Using 25% zone for before/after, but if container is large, limit to max 30px
    const zone = Math.min(height * 0.25, 30);

    if (isContainer) {
      if (y < zone) position = "before";
      else if (y > height - zone) position = "after";
      else position = "inside";
    } else {
      if (y < height * 0.5) position = "before";
      else position = "after";
    }

    // If this is a root container, force everything to drop inside it
    // otherwise dragging near the edges creates overlapping full-screen siblings
    if (!parentId && isContainer) {
      position = "inside";
    }

    // Constraint for root components has been removed to allow reordering
    // if (!parentId && position !== "inside") return;

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

  const getComponentStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};

    // 1. Root Element Special Behavior
    if (!parentId) {
      style.position = "absolute";
      style.top = 0;
      style.left = 0;
      style.right = 0;
      style.bottom = 0;
      style.width = "100%";
      style.height = "100%";
      // Default to center if not specified otherwise (mimicking the user's "Middle" layout)
      // We'll let layoutMode logic below handle the flex props, but we enforce size/pos here.
    }

    // 2. zIndex Support
    if (component.zIndex !== undefined) {
      style.zIndex = component.zIndex;
    }

    if (component.anchor && parentId) {
      if (component.anchor.width) {
        style.width =
          typeof component.anchor.width === "string"
            ? component.anchor.width
            : `${component.anchor.width}px`;
      }
      if (component.anchor.height) {
        style.height =
          typeof component.anchor.height === "string"
            ? component.anchor.height
            : `${component.anchor.height}px`;
      }
      if (component.anchor.full) {
        style.width = "100%";
        style.flexGrow = 1;
        style.minHeight = "100%";
      }

      // 3. Absolute Positioning Logic (Overlay)
      // If any specific anchor position is set, we treat it as absolute (unless it's Root).
      const hasPositioning =
        component.anchor.top !== undefined ||
        component.anchor.bottom !== undefined ||
        component.anchor.left !== undefined ||
        component.anchor.right !== undefined;

      if (parentId) {
        if (hasPositioning) {
          style.position = "absolute";
        } else {
          style.position = "relative"; // Standard flow
        }
      }

      // Explicit positioning application
      if (component.anchor.top !== undefined)
        style.top =
          typeof component.anchor.top === "string"
            ? component.anchor.top
            : `${component.anchor.top}px`;
      if (component.anchor.bottom !== undefined)
        style.bottom =
          typeof component.anchor.bottom === "string"
            ? component.anchor.bottom
            : `${component.anchor.bottom}px`;
      if (component.anchor.left !== undefined)
        style.left =
          typeof component.anchor.left === "string"
            ? component.anchor.left
            : `${component.anchor.left}px`;
      if (component.anchor.right !== undefined)
        style.right =
          typeof component.anchor.right === "string"
            ? component.anchor.right
            : `${component.anchor.right}px`;

      // Emulate Hytale stretch behavior in Layouts (Flex)
      // If Left and Right are set, we stretch horizontally
      if (
        component.anchor.left !== undefined &&
        component.anchor.right !== undefined
      ) {
        style.alignSelf = "stretch";
        // If in absolute context, left/right handles it. If flex, alignSelf handles it.
        // We can remove width to allow stretch
        if (!component.anchor.width) style.width = "auto";
      }
      // If Top and Bottom are set, stretch vertically
      if (
        component.anchor.top !== undefined &&
        component.anchor.bottom !== undefined
      ) {
        style.alignSelf = "stretch";
        style.height = "100%"; // Explicitly force 100% height for absolute or relative positioning behavior
        if (component.anchor.height) {
          // If explicit height is set, it overrides 'auto' or '100%'?
          // Usually top+bottom overrides height. But in CSS Flex, height is disregarded if flex-basis.
        }
      }
    }

    if (component.padding) {
      // Use !== undefined so that padding: 0 is applied (not treated as falsy)
      style.paddingTop =
        component.padding.top !== undefined
          ? `${component.padding.top}px`
          : undefined;
      style.paddingBottom =
        component.padding.bottom !== undefined
          ? `${component.padding.bottom}px`
          : undefined;
      style.paddingLeft =
        component.padding.left !== undefined
          ? `${component.padding.left}px`
          : undefined;
      style.paddingRight =
        component.padding.right !== undefined
          ? `${component.padding.right}px`
          : undefined;
    }

    if (component.margin) {
      style.marginTop =
        component.margin.top !== undefined
          ? `${component.margin.top}px`
          : undefined;
      style.marginBottom =
        component.margin.bottom !== undefined
          ? `${component.margin.bottom}px`
          : undefined;
      style.marginLeft =
        component.margin.left !== undefined
          ? `${component.margin.left}px`
          : undefined;
      style.marginRight =
        component.margin.right !== undefined
          ? `${component.margin.right}px`
          : undefined;
    }

    if (component.background && !isBlueprint) {
      style.backgroundColor = component.background.color;
      if (component.background.texture) {
        // Handle texture path, assuming relative to public or needing / prefix
        const texture = component.background.texture.startsWith("/")
          ? component.background.texture
          : `/${component.background.texture}`;
        style.backgroundImage = `url(${texture})`;
        style.backgroundSize = "100% 100%"; // Stretch texture usually
        style.backgroundRepeat = "no-repeat";
      }
      if (component.background.opacity !== undefined) {
        style.opacity = component.background.opacity;
      }
    }

    if (component.flexWeight) {
      style.flex = component.flexWeight;
    }

    if (component.direction) {
      style.flexDirection =
        component.direction === "Vertical" ? "column" : "row";
    }

    if (component.layoutMode) {
      style.display = "flex";
      switch (component.layoutMode) {
        case "Top":
          style.flexDirection = "column";
          style.alignItems = "center"; // "Centro topo" -> Horizontal Center
          style.justifyContent = "flex-start"; // Vertical Top
          break;
        case "Left":
          style.flexDirection = "row";
          style.alignItems = "center"; // "Centro esquerda" -> Vertical Center
          style.justifyContent = "flex-start"; // Horizontal Left
          break;
        case "Right":
          style.flexDirection = "row";
          style.alignItems = "center";
          style.justifyContent = "flex-end";
          break;
        case "Center":
          style.flexDirection = "row";
          style.alignItems = "center";
          style.justifyContent = "center";
          break;
        case "Middle":
          style.flexDirection = "column";
          style.alignItems = "center";
          style.justifyContent = "center";
          break;
        case "Bottom":
          style.flexDirection = "column";
          style.alignItems = "center";
          style.justifyContent = "flex-end";
          break;
        case "TopScrolling":
          style.flexDirection = "column";
          style.alignItems = "center"; // "Centro topo"
          style.justifyContent = "flex-start";
          style.overflowY = "auto";
          style.overflowX = "hidden";
          break;
        case "LeftScrolling":
          style.flexDirection = "row";
          style.alignItems = "center";
          style.justifyContent = "flex-start";
          style.overflowX = "auto";
          style.overflowY = "hidden";
          break;
        case "LeftCenterWrap":
          style.flexDirection = "row";
          style.flexWrap = "wrap";
          style.justifyContent = "center"; // Center pages horizontally
          style.alignContent = "flex-start"; // Stack lines from top
          style.alignItems = "flex-start"; // Items align to top
          break;
        case "CenterMiddle":
          style.flexDirection = "row";
          style.alignItems = "center";
          style.justifyContent = "center";
          break;
        case "MiddleCenter":
          style.flexDirection = "column";
          style.alignItems = "center";
          style.justifyContent = "center";
          break;
        case "Full":
          style.display = "block";
          style.position = "relative";
          break;
      }
    }

    if (component.textStyle) {
      style.color = component.textStyle.textColor;
      style.fontSize = component.textStyle.fontSize
        ? `${component.textStyle.fontSize}px`
        : undefined;
      style.fontWeight = component.textStyle.renderBold ? "bold" : undefined;
      style.textTransform = component.textStyle.renderUppercase
        ? "uppercase"
        : undefined;
      // Map TitleCase TextAlignment to CSS textAlign
      if (component.textStyle.alignment) {
        style.textAlign =
          component.textStyle.alignment.toLowerCase() as React.CSSProperties["textAlign"];

        const align = component.textStyle.alignment;
        style.justifyContent =
          align === "Center"
            ? "center"
            : align === "Right"
              ? "flex-end"
              : "flex-start";
      }

      // Explicit Hytale Alignment for Labels
      if (component.type === "Label") {
        style.display = "flex";
        style.flexDirection = "column"; // Usually labels wrap text if needed, but centering relies on flex
        // Hytal Alignment: Start, Center, End

        // Horizontal
        if (component.textStyle.horizontalAlignment) {
          const hAlign = component.textStyle.horizontalAlignment;
          style.alignItems =
            hAlign === "Center"
              ? "center"
              : hAlign === "End"
                ? "flex-end"
                : "flex-start";
          style.textAlign =
            hAlign === "Center"
              ? "center"
              : hAlign === "End"
                ? "right"
                : "left";
        }

        // Vertical
        if (component.textStyle.verticalAlignment) {
          const vAlign = component.textStyle.verticalAlignment;
          style.justifyContent =
            vAlign === "Center"
              ? "center"
              : vAlign === "End"
                ? "flex-end"
                : "flex-start";
        }
      }
    }

    // Force Linear Layout for Group and ScrollArea
    if (component.type === "Group" || component.type === "ScrollArea") {
      style.display = "flex";
      // Default to row (Horizontal) for Group, column for others if not specified
      if (!style.flexDirection) {
        style.flexDirection = component.type === "Group" ? "row" : "column";
      }

      // Root Element Default Alignment (if not specified by LayoutMode)
      if (!parentId && !component.layoutMode) {
        style.justifyContent = "center";
        style.alignItems = "center";
      }

      if (component.type === "ScrollArea") {
        style.overflowY = "auto";
        style.overflowX = "hidden";
      }
    }

    // Explicitly Center Content for Buttons (as LayoutMode was removed)
    // Explicitly Center Content for Buttons (simulating Hytale native behavior)
    if (["Button", "CancelButton"].includes(component.type)) {
      style.display = "flex";
      style.flexDirection = "column";
      style.justifyContent = "center";
      style.alignItems = "center";
      style.textAlign = "center";
    }

    // Default to Full Width for all components if not explicitly set
    if (!style.width && !parentId) {
      style.width = "100%";
    } else if (!style.width) {
      style.width = "100%";
    }

    // Default "Fill Space" behavior for Container types if no explicit height/flex is set
    // This matches the "occupy everything" requirement for parent elements
    const isContainerType = [
      "Group",
      "Panel",
      "DecoratedContainer",
      "ScrollArea",
    ].includes(component.type);

    if (
      isContainerType &&
      parentId &&
      !style.height &&
      !style.flex &&
      !style.flexGrow &&
      !style.position
    ) {
      style.flexGrow = 1;
    }

    // Special Case: Labels inside Buttons should fill the button to ensure centering works
    if (
      component.type === "Label" &&
      ["Button", "CancelButton"].includes(parentType || "")
    ) {
      style.width = "100%";
      style.flexGrow = 1;
    }

    return style;
  };

  const getTextStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};
    if (component.textStyle) {
      if (component.textStyle.fontSize) {
        style.fontSize = `${component.textStyle.fontSize}px`;
      }
      if (component.textStyle.textColor && !isBlueprint) {
        style.color = component.textStyle.textColor;
      }
      if (component.textStyle.renderBold) {
        style.fontWeight = "bold";
      }
      if (component.textStyle.renderUppercase) {
        style.textTransform = "uppercase";
      }
      if (component.textStyle.alignment) {
        style.textAlign =
          component.textStyle.alignment.toLowerCase() as React.CSSProperties["textAlign"];
      }
    }
    return style;
  };

  const blueprintClass = isBlueprint
    ? "border border-dashed border-primary/50 bg-primary/5"
    : "";

  const selectedClass = isSelected
    ? cn(
        "ring-2 ring-primary",
        !parentId ? "ring-inset" : "ring-offset-1 ring-offset-canvas",
      )
    : "";

  const baseProps = {
    className: cn(
      "cursor-pointer transition-all duration-300 ease-in-out",
      blueprintClass,
      selectedClass,
    ),
    style: getComponentStyle(),
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
        </div>
      </>
    );
  };

  switch (component.type) {
    case "Label": {
      // Labels should always center their content; override any fixed height to prevent clipping on large fonts
      const labelOverrideStyle: React.CSSProperties = {
        ...getTextStyle(),
        display: "flex",
        alignItems: "center",
        justifyContent:
          component.textStyle?.horizontalAlignment === "End"
            ? "flex-end"
            : component.textStyle?.horizontalAlignment === "Start"
              ? "flex-start"
              : "center",
        textAlign:
          component.textStyle?.horizontalAlignment === "End"
            ? "right"
            : component.textStyle?.horizontalAlignment === "Start"
              ? "left"
              : "center",
        minHeight: component.anchor?.height
          ? `${component.anchor.height}px`
          : undefined,
        // Don't enforce a fixed height — let the label grow with font size
        height: undefined,
        width: "100%",
        overflow: "visible",
      };
      return renderWithIndicators(
        component.text || "Label",
        undefined,
        labelOverrideStyle,
      );
    }

    case "TimerLabel":
      // Format seconds to MM:SS
      const seconds = component.seconds || 0;
      const mm = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
      const ss = (seconds % 60).toString().padStart(2, "0");

      return renderWithIndicators(`${mm}:${ss}`, undefined, getTextStyle());

    case "TextField":
      return renderWithIndicators(
        <span
          className={cn(
            "text-sm",
            isBlueprint ? "text-primary/70" : "text-muted-foreground",
          )}
        >
          {component.placeholderText || "Enter text..."}
        </span>,
        "rounded-sm border-b-2 border-[#fbbf24] bg-black/20 px-3 flex items-center h-full",
      );

    case "NumberField":
      return renderWithIndicators(
        <span
          className={cn(
            "font-mono text-sm",
            isBlueprint ? "text-primary/70" : "text-foreground",
          )}
        >
          {component.value ?? 0}
        </span>,
        "rounded-sm border-b-2 border-[#fbbf24] bg-black/20 px-3 flex items-center h-full",
      );

    case "Button":
    case "SecondaryButton":
    case "TertiaryButton":
    case "CancelButton":
      return renderWithIndicators(
        <>
          {component.children?.map((child, i) => (
            <RenderedComponent
              key={child.id}
              component={child}
              isBlueprint={isBlueprint}
              selectedId={selectedId}
              onSelect={onSelect}
              index={i}
              parentId={component.id}
              parentType={component.type}
            />
          ))}
        </>,
        "rounded",
      );

    case "SecondaryTextButton":
    case "TertiaryTextButton":
    case "CancelTextButton":
      return renderWithIndicators(
        component.text || "Text Button",
        undefined,
        getTextStyle(),
      );

    case "Image":
      return renderWithIndicators(
        component.source ? (
          <img
            src={component.source || "/placeholder.svg"}
            alt={component.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-xs text-muted-foreground">Image</span>
        ),
        cn(
          "rounded",
          !component.source && "flex items-center justify-center bg-secondary",
        ),
      );

    case "CheckBox":
      return renderWithIndicators(
        component.checked && (
          <div className="flex h-full w-full items-center justify-center text-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        ),
        "border border-muted",
      );

    case "Slider":
      const slidVal = Number(component.value) || 0;
      const slidMin = Number(component.min) || 0;
      const slidMax = Number(component.max) || 100;
      const slidPercent = Math.min(
        100,
        Math.max(0, ((slidVal - slidMin) / (slidMax - slidMin)) * 100),
      );

      return renderWithIndicators(
        <div className="relative flex h-full w-full items-center px-1">
          {/* Track */}
          <div className="h-1 w-full rounded-full bg-secondary" />
          {/* Loaded Track */}
          <div
            className="absolute h-1 rounded-full bg-primary"
            style={{ width: `${slidPercent}%`, left: 0 }}
          />
          {/* Handle */}
          <div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-border bg-foreground shadow-sm"
            style={{ left: `calc(${slidPercent}% - 8px)` }}
          />
        </div>,
        undefined,
      );

    case "Dropdown":
    case "DropdownBox":
      // Extract options from children if available
      const childOptions = (component.children || [])
        .filter((c) => c.type === "DropdownEntry")
        .map((c) => c.text || c.value || c.name);

      const items =
        childOptions.length > 0 ? childOptions : component.entries || [];

      const isDisabled = component.disabled;
      const readOnly = component.isReadOnly;

      // Dropdown Style Implementation
      // Merge base text styles and specific dropdown styles
      // Dropdown Style Implementation
      // Dropdown Style Implementation
      // Merge base text styles and specific dropdown styles
      // const [isDropdownOpen, setIsDropdownOpen] = React.useState(false); // MOVED TO TOP

      const mergedStyle: React.CSSProperties = {
        ...getTextStyle(),
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
        backgroundColor: component.background?.color || "#465169",
        borderColor: isDropdownOpen ? "transparent" : "#fbbf24",
        borderWidth: isDropdownOpen ? "0px" : "1px",
        borderStyle: "solid",
        borderRadius: "2px", // Always rounded completely if menu is to the side
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: "0.75rem",
        paddingRight: "0.75rem",
        paddingTop: "0.25rem",
        paddingBottom: "0.25rem",
      };

      if (component.outlineColor && component.outlineSize) {
        mergedStyle.outline = `${component.outlineSize}px solid ${component.outlineColor}`;
      }

      const tooltip = component.tooltipText;

      const handleToggleDropdown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDisabled) return;
        if (!isSelected) {
          onSelect(component.id);
        }
        setIsDropdownOpen(!isDropdownOpen);
      };

      const handleOptionClick = (val: string, e: React.MouseEvent) => {
        e.stopPropagation();
        useEditorStore.getState().updateComponent(component.id, { value: val });
        setIsDropdownOpen(false);
      };

      const buttonText =
        component.forcedLabel ||
        (component.children || []).find(
          (c) => c.type === "DropdownEntry" && c.value === component.value,
        )?.text ||
        (component.value ? String(component.value) : null) ||
        (component.selectedValues && component.selectedValues.length > 0
          ? component.selectedValues.join(", ")
          : "Select...");

      const innerContent = (
        <>
          <span
            className="truncate text-sm text-white"
            style={{ color: mergedStyle.color }}
          >
            {buttonText}
          </span>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {component.showSearchInput && (
              <svg
                className="h-3 w-3 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
            {/* Chevron Right (Rotated if open) */}
            <svg
              className={cn(
                "h-4 w-4 opacity-50 text-[#fbbf24] transition-transform",
                isDropdownOpen && "rotate-90",
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>

          {/* Options List - Positioned BELOW */}
          {isDropdownOpen && (
            <div
              className="absolute left-0 top-full mt-1 z-[100] flex flex-col bg-[#111927] border border-[#fbbf24] rounded-sm shadow-xl max-h-60 overflow-y-auto"
              style={{ minWidth: "100%", whiteSpace: "nowrap" }}
            >
              {/* Use children if available, else legacy entries */}
              {((component.children || []).filter(
                (c) => c.type === "DropdownEntry",
              ).length > 0
                ? (component.children || []).filter(
                    (c) => c.type === "DropdownEntry",
                  )
                : (component.entries || []).map((e) => ({
                    id: e,
                    value: e,
                    text: e,
                  }))
              ).map((entry: any) => (
                <div
                  key={entry.id || entry.value}
                  className="cursor-pointer px-3 py-1.5 text-sm text-white hover:bg-[#465169]/50 transition-colors flex items-center"
                  onClick={(e) => handleOptionClick(String(entry.value), e)}
                >
                  {entry.text || entry.value || entry.name}
                </div>
              ))}
            </div>
          )}
        </>
      );

      if (component.showLabel) {
        return renderWithIndicators(
          <div className="flex flex-col gap-0.5 w-full h-full relative">
            <span className="text-xs font-medium text-foreground/70 px-1">
              {component.panelTitleText || component.name}
            </span>
            {/* Pass generic div props via extraClass/Style to simulate the dropdown box */}
            <div
              className={cn(
                "w-full flex-1 relative",
                isDisabled && "grayscale",
              )}
              style={mergedStyle}
              title={tooltip}
              onClick={handleToggleDropdown}
            >
              {innerContent}
            </div>
          </div>,
          undefined,
        );
      }

      // If no label, the main component IS the dropdown box.
      // Pass styles to renderWithIndicators so they apply to the WRAPPER.
      return renderWithIndicators(
        innerContent,
        cn(isDisabled && "grayscale", "relative"),
        mergedStyle,
        { onClick: handleToggleDropdown },
      );

    case "Sprite": {
      // Logic for Sprite Sheet Animation
      const texturePath = component.texturePath;
      const isSpinner = texturePath === "Common/Spinner.png";
      const src = isSpinner ? "/Spinner@2x.png" : "/placeholder.svg";

      return (
        <SpriteRenderer
          component={component}
          src={src}
          renderWithIndicators={renderWithIndicators}
        />
      );
    }

    case "ProgressBar":
      const val = Number(component.value) || 0;
      const max = component.max ?? 100;
      const percentage = Math.min(100, Math.max(0, (val / max) * 100));

      const barPath = component.barTexturePath
        ? component.barTexturePath.startsWith("/")
          ? component.barTexturePath
          : `/${component.barTexturePath}`
        : undefined;
      const effectPath = component.effectTexturePath
        ? component.effectTexturePath.startsWith("/")
          ? component.effectTexturePath
          : `/${component.effectTexturePath}`
        : undefined;

      return renderWithIndicators(
        <>
          <div
            className={cn(
              "h-full relative",
              !barPath && (isBlueprint ? "bg-primary/30" : "bg-primary"),
            )}
            style={{
              width: `${percentage}%`,
              backgroundImage: barPath ? `url(${barPath})` : undefined,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          />
          {effectPath && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${percentage}%`,
                top: "50%",
                transform: "translateY(-50%)",
                width: component.effectWidth,
                height: component.effectHeight,
                marginLeft: -(component.effectOffset || 0),
                backgroundImage: `url(${effectPath})`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                zIndex: 10,
              }}
            />
          )}
          {component.showLabel && (
            <span className="absolute inset-0 flex items-center justify-center text-xs text-foreground z-20">
              {val}/{max}
            </span>
          )}
        </>,
        "relative rounded-sm",
      );

    case "ScrollArea":
      return renderWithIndicators(
        <>
          {component.children?.map((child, i) => (
            <RenderedComponent
              key={child.id}
              component={child}
              isBlueprint={isBlueprint}
              selectedId={selectedId}
              onSelect={onSelect}
              index={i}
              parentId={component.id}
              parentType={component.type}
            />
          ))}
        </>,
        "overflow-hidden rounded",
      );

    case "Group":
    case "Panel":
      return renderWithIndicators(
        <>
          {component.children?.map((child, i) => (
            <RenderedComponent
              key={child.id}
              component={child}
              isBlueprint={isBlueprint}
              selectedId={selectedId}
              onSelect={onSelect}
              index={i}
              parentId={component.id}
              parentType={component.type}
            />
          ))}
        </>,
        "rounded",
      );

    default:
      // Fallback for generic container behavior if needed or unknown types
      return renderWithIndicators(
        <>
          {component.children?.map((child, i) => (
            <RenderedComponent
              key={child.id}
              component={child}
              isBlueprint={isBlueprint}
              selectedId={selectedId}
              onSelect={onSelect}
              index={i}
              parentId={component.id}
              parentType={component.type}
            />
          ))}
        </>,
        "overflow-hidden rounded",
      );
  }
});
