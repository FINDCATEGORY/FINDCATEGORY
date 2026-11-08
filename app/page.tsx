"use client"

import { useState, useEffect } from "react"
import { MacOSDesktop } from "@/components/macos-desktop"
import { BootScreen } from "@/components/boot-screen"

export default function Home() {
  const [isBooting, setIsBooting] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (isBooting) {
    return <BootScreen />
  }

  return <MacOSDesktop />
}
