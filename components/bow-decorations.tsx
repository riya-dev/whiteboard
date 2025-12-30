"use client"

export function BowDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Top left bow */}
      <div className="absolute top-8 left-8 opacity-20 dark:opacity-10">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path
            d="M30 30 Q20 15 10 20 Q5 22 8 28 Q12 32 18 30 L30 30 Q32 35 28 40 Q24 42 20 38 Q18 34 22 30 Z"
            fill="var(--primary)"
          />
          <path
            d="M30 30 Q40 15 50 20 Q55 22 52 28 Q48 32 42 30 L30 30 Q28 35 32 40 Q36 42 40 38 Q42 34 38 30 Z"
            fill="var(--primary)"
          />
          <circle cx="30" cy="30" r="4" fill="var(--primary)" />
        </svg>
      </div>

      {/* Top right bow */}
      <div className="absolute top-12 right-16 opacity-15 dark:opacity-8 rotate-45">
        <svg width="50" height="50" viewBox="0 0 60 60" fill="none">
          <path
            d="M30 30 Q20 15 10 20 Q5 22 8 28 Q12 32 18 30 L30 30 Q32 35 28 40 Q24 42 20 38 Q18 34 22 30 Z"
            fill="var(--primary)"
          />
          <path
            d="M30 30 Q40 15 50 20 Q55 22 52 28 Q48 32 42 30 L30 30 Q28 35 32 40 Q36 42 40 38 Q42 34 38 30 Z"
            fill="var(--primary)"
          />
          <circle cx="30" cy="30" r="4" fill="var(--primary)" />
        </svg>
      </div>

      {/* Bottom left bow */}
      <div className="absolute bottom-20 left-24 opacity-10 dark:opacity-5 -rotate-12">
        <svg width="70" height="70" viewBox="0 0 60 60" fill="none">
          <path
            d="M30 30 Q20 15 10 20 Q5 22 8 28 Q12 32 18 30 L30 30 Q32 35 28 40 Q24 42 20 38 Q18 34 22 30 Z"
            fill="var(--primary)"
          />
          <path
            d="M30 30 Q40 15 50 20 Q55 22 52 28 Q48 32 42 30 L30 30 Q28 35 32 40 Q36 42 40 38 Q42 34 38 30 Z"
            fill="var(--primary)"
          />
          <circle cx="30" cy="30" r="4" fill="var(--primary)" />
        </svg>
      </div>

      {/* Bottom right bow */}
      <div className="absolute bottom-32 right-20 opacity-12 dark:opacity-6 rotate-12">
        <svg width="55" height="55" viewBox="0 0 60 60" fill="none">
          <path
            d="M30 30 Q20 15 10 20 Q5 22 8 28 Q12 32 18 30 L30 30 Q32 35 28 40 Q24 42 20 38 Q18 34 22 30 Z"
            fill="var(--primary)"
          />
          <path
            d="M30 30 Q40 15 50 20 Q55 22 52 28 Q48 32 42 30 L30 30 Q28 35 32 40 Q36 42 40 38 Q42 34 38 30 Z"
            fill="var(--primary)"
          />
          <circle cx="30" cy="30" r="4" fill="var(--primary)" />
        </svg>
      </div>

      {/* Middle right bow - smaller */}
      <div className="absolute top-1/2 right-8 opacity-8 dark:opacity-4 -rotate-6">
        <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
          <path
            d="M30 30 Q20 15 10 20 Q5 22 8 28 Q12 32 18 30 L30 30 Q32 35 28 40 Q24 42 20 38 Q18 34 22 30 Z"
            fill="var(--primary)"
          />
          <path
            d="M30 30 Q40 15 50 20 Q55 22 52 28 Q48 32 42 30 L30 30 Q28 35 32 40 Q36 42 40 38 Q42 34 38 30 Z"
            fill="var(--primary)"
          />
          <circle cx="30" cy="30" r="4" fill="var(--primary)" />
        </svg>
      </div>
    </div>
  )
}
