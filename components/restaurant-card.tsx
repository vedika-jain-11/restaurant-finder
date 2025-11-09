"use client"

import type { Restaurant } from "./chat-interface"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock } from "lucide-react"

interface RestaurantCardProps {
  restaurant: Restaurant
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="h-40 bg-muted overflow-hidden">
        <img
          src={restaurant.image || "/placeholder.svg"}
          alt={restaurant.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-card-foreground line-clamp-1">{restaurant.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{restaurant.cuisine.join(" • ")}</p>
        </div>

        {/* Rating & Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="text-sm font-semibold text-card-foreground">{restaurant.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">({restaurant.reviewCount} reviews)</span>
          </div>
          <span className="text-sm font-semibold text-accent">{restaurant.price}</span>
        </div>

        {/* Info */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent" />
            {restaurant.distance}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <span className="text-xs">{restaurant.availability}</span>
          </div>
        </div>

        {/* Highlights */}
        <div className="flex flex-wrap gap-2">
          {restaurant.highlights.map((highlight, idx) => (
            <span key={idx} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
              {highlight}
            </span>
          ))}
        </div>

        {/* CTA */}
        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
          Reserve Now
        </Button>
      </div>
    </div>
  )
}
