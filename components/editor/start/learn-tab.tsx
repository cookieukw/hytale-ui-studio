"use client";

import { BookOpen, MonitorPlay, Keyboard, Compass, Code, GraduationCap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LearnTab() {
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
            
            <Card className="bg-panel border-border hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader className="pb-3">
                <MonitorPlay className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Getting Started</CardTitle>
                <CardDescription>A quick introduction to the Hytale UI Studio interface and basic concepts.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Learn how to navigate the workspace, use the component palette, and preview your UI in real-time.</p>
              </CardContent>
            </Card>

            <Card className="bg-panel border-border hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader className="pb-3">
                <BookOpen className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle className="text-lg">Component Reference</CardTitle>
                <CardDescription>Detailed documentation for every UI component available.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Understand LayoutModes, Anchors, and styling properties like a pro to build complex structures.</p>
              </CardContent>
            </Card>

            <Card className="bg-panel border-border hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader className="pb-3">
                <Keyboard className="w-8 h-8 text-green-400 mb-2" />
                <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
                <CardDescription>Speed up your workflow with these essential hotkeys.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center justify-between"><span>Command Palette</span> <kbd className="bg-muted px-1.5 py-0.5 rounded border border-border text-xs font-mono">Ctrl+K</kbd></li>
                  <li className="flex items-center justify-between"><span>Undo/Redo</span> <kbd className="bg-muted px-1.5 py-0.5 rounded border border-border text-xs font-mono">Ctrl+Z / Y</kbd></li>
                  <li className="flex items-center justify-between"><span>Delete Node</span> <kbd className="bg-muted px-1.5 py-0.5 rounded border border-border text-xs font-mono">Del</kbd></li>
                  <li className="flex items-center justify-between"><span>Duplicate Node</span> <kbd className="bg-muted px-1.5 py-0.5 rounded border border-border text-xs font-mono">Ctrl+D</kbd></li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-panel border-border hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader className="pb-3">
                <Code className="w-8 h-8 text-purple-400 mb-2" />
                <CardTitle className="text-lg">XML Import & Export</CardTitle>
                <CardDescription>Seamlessly integrate with your Hytale mods.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Learn how to export your project to `.ui` files and import existing code effortlessly.</p>
              </CardContent>
            </Card>

            <Card className="bg-panel border-border hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader className="pb-3">
                <Compass className="w-8 h-8 text-orange-400 mb-2" />
                <CardTitle className="text-lg">Advanced Layouts</CardTitle>
                <CardDescription>Master nested Groups and Flex weights.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Discover the secrets behind Hytale's responsive UI engine and how to replicate standard game menus.</p>
              </CardContent>
            </Card>

            <Card className="bg-panel border-border hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader className="pb-3">
                <GraduationCap className="w-8 h-8 text-yellow-400 mb-2" />
                <CardTitle className="text-lg">Best Practices</CardTitle>
                <CardDescription>Design clean and performant UI files.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Tips on structuring your UI files, managing component depth, and naming conventions.</p>
              </CardContent>
            </Card>

          </div>
        </ScrollArea>
      </div>
    </>
  );
}
