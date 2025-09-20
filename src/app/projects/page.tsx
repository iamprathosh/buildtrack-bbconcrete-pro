import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ProjectsView } from '@/components/projects/ProjectsView'

export default function ProjectsPage() {
  return (
    <DashboardLayout title="Projects" subtitle="Manage construction projects and track progress">
      <ProjectsView />
    </DashboardLayout>
  )
}