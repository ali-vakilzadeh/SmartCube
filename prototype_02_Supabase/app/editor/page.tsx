"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CubePalette } from "@/components/workflow/cube-palette"
import { WorkflowCanvas } from "@/components/workflow/workflow-canvas"
import { ExecutionTerminal } from "@/components/workflow/execution-terminal"
import { WorkflowToolbar } from "@/components/workflow/workflow-toolbar"
import { useWorkflow } from "@/lib/hooks/use-workflow"
import { useExecutionLogs } from "@/lib/hooks/use-execution"
import type { Node, Edge } from "reactflow"
import { useToast } from "@/hooks/use-toast"

export default function EditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workflowId = searchParams.get("id")
  const { toast } = useToast()

  const { workflow, createWorkflow, updateWorkflow, executeWorkflow } = useWorkflow(workflowId || undefined)

  const [workflowName, setWorkflowName] = useState("Untitled Workflow")
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)

  const { logs, isConnected } = useExecutionLogs(currentExecutionId || "")

  useEffect(() => {
    if (workflow) {
      setWorkflowName(workflow.name)
      setNodes(workflow.nodes || [])
      setEdges(workflow.edges || [])
    }
  }, [workflow])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      const workflowData = {
        name: workflowName,
        nodes,
        edges,
      }

      if (workflowId) {
        await updateWorkflow(workflowId, workflowData)
        toast({ title: "Workflow saved successfully" })
      } else {
        const newWorkflow = await createWorkflow(workflowData)
        router.push(`/editor?id=${newWorkflow._id}`)
        toast({ title: "Workflow created successfully" })
      }
    } catch (error) {
      toast({ title: "Failed to save workflow", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }, [workflowName, nodes, edges, workflowId, createWorkflow, updateWorkflow, router, toast])

  const handleExecute = useCallback(async () => {
    if (!workflowId) {
      toast({ title: "Please save the workflow first", variant: "destructive" })
      return
    }

    setIsExecuting(true)
    try {
      const result = await executeWorkflow(workflowId)
      setCurrentExecutionId(result.executionId)
      toast({ title: "Workflow execution started" })
    } catch (error) {
      toast({ title: "Failed to execute workflow", variant: "destructive" })
      setIsExecuting(false)
    }
  }, [workflowId, executeWorkflow, toast])

  const handleStop = useCallback(() => {
    setIsExecuting(false)
    setCurrentExecutionId(null)
    toast({ title: "Execution stopped" })
  }, [toast])

  const handleSchedule = useCallback(() => {
    setShowSchedule((prev) => !prev)
    toast({
      title: showSchedule ? "Schedule hidden" : "Showing execution order",
      description: showSchedule ? "" : "Numbers indicate the order cubes will execute",
    })
  }, [showSchedule, toast])

  return (
    <div className="h-screen flex flex-col">
      <WorkflowToolbar
        workflowName={workflowName}
        onNameChange={setWorkflowName}
        onSave={handleSave}
        onExecute={handleExecute}
        onStop={handleStop}
        isExecuting={isExecuting}
        isSaving={isSaving}
        onSchedule={handleSchedule}
        showSchedule={showSchedule}
      />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 flex-shrink-0">
          <CubePalette />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <WorkflowCanvas
              initialNodes={nodes}
              initialEdges={edges}
              onNodesChange={setNodes}
              onEdgesChange={setEdges}
              showSchedule={showSchedule}
            />
          </div>
          <div className="h-[240px]">
            <ExecutionTerminal logs={logs} isConnected={isConnected} />
          </div>
        </div>
      </div>
    </div>
  )
}
