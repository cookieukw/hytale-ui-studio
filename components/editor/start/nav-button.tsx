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
        "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors w-full text-left",
        active
          ? "bg-[#2E436E]/60 text-[#FFFFFF] font-semibold"
          : "text-[#BCBEC4] hover:bg-[#2B2D30] hover:text-[#FFFFFF]"
      )}
    >
      <span className={active ? "text-[#3574F0]" : "text-[#868A91]"}>{icon}</span>
      {label}
    </button>
  );
}
