'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LocationBannerProps {
  className?: string
  onLocationDetected?: (city: string) => void
}

// Mock Indian cities for demonstration
const mockCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
]

export function LocationBanner({ className, onLocationDetected }: LocationBannerProps) {
  const [detectedCity, setDetectedCity] = useState<string>('')
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate location detection with a random city
    const simulateLocationDetection = () => {
      setIsLoading(true)
      
      setTimeout(() => {
        const randomCity = mockCities[Math.floor(Math.random() * mockCities.length)]
        setDetectedCity(randomCity)
        setIsLoading(false)
        setIsVisible(true)
        onLocationDetected?.(randomCity)
      }, 1500) // Simulate network delay
    }

    simulateLocationDetection()
  }, [onLocationDetected])

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible && !isLoading) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'relative bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-primary/20 rounded-lg p-4',
        'backdrop-blur-sm',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
            >
              <MapPin className="w-5 h-5 text-primary" />
            </motion.div>
            
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-pulse bg-muted rounded h-4 w-24"></div>
                <span className="text-sm text-muted-foreground">Detecting your location...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  📍 You're in <span className="text-primary font-semibold">{detectedCity}</span>
                </span>
                <span className="text-sm text-muted-foreground">
                  • Discover {Math.floor(Math.random() * 15) + 5} apps available near you
                </span>
              </div>
            )}
          </div>
        </div>
        
        {!isLoading && (
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            aria-label="Dismiss location banner"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
      
      {/* Optional: Show available cities */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="mt-3 pt-3 border-t border-primary/10"
        >
          <p className="text-xs text-muted-foreground mb-2">
            Also available in:
          </p>
          <div className="flex flex-wrap gap-1">
            {mockCities
              .filter(city => city !== detectedCity)
              .slice(0, 6)
              .map((city) => (
                <span
                  key={city}
                  className="text-xs bg-muted px-2 py-1 rounded-md"
                >
                  {city}
                </span>
              ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}