"use client";

import React from "react";
import { Layout, Palette, Settings, Code, FolderTree } from "lucide-react";
import { useEditorStore } from "@/lib/editor-store";
import { cn } from "@/lib/utils";
import type { MobileTab } from "@/lib/editor-store";

export function MobileNav() {
  const activeTab = useEditorStore((s) => s.activeMobileTab);
  const setActiveTab = useEditorStore((s) => s.setActiveMobileTab);

  const tabs: { value: MobileTab; label: string; icon: React.ReactNode }[] = [
    {
      value: "Palette",
      label: "Palette",
      icon: <Palette className="w-5 h-5" />,
    },
    { value: "Tree", label: "Tree", icon: <FolderTree className="w-5 h-5" /> },
    { value: "Canvas", label: "Canvas", icon: <Layout className="w-5 h-5" /> },
    {
      value: "Inspector",
      label: "Inspector",
      icon: <Settings className="w-5 h-5" />,
    },
    { value: "Code", label: "Code", icon: <Code className="w-5 h-5" /> },
  ];

  return (
    <div className="md:hidden flex h-14 bg-panel-header border-t border-border mt-auto shrink-0 z-50">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => setActiveTab(tab.value)}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px]",
            activeTab === tab.value
              ? "text-primary bg-primary/5"
              : "text-muted-foreground hover:bg-muted/50",
          )}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
