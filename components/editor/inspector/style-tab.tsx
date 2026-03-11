import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HytaleComponent, TextAlignment } from "@/lib/hytale-types";
import { DebouncedInput } from "../debounced-input";
import { DebouncedColorPicker } from "../debounced-color-picker";
import { CollapsibleSection } from "./collapsible-section";
import { FieldRow } from "./field-row";
import { Input } from "@/components/ui/input";

interface StyleTabProps {
  component: HytaleComponent;
  onUpdate: (updates: Partial<HytaleComponent>) => void;
}

export function StyleTab({ component, onUpdate }: StyleTabProps) {
  const alignments: TextAlignment[] = ["Left", "Center", "Right"];

  const hasTextStyle = [
    "Label",
    "TextButton",
    "TextField",
    "TimerLabel",
    "Dropdown",
    "CheckBox",
    "ProgressBar",
    "Slider",
    "SecondaryTextButton",
    "TertiaryTextButton",
    "CancelTextButton",
  ].includes(component.type);

  const hasPlaceholder = ["TextField", "NumberField"].includes(component.type);
  const hasValue = ["ProgressBar", "NumberField", "Slider"].includes(
    component.type,
  );
  const hasText = ["Label", "TextButton", "Dropdown"].includes(component.type);
  const hasChecked = ["CheckBox"].includes(component.type);
  const hasOptions = ["Dropdown"].includes(component.type);

  return (
    <div className="space-y-2">
      {hasText && (
        <CollapsibleSection title="Text">
          <FieldRow label="Content">
            <DebouncedInput
              type="text"
              value={component.text || ""}
              onChange={(val) => onUpdate({ text: String(val) })}
              className="h-7 text-xs"
              placeholder="Enter text..."
            />
          </FieldRow>
        </CollapsibleSection>
      )}

      {hasPlaceholder && (
        <CollapsibleSection title="Placeholder">
          <FieldRow label="Text">
            <DebouncedInput
              type="text"
              value={component.placeholderText || ""}
              onChange={(val) => onUpdate({ placeholderText: String(val) })}
              className="h-7 text-xs"
              placeholder="Enter placeholder..."
            />
          </FieldRow>
        </CollapsibleSection>
      )}

      {hasValue && (
        <CollapsibleSection title="Value">
          <FieldRow label="Value">
            <DebouncedInput
              type="number"
              value={component.value ?? 0}
              onChange={(val) => onUpdate({ value: Number(val) })}
              className="h-7 text-xs"
            />
          </FieldRow>
          {component.type === "ProgressBar" && (
            <>
              <FieldRow label="Show Label">
                <Switch
                  checked={component.showLabel ?? true}
                  onCheckedChange={(checked) =>
                    onUpdate({ showLabel: checked })
                  }
                />
              </FieldRow>
            </>
          )}
        </CollapsibleSection>
      )}

      {component.type === "TimerLabel" && (
        <CollapsibleSection title="Timer">
          <FieldRow label="Seconds">
            <DebouncedInput
              type="number"
              value={component.seconds ?? 0}
              onChange={(val) => onUpdate({ seconds: Number(val) })}
              className="h-7 text-xs"
            />
          </FieldRow>
        </CollapsibleSection>
      )}

      {hasChecked && (
        <CollapsibleSection title="State">
          <FieldRow label="Checked">
            <Switch
              checked={component.checked ?? false}
              onCheckedChange={(checked) => onUpdate({ checked })}
            />
          </FieldRow>
        </CollapsibleSection>
      )}

      {component.type === "NumberField" && (
        <CollapsibleSection title="Format">
          <FieldRow label="Step">
            <DebouncedInput
              type="number"
              value={component.step ?? 1}
              onChange={(val) => onUpdate({ step: Number(val) })}
              className="h-7 text-xs"
            />
          </FieldRow>
          <FieldRow label="Max Decimals">
            <DebouncedInput
              type="number"
              value={component.maxDecimalPlaces ?? 0}
              onChange={(val) =>
                onUpdate({
                  maxDecimalPlaces: Number(val),
                })
              }
              className="h-7 text-xs"
            />
          </FieldRow>
        </CollapsibleSection>
      )}

      {component.type === "Slider" && (
        <CollapsibleSection title="Range">
          <FieldRow label="Min">
            <DebouncedInput
              type="number"
              value={component.min ?? 0}
              onChange={(val) => onUpdate({ min: Number(val) })}
              className="h-7 text-xs"
            />
          </FieldRow>
          <FieldRow label="Max">
            <DebouncedInput
              type="number"
              value={component.max ?? 100}
              onChange={(val) => onUpdate({ max: Number(val) })}
              className="h-7 text-xs"
            />
          </FieldRow>
          <FieldRow label="Step">
            <DebouncedInput
              type="number"
              value={component.step ?? 1}
              onChange={(val) => onUpdate({ step: Number(val) })}
              className="h-7 text-xs"
            />
          </FieldRow>
        </CollapsibleSection>
      )}

      {hasOptions && (
        <CollapsibleSection title="Options">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">
              Comma separated
            </span>
            <DebouncedInput
              type="text"
              value={component.options?.join(", ") || ""}
              onChange={(val) =>
                onUpdate({
                  options: String(val)
                    .split(",")
                    .map((s) => s.trim()),
                })
              }
              className="h-7 text-xs"
            />
          </div>
        </CollapsibleSection>
      )}

      {hasTextStyle && (
        <CollapsibleSection title="Typography">
          {!["Button", "CancelButton"].includes(component.type) && (
            <FieldRow label="Font Size">
              <DebouncedInput
                type="number"
                value={component.textStyle?.fontSize || 14}
                onChange={(val) =>
                  onUpdate({
                    textStyle: {
                      ...component.textStyle,
                      fontSize: Number(val),
                    },
                  })
                }
                className="h-7 text-xs"
              />
            </FieldRow>
          )}

          <FieldRow label="Color">
            <div className="flex gap-2">
              <DebouncedColorPicker
                value={component.textStyle?.textColor || "#ffffff"}
                onChange={(val) =>
                  onUpdate({
                    textStyle: {
                      ...component.textStyle,
                      textColor: val,
                    },
                  })
                }
                className="h-7 w-10"
              />
              <DebouncedInput
                type="text"
                value={component.textStyle?.textColor || "#ffffff"}
                onChange={(val) =>
                  onUpdate({
                    textStyle: {
                      ...component.textStyle,
                      textColor: String(val),
                    },
                  })
                }
                className="h-7 flex-1 font-mono text-xs"
              />
            </div>
          </FieldRow>

          {component.type === "Label" ? (
            <>
              <FieldRow label="H. Align">
                <Select
                  value={component.textStyle?.horizontalAlignment || "Start"}
                  onValueChange={(value) =>
                    onUpdate({
                      textStyle: {
                        ...component.textStyle,
                        horizontalAlignment: value,
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Start", "Center", "End"].map((align) => (
                      <SelectItem key={align} value={align}>
                        {align}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>
              <FieldRow label="V. Align">
                <Select
                  value={component.textStyle?.verticalAlignment || "Start"}
                  onValueChange={(value) =>
                    onUpdate({
                      textStyle: {
                        ...component.textStyle,
                        verticalAlignment: value,
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Start", "Center", "End"].map((align) => (
                      <SelectItem key={align} value={align}>
                        {align}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>
            </>
          ) : (
            <FieldRow label="Align">
              <Select
                value={component.textStyle?.alignment || "Left"}
                onValueChange={(value) =>
                  onUpdate({
                    textStyle: {
                      ...component.textStyle,
                      alignment: value as TextAlignment,
                    },
                  })
                }
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {alignments.map((align) => (
                    <SelectItem key={align} value={align}>
                      {align}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>
          )}

          <FieldRow label="Bold">
            <Switch
              checked={component.textStyle?.renderBold || false}
              onCheckedChange={(checked) =>
                onUpdate({
                  textStyle: {
                    ...component.textStyle,
                    renderBold: checked,
                  },
                })
              }
            />
          </FieldRow>

          <FieldRow label="Uppercase">
            <Switch
              checked={component.textStyle?.renderUppercase || false}
              onCheckedChange={(checked) =>
                onUpdate({
                  textStyle: {
                    ...component.textStyle,
                    renderUppercase: checked,
                  },
                })
              }
            />
          </FieldRow>
        </CollapsibleSection>
      )}

      {component.type === "ProgressBar" && (
        <CollapsibleSection title="Progress Textures">
          <FieldRow label="Bar Texture">
            <DebouncedInput
              type="text"
              value={component.barTexturePath || ""}
              onChange={(val) => onUpdate({ barTexturePath: String(val) })}
              className="h-7 text-xs"
              placeholder="Path to texture..."
            />
          </FieldRow>
          <FieldRow label="Effect Tex">
            <DebouncedInput
              type="text"
              value={component.effectTexturePath || ""}
              onChange={(val) => onUpdate({ effectTexturePath: String(val) })}
              className="h-7 text-xs"
              placeholder="Path to texture..."
            />
          </FieldRow>
          <div className="grid grid-cols-2 gap-2">
            <FieldRow label="Ef. Width">
              <DebouncedInput
                type="number"
                value={component.effectWidth || 0}
                onChange={(val) => onUpdate({ effectWidth: Number(val) })}
                className="h-7 text-xs"
              />
            </FieldRow>
            <FieldRow label="Ef. Height">
              <DebouncedInput
                type="number"
                value={component.effectHeight || 0}
                onChange={(val) => onUpdate({ effectHeight: Number(val) })}
                className="h-7 text-xs"
              />
            </FieldRow>
          </div>
          <FieldRow label="Ef. Offset">
            <DebouncedInput
              type="number"
              value={component.effectOffset || 0}
              onChange={(val) => onUpdate({ effectOffset: Number(val) })}
              className="h-7 text-xs"
            />
          </FieldRow>
        </CollapsibleSection>
      )}

      <CollapsibleSection title="Background">
        <FieldRow label="Color">
          <div className="flex gap-2">
            <DebouncedColorPicker
              value={component.background?.color || "#2a2a3a"}
              onChange={(val) =>
                onUpdate({
                  background: {
                    ...component.background,
                    color: val,
                  },
                })
              }
              className="h-7 w-10"
            />
            <DebouncedInput
              type="text"
              value={component.background?.color || "#2a2a3a"}
              onChange={(val) =>
                onUpdate({
                  background: {
                    ...component.background,
                    color: String(val),
                  },
                })
              }
              className="h-7 flex-1 font-mono text-xs"
            />
          </div>
        </FieldRow>

        <FieldRow label="Border">
          <DebouncedInput
            type="number"
            value={component.background?.border || ""}
            onChange={(val) =>
              onUpdate({
                background: {
                  ...component.background,
                  border: String(val),
                },
              })
            }
            className="h-7 cursor-text p-1 text-xs"
            placeholder="Radius (px)"
          />
        </FieldRow>

        <FieldRow label="Opacity">
          <div className="flex items-center gap-2">
            <Slider
              value={[component.background?.opacity ?? 1]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([value]) =>
                onUpdate({
                  background: {
                    ...component.background,
                    opacity: value,
                  },
                })
              }
              className="flex-1"
            />
            <span className="w-8 text-right text-xs text-muted-foreground">
              {((component.background?.opacity ?? 1) * 100).toFixed(0)}%
            </span>
          </div>
        </FieldRow>
      </CollapsibleSection>
    </div>
  );
}
