"use client"

import { useCallback, useRef } from "react"

export function useClickSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio on first use
  if (typeof window !== "undefined" && !audioRef.current) {
    audioRef.current = new Audio("/select_001.ogg")
    audioRef.current.volume = 0.3 // Set to 30% volume for subtle effect
    audioRef.current.preload = "auto"
  }

  const playClick = useCallback(() => {
    if (audioRef.current) {
      // Clone and play to allow rapid successive clicks
      const sound = audioRef.current.cloneNode() as HTMLAudioElement
      sound.volume = 0.3
      sound.play().catch(() => {
        // Silently fail if autoplay is blocked
      })
    }
  }, [])

  return playClick
}
