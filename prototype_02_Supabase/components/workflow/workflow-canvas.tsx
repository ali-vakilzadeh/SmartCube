"use client"

import type React from "react"
import { useCallback, useRef, useState } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  ReactFlowProvider,
  MarkerType,
  type OnSelectionChangeParams,
} from "reactflow"
import "reactflow/dist/style.css"
import { CubeNode } from "./cube-node"
import { CubeEditSidebar } from "./cube-edit-sidebar"

const nodeTypes = {
  cube: CubeNode,
}

const defaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
  },
  style: {
    strokeWidth: 2,
  },
}

interface WorkflowCanvasProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  onNodesChange?: (nodes: Node[]) => void
  onEdgesChange?: (edges: Edge[]) => void
  showSchedule?: boolean
}

function WorkflowCanvasInner({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  showSchedule = false,
}: WorkflowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const calculateExecutionOrder = useCallback((): Map<string, number> => {
    const orderMap = new Map<string, number>()
    const visited = new Set<string>()
    const visiting = new Set<string>()
    let order = 1

    const getIncomingEdges = (nodeId: string) => edges.filter((e) => e.target === nodeId)

    const visit = (nodeId: string): boolean => {
      if (visited.has(nodeId)) return true
      if (visiting.has(nodeId)) return false // Cycle detected

      visiting.add(nodeId)

      const incoming = getIncomingEdges(nodeId)
      for (const edge of incoming) {
        if (!visit(edge.source)) return false
      }

      visiting.delete(nodeId)
      visited.add(nodeId)
      orderMap.set(nodeId, order++)
      return true
    }

    // Start with nodes that have no incoming edges
    const startNodes = nodes.filter((node) => getIncomingEdges(node.id).length === 0)
    startNodes.forEach((node) => visit(node.id))

    // Visit remaining nodes
    nodes.forEach((node) => {
      if (!visited.has(node.id)) {
        visit(node.id)
      }
    })

    return orderMap
  }, [nodes, edges])

  const nodesWithOrder = showSchedule
    ? nodes.map((node) => {
        const orderMap = calculateExecutionOrder()
        return {
          ...node,
          data: {
            ...node.data,
            executionOrder: orderMap.get(node.id),
          },
        }
      })
    : nodes

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(
        {
          ...params,
          ...defaultEdgeOptions,
          animated: true,
        },
        edges,
      )
      setEdges(newEdges)
      onEdgesChange?.(newEdges)
    },
    [edges, setEdges, onEdgesChange],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData("application/reactflow")
      if (!type || !reactFlowInstance) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: "cube",
        position,
        data: {
          label: type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          cubeType: type,
          config: {},
          color: "#3b82f6",
        },
      }

      const newNodes = [...nodes, newNode]
      setNodes(newNodes)
      onNodesChange?.(newNodes)
    },
    [reactFlowInstance, nodes, setNodes, onNodesChange],
  )

  const handleNodesChangeWrapper = useCallback(
    (changes: any) => {
      handleNodesChange(changes)
      onNodesChange?.(nodes)
    },
    [handleNodesChange, nodes, onNodesChange],
  )

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    if (params.nodes.length === 1) {
      setSelectedNode(params.nodes[0])
    } else {
      setSelectedNode(null)
    }
  }, [])

  const handleUpdateNode = useCallback(
    (id: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return { ...node, data }
          }
          return node
        }),
      )
      onNodesChange?.(nodes)
    },
    [nodes, setNodes, onNodesChange],
  )

  const handleDeleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== id))
      setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
      setSelectedNode(null)
      onNodesChange?.(nodes)
      onEdgesChange?.(edges)
    },
    [nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange],
  )

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      onEdgesChange?.(edges.filter((edge) => !deleted.find((d) => d.id === edge.id)))
    },
    [edges, onEdgesChange],
  )

  return (
    <div className="flex w-full h-full">
      <div ref={reactFlowWrapper} className="flex-1">
        <ReactFlow
          nodes={nodesWithOrder}
          edges={edges}
          onNodesChange={handleNodesChangeWrapper}
          onEdgesChange={handleEdgesChange}
          onEdgesDelete={onEdgesDelete}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          deleteKeyCode={["Backspace", "Delete"]}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {selectedNode && (
        <CubeEditSidebar
          selectedNode={selectedNode}
          onUpdate={handleUpdateNode}
          onDelete={handleDeleteNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  )
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
