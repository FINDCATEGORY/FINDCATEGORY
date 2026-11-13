"use client"

export function AnimatedWallpaper() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* macOS Studio Light inspired white and light gray gradient wallpaper */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f1f3f6] to-[#d8dce2]">
        {/* Layer 1: Pure white top-left light source */}
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse at 20% 15%, #ffffff 0%, rgba(255,255,255,0.95) 30%, rgba(241,243,246,0.6) 70%, transparent 100%)",
          }}
        />

        {/* Layer 2: Elegant silver light-gray wave */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              "linear-gradient(135deg, transparent 20%, rgba(226,232,240,0.7) 45%, rgba(203,213,225,0.5) 75%, rgba(226,232,240,0.8) 100%)",
          }}
        />

        {/* Layer 3: Soft platinum gradient depth */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "linear-gradient(195deg, transparent 40%, rgba(241,245,249,0.8) 60%, rgba(203,213,225,0.4) 85%, rgba(148,163,184,0.25) 100%)",
          }}
        />

        {/* Layer 4: Subtle clean top highlight */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.5) 25%, transparent 55%)",
          }}
        />

        {/* Subtle noise texture for depth */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E\")",
          }}
        />
      </div>
    </div>
  )
}
