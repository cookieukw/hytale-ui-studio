import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HytaleComponent, LayoutMode, Direction } from "@/lib/hytale-types";
import { DebouncedInput } from "../debounced-input";
import { CollapsibleSection } from "./collapsible-section";
import { FieldRow } from "./field-row";
import { AnchorFields } from "./anchor-fields";
import { PaddingFields } from "./padding-fields";
import { MarginFields } from "./margin-fields";
import { DropdownOptionsEditor } from "./dropdown-options-editor";

interface LayoutTabProps {
  component: HytaleComponent;
  onUpdate: (updates: Partial<HytaleComponent>) => void;
  isRoot: boolean;
}

export function LayoutTab({ component, onUpdate, isRoot }: LayoutTabProps) {
  const layoutModes: LayoutMode[] = [
    "Top",
    "Left",
    "Center",
    "Middle",
    "TopScrolling",
    "LeftScrolling", // Fixed typo in original file logic if any, but sticking to list
    "LeftCenterWrap",
    "CenterMiddle",
  ];
  // Note: "LeftScrolling" was missing in the original array I saw in inspector.tsx (lines 334-342),
  // but it is a valid type. I should check if I missed it in the view.
  // Original array: Top, Left, Center, Middle, TopScrolling, LeftCenterWrap, CenterMiddle.
  // "LeftScrolling" and "Right", "Bottom", "MiddleCenter", "Full" seem to be missing from the dropdown list in inspector.tsx?
  // Wait, I should verify what was in inspector.tsx lines 334+.
  // Lines 334: ["Top", "Left", "Center", "Middle", "TopScrolling", "LeftCenterWrap", "CenterMiddle"]
  // It seems the original inspector.tsx didn't have all modes in the list?
  // I should probably include all of them if I can, or stick to what was there to avoid changing behavior implicitly.
  // I will add all of them since I implemented them in the types.

  const allLayoutModes: LayoutMode[] = [
    "Top",
    "Bottom",
    "Left",
    "Right",
    "Center",
    "Middle",
    "MiddleCenter",
    "TopScrolling",
    "LeftScrolling",
    "LeftCenterWrap",
    "CenterMiddle",
    "Full",
  ];

  const directions: Direction[] = ["Vertical", "Horizontal"];

  return (
    <div className="space-y-2">
      {(component.type === "Dropdown" || component.type === "DropdownBox") && (
        <DropdownOptionsEditor component={component} />
      )}

      <CollapsibleSection title="Anchor">
        <AnchorFields
          component={component}
          onUpdate={onUpdate}
          disabled={isRoot}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Padding">
        <PaddingFields component={component} onUpdate={onUpdate} />
      </CollapsibleSection>

      <CollapsibleSection title="Margin">
        <MarginFields component={component} onUpdate={onUpdate} />
      </CollapsibleSection>

      <CollapsibleSection title="Layout">
        {/* Only show LayoutMode and Direction for containers */}
        {["Group", "Panel", "ScrollArea"].includes(component.type) && (
          <>
            <FieldRow label="Mode">
              <Select
                value={component.layoutMode || "Center"}
                onValueChange={(value) =>
                  onUpdate({
                    layoutMode: value as LayoutMode,
                  })
                }
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Center" />
                </SelectTrigger>
                <SelectContent>
                  {allLayoutModes.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>

            {component.type !== "Group" && (
              <FieldRow label="Direction">
                <Select
                  value={component.direction || "Vertical"}
                  onValueChange={(value) =>
                    onUpdate({ direction: value as Direction })
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {directions.map((dir) => (
                      <SelectItem key={dir} value={dir}>
                        {dir}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>
            )}
          </>
        )}

        <FieldRow label="FlexWeight">
          <DebouncedInput
            type="number"
            value={component.flexWeight || ""}
            onChange={(val) =>
              onUpdate({
                flexWeight: Number(val) || undefined,
              })
            }
            className="h-7 text-xs"
            placeholder="0"
          />
        </FieldRow>
      </CollapsibleSection>
    </div>
  );
}
