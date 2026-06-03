"use client";

import React from "react";
import { History, Undo2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/lib/editor-store";
import { cn } from "@/lib/utils";

export function HistoryPopover() {
  const history = useEditorStore((state) => state.history);
  const historyIndex = useEditorStore((state) => state.historyIndex);
  const jumpToHistory = useEditorStore((state) => state.jumpToHistory);

  // We want to render the history from top to bottom (oldest to newest),
  // but Photoshop usually shows newest at the bottom.
  // Actually, newest at the bottom makes sense.

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="History (Visual Undo/Redo)"
        >
          <History className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <div className="flex flex-col h-full max-h-[400px]">
          <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-panel-header">
            <span className="text-xs font-semibold text-foreground flex items-center gap-2">
              <History className="h-3.5 w-3.5" />
              History
            </span>
            <span className="text-[10px] text-muted-foreground">{historyIndex + 1} / {history.length}</span>
          </div>
          <ScrollArea className="flex-1 p-1">
            <div className="flex flex-col">
              {history.map((entry, idx) => {
                const isActive = idx === historyIndex;
                const isFuture = idx > historyIndex;

                return (
                  <button
                    key={idx}
                    onClick={() => jumpToHistory(idx)}
                    className={cn(
                      "flex items-center justify-between w-full px-2 py-1.5 text-xs text-left rounded transition-colors group",
                      isActive
                        ? "bg-primary/20 text-primary font-medium"
                        : "hover:bg-hover text-foreground",
                      isFuture && "opacity-50 line-through decoration-muted-foreground/50",
                    )}
                  >
                    <span className="truncate pr-2">{entry.actionName || "State Change"}</span>
                    {isActive ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    ) : (
                      <Undo2 className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
