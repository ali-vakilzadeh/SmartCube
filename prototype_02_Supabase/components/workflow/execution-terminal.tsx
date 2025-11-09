"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Terminal } from "lucide-react"

interface ExecutionTerminalProps {
  logs: string[]
  isConnected: boolean
}

export function ExecutionTerminal({ logs, isConnected }: ExecutionTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <Card className="h-full border-t rounded-none">
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <h3 className="font-semibold text-sm">Execution Terminal</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`} />
          <span className="text-xs text-muted-foreground">{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>
      <ScrollArea className="h-[200px]" ref={scrollRef}>
        <div className="p-3 font-mono text-xs space-y-1">
          {logs.length === 0 ? (
            <div className="text-muted-foreground">No logs yet. Start execution to see logs.</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="text-foreground">
                {log}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
