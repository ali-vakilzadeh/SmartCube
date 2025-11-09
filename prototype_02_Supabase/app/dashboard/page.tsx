import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { WorkflowService } from "@/lib/services/workflow-service"
import { DeleteWorkflowButton } from "@/components/delete-workflow-button"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  const workflowService = WorkflowService.getInstance()
  const workflows = await workflowService.getUserWorkflows(user.id)

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
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{workflow.name}</CardTitle>
                <CardDescription>
                  {workflow.cubes?.length || 0} cubes • Created {new Date(workflow.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Link href={`/editor?id=${workflow.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <DeleteWorkflowButton workflowId={workflow.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {workflows.length === 0 && (
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
