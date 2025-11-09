"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps, NodeResizer } from "reactflow"
import { Card } from "@/components/ui/card"
import { Database, Eye, Ear, Calculator, GitBranch, FileText, ImageIcon, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const iconMap: Record<string, any> = {
  loader_text: Database,
  loader_json: Database,
  loader_image: Database,
  recognition_seeing: Eye,
  recognition_hearing: Ear,
  math: Calculator,
  decider: GitBranch,
  text: FileText,
  image: ImageIcon,
  saver_text: Save,
  saver_image: Save,
  saver_table: Save,
  saver_json: Save,
}

export const CubeNode = memo(({ data, selected }: NodeProps) => {
  const Icon = iconMap[data.cubeType] || Database
  const isDecider = data.cubeType === "decider"

  const cubeColor = data.color || "#3b82f6"
  const borderColor = selected ? cubeColor : ""

  return (
    <>
      <NodeResizer
        color={cubeColor}
        isVisible={selected}
        minWidth={180}
        minHeight={80}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: "50%",
        }}
      />

      <Card
        className={`min-w-[180px] transition-all ${
          selected ? "ring-2" : ""
        } ${data.status === "running" ? "ring-2 ring-blue-500" : ""} ${
          data.status === "completed" ? "ring-2 ring-green-500" : ""
        } ${data.status === "failed" ? "ring-2 ring-red-500" : ""}`}
        style={{
          borderColor: borderColor,
          borderWidth: selected ? 2 : 1,
        }}
      >
        <Handle type="target" position={Position.Top} className="w-3 h-3" />

        {data.executionOrder !== undefined && (
          <Badge
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: cubeColor }}
          >
            {data.executionOrder}
          </Badge>
        )}

        <div className="p-3" style={{ borderLeftColor: cubeColor, borderLeftWidth: 4 }}>
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4" style={{ color: cubeColor }} />
            <div className="font-medium text-sm">{data.label}</div>
          </div>
          {data.status && <div className="text-xs text-muted-foreground capitalize">{data.status}</div>}
        </div>

        {isDecider ? (
          <>
            <Handle
              type="source"
              position={Position.Bottom}
              id="true"
              className="w-3 h-3 bg-green-500"
              style={{ left: "33%" }}
            />
            <div
              className="absolute bottom-0 left-[33%] transform -translate-x-1/2 translate-y-full text-xs font-medium text-green-600"
              style={{ paddingTop: 4 }}
            >
              TRUE
            </div>
            <Handle
              type="source"
              position={Position.Bottom}
              id="false"
              className="w-3 h-3 bg-red-500"
              style={{ left: "67%" }}
            />
            <div
              className="absolute bottom-0 left-[67%] transform -translate-x-1/2 translate-y-full text-xs font-medium text-red-600"
              style={{ paddingTop: 4 }}
            >
              FALSE
            </div>
          </>
        ) : (
          <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
        )}
      </Card>
    </>
  )
})

CubeNode.displayName = "CubeNode"
