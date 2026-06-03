import React from "react";
import type { HytaleComponent, Padding } from "@/lib/hytale-types";
import { hexToRgba } from "@/lib/utils";


  export function getComponentStyle(
  component: HytaleComponent,
  parentId: string | null | undefined,
  parentType: string | null | undefined,
  isBlueprint: boolean,
  parentLayoutMode?: string | null,
  parentPadding?: Padding
): React.CSSProperties {
    const style: React.CSSProperties = {};

    // ─── Root Element ─────────────────────────────────────────────────────────
    if (!parentId) {
      style.position = "absolute";
      style.top = 0;
      style.left = 0;
      style.right = 0;
      style.bottom = 0;
      style.width = "100%";
      style.height = "100%";
    }
    
    // Hytale anchors define content dimensions, padding expands the element's total size
    style.boxSizing = "content-box";

    // ─── zIndex ───────────────────────────────────────────────────────────────
    if (component.zIndex !== undefined) {
      style.zIndex = component.zIndex;
    }

    // ─── Box Sizing ───────────────────────────────────────────────────────────
    // We use border-box universally to prevent flex items from bleeding out when stretched.
    // To match Hytale's additive padding on explicit anchors, we manually add the padding
    // to the width and height properties below.
    style.boxSizing = "border-box";

    let paddingX = 0;
    let paddingY = 0;
    if (component.padding) {
      if (typeof component.padding === "number") {
        paddingX = component.padding * 2;
        paddingY = component.padding * 2;
      } else {
        paddingX = (component.padding.left || 0) + (component.padding.right || 0) + (component.padding.full ? component.padding.full * 2 : 0);
        paddingY = (component.padding.top || 0) + (component.padding.bottom || 0) + (component.padding.full ? component.padding.full * 2 : 0);
      }
    }

    // ─── Anchor System ────────────────────────────────────────────────────────
    // Hytale Anchor defines BOTH position AND size inside the parent.
    //   Full: N          → abs, all 4 edges at N px
    //   Left+Right only  → abs, stretches horizontally
    //   Top+Bottom only  → abs, stretches vertically
    //   Any single edge  → abs, sized by Width/Height
    //   Only Width/Height → relative flow
    if (component.anchor && parentId) {
      const a = component.anchor;

      // Expand 'Full' into 4 edges early so it acts like setting top/bottom/left/right
      if (a.full !== undefined) {
        if (a.top === undefined) a.top = a.full === true ? 0 : Number(a.full);
        if (a.bottom === undefined) a.bottom = a.full === true ? 0 : Number(a.full);
        if (a.left === undefined) a.left = a.full === true ? 0 : Number(a.full);
        if (a.right === undefined) a.right = a.full === true ? 0 : Number(a.full);
      }

      const hasTop = a.top !== undefined;
      const hasBottom = a.bottom !== undefined;
      const hasLeft = a.left !== undefined;
      const hasRight = a.right !== undefined;
      const hasWidth = a.width !== undefined;
      const hasHeight = a.height !== undefined;

      // Identify edges that act purely as gaps in the current stacking mode
      const isTopGap = ["Bottom", "Top", "TopScrolling", "MiddleCenter"].includes(parentLayoutMode ?? "");
      const isBottomGap = ["Top", "Bottom", "TopScrolling", "MiddleCenter"].includes(parentLayoutMode ?? "");
      const isLeftGap = ["Right", "Left", "LeftScrolling", "CenterMiddle", "Center", "LeftCenterWrap"].includes(parentLayoutMode ?? "");
      const isRightGap = ["Left", "Right", "LeftScrolling", "CenterMiddle", "Center", "LeftCenterWrap"].includes(parentLayoutMode ?? "");

      const hasAbsoluteTop = hasTop && !isTopGap;
      const hasAbsoluteBottom = hasBottom && !isBottomGap;
      const hasAbsoluteLeft = hasLeft && !isLeftGap;
      const hasAbsoluteRight = hasRight && !isRightGap;

      const hasAnyAbsoluteEdge =
        hasAbsoluteTop ||
        hasAbsoluteBottom ||
        hasAbsoluteLeft ||
        hasAbsoluteRight;
      const isAbsolute =
        hasAnyAbsoluteEdge &&
        (parentLayoutMode === "Full" || !parentLayoutMode);
      const isCollapsingStackAbsolute =
        hasAnyAbsoluteEdge && parentLayoutMode && parentLayoutMode !== "Full";

      // No hardcoded hasFull block here.
      // We rely on isAbsolute and isCollapsingStackAbsolute below.
      if (isAbsolute) {
        style.position = "absolute";
        
        // Hytale absolute positioning is relative to the CONTENT box, not the padding box.
        // We offset CSS absolute positions by the parent's padding to mimic this.
        const pTop = parentPadding?.top ?? parentPadding?.full ?? 0;
        const pBottom = parentPadding?.bottom ?? parentPadding?.full ?? 0;
        const pLeft = parentPadding?.left ?? parentPadding?.full ?? 0;
        const pRight = parentPadding?.right ?? parentPadding?.full ?? 0;

        if (hasTop) style.top = `${Number(a.top) + pTop}px`;
        if (hasBottom) style.bottom = `${Number(a.bottom) + pBottom}px`;
        if (hasLeft) style.left = `${Number(a.left) + pLeft}px`;
        if (hasRight) style.right = `${Number(a.right) + pRight}px`;
        // Explicit size alongside edge pins
        if (hasWidth) {
          const w = typeof a.width === "string" ? parseFloat(a.width) : (a.width || 0);
          style.width = `${w + paddingX}px`;
        }
        if (hasHeight) {
          const h = typeof a.height === "string" ? parseFloat(a.height) : (a.height || 0);
          style.height = `${h + paddingY}px`;
        }
        // Left+Right without Width → horizontal stretch
        if (hasLeft && hasRight && !hasWidth) delete style.width;
        // Top+Bottom without Height → vertical stretch
        if (hasTop && hasBottom && !hasHeight) delete style.height;

        // Hytale layout behavior: if absolute child has no horizontal anchors, it centers horizontally
        if (!hasLeft && !hasRight) {
          style.left = "50%";
          style.transform = "translateX(-50%)";
        }
      } else if (isCollapsingStackAbsolute) {
        // In stack layouts, cross-axis anchors (e.g. Top/Bottom in a horizontal stack)
        // cause the element to stretch along that cross axis, keeping it in flow.
        if (hasAbsoluteTop && hasAbsoluteBottom && !hasHeight) {
          style.height = `calc(100% - ${(a.top || 0) + (a.bottom || 0)}px)`;
          style.marginTop = `${a.top}px`;
          style.marginBottom = `${a.bottom}px`;
          style.alignSelf = "stretch";
        }
        if (hasAbsoluteLeft && hasAbsoluteRight && !hasWidth) {
          style.width = `calc(100% - ${(a.left || 0) + (a.right || 0)}px)`;
          style.marginLeft = `${a.left}px`;
          style.marginRight = `${a.right}px`;
          style.alignSelf = "stretch";
        }
      } else {
        // Widget-sized: only Width/Height, flows normally
        style.position = "relative";
        if (hasWidth) {
          const w = typeof a.width === "string" ? parseFloat(a.width) : (a.width || 0);
          style.width = `${w + paddingX}px`;
          // In vertical layouts, fixed-width elements center horizontally by default
          if (["Top", "Bottom", "TopScrolling"].includes(parentLayoutMode ?? "")) {
            style.alignSelf = "center";
          }
        }
        if (hasHeight) {
          const h = typeof a.height === "string" ? parseFloat(a.height) : (a.height || 0);
          style.height = `${h + paddingY}px`;
          // In horizontal layouts, fixed-height elements center vertically by default
          if (["Left", "Right", "LeftScrolling"].includes(parentLayoutMode ?? "")) {
            style.alignSelf = "center";
          }
        }
        
        // Apply directional anchors as margins when they act as gaps in flow layouts
        if (hasTop && isTopGap) style.marginTop = `${a.top}px`;
        if (hasBottom && isBottomGap) style.marginBottom = `${a.bottom}px`;
        if (hasLeft && isLeftGap) style.marginLeft = `${a.left}px`;
        if (hasRight && isRightGap) style.marginRight = `${a.right}px`;
      }
    }

    // ─── Padding ──────────────────────────────────────────────────────────────
    if (component.padding) {
      if (component.padding.top !== undefined)
        style.paddingTop = `${component.padding.top}px`;
      if (component.padding.bottom !== undefined)
        style.paddingBottom = `${component.padding.bottom}px`;
      if (component.padding.left !== undefined)
        style.paddingLeft = `${component.padding.left}px`;
      if (component.padding.right !== undefined)
        style.paddingRight = `${component.padding.right}px`;
    }

    // ─── Margin ───────────────────────────────────────────────────────────────
    if (component.margin) {
      if (component.margin.top !== undefined)
        style.marginTop = `${component.margin.top}px`;
      if (component.margin.bottom !== undefined)
        style.marginBottom = `${component.margin.bottom}px`;
      if (component.margin.left !== undefined)
        style.marginLeft = `${component.margin.left}px`;
      if (component.margin.right !== undefined)
        style.marginRight = `${component.margin.right}px`;
    }

    // In Hytale stack layouts, main-axis anchors act as margins (gaps).
    // For vertical stacks (Top, Bottom, MiddleCenter), top/bottom are margins.
    // For horizontal stacks (Left, Right, CenterMiddle, Center, LeftCenterWrap), left/right are margins.
    if (component.anchor && parentId && parentLayoutMode) {
      const a = component.anchor;
      const isVerticalStack = ["Top", "Bottom", "TopScrolling", "MiddleCenter"].includes(parentLayoutMode);
      const isHorizontalStack = ["Left", "Right", "LeftScrolling", "CenterMiddle", "Center", "LeftCenterWrap"].includes(parentLayoutMode);

      if (isVerticalStack) {
        if (a.top !== undefined) style.marginTop = `${a.top}px`;
        if (a.bottom !== undefined) style.marginBottom = `${a.bottom}px`;
      }
      if (isHorizontalStack) {
        if (a.left !== undefined) style.marginLeft = `${a.left}px`;
        if (a.right !== undefined) style.marginRight = `${a.right}px`;
      }
    }

    // ─── Background ───────────────────────────────────────────────────────────
    if (component.background && !isBlueprint) {
      if (component.background.color) {
        if (component.background.opacity !== undefined) {
          style.backgroundColor = hexToRgba(component.background.color, component.background.opacity);
        } else {
          style.backgroundColor = component.background.color;
        }
      }
      
      if (component.background.texture) {
        const texture = component.background.texture.startsWith("/")
          ? component.background.texture
          : `/${component.background.texture}`;
        style.backgroundImage = `url(${texture})`;
        style.backgroundSize = "100% 100%";
        style.backgroundRepeat = "no-repeat";
        
        // Note: CSS does not allow applying opacity exclusively to a background-image.
        // Applying style.opacity here would incorrectly make the children transparent.
      }
    }

    // ─── Outline (OutlineColor + OutlineSize) ─────────────────────────────────
    // Rendered via inset box-shadow so it doesn't affect layout dimensions.
    if (component.outlineColor && component.outlineSize) {
      style.boxShadow = `inset 0 0 0 ${component.outlineSize}px ${component.outlineColor}`;
    }

    // ─── FlexWeight ───────────────────────────────────────────────────────────
    if (component.flexWeight !== undefined) {
      style.flexGrow = component.flexWeight;
      style.flexShrink = 1;
      style.flexBasis = "0%"; // 0% basis so space-between distributes gaps, matching Hytale's proportional layout
      style.minHeight = 0; // standard flexbox fix for flex children
      style.minWidth = 0;
    } else {
      style.flexShrink = 0;
    }

    // ─── Direction (legacy) ───────────────────────────────────────────────────
    if (component.direction) {
      style.flexDirection =
        component.direction === "Vertical" ? "column" : "row";
    }

    // ─── LayoutMode ───────────────────────────────────────────────────────────
    // Defines how THIS element arranges its CHILDREN.
    if (component.layoutMode) {
      style.display = "flex";
      switch (component.layoutMode) {
        case "Top":
          style.flexDirection = "column";
          style.alignItems = "stretch";
          style.justifyContent = "flex-start";
          break;
        case "Bottom":
          style.flexDirection = "column";
          style.alignItems = "stretch";
          style.justifyContent = "flex-end";
          break;
        case "Left":
          style.flexDirection = "row";
          style.alignItems = "stretch";
          style.justifyContent = "flex-start";
          break;
        case "Right":
          style.flexDirection = "row";
          style.alignItems = "stretch";
          style.justifyContent = "flex-end";
          break;
        case "Center":
          // Centres children horizontally.
          style.flexDirection = "row";
          style.alignItems = "center";
          style.justifyContent = "center";
          break;
        case "Middle":
          // Centres children vertically.
          style.flexDirection = "column";
          style.alignItems = "center";
          style.justifyContent = "center";
          break;
        case "CenterMiddle":
          // Horizontal stack, centred both axes.
          style.flexDirection = "row";
          style.alignItems = "center";
          style.justifyContent = "center";
          break;
        case "MiddleCenter":
          // Vertical stack, centred both axes.
          style.flexDirection = "column";
          style.alignItems = "center";
          style.justifyContent = "center";
          break;
        case "TopScrolling":
          style.flexDirection = "column";
          style.alignItems = "stretch";
          style.justifyContent = "flex-start";
          style.overflowY = "auto";
          style.overflowX = "hidden";
          break;
        case "LeftScrolling":
          style.flexDirection = "row";
          style.alignItems = "stretch";
          style.justifyContent = "flex-start";
          style.overflowX = "auto";
          style.overflowY = "hidden";
          break;
        case "LeftCenterWrap":
          style.flexDirection = "row";
          style.flexWrap = "wrap";
          style.justifyContent = "center";
          style.alignContent = "flex-start";
          style.alignItems = "flex-start";
          break;
        case "Full":
          // Children use Anchor for absolute positioning within this element.
          style.display = "block";
          style.position = style.position ?? "relative";
          break;
      }
    }

    // ─── TextStyle ────────────────────────────────────────────────────────────
    if (component.textStyle) {
      style.color = component.textStyle.textColor;
      style.fontSize = component.textStyle.fontSize
        ? `${component.textStyle.fontSize}px`
        : undefined;
      style.fontWeight = component.textStyle.renderBold ? "bold" : undefined;
      style.textTransform = component.textStyle.renderUppercase
        ? "uppercase"
        : undefined;

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

      if (component.type === "Label") {
        if (!style.display) style.display = "flex";
        style.flexDirection = "column";
        const hAlign = component.textStyle?.horizontalAlignment || "Start";
        const vAlign = component.textStyle?.verticalAlignment || "Start";
        style.alignItems =
          hAlign === "Center"
            ? "center"
            : hAlign === "End"
              ? "flex-end"
              : "flex-start";
        style.justifyContent =
          vAlign === "Center"
            ? "center"
            : vAlign === "End"
              ? "flex-end"
              : "flex-start";
        style.textAlign =
          hAlign === "Center" ? "center" : hAlign === "End" ? "right" : "left";
      }
    }

    // ─── Group defaults ──────────────────────────────────────────
    if (component.type === "Group") {
      if (!style.display) {
        style.display = "flex";
        if (!style.flexDirection) style.flexDirection = "row";
      }
    }

    // ─── Button content centering ─────────────────────────────────────────────
    if (["Button", "CancelButton"].includes(component.type)) {
      style.display = "flex";
      style.flexDirection = "column";
      style.justifyContent = "center";
      style.alignItems = "center";
      style.textAlign = "center";
    }

    // ─── Cross-axis Stretch ───────────────────────────────────────────────────
    if (parentId && parentLayoutMode && style.position !== "absolute") {
      const stretchesHorizontally = ["Top", "Bottom", "TopScrolling"].includes(
        parentLayoutMode,
      );
      const stretchesVertically = ["Left", "Right", "LeftScrolling"].includes(
        parentLayoutMode,
      );

      if (stretchesHorizontally && !style.width && !component.anchor?.width) {
        style.width = "100%";
      }
      if (stretchesVertically && !style.height && !component.anchor?.height) {
        style.height = "100%";
      }
    }
    // ─── Default flexGrow for container children ──────────────────────────────
    const isContainerType = ["Group", "Panel", "DecoratedContainer"].includes(
      component.type,
    );

    if (
      isContainerType &&
      parentId &&
      !style.height &&
      !style.flex &&
      !style.flexGrow &&
      style.position !== "absolute"
    ) {
      style.flexGrow = 1;
    }

    // ─── Blueprint min-size for empty containers ──────────────────────────────
    if (
      isBlueprint &&
      isContainerType &&
      (!component.children || component.children.length === 0)
    ) {
      if (!style.minHeight && !style.height) style.minHeight = "40px";
      if (!style.minWidth && !style.width) style.minWidth = "40px";
    }

    // ─── Labels inside Buttons fill the button ────────────────────────────────
    if (
      component.type === "Label" &&
      ["Button", "CancelButton"].includes(parentType || "")
    ) {
      style.width = "100%";
      style.flexGrow = 1;
    }

    return style;
  };

export function getTextStyle(component: HytaleComponent, isBlueprint: boolean): React.CSSProperties {
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
  }
