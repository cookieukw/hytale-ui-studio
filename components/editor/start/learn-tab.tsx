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
    title: "Getting Started",
    description: "A quick introduction to the Hytale UI Studio interface and basic concepts.",
    shortDesc: "Learn how to navigate the workspace, use the component palette, and preview your UI in real-time.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground mt-4">
        <p><strong className="text-foreground">1. Workspace & Files:</strong> On the left sidebar, the Workspace tab shows all your `.ui` files. You can create, rename, duplicate, or import files.</p>
        <p><strong className="text-foreground">2. Component Palette:</strong> Drag and drop components from the Palette directly into the canvas or the Tree view.</p>
        <p><strong className="text-foreground">3. Canvas & Tree:</strong> The center Canvas shows a live preview of your Hytale UI. The Component Tree lets you reorder and nest elements cleanly.</p>
        <p><strong className="text-foreground">4. Inspector:</strong> Select any component to view its properties on the right. You can change LayoutMode, Anchors, Styles, and Data bindings.</p>
      </div>
    )
  },
  {
    id: "component-reference",
    icon: <BookOpen className="w-8 h-8 text-blue-400 mb-2" />,
    title: "Component Reference",
    description: "Detailed documentation for UI concepts like LayoutMode and Anchors.",
    shortDesc: "Understand LayoutModes, Anchors, and styling properties like a pro to build complex structures.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground mt-4">
        <p><strong className="text-foreground">LayoutMode:</strong> Determines how children are arranged.</p>
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li><code className="text-primary bg-primary/10 px-1 rounded">Top / Bottom / Left / Right</code>: Stacks children in that direction.</li>
          <li><code className="text-primary bg-primary/10 px-1 rounded">Center / Middle</code>: Centers children but shrinks to fit their content.</li>
          <li><code className="text-primary bg-primary/10 px-1 rounded">CenterMiddle</code>: Centers children perfectly in both axes.</li>
        </ul>
        <p className="mt-4"><strong className="text-foreground">Anchors:</strong> Used to define size and position.</p>
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li><code className="text-primary bg-primary/10 px-1 rounded">Full: 1</code> stretches the element to fill the parent container (does NOT work well if parent is Center LayoutMode).</li>
          <li>Use <code className="text-primary bg-primary/10 px-1 rounded">Width / Height</code> for fixed sizes.</li>
          <li>Use <code className="text-primary bg-primary/10 px-1 rounded">Top / Bottom / Left / Right</code> to add spacing/margins relative to the layout direction.</li>
        </ul>
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
    title: "XML Import & Export",
    description: "Seamlessly integrate with your Hytale mods.",
    shortDesc: "Learn how to export your project to `.ui` files and import existing code effortlessly.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground mt-4">
        <p><strong className="text-foreground">Exporting:</strong> Click the Download icon in the top toolbar to export your entire project as a `.zip` file containing all your `.ui` documents.</p>
        <p><strong className="text-foreground">Importing files:</strong> You can drag and drop a `.ui` file into the Workspace sidebar, or use the Upload icon to import a full project `.zip`.</p>
        <p><strong className="text-foreground">The Code Tab:</strong> You can edit the UI XML directly in the Code Editor tab. Changes made there will sync instantly with the visual Canvas!</p>
        <div className="bg-primary/10 p-3 rounded-md border border-primary/20 mt-4">
          <p className="text-xs text-primary font-medium">Note: Hytale UI Studio automatically fixes missing syntax and regenerates duplicate IDs upon importing.</p>
        </div>
      </div>
    )
  },
  {
    id: "advanced",
    icon: <Compass className="w-8 h-8 text-orange-400 mb-2" />,
    title: "Advanced Layouts",
    description: "Master nested Groups and Flex weights.",
    shortDesc: "Discover the secrets behind Hytale's responsive UI engine and how to replicate standard game menus.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground mt-4">
        <p><strong className="text-foreground">FlexWeight:</strong> Use FlexWeight to create proportional layouts. If a parent has LayoutMode Left, and two children have FlexWeight 1 and 2, they will take 33% and 66% of the available space respectively.</p>
        <p><strong className="text-foreground">Aliases and Overlays:</strong> Hytale frequently uses variables like <code className="text-primary bg-primary/10 px-1 rounded">$C = "Common.ui";</code> and elements like <code className="text-primary bg-primary/10 px-1 rounded">$C.@PageOverlay</code> to wrap content. You can manually type these in the Code Editor tab to link your components to global styles.</p>
        <p><strong className="text-foreground">Nesting Groups:</strong> The key to complex Hytale UIs is liberal use of `Group` components. If things don't align, wrap them in a Group with a dedicated LayoutMode.</p>
      </div>
    )
  },
  {
    id: "best-practices",
    icon: <GraduationCap className="w-8 h-8 text-yellow-400 mb-2" />,
    title: "Best Practices",
    description: "Design clean and performant UI files.",
    shortDesc: "Tips on structuring your UI files, managing component depth, and naming conventions.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground mt-4">
        <p><strong className="text-foreground">1. Keep it flat:</strong> Avoid unnecessary deeply nested groups as it can complicate your layout logic and reduce performance.</p>
        <p><strong className="text-foreground">2. Name your IDs:</strong> Use clear, descriptive IDs (e.g. <code className="text-primary bg-primary/10 px-1 rounded">#BtnSubmit</code> instead of <code className="text-primary bg-primary/10 px-1 rounded">#Group12</code>). This makes referencing them in Java code much easier.</p>
        <p><strong className="text-foreground">3. Use Common.ui:</strong> Rely on shared styles like <code className="text-primary bg-primary/10 px-1 rounded">$C.@Title</code> or <code className="text-primary bg-primary/10 px-1 rounded">$C.@DefaultLabelStyle</code> instead of manually styling every Text element. It ensures your mod feels native to Hytale.</p>
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
