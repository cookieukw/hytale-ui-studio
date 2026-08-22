"use client";

import { useState } from "react";
import { Search, Download, Star, ExternalLink, Check, LayoutTemplate, Box, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/lib/editor-store";
import { TEMPLATES, TemplateData } from "@/lib/templates-data";
import { cn } from "@/lib/utils";

export function TemplatesTab() {
  const createProject = useEditorStore((s) => s.createProject);
  const importFromUI = useEditorStore((s) => s.importFromUI);

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData>(TEMPLATES[0]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"Marketplace" | "Featured">("Marketplace");

  const filteredTemplates = TEMPLATES.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleUseTemplate = (template: TemplateData) => {
    createProject(template.name);
    importFromUI(template.xml);
  };

  return (
    <div className="flex flex-col h-full bg-[#1E1F22] text-[#BCBEC4] overflow-hidden select-none">
      {/* Top Header & Search Bar (IntelliJ Plugin Marketplace Style) */}
      <div className="h-10 shrink-0 border-b border-[#2B2D30] flex items-center justify-between px-4 bg-[#1E1F22]">
        <div className="flex items-center gap-6 text-xs">
          <span className="font-medium text-white py-2 border-b-2 border-[#3574F0]">
            Templates Gallery
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#868A91]" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-7 bg-[#2B2D30] border-none text-xs text-[#BCBEC4] placeholder:text-[#868A91] focus-visible:ring-0 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Template List (320px) */}
        <div className="w-[320px] shrink-0 border-r border-[#2B2D30] flex flex-col bg-[#1E1F22]">
          <div className="px-3 py-2 text-[11px] font-semibold text-[#868A91] uppercase tracking-wider border-b border-[#2B2D30]/40 flex items-center justify-between">
            <span>Templates ({filteredTemplates.length})</span>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-1 space-y-0.5">
              {filteredTemplates.map((template) => {
                const isSelected = selectedTemplate?.id === template.id;
                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={cn(
                      "group p-3 rounded-md flex items-start gap-3 cursor-pointer transition-colors",
                      isSelected
                        ? "bg-[#2E436E]/60 text-white"
                        : "hover:bg-[#2B2D30] text-[#BCBEC4]"
                    )}
                  >
                    {/* Template Icon Box */}
                    <div
                      className={cn(
                        "h-9 w-9 shrink-0 rounded-md flex items-center justify-center border transition-colors",
                        isSelected
                          ? "bg-[#3574F0] border-[#3574F0] text-white"
                          : "bg-[#2B2D30] border-[#3A3D41] text-[#3574F0] group-hover:border-[#3574F0]/50"
                      )}
                    >
                      <LayoutTemplate className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={cn("text-xs font-semibold truncate", isSelected ? "text-white" : "text-[#BCBEC4] group-hover:text-white")}>
                          {template.name}
                        </span>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseTemplate(template);
                          }}
                          className={cn(
                            "h-5 px-2 text-[10px] font-medium rounded shrink-0",
                            isSelected
                              ? "bg-[#3574F0] text-white hover:bg-[#3574F0]/90"
                              : "bg-[#3574F0]/20 text-[#3574F0] hover:bg-[#3574F0] hover:text-white"
                          )}
                        >
                          Use
                        </Button>
                      </div>

                      <p className="text-[11px] text-[#868A91] line-clamp-2 leading-tight">
                        {template.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Right Column: Template Detail & Live Preview */}
        {selectedTemplate ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#1E1F22]">
            {/* Template Title Header */}
            <div className="p-6 pb-4 border-b border-[#2B2D30]">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-[#3574F0]/20 border border-[#3574F0]/40 flex items-center justify-center text-[#3574F0]">
                    <LayoutTemplate className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      {selectedTemplate.name}
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-[#3574F0]/20 text-[#3574F0] border border-[#3574F0]/30">
                        Production Ready
                      </span>
                    </h2>
                    <p className="text-xs text-[#868A91] mt-0.5">
                      Official Hytale UI Studio Preset
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => handleUseTemplate(selectedTemplate)}
                    className="h-8 px-4 text-xs font-semibold bg-[#3574F0] hover:bg-[#3574F0]/90 text-white rounded-md shadow-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Use Template
                  </Button>
                </div>
              </div>

              {/* Tags bar */}
              <div className="flex items-center gap-2 mt-4 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-[#2B2D30] text-[#BCBEC4]">Official</span>
                <span className="pmnppx-2 py-0.5 rounded bg-[#2B2D30] text-[#BCBEC4]">XML UI</span>
                <span className="px-2 py-0.5 rounded bg-[#2B2D30] text-[#BCBEC4]">Layout</span>
                <span className="px-2 py-0.5 rounded bg-[#2B2D30] text-[#BCBEC4]">Hytale Native</span>
              </div>
            </div>

            {/* Template Detail Tabs */}
            <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-6">
              <ScrollArea className="flex-1">
                <div className="space-y-6 pr-4">
                  {/* Screenshot / Preview Image */}
                  <div className="rounded-lg overflow-hidden border border-[#3A3D41] bg-[#141414] aspect-[16/9] relative group">
                    <img
                      src={selectedTemplate.image}
                      alt={selectedTemplate.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Description Box */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Overview</h4>
                    <p className="text-xs text-[#BCBEC4] leading-relaxed">
                      {selectedTemplate.description}
                    </p>
                  </div>

                  {/* Highlights list */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Key Features</h4>
                    <ul className="text-xs text-[#868A91] space-y-1.5">
                      <li className="flex items-center gap-2 text-[#BCBEC4]">
                        <Check className="h-3.5 w-3.5 text-[#59A869]" /> Fully responsive Hytale XML layout anchor system
                      </li>
                      <li className="flex items-center gap-2 text-[#BCBEC4]">
                        <Check className="h-3.5 w-3.5 text-[#59A869]" /> Clean component hierarchy and proper 9-slice backgrounds
                      </li>
                      <li className="flex items-center gap-2 text-[#BCBEC4]">
                        <Check className="h-3.5 w-3.5 text-[#59A869]" /> Pre-configured text styles and layout modes
                      </li>
                    </ul>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

