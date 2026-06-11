"use client";

import React, { useRef } from "react";
import { useSettings } from "../hooks/use-settings";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Monitor, Code, Image as ImageIcon, Save, SlidersHorizontal, Settings2 } from "lucide-react";

export function CustomizeTab() {
  const settings = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <>
      <div className="p-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-primary" />
            Customize Studio
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your editor, preview canvas, and project defaults.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-8 pb-8 overflow-hidden">
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
            
            {/* Editor Settings */}
            <Card className="bg-panel border-border shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-400" />
                  <CardTitle>Code Editor</CardTitle>
                </div>
                <CardDescription>Preferences for the Monaco XML Editor.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Font Size: {settings.editorFontSize}px</Label>
                  </div>
                  <Slider
                    min={10}
                    max={24}
                    step={1}
                    value={[settings.editorFontSize]}
                    onValueChange={(val) => settings.updateSetting("editorFontSize", val[0])}
                    className="py-2"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="switch-word-wrap">Word Wrap</Label>
                    <p className="text-xs text-muted-foreground">Wrap long lines of XML.</p>
                  </div>
                  <Switch
                    id="switch-word-wrap"
                    checked={!!settings.editorWordWrap}
                    onCheckedChange={(val) => settings.updateSetting("editorWordWrap", val)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="switch-minimap">Minimap</Label>
                    <p className="text-xs text-muted-foreground">Show code overview on the right.</p>
                  </div>
                  <Switch
                    id="switch-minimap"
                    checked={!!settings.editorMinimap}
                    onCheckedChange={(val) => settings.updateSetting("editorMinimap", val)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Canvas Settings */}
            <Card className="bg-panel border-border shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-orange-400" />
                  <CardTitle>Canvas Preview</CardTitle>
                </div>
                <CardDescription>How the visual UI is rendered.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Background Type</Label>
                  <Select
                    value={settings.canvasBackgroundType}
                    onValueChange={(val: any) => settings.updateSetting("canvasBackgroundType", val)}
                  >
                    <SelectTrigger className="w-full bg-background border-border">
                      <SelectValue placeholder="Select background" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transparent">Transparent Grid</SelectItem>
                      <SelectItem value="solid">Solid Color</SelectItem>
                      <SelectItem value="image">Custom Image (Hytale Screenshot)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.canvasBackgroundType === "solid" && (
                  <div className="space-y-3">
                    <Label>Solid Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.canvasBackgroundColor}
                        onChange={(e) => settings.updateSetting("canvasBackgroundColor", e.target.value)}
                        className="w-12 p-1 h-9 cursor-pointer"
                      />
                      <Input
                        value={settings.canvasBackgroundColor}
                        onChange={(e) => settings.updateSetting("canvasBackgroundColor", e.target.value)}
                        className="flex-1 font-mono bg-background border-border"
                      />
                    </div>
                  </div>
                )}

                {settings.canvasBackgroundType === "image" && (
                  <div className="space-y-3">
                    <Label>Background Image</Label>
                    {settings.canvasBackgroundImage ? (
                      <div className="space-y-2">
                        <div 
                          className="w-full h-24 rounded-md border border-border bg-cover bg-center"
                          style={{ backgroundImage: `url(${settings.canvasBackgroundImage})` }}
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full border-dashed"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
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

                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="switch-bounding" className="flex items-center gap-1 text-red-400">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      Debug Bounding Boxes
                    </Label>
                    <p className="text-xs text-muted-foreground">Draw outlines around all UI Groups.</p>
                  </div>
                  <Switch
                    id="switch-bounding"
                    checked={!!settings.showBoundingBoxes}
                    onCheckedChange={(val) => settings.updateSetting("showBoundingBoxes", val)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Project Settings */}
            <Card className="bg-panel border-border shadow-md md:col-span-2 lg:col-span-1">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Save className="w-5 h-5 text-green-400" />
                  <CardTitle>Project Preferences</CardTitle>
                </div>
                <CardDescription>Defaults for saving and exporting.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Default Author Name</Label>
                  <Input 
                    value={settings.defaultAuthorName}
                    onChange={(e) => settings.updateSetting("defaultAuthorName", e.target.value)}
                    placeholder="e.g., MyMod"
                    className="bg-background border-border"
                  />
                  <p className="text-xs text-muted-foreground">Used as the default author/mod prefix when exporting UI to a .zip file.</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="space-y-0.5">
                    <Label htmlFor="switch-autosave">Auto-save workspace</Label>
                    <p className="text-xs text-muted-foreground">Automatically save changes to your browser.</p>
                  </div>
                  <Switch
                    id="switch-autosave"
                    checked={!!settings.autoSaveEnabled}
                    onCheckedChange={(val) => settings.updateSetting("autoSaveEnabled", val)}
                  />
                </div>
              </CardContent>
            </Card>

          </div>
        </ScrollArea>
      </div>
    </>
  );
}
