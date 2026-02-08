import { Label } from "@/components/ui/label";
import { HytaleComponent } from "@/lib/hytale-types";
import { DebouncedInput } from "../debounced-input";

interface MarginFieldsProps {
  component: HytaleComponent;
  onUpdate: (updates: Partial<HytaleComponent>) => void;
}

export function MarginFields({ component, onUpdate }: MarginFieldsProps) {
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
        <DebouncedInput
          type="number"
          value={margin.top || ""}
          onChange={(val) => updateMargin("top", Number(val) || undefined)}
          className="h-7 text-xs"
          placeholder="0"
        />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground">Bottom</Label>
        <DebouncedInput
          type="number"
          value={margin.bottom || ""}
          onChange={(val) => updateMargin("bottom", Number(val) || undefined)}
          className="h-7 text-xs"
          placeholder="0"
        />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground">Left</Label>
        <DebouncedInput
          type="number"
          value={margin.left || ""}
          onChange={(val) => updateMargin("left", Number(val) || undefined)}
          className="h-7 text-xs"
          placeholder="0"
        />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground">Right</Label>
        <DebouncedInput
          type="number"
          value={margin.right || ""}
          onChange={(val) => updateMargin("right", Number(val) || undefined)}
          className="h-7 text-xs"
          placeholder="0"
        />
      </div>
    </div>
  );
}
