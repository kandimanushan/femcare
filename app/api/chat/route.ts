import { NextRequest, NextResponse } from 'next/server'
import { Ollama } from "ollama"

const ollama = new Ollama()

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { message, language } = await req.json()

    // Create a prompt that includes the language preference
    const prompt = `You are a helpful AI assistant for a women's health application. 
    Please respond in ${language} language. 
    User's message: ${message}`

    const response = await ollama.chat({
      model: "llama2",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant for a women's health application. Provide accurate, helpful, and empathetic responses about women's health topics.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
    })

    return NextResponse.json({ response: response.message.content })
  } catch (error) {
    console.error("Error in chat route:", error)
    return NextResponse.json(
      { error: "Failed to get response from AI" },
      { status: 500 }
    )
  }
}

