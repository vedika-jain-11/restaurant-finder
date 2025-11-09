import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ExtractedPreferences {
  cuisine?: string[]
  location?: string
  coordinates?: {
    lat: number
    lng: number
  }
  priceRange?: "budget" | "moderate" | "expensive" | "very expensive"
  occasion?: string
  dietaryRestrictions?: string[]
  otherPreferences?: string[]
  searchQuery?: string
}

/**
 * Extracts restaurant preferences from user conversation using OpenAI GPT-4o
 */
export async function extractPreferences(
  message: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<ExtractedPreferences> {
  try {
    // Build conversation messages for context
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a restaurant recommendation assistant. Your task is to extract restaurant preferences from user conversations.

Extract the following information:
- cuisine: Array of cuisine types (e.g., ["Italian", "Japanese"])
- location: City, neighborhood, or area name (e.g., "Manhattan", "San Francisco")
- coordinates: If location can be geocoded, provide lat/lng (optional)
- priceRange: One of "budget", "moderate", "expensive", "very expensive"
- occasion: Special occasion or dining style (e.g., "romantic", "business dinner", "casual")
- dietaryRestrictions: Any dietary restrictions (e.g., ["vegetarian", "gluten-free"])
- otherPreferences: Any other preferences mentioned
- searchQuery: A natural language search query for Google Places API based on the preferences

Return a JSON object with the extracted preferences. If information is not mentioned, omit that field.
Use conversation history to maintain context about previously mentioned preferences.`,
      },
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: message,
      },
    ]

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent extraction
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      throw new Error("No response from OpenAI")
    }

    // Parse JSON response
    const preferences: ExtractedPreferences = JSON.parse(responseContent)

    // Generate search query if not provided
    if (!preferences.searchQuery) {
      preferences.searchQuery = generateSearchQuery(preferences)
    }

    return preferences
  } catch (error) {
    console.error("Error extracting preferences:", error)
    // Return a fallback with basic search query
    return {
      searchQuery: message,
    }
  }
}

/**
 * Generates a natural language search query for Google Places API
 */
function generateSearchQuery(preferences: ExtractedPreferences): string {
  const parts: string[] = []

  if (preferences.cuisine && preferences.cuisine.length > 0) {
    parts.push(preferences.cuisine.join(", "))
  }

  if (preferences.priceRange) {
    const priceMap: Record<string, string> = {
      budget: "cheap",
      moderate: "moderate",
      expensive: "fine dining",
      "very expensive": "upscale fine dining",
    }
    parts.push(priceMap[preferences.priceRange] || preferences.priceRange)
  }

  parts.push("restaurant")

  if (preferences.location) {
    parts.push(`in ${preferences.location}`)
  }

  if (preferences.occasion) {
    parts.push(`for ${preferences.occasion}`)
  }

  return parts.join(" ")
}

