"use client"

import { useCallback } from "react"
import useSWR, { mutate } from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useWorkflow(workflowId?: string) {
  const { data: workflow, error, isLoading } = useSWR(workflowId ? `/api/workflows/${workflowId}` : null, fetcher)

  const { data: workflows } = useSWR("/api/workflows", fetcher)

  const createWorkflow = useCallback(async (data: any) => {
    const res = await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create workflow")
    const newWorkflow = await res.json()
    mutate("/api/workflows")
    return newWorkflow
  }, [])

  const updateWorkflow = useCallback(async (id: string, data: any) => {
    const res = await fetch(`/api/workflows/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to update workflow")
    const updated = await res.json()
    mutate(`/api/workflows/${id}`)
    mutate("/api/workflows")
    return updated
  }, [])

  const deleteWorkflow = useCallback(async (id: string) => {
    const res = await fetch(`/api/workflows/${id}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete workflow")
    mutate("/api/workflows")
  }, [])

  const executeWorkflow = useCallback(async (id: string, inputs?: any) => {
    const res = await fetch(`/api/workflows/${id}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs }),
    })
    if (!res.ok) throw new Error("Failed to execute workflow")
    return await res.json()
  }, [])

  return {
    workflow,
    workflows,
    isLoading,
    error,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
  }
}
