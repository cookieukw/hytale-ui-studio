import React from "react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/lib/editor-store";
import type { HytaleComponent } from "@/lib/hytale-types";
import { RenderedComponent } from "./rendered-component";
import { SpriteRenderer } from "./renderers/sprite-renderer";
import { getTextStyle } from "./utils/style-mapper";
import { FileJson } from "lucide-react";
import type { ComponentContentRendererProps } from "./types";
// Removed DOMPurify and escapeHtml for secure AST rendering

export function ComponentContentRenderer({
  component,
  isBlueprint,
  selectedId,
  onSelect,
  parentId,
  renderWithIndicators,
  isDropdownOpen,
  setIsDropdownOpen
}: ComponentContentRendererProps) {
  const isSelected = selectedId === component.id;
  const currentProjectId = useEditorStore((state) => state.currentProjectId);
  const projects = useEditorStore((state) => state.projects);
  const pluginComponents = useEditorStore((state) => state.pluginComponents);

  // 1. Check if this is a Plugin Component
  const pluginDef = pluginComponents[component.type];
  if (pluginDef && pluginDef.isPlugin && pluginDef.template) {
    // 1. Resolve variables in the AST template
    const resolveTemplate = (node: any): any => {
      if (typeof node === "string") {
        return node.replace(/{([^}]+)}/g, (match, propName) => {
          if (component[propName] !== undefined) {
            return String(component[propName]);
          }
          return match;
        });
      }
      if (Array.isArray(node)) {
        return node.map(resolveTemplate);
      }
      if (typeof node === "object" && node !== null) {
        const resolved: any = {};
        for (const [key, value] of Object.entries(node)) {
          resolved[key] = resolveTemplate(value);
        }
        return resolved;
      }
      return node;
    };

    let idCounter = 0;
    const assignIdsAndLock = (node: any): any => {
      const newNode = { 
        ...node, 
        id: `${component.id}-inner-${idCounter++}`,
        isLocked: true, // Prevent direct dragging of the inner macro structure
        hitTestVisible: false, // Ensure clicks pass through to parent
      };
      if (newNode.children && Array.isArray(newNode.children)) {
        newNode.children = newNode.children.map(assignIdsAndLock);
      }
      return newNode;
    };

    const resolvedComponent = assignIdsAndLock(resolveTemplate(pluginDef.template));

    return renderWithIndicators(
      <RenderedComponent
        component={resolvedComponent as HytaleComponent}
        isBlueprint={isBlueprint}
        selectedId={selectedId} // Inner nodes won't match parent's selection ID
        onSelect={() => {}} // Ignore internal selects, handled by parent wrapper
        parentId={component.id}
        parentType={component.type}
      />,
      "pointer-events-none", // Ensure the whole inner tree doesn't intercept clicks
      { overflow: "hidden", display: "flex", flex: 1, width: "100%", height: "100%" }
    );
  }

  // 2. Standard Built-in Components
  switch (component.type) {
    case "Label": {
      // Labels should always center their content; override any fixed height to prevent clipping on large fonts
      const hAlign = component.textStyle?.horizontalAlignment || "Start";
      const vAlign = component.textStyle?.verticalAlignment || "Start";

      const labelOverrideStyle: React.CSSProperties = {
        ...getTextStyle(component, isBlueprint),
        display: "flex",
        flexDirection: "column",
        alignItems:
          hAlign === "End"
            ? "flex-end"
            : hAlign === "Center"
              ? "center"
              : "flex-start",
        justifyContent:
          vAlign === "End"
            ? "flex-end"
            : vAlign === "Center"
              ? "center"
              : "flex-start",
        textAlign:
          hAlign === "End" ? "right" : hAlign === "Center" ? "center" : "left",
        minHeight: component.anchor?.height
          ? `${component.anchor.height}px`
          : undefined,
        // Don't enforce a fixed height — let the label grow with font size
        height: undefined,
        overflow: "visible",
      };
      return renderWithIndicators(
        <span style={{ width: "100%" }}>{component.text || "Label"}</span>,
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

      return renderWithIndicators(`${mm}:${ss}`, undefined, getTextStyle(component, isBlueprint));

    case "TextField":
      return renderWithIndicators(
        <span
          className={cn(
            isBlueprint ? "text-primary/70" : "text-muted-foreground",
          )}
          style={getTextStyle(component, isBlueprint)}
        >
          {component.placeholderText || "Enter text..."}
        </span>,
        "rounded-sm border-b-2 border-[#fbbf24] bg-black/20 flex items-center overflow-hidden",
      );

    case "NumberField":
      return renderWithIndicators(
        <span
          className={cn(
            "font-mono",
            isBlueprint ? "text-primary/70" : "text-foreground",
          )}
          style={getTextStyle(component, isBlueprint)}
        >
          {component.value ?? 0}
        </span>,
        "rounded-sm border-b-2 border-[#fbbf24] bg-black/20 flex items-center overflow-hidden",
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
              parentLayoutMode={component.layoutMode}
              parentPadding={component.padding}
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
        getTextStyle(component, isBlueprint),
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
      // Extract options from children if available (filter once, reuse everywhere)
      const dropdownEntries = (component.children || []).filter(
        (c) => c.type === "DropdownEntry",
      );
      const childOptions = dropdownEntries.map(
        (c) => c.text || c.value || c.name,
      );
      const items =
        childOptions.length > 0 ? childOptions : component.entries || [];

      const isDisabled = component.disabled;
      const readOnly = component.isReadOnly;

      // Dropdown Style Implementation
      // Merge base text styles and specific dropdown styles
      // const [isDropdownOpen, setIsDropdownOpen] = React.useState(false); // MOVED TO TOP

      const mergedStyle: React.CSSProperties = {
        ...getTextStyle(component, isBlueprint),
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
              {(dropdownEntries.length > 0
                ? dropdownEntries
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
              parentLayoutMode={component.layoutMode}
              parentPadding={component.padding}
            />
          ))}
        </>,
        "rounded",
      );

    case "ImportedUI": {
      const project = projects.find((p) => p.id === currentProjectId);
      const importedFile = project?.files.find(
        (f) => f.name === component.importPath,
      );

      if (!importedFile || !importedFile.components.length) {
        return renderWithIndicators(
          <div className="flex h-full w-full flex-col items-center justify-center rounded border border-dashed border-primary/30 bg-primary/5 text-primary/50">
            <FileJson className="mb-1 h-6 w-6" />
            <span className="font-mono text-[10px]">
              {component.importPath || "No file selected"}
            </span>
          </div>,
        );
      }

      return renderWithIndicators(
        <div className="relative inline-flex flex-wrap items-start gap-1 border border-dotted border-primary/20 rounded p-0.5">
          <div className="absolute right-0 top-0 z-50 rounded-bl bg-primary/20 px-1 font-bold uppercase text-primary text-[8px] pointer-events-none leading-tight">
            {importedFile.name}
          </div>
          {importedFile.components.map((child: any, i: number) => (
            <RenderedComponent
              key={child.id}
              component={child}
              isBlueprint={isBlueprint}
              selectedId={null}
              onSelect={() => onSelect(component.id)}
              index={i}
              parentId={component.id}
              parentType={component.type}
            />
          ))}
        </div>,
        undefined,
        // Override ImportedUI's own style to be inline/auto-sized
        {
          position: "relative",
          width: "auto",
          height: "auto",
          display: "inline-flex",
        },
      );
    }

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
              parentLayoutMode={component.layoutMode}
              parentPadding={component.padding}
            />
          ))}
        </>,
        "overflow-hidden rounded",
      );
  }
}
