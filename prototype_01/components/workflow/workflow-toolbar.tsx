"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Square, Save } from "lucide-react"

interface WorkflowToolbarProps {
  workflowName: string
  onNameChange: (name: string) => void
  onSave: () => void
  onExecute: () => void
  onStop: () => void
  isExecuting: boolean
  isSaving: boolean
}

export function WorkflowToolbar({
  workflowName,
  onNameChange,
  onSave,
  onExecute,
  onStop,
  isExecuting,
  isSaving,
}: WorkflowToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-4">
        <Input
          value={workflowName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Workflow name"
          className="w-64"
        />
        <Button onClick={onSave} disabled={isSaving} variant="outline" size="sm">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {isExecuting ? (
          <Button onClick={onStop} variant="destructive" size="sm">
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        ) : (
          <Button onClick={onExecute} size="sm">
            <Play className="w-4 h-4 mr-2" />
            Execute
          </Button>
        )}
      </div>
    </div>
  )
}
