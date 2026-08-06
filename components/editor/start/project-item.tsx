"use client";

import React, { useState } from "react";
import { Layout, Pencil, Trash2, Copy, Calendar, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ProjectItemProps {
  project: any;
  onOpen: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function getProjectInitials(name: string): { initials: string; color: string } {
  if (!name) return { initials: "P", color: "bg-[#4E5254]" };
  const parts = name.split(/[\s-_]+/);
  let initials = "";
  if (parts.length >= 2) {
    initials = (parts[0][0] + parts[1][0]).toUpperCase();
  } else {
    initials = name.slice(0, 2).toUpperCase();
  }

  // Pick deterministic IntelliJ style icon color based on char code
  const colors = [
    "bg-[#3574F0]", // Blue
    "bg-[#59A869]", // Green
    "bg-[#ED8936]", // Orange/Amber
    "bg-[#985EFF]", // Purple
    "bg-[#E55765]", // Red
    "bg-[#00B4D8]", // Cyan
  ];
  const charCode = name.charCodeAt(0) || 0;
  const color = colors[charCode % colors.length];

  return { initials, color };
}

export function ProjectItem({
  project,
  onOpen,
  onRename,
  onDelete,
  onDuplicate,
}: ProjectItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);

  const handleSave = (e: React.FormEvent) => {
    e.stopPropagation();
    if (editName.trim()) {
      onRename(editName);
      setIsEditing(false);
    }
  };

  const { initials, color } = getProjectInitials(project.name);
  const fileCount = project.files?.length || 1;
  const projectSlug = project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const projectPath = `~/HytaleStudio/Projects/${projectSlug} (${fileCount} ${fileCount === 1 ? 'file' : 'files'})`;

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-[#2B2D30] transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3 flex-1 overflow-hidden">
        {/* IntelliJ Square Initial Badge */}
        <div
          className={cn(
            "h-6 w-6 shrink-0 rounded flex items-center justify-center text-white text-[11px] font-bold tracking-tight shadow-xs",
            color
          )}
        >
          {initials}
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                className="h-6 text-xs py-0 bg-[#1E1F22] border-[#3A3D41] text-[#BCBEC4] focus-visible:ring-0"
                onKeyDown={(e) => e.key === "Enter" && handleSave(e)}
              />

              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSave}>
                <Pencil className="h-3 w-3 text-[#3574F0]" />
              </Button>
            </div>
          ) : (
            <span className="text-xs font-semibold text-[#BCBEC4] group-hover:text-white truncate leading-none mb-1">
              {project.name}
            </span>
          )}
          
          <span className="text-[11px] text-[#868A91] truncate font-mono leading-none">
            {projectPath}
          </span>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-1 ml-4",
          isHovered ? "opacity-100" : "opacity-0 invisible"
        )}
      >
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-[#868A91] hover:text-[#BCBEC4] hover:bg-[#35373B]"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          title="Rename"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-[#868A91] hover:text-[#BCBEC4] hover:bg-[#35373B]"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          title="Duplicate"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-[#868A91] hover:text-[#E55765] hover:bg-[#35373B]"
              onClick={(e) => e.stopPropagation()}
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#2B2D30] border-[#3A3D41] text-[#BCBEC4]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete Project</AlertDialogTitle>
              <AlertDialogDescription className="text-[#868A91]">
                Are you sure you want to delete "{project.name}"?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-[#3A3D41] text-[#BCBEC4] hover:bg-[#35373B]">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="bg-[#E55765] text-white hover:bg-[#E55765]/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
