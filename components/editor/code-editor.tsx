'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEditorStore } from '@/lib/editor-store'

export function CodeEditor() {
  const code = useEditorStore((state) => state.code)
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!code) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  const lineCount = useMemo(() => code.split('\n').length, [code])

  return (
    <div className="flex h-full flex-col border-t border-border bg-panel">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold text-foreground">Code</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleCopy}
          disabled={!code}
        >
          {copied ? (
            <Check className="h-3 w-3 text-accent" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <pre className="min-h-full whitespace-pre-wrap break-all p-3 font-mono text-[11px] leading-5 text-muted-foreground">
          {code || 'No components yet'}
        </pre>
      </ScrollArea>

      <div className="flex shrink-0 items-center justify-between border-t border-border px-3 py-1">
        <span className="text-[10px] text-muted-foreground">{lineCount} lines</span>
        <span className="text-[10px] text-muted-foreground">.ui</span>
      </div>
    </div>
  )
}
