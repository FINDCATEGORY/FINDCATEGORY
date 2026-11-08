"use client"

export function AnimatedWallpaper() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* macOS Big Sur inspired gradient wallpaper */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B9D] via-[#FFA07A] to-[#FFD700]">
        {/* Layer 1: Pink to Orange wave */}
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: "linear-gradient(135deg, #FF1B6B 0%, #FF6B9D 25%, #FFA07A 50%, transparent 75%)",
          }}
        />

        {/* Layer 2: Orange to Yellow wave */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: "linear-gradient(165deg, transparent 20%, #FF8C42 40%, #FFB347 60%, #FFD700 80%)",
          }}
        />

        {/* Layer 3: Blue accent wave */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background: "linear-gradient(195deg, transparent 50%, #4A90E2 70%, #5DADE2 85%, #85C1E9 100%)",
          }}
        />

        {/* Layer 4: Light blue top accent */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: "linear-gradient(180deg, #87CEEB 0%, #B0E0E6 15%, transparent 40%)",
          }}
        />

        {/* Subtle noise texture for depth */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E\")",
          }}
        />
      </div>
    </div>
  )
}
