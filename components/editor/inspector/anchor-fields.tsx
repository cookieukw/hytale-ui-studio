import { Switch } from "@/components/ui/switch";
import { HytaleComponent } from "@/lib/hytale-types";
import { DebouncedInput } from "../debounced-input";
import { FieldRow } from "./field-row";

interface AnchorFieldsProps {
  component: HytaleComponent;
  onUpdate: (updates: Partial<HytaleComponent>) => void;
  disabled?: boolean;
  parentLayoutMode?: string | null;
}

export function AnchorFields({
  component,
  onUpdate,
  disabled,
  parentLayoutMode,
}: AnchorFieldsProps) {
  const anchor = component.anchor || {};
  const isStackLayout = parentLayoutMode && parentLayoutMode !== "Full";

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

      <div className="my-2 border-t border-border/40" />

      <FieldRow label="Left">
        <DebouncedInput
          type="text"
          value={anchor.left !== undefined ? anchor.left : ""}
          onChange={(val) => {
            const valStr = String(val);
            updateAnchor("left", valStr === "" ? undefined : Number(valStr) || 0);
          }}
          className="h-7 text-xs"
          placeholder="unset"
          disabled={!!disabled}
        />
      </FieldRow>
      <FieldRow label="Right">
        <DebouncedInput
          type="text"
          value={anchor.right !== undefined ? anchor.right : ""}
          onChange={(val) => {
            const valStr = String(val);
            updateAnchor("right", valStr === "" ? undefined : Number(valStr) || 0);
          }}
          className="h-7 text-xs"
          placeholder="unset"
          disabled={!!disabled}
        />
      </FieldRow>
      <FieldRow label="Top">
        <DebouncedInput
          type="text"
          value={anchor.top !== undefined ? anchor.top : ""}
          onChange={(val) => {
            const valStr = String(val);
            updateAnchor("top", valStr === "" ? undefined : Number(valStr) || 0);
          }}
          className="h-7 text-xs"
          placeholder="unset"
          disabled={!!disabled}
        />
      </FieldRow>
      <FieldRow label="Bottom">
        <DebouncedInput
          type="text"
          value={anchor.bottom !== undefined ? anchor.bottom : ""}
          onChange={(val) => {
            const valStr = String(val);
            updateAnchor("bottom", valStr === "" ? undefined : Number(valStr) || 0);
          }}
          className="h-7 text-xs"
          placeholder="unset"
          disabled={!!disabled}
        />
      </FieldRow>

      {isStackLayout && (
        <div className="mt-2 rounded bg-blue-500/10 p-2 text-[10px] text-blue-500 border border-blue-500/20 leading-normal">
          ℹ️ <strong>Margin Behavior:</strong> In <strong>{parentLayoutMode}</strong> mode, Top/Bottom/Left/Right values act as layout margins/gaps instead of absolute positions.
        </div>
      )}

      {disabled && (
        <div className="mt-2 text-[10px] text-muted-foreground/70 text-center">
          Root element always fills the screen.
        </div>
      )}
    </>
  );
}
