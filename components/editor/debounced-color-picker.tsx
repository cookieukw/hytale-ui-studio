import React, { useRef, useEffect, useCallback } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external value changes to the uncontrolled input if it's not currently focused/dragging
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  const debouncedUpdate = useCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    [onChange],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      debouncedUpdate(val);
    }, debounceTime);
  };

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Input
      ref={inputRef}
      type="color"
      defaultValue={value}
      onChange={handleChange}
      className={cn("cursor-pointer p-1", className)}
    />
  );
}
