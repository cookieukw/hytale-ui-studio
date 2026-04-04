"use client";

import React, { useState } from "react";
import { Sidebar } from "./start/sidebar";
import { ProjectsTab } from "./start/projects-tab";
import { StartTab } from "./start/types";

export function StartScreen() {
  const [activeTab, setActiveTab] = useState<StartTab>("Projects");

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans select-none">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-background">
        {activeTab === "Projects" ? (
          <ProjectsTab />
        ) : (
          <div className="p-12 flex flex-col items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2 text-white">Coming Soon</h2>
              <p className="text-[#888888]">
                This section is currently under development.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
