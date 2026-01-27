"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/lib/editor-store";
import { cn } from "@/lib/utils";

export function CodeEditor() {
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

    // 1. Find the component and its "header signature"
    let targetComponent: any = null;
    let matchCount = 0;
    let targetMatchIndex = -1;

    const findTarget = (list: any[]) => {
      for (const comp of list) {
        // Construct header signature logic matching componentsToCode
        const idPart =
          comp.name && comp.name !== comp.type ? ` #${comp.name}` : "";
        const header = `${comp.type}${idPart}`;

        // If we haven't found target yet, track matching signatures
        if (!targetComponent) {
          if (comp.id === selectedId) {
            targetComponent = comp;
            targetMatchIndex = matchCount;
            return; // Found it
          }
        }

        // Count generic matches for this header to disambiguate
        // Wait, checking *after* finding target is tricky if we don't know the signature yet.
        // Better: Traverse once to find target and its signature.
        // Then traverse again (or simultaneous?)
        // Actually, we need to know "This is the 3rd 'Label {' in the file".
        // But 'Label {' might appear nested. The file generated is flat-ish but recursive.
        // Let's rely on exact pre-order traversal sequence matching the code generation sequence.
      }
    };

    // Better strategy: Generate a flat list of "Headers" in pre-order
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

      <ScrollArea className="flex-1 bg-[#1e1e1e]">
        <div
          ref={(el) => {
            scrollAreaRef.current = el;
          }}
          className="min-h-full p-0 font-mono text-[11px] leading-5"
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
                  "px-4 whitespace-pre hover:bg-white/5 select-text",
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

      <div className="flex shrink-0 items-center justify-between border-t border-border bg-panel px-3 py-1">
        <span className="text-[10px] text-muted-foreground">
          {lines.length} lines
        </span>
        <span className="text-[10px] text-muted-foreground">.ui</span>
      </div>
    </div>
  );
}
