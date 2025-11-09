"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Database, Eye, Calculator, FileText, Save } from "lucide-react"

const cubeTypes = [
  {
    category: "Loaders",
    icon: Database,
    cubes: [
      { type: "loader_text", label: "Text Loader", description: "Load text data" },
      { type: "loader_json", label: "JSON Loader", description: "Load JSON data" },
      { type: "loader_image", label: "Image Loader", description: "Load image data" },
    ],
  },
  {
    category: "Recognition",
    icon: Eye,
    cubes: [
      { type: "recognition_seeing", label: "Seeing", description: "OCR and image analysis" },
      { type: "recognition_hearing", label: "Hearing", description: "Speech to text" },
    ],
  },
  {
    category: "Processing",
    icon: Calculator,
    cubes: [
      { type: "math", label: "Math", description: "Mathematical operations" },
      { type: "decider", label: "Decider", description: "Conditional branching" },
    ],
  },
  {
    category: "Generation",
    icon: FileText,
    cubes: [
      { type: "text", label: "Text AI", description: "Generate text with AI" },
      { type: "image", label: "Image AI", description: "Generate images with AI" },
    ],
  },
  {
    category: "Savers",
    icon: Save,
    cubes: [
      { type: "saver_text", label: "Text Saver", description: "Save text output" },
      { type: "saver_image", label: "Image Saver", description: "Save image output" },
      { type: "saver_table", label: "Table Saver", description: "Save table as CSV" },
      { type: "saver_json", label: "JSON Saver", description: "Save JSON output" },
    ],
  },
]

export function CubePalette() {
  const onDragStart = (event: React.DragEvent, cubeType: string) => {
    event.dataTransfer.setData("application/reactflow", cubeType)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <Card className="h-full border-r rounded-none">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Cube Palette</h2>
        <p className="text-sm text-muted-foreground">Drag cubes to canvas</p>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-4 space-y-6">
          {cubeTypes.map((category) => (
            <div key={category.category}>
              <div className="flex items-center gap-2 mb-3">
                <category.icon className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">{category.category}</h3>
              </div>
              <div className="space-y-2">
                {category.cubes.map((cube) => (
                  <div
                    key={cube.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, cube.type)}
                    className="p-3 border rounded-lg cursor-move hover:bg-accent hover:border-primary transition-colors"
                  >
                    <div className="font-medium text-sm">{cube.label}</div>
                    <div className="text-xs text-muted-foreground">{cube.description}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
