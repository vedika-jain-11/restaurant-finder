"use client"

import { useState } from "react"
import { ChatMessages } from "./chat-messages"
import { ChatInput } from "./chat-input"

export interface Message {
  id: string
  type: "user" | "assistant" | "recommendations"
  content: string
  restaurants?: Restaurant[]
  timestamp: Date
}

export interface Restaurant {
  id: string
  name: string
  cuisine: string[]
  rating: number
  reviewCount: number
  price: string
  distance: string
  availability: string
  image: string
  highlights: string[]
}

const DEMO_RESTAURANTS: Restaurant[] = [
  {
    id: "1",
    name: "Ember & Oak",
    cuisine: ["American", "Steakhouse"],
    rating: 4.8,
    reviewCount: 342,
    price: "$$$",
    distance: "0.5 km away",
    availability: "Available today at 7:00 PM",
    image: "/upscale-steakhouse-interior-warm-lighting.jpg",
    highlights: ["Award-winning steaks", "Wine selection", "Private dining"],
  },
  {
    id: "2",
    name: "Saffron Kitchen",
    cuisine: ["Indian", "Fusion"],
    rating: 4.6,
    reviewCount: 287,
    price: "$$",
    distance: "1.2 km away",
    availability: "Available today at 6:30 PM, 8:15 PM",
    image: "/modern-indian-restaurant-colorful-spices.jpg",
    highlights: ["Signature curries", "Fresh naan", "Cocktail pairings"],
  },
  {
    id: "3",
    name: "La Bella Notte",
    cuisine: ["Italian", "Mediterranean"],
    rating: 4.7,
    reviewCount: 521,
    price: "$$",
    distance: "0.8 km away",
    availability: "Available today at 7:30 PM",
    image: "/cozy-italian-restaurant-candlelit.jpg",
    highlights: ["Homemade pasta", "Tiramisu", "Romantic ambiance"],
  },
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hello! I'm your Restaurant Scout. I'll help you find the perfect restaurant. What are you in the mood for today?",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (content: string) => {
    // Add user message to UI immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Build conversation history from existing messages (before adding the new user message)
      // This excludes the current message and recommendation messages
      const conversationHistory = messages
        .filter((msg) => msg.type === "user" || msg.type === "assistant")
        .map((msg) => ({
          role: msg.type === "user" ? ("user" as const) : ("assistant" as const),
          content: msg.content,
        }))

      // Call API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          conversationHistory,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.assistantMessage || "Let me find some perfect matches for you.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Add recommendations if available
      if (data.restaurants && data.restaurants.length > 0) {
        const recommendationsMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: "recommendations",
          content: "Here are my top recommendations:",
          restaurants: data.restaurants,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, recommendationsMessage])
      }
    } catch (error) {
      console.error("Error sending message:", error)
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent p-6 text-primary-foreground shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight">Restaurant Scout</h1>
          <p className="text-primary-foreground/80 mt-1">AI-powered dining recommendations</p>
        </div>
      </div>

      {/* Messages */}
      <ChatMessages messages={messages} />

      {/* Input */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  )
}
