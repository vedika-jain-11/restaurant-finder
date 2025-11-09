"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SendHorizontal } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void | Promise<void>
  isLoading?: boolean
}

export function ChatInput({ onSendMessage, isLoading = false }: ChatInputProps) {
  const [input, setInput] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const message = input.trim()
    setInput("")
    await onSendMessage(message)
  }

  return (
    <div className="border-t border-border bg-card">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What kind of restaurant are you looking for? (e.g., 'Italian fine dining')"
            className="flex-1 bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-ring/30 transition-all text-sm"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 font-semibold flex items-center gap-2"
          >
            <SendHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
