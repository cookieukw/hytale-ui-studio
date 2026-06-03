"use client";

import { LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/lib/editor-store";
import { TEMPLATES } from "@/lib/templates-data";

export function TemplatesTab() {
  const createProject = useEditorStore((s) => s.createProject);
  const importFromUI = useEditorStore((s) => s.importFromUI);

  const handleUseTemplate = (template: typeof TEMPLATES[0]) => {
    // Create a new project with the template name
    createProject(template.name);
    // Inject the raw XML into the newly created project
    importFromUI(template.xml);
  };

  return (
    <>
      <div className="p-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Template Gallery
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Start your next project from a production-ready Hytale UI template.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-8 pb-8 overflow-hidden">
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            {TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="group flex flex-col rounded-xl overflow-hidden bg-panel border border-border hover:border-primary/50 transition-colors shadow-lg"
              >
                {/* Image Preview Container */}
                <div className="aspect-[16/9] w-full bg-secondary/30 border-b border-border relative overflow-hidden flex items-center justify-center">
                  {template.image ? (
                    <img 
                      src={template.image} 
                      alt={template.name}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <LayoutTemplate className="h-16 w-16 text-muted-foreground/30" />
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                    <Button 
                      size="lg" 
                      onClick={() => handleUseTemplate(template)}
                      className="shadow-xl font-bold translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                    >
                      Use Template
                    </Button>
                  </div>
                </div>

                {/* Info Container */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {template.name}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
                    {template.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
