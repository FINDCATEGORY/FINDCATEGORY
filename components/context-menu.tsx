"use client"

interface ContextMenuProps {
  x: number
  y: number
  items: Array<{ label: string; subLabel?: string; action: () => void; divider?: boolean }>
  onClose?: () => void
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  return (
    <div
      className="fixed bg-[var(--macos-menu-bg)] macos-blur border border-black/10 dark:border-white/10 rounded-lg shadow-lg py-1 z-[60] min-w-[220px] text-slate-900 dark:text-zinc-100"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, index) =>
        item.divider ? (
          <div key={index} className="h-px bg-black/10 dark:bg-white/10 my-1" />
        ) : (
          <button
            key={index}
            type="button"
            className="w-full px-4 py-1.5 text-left text-sm whitespace-nowrap hover:bg-blue-500 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            onClick={() => {
              item.action()
              onClose?.()
            }}
          >
            <span>{item.label}</span>
            {item.subLabel && <span className="text-xs opacity-60">{item.subLabel}</span>}
          </button>
        ),
      )}
    </div>
  )
}
