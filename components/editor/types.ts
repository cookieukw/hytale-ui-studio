import React from "react";
import type { ComponentType, HytaleComponent } from "@/lib/hytale-types";

export interface ComponentContentRendererProps {
  component: HytaleComponent;
  isBlueprint: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  parentId: string | null | undefined;
  renderWithIndicators: (
    content: React.ReactNode,
    extraClass?: string,
    extraStyle?: React.CSSProperties,
    extraProps?: Record<string, any>
  ) => React.ReactNode;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (val: boolean) => void;
}

export interface UseComponentDnDProps {
  component: HytaleComponent;
  parentId: string | null;
  parentType: ComponentType | null | undefined;
  index: number | undefined;
  isLockedInParent: boolean;
}
