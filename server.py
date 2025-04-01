from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List, Optional, Dict
import httpx
import json
from datetime import datetime
from sse_starlette.sse import EventSourceResponse
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ollama API configuration
OLLAMA_API_URL = "http://localhost:11434"
OLLAMA_MODEL = "llama3.2"

# OpenRouter API configuration
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "deepseek-ai/deepseek-coder-33b-instruct"
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')

if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY environment variable is not set")

# Chat with Ollama LLM
async def stream_ollama_response(messages, system_prompt=None, temperature=0.7, max_tokens=2000):
    # Prepare the request payload
    payload = {
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": True,
        "options": {
            "temperature": temperature,
            "num_predict": max_tokens
        }
    }
    
    if system_prompt:
        payload["system"] = system_prompt
    
    async with httpx.AsyncClient() as client:
        async with client.stream("POST", f"{OLLAMA_API_URL}/api/chat", json=payload, timeout=60.0) as response:
            if response.status_code != 200:
                error_detail = await response.aread()
                raise HTTPException(status_code=response.status_code, detail=f"Ollama API error: {error_detail}")
            
            async for chunk in response.aiter_bytes():
                if chunk:
                    try:
                        data = json.loads(chunk)
                        if "message" in data and "content" in data["message"]:
                            yield f"data: {json.dumps({'text': data['message']['content']})}\n\n"
                    except json.JSONDecodeError:
                        continue
            
            yield f"data: [DONE]\n\n"

# New function for OpenRouter streaming
async def stream_openrouter_response(messages, system_prompt=None, temperature=0.7, max_tokens=2000):
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "http://localhost:3000",  # Replace with your actual domain
        "Content-Type": "application/json"
    }
    
    if system_prompt:
        messages.insert(0, {"role": "system", "content": system_prompt})
    
    payload = {
        "model": OPENROUTER_MODEL,
        "messages": messages,
        "stream": True,
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    
    async with httpx.AsyncClient() as client:
        async with client.stream("POST", OPENROUTER_API_URL, json=payload, headers=headers, timeout=60.0) as response:
            if response.status_code != 200:
                error_detail = await response.aread()
                raise HTTPException(status_code=response.status_code, detail=f"OpenRouter API error: {error_detail}")
            
            async for line in response.aiter_lines():
                if line.strip():
                    if line.startswith("data: "):
                        line = line[6:]  # Remove "data: " prefix
                    if line == "[DONE]":
                        yield f"data: [DONE]\n\n"
                        break
                    try:
                        data = json.loads(line)
                        if "choices" in data and len(data["choices"]) > 0:
                            content = data["choices"][0].get("delta", {}).get("content", "")
                            if content:
                                yield f"data: {json.dumps({'text': content})}\n\n"
                    except json.JSONDecodeError:
                        continue

# Modified chat endpoint to support both models
@app.post("/api/chat")
async def chat_with_llm(request: Dict):
    messages = request.get("messages", [])
    model_type = request.get("model_type", "ollama")  # Default to ollama
    system_prompt = request.get("systemPrompt")
    temperature = request.get("temperature", 0.7)
    max_tokens = request.get("max_tokens", 2000)
    
    if model_type == "ollama":
        stream = stream_ollama_response(
            messages,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens
        )
    elif model_type == "openrouter":
        stream = stream_openrouter_response(
            messages,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid model type")
    
    return StreamingResponse(
        stream,
        media_type="text/event-stream"
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/ollama-status")
async def check_ollama_status():
    """Check if Ollama service is available and running."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{OLLAMA_API_URL}/api/version", timeout=3.0)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "status": "online",
                    "message": "Ollama service is running",
                    "version": data.get("version", "unknown"),
                    "model": OLLAMA_MODEL
                }
            else:
                return {
                    "status": "offline",
                    "message": f"Ollama service returned status code {response.status_code}"
                }
    except Exception as e:
        return {
            "status": "offline",
            "message": f"Failed to connect to Ollama service: {str(e)}"
        }

# Add OpenRouter status endpoint
@app.get("/api/openrouter-status")
async def check_openrouter_status():
    """Check if OpenRouter service is available."""
    try:
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://openrouter.ai/api/v1/models",
                headers=headers,
                timeout=3.0
            )
            
            if response.status_code == 200:
                return {
                    "status": "online",
                    "message": "OpenRouter service is running",
                    "model": OPENROUTER_MODEL
                }
            else:
                return {
                    "status": "offline",
                    "message": f"OpenRouter service returned status code {response.status_code}"
                }
    except Exception as e:
        return {
            "status": "offline",
            "message": f"Failed to connect to OpenRouter service: {str(e)}"
        }

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)

