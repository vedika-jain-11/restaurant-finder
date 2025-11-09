"use client"

import { useEffect, useRef } from "react"
import type { Message } from "./chat-interface"
import { RestaurantCard } from "./restaurant-card"

interface ChatMessagesProps {
  messages: Message[]
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {messages.map((message) => (
          <div key={message.id}>
            {message.type === "user" && (
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-6 py-3 max-w-2xl shadow-sm">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            )}

            {message.type === "assistant" && (
              <div className="flex justify-start">
                <div className="bg-card text-card-foreground rounded-2xl rounded-tl-sm px-6 py-3 max-w-2xl border border-border shadow-sm">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            )}

            {message.type === "recommendations" && message.restaurants && (
              <div className="space-y-4 mt-6">
                <p className="text-sm text-muted-foreground">{message.content}</p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {message.restaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
