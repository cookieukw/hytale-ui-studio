import React from "react";
import { Label } from "@/components/ui/label";

interface FieldRowProps {
  label: string;
  children: React.ReactNode;
}

export function FieldRow({ label, children }: FieldRowProps) {
  return (
    <div className="flex items-center gap-2">
      <Label className="w-20 shrink-0 text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="flex-1">{children}</div>
    </div>
  );
}
