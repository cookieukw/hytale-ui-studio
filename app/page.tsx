'use client'

import { EditorToolbar } from '@/components/editor/toolbar'
import { ComponentPalette } from '@/components/editor/component-palette'
import { ComponentTree } from '@/components/editor/component-tree'
import { EditorCanvas } from '@/components/editor/canvas'
import { Inspector } from '@/components/editor/inspector'
import { CodeEditor } from '@/components/editor/code-editor'
import { useEditorStore } from '@/lib/editor-store'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

export default function HytaleUIStudio() {
  const viewMode = useEditorStore((state) => state.viewMode)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Toolbar */}
      <EditorToolbar />

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - Palette & Tree */}
        <ResizablePanel
          defaultSize={18}
          minSize={12}
          maxSize={25}
          collapsible
          collapsedSize={0}
        >
          <ResizablePanelGroup direction="vertical" className="h-full">
            <ResizablePanel defaultSize={45} minSize={25}>
              <ComponentPalette />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30} minSize={20}>
              <ComponentTree />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25} minSize={15}>
              <CodeEditor />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center - Canvas */}
        <ResizablePanel defaultSize={62} minSize={40}>
          {viewMode === 'Split' ? (
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={65} minSize={30}>
                <EditorCanvas />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={35} minSize={20}>
                <CodeEditor />
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <EditorCanvas />
          )}
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Inspector */}
        <ResizablePanel
          defaultSize={20}
          minSize={15}
          maxSize={30}
          collapsible
          collapsedSize={0}
        >
          <Inspector />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
