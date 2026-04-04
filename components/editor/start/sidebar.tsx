"use client";

import { FolderOpen, Settings, Plus, HelpCircle, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavButton } from "./nav-button";
import { StartTab } from "./types";

interface SidebarProps {
  activeTab: StartTab;
  setActiveTab: (tab: StartTab) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="w-[240px] flex flex-col border-r border-border bg-sidebar">
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <img src="/hytale-studio_foreground.png" alt="Logo" className="h-8 w-8" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-tight uppercase">UI Studio</span>
            <span className="text-[10px] text-muted-foreground font-medium">Version 2.0 Beta</span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 flex flex-col gap-1">
        <NavButton
          active={activeTab === "Projects"}
          onClick={() => setActiveTab("Projects")}
          icon={<FolderOpen className="h-4 w-4" />}
          label="Projects"
        />
        <NavButton
          active={activeTab === "Customize"}
          onClick={() => setActiveTab("Customize")}
          icon={<Settings className="h-4 w-4" />}
          label="Customize"
        />
        <NavButton
          active={activeTab === "Plugins"}
          onClick={() => setActiveTab("Plugins")}
          icon={<Plus className="h-4 w-4" />}
          label="Plugins"
        />
        <NavButton
          active={activeTab === "Learn"}
          onClick={() => setActiveTab("Learn")}
          icon={<HelpCircle className="h-4 w-4" />}
          label="Learn Studio"
        />
      </div>

      <div className="p-4 mt-auto">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-[11px] text-muted-foreground hover:text-white"
          asChild
        >
          <a href="https://github.com/cookieukw/hytale-ui-studio" target="_blank">
            <Github className="h-3.5 w-3.5 mr-2" />
            GitHub Repository
          </a>
        </Button>
      </div>
    </div>
  );
}
