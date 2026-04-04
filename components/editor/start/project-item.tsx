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

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex items-center justify-between p-4 rounded-lg bg-project-item border border-transparent hover:border-primary/30 hover:bg-panel transition-all duration-200 cursor-pointer shadow-sm"
    >
      <div className="flex items-center gap-4 flex-1 overflow-hidden">
        <div className="h-10 w-10 shrink-0 bg-secondary rounded-md flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
          <Layout className="h-5 w-5" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                className="h-7 text-sm py-0 bg-background border-border focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary/50 transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleSave(e)}
              />

              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSave}>
                <Pencil className="h-3.5 w-3.5 text-primary" />
              </Button>
            </div>
          ) : (
            <span className="text-sm font-bold text-white truncate leading-tight">
              {project.name}
            </span>
          )}
          <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(project.lastModified, { addSuffix: true })}
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {project.components?.length || 0} components
            </span>
          </div>
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
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-panel border-border text-foreground">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete Project</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Are you sure you want to delete "{project.name}"? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-border text-foreground hover:bg-hover">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Separator orientation="vertical" className="h-6 mx-1 bg-border" />
        <Button
          size="sm"
          variant="secondary"
          className="h-8 font-bold bg-secondary text-foreground hover:bg-hover"
          onClick={onOpen}
        >
          Open
        </Button>
      </div>
    </div>
  );
}
