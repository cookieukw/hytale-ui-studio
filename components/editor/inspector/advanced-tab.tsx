import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { HytaleComponent } from "@/lib/hytale-types";
import { CollapsibleSection } from "./collapsible-section";
import { FieldRow } from "./field-row";

interface AdvancedTabProps {
  component: HytaleComponent;
  onUpdate: (updates: Partial<HytaleComponent>) => void;
}

export function AdvancedTab({ component, onUpdate }: AdvancedTabProps) {
  return (
    <div className="space-y-2">
      <CollapsibleSection title="Identity">
        <FieldRow label="ID">
          <Input
            type="text"
            value={component.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
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
            onCheckedChange={(checked) => onUpdate({ isVisible: checked })}
          />
        </FieldRow>
        <FieldRow label="Locked">
          <Switch
            checked={component.isLocked ?? false}
            onCheckedChange={(checked) => onUpdate({ isLocked: checked })}
          />
        </FieldRow>
      </CollapsibleSection>
    </div>
  );
}
