"use client"

export function LoadingWhiteboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        {/* Animated whiteboard icon */}
        <div className="relative">
          {/* Main whiteboard */}
          <div className="w-32 h-24 border-4 border-primary/30 rounded-2xl bg-background shadow-lg relative overflow-hidden">
            {/* Animated loading lines */}
            <div className="absolute inset-0 p-4 space-y-2">
              <div className="h-1.5 bg-primary/20 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="h-1.5 bg-primary/20 rounded-full w-4/5 animate-pulse" style={{ animationDelay: '100ms' }} />
              <div className="h-1.5 bg-primary/20 rounded-full w-3/5 animate-pulse" style={{ animationDelay: '200ms' }} />
              <div className="h-1.5 bg-primary/20 rounded-full w-2/5 animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>

            {/* Sparkle effect */}
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-ping" />
            </div>
          </div>

          {/* Cute marker */}
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <div className="w-1 h-3 bg-white rounded-full" />
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-medium text-foreground">Loading your whiteboard</h2>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
