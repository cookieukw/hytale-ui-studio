"use client";

import React from "react";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Square,
  Palette,
  MousePointer,
  Settings2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useEditorStore } from "@/lib/editor-store";
import type {
  HytaleComponent,
  LayoutMode,
  TextAlignment,
  Direction,
} from "@/lib/hytale-types";
import { cn } from "@/lib/utils";
import {
  COMMON_UI_KEYS,
  COMMON_UI_DEFINITIONS,
} from "@/lib/common-definitions";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-muted-foreground hover:bg-hover"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {title}
      </button>
      {isOpen && <div className="space-y-3 px-3 pb-3">{children}</div>}
    </div>
  );
}

interface FieldRowProps {
  label: string;
  children: React.ReactNode;
}

function FieldRow({ label, children }: FieldRowProps) {
  return (
    <div className="flex items-center gap-2">
      <Label className="w-20 shrink-0 text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

interface AnchorFieldsProps {
  component: HytaleComponent;
  onUpdate: (updates: Partial<HytaleComponent>) => void;
  disabled?: boolean;
}

function AnchorFields({ component, onUpdate, disabled }: AnchorFieldsProps) {
  const anchor = component.anchor || {};

  const updateAnchor = (
    key: string,
    value: number | string | boolean | undefined,
  ) => {
    onUpdate({
      anchor: {
        ...anchor,
        [key]: value,
      },
    });
  };

  return (
    <>
      <FieldRow label="Width">
        <Input
          type="text"
          value={anchor.width || ""}
          onChange={(e) => {
            const val = e.target.value;
            updateAnchor(
              "width",
              val.includes("%") ? val : Number(val) || undefined,
            );
          }}
          className="h-7 text-xs"
          placeholder="auto"
          disabled={disabled}
        />
      </FieldRow>
      <FieldRow label="Height">
        <Input
          type="text"
          value={anchor.height || ""}
          onChange={(e) => {
            const val = e.target.value;
            updateAnchor(
              "height",
              val.includes("%") ? val : Number(val) || undefined,
            );
          }}
          className="h-7 text-xs"
          placeholder="auto"
          disabled={disabled}
        />
      </FieldRow>
      <FieldRow label="Full">
        <Switch
          checked={anchor.full || false}
          onCheckedChange={(checked) =>
            updateAnchor("full", checked || undefined)
          }
          disabled={disabled}
        />
      </FieldRow>
      {disabled && (
        <div className="mt-2 text-[10px] text-muted-foreground/70 text-center">
          Root element always fills the screen.
        </div>
      )}
    </>
  );
}

interface PaddingFieldsProps {
  component: HytaleComponent;
  onUpdate: (updates: Partial<HytaleComponent>) => void;
}

function PaddingFields({ component, onUpdate }: PaddingFieldsProps) {
  const padding = component.padding || {};

  const updatePadding = (key: string, value: number | undefined) => {
    onUpdate({
      padding: {
        ...padding,
        [key]: value,
      },
    });
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <Label className="text-[10px] text-muted-foreground">Top</Label>
        <Input
          type="number"
          value={padding.top || ""}
          onChange={(e) =>
            updatePadding("top", Number(e.target.value) || undefined)
          }
          className="h-7 text-xs"
          placeholder="0"
        />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground">Bottom</Label>
        <Input
          type="number"
          value={padding.bottom || ""}
          onChange={(e) =>
            updatePadding("bottom", Number(e.target.value) || undefined)
          }
          className="h-7 text-xs"
          placeholder="0"
        />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground">Left</Label>
        <Input
          type="number"
          value={padding.left || ""}
          onChange={(e) =>
            updatePadding("left", Number(e.target.value) || undefined)
          }
          className="h-7 text-xs"
          placeholder="0"
        />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground">Right</Label>
        <Input
          type="number"
          value={padding.right || ""}
          onChange={(e) =>
            updatePadding("right", Number(e.target.value) || undefined)
          }
          className="h-7 text-xs"
          placeholder="0"
        />
      </div>
    </div>
  );
}

interface MarginFieldsProps {
  component: HytaleComponent;
  onUpdate: (updates: Partial<HytaleComponent>) => void;
}

function MarginFields({ component, onUpdate }: MarginFieldsProps) {
  const margin = component.margin || {};

  const updateMargin = (key: string, value: number | undefined) => {
    onUpdate({
      margin: {
        ...margin,
        [key]: value,
      },
    });
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <Label className="text-[10px] text-muted-foreground">Top</Label>
        <Input
          type="number"
          value={margin.top || ""}
          onChange={(e) =>
            updateMargin("top", Number(e.target.value) || undefined)
          }
          className="h-7 text-xs"
          placeholder="0"
        />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground">Bottom</Label>
        <Input
          type="number"
          value={margin.bottom || ""}
          onChange={(e) =>
            updateMargin("bottom", Number(e.target.value) || undefined)
          }
          className="h-7 text-xs"
          placeholder="0"
        />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground">Left</Label>
        <Input
          type="number"
          value={margin.left || ""}
          onChange={(e) =>
            updateMargin("left", Number(e.target.value) || undefined)
          }
          className="h-7 text-xs"
          placeholder="0"
        />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground">Right</Label>
        <Input
          type="number"
          value={margin.right || ""}
          onChange={(e) =>
            updateMargin("right", Number(e.target.value) || undefined)
          }
          className="h-7 text-xs"
          placeholder="0"
        />
      </div>
    </div>
  );
}

import { DebouncedColorPicker } from "./debounced-color-picker";

export function Inspector() {
  const selectedId = useEditorStore((state) => state.selectedId);
  const components = useEditorStore((state) => state.components);
  const updateComponent = useEditorStore((state) => state.updateComponent);

  // Find component by ID
  const findById = (
    comps: HytaleComponent[],
    id: string,
  ): HytaleComponent | null => {
    for (const c of comps) {
      if (c.id === id) return c;
      if (c.children) {
        const found = findById(c.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const component = selectedId ? findById(components, selectedId) : null;

  if (!component) {
    return (
      <div className="flex h-full flex-col border-l border-border bg-panel">
        <div className="border-b border-border px-3 py-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Inspector
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <MousePointer className="mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">
            Select a component to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<HytaleComponent>) => {
    updateComponent(component.id, updates);
  };

  const layoutModes: LayoutMode[] = [
    "Top",
    "Bottom",
    "Left",
    "Right",
    "Middle",
    "Center",
    "Full",
    "TopScrolling",
    "CenterMiddle",
    "MiddleCenter",
    "LeftCenterWrap",
  ];
  const directions: Direction[] = ["Vertical", "Horizontal"];
  const alignments: TextAlignment[] = ["Left", "Center", "Right"];

  const hasTextStyle = [
    "Label",
    "Button",
    "TextButton",
    "TextField",
    "TimerLabel",
    "Dropdown",
    "CheckBox",
    "ProgressBar",
    "Slider",
  ].includes(component.type);
  const hasPlaceholder = ["TextField", "NumberField"].includes(component.type);
  const hasValue = ["ProgressBar", "NumberField", "Slider"].includes(
    component.type,
  );
  const hasStates = [
    "Button",
    "TextButton",
    "TextField",
    "ProgressBar",
  ].includes(component.type);
  const hasText = ["Label", "TextButton", "Dropdown"].includes(component.type);
  const hasChecked = ["CheckBox"].includes(component.type);
  const hasOptions = ["Dropdown"].includes(component.type);

  // Check if component is a root component (top-level)
  const isRoot = components.some((c) => c.id === component.id);

  return (
    <div className="flex h-full flex-col border-l border-border bg-panel">
      {/* Header */}
      <div className="border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Square className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {component.type}
          </span>
          {isRoot && (
            <span className="ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
              ROOT
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="layout"
        className="flex flex-1 flex-col overflow-hidden"
      >
        <TabsList className="mx-2 mt-2 grid h-8 grid-cols-4 bg-secondary">
          <TabsTrigger value="layout" className="h-6 text-xs">
            <Square className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="style" className="h-6 text-xs">
            <Palette className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger
            value="states"
            className="h-6 text-xs"
            disabled={!hasStates}
          >
            <MousePointer className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="advanced" className="h-6 text-xs">
            <Settings2 className="h-3 w-3" />
          </TabsTrigger>
        </TabsList>

        <div className="px-3 py-2 border-b border-border bg-secondary/20">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-16">
              Inherits:
            </span>
            <Select
              value={component.inheritance || "None"}
              onValueChange={(val) => {
                if (val === "None") {
                  handleUpdate({ inheritance: undefined });
                } else {
                  // Apply inheritance and props
                  const def = COMMON_UI_DEFINITIONS[val];
                  handleUpdate({
                    inheritance: val,
                    ...def, // Merge properties
                  });
                }
              }}
            >
              <SelectTrigger className="h-6 text-xs flex-1">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                {COMMON_UI_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {/* Layout Tab */}
          <TabsContent value="layout" className="m-0 mt-2">
            <CollapsibleSection title="Anchor">
              <AnchorFields
                component={component}
                onUpdate={handleUpdate}
                disabled={isRoot}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Padding">
              <PaddingFields component={component} onUpdate={handleUpdate} />
            </CollapsibleSection>

            <CollapsibleSection title="Margin">
              <MarginFields component={component} onUpdate={handleUpdate} />
            </CollapsibleSection>

            <CollapsibleSection title="Layout">
              <FieldRow label="Mode">
                <Select
                  value={component.layoutMode || "None"}
                  onValueChange={(value) =>
                    handleUpdate({
                      layoutMode:
                        value === "None" ? undefined : (value as LayoutMode),
                    })
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    {layoutModes.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>

              <FieldRow label="Direction">
                <Select
                  value={component.direction || "Vertical"}
                  onValueChange={(value) =>
                    handleUpdate({ direction: value as Direction })
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

              <FieldRow label="FlexWeight">
                <Input
                  type="number"
                  value={component.flexWeight || ""}
                  onChange={(e) =>
                    handleUpdate({
                      flexWeight: Number(e.target.value) || undefined,
                    })
                  }
                  className="h-7 text-xs"
                  placeholder="0"
                />
              </FieldRow>
            </CollapsibleSection>
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="m-0 mt-2">
            {hasText && (
              <CollapsibleSection title="Text">
                <FieldRow label="Content">
                  <Input
                    type="text"
                    value={component.text || ""}
                    onChange={(e) => handleUpdate({ text: e.target.value })}
                    className="h-7 text-xs"
                    placeholder="Enter text..."
                  />
                </FieldRow>
              </CollapsibleSection>
            )}

            {hasPlaceholder && (
              <CollapsibleSection title="Placeholder">
                <FieldRow label="Text">
                  <Input
                    type="text"
                    value={component.placeholderText || ""}
                    onChange={(e) =>
                      handleUpdate({ placeholderText: e.target.value })
                    }
                    className="h-7 text-xs"
                    placeholder="Enter placeholder..."
                  />
                </FieldRow>
              </CollapsibleSection>
            )}

            {hasValue && (
              <CollapsibleSection title="Value">
                <FieldRow label="Value">
                  <Input
                    type="number"
                    value={component.value ?? 0}
                    onChange={(e) =>
                      handleUpdate({ value: Number(e.target.value) })
                    }
                    className="h-7 text-xs"
                  />
                </FieldRow>
                {component.type === "ProgressBar" && (
                  <>
                    <FieldRow label="Max">
                      <Input
                        type="number"
                        value={component.max ?? 100}
                        onChange={(e) =>
                          handleUpdate({ max: Number(e.target.value) })
                        }
                        className="h-7 text-xs"
                      />
                    </FieldRow>
                    <FieldRow label="Show Label">
                      <Switch
                        checked={component.showLabel ?? true}
                        onCheckedChange={(checked) =>
                          handleUpdate({ showLabel: checked })
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
                  <Input
                    type="number"
                    value={component.seconds ?? 0}
                    onChange={(e) =>
                      handleUpdate({ seconds: Number(e.target.value) })
                    }
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
                    onCheckedChange={(checked) => handleUpdate({ checked })}
                  />
                </FieldRow>
              </CollapsibleSection>
            )}

            {component.type === "Slider" && (
              <CollapsibleSection title="Range">
                <FieldRow label="Min">
                  <Input
                    type="number"
                    value={component.min ?? 0}
                    onChange={(e) =>
                      handleUpdate({ min: Number(e.target.value) })
                    }
                    className="h-7 text-xs"
                  />
                </FieldRow>
                <FieldRow label="Max">
                  <Input
                    type="number"
                    value={component.max ?? 100}
                    onChange={(e) =>
                      handleUpdate({ max: Number(e.target.value) })
                    }
                    className="h-7 text-xs"
                  />
                </FieldRow>
                <FieldRow label="Step">
                  <Input
                    type="number"
                    value={component.step ?? 1}
                    onChange={(e) =>
                      handleUpdate({ step: Number(e.target.value) })
                    }
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
                  <Input
                    type="text"
                    value={component.options?.join(", ") || ""}
                    onChange={(e) =>
                      handleUpdate({
                        options: e.target.value.split(",").map((s) => s.trim()),
                      })
                    }
                    className="h-7 text-xs"
                  />
                </div>
              </CollapsibleSection>
            )}

            {hasTextStyle && (
              <CollapsibleSection title="Typography">
                <FieldRow label="Font Size">
                  <Input
                    type="number"
                    value={component.textStyle?.fontSize || 14}
                    onChange={(e) =>
                      handleUpdate({
                        textStyle: {
                          ...component.textStyle,
                          fontSize: Number(e.target.value),
                        },
                      })
                    }
                    className="h-7 text-xs"
                  />
                </FieldRow>

                <FieldRow label="Color">
                  <div className="flex gap-2">
                    <DebouncedColorPicker
                      value={component.textStyle?.textColor || "#ffffff"}
                      onChange={(val) =>
                        handleUpdate({
                          textStyle: {
                            ...component.textStyle,
                            textColor: val,
                          },
                        })
                      }
                      className="h-7 w-10"
                    />
                    <Input
                      type="text"
                      value={component.textStyle?.textColor || "#ffffff"}
                      onChange={(e) =>
                        handleUpdate({
                          textStyle: {
                            ...component.textStyle,
                            textColor: e.target.value,
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
                        value={
                          component.textStyle?.horizontalAlignment || "Start"
                        }
                        onValueChange={(value) =>
                          handleUpdate({
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
                        value={
                          component.textStyle?.verticalAlignment || "Start"
                        }
                        onValueChange={(value) =>
                          handleUpdate({
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
                        handleUpdate({
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
                      handleUpdate({
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
                      handleUpdate({
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

            <CollapsibleSection title="Background">
              <FieldRow label="Color">
                <div className="flex gap-2">
                  <DebouncedColorPicker
                    value={component.background?.color || "#2a2a3a"}
                    onChange={(val) =>
                      handleUpdate({
                        background: {
                          ...component.background,
                          color: val,
                        },
                      })
                    }
                    className="h-7 w-10"
                  />
                  <Input
                    type="text"
                    value={component.background?.color || "#2a2a3a"}
                    onChange={(e) =>
                      handleUpdate({
                        background: {
                          ...component.background,
                          color: e.target.value,
                        },
                      })
                    }
                    className="h-7 flex-1 font-mono text-xs"
                  />
                </div>
              </FieldRow>

              <FieldRow label="Border">
                <Input
                  type="number"
                  value={component.background?.border || ""}
                  onChange={(e) =>
                    handleUpdate({
                      background: {
                        ...component.background,
                        border: e.target.value,
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
                      handleUpdate({
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
          </TabsContent>

          {/* States Tab */}
          <TabsContent value="states" className="m-0 mt-2">
            {hasStates && (
              <>
                <CollapsibleSection title="Hovered">
                  <FieldRow label="BG Color">
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={
                          component.states?.hovered?.background?.color ||
                          "#5aafff"
                        }
                        onChange={(e) =>
                          handleUpdate({
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
                        value={
                          component.states?.hovered?.background?.color || ""
                        }
                        onChange={(e) =>
                          handleUpdate({
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
                        value={
                          component.states?.pressed?.background?.color ||
                          "#3a8eef"
                        }
                        onChange={(e) =>
                          handleUpdate({
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
                        value={
                          component.states?.pressed?.background?.color || ""
                        }
                        onChange={(e) =>
                          handleUpdate({
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
                        value={[
                          component.states?.disabled?.background?.opacity ??
                            0.5,
                        ]}
                        min={0}
                        max={1}
                        step={0.1}
                        onValueChange={([value]) =>
                          handleUpdate({
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
                          (component.states?.disabled?.background?.opacity ??
                            0.5) * 100
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                  </FieldRow>
                </CollapsibleSection>
              </>
            )}
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="m-0 mt-2">
            <CollapsibleSection title="Identity">
              <FieldRow label="ID">
                <Input
                  type="text"
                  value={component.name}
                  onChange={(e) => handleUpdate({ name: e.target.value })}
                  className="h-7 font-mono text-xs"
                />
              </FieldRow>
              <FieldRow label="Type">
                <Input
                  type="text"
                  value={component.type}
                  disabled
                  className="h-7 text-xs opacity-50"
                />
              </FieldRow>
            </CollapsibleSection>

            <CollapsibleSection title="Visibility">
              <FieldRow label="Visible">
                <Switch
                  checked={component.isVisible ?? true}
                  onCheckedChange={(checked) =>
                    handleUpdate({ isVisible: checked })
                  }
                />
              </FieldRow>
              <FieldRow label="Locked">
                <Switch
                  checked={component.isLocked ?? false}
                  onCheckedChange={(checked) =>
                    handleUpdate({ isLocked: checked })
                  }
                />
              </FieldRow>
            </CollapsibleSection>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
