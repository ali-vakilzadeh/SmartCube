"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWorkflow } from "@/lib/hooks/use-workflow"
import { Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { workflows, deleteWorkflow } = useWorkflow()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workflow?")) return

    try {
      await deleteWorkflow(id)
      toast({ title: "Workflow deleted successfully" })
    } catch (error) {
      toast({ title: "Failed to delete workflow", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Workflows</h1>
            <p className="text-muted-foreground">Manage and execute your SmartCube workflows</p>
          </div>
          <Link href="/editor">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Workflow
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows?.map((workflow: any) => (
            <Card key={workflow._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{workflow.name}</CardTitle>
                <CardDescription>
                  {workflow.nodes?.length || 0} cubes • Created {new Date(workflow.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Link href={`/editor?id=${workflow._id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Edit
                    </Button>
                  </Link>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(workflow._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {workflows?.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No workflows yet. Create your first one!</p>
              <Link href="/editor">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workflow
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
