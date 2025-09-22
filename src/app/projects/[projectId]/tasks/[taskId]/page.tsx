import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ProjectTaskDetailPage({ params }: { params: { projectId: string, taskId: string } }) {
  const { projectId, taskId } = params
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Project Task</h1>
      <p className="text-sm text-muted-foreground">Project ID: {projectId}</p>
      <p className="text-sm text-muted-foreground">Task ID: {taskId}</p>
      <div>
        <Button asChild variant="outline">
          <Link href={`/projects/${projectId}`}>Back to Project</Link>
        </Button>
      </div>
    </div>
  )
}
