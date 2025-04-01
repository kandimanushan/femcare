import { Loader2 } from "lucide-react"

export default function LoadingDashboard() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-xl text-muted-foreground">Loading your healthcare dashboard...</p>
    </div>
  )
}

