import { NextResponse } from "next/server"

export async function GET() {
  try {
    const OLLAMA_API_URL = "http://localhost:11434"
    const response = await fetch(`${OLLAMA_API_URL}/api/health`)
    if (response.ok) {
      return Response.json({ status: 'online' })
    }
    return Response.json({ status: 'offline' })
  } catch (error) {
    // In production, Ollama won't be available
    return Response.json({ 
      status: 'offline',
      message: 'Ollama is not available in production environment'
    })
  }
}

