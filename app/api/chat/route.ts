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
  needsLocation?: boolean
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
    console.log("Conversation history:", conversationHistory)
    console.log("Message:", message)
    // Step 3: Extract preferences using OpenAI
    const preferences = await extractPreferences(message, conversationHistory)
    
    console.log("Extracted preferences:", preferences)

    // Attempt to extract location from the current user message if OpenAI missed it
    if (!preferences.location) {
      const currentMessageLocation = extractLocationFromText(message)
      if (currentMessageLocation) {
        preferences.location = currentMessageLocation
        preferences.needsLocation = false
      }
    }

    // Attempt to use location from conversation history if still missing
    if (!preferences.location) {
      const historicalLocation = extractLocationFromHistory(conversationHistory)
      if (historicalLocation) {
        preferences.location = historicalLocation
        preferences.needsLocation = false
      }
    }

    // Handle "near me" or similar phrases by asking for a specific area
    if (
      preferences.location?.toLowerCase().includes("near me") ||
      preferences.location?.toLowerCase().includes("nearby") ||
      preferences.location?.toLowerCase().includes("around here")
    ) {
      return NextResponse.json({
        assistantMessage:
          "I'd love to help you find restaurants nearby! Could you please tell me which city or neighborhood you're in?",
        needsLocation: true,
      })
    }

    // Handle missing location
    if (preferences.needsLocation || (!preferences.location && !preferences.coordinates)) {
      const locationPrompt =
        preferences.cuisine?.length
          ? `I'd be happy to help you find ${preferences.cuisine.join(
              ", "
            )} restaurants! To give you the best recommendations, could you please tell me which city or neighborhood you're interested in? For example: "in Manhattan" or "around downtown Austin".`
          : "To find the perfect restaurants for you, could you please tell me which city or neighborhood you're interested in? For example: \"in San Francisco\" or \"around downtown Austin\"."

      return NextResponse.json({
        assistantMessage: locationPrompt,
        needsLocation: true,
      })
    }

    // TODO: Step 4 - Query Google Places API with preferences
    // TODO: Step 5 - Map Google Places data to Restaurant interface
    // TODO: Step 6 - Optional AI ranking

    // Temporary response for testing
    const response: ChatResponse = {
      assistantMessage: `I understand you're looking for ${
        preferences.cuisine?.join(", ") || "restaurants"
      }${preferences.location ? ` in ${preferences.location}` : ""}. Let me find the perfect matches for you!`,
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

function extractLocationFromHistory(
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
): string | null {
  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const message = conversationHistory[i]
    if (message.role !== "user") continue
    const location = extractLocationFromText(message.content)
    if (location) {
      return location
    }
  }
  return null
}

function extractLocationFromText(input: string): string | null {
  const locationRegex = /\b(?:in|near|around|at)\s+([A-Za-z][A-Za-z\s'-]{2,})(?=$|[.,!?;]| with| for| on| to| and)/i
  const match = input.match(locationRegex)
  if (match) {
    return match[1].trim()
  }
  return null
}

