"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export function NavButton({ active, onClick, icon, label }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
        active
          ? "bg-primary text-white shadow-lg shadow-primary/20"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
