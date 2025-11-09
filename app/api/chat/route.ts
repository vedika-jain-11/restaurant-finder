import { NextRequest, NextResponse } from "next/server"
import { extractPreferences } from "@/lib/openai-client"

// Google Places API endpoint
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY
const GOOGLE_PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText"

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

export interface ChatRequest {
  message: string
  conversationHistory?: Array<{
    role: "user" | "assistant"
    content: string
  }>
}

export interface ChatResponse {
  assistantMessage: string
  restaurants?: Restaurant[]
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    // Verify API keys are set
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      )
    }

    if (!GOOGLE_PLACES_API_KEY) {
      return NextResponse.json(
        { error: "Google Places API key is not configured" },
        { status: 500 }
      )
    }

    // Parse request body
    const body: ChatRequest = await request.json()
    const { message, conversationHistory = [] } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Step 3: Extract preferences using OpenAI
    const preferences = await extractPreferences(message, conversationHistory)
    
    console.log("Extracted preferences:", preferences)

    // TODO: Step 4 - Query Google Places API with preferences
    // TODO: Step 5 - Map Google Places data to Restaurant interface
    // TODO: Step 6 - Optional AI ranking

    // Temporary response for testing
    const response: ChatResponse = {
      assistantMessage: `I understand you're looking for ${preferences.cuisine?.join(", ") || "restaurants"}${preferences.location ? ` in ${preferences.location}` : ""}. Let me find the perfect matches for you!`,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in chat API route:", error)
    return NextResponse.json(
      {
        error: "An error occurred while processing your request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

