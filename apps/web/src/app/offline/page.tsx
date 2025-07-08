'use client'

import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <WifiOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">You're Offline</h1>
        <p className="text-muted-foreground mb-6">
          It looks like you&apos;ve lost your internet connection. Some features may be unavailable until you&apos;re back online.
        </p>
        <div className="space-y-2">
          <p className="text-sm">You can still:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• View previously cached apps</li>
            <li>• Access your saved favorites</li>
            <li>• Read downloaded content</li>
          </ul>
        </div>
        <button 
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.reload()
            }
          }}
          className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}