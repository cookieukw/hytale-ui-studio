import React, { memo, useState } from "react";
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

  if (!isVisible) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(component.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isLockedInParent) return; // Should be handled by draggable=false but for safety

    e.stopPropagation();
    setDraggingId(component.id);
    e.dataTransfer.setData("componentId", component.id);
    e.dataTransfer.setData("componentType", component.type);
    e.dataTransfer.setData("text/plain", component.id); // Fallback
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setDragImage(e.currentTarget as Element, 0, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggingId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    // Check if this component is a container
    const isContainer = [
      "Layout",
      "Div",
      "Column",
      "Row",
      "Card",
      "Panel",

      "Group",
      "ScrollArea",
    ].includes(component.type);

    let position: "before" | "after" | "inside" = "inside";

    const edgeThreshold = 10; // pixels, or percentage? using percentage is safer for small items
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
    e.preventDefault();
    e.stopPropagation();
    setDragState(null);

    const storeDraggingId = useEditorStore.getState().draggingId;
    const droppedId = storeDraggingId || e.dataTransfer.getData("componentId");
    const droppedType = e.dataTransfer.getData(
      "componentType",
    ) as ComponentType;

    // Move existing component
    if (droppedId) {
      if (droppedId === component.id) return; // Dropped on self

      if (dragState?.position === "inside") {
        moveComponent(droppedId, component.id, component.children?.length || 0);
      } else if (dragState?.position === "before") {
        moveComponent(droppedId, parentId, index ?? 0);
      } else if (dragState?.position === "after") {
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

        if (dragState?.position === "inside") {
          addComponent(newComp, component.id);
        } else if (dragState?.position === "before") {
          addComponent(newComp, parentId, index ?? 0);
        } else if (dragState?.position === "after") {
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
      style.paddingTop = component.padding.top
        ? `${component.padding.top}px`
        : undefined;
      style.paddingBottom = component.padding.bottom
        ? `${component.padding.bottom}px`
        : undefined;
      style.paddingLeft = component.padding.left
        ? `${component.padding.left}px`
        : undefined;
      style.paddingRight = component.padding.right
        ? `${component.padding.right}px`
        : undefined;
    }

    if (component.margin) {
      style.marginTop = component.margin.top
        ? `${component.margin.top}px`
        : undefined;
      style.marginBottom = component.margin.bottom
        ? `${component.margin.bottom}px`
        : undefined;
      style.marginLeft = component.margin.left
        ? `${component.margin.left}px`
        : undefined;
      style.marginRight = component.margin.right
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
      if (component.background.border) {
        // Hytale "Border" is often used as Border Radius or 9-slice?
        // For simple visualization, radius is okay, but texture usually handles border visually.
        style.borderRadius = `${component.background.border}px`;
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
      style.height = "10%";
      style.flexGrow = 1;
      style.backgroundColor = "#37a8ca";
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
    ? "ring-2 ring-primary ring-offset-1 ring-offset-canvas"
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
    draggable: !isLockedInParent,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  };

  // Helper to wrap content with indicators
  const renderWithIndicators = (
    content: React.ReactNode,
    extraClass?: string,
    extraStyle?: React.CSSProperties,
  ) => (
    <>
      <div
        {...baseProps}
        style={{ ...baseProps.style, ...extraStyle }}
        className={cn(
          baseProps.className,
          extraClass,
          dragState?.position === "inside" &&
            "ring-2 ring-cyan-400 ring-offset-2",
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

  switch (component.type) {
    case "Label":
      return renderWithIndicators(
        component.text || "Label",
        undefined,
        getTextStyle(),
      );

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
        "rounded",
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
        "rounded",
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
      const items = component.entries || [];
      const isDisabled = component.disabled;
      const readOnly = component.isReadOnly;

      // Dropdown Style Implementation
      const dropdownStyle: React.CSSProperties = {
        ...getTextStyle(),
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
        borderColor: component.outlineColor || "border-border",
        borderWidth: component.outlineSize
          ? `${component.outlineSize}px`
          : undefined,
      };

      if (component.background) {
        if (component.background.color)
          dropdownStyle.backgroundColor = component.background.color;
      }

      const tooltip = component.tooltipText;

      // Text Priority: ForcedLabel -> Value -> SelectedValues -> "Select..."
      // Note: If ForcedLabel is treated as the button text override:
      const buttonText =
        component.forcedLabel ||
        (component.value ? String(component.value) : null) ||
        (component.selectedValues && component.selectedValues.length > 0
          ? component.selectedValues.join(", ")
          : "Select...");

      const content = (
        <div
          className={cn(
            "flex h-full w-full items-center justify-between rounded border border-border bg-background px-3 py-1",
            isDisabled && "opacity-50 grayscale",
          )}
          style={dropdownStyle}
          title={tooltip}
        >
          <span
            className="truncate text-sm text-foreground"
            style={{ color: dropdownStyle.color }}
          >
            {buttonText}
          </span>
          <div className="flex items-center gap-1">
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
            <svg
              className="ml-2 h-4 w-4 shrink-0 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      );

      if (component.showLabel) {
        return renderWithIndicators(
          <div className="flex flex-col gap-0.5 w-full h-full">
            <span className="text-xs font-medium text-foreground/70 px-1">
              {component.panelTitleText || component.name}
            </span>
            <div className="flex-1 h-full min-h-0">{content}</div>
          </div>,
          undefined,
        );
      }

      return renderWithIndicators(content, undefined);

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
      const max = 100; // Implicit max for preview
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
