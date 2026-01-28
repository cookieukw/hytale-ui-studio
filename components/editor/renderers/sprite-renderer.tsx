import React, { useState, useEffect } from "react";
import type { HytaleComponent } from "@/lib/hytale-types";

interface SpriteRendererProps {
  component: HytaleComponent;
  src: string;
  renderWithIndicators: (
    content: React.ReactNode,
    extraClass?: string,
    extraStyle?: React.CSSProperties,
  ) => React.ReactNode;
}

export const SpriteRenderer = ({
  component,
  src,
  renderWithIndicators,
}: SpriteRendererProps) => {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (!component.frame || !component.framesPerSecond) return;

    const interval = 1000 / component.framesPerSecond;
    const timer = setInterval(() => {
      setFrameIndex((prev) => {
        const count = component.frame?.count || 1;
        return (prev + 1) % count;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [component.frame, component.framesPerSecond]);

  if (!component.frame) {
    // Fallback static image
    return renderWithIndicators(
      <div className="flex h-full w-full items-center justify-center overflow-hidden">
        <img
          src={src}
          alt="Sprite"
          className="object-contain max-w-full max-h-full"
        />
      </div>,
    );
  }

  const { width, height, perRow } = component.frame;

  // Calculate background position
  // The logic implies the image 'src' is the spritesheet.
  const col = frameIndex % perRow;
  const row = Math.floor(frameIndex / perRow);

  const bgPosX = -(col * width);
  const bgPosY = -(row * height);

  // Calculate total sheet size to support scaling (e.g. @2x images mapped to 1x logical pixels)
  // We want the whole background image to be scaled such that each frame is 'width'.
  // Total Sheet Width = perRow * width
  // Total Sheet Height = ceil(count / perRow) * height
  // We need to calculate rowCount, defaulting count to 1 if missing.
  const count = component.frame?.count || 1;
  const sheetWidth = perRow * width;
  const rowCount = Math.ceil(count / perRow);
  const sheetHeight = rowCount * height;

  return renderWithIndicators(
    <div
      className="overflow-hidden"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundImage: `url(${src})`,
          backgroundPosition: `${bgPosX}px ${bgPosY}px`,
          backgroundSize: `${sheetWidth}px ${sheetHeight}px`,
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>,
  );
};
