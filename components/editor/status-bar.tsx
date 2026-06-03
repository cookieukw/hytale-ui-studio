"use client";

import { useEditorStore } from "@/lib/editor-store";
import { isTauri } from "@/lib/tauri-utils";
import { CheckCircle2, Clock, MonitorSmartphone, Wifi } from "lucide-react";
import { useEffect, useState } from "react";

export function StatusBar() {
  const currentProjectId = useEditorStore((state) => state.currentProjectId);
  const projects = useEditorStore((state) => state.projects);
  const activeProject = projects.find((p) => p.id === currentProjectId);

  const [timeAgo, setTimeAgo] = useState("Just now");

  useEffect(() => {
    if (!activeProject) return;

    const updateTimer = () => {
      const diff = Date.now() - activeProject.lastModified;
      if (diff < 60000) {
        setTimeAgo("Just now");
      } else if (diff < 3600000) {
        setTimeAgo(`${Math.floor(diff / 60000)}m ago`);
      } else {
        setTimeAgo(`${Math.floor(diff / 3600000)}h ago`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [activeProject?.lastModified]);

  if (!activeProject) return null;

  return (
    <div className="h-7 border-t border-border bg-panel flex items-center justify-between px-3 text-[11px] text-muted-foreground select-none shrink-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-default transition-colors">
          <CheckCircle2 className="h-3 w-3 text-success" />
          <span>Saved</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-default transition-colors">
          <Clock className="h-3 w-3" />
          <span>{timeAgo}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-default transition-colors" title="Platform">
          {isTauri() ? (
            <>
              <MonitorSmartphone className="h-3 w-3" />
              <span>Desktop App</span>
            </>
          ) : (
            <>
              <Wifi className="h-3 w-3" />
              <span>Web Version</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-default transition-colors" title="Current File">
          <span className="font-mono">{activeProject.files.find(f => f.id === activeProject.activeFileId)?.name || "N/A"}</span>
        </div>
      </div>
    </div>
  );
}
