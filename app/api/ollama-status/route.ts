import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch('http://localhost:11434/api/version')
    const data = await response.json()
    return NextResponse.json({ status: 'online', version: data.version })
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'offline', 
      error: error?.message || 'Failed to connect to Ollama service' 
    })
  }
}

