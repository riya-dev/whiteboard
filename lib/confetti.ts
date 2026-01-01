export function triggerConfetti(color: string = 'rgb(244 63 94)') {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const existing = document.getElementById('confetti-style')
  if (!existing) {
    const style = document.createElement('style')
    style.id = 'confetti-style'
    style.textContent = `
      @keyframes confetti-fall-1 {
        0% { transform: translate(0, -20vh) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        100% { transform: translate(-30vw, 110vh) rotate(720deg); opacity: 0; }
      }
      @keyframes confetti-fall-2 {
        0% { transform: translate(0, -20vh) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        100% { transform: translate(30vw, 110vh) rotate(-720deg); opacity: 0; }
      }
      @keyframes confetti-fall-3 {
        0% { transform: translate(0, -20vh) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        100% { transform: translate(10vw, 110vh) rotate(360deg); opacity: 0; }
      }
      @keyframes confetti-fall-4 {
        0% { transform: translate(0, -20vh) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        100% { transform: translate(-10vw, 110vh) rotate(-360deg); opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }

  const overlay = document.createElement('div')
  overlay.setAttribute('role', 'presentation')
  overlay.style.position = 'fixed'
  overlay.style.inset = '0'
  overlay.style.pointerEvents = 'none'
  overlay.style.zIndex = '9999'

  // Color variations
  const colors = [
    color,
    'rgb(251 191 36)', // amber
    'rgb(168 85 247)', // purple
    'rgb(59 130 246)', // blue
    'rgb(236 72 153)', // pink
    'rgb(34 197 94)', // green
  ]

  const count = 120
  const animations = ['confetti-fall-1', 'confetti-fall-2', 'confetti-fall-3', 'confetti-fall-4']

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span')
    const size = 4 + Math.random() * 8
    const shapeRand = Math.random()

    piece.style.position = 'absolute'
    piece.style.top = '-10vh'
    piece.style.left = `${Math.random() * 100}%`
    piece.style.width = `${size}px`

    // Varied shapes: squares, rectangles, circles
    if (shapeRand < 0.33) {
      // Square
      piece.style.height = `${size}px`
      piece.style.borderRadius = '1px'
    } else if (shapeRand < 0.66) {
      // Rectangle
      piece.style.height = `${size * (1.5 + Math.random())}px`
      piece.style.borderRadius = '2px'
    } else {
      // Circle
      piece.style.height = `${size}px`
      piece.style.borderRadius = '50%'
    }

    piece.style.background = colors[Math.floor(Math.random() * colors.length)]
    piece.style.opacity = `${0.7 + Math.random() * 0.3}`
    piece.style.transform = `translate(0, -20vh) rotate(${Math.random() * 360}deg)`
    piece.style.animation = `${animations[Math.floor(Math.random() * animations.length)]} ${2 + Math.random() * 1.5}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`
    piece.style.animationDelay = `${Math.random() * 0.3}s`
    overlay.appendChild(piece)
  }

  document.body.appendChild(overlay)

  // Play celebration sound with reduced volume to blend with click sound
  const playSound = async () => {
    try {
      const audio = new Audio('/party-horn.mp3')
      audio.volume = 0.35 // Reduced volume to blend better with click sound
      await audio.play()
    } catch {
      // Silently fail if autoplay is blocked - confetti visual is enough
    }
  }

  playSound()

  window.setTimeout(() => {
    overlay.remove()
  }, 3500) // Slightly longer to let all confetti fall
}

