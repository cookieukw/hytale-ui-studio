import { Switch } from "@/components/ui/switch";
import { HytaleComponent } from "@/lib/hytale-types";
import { DebouncedInput } from "../debounced-input";
import { FieldRow } from "./field-row";

interface AnchorFieldsProps {
  component: HytaleComponent;
  onUpdate: (updates: Partial<HytaleComponent>) => void;
  disabled?: boolean;
}

export function AnchorFields({
  component,
  onUpdate,
  disabled,
}: AnchorFieldsProps) {
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
        <DebouncedInput
          type="text"
          value={anchor.width || ""}
          onChange={(val) => {
            const valStr = String(val);
            updateAnchor(
              "width",
              valStr.includes("%") ? valStr : Number(valStr) || undefined,
            );
          }}
          className="h-7 text-xs"
          placeholder="auto"
          disabled={disabled}
        />
      </FieldRow>
      <FieldRow label="Height">
        <DebouncedInput
          type="text"
          value={anchor.height || ""}
          onChange={(val) => {
            const valStr = String(val);
            updateAnchor(
              "height",
              valStr.includes("%") ? valStr : Number(valStr) || undefined,
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
