import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DebouncedColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  debounceTime?: number;
}

export function DebouncedColorPicker({
  value,
  onChange,
  className,
  debounceTime = 200,
}: DebouncedColorPickerProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedUpdate = useCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    [onChange],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        debouncedUpdate(localValue);
      }
    }, debounceTime);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, debounceTime, debouncedUpdate, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  return (
    <Input
      type="color"
      value={localValue}
      onChange={handleChange}
      className={cn("cursor-pointer p-1", className)}
    />
  );
}
