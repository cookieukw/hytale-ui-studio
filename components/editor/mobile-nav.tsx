"use client";

import React from "react";
import { Layout, FileCode, Layers } from "lucide-react";
import { useEditorStore } from "@/lib/editor-store";
import { cn } from "@/lib/utils";
import type { MobileTab } from "@/lib/editor-store";

export function MobileNav() {
  const activeTab = useEditorStore((s) => s.activeMobileTab);
  const setActiveTab = useEditorStore((s) => s.setActiveMobileTab);

  const tabs: { value: MobileTab; label: string; icon: React.ReactNode }[] = [
    { value: "View", label: "VIEW", icon: <Layout className="w-5 h-5" /> },
    { value: "Event", label: "EVENT", icon: <FileCode className="w-5 h-5" /> },
    {
      value: "Component",
      label: "COMPONENT",
      icon: <Layers className="w-5 h-5" />,
    },
  ];

  return (
    <div className="md:hidden flex h-14 bg-panel-header border-t border-border mt-auto shrink-0 z-50">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => setActiveTab(tab.value)}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] transition-colors relative",
            activeTab === tab.value
              ? "text-primary bg-primary/5"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          {tab.icon}
          <span className="font-semibold">{tab.label}</span>
          {activeTab === tab.value && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}
