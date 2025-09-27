import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { RecentActivityTable } from '@/components/dashboard/RecentActivityTable'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <>
      <SignedOut>
        <div className="min-h-screen p-8 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">BuildTrack</CardTitle>
              <CardDescription>
                Construction Inventory Management for B&B Concrete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sign in to access your dashboard
                </p>
                <SignInButton mode="modal">
                  <Button className="w-full">Log In</Button>
                </SignInButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </SignedOut>
      
      <SignedIn>
        <DashboardLayout title="Dashboard">
          <div className="space-y-6">
            {/* Stats Overview */}
            <StatsOverview />
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <RecentActivityTable />
              </div>
              <div>
                <QuickActions />
              </div>
            </div>
          </div>
        </DashboardLayout>
      </SignedIn>
    </>
  );
}
