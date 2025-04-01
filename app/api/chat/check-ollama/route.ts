import { NextResponse } from "next/server"

export async function GET() {
  try {
    // In a real implementation, this would check the actual Ollama service through FastAPI
    // For now, we'll simulate a check by trying to connect to the FastAPI endpoint
    const response = await fetch("/api/health", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(3000), // 3 second timeout
    })

    if (!response.ok) {
      throw new Error("FastAPI backend is unavailable")
    }

    // In a real implementation, you would have a dedicated endpoint in FastAPI
    // that checks the Ollama connection and returns its status

    // Simulate a more realistic response
    return NextResponse.json({
      status: "online",
      message: "Ollama service is running",
      model: "llama3.2",
      version: "0.1.14",
    })
  } catch (error) {
    console.error("Error checking Ollama status:", error)
    return NextResponse.json(
      { status: "offline", message: "Ollama service is unavailable" },
      { status: 200 }, // Still return 200 to handle in the UI
    )
  }
}

