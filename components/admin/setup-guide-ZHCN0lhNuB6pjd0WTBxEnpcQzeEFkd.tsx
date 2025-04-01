"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  CheckCircle2,
  AlertCircle,
  Terminal,
  Server,
  ArrowRight,
  Copy,
  ExternalLink,
  Download,
  CheckCheck,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

export default function SetupGuide() {
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const [ollamaStatus, setOllamaStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const [llamaStatus, setLlamaStatus] = useState<"checking" | "available" | "unavailable">("checking")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState("setup")
  const [pullProgress, setPullProgress] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const checkHealth = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("http://localhost:8000/health")

      if (response.ok) {
        setBackendStatus("connected")
        const data = await response.json()

        if (data.ollama === "connected") {
          setOllamaStatus("connected")
        } else {
          setOllamaStatus("disconnected")
        }

        if (data.llama3 === "available") {
          setLlamaStatus("available")
        } else {
          setLlamaStatus("unavailable")
          setMessage(data.message || "Llama 3 model not found")
        }
      } else {
        setBackendStatus("disconnected")
        setOllamaStatus("disconnected")
        setLlamaStatus("unavailable")
      }
    } catch (error) {
      setBackendStatus("disconnected")
      setOllamaStatus("disconnected")
      setLlamaStatus("unavailable")
      setMessage("Could not connect to the backend server")
    } finally {
      setIsLoading(false)
    }
  }

  const pullLlamaModel = async () => {
    setIsPulling(true)
    setPullProgress(0)
    setMessage("Starting to pull Llama 3 model. This may take a while...")

    try {
      const response = await fetch("http://localhost:8000/api/pull-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model_name: "llama3" }),
      })

      if (response.ok) {
        // Simulate progress since the actual API doesn't provide progress updates
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 10
          if (progress >= 100) {
            progress = 100
            clearInterval(interval)
            setMessage("Successfully pulled Llama 3 model!")
            checkHealth()
            setTimeout(() => setIsPulling(false), 1000)
          } else {
            setMessage(`Pulling Llama 3 model... ${Math.round(progress)}% complete`)
          }
          setPullProgress(progress)
        }, 1000)
      } else {
        setMessage("Failed to pull Llama 3 model")
        setTimeout(() => setIsPulling(false), 3000)
      }
    } catch (error) {
      setMessage("Could not connect to the backend server")
      setIsPulling(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Rupped AI Setup Guide</CardTitle>
            <CardDescription>
              Follow these steps to set up the Ollama backend with Llama 3 for AI negotiation
            </CardDescription>
          </div>
          <Badge variant={backendStatus === "connected" ? "default" : "destructive"} className="bg-amber-600">
            {backendStatus === "connected" ? "Backend Online" : "Backend Offline"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup Instructions</TabsTrigger>
            <TabsTrigger value="status">System Status</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6 mt-6">
            <Alert className="bg-amber-50 border-amber-200">
              <Terminal className="h-4 w-4 text-amber-600" />
              <AlertTitle>Prerequisites</AlertTitle>
              <AlertDescription>
                Before you begin, make sure you have Python 3.9+ and pip installed on your system.
              </AlertDescription>
            </Alert>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="step1">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <div className="bg-amber-100 p-2 rounded-full mr-3">
                      <Terminal className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">1. Install Ollama</h3>
                      <p className="text-sm text-gray-600">First, install Ollama on your system</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-14">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Ollama is a tool that lets you run large language models locally. Follow the instructions for your
                      operating system:
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">macOS / Linux</h4>
                        <div className="relative">
                          <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                            curl -fsSL https://ollama.ai/install.sh | sh
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard("curl -fsSL https://ollama.ai/install.sh | sh", "macos")}
                          >
                            {copied === "macos" ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Windows</h4>
                        <p className="text-sm text-gray-600 mb-2">Download the installer from the Ollama website:</p>
                        <Button variant="outline" className="flex items-center" asChild>
                          <a href="https://ollama.ai/download/windows" target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Download Ollama for Windows
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step2">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <div className="bg-amber-100 p-2 rounded-full mr-3">
                      <Server className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">2. Start Ollama</h3>
                      <p className="text-sm text-gray-600">Start the Ollama service on your system</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-14">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">Once installed, you need to start the Ollama service:</p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">macOS / Linux</h4>
                        <div className="relative">
                          <div className="bg-gray-100 p-3 rounded text-sm font-mono">ollama serve</div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard("ollama serve", "serve")}
                          >
                            {copied === "serve" ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Windows</h4>
                        <p className="text-sm text-gray-600">
                          On Windows, Ollama runs as a service automatically after installation. You can check if it's
                          running by looking for the Ollama icon in your system tray.
                        </p>
                      </div>

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Important</AlertTitle>
                        <AlertDescription>
                          Keep the Ollama service running in the background while using the Rupped AI negotiation
                          feature.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step3">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <div className="bg-amber-100 p-2 rounded-full mr-3">
                      <Download className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">3. Pull Llama 3 Model</h3>
                      <p className="text-sm text-gray-600">Download the Llama 3 model (this may take some time)</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-14">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Now you need to download the Llama 3 model. This is a large file (4-5GB) and may take some time
                      depending on your internet connection:
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Command Line</h4>
                        <div className="relative">
                          <div className="bg-gray-100 p-3 rounded text-sm font-mono">ollama pull llama3</div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard("ollama pull llama3", "pull")}
                          >
                            {copied === "pull" ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600">
                        Alternatively, you can use the button below to pull the model through our API:
                      </p>

                      {isPulling ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{message}</span>
                            <span>{Math.round(pullProgress)}%</span>
                          </div>
                          <Progress value={pullProgress} className="h-2" />
                        </div>
                      ) : (
                        <Button
                          onClick={pullLlamaModel}
                          disabled={isLoading || ollamaStatus !== "connected"}
                          className="bg-amber-600 hover:bg-amber-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Pull Llama 3 Model
                        </Button>
                      )}

                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertTitle>Note</AlertTitle>
                        <AlertDescription className="text-blue-700">
                          The model is approximately 4.7GB in size. Make sure you have enough disk space and a stable
                          internet connection.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step4">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <div className="bg-amber-100 p-2 rounded-full mr-3">
                      <Terminal className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">4. Install and Start the FastAPI Backend</h3>
                      <p className="text-sm text-gray-600">Set up the Python backend for the negotiation system</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-14">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      The FastAPI backend connects the Rupped website to the Ollama service. Follow these steps to set
                      it up:
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">1. Install Python Dependencies</h4>
                        <div className="relative">
                          <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                            pip install fastapi uvicorn httpx pydantic sse-starlette
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2"
                            onClick={() =>
                              copyToClipboard("pip install fastapi uvicorn httpx pydantic sse-starlette", "pip")
                            }
                          >
                            {copied === "pip" ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">2. Start the FastAPI Server</h4>
                        <div className="relative">
                          <div className="bg-gray-100 p-3 rounded text-sm font-mono">uvicorn server:app --reload</div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard("uvicorn server:app --reload", "uvicorn")}
                          >
                            {copied === "uvicorn" ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Important</AlertTitle>
                        <AlertDescription>
                          Make sure to run the server command from the directory where the server.py file is located.
                        </AlertDescription>
                      </Alert>

                      <p className="text-sm text-gray-600">
                        Once the server is running, you should see output similar to:
                      </p>
                      <div className="bg-black text-green-400 p-3 rounded text-sm font-mono">
                        INFO: Started server process [12345]
                        <br />
                        INFO: Waiting for application startup.
                        <br />
                        INFO: Application startup complete.
                        <br />
                        INFO: Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step5">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <div className="bg-amber-100 p-2 rounded-full mr-3">
                      <CheckCircle2 className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">5. Verify Setup</h3>
                      <p className="text-sm text-gray-600">Confirm that everything is working correctly</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-14">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">Let's verify that all components are working correctly:</p>

                    <div className="space-y-4">
                      <Button
                        onClick={checkHealth}
                        disabled={isLoading}
                        className="w-full bg-stone-800 hover:bg-stone-900"
                      >
                        {isLoading ? "Checking..." : "Check System Status"}
                      </Button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div
                          className={`p-4 rounded-lg border ${
                            backendStatus === "connected" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div className="flex items-center mb-2">
                            <Server
                              className={`h-5 w-5 mr-2 ${
                                backendStatus === "connected" ? "text-green-600" : "text-red-600"
                              }`}
                            />
                            <h4 className="font-medium">FastAPI Backend</h4>
                          </div>
                          <p className="text-sm">
                            {backendStatus === "connected"
                              ? "Connected and running"
                              : "Not connected. Please start the server."}
                          </p>
                        </div>

                        <div
                          className={`p-4 rounded-lg border ${
                            ollamaStatus === "connected" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div className="flex items-center mb-2">
                            <Server
                              className={`h-5 w-5 mr-2 ${
                                ollamaStatus === "connected" ? "text-green-600" : "text-red-600"
                              }`}
                            />
                            <h4 className="font-medium">Ollama Service</h4>
                          </div>
                          <p className="text-sm">
                            {ollamaStatus === "connected"
                              ? "Connected and running"
                              : "Not connected. Please start Ollama."}
                          </p>
                        </div>

                        <div
                          className={`p-4 rounded-lg border ${
                            llamaStatus === "available"
                              ? "bg-green-50 border-green-200"
                              : "bg-yellow-50 border-yellow-200"
                          }`}
                        >
                          <div className="flex items-center mb-2">
                            <ArrowRight
                              className={`h-5 w-5 mr-2 ${
                                llamaStatus === "available" ? "text-green-600" : "text-yellow-600"
                              }`}
                            />
                            <h4 className="font-medium">Llama 3 Model</h4>
                          </div>
                          <p className="text-sm">
                            {llamaStatus === "available"
                              ? "Model is available"
                              : "Model not found. Please pull the model."}
                          </p>
                        </div>
                      </div>

                      {message && (
                        <Alert variant={message.includes("success") ? "default" : "destructive"}>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Status</AlertTitle>
                          <AlertDescription>{message}</AlertDescription>
                        </Alert>
                      )}

                      {backendStatus === "connected" && ollamaStatus === "connected" && llamaStatus === "available" && (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertTitle className="text-green-800">Success!</AlertTitle>
                          <AlertDescription className="text-green-700">
                            All systems are up and running. The AI negotiation system is ready to use.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="status" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">System Status</h3>
                <Button onClick={checkHealth} disabled={isLoading} variant="outline" size="sm">
                  {isLoading ? "Checking..." : "Refresh"}
                </Button>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium">FastAPI Backend:</span>
                {backendStatus === "checking" ? (
                  <span className="text-gray-500">Checking...</span>
                ) : backendStatus === "connected" ? (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Connected
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" /> Disconnected
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Ollama Service:</span>
                {ollamaStatus === "checking" ? (
                  <span className="text-gray-500">Checking...</span>
                ) : ollamaStatus === "connected" ? (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Connected
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" /> Disconnected
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Llama 3 Model:</span>
                {llamaStatus === "checking" ? (
                  <span className="text-gray-500">Checking...</span>
                ) : llamaStatus === "available" ? (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Available
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" /> Not Available
                  </span>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">API Endpoints</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-mono text-sm">GET /health</span>
                    <Badge variant="outline">Health Check</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-mono text-sm">POST /api/negotiate</span>
                    <Badge variant="outline">Negotiation API</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-mono text-sm">GET /api/models</span>
                    <Badge variant="outline">List Models</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-mono text-sm">POST /api/pull-model</span>
                    <Badge variant="outline">Pull Model</Badge>
                  </div>
                </div>
              </div>

              {message && (
                <Alert variant={message.includes("success") ? "default" : "destructive"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Status</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="troubleshooting" className="space-y-4 mt-6">
            <div className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Troubleshooting Guide</AlertTitle>
                <AlertDescription className="text-blue-700">
                  If you're experiencing issues with the AI negotiation system, try the solutions below.
                </AlertDescription>
              </Alert>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="issue1">
                  <AccordionTrigger>
                    <span className="font-medium">FastAPI Backend Not Connecting</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        If the FastAPI backend is not connecting, try the following:
                      </p>
                      <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
                        <li>
                          Make sure you're running the server from the correct directory (where server.py is located)
                        </li>
                        <li>Check if the port 8000 is already in use by another application</li>
                        <li>Verify that you have all the required dependencies installed</li>
                        <li>
                          Try restarting the server with:{" "}
                          <code className="bg-gray-100 px-1 py-0.5 rounded">uvicorn server:app --reload</code>
                        </li>
                        <li>Check the terminal for any error messages</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="issue2">
                  <AccordionTrigger>
                    <span className="font-medium">Ollama Service Not Running</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">If the Ollama service is not running, try the following:</p>
                      <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
                        <li>
                          Open a new terminal window and run:{" "}
                          <code className="bg-gray-100 px-1 py-0.5 rounded">ollama serve</code>
                        </li>
                        <li>On Windows, check if the Ollama service is running in the system tray</li>
                        <li>Verify that Ollama was installed correctly</li>
                        <li>Try restarting your computer and then starting Ollama again</li>
                        <li>Check if the port 11434 is already in use by another application</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="issue3">
                  <AccordionTrigger>
                    <span className="font-medium">Llama 3 Model Not Found</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">If the Llama 3 model is not found, try the following:</p>
                      <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
                        <li>Make sure Ollama is running before pulling the model</li>
                        <li>
                          Try pulling the model manually:{" "}
                          <code className="bg-gray-100 px-1 py-0.5 rounded">ollama pull llama3</code>
                        </li>
                        <li>Check if you have enough disk space (at least 5GB free)</li>
                        <li>Verify your internet connection is stable</li>
                        <li>
                          Try listing available models:{" "}
                          <code className="bg-gray-100 px-1 py-0.5 rounded">ollama list</code>
                        </li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="issue4">
                  <AccordionTrigger>
                    <span className="font-medium">Negotiation Not Working</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        If the negotiation feature is not working, try the following:
                      </p>
                      <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
                        <li>
                          Make sure all three components are running: FastAPI backend, Ollama service, and Llama 3 model
                        </li>
                        <li>Check the browser console for any JavaScript errors</li>
                        <li>Try refreshing the page</li>
                        <li>Verify that the API endpoint is correct in the frontend code</li>
                        <li>Check the server logs for any error messages</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="issue5">
                  <AccordionTrigger>
                    <span className="font-medium">Slow Response Times</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">If the AI responses are slow, try the following:</p>
                      <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
                        <li>Llama 3 is a large model and may be slow on computers with limited resources</li>
                        <li>Close other resource-intensive applications</li>
                        <li>If you have a GPU, make sure Ollama is configured to use it</li>
                        <li>Consider using a smaller model if performance is critical</li>
                        <li>
                          The first request after starting the system may be slower as the model loads into memory
                        </li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold mb-2">Need More Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  If you're still experiencing issues, check out these resources:
                </p>
                <div className="space-y-2">
                  <a
                    href="https://github.com/ollama/ollama"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-amber-600 hover:text-amber-800"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ollama GitHub Repository
                  </a>
                  <a
                    href="https://fastapi.tiangolo.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-amber-600 hover:text-amber-800"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    FastAPI Documentation
                  </a>
                  <a href="mailto:support@rupped.com" className="flex items-center text-amber-600 hover:text-amber-800">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Contact Rupped Support
                  </a>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={checkHealth} disabled={isLoading} className="w-full bg-stone-800 hover:bg-stone-900">
          {isLoading ? "Checking..." : "Check System Status"}
        </Button>
      </CardFooter>
    </Card>
  )
}

