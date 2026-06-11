"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/lib/editor-store";
import { useSettings } from "./hooks/use-settings";
import { cn } from "@/lib/utils";

export function CodeEditor() {
  const settings = useSettings();
  const code = useEditorStore((state) => state.code);
  const components = useEditorStore((state) => state.components);
  const selectedId = useEditorStore((state) => state.selectedId);
  const [copied, setCopied] = useState(false);

  const scrollAreaRef = useMemo(() => {
    // We can't easily ref the ScrollArea internals without hacking,
    // but we can try to ref the container div we render lines in.
    return { current: null as HTMLDivElement | null };
  }, []);

  // Helper to find range
  const highlightRange = useMemo(() => {
    if (!selectedId || !code) return null;

    // Generate a flat list of "Headers" in pre-order, matching the code generation order
    const flatHeaders: { id: string; header: string }[] = [];
    const traverse = (list: any[]) => {
      for (const comp of list) {
        const idPart =
          comp.name && comp.name !== comp.type ? ` #${comp.name}` : "";
        const header = `${comp.type}${idPart} {`;
        flatHeaders.push({ id: comp.id, header });
        if (comp.children) traverse(comp.children);
      }
    };
    traverse(components);

    // Find our index
    const myIndex = flatHeaders.findIndex((h) => h.id === selectedId);
    if (myIndex === -1) return null;

    const myHeader = flatHeaders[myIndex].header; // e.g. "Label {"

    // Count how many times this specific header appeared before us
    let occurrenceIndex = 0;
    for (let i = 0; i < myIndex; i++) {
      if (flatHeaders[i].header === myHeader) occurrenceIndex++;
    }

    // Now scan lines to find the Nth occurrence of this header
    const lines = code.split("\n");
    let currentOccurrence = 0;
    let startLine = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === myHeader) {
        if (currentOccurrence === occurrenceIndex) {
          startLine = i;
          break;
        }
        currentOccurrence++;
      }
    }

    if (startLine === -1) return null;

    // Find end line by brace balancing
    let endLine = startLine;
    let balance = 1; // We started with open brace from header
    for (let i = startLine + 1; i < lines.length; i++) {
      const line = lines[i];
      // Simple counting - purely string based for now
      // Assuming well-formatted code from generator
      // Count { and }
      const open = (line.match(/{/g) || []).length;
      const close = (line.match(/}/g) || []).length;
      balance += open - close;

      if (balance <= 0) {
        endLine = i;
        break;
      }
    }

    return { start: startLine, end: endLine };
  }, [code, components, selectedId]);

  // Scroll into view logic
  useEffect(() => {
    if (highlightRange && scrollAreaRef.current) {
      // Find line element
      const lineEl = scrollAreaRef.current.children[
        highlightRange.start
      ] as HTMLElement;
      if (lineEl) {
        lineEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightRange]);

  const handleCopy = useCallback(async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const lines = useMemo(() => code.split("\n"), [code]);

  return (
    <div className="flex h-full min-h-0 flex-col select-none border-t border-border bg-panel">
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-panel px-3 py-2">
        <span className="text-xs font-semibold text-foreground">Code</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleCopy}
          disabled={!code}
        >
          {copied ? (
            <Check className="h-3 w-3 text-accent" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>

      <div className="flex flex-1 min-h-0 relative">
        <ScrollArea className="flex-1 bg-[#1e1e1e]">
          <div
            ref={(el) => {
              scrollAreaRef.current = el;
            }}
            className="min-h-full p-0 font-mono leading-5 pb-8"
            style={{ fontSize: `${settings.editorFontSize}px` }}
          >
            {lines.map((line, index) => {
              const isHighlighted =
                highlightRange &&
                index >= highlightRange.start &&
                index <= highlightRange.end;
              return (
                <div
                  key={index}
                  className={cn(
                    "px-4 hover:bg-white/5 select-text",
                    settings.editorWordWrap ? "whitespace-pre-wrap break-all" : "whitespace-pre",
                    isHighlighted ? "bg-primary/20" : "text-muted-foreground",
                  )}
                >
                  <span className="inline-block w-6 text-right mr-4 text-muted-foreground/30 select-none">
                    {index + 1}
                  </span>
                  <span className={isHighlighted ? "text-foreground" : ""}>
                    {line}
                  </span>
                </div>
              );
            })}
            {!code && (
              <div className="p-4 text-muted-foreground">No components yet</div>
            )}
          </div>
        </ScrollArea>
        
        {settings.editorMinimap && code && (
          <div className="w-12 shrink-0 bg-[#1a1a1a] border-l border-white/5 overflow-hidden p-1 opacity-50 select-none">
            <div className="font-mono text-[2px] leading-[3px] text-muted-foreground whitespace-pre">
              {lines.map((line, index) => {
                const isHighlighted = highlightRange && index >= highlightRange.start && index <= highlightRange.end;
                return (
                  <div key={index} className={isHighlighted ? "bg-primary/30 text-white" : ""}>
                    {line || " "}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-border bg-panel px-3 py-1">
        <span className="text-[10px] text-muted-foreground">
          {lines.length} lines
        </span>
        <span className="text-[10px] text-muted-foreground">.ui</span>
      </div>
    </div>
  );
}
