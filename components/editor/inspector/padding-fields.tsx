import { Label } from "@/components/ui/label";
import { HytaleComponent } from "@/lib/hytale-types";
import { DebouncedInput } from "../debounced-input";

interface PaddingFieldsProps {
  component: HytaleComponent;
  onUpdate: (updates: Partial<HytaleComponent>) => void;
}

export function PaddingFields({ component, onUpdate }: PaddingFieldsProps) {
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
        <DebouncedInput
          type="number"
          value={padding.top || ""}
          onChange={(val) => updatePadding("top", Number(val) || undefined)}
          className="h-7 text-xs"
          placeholder="0"
        />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground">Bottom</Label>
        <DebouncedInput
          type="number"
          value={padding.bottom || ""}
          onChange={(val) => updatePadding("bottom", Number(val) || undefined)}
          className="h-7 text-xs"
          placeholder="0"
        />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground">Left</Label>
        <DebouncedInput
          type="number"
          value={padding.left || ""}
          onChange={(val) => updatePadding("left", Number(val) || undefined)}
          className="h-7 text-xs"
          placeholder="0"
        />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground">Right</Label>
        <DebouncedInput
          type="number"
          value={padding.right || ""}
          onChange={(val) => updatePadding("right", Number(val) || undefined)}
          className="h-7 text-xs"
          placeholder="0"
        />
      </div>
    </div>
  );
}
