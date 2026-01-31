import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DebouncedInputProps extends Omit<
  React.ComponentProps<"input">,
  "onChange" | "value"
> {
  value: string | number;
  onChange: (value: string | number) => void;
  debounceTime?: number;
}

export function DebouncedInput({
  value,
  onChange,
  className,
  debounceTime = 300,
  type,
  ...props
}: DebouncedInputProps) {
  const [localValue, setLocalValue] = useState<string | number>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedUpdate = useCallback(
    (newValue: string | number) => {
      onChange(newValue);
    },
    [onChange],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        // If type is number, ensure we pass a number if possible, or string if empty/invalid
        if (type === "number") {
          // If empty string, pass generic empty handling - usually undefined or 0 depending on parent.
          // But here we just pass what we have. The parent acts on the value.
          // Parent expects string | number usually from these events if we are generic.
          // However, let's keep it simple: pass the value as is (string from input usually)
          // But wait, the standard Input onChange gives an event.
          // Here we give the value directly.
          // Let's coerce to number if type is number and it's a valid number string
          if (
            typeof localValue === "string" &&
            localValue !== "" &&
            !isNaN(Number(localValue))
          ) {
            debouncedUpdate(Number(localValue));
          } else {
            debouncedUpdate(localValue);
          }
        } else {
          debouncedUpdate(localValue);
        }
      }
    }, debounceTime);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, debounceTime, debouncedUpdate, value, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  return (
    <Input
      type={type}
      value={localValue}
      onChange={handleChange}
      className={cn(className)}
      {...props}
    />
  );
}
