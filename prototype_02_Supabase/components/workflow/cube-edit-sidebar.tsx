"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, X, Upload, LinkIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CubeEditSidebarProps {
  selectedNode: any
  onUpdate: (id: string, data: any) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function CubeEditSidebar({ selectedNode, onUpdate, onDelete, onClose }: CubeEditSidebarProps) {
  const [name, setName] = useState("")
  const [prompt, setPrompt] = useState("")
  const [color, setColor] = useState("#3b82f6")
  const [fileSource, setFileSource] = useState<"url" | "local">("url")
  const [fileUrl, setFileUrl] = useState("")
  const [fileName, setFileName] = useState("")

  useEffect(() => {
    if (selectedNode) {
      setName(selectedNode.data.label || "")
      setPrompt(selectedNode.data.config?.prompt || "")
      setColor(selectedNode.data.color || "#3b82f6")
      setFileSource(selectedNode.data.config?.fileSource || "url")
      setFileUrl(selectedNode.data.config?.fileUrl || "")
      setFileName(selectedNode.data.config?.fileName || "")
    }
  }, [selectedNode])

  if (!selectedNode) return null

  const cubeType = selectedNode.data.cubeType
  const isLoaderCube = cubeType?.startsWith("loader")
  const isSaverCube = cubeType?.startsWith("saver")
  const isDeciderCube = cubeType === "decider"
  const isAICube = ["text", "image", "recognition_seeing", "recognition_hearing"].includes(cubeType)

  const handleSave = () => {
    onUpdate(selectedNode.id, {
      ...selectedNode.data,
      label: name,
      color,
      config: {
        ...selectedNode.data.config,
        prompt,
        ...(isLoaderCube || isSaverCube
          ? {
              fileSource,
              fileUrl,
              fileName,
            }
          : {}),
      },
    })
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this cube?")) {
      onDelete(selectedNode.id)
      onClose()
    }
  }

  const handleFileSelect = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0]
      if (file) {
        setFileName(file.name)
        setFileSource("local")
      }
    }
    input.click()
  }

  return (
    <Card className="w-80 h-full border-l rounded-none flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Edit Cube</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="cube-name">Cube Name</Label>
            <Input
              id="cube-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter cube name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="cube-color">Cube Color</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="cube-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#3b82f6" />
            </div>
          </div>

          {(isAICube || isDeciderCube) && (
            <div>
              <Label htmlFor="ai-prompt">{isDeciderCube ? "Decision Prompt" : "AI Prompt"}</Label>
              <Textarea
                id="ai-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  isDeciderCube
                    ? "Enter the decision criteria (e.g., 'Is the value greater than 100?')"
                    : "Enter AI prompt or instructions"
                }
                className="mt-1 min-h-[120px]"
              />
              {isDeciderCube && (
                <p className="text-xs text-muted-foreground mt-1">
                  This prompt determines the true/false decision path in your workflow.
                </p>
              )}
            </div>
          )}

          {(isLoaderCube || isSaverCube) && (
            <div className="space-y-3">
              <Label>{isLoaderCube ? "Load From" : "Save To"}</Label>
              <Tabs value={fileSource} onValueChange={(v) => setFileSource(v as "url" | "local")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">URL</TabsTrigger>
                  <TabsTrigger value="local">Local File</TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-2">
                  <Input
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://example.com/data.json"
                    className="w-full"
                  />
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Test Connection
                  </Button>
                </TabsContent>

                <TabsContent value="local" className="space-y-2">
                  <div className="border rounded-md p-3 text-sm text-muted-foreground">
                    {fileName || "No file selected"}
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={handleFileSelect}>
                    <Upload className="w-4 h-4 mr-2" />
                    {isLoaderCube ? "Select File" : "Choose Save Location"}
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>
              <strong>Type:</strong> {selectedNode.data.cubeType}
            </p>
            <p>
              <strong>ID:</strong> {selectedNode.id}
            </p>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t space-y-2">
        <Button onClick={handleSave} className="w-full">
          Save Changes
        </Button>
        <Button onClick={handleDelete} variant="destructive" className="w-full">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Cube
        </Button>
      </div>
    </Card>
  )
}
