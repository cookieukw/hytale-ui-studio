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

import { RenderedComponent } from "./rendered-component";

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
  const draggingId = useEditorStore((state) => state.draggingId);
  const setDraggingId = useEditorStore((state) => state.setDraggingId);

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
      case "Hytale":
        return { width: 2106, height: 1080 };
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
      e.stopPropagation();
      setIsDragOver(false);

      const storeDraggingId = useEditorStore.getState().draggingId;
      const componentId =
        storeDraggingId || e.dataTransfer.getData("componentId");

      setDraggingId(null); // Clear dragging state

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
        if (def.create) {
          addComponent(def.create(), null);
        } else {
          addComponent(
            {
              type: def.type,
              name: def.label,
              ...(def.defaultProps || {}),
            },
            null,
          );
        }
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
    <div
      className="flex h-full flex-col overflow-hidden bg-canvas relative"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        ref={containerRef}
        className="relative flex flex-1 items-center justify-center overflow-auto p-4"
        onClick={handleCanvasClick}
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
            className="relative h-full w-full origin-top-left"
            style={{
              transform: `scale(${zoom / 100})`,
              width: `${100 / (zoom / 100)}%`,
              height: `${100 / (zoom / 100)}%`,
            }}
          >
            {components.length === 0 ||
            components.every((c) => c.isVisible === false) ? (
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
              <div className="relative h-full w-full">
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
