from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from typing import List, Optional, Dict
import httpx
import json
from datetime import datetime
from sse_starlette.sse import EventSourceResponse
import os
from dotenv import load_dotenv
import logging

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
OPENROUTER_MODEL = "deepseek/deepseek-v3-base:free"
OPENROUTER_API_KEY = "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"

if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY environment variable is not set")

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

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
    try:
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "HTTP-Referer": "http://localhost:3000",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": OPENROUTER_MODEL,
            "messages": messages,
            "stream": True,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        logger.debug(f"Making OpenRouter request with model: {OPENROUTER_MODEL}")
        
        async with httpx.AsyncClient() as client:
            async with client.stream("POST", OPENROUTER_API_URL, json=payload, headers=headers, timeout=60.0) as response:
                if response.status_code != 200:
                    error_detail = await response.aread()
                    logger.error(f"OpenRouter API error: {error_detail}")
                    raise HTTPException(status_code=response.status_code, detail=f"OpenRouter API error: {error_detail.decode()}")
                
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
    except Exception as e:
        logger.error(f"Error in OpenRouter streaming: {str(e)}", exc_info=True)
        raise

# Modified chat endpoint to support both models
@app.post("/api/chat")
async def chat_with_llm(request: Dict):
    try:
        messages = request.get("messages", [])
        model_type = request.get("model_type", "ollama")
        
        logger.debug(f"Received chat request - Model: {model_type}, Messages: {len(messages)}")
        
        if model_type == "openrouter":
            if not OPENROUTER_API_KEY:
                logger.error("OpenRouter API key not configured")
                return JSONResponse(
                    status_code=500,
                    content={"error": "OpenRouter API key not configured in environment"}
                )
            
            try:
                # Log the request (but not the API key)
                logger.debug(f"Making OpenRouter request with {len(messages)} messages")
                
                # Return streaming response directly
                return StreamingResponse(
                    stream_openrouter_response(messages),
                    media_type="text/event-stream"
                )
                    
            except Exception as e:
                logger.error(f"Error in OpenRouter chat: {str(e)}", exc_info=True)
                error_message = f"Error calling OpenRouter: {str(e)}"
                logger.error(error_message)
                return JSONResponse(
                    status_code=500,
                    content={"error": error_message}
                )
        else:
            # Handle Ollama case
            try:
                return StreamingResponse(
                    stream_ollama_response(messages),
                    media_type="text/event-stream"
                )
            except Exception as e:
                logger.error(f"Error in Ollama chat: {str(e)}", exc_info=True)
                error_message = f"Error calling Ollama: {str(e)}"
                logger.error(error_message)
                return JSONResponse(
                    status_code=500,
                    content={"error": error_message}
                )
    except Exception as e:
        logger.error(f"Server error: {str(e)}", exc_info=True)
        error_message = f"Server error: {str(e)}"
        logger.error(error_message)
        return JSONResponse(
            status_code=500,
            content={"error": error_message}
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

