"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome-message",
        role: "assistant",
        content:
          "Hello! I'm your healthcare assistant. I can help answer general health questions, check symptoms, or recommend specialists. How can I help you today?",
      },
    ],
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState("chat")

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">Healthcare Assistant</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            Online
          </Badge>
          <ThemeToggle />
        </div>
      </div>

      <Tabs defaultValue="chat" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="symptoms">Symptom Checker</TabsTrigger>
          <TabsTrigger value="doctors">Find Doctors</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
          <ScrollArea className="flex-1 pr-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("mb-4 flex", message.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "flex items-start gap-3 max-w-[80%]",
                    message.role === "user" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <Avatar
                    className={cn(
                      "h-8 w-8",
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted-foreground text-muted",
                    )}
                  >
                    {message.role === "user" ? "U" : "AI"}
                  </Avatar>
                  <Card
                    className={cn(
                      "p-3",
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </Card>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Type your health question..."
              className="min-h-[60px] flex-1 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e as any)
                }
              }}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="symptoms" className="flex-1 flex flex-col p-4">
          <div className="text-center flex-1 flex flex-col items-center justify-center">
            <h3 className="text-xl font-medium mb-4">Symptom Checker</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Describe your symptoms in detail and our AI will help identify possible conditions and next steps.
            </p>
            <Textarea placeholder="Describe your symptoms here..." className="mb-4 max-w-md" rows={5} />
            <Button className="max-w-md w-full">Check Symptoms</Button>
          </div>
        </TabsContent>

        <TabsContent value="doctors" className="flex-1 flex flex-col p-4">
          <div className="text-center flex-1 flex flex-col items-center justify-center">
            <h3 className="text-xl font-medium mb-4">Find Specialists</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Based on your symptoms or condition, we can recommend appropriate medical specialists.
            </p>
            <Input placeholder="Enter condition or specialty..." className="mb-4 max-w-md" />
            <Button className="max-w-md w-full">Find Specialists</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

