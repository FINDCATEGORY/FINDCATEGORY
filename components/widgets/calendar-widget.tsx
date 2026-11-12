"use client"

export function CalendarWidget() {
  const today = new Date()
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" })
  const monthName = today.toLocaleDateString("en-US", { month: "long" })
  const date = today.getDate()
  const year = today.getFullYear()

  return (
    <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-transparent dark:border-white/10 transition-colors w-40">
      <div className="text-center">
        <div className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide">{dayName}</div>
        <div className="text-5xl font-bold text-red-500 my-2">{date}</div>
        <div className="text-sm font-medium text-gray-700 dark:text-zinc-200">
          {monthName} {year}
        </div>
      </div>
    </div>
  )
}
