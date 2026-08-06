"use client";

import React, { useState, useRef } from "react";
import { useSettings } from "../hooks/use-settings";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Code,
  Monitor,
  Paintbrush,
  Save,
  Plug,
  ChevronRight,
  ChevronDown,
  Search,
  ImageIcon,
  SlidersHorizontal,
  FolderTree
} from "lucide-react";
import { PluginManager } from "@/lib/plugin-sandbox";
import { SyntaxHighlightLine } from "../code-editor";
import { cn } from "@/lib/utils";

type SettingsCategory = "Appearance" | "Editor" | "Canvas" | "Project" | "Plugins";

export function CustomizeTab() {
  const settings = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const preRef = useRef<HTMLDivElement>(null);
  const [pluginCode, setPluginCode] = useState("");
  const [pluginId, setPluginId] = useState("dev_plugin_1");
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("Appearance");
  const [search, setSearch] = useState("");

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "Appearance & Behavior": true,
    Editor: true,
  });

  const toggleNode = (node: string) => {
    setExpandedNodes((prev) => ({ ...prev, [node]: !prev[node] }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        settings.updateSetting("canvasBackgroundImage", reader.result as string);
        settings.updateSetting("canvasBackgroundType", "image");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1E1F22] text-[#BCBEC4] overflow-hidden select-none font-sans">
      {/* Top Header / Breadcrumb (IntelliJ Settings Style) */}
      <div className="h-10 shrink-0 border-b border-[#2B2D30] flex items-center justify-between px-4 bg-[#1E1F22]">
        <div className="flex items-center gap-1.5 text-xs text-[#868A91]">
          <span>Settings</span>
          <ChevronRight className="h-3 w-3 text-[#56585C]" />
          <span className="text-[#BCBEC4] font-medium">{activeCategory}</span>
        </div>
      </div>

      {/* Main 2-Column Split: Tree Navigation Left + Settings Form Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: IntelliJ Settings Tree (240px) */}
        <div className="w-[240px] shrink-0 border-r border-[#2B2D30] flex flex-col bg-[#1E1F22]">
          {/* Quick Filter */}
          <div className="p-2 border-b border-[#2B2D30]">
            <div className="relative">
              <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-[#868A91]" />
              <Input
                placeholder="Search settings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-7 h-7 bg-[#2B2D30] border-none text-xs text-[#BCBEC4] placeholder:text-[#868A91] focus-visible:ring-0 rounded-md"
              />
            </div>
          </div>

          {/* Tree Navigation */}
          <ScrollArea className="flex-1 py-2 px-1">
            <div className="space-y-0.5 text-xs">
              {/* Group 1: Appearance */}
              <div>
                <button
                  onClick={() => toggleNode("Appearance & Behavior")}
                  className="w-full flex items-center gap-1 px-2 py-1 text-[#868A91] hover:text-[#BCBEC4] font-medium"
                >
                  {expandedNodes["Appearance & Behavior"] ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>Appearance & Behavior</span>
                </button>
                {expandedNodes["Appearance & Behavior"] && (
                  <div className="pl-5 space-y-0.5">
                    <button
                      onClick={() => setActiveCategory("Appearance")}
                      className={cn(
                        "w-full text-left px-2 py-1 rounded transition-colors flex items-center gap-2",
                        activeCategory === "Appearance"
                          ? "bg-[#2E436E]/60 text-white font-semibold"
                          : "text-[#BCBEC4] hover:bg-[#2B2D30]"
                      )}
                    >
                      <Paintbrush className="h-3.5 w-3.5 text-[#3574F0]" />
                      <span>Appearance</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Group 2: Editor */}
              <div>
                <button
                  onClick={() => toggleNode("Editor")}
                  className="w-full flex items-center gap-1 px-2 py-1 text-[#868A91] hover:text-[#BCBEC4] font-medium"
                >
                  {expandedNodes["Editor"] ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>Editor</span>
                </button>
                {expandedNodes["Editor"] && (
                  <div className="pl-5 space-y-0.5">
                    <button
                      onClick={() => setActiveCategory("Editor")}
                      className={cn(
                        "w-full text-left px-2 py-1 rounded transition-colors flex items-center gap-2",
                        activeCategory === "Editor"
                          ? "bg-[#2E436E]/60 text-white font-semibold"
                          : "text-[#BCBEC4] hover:bg-[#2B2D30]"
                      )}
                    >
                      <Code className="h-3.5 w-3.5 text-[#3574F0]" />
                      <span>Code Editing</span>
                    </button>
                    <button
                      onClick={() => setActiveCategory("Canvas")}
                      className={cn(
                        "w-full text-left px-2 py-1 rounded transition-colors flex items-center gap-2",
                        activeCategory === "Canvas"
                          ? "bg-[#2E436E]/60 text-white font-semibold"
                          : "text-[#BCBEC4] hover:bg-[#2B2D30]"
                      )}
                    >
                      <Monitor className="h-3.5 w-3.5 text-[#ED8936]" />
                      <span>Canvas & Preview</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Group 3: Project */}
              <button
                onClick={() => setActiveCategory("Project")}
                className={cn(
                  "w-full text-left px-2 py-1 rounded transition-colors flex items-center gap-2 pl-6",
                  activeCategory === "Project"
                    ? "bg-[#2E436E]/60 text-white font-semibold"
                    : "text-[#BCBEC4] hover:bg-[#2B2D30]"
                )}
              >
                <Save className="h-3.5 w-3.5 text-[#59A869]" />
                <span>Project Settings</span>
              </button>

              {/* Group 4: Plugins */}
              <button
                onClick={() => setActiveCategory("Plugins")}
                className={cn(
                  "w-full text-left px-2 py-1 rounded transition-colors flex items-center gap-2 pl-6",
                  activeCategory === "Plugins"
                    ? "bg-[#2E436E]/60 text-white font-semibold"
                    : "text-[#BCBEC4] hover:bg-[#2B2D30]"
                )}
              >
                <Plug className="h-3.5 w-3.5 text-[#985EFF]" />
                <span>Plugins & Dev Sandbox</span>
              </button>
            </div>
          </ScrollArea>
        </div>

        {/* Right Column: Settings Options Area */}
        <div className="flex-1 flex flex-col bg-[#1E1F22] overflow-hidden">
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-2xl space-y-8">
              {/* Category 1: Appearance */}
              {activeCategory === "Appearance" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-[#2B2D30] pb-3">
                    <h3 className="text-sm font-semibold text-white">UI Theme</h3>
                    <p className="text-xs text-[#868A91]">Customize the appearance of Hytale UI Studio interface.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-[#BCBEC4]">Theme</Label>
                      <Select
                        value={settings.appTheme}
                        onValueChange={(val: any) => settings.updateSetting("appTheme", val)}
                      >
                        <SelectTrigger className="w-72 bg-[#2B2D30] border-[#3A3D41] text-xs h-8 text-[#BCBEC4]">
                          <SelectValue placeholder="Select a theme..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2B2D30] border-[#3A3D41] text-[#BCBEC4]">
                          <SelectItem value="intellij">IntelliJ Dark (New UI)</SelectItem>
                          <SelectItem value="default">Default Dark</SelectItem>
                          <SelectItem value="dracula">Dracula</SelectItem>
                          <SelectItem value="monokai">Monokai</SelectItem>
                          <SelectItem value="oceanic">Oceanic</SelectItem>
                          <SelectItem value="hytale">Hytale Gold</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-[#868A91]">Change global color scheme tokens instantly.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Category 2: Editor */}
              {activeCategory === "Editor" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-[#2B2D30] pb-3">
                    <h3 className="text-sm font-semibold text-white">Code Editor (XML / Hytale UI)</h3>
                    <p className="text-xs text-[#868A91]">Configure options for Monaco code editor.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between w-72">
                        <Label className="text-xs text-[#BCBEC4]">Font Size</Label>
                        <span className="text-xs font-mono text-[#868A91]">{settings.editorFontSize}px</span>
                      </div>
                      <Slider
                        min={10}
                        max={24}
                        step={1}
                        value={[settings.editorFontSize]}
                        onValueChange={(val) => settings.updateSetting("editorFontSize", val[0])}
                        className="w-72 py-2"
                      />
                    </div>

                    <div className="flex items-center justify-between w-72 pt-2">
                      <div className="space-y-0.5">
                        <Label className="text-xs text-[#BCBEC4]">Word Wrap</Label>
                        <p className="text-[11px] text-[#868A91]">Wrap long lines automatically.</p>
                      </div>
                      <Switch
                        checked={!!settings.editorWordWrap}
                        onCheckedChange={(val) => settings.updateSetting("editorWordWrap", val)}
                      />
                    </div>

                    <div className="flex items-center justify-between w-72 pt-2">
                      <div className="space-y-0.5">
                        <Label className="text-xs text-[#BCBEC4]">Show Minimap</Label>
                        <p className="text-[11px] text-[#868A91]">Display overview scrollbar on right.</p>
                      </div>
                      <Switch
                        checked={!!settings.editorMinimap}
                        onCheckedChange={(val) => settings.updateSetting("editorMinimap", val)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Category 3: Canvas */}
              {activeCategory === "Canvas" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-[#2B2D30] pb-3">
                    <h3 className="text-sm font-semibold text-white">Canvas & Preview Settings</h3>
                    <p className="text-xs text-[#868A91]">Configure visual rendering defaults.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-[#BCBEC4]">Background Type</Label>
                      <Select
                        value={settings.canvasBackgroundType}
                        onValueChange={(val: any) => settings.updateSetting("canvasBackgroundType", val)}
                      >
                        <SelectTrigger className="w-72 bg-[#2B2D30] border-[#3A3D41] text-xs h-8 text-[#BCBEC4]">
                          <SelectValue placeholder="Select background" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2B2D30] border-[#3A3D41] text-[#BCBEC4]">
                          <SelectItem value="transparent">Transparent Grid</SelectItem>
                          <SelectItem value="solid">Solid Color</SelectItem>
                          <SelectItem value="image">Custom Screenshot Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {settings.canvasBackgroundType === "solid" && (
                      <div className="space-y-2 pt-2">
                        <Label className="text-xs text-[#BCBEC4]">Solid Color</Label>
                        <div className="flex gap-2 w-72">
                          <Input
                            type="color"
                            value={settings.canvasBackgroundColor}
                            onChange={(e) => settings.updateSetting("canvasBackgroundColor", e.target.value)}
                            className="w-10 p-1 h-8 bg-[#2B2D30] border-[#3A3D41] cursor-pointer"
                          />
                          <Input
                            value={settings.canvasBackgroundColor}
                            onChange={(e) => settings.updateSetting("canvasBackgroundColor", e.target.value)}
                            className="flex-1 font-mono bg-[#2B2D30] border-[#3A3D41] text-xs h-8 text-[#BCBEC4]"
                          />
                        </div>
                      </div>
                    )}

                    {settings.canvasBackgroundType === "image" && (
                      <div className="space-y-2 pt-2">
                        <Label className="text-xs text-[#BCBEC4]">Background Image</Label>
                        {settings.canvasBackgroundImage ? (
                          <div className="space-y-2 w-72">
                            <div
                              className="w-full h-24 rounded border border-[#3A3D41] bg-cover bg-center"
                              style={{ backgroundImage: `url(${settings.canvasBackgroundImage})` }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs h-7 border-[#3A3D41] bg-[#2B2D30]"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Change Image
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-72 border-dashed border-[#3A3D41] bg-[#2B2D30] h-9 text-xs"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <ImageIcon className="w-3.5 h-3.5 mr-2" />
                            Upload Hytale Screenshot
                          </Button>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between w-72 pt-4 border-t border-[#2B2D30]">
                      <div className="space-y-0.5">
                        <Label className="text-xs text-[#E55765] flex items-center gap-1">
                          <SlidersHorizontal className="h-3 w-3" /> Debug Bounding Boxes
                        </Label>
                        <p className="text-[11px] text-[#868A91]">Show outline boxes on elements.</p>
                      </div>
                      <Switch
                        checked={!!settings.showBoundingBoxes}
                        onCheckedChange={(val) => settings.updateSetting("showBoundingBoxes", val)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Category 4: Project */}
              {activeCategory === "Project" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-[#2B2D30] pb-3">
                    <h3 className="text-sm font-semibold text-white">Project Defaults</h3>
                    <p className="text-xs text-[#868A91]">Exporting and workspace saving preferences.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-[#BCBEC4]">Default Author / Mod Name</Label>
                      <Input
                        value={settings.defaultAuthorName}
                        onChange={(e) => settings.updateSetting("defaultAuthorName", e.target.value)}
                        placeholder="e.g., MyMod"
                        className="w-72 bg-[#2B2D30] border-[#3A3D41] text-xs h-8 text-[#BCBEC4]"
                      />
                      <p className="text-[11px] text-[#868A91]">Used as author namespace prefix during UI export.</p>
                    </div>

                    <div className="flex items-center justify-between w-72 pt-2">
                      <div className="space-y-0.5">
                        <Label className="text-xs text-[#BCBEC4]">Auto-save Workspace</Label>
                        <p className="text-[11px] text-[#868A91]">Save project edits automatically.</p>
                      </div>
                      <Switch
                        checked={!!settings.autoSaveEnabled}
                        onCheckedChange={(val) => settings.updateSetting("autoSaveEnabled", val)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Category 5: Plugins */}
              {activeCategory === "Plugins" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-[#2B2D30] pb-3">
                    <h3 className="text-sm font-semibold text-white">Plugins & Dev Sandbox</h3>
                    <p className="text-xs text-[#868A91]">Register live UI components into the studio palette via iframe sandbox.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={pluginId}
                        onChange={(e) => setPluginId(e.target.value)}
                        placeholder="Plugin ID"
                        className="w-48 bg-[#2B2D30] border-[#3A3D41] text-xs h-8 text-[#BCBEC4]"
                      />
                      <Button
                        onClick={() => {
                          if (!pluginCode.trim()) return;
                          PluginManager.loadPlugin(pluginId, pluginCode);
                        }}
                        className="h-8 text-xs bg-[#3574F0] hover:bg-[#3574F0]/90 text-white"
                      >
                        Load Plugin
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          PluginManager.unloadPlugin(pluginId);
                        }}
                        className="h-8 text-xs border-[#E55765]/40 text-[#E55765] hover:bg-[#E55765]/10"
                      >
                        Unload
                      </Button>
                    </div>

                    <div className="relative font-mono text-xs min-h-[160px] bg-[#141414] border border-[#3A3D41] rounded-md overflow-hidden flex focus-within:ring-1 focus-within:ring-[#3574F0]">
                      <div
                        ref={preRef}
                        className="absolute inset-0 px-3 py-2 whitespace-pre-wrap break-all overflow-hidden pointer-events-none opacity-100"
                        aria-hidden="true"
                      >
                        {pluginCode ? (
                          pluginCode.split("\n").map((line, i) => (
                            <div key={i} className="min-h-[1rem]">
                              <SyntaxHighlightLine text={line} />
                            </div>
                          ))
                        ) : (
                          <span className="text-[#56585C] whitespace-pre-wrap">
                            {'window.HytaleStudio.plugins.registerComponent("HealthBar", {\n  category: "RPG", icon: "Heart", defaultProps: { Health: 50 },\n  template: { \n    type: "Panel", anchor: { width: "100%", height: "10px" }, background: { color: "#555" }, \n    children: [ { type: "Panel", anchor: { width: "{Health}%", height: "100%" }, background: { color: "#ff2222" } } ] \n  } \n});'}
                          </span>
                        )}
                      </div>

                      <Textarea
                        value={pluginCode}
                        onChange={(e) => setPluginCode(e.target.value)}
                        onScroll={(e) => {
                          if (preRef.current) {
                            preRef.current.scrollTop = e.currentTarget.scrollTop;
                            preRef.current.scrollLeft = e.currentTarget.scrollLeft;
                          }
                        }}
                        spellCheck={false}
                        className="w-full h-[160px] min-h-[160px] px-3 py-2 resize-y bg-transparent text-transparent caret-[#BCBEC4] border-none shadow-none focus-visible:ring-0 whitespace-pre-wrap break-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

