"use client";

import { useState } from "react";
import { BookOpen, MonitorPlay, Keyboard, Compass, Code, GraduationCap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const LEARN_TOPICS = [
  {
    id: "getting-started",
    icon: <MonitorPlay className="w-8 h-8 text-primary mb-2" />,
    title: "Getting Started & Core Concepts",
    description: "Deep dive into Hytale UI Studio's editor philosophy and workflow.",
    shortDesc: "Learn about the architecture of UI documents, state management, and real-time syncing.",
    content: (
      <div className="space-y-5 text-sm text-muted-foreground mt-4 leading-relaxed">
        <p><strong className="text-foreground">1. The DOM vs Hytale UI:</strong> Hytale's UI is not HTML/CSS. It's a custom rendering engine based on nested Groups and strictly defined properties. The Studio bridges this by parsing your `.ui` XML-like syntax into a structured AST and rendering an HTML approximation on the Canvas.</p>
        
        <p><strong className="text-foreground">2. Component Properties:</strong> Elements in Hytale support specific rendering properties instead of generic CSS. For example, Text elements use <code className="text-primary bg-primary/10 px-1 rounded">Style: (FontSize: 22, TextColor: #FFFFFF)</code> instead of standalone fonts, and containers use <code className="text-primary bg-primary/10 px-1 rounded">Background</code> or <code className="text-primary bg-primary/10 px-1 rounded">Image</code> properties.</p>

        <p><strong className="text-foreground">3. Real-time Parser:</strong> The Code Editor tab uses a custom Lexer and Parser built specifically for Hytale UI syntax. If you make a syntax error (e.g., missing a semicolon or a closing bracket), the AST will freeze at its last valid state until the syntax is corrected. Always check the browser console if your code changes aren't reflecting!</p>
      </div>
    )
  },
  {
    id: "component-reference",
    icon: <BookOpen className="w-8 h-8 text-blue-400 mb-2" />,
    title: "Component Reference",
    description: "Advanced documentation on Hytale-specific properties and quirks.",
    shortDesc: "Deep dive into Anchors, HitTestVisible, Sprites, Dropdowns, and padding/margin syntax.",
    content: (
      <div className="space-y-5 text-sm text-muted-foreground mt-4 leading-relaxed">
        <p><strong className="text-foreground">Advanced Anchors & Layout Modes:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-2">
            <li><code className="text-primary bg-primary/10 px-1 rounded">Full: 1</code> vs <code className="text-primary bg-primary/10 px-1 rounded">LayoutMode: Center</code>: <code className="text-primary bg-primary/10 px-1 rounded">Full: 1</code> attempts to take 100% of the parent's layout bounds. However, if the parent has <code className="text-primary bg-primary/10 px-1 rounded">LayoutMode: Center</code>, the layout bounds shrink to wrap the children, causing <code className="text-primary bg-primary/10 px-1 rounded">Full: 1</code> to collapse to 0 width/height. Always use fixed Width/Height if the parent is Centered.</li>
          </ul>
        </p>
        
        <p><strong className="text-foreground">Padding and Margin Rules:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-2">
            <li>Padding controls the internal spacing of a Group, while Margin pushes elements away from their neighbors in flow layouts like <code className="text-primary bg-primary/10 px-1 rounded">Left</code> or <code className="text-primary bg-primary/10 px-1 rounded">Top</code>.</li>
            <li>You can define them explicitly: <code className="text-primary bg-primary/10 px-1 rounded">Padding: (Left: 10, Right: 10)</code>.</li>
            <li>Unlike HTML, if a container has no explicit dimensions, its size is entirely determined by its children plus padding.</li>
          </ul>
        </p>
      </div>
    )
  },
  {
    id: "shortcuts",
    icon: <Keyboard className="w-8 h-8 text-green-400 mb-2" />,
    title: "Keyboard Shortcuts",
    description: "Speed up your workflow with these essential hotkeys.",
    shortDesc: "Master the command palette, undo/redo, and component manipulation.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground mt-4">
        <ul className="space-y-3">
          <li className="flex items-center justify-between border-b border-border/50 pb-2">
            <span className="text-foreground">Open Command Palette</span> 
            <kbd className="bg-muted px-2 py-1 rounded border border-border text-xs font-mono">Ctrl+K</kbd>
          </li>
          <li className="flex items-center justify-between border-b border-border/50 pb-2">
            <span className="text-foreground">Undo action</span> 
            <kbd className="bg-muted px-2 py-1 rounded border border-border text-xs font-mono">Ctrl+Z</kbd>
          </li>
          <li className="flex items-center justify-between border-b border-border/50 pb-2">
            <span className="text-foreground">Redo action</span> 
            <kbd className="bg-muted px-2 py-1 rounded border border-border text-xs font-mono">Ctrl+Y</kbd>
          </li>
          <li className="flex items-center justify-between border-b border-border/50 pb-2">
            <span className="text-foreground">Delete selected component</span> 
            <kbd className="bg-muted px-2 py-1 rounded border border-border text-xs font-mono">Del</kbd>
          </li>
          <li className="flex items-center justify-between border-b border-border/50 pb-2">
            <span className="text-foreground">Duplicate component</span> 
            <kbd className="bg-muted px-2 py-1 rounded border border-border text-xs font-mono">Ctrl+D</kbd>
          </li>
          <li className="flex items-center justify-between pb-2">
            <span className="text-foreground">Copy & Paste</span> 
            <div className="flex gap-1">
              <kbd className="bg-muted px-2 py-1 rounded border border-border text-xs font-mono">Ctrl+C</kbd>
              <kbd className="bg-muted px-2 py-1 rounded border border-border text-xs font-mono">Ctrl+V</kbd>
            </div>
          </li>
        </ul>
      </div>
    )
  },
  {
    id: "import-export",
    icon: <Code className="w-8 h-8 text-purple-400 mb-2" />,
    title: "XML Parser & Mod Integration",
    description: "How Hytale UI Studio interprets your code and manages project structure.",
    shortDesc: "Understand alias resolution, translation keys, and AST hydration during imports.",
    content: (
      <div className="space-y-5 text-sm text-muted-foreground mt-4 leading-relaxed">
        <p><strong className="text-foreground">Project Serialization:</strong> When you export to `.zip`, the Studio recursively converts your visual hierarchy back into valid Hytale `.ui` syntax. Properties like `FlexWeight` are formatted to match the parser's expected casing, and JSZip handles packaging the files exactly as they appear in the workspace.</p>
        
        <p><strong className="text-foreground">Text Properties & Formatting:</strong> Hytale's UI engine renders text directly. Use the <code className="text-primary bg-primary/10 px-1 rounded">Text: "My String"</code> property on Labels. Make sure any quotes within strings are properly escaped to avoid breaking the parser.</p>
        
        <p><strong className="text-foreground">AST Hydration & Duplicate Resolution:</strong> 
          If you import a ZIP file containing multiple `.ui` files with identical filenames, Hytale UI Studio automatically appends numeric suffixes like `(1).ui` to prevent JSZip from overwriting them during your next export, keeping your project safe.
        </p>
      </div>
    )
  },
  {
    id: "advanced",
    icon: <Compass className="w-8 h-8 text-orange-400 mb-2" />,
    title: "Advanced Engine Layouts",
    description: "Mastering the quirks of Hytale's Box Model and rendering engine.",
    shortDesc: "Learn how to use Mixins (...), nested Groups, Flex weights, and alias overrides.",
    content: (
      <div className="space-y-5 text-sm text-muted-foreground mt-4 leading-relaxed">
        <p><strong className="text-foreground">FlexWeight Mechanics:</strong> FlexWeight only operates on the axis defined by the parent's `LayoutMode`. If a parent is `LayoutMode: Left`, FlexWeight distributes width. The available space is calculated as: <code className="text-primary bg-primary/10 px-1 rounded">ParentWidth - (Sum of Fixed Width Children) - (Padding/Margins)</code>. The remainder is divided proportionally among elements with `FlexWeight`. If you use `FlexWeight` inside `LayoutMode: CenterMiddle`, it will **not** work as expected, because `CenterMiddle` has no explicit axis direction for expansion.</p>
        
        <p><strong className="text-foreground">Z-Index & Overlays:</strong> Hytale renders UI tree depth-first. Elements defined later in the XML are generally rendered on top. It's often necessary to structure your files carefully to ensure background overlays appear behind modals rather than over them.</p>

        <p><strong className="text-foreground">Nesting Groups:</strong> The key to complex Hytale UIs is liberal use of `Group` components. If things don't align, wrap them in a Group with a dedicated LayoutMode.</p>
      </div>
    )
  },
  {
    id: "best-practices",
    icon: <GraduationCap className="w-8 h-8 text-yellow-400 mb-2" />,
    title: "Hytale UI Best Practices",
    description: "Architecting UI files for performance, mod compatibility, and maintainability.",
    shortDesc: "Design patterns for Common.ui usage, avoiding deeply nested hierarchies, and ID naming.",
    content: (
      <div className="space-y-5 text-sm text-muted-foreground mt-4 leading-relaxed">
        <p><strong className="text-foreground">1. Component Depth vs Performance:</strong> The Hytale UI engine recalculates layouts recursively. Extremely deep nesting (e.g., <code className="text-primary bg-primary/10 px-1 rounded">&lt;Group&gt;</code> inside <code className="text-primary bg-primary/10 px-1 rounded">&lt;Group&gt;</code> inside <code className="text-primary bg-primary/10 px-1 rounded">&lt;Group&gt;</code> for over 10 levels) can cause lag spikes when layouts are toggled via Java. Flatten your layouts using explicit `Anchor` positioning where possible instead of stacking endless wrappers.</p>
        
        <p><strong className="text-foreground">2. ID Naming Conventions:</strong> Treat UI IDs like Java variable names. Use PascalCase or camelCase with a prefix designating the type (e.g. <code className="text-primary bg-primary/10 px-1 rounded">#BtnSubmit</code> instead of <code className="text-primary bg-primary/10 px-1 rounded">#Group12</code>). Never use identical IDs within the same `.ui` file, as the Java backend will typically grab the first match it finds, leading to unpredictable bug reports.</p>
        
        <p><strong className="text-foreground">3. Reusable UI:</strong> Whenever possible, structure your interfaces into reusable blocks. Copy-pasting the same `Group` block 10 times in your code will make it very hard to maintain if you ever want to change a padding or background color.</p>
      </div>
    )
  }
];

export function LearnTab() {
  const [selectedTopic, setSelectedTopic] = useState<typeof LEARN_TOPICS[0] | null>(null);

  return (
    <>
      <div className="p-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Learn Studio
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Master Hytale UI Studio with these resources and guides.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-8 pb-8 overflow-hidden">
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {LEARN_TOPICS.map((topic) => (
              <Card 
                key={topic.id}
                className="bg-panel border-border hover:border-primary/50 transition-all cursor-pointer shadow-md hover:shadow-primary/5"
                onClick={() => setSelectedTopic(topic)}
              >
                <CardHeader className="pb-3">
                  {topic.icon}
                  <CardTitle className="text-lg">{topic.title}</CardTitle>
                  <CardDescription>{topic.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{topic.shortDesc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={!!selectedTopic} onOpenChange={(open) => !open && setSelectedTopic(null)}>
        <DialogContent className="bg-panel border-border sm:max-w-[550px]">
          {selectedTopic && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-background rounded-md border border-border">
                    {selectedTopic.icon}
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedTopic.title}</DialogTitle>
                    <DialogDescription>{selectedTopic.description}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] pr-4">
                {selectedTopic.content}
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
