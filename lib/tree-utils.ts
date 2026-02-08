import type { HytaleComponent } from "./hytale-types";

// Helper to find parent and index (0-based)
export function findComponentLocation(
  components: HytaleComponent[],
  targetId: string,
  parentId: string | null = null,
): { parentId: string | null; index: number } | null {
  for (let i = 0; i < components.length; i++) {
    if (components[i].id === targetId) {
      return { parentId, index: i };
    }
    if (components[i].children) {
      const result = findComponentLocation(
        components[i].children!,
        targetId,
        components[i].id,
      );
      if (result) return result;
    }
  }
  return null;
}

export function generateId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function findComponentById(
  components: HytaleComponent[],
  id: string,
): HytaleComponent | null {
  for (const comp of components) {
    if (comp.id === id) return comp;
    if (comp.children) {
      const found = findComponentById(comp.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function updateComponentInTree(
  components: HytaleComponent[],
  id: string,
  updates: Partial<HytaleComponent>,
): HytaleComponent[] {
  return components.map((comp) => {
    if (comp.id === id) {
      return { ...comp, ...updates };
    }
    if (comp.children) {
      return {
        ...comp,
        children: updateComponentInTree(comp.children, id, updates),
      };
    }
    return comp;
  });
}

export function removeComponentFromTree(
  components: HytaleComponent[],
  id: string,
): HytaleComponent[] {
  return components
    .filter((comp) => comp.id !== id)
    .map((comp) => {
      if (comp.children) {
        return {
          ...comp,
          children: removeComponentFromTree(comp.children, id),
        };
      }
      return comp;
    });
}

export function addComponentToParent(
  components: HytaleComponent[],
  parentId: string | null,
  newComponent: HytaleComponent,
  index?: number,
): HytaleComponent[] {
  if (!parentId) {
    if (index !== undefined) {
      const newComps = [...components];
      newComps.splice(index, 0, newComponent);
      return newComps;
    }
    return [...components, newComponent];
  }

  return components.map((comp) => {
    if (comp.id === parentId) {
      const children = comp.children || [];
      if (index !== undefined) {
        const newChildren = [...children];
        newChildren.splice(index, 0, newComponent);
        return { ...comp, children: newChildren };
      }
      return { ...comp, children: [...children, newComponent] };
    }
    if (comp.children) {
      return {
        ...comp,
        children: addComponentToParent(
          comp.children,
          parentId,
          newComponent,
          index,
        ),
      };
    }
    return comp;
  });
}

export function duplicateComponent(
  component: HytaleComponent,
  existingNames: Set<string> = new Set(),
): HytaleComponent {
  // If we are duplicating, we typically want to keep the name similar but unique?
  // User previously asked to REMOVE "(copy)".
  // But now they say "labels cannot have duplicate IDs".
  // So if I allow duplicate names, it causes error.
  // The user said "remove (copy)" previously because it caused error.
  // Actually, they said "duplicate elements should not have (copy) in the name. this causes error".
  // BUT now they say "labels cannot have same ID".
  // These are conflicting requirements if interpreted literally:
  // 1. "Don't add (copy)" -> Name stays same.
  // 2. "Don't have same ID" -> Name MUST be different.
  // Interpretation: The user wants valid Hytale IDs. Hytale IDs must be unique.
  // So if I duplicate "Button", it should probably be "Button 1".
  // The "(copy)" suffix was likely invalid because of the parenthesis or format.
  // So I will use generateUniqueName here too.

  // Wait, if I change duplicateComponent signature, I valid existing calls.
  // But I can't easily pass existingNames from everywhere unless I traverse.
  // Actually, duplicating usually happens in store where we have state.

  const newId = generateId();
  // We won't enforce unique name HERE if we don't have the set.
  // But ideally we should.
  // Let's modify the signature to OPTIONALLY take existingNames.
  // If provided, we uniquify.

  let name = component.name;
  if (existingNames.size > 0) {
    name = generateUniqueName(component.name, existingNames);
    existingNames.add(name);
  }

  return {
    ...component,
    id: newId,
    name: name,
    children: component.children?.map((c) =>
      duplicateComponent(c, existingNames),
    ),
  };
}

// Helper to format Hytale colors: #RRGGBB or #RRGGBB(Alpha) checks if hex is 3 or 6 digits
export const formatHytaleColor = (hex?: string, opacity?: number): string => {
  if (!hex) return "";

  // Normalize hex to 6 digits
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  if (opacity !== undefined && opacity < 1) {
    return `#${cleanHex}(${opacity})`;
  }

  return `#${cleanHex}`;
};

// Helper to collectAllNames
export function collectAllNames(components: HytaleComponent[]): Set<string> {
  const names = new Set<string>();
  const traverse = (comps: HytaleComponent[]) => {
    comps.forEach((c) => {
      if (c.name) names.add(c.name);
      if (c.children) traverse(c.children);
    });
  };
  traverse(components);
  return names;
}

export function generateUniqueName(
  baseName: string,
  existingNames: Set<string>,
): string {
  // Sanitize baseName: remove spaces and underscores, ensure alphanumeric (mostly)
  // Hytale IDs are typically PascalCase or camelCase without special chars
  let sanitized = baseName.replace(/[\s_]/g, "");

  // If sanitization made it empty (e.g. input was " _ "), fallback to "Component"
  if (!sanitized) sanitized = "Component";

  let name = sanitized;
  let counter = 1;
  while (existingNames.has(name)) {
    name = `${sanitized}${counter}`;
    counter++;
  }
  return name;
}

export function regenerateIds(
  component: HytaleComponent,
  existingNames: Set<string> = new Set(),
): HytaleComponent {
  // Generate unique name
  const uniqueName = generateUniqueName(component.name, existingNames);
  existingNames.add(uniqueName);

  return {
    ...component,
    id: generateId(),
    name: uniqueName,
    children: component.children?.map((child) =>
      regenerateIds(child, existingNames),
    ),
  };
}

export function componentsToCode(
  components: HytaleComponent[],
  depth = 0,
  imports?: string[],
): string {
  let code = "";

  // Only add imports at the root level (depth 0)
  if (depth === 0 && imports && imports.length > 0) {
    code += imports.join("\n") + "\n\n";
  }

  const spaces = "  ".repeat(depth);

  components.forEach((comp) => {
    // Header: Alias or Type #ID or Type
    let typeToExport = comp.alias || comp.type;
    if (!comp.alias && typeToExport === "ScrollArea") {
      typeToExport = "Group";
    }
    // Sprite is exported as Sprite, which is default behavior

    const idPart = comp.name && comp.name !== comp.type ? ` #${comp.name}` : "";
    code += `${spaces}${typeToExport}${idPart} {\n`;

    // Visible
    if (typeof comp.isVisible === "boolean" && comp.isVisible === false) {
      code += `${spaces}  Visible: false;\n`;
    }

    // ScrollbarStyle
    if (comp.scrollbarStyle) {
      code += `${spaces}  ScrollbarStyle: ${comp.scrollbarStyle};\n`;
    }

    // Text (quoted)
    if (comp.text) {
      // For TextField, we usually skip exporting Text if it's handled by a child Label,
      // but if the component HAS text property set, we export it.
      // Ideally we check component type.
      // But adhering to the previous logic:
      if (comp.type !== "Dropdown" && comp.type !== "DropdownBox") {
        code += `${spaces}  Text: "${comp.text}";\n`;
      }
    }
    if (comp.placeholderText) {
      code += `${spaces}  PlaceholderText: "${comp.placeholderText}";\n`;
    }

    // Value
    if (comp.value !== undefined) {
      code += `${spaces}  Value: ${comp.value};\n`;
    }
    if (comp.max !== undefined) {
      code += `${spaces}  Max: ${comp.max};\n`;
    }

    // Anchor: (Key: Val, ...) syntax
    // Omit for Root Element (depth 0) as it is always full screen
    if (comp.anchor && depth > 0) {
      if (comp.anchor.full) {
        code += `${spaces}  Anchor: (Full: 1);\n`;
      } else {
        const parts: string[] = [];
        if (comp.anchor.width !== undefined)
          parts.push(`Width: ${comp.anchor.width}`);
        if (comp.anchor.height !== undefined)
          parts.push(`Height: ${comp.anchor.height}`);
        if (comp.anchor.top !== undefined)
          parts.push(`Top: ${comp.anchor.top}`);
        if (comp.anchor.bottom !== undefined)
          parts.push(`Bottom: ${comp.anchor.bottom}`);
        if (comp.anchor.left !== undefined)
          parts.push(`Left: ${comp.anchor.left}`);
        if (comp.anchor.right !== undefined)
          parts.push(`Right: ${comp.anchor.right}`);

        if (comp.anchor.centerX !== undefined)
          parts.push(`CenterX: ${comp.anchor.centerX}`);
        if (comp.anchor.centerY !== undefined)
          parts.push(`CenterY: ${comp.anchor.centerY}`);

        if (parts.length > 0) {
          code += `${spaces}  Anchor: (${parts.join(", ")});\n`;
        }
      }
    }

    // Padding: (Key: Val, ...)
    if (comp.padding) {
      const { top, bottom, left, right } = comp.padding;
      if (
        top !== undefined &&
        top === bottom &&
        top === left &&
        top === right
      ) {
        code += `${spaces}  Padding: (Full: ${top});\n`;
      } else {
        const parts: string[] = [];
        if (top !== undefined) parts.push(`Top: ${top}`);
        if (bottom !== undefined) parts.push(`Bottom: ${bottom}`);
        if (left !== undefined) parts.push(`Left: ${left}`);
        if (right !== undefined) parts.push(`Right: ${right}`);
        if (parts.length > 0) {
          code += `${spaces}  Padding: (${parts.join(", ")});\n`;
        }
      }
    }

    // LayoutMode
    const isButton = [
      "Button",
      "SecondaryButton",
      "TertiaryButton",
      "CancelButton",
    ].includes(comp.type);
    if (comp.layoutMode && comp.type !== "Label" && !isButton) {
      code += `${spaces}  LayoutMode: ${comp.layoutMode};\n`;
    }
    if (comp.direction && comp.direction === "Vertical") {
      code += `${spaces}  Direction: ${comp.direction};\n`;
    }
    if (comp.flexWeight !== undefined) {
      code += `${spaces}  FlexWeight: ${comp.flexWeight};\n`;
    }

    // Background: (Key: Val, ...)
    if (comp.background) {
      const parts: string[] = [];

      // Color: #RRGGBB(Opacity) format, no quotes
      const colorString = formatHytaleColor(
        comp.background.color,
        comp.background.opacity,
      );
      if (colorString) parts.push(`Color: ${colorString}`);

      // Border: Value (Radius)
      if (comp.background.border) {
        parts.push(`Border: ${comp.background.border}`);
      }

      // Opacity is now merged into Color, so we don't list it separately for Background
      // unless user wants standalone Opacity property? Request said: "opacidade nao é um atributo. ele vai sempre do lado da cor"

      if (parts.length > 0) {
        code += `${spaces}  Background: (${parts.join(", ")});\n`;
      }
    }

    // TimerLabel Seconds
    if (comp.type === "TimerLabel" && comp.seconds !== undefined) {
      code += `${spaces}  Seconds: ${comp.seconds};\n`;
    }

    // CheckBox
    if (comp.type === "CheckBox" && comp.checked !== undefined) {
      code += `${spaces}  Checked: ${comp.checked};\n`;
    }

    // Slider
    if (comp.type === "Slider") {
      if (comp.min !== undefined) code += `${spaces}  Min: ${comp.min};\n`;
      if (comp.max !== undefined) code += `${spaces}  Max: ${comp.max};\n`;
      if (comp.step !== undefined) code += `${spaces}  Step: ${comp.step};\n`;
    }

    // NumberField Format
    if (comp.type === "NumberField") {
      const parts: string[] = [];
      if (comp.maxDecimalPlaces !== undefined)
        parts.push(`MaxDecimalPlaces: ${comp.maxDecimalPlaces}`);
      if (comp.step !== undefined) parts.push(`Step: ${comp.step}`);
      if (comp.min !== undefined) parts.push(`MinValue: ${comp.min}`);
      if (comp.max !== undefined) parts.push(`MaxValue: ${comp.max}`);

      if (parts.length > 0) {
        code += `${spaces}  Format: (${parts.join(", ")});\n`;
      }
    }

    // Dropdown
    if (comp.type === "Dropdown" || comp.type === "DropdownBox") {
      // Data
      if (comp.entries && comp.entries.length > 0) {
        // Assuming comma separated strings in parentheses for IReadOnlyList? Or array syntax?
        // Hytale arrays usually ( "A", "B" )
        const entriesStr = comp.entries.map((e) => `"${e}"`).join(", ");
        code += `${spaces}  Entries: (${entriesStr});\n`;
      }
      if (comp.selectedValues && comp.selectedValues.length > 0) {
        const selStr = comp.selectedValues.map((e) => `"${e}"`).join(", ");
        code += `${spaces}  SelectedValues: (${selStr});\n`;
      }
      if (comp.maxSelection !== undefined)
        code += `${spaces}  MaxSelection: ${comp.maxSelection};\n`;
      if (comp.displayNonExistingValue !== undefined)
        code += `${spaces}  DisplayNonExistingValue: ${comp.displayNonExistingValue};\n`;
      if (comp.noItemsText)
        code += `${spaces}  NoItemsText: "${comp.noItemsText}";\n`;

      // Visibility / State
      if (comp.disabled !== undefined)
        code += `${spaces}  Disabled: ${comp.disabled};\n`;
      if (comp.isReadOnly !== undefined)
        code += `${spaces}  IsReadOnly: ${comp.isReadOnly};\n`;
      if (comp.showLabel !== undefined)
        code += `${spaces}  ShowLabel: ${comp.showLabel};\n`;
      if (comp.forcedLabel)
        code += `${spaces}  ForcedLabel: "${comp.forcedLabel}";\n`;
      if (comp.showSearchInput !== undefined)
        code += `${spaces}  ShowSearchInput: ${comp.showSearchInput};\n`;
      if (comp.panelTitleText)
        code += `${spaces}  PanelTitleText: "${comp.panelTitleText}";\n`;

      // Interaction
      if (comp.hitTestVisible !== undefined)
        code += `${spaces}  HitTestVisible: ${comp.hitTestVisible};\n`;
      if (comp.mouseWheelScrollBehaviour)
        code += `${spaces}  MouseWheelScrollBehaviour: ${comp.mouseWheelScrollBehaviour};\n`;

      // Tooltip
      if (comp.tooltipText)
        code += `${spaces}  TooltipText: "${comp.tooltipText}";\n`;
      if (comp.textTooltipShowDelay !== undefined)
        code += `${spaces}  TextTooltipShowDelay: ${comp.textTooltipShowDelay};\n`;

      // Layout
      if (comp.contentWidth !== undefined)
        code += `${spaces}  ContentWidth: ${comp.contentWidth};\n`;
      if (comp.contentHeight !== undefined)
        code += `${spaces}  ContentHeight: ${comp.contentHeight};\n`;

      // Scroll
      if (comp.autoScrollDown !== undefined)
        code += `${spaces}  AutoScrollDown: ${comp.autoScrollDown};\n`;
      if (comp.keepScrollPosition !== undefined)
        code += `${spaces}  KeepScrollPosition: ${comp.keepScrollPosition};\n`;
      if (comp.overscroll !== undefined)
        code += `${spaces}  Overscroll: ${comp.overscroll};\n`;

      // Style / Appearance
      if (comp.maskTexturePath)
        code += `${spaces}  MaskTexturePath: "${comp.maskTexturePath}";\n`;
      if (comp.outlineColor)
        code += `${spaces}  OutlineColor: ${formatHytaleColor(comp.outlineColor)};\n`;
      if (comp.outlineSize !== undefined)
        code += `${spaces}  OutlineSize: ${comp.outlineSize};\n`;

      // DropdownBoxStyle (Style) export
      // We map dropdownStyle back to "Style: (...)"
      if (comp.dropdownStyle) {
        const parts: string[] = [];
        // Standard TextStyle parts? Or specific DropdownBoxStyle parts?
        // User said "Style: DropdownBoxStyle". Assuming it has overrides.
        // For now let's check basic color/font properties if present in dropdownStyle
        // If dropdownStyle is just the object, we iterate known keys.
        if (comp.dropdownStyle.fontSize)
          parts.push(`FontSize: ${comp.dropdownStyle.fontSize}`);
        if (comp.dropdownStyle.color)
          parts.push(`Color: ${formatHytaleColor(comp.dropdownStyle.color)}`);
        if (comp.dropdownStyle.renderBold)
          parts.push(`RenderBold: ${comp.dropdownStyle.renderBold}`);
        // Add others as needed
        if (parts.length > 0) {
          code += `${spaces}  Style: (${parts.join(", ")});\n`;
        }
      }
    }

    // Sprite Properties
    if (comp.type === "Sprite") {
      if (comp.texturePath) {
        code += `${spaces}  TexturePath: "${comp.texturePath}";\n`;
      }
      if (comp.frame) {
        const { width, height, perRow, count } = comp.frame;
        code += `${spaces}  Frame: (Width: ${width}, Height: ${height}, PerRow: ${perRow}, Count: ${count});\n`;
      }
      if (comp.framesPerSecond !== undefined) {
        code += `${spaces}  FramesPerSecond: ${comp.framesPerSecond};\n`;
      }
    }

    // TextStyle
    // TimerLabel uses Style: (...) syntax
    if (comp.textStyle) {
      if (comp.type === "TimerLabel") {
        const parts: string[] = [];
        if (comp.textStyle.fontSize)
          parts.push(`FontSize: ${comp.textStyle.fontSize}`);
        if (comp.textStyle.alignment)
          parts.push(`Alignment: ${comp.textStyle.alignment}`);
        if (comp.textStyle.textColor)
          parts.push(
            `TextColor: ${formatHytaleColor(comp.textStyle.textColor)}`,
          );
        if (comp.textStyle.renderBold) parts.push(`RenderBold: true`);

        if (parts.length > 0) {
          code += `${spaces}  Style: (${parts.join(", ")});\n`;
        }
      } else {
        // Standard Element export
        // Label also uses Style: (...) syntax now per user request
        if (comp.type === "Label") {
          const parts: string[] = [];
          if (comp.textStyle.fontSize)
            parts.push(`FontSize: ${comp.textStyle.fontSize}`);
          if (comp.textStyle.textColor)
            parts.push(
              `TextColor: ${formatHytaleColor(comp.textStyle.textColor)}`,
            );
          if (comp.textStyle.renderBold) parts.push(`RenderBold: true`);
          if (comp.textStyle.renderUppercase)
            parts.push(`RenderUppercase: true`);
          // Label does NOT have generic Alignment option per user request
          // if (comp.textStyle.alignment)
          //   parts.push(`Alignment: ${comp.textStyle.alignment}`);

          if (comp.textStyle.horizontalAlignment)
            parts.push(
              `HorizontalAlignment: ${comp.textStyle.horizontalAlignment}`,
            );
          if (comp.textStyle.verticalAlignment)
            parts.push(
              `VerticalAlignment: ${comp.textStyle.verticalAlignment}`,
            );

          if (parts.length > 0) {
            code += `${spaces}  Style: (${parts.join(", ")});\n`;
          }
        }
      }
    }

    // Recursively process children
    if (comp.children && comp.children.length > 0) {
      code += componentsToCode(comp.children, depth + 1);
    }

    code += `${spaces}}\n`;
  });

  return code;
}
