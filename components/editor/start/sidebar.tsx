"use client";

import { useState } from "react";
import { FolderOpen, Settings, Plus, HelpCircle, LayoutTemplate, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavButton } from "./nav-button";
import { StartTab } from "./types";
import { ChangelogModal } from "../changelog-modal";
import packageJson from "@/package.json";

interface SidebarProps {
  activeTab: StartTab;
  setActiveTab: (tab: StartTab) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  return (
    <div className="w-[200px] shrink-0 flex flex-col border-r border-border bg-sidebar py-4 px-2">
      {/* Header / Brand */}
      <div className="px-3 mb-6 flex items-center gap-3">
        <div className="h-8 w-8 bg-[#3574F0] rounded-md flex items-center justify-center shrink-0">
          <img src="/hytale-studio_foreground.png" alt="Logo" className="h-6 w-6" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-[#BCBEC4] leading-tight truncate">
            Hytale UI Studio
          </span>
          <span
            onClick={() => setIsChangelogOpen(true)}
            className="text-[10px] text-[#868A91] hover:text-[#3574F0] cursor-pointer mt-0.5"
          >
            v{packageJson.version}
          </span>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 flex flex-col gap-0.5">
        <NavButton
          active={activeTab === "Projects"}
          onClick={() => setActiveTab("Projects")}
          icon={<FolderOpen className="h-4 w-4" />}
          label="Projects"
        />
        <NavButton
          active={activeTab === "Templates"}
          onClick={() => setActiveTab("Templates")}
          icon={<LayoutTemplate className="h-4 w-4" />}
          label="Templates"
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
          label="Learn"
        />
      </div>

      {/* Footer link */}
      <div className="px-1 pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-[11px] text-[#868A91] hover:text-[#BCBEC4] hover:bg-[#2B2D30] px-2 h-7"
          asChild
        >
          <a href="https://github.com/cookieukw/hytale-ui-studio" target="_blank" rel="noreferrer">
            <Github className="h-3.5 w-3.5 mr-2" />
            GitHub
          </a>
        </Button>
      </div>

      <ChangelogModal open={isChangelogOpen} onOpenChange={setIsChangelogOpen} />
    </div>
  );
}
