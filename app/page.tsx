"use client"

import { useState, useEffect } from "react"
import { MacOSDesktop } from "@/components/macos-desktop"
import { BootScreen } from "@/components/boot-screen"

export default function Home() {
  const [isBooting, setIsBooting] = useState(true)
  const [bootCycle, setBootCycle] = useState(0)

  useEffect(() => {
    setIsBooting(true)
    const timer = setTimeout(() => {
      setIsBooting(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [bootCycle])

  const handleRestart = () => {
    setIsBooting(true)
    setBootCycle((prev) => prev + 1)
  }

  if (isBooting) {
    return <BootScreen />
  }

  return <MacOSDesktop key={bootCycle} onRestart={handleRestart} />
}
