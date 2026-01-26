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
}

const RenderedComponent = memo(function RenderedComponent({
  component,
  isBlueprint,
  selectedId,
  onSelect,
}: RenderedComponentProps) {
  // Use store directly for actions to avoid prop drilling
  const moveComponent = useEditorStore((state) => state.moveComponent);
  const addComponent = useEditorStore((state) => state.addComponent);

  const isSelected = selectedId === component.id;
  const isVisible = component.isVisible ?? true;

  if (!isVisible) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(component.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData("componentId", component.id);
    e.dataTransfer.setData("componentType", component.type);
    e.dataTransfer.setData("text/plain", component.id); // Fallback
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedId = e.dataTransfer.getData("componentId");
    const droppedType = e.dataTransfer.getData(
      "componentType",
    ) as ComponentType;

    // If we have an ID, it's a move
    if (droppedId) {
      if (droppedId === component.id) return; // Dropped on self

      // If dropping ONTO a container, append to it
      // Simple logic: If this component can accept children (Layout, etc), add to it.
      // Otherwise, adding "swap" or "insert before" logic is harder without specific drop zones.
      // For now, let's assume dropping ON a component means "Move into" if it's a container,
      // or "Move next to" if not?
      // User asked to "change places".

      // Let's implement: Drop on Container -> Append to Container.
      // Drop on Non-Container -> Do nothing (let Canvas handle it? or Insert After?)

      // Check if this component is a container
      const isContainer = [
        "Layout",
        "Div",
        "Column",
        "Row",
        "Card",
        "Panel",
      ].includes(component.type);

      if (isContainer) {
        moveComponent(droppedId, component.id, component.children?.length || 0);
        // toast.success("Moved into " + component.name);
      } else {
        // Maybe bubble up to parent?
        // For now, let's keep it simple. Only containers accept drops.
      }
    } else if (droppedType) {
      // New component from palette
      const isContainer = [
        "Layout",
        "Div",
        "Column",
        "Row",
        "Card",
        "Panel",
      ].includes(component.type);
      if (isContainer) {
        const def = COMPONENT_DEFINITIONS.find((d) => d.type === droppedType);
        if (def) {
          addComponent(
            {
              type: def.type,
              name: def.label,
              ...def.defaultProps,
            },
            component.id,
          );
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
        style.height = "100%";
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
        style.border = `1px solid ${component.background.border}`;
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

    // Force Linear Layout for Group
    if (component.type === "Group") {
      style.display = "flex";
      // Default to column if not specified, mimicking standard Linear Layout
      if (!style.flexDirection) {
        style.flexDirection = "column";
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
      "cursor-pointer transition-shadow",
      blueprintClass,
      selectedClass,
    ),
    style: getComponentStyle(),
    onClick: handleClick,
  };

  switch (component.type) {
    case "Label":
      return (
        <div {...baseProps} style={{ ...baseProps.style, ...getTextStyle() }}>
          {component.text || "Label"}
        </div>
      );

    case "TextField":
      return (
        <div {...baseProps} className={cn(baseProps.className, "rounded")}>
          <span
            className={cn(
              "text-sm",
              isBlueprint ? "text-primary/70" : "text-muted-foreground",
            )}
          >
            {component.placeholderText || "Enter text..."}
          </span>
        </div>
      );

    case "NumberField":
      return (
        <div {...baseProps} className={cn(baseProps.className, "rounded")}>
          <span
            className={cn(
              "font-mono text-sm",
              isBlueprint ? "text-primary/70" : "text-foreground",
            )}
          >
            {component.value ?? 0}
          </span>
        </div>
      );

    case "Button":
      return (
        <div {...baseProps} className={cn(baseProps.className, "rounded")}>
          {component.children?.map((child) => (
            <RenderedComponent
              key={child.id}
              component={child}
              isBlueprint={isBlueprint}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      );

    case "TextButton":
      return (
        <div {...baseProps} style={{ ...baseProps.style, ...getTextStyle() }}>
          {component.text || "Text Button"}
        </div>
      );

    case "Image":
      return (
        <div
          {...baseProps}
          className={cn(
            baseProps.className,
            "rounded",
            !component.source &&
              "flex items-center justify-center bg-secondary",
          )}
        >
          {component.source ? (
            <img
              src={component.source || "/placeholder.svg"}
              alt={component.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-xs text-muted-foreground">Image</span>
          )}
        </div>
      );

    case "ProgressBar":
      const progress =
        ((component.value as number) / (component.max || 100)) * 100;
      return (
        <div
          {...baseProps}
          className={cn(
            baseProps.className,
            "relative overflow-hidden rounded",
          )}
        >
          <div
            className={cn(
              "h-full transition-all",
              isBlueprint ? "bg-primary/30" : "bg-primary",
            )}
            style={{ width: `${progress}%` }}
          />
          {component.showLabel && (
            <span className="absolute inset-0 flex items-center justify-center text-xs text-foreground">
              {component.value}/{component.max || 100}
            </span>
          )}
        </div>
      );

    default:
      return (
        <div
          {...baseProps}
          className={cn(baseProps.className, "overflow-hidden rounded")}
        >
          {component.children?.map((child) => (
            <RenderedComponent
              key={child.id}
              component={child}
              isBlueprint={isBlueprint}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
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
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

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
                {components.map((component) => (
                  <RenderedComponent
                    key={component.id}
                    component={component}
                    isBlueprint={isBlueprint}
                    selectedId={selectedId}
                    onSelect={handleSelect}
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
