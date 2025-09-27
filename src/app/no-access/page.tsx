export default function NoAccessPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">Access restricted</h1>
        <p className="text-muted-foreground">
          Your account is authenticated, but you don't have access to this application.
          Please contact your administrator to be added as a user.
        </p>
      </div>
    </div>
  )
}
