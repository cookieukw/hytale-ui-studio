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
      <CollapsibleSection title="Interaction">
        <FieldRow label="HitTestVisible">
          <Switch
            checked={component.hitTestVisible ?? true}
            onCheckedChange={(checked) => onUpdate({ hitTestVisible: checked })}
          />
        </FieldRow>
        <FieldRow label="IsReadOnly">
          <Switch
            checked={component.isReadOnly ?? false}
            onCheckedChange={(checked) => onUpdate({ isReadOnly: checked })}
          />
        </FieldRow>
        <FieldRow label="TooltipText">
          <Input
            type="text"
            value={component.tooltipText || ""}
            onChange={(e) => onUpdate({ tooltipText: e.target.value })}
            className="h-7 text-xs"
            placeholder="Tooltip..."
          />
        </FieldRow>
      </CollapsibleSection>

      {component.type === "TextField" && (
        <CollapsibleSection title="Text Field Behavior">
          <FieldRow label="MaxLength">
            <Input
              type="number"
              value={component.maxLength ?? ""}
              onChange={(e) => onUpdate({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
              className="h-7 text-xs"
              placeholder="e.g. 20"
            />
          </FieldRow>
          <FieldRow label="PasswordChar">
            <Input
              type="text"
              maxLength={1}
              value={component.passwordChar || ""}
              onChange={(e) => onUpdate({ passwordChar: e.target.value })}
              className="h-7 font-mono text-xs text-center w-8"
              placeholder="*"
            />
          </FieldRow>
          <FieldRow label="AutoFocus">
            <Switch
              checked={component.autoFocus ?? false}
              onCheckedChange={(checked) => onUpdate({ autoFocus: checked })}
            />
          </FieldRow>
          <FieldRow label="AutoSelectAll">
            <Switch
              checked={component.autoSelectAll ?? false}
              onCheckedChange={(checked) => onUpdate({ autoSelectAll: checked })}
            />
          </FieldRow>
        </CollapsibleSection>
      )}

      <CollapsibleSection title="Events">
        <FieldRow label="ValueChanged">
          <Input
            type="text"
            value={component.valueChanged || ""}
            onChange={(e) => onUpdate({ valueChanged: e.target.value })}
            className="h-7 font-mono text-xs"
            placeholder="OnValueChanged"
          />
        </FieldRow>
        <FieldRow label="FocusGained">
          <Input
            type="text"
            value={component.focusGained || ""}
            onChange={(e) => onUpdate({ focusGained: e.target.value })}
            className="h-7 font-mono text-xs"
            placeholder="OnFocusGained"
          />
        </FieldRow>
        <FieldRow label="FocusLost">
          <Input
            type="text"
            value={component.focusLost || ""}
            onChange={(e) => onUpdate({ focusLost: e.target.value })}
            className="h-7 font-mono text-xs"
            placeholder="OnFocusLost"
          />
        </FieldRow>
        <FieldRow label="Validating">
          <Input
            type="text"
            value={component.validating || ""}
            onChange={(e) => onUpdate({ validating: e.target.value })}
            className="h-7 font-mono text-xs"
            placeholder="OnValidating"
          />
        </FieldRow>
        <FieldRow label="RightClicking">
          <Input
            type="text"
            value={component.rightClicking || ""}
            onChange={(e) => onUpdate({ rightClicking: e.target.value })}
            className="h-7 font-mono text-xs"
            placeholder="OnRightClicking"
          />
        </FieldRow>
      </CollapsibleSection>
    </div>
  );
}
