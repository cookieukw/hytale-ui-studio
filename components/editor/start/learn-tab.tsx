"use client";

import { useState } from "react";
import { BookOpen, MonitorPlay, Keyboard, Compass, Code, GraduationCap, ChevronRight, Search, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const LEARN_TOPICS = [
  {
    id: "getting-started",
    icon: <MonitorPlay className="h-4 w-4 text-[#3574F0]" />,
    title: "Getting Started & Core Concepts",
    category: "Basics",
    description: "Deep dive into Hytale UI Studio's editor philosophy and workflow.",
    content: (
      <div className="space-y-6 text-xs text-[#BCBEC4] leading-relaxed max-w-2xl">
        <div className="border-b border-[#2B2D30] pb-4">
          <h2 className="text-base font-bold text-white mb-1">1. DOM vs Hytale UI Engine</h2>
          <p className="text-[#868A91]">
            Hytale's UI is not HTML/CSS. It's a native game UI rendering engine based on nested Groups, strictly typed Anchors, and explicit layout modes.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Component Properties & Styling</h3>
          <p>
            Elements in Hytale support specific rendering properties instead of generic CSS classes. For example, Label elements use:
          </p>
          <pre className="bg-[#141414] p-3 rounded-md border border-[#3A3D41] font-mono text-[11px] text-[#3574F0]">
{`Label #MyText {
  Text: "Hello Hytale";
  Style: (FontSize: 22, TextColor: #FFFFFF, RenderBold: true);
}`}
          </pre>
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold text-white">Real-Time Lexer & Parser</h3>
          <p>
            The Studio features a custom Lexer and AST Parser built specifically for Hytale `.ui` syntax. Syntax errors (like unclosed braces or missing semicolons) gracefully keep the editor in its last valid state.
          </p>
        </div>
      </div>
    )
  },
  {
    id: "component-reference",
    icon: <BookOpen className="h-4 w-4 text-[#59A869]" />,
    title: "Component Reference & Anchors",
    category: "Layout",
    description: "Documentation on Hytale-specific properties, Anchors, HitTestVisible, and Sprites.",
    content: (
      <div className="space-y-6 text-xs text-[#BCBEC4] leading-relaxed max-w-2xl">
        <div className="border-b border-[#2B2D30] pb-4">
          <h2 className="text-base font-bold text-white mb-1">Advanced Anchors & Layout Modes</h2>
          <p className="text-[#868A91]">
            Understanding how containers compute bounds and distribute space.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Full: 1 vs Center Layouts</h3>
          <p>
            <code className="text-[#3574F0] bg-[#3574F0]/10 px-1 rounded font-mono">Full: 1</code> attempts to stretch 100% to fill the parent container. However, if the parent uses <code className="text-[#3574F0] bg-[#3574F0]/10 px-1 rounded font-mono">LayoutMode: Center</code>, layout bounds shrink to wrap children, collapsing <code className="text-[#3574F0] bg-[#3574F0]/10 px-1 rounded font-mono">Full: 1</code>.
          </p>
          <ul className="list-disc ml-5 space-y-1.5 text-[#868A91]">
            <li><strong className="text-[#BCBEC4]">TopScrolling / LeftScrolling:</strong> Enables vertical or horizontal scrollbar containers.</li>
            <li><strong className="text-[#BCBEC4]">Padding & Margins:</strong> Padding offsets inner content, while Margin pushes neighboring elements apart in flow modes.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: "shortcuts",
    icon: <Keyboard className="h-4 w-4 text-[#ED8936]" />,
    title: "Keyboard Shortcuts",
    category: "Workflow",
    description: "Speed up your workflow with hotkeys for palette, history, and duplicate actions.",
    content: (
      <div className="space-y-6 text-xs text-[#BCBEC4] max-w-2xl">
        <div className="border-b border-[#2B2D30] pb-4">
          <h2 className="text-base font-bold text-white mb-1">Essential Studio Hotkeys</h2>
          <p className="text-[#868A91]">Boost your speed with these built-in keyboard shortcuts.</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-[#2B2D30]">
            <span>Command Palette (Search & Tools)</span>
            <kbd className="bg-[#2B2D30] px-2 py-1 rounded text-[11px] font-mono text-white">Ctrl + K</kbd>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#2B2D30]">
            <span>Undo Action</span>
            <kbd className="bg-[#2B2D30] px-2 py-1 rounded text-[11px] font-mono text-white">Ctrl + Z</kbd>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#2B2D30]">
            <span>Redo Action</span>
            <kbd className="bg-[#2B2D30] px-2 py-1 rounded text-[11px] font-mono text-white">Ctrl + Y</kbd>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#2B2D30]">
            <span>Duplicate Selected Component</span>
            <kbd className="bg-[#2B2D30] px-2 py-1 rounded text-[11px] font-mono text-white">Ctrl + D</kbd>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#2B2D30]">
            <span>Delete Selected Component</span>
            <kbd className="bg-[#2B2D30] px-2 py-1 rounded text-[11px] font-mono text-white">Delete</kbd>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "import-export",
    icon: <Code className="h-4 w-4 text-[#985EFF]" />,
    title: "XML Serialization & Mod Integration",
    category: "Integration",
    description: "How the Studio exports clean `.ui` syntax and packages `.zip` mod assets.",
    content: (
      <div className="space-y-6 text-xs text-[#BCBEC4] leading-relaxed max-w-2xl">
        <div className="border-b border-[#2B2D30] pb-4">
          <h2 className="text-base font-bold text-white mb-1">Mod Packager & Serialization</h2>
          <p className="text-[#868A91]">Details on how UI components convert to game code.</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">ZIP Export Architecture</h3>
          <p>
            When exporting a project to ZIP format, the Studio serializes every active `.ui` file using Hytale's exact property casing and wraps them inside the configured Author namespace.
          </p>
        </div>
      </div>
    )
  },
  {
    id: "advanced",
    icon: <Compass className="h-4 w-4 text-[#00B4D8]" />,
    title: "FlexWeight & Advanced Layouts",
    category: "Layout",
    description: "Mastering FlexWeight space distribution, Z-Index stacking, and Group nesting.",
    content: (
      <div className="space-y-6 text-xs text-[#BCBEC4] leading-relaxed max-w-2xl">
        <div className="border-b border-[#2B2D30] pb-4">
          <h2 className="text-base font-bold text-white mb-1">FlexWeight & Stacking Rules</h2>
          <p className="text-[#868A91]">How the engine distributes dynamic remaining space.</p>
        </div>

        <div className="space-y-3">
          <p>
            FlexWeight operates along the main axis of the parent's <code className="text-[#3574F0] bg-[#3574F0]/10 px-1 rounded font-mono">LayoutMode</code> (such as <code className="text-[#3574F0] bg-[#3574F0]/10 px-1 rounded font-mono">Left</code> or <code className="text-[#3574F0] bg-[#3574F0]/10 px-1 rounded font-mono">Top</code>). Remaining space is computed as:
          </p>
          <pre className="bg-[#141414] p-2.5 rounded border border-[#3A3D41] font-mono text-[11px] text-[#59A869]">
ParentWidth - FixedWidthChildren - Padding = FlexSpace
          </pre>
        </div>
      </div>
    )
  },
  {
    id: "best-practices",
    icon: <GraduationCap className="h-4 w-4 text-[#E55765]" />,
    title: "Best Practices & Performance",
    category: "Architecture",
    description: "Architectural guidelines to keep your Hytale UIs fast and maintainable.",
    content: (
      <div className="space-y-6 text-xs text-[#BCBEC4] leading-relaxed max-w-2xl">
        <div className="border-b border-[#2B2D30] pb-4">
          <h2 className="text-base font-bold text-white mb-1">Hytale UI Architectural Guidelines</h2>
          <p className="text-[#868A91]">Keep layout calculation recursions fast on lower-end devices.</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Avoid Over-Nesting</h3>
          <p>
            Avoid nesting Groups more than 10 levels deep. Use direct Anchor coordinate positioning whenever layout structure allows.
          </p>
        </div>
      </div>
    )
  }
];

export function LearnTab() {
  const [selectedTopic, setSelectedTopic] = useState<typeof LEARN_TOPICS[0]>(LEARN_TOPICS[0]);
  const [search, setSearch] = useState("");

  const filteredTopics = LEARN_TOPICS.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#1E1F22] text-[#BCBEC4] overflow-hidden select-none font-sans">
      {/* Top Header / Breadcrumb (IntelliJ Learn Style) */}
      <div className="h-10 shrink-0 border-b border-[#2B2D30] flex items-center justify-between px-4 bg-[#1E1F22]">
        <div className="flex items-center gap-1.5 text-xs text-[#868A91]">
          <span>Learn Studio</span>
          <ChevronRight className="h-3 w-3 text-[#56585C]" />
          <span className="text-[#BCBEC4] font-medium">{selectedTopic.title}</span>
        </div>
      </div>

      {/* Main 2-Column Split: Topic List Left + Reader Panel Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Topic List (260px) */}
        <div className="w-[260px] shrink-0 border-r border-[#2B2D30] flex flex-col bg-[#1E1F22]">
          <div className="p-2 border-b border-[#2B2D30]">
            <div className="relative">
              <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-[#868A91]" />
              <Input
                placeholder="Search topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-7 h-7 bg-[#2B2D30] border-none text-xs text-[#BCBEC4] placeholder:text-[#868A91] focus-visible:ring-0 rounded-md"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 py-1">
            <div className="p-1 space-y-0.5">
              {filteredTopics.map((topic) => {
                const isSelected = selectedTopic.id === topic.id;
                return (
                  <div
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic)}
                    className={cn(
                      "group p-2.5 rounded-md flex items-start gap-2.5 cursor-pointer transition-colors",
                      isSelected
                        ? "bg-[#2E436E]/60 text-white"
                        : "hover:bg-[#2B2D30] text-[#BCBEC4]"
                    )}
                  >
                    <div className="mt-0.5 shrink-0">{topic.icon}</div>
                    <div className="flex-1 min-w-0">
                      <span className={cn("text-xs font-semibold block truncate", isSelected ? "text-white" : "text-[#BCBEC4] group-hover:text-white")}>
                        {topic.title}
                      </span>
                      <span className="text-[10px] text-[#868A91] block truncate mt-0.5">
                        {topic.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Right Column: Documentation Content Reader */}
        <div className="flex-1 flex flex-col bg-[#1E1F22] overflow-hidden">
          <ScrollArea className="flex-1 p-8">
            {selectedTopic.content}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

