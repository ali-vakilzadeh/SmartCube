"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function DeleteWorkflowButton({ workflowId }: { workflowId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this workflow?")) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/workflows/${workflowId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete workflow")

      toast({ title: "Workflow deleted successfully" })
      router.refresh()
    } catch (error) {
      toast({
        title: "Failed to delete workflow",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button variant="destructive" size="icon" onClick={handleDelete} disabled={isDeleting}>
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
