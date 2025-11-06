"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useExecution(executionId?: string) {
  const {
    data: execution,
    error,
    isLoading,
  } = useSWR(
    executionId ? `/api/executions/${executionId}` : null,
    fetcher,
    { refreshInterval: 1000 }, // Poll every second for updates
  )

  return {
    execution,
    isLoading,
    error,
  }
}

export function useExecutionLogs(executionId: string) {
  const [logs, setLogs] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!executionId) return

    // Use Server-Sent Events for real-time logs
    const eventSource = new EventSource(`/api/executions/${executionId}/logs`)

    eventSource.onopen = () => {
      setIsConnected(true)
    }

    eventSource.onmessage = (event) => {
      const logEntry = JSON.parse(event.data)
      setLogs((prev) => [...prev, logEntry.message])
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      eventSource.close()
    }

    return () => {
      eventSource.close()
      setIsConnected(false)
    }
  }, [executionId])

  return { logs, isConnected }
}
