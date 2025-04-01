import { Loader2 } from "lucide-react"

export default function LoadingChat() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Loading healthcare assistant...</p>
    </div>
  )
}

