// API client for connecting to the FastAPI backend

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: any
  headers?: Record<string, string>
}

// Base URL for the API - using relative path or direct server address
const API_BASE_URL = "http://localhost:8000"
// const API_BASE_URL = 'http://localhost:8000';  // For local development

// Helper function for making API requests
export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  }

  // Add auth token if available
  const token = localStorage.getItem("femcare-auth-token")
  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `API request failed with status ${response.status}`)
  }

  // For DELETE requests that return 204 No Content
  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

// Authentication
export async function login(username: string, password: string) {
  const formData = new FormData()
  formData.append("username", username)
  formData.append("password", password)

  const response = await fetch(`${API_BASE_URL}/token`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || "Login failed")
  }

  const data = await response.json()
  localStorage.setItem("femcare-auth-token", data.access_token)
  return data
}

export async function register(userData: {
  username: string
  email: string
  password: string
  full_name?: string
}) {
  return apiRequest("/users/", {
    method: "POST",
    body: userData,
  })
}

export async function logout() {
  localStorage.removeItem("femcare-auth-token")
}

export async function getCurrentUser() {
  return apiRequest("/users/me/")
}

// Health Metrics
export async function getHealthMetrics(params?: {
  metric_type?: string
  start_date?: string
  end_date?: string
}) {
  const queryParams = new URLSearchParams()
  if (params?.metric_type) queryParams.append("metric_type", params.metric_type)
  if (params?.start_date) queryParams.append("start_date", params.start_date)
  if (params?.end_date) queryParams.append("end_date", params.end_date)

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
  return apiRequest(`/api/health-metrics${queryString}`)
}

export async function createHealthMetric(metricData: any) {
  return apiRequest("/api/health-metrics", {
    method: "POST",
    body: metricData,
  })
}

export async function updateHealthMetric(metricId: string, metricData: any) {
  return apiRequest(`/api/health-metrics/${metricId}`, {
    method: "PUT",
    body: metricData,
  })
}

export async function deleteHealthMetric(metricId: string) {
  return apiRequest(`/api/health-metrics/${metricId}`, {
    method: "DELETE",
  })
}

// Similar functions for medications, appointments, and journal entries
export const medicationsApi = {
  getAll: () => apiRequest("/api/medications"),
  getById: (id: string) => apiRequest(`/api/medications/${id}`),
  create: (data: any) => apiRequest("/api/medications", { method: "POST", body: data }),
  update: (id: string, data: any) => apiRequest(`/api/medications/${id}`, { method: "PUT", body: data }),
  delete: (id: string) => apiRequest(`/api/medications/${id}`, { method: "DELETE" }),
}

export const appointmentsApi = {
  getAll: (params?: { start_date?: string; end_date?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.start_date) queryParams.append("start_date", params.start_date)
    if (params?.end_date) queryParams.append("end_date", params.end_date)

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return apiRequest(`/api/appointments${queryString}`)
  },
  getById: (id: string) => apiRequest(`/api/appointments/${id}`),
  create: (data: any) => apiRequest("/api/appointments", { method: "POST", body: data }),
  update: (id: string, data: any) => apiRequest(`/api/appointments/${id}`, { method: "PUT", body: data }),
  delete: (id: string) => apiRequest(`/api/appointments/${id}`, { method: "DELETE" }),
}

export const journalApi = {
  getAll: (params?: { start_date?: string; end_date?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.start_date) queryParams.append("start_date", params.start_date)
    if (params?.end_date) queryParams.append("end_date", params.end_date)

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return apiRequest(`/api/journal${queryString}`)
  },
  getById: (id: string) => apiRequest(`/api/journal/${id}`),
  create: (data: any) => apiRequest("/api/journal", { method: "POST", body: data }),
  update: (id: string, data: any) => apiRequest(`/api/journal/${id}`, { method: "PUT", body: data }),
  delete: (id: string) => apiRequest(`/api/journal/${id}`, { method: "DELETE" }),
}

// Chat with Ollama LLM
type Message = {
  role: "user" | "assistant"
  content: string
}

export async function chatWithLLM(messages: Message[], systemPrompt: string) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages, systemPrompt }),
  })

  if (!response.ok) {
    throw new Error("Failed to chat with LLM")
  }

  return response
}

// Add a new function to check Ollama status
export async function checkOllamaStatus() {
  const response = await fetch(`${API_BASE_URL}/api/ollama-status`)
  if (!response.ok) {
    throw new Error("Failed to check Ollama status")
  }
  return response.json()
}

