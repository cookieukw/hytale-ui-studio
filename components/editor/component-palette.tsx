'use client'

import React from "react"

import { useState, memo } from 'react'
import {
  Search,
  Square,
  ScrollText,
  TextCursor,
  Hash,
  MousePointerClick,
  Type,
  Text,
  ImageIcon,
  Gauge,
  Layout,
  MessageSquare,
  FormInput,
  Loader,
  LayoutList,
  BarChart3,
  Bell,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getComponentsByCategory } from '@/lib/component-definitions'
import type { ComponentDefinition } from '@/lib/hytale-types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Square,
  ScrollText,
  TextCursor,
  Hash,
  MousePointerClick,
  Type,
  Text,
  ImageIcon,
  Gauge,
  Layout,
  MessageSquare,
  FormInput,
  Loader,
  LayoutList,
  BarChart3,
  Bell,
  Search,
}

interface CategorySectionProps {
  title: string
  items: ComponentDefinition[]
  expanded: boolean
  onToggle: () => void
}

const CategorySection = memo(function CategorySection({
  title,
  items,
  expanded,
  onToggle,
}: CategorySectionProps) {
  const handleDragStart = (e: React.DragEvent, item: ComponentDefinition) => {
    e.dataTransfer.setData('componentType', item.type)
    e.dataTransfer.setData('isPreset', 'false')
  }

  return (
    <div className="border-b border-border">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hover:bg-hover"
        onClick={onToggle}
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {title}
      </button>
      {expanded && (
        <div className="grid grid-cols-2 gap-1 px-2 pb-2">
          {items.map((item) => {
            const Icon = iconMap[item.icon] || Square
            return (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                className="flex cursor-grab items-center gap-2 rounded-md border border-transparent bg-secondary/50 px-2 py-2 text-left text-xs text-foreground transition-colors hover:border-border hover:bg-secondary active:cursor-grabbing"
              >
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{item.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})

export function ComponentPalette() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Layout: true,
    Input: true,
    Display: true,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const filterItems = (items: ComponentDefinition[]): ComponentDefinition[] => {
    if (!searchQuery) return items
    return items.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const layoutComponents = filterItems(getComponentsByCategory('Layout'))
  const inputComponents = filterItems(getComponentsByCategory('Input'))
  const displayComponents = filterItems(getComponentsByCategory('Display'))

  return (
    <div className="flex h-full flex-col border-r border-border bg-panel">
      <div className="shrink-0 border-b border-border p-2">
        <h3 className="mb-2 px-1 text-xs font-semibold text-foreground">Components</h3>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-8 text-xs"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div>
          <CategorySection
            title="Layout"
            items={layoutComponents}
            expanded={expandedSections.Layout}
            onToggle={() => toggleSection('Layout')}
          />
          <CategorySection
            title="Input"
            items={inputComponents}
            expanded={expandedSections.Input}
            onToggle={() => toggleSection('Input')}
          />
          <CategorySection
            title="Display"
            items={displayComponents}
            expanded={expandedSections.Display}
            onToggle={() => toggleSection('Display')}
          />
        </div>
      </ScrollArea>
    </div>
  )
}
