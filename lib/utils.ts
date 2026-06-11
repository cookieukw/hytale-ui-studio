import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hexToRgba(hex: string, alpha: number): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getUniqueFileName(existingNames: string[], baseName: string): string {
  let name = baseName.endsWith(".ui") ? baseName : `${baseName}.ui`;
  if (!existingNames.includes(name)) return name;

  const nameWithoutExt = name.slice(0, -3);
  let counter = 1;
  while (existingNames.includes(`${nameWithoutExt} (${counter}).ui`)) {
    counter++;
  }
  return `${nameWithoutExt} (${counter}).ui`;
}
