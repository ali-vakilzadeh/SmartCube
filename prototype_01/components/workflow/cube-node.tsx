"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Card } from "@/components/ui/card"
import { Database, Eye, Ear, Calculator, GitBranch, FileText, ImageIcon, Save } from "lucide-react"

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

  return (
    <Card
      className={`min-w-[180px] ${
        selected ? "ring-2 ring-primary" : ""
      } ${data.status === "running" ? "ring-2 ring-blue-500" : ""} ${
        data.status === "completed" ? "ring-2 ring-green-500" : ""
      } ${data.status === "failed" ? "ring-2 ring-red-500" : ""}`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-primary" />
          <div className="font-medium text-sm">{data.label}</div>
        </div>
        {data.status && <div className="text-xs text-muted-foreground capitalize">{data.status}</div>}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  )
})

CubeNode.displayName = "CubeNode"
