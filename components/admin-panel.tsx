"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, LogOut, Database, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface AdminPanelProps {
  onLogout: () => void
  onBack: () => void
}

export default function AdminPanel({ onLogout, onBack }: AdminPanelProps) {
  const [ollamaStatus, setOllamaStatus] = useState<"online" | "offline" | "checking">("checking")
  const [lastChecked, setLastChecked] = useState<string>("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const checkOllamaStatus = async () => {
    setIsRefreshing(true)
    setOllamaStatus("checking")

    try {
      const response = await fetch("/api/ollama-status", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })

      if (response.ok) {
        const data = await response.json()
        setOllamaStatus(data.status === "online" ? "online" : "offline")
      } else {
        setOllamaStatus("offline")
      }
    } catch (error) {
      console.error("Error checking Ollama status:", error)
      setOllamaStatus("offline")
    }

    setLastChecked(new Date().toLocaleTimeString())
    setIsRefreshing(false)
  }

  useEffect(() => {
    checkOllamaStatus()

    // Set up interval to check status every 30 seconds
    const interval = setInterval(() => {
      checkOllamaStatus()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (status: "online" | "offline" | "checking") => {
    if (status === "online") {
      return <Badge className="bg-green-500">Online</Badge>
    } else if (status === "offline") {
      return <Badge className="bg-red-500">Offline</Badge>
    } else {
      return <Badge className="bg-yellow-500">Checking...</Badge>
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Admin Panel</h1>
        </div>
        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </header>

      <main className="flex-1 p-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">System Status</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Last checked: {lastChecked}</span>
              <Button variant="outline" size="sm" onClick={checkOllamaStatus} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-6">
            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <Database className="mr-2 h-5 w-5" />
                      Ollama LLM
                    </CardTitle>
                    {getStatusBadge(ollamaStatus)}
                  </div>
                  <CardDescription>Status of the Ollama language model service</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Connection</span>
                      {ollamaStatus === "online" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : ollamaStatus === "offline" ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <RefreshCw className="h-5 w-5 animate-spin text-yellow-500" />
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Model Availability</span>
                      {ollamaStatus === "online" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : ollamaStatus === "offline" ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <RefreshCw className="h-5 w-5 animate-spin text-yellow-500" />
                      )}
                    </div>
                    {ollamaStatus === "online" && (
                      <div className="mt-4 p-3 bg-muted rounded-md">
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">Model:</span>
                            <span>llama2:3.2</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">API Endpoint:</span>
                            <span className="text-xs">http://localhost:11434/api</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Tabs defaultValue="setup">
            <TabsList className="mb-4">
              <TabsTrigger value="setup">Setup Instructions</TabsTrigger>
              <TabsTrigger value="logs">System Logs</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
            </TabsList>

            <TabsContent value="setup">
              <Card>
                <CardHeader>
                  <CardTitle>Ollama Setup Instructions</CardTitle>
                  <CardDescription>Follow these steps to set up Ollama LLM</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">1. Install Ollama</h3>
                    <div className="bg-muted p-3 rounded-md overflow-x-auto">
                      <code className="text-sm">
                        # For macOS/Linux
                        <br />
                        curl -fsSL https://ollama.com/install.sh | sh
                        <br />
                        <br /># For Windows, download from https://ollama.com/download
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      After installation, Ollama will be available at http://localhost:11434
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">2. Pull the LLM model</h3>
                    <div className="bg-muted p-3 rounded-md overflow-x-auto">
                      <code className="text-sm">
                        # Pull the llama2:3.2 model
                        <br />
                        ollama pull llama2:3.2
                      </code>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">3. Start using the chat</h3>
                    <p className="text-sm text-muted-foreground">
                      Once Ollama is running and the model is downloaded, you can start using the chat interface. The
                      application will automatically connect to Ollama.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle>System Logs</CardTitle>
                  <CardDescription>Recent system events and errors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Logs will appear here when available...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration</CardTitle>
                  <CardDescription>System settings and configuration options</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Configuration options will appear here...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}

