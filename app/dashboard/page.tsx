import { Suspense } from "react"
import Dashboard from "@/components/dashboard"
import LoadingDashboard from "@/components/loading-dashboard"
import { ThemeProvider } from "@/components/theme-provider"

export default function DashboardPage() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="femcare-theme">
      <main className="min-h-screen bg-background">
        <Suspense fallback={<LoadingDashboard />}>
          <Dashboard />
        </Suspense>
      </main>
    </ThemeProvider>
  )
}

