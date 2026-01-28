"use client";

import React, { useRef, useState, useCallback, memo, useEffect } from "react";
import { useEditorStore } from "@/lib/editor-store";
import { COMPONENT_DEFINITIONS } from "@/lib/component-definitions";
import type { HytaleComponent, ComponentType } from "@/lib/hytale-types";
import { cn } from "@/lib/utils";

interface RenderedComponentProps {
  component: HytaleComponent;
  isBlueprint: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  index?: number;
  parentId?: string | null;
  parentType?: ComponentType | null;
}

const RenderedComponent = memo(function RenderedComponent({
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

  const isSelected = selectedId === component.id;
  const isVisible = component.isVisible ?? true;

  // Lock dragging if parent is a Button (so the button itself is dragged)
  const isLockedInParent = parentType === "Button";

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
    e.dataTransfer.setData("componentId", component.id);
    e.dataTransfer.setData("componentType", component.type);
    e.dataTransfer.setData("text/plain", component.id); // Fallback
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setDragImage(e.currentTarget as Element, 0, 0);
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
      "Button",
      "ScrollArea",
    ].includes(component.type);

    let position: "before" | "after" | "inside" = "inside";

    const edgeThreshold = 10; // pixels, or percentage? using percentage is safer for small items
    // Using 25% zone for before/after
    const zone = height * 0.25;

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

    const droppedId = e.dataTransfer.getData("componentId");
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
        const newComp = {
          type: def.type,
          name: def.label,
          ...def.defaultProps,
        };

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

    if (component.anchor) {
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
        // Use flex-grow to fill available space instead of height: 100% which collapses in auto-height containers
        style.flexGrow = 1;
        style.minHeight = "100%"; // Ensure it tries to fill parent if parent has height
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
      if (component.background.border) {
        // Hytale "Border" is often used as Border Radius
        style.borderRadius = `${component.background.border}px`;
      }
      if (component.background.opacity !== undefined) {
        style.opacity = component.background.opacity;
      }
    }

    if (component.flexWeight) {
      style.flex = component.flexWeight;
    }

    if (component.layoutMode) {
      style.display = "flex";
      switch (component.layoutMode) {
        case "Top":
          style.flexDirection = "column";
          style.alignItems = "flex-start";
          break;
        case "Bottom":
          style.flexDirection = "column";
          style.justifyContent = "flex-end";
          break;
        case "Left":
          style.flexDirection = "row";
          style.alignItems = "center";
          break;
        case "Right":
          style.flexDirection = "row";
          style.justifyContent = "flex-end";
          style.alignItems = "center";
          break;
        case "Middle":
          style.justifyContent = "center";
          style.alignItems = "center";
          break;
      }
    }

    if (component.direction) {
      style.flexDirection =
        component.direction === "Vertical" ? "column" : "row";
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
    }

    // Force Linear Layout for Group and ScrollArea
    if (component.type === "Group" || component.type === "ScrollArea") {
      style.display = "flex";
      // Default to column if not specified, mimicking standard Linear Layout
      if (!style.flexDirection) {
        style.flexDirection = "column";
      }

      if (component.type === "ScrollArea") {
        style.overflowY = "auto";
        style.overflowX = "hidden";
      }
    }

    // Default to Full Width for all components if not explicitly set
    // This matches Hytale's behavior where components often fill available space
    if (!style.width) {
      style.width = "100%";
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
            "ring-2 ring-blue-500 ring-offset-2",
        )}
      >
        {dragState?.position === "before" && (
          <div className="absolute top-0 left-0 right-0 h-1 -mt-1 bg-blue-500 z-50 pointer-events-none" />
        )}
        {content}
        {dragState?.position === "after" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 -mb-1 bg-blue-500 z-50 pointer-events-none" />
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

    case "TextButton":
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
      return renderWithIndicators(
        <div className="flex h-full w-full items-center justify-between px-2">
          <span
            style={getTextStyle()}
            className="truncate text-sm text-foreground"
          >
            {component.text || "Select..."}
          </span>
          <svg
            className="h-4 w-4 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>,
        undefined,
      );

    case "Spinner":
      return renderWithIndicators(
        <div className="flex h-full w-full items-center justify-center">
          <svg
            className="h-full w-full animate-spin text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>,
        undefined,
      );

    case "ProgressBar":
      const val = Number(component.value) || 0;
      const max = Number(component.max) || 100;
      const percentage = Math.min(100, Math.max(0, (val / max) * 100));

      return renderWithIndicators(
        <>
          <div
            className={cn(
              "h-full transition-all duration-300 ease-in-out",
              isBlueprint ? "bg-primary/30" : "bg-primary",
            )}
            style={{ width: `${percentage}%` }}
          />
          {component.showLabel !== false && (
            <span className="absolute inset-0 flex items-center justify-center text-xs text-foreground">
              {val}/{max}
            </span>
          )}
        </>,
        "relative overflow-hidden rounded",
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

export function EditorCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const components = useEditorStore((state) => state.components);
  const viewMode = useEditorStore((state) => state.viewMode);
  const devicePreview = useEditorStore((state) => state.devicePreview);
  const showGrid = useEditorStore((state) => state.showGrid);
  const zoom = useEditorStore((state) => state.zoom);
  const addComponent = useEditorStore((state) => state.addComponent);
  const moveComponent = useEditorStore((state) => state.moveComponent);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const selectedId = useEditorStore((state) => state.selectedId);
  const fitToScreen = useEditorStore((state) => state.fitToScreen);
  const setZoom = useEditorStore((state) => state.setZoom);
  const setCalculatedZoom = useEditorStore((state) => state.setCalculatedZoom);

  const containerRef = useRef<HTMLDivElement>(null);

  const setDevicePreview = useEditorStore((state) => state.setDevicePreview);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setDevicePreview("Mobile");
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setDevicePreview]);

  const deviceSize = React.useMemo(() => {
    // Force mobile preview size on mobile devices, ignoring desktop preview setting
    if (isMobile) {
      return { width: 375, height: 667 };
    }

    switch (devicePreview) {
      case "Mobile":
        return { width: 375, height: 667 };
      case "Tablet":
        return { width: 768, height: 1024 };
      case "Desktop":
      default:
        return { width: 1280, height: 720 };
    }
  }, [devicePreview, isMobile]);

  // Fit to screen logic
  React.useEffect(() => {
    if (!fitToScreen || !containerRef.current) return;

    const handleResize = () => {
      if (!containerRef.current) return;

      const { width: containerWidth, height: containerHeight } =
        containerRef.current.getBoundingClientRect();
      const padding = 64; // 32px padding on each side roughly

      const availableWidth = containerWidth - padding;
      const availableHeight = containerHeight - padding;

      const deviceW = deviceSize.width;
      const deviceH = deviceSize.height;

      const scaleX = availableWidth / deviceW;
      const scaleY = availableHeight / deviceH;

      // Use the smaller scale factor to ensure it fits
      const scale = Math.min(scaleX, scaleY);

      // Convert to percentage, clamp between 25 and 200 (or allow standard zoom limits)
      // We might want to allow going lower than 25 if strictly fitting, but for now stick to limits
      const zoomPercentage = Math.floor(scale * 100);

      // Only update if difference is significant to avoid loops/jitters
      if (Math.abs(zoomPercentage - zoom) > 1 && zoomPercentage > 0) {
        setCalculatedZoom(zoomPercentage);
      }
    };

    handleResize();

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [fitToScreen, deviceSize, zoom, setZoom]); // depend on zoom to check diff, but be careful

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const componentId = e.dataTransfer.getData("componentId");
      if (componentId) {
        moveComponent(componentId, null, components.length);
        return;
      }

      let componentType = e.dataTransfer.getData(
        "componentType",
      ) as ComponentType;

      // Fallback to text/plain for mobile
      if (!componentType) {
        componentType = e.dataTransfer.getData("text/plain") as ComponentType;
      }

      // Debugging
      if (componentType) {
        // toast.success(`Dropped: ${componentType}`);
      } else {
        // toast.error("Drop failed: No component type received");
        // Try getting everything to debug
        // const types = e.dataTransfer.types;
        // toast.error(`Types available: ${JSON.stringify(types)}`);
      }

      if (!componentType) return;

      const def = COMPONENT_DEFINITIONS.find((d) => d.type === componentType);
      if (def) {
        addComponent(
          {
            type: def.type,
            name: def.label,
            ...def.defaultProps,
          },
          null,
        );
      }
    },
    [addComponent],
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setSelectedId(null);
      }
    },
    [setSelectedId],
  );

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
    },
    [setSelectedId],
  );

  const isBlueprint = viewMode === "Blueprint";

  return (
    <div className="flex h-full flex-col overflow-hidden bg-canvas">
      <div
        className="relative flex flex-1 items-center justify-center overflow-auto p-4"
        style={{
          backgroundImage: showGrid
            ? `linear-gradient(to right, var(--canvas-grid) 1px, transparent 1px),
               linear-gradient(to bottom, var(--canvas-grid) 1px, transparent 1px)`
            : undefined,
          backgroundSize: showGrid ? "20px 20px" : undefined,
        }}
      >
        <div
          ref={canvasRef}
          className={cn(
            "relative  shrink-0 overflow-hidden rounded-lg border border-border bg-[#0a0a14] shadow-2xl transition-colors",
            isDragOver && "border-primary border-dashed",
          )}
          style={{
            width: deviceSize.width * (zoom / 130),
            height: deviceSize.height * (zoom / 130),
          }}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleCanvasClick}
        >
          <div
            className="h-[100px] w-full origin-top-left p-4"
            style={{
              transform: `scale(${zoom / 100})`,
              width: `${100 / (zoom / 100)}%`,
              height: `${100 / (zoom / 100)}%`,
            }}
          >
            {components.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <div className="mb-4 rounded-full bg-secondary/50 p-6">
                  <svg
                    className="h-12 w-12 text-muted-foreground/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium">Drop components here</p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Drag from the palette
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {components.map((component, i) => (
                  <RenderedComponent
                    key={component.id}
                    component={component}
                    isBlueprint={isBlueprint}
                    selectedId={selectedId}
                    onSelect={handleSelect}
                    index={i}
                    parentId={null}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-center border-t border-border bg-panel-header px-4 py-1">
        <span className="text-xs text-muted-foreground">
          {devicePreview} - {deviceSize.width} x {deviceSize.height}
        </span>
      </div>
    </div>
  );
}
