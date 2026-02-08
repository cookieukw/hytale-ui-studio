import React from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { HytaleComponent } from "@/lib/hytale-types";
import { CollapsibleSection } from "./collapsible-section";
import { FieldRow } from "./field-row";

interface StatesTabProps {
  component: HytaleComponent;
  onUpdate: (updates: Partial<HytaleComponent>) => void;
}

export function StatesTab({ component, onUpdate }: StatesTabProps) {
  const hasStates = [
    "Button",
    "TextButton",
    "TextField",
    "ProgressBar",
  ].includes(component.type);

  if (!hasStates) return null;

  return (
    <div className="space-y-2">
      <CollapsibleSection title="Hovered">
        <FieldRow label="BG Color">
          <div className="flex gap-2">
            <Input
              type="color"
              value={component.states?.hovered?.background?.color || "#5aafff"}
              onChange={(e) =>
                onUpdate({
                  states: {
                    ...component.states,
                    hovered: {
                      ...component.states?.hovered,
                      background: {
                        ...component.states?.hovered?.background,
                        color: e.target.value,
                      },
                    },
                  },
                })
              }
              className="h-7 w-10 cursor-pointer p-1"
            />
            <Input
              type="text"
              value={component.states?.hovered?.background?.color || ""}
              onChange={(e) =>
                onUpdate({
                  states: {
                    ...component.states,
                    hovered: {
                      ...component.states?.hovered,
                      background: {
                        ...component.states?.hovered?.background,
                        color: e.target.value,
                      },
                    },
                  },
                })
              }
              className="h-7 flex-1 font-mono text-xs"
              placeholder="inherit"
            />
          </div>
        </FieldRow>
      </CollapsibleSection>

      <CollapsibleSection title="Pressed">
        <FieldRow label="BG Color">
          <div className="flex gap-2">
            <Input
              type="color"
              value={component.states?.pressed?.background?.color || "#3a8eef"}
              onChange={(e) =>
                onUpdate({
                  states: {
                    ...component.states,
                    pressed: {
                      ...component.states?.pressed,
                      background: {
                        ...component.states?.pressed?.background,
                        color: e.target.value,
                      },
                    },
                  },
                })
              }
              className="h-7 w-10 cursor-pointer p-1"
            />
            <Input
              type="text"
              value={component.states?.pressed?.background?.color || ""}
              onChange={(e) =>
                onUpdate({
                  states: {
                    ...component.states,
                    pressed: {
                      ...component.states?.pressed,
                      background: {
                        ...component.states?.pressed?.background,
                        color: e.target.value,
                      },
                    },
                  },
                })
              }
              className="h-7 flex-1 font-mono text-xs"
              placeholder="inherit"
            />
          </div>
        </FieldRow>
      </CollapsibleSection>

      <CollapsibleSection title="Disabled">
        <FieldRow label="Opacity">
          <div className="flex items-center gap-2">
            <Slider
              value={[component.states?.disabled?.background?.opacity ?? 0.5]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([value]) =>
                onUpdate({
                  states: {
                    ...component.states,
                    disabled: {
                      ...component.states?.disabled,
                      background: {
                        ...component.states?.disabled?.background,
                        opacity: value,
                      },
                    },
                  },
                })
              }
              className="flex-1"
            />
            <span className="w-8 text-right text-xs text-muted-foreground">
              {(
                (component.states?.disabled?.background?.opacity ?? 0.5) * 100
              ).toFixed(0)}
              %
            </span>
          </div>
        </FieldRow>
      </CollapsibleSection>
    </div>
  );
}
