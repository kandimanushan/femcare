import { Suspense } from "react"
import LandingPage from "@/components/landing-page"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="femcare-theme">
      <main className="min-h-screen bg-background">
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
          <LandingPage />
        </Suspense>
      </main>
    </ThemeProvider>
  )
}

