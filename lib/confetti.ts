export function triggerConfetti(color: string = 'rgb(244 63 94)') {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const existing = document.getElementById('confetti-style')
  if (!existing) {
    const style = document.createElement('style')
    style.id = 'confetti-style'
    style.textContent = `
      @keyframes confetti-fall {
        0% { transform: translateY(-20vh) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
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

  const count = 80
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span')
    const size = 6 + Math.random() * 6
    piece.style.position = 'absolute'
    piece.style.top = '-10vh'
    piece.style.left = `${Math.random() * 100}%`
    piece.style.width = `${size}px`
    piece.style.height = `${size * (0.6 + Math.random() * 0.8)}px`
    piece.style.background = color
    piece.style.borderRadius = `${Math.random() < 0.5 ? 2 : 9999}px`
    piece.style.opacity = '0.9'
    piece.style.transform = `translateY(-20vh) rotate(${Math.random() * 360}deg)`
    piece.style.animation = `confetti-fall ${1.8 + Math.random() * 1.2}s ease-in forwards`
    piece.style.animationDelay = `${Math.random() * 0.2}s`
    overlay.appendChild(piece)
  }

  document.body.appendChild(overlay)

  // Try to play celebration sound (local preferred; fallback to WebAudio beep)
  const playSound = async () => {
    try {
      const audio = new Audio('/party-horn.mp3')
      audio.volume = 0.6
      await audio.play()
    } catch {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = 'square'
        o.frequency.value = 440
        o.connect(g)
        g.connect(ctx.destination)
        g.gain.setValueAtTime(0.0001, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01)
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2)
        o.start()
        o.stop(ctx.currentTime + 0.22)
      } catch {
        // ignore
      }
    }
  }

  playSound()

  window.setTimeout(() => {
    overlay.remove()
  }, 2500)
}

