"use client"

interface ContextMenuProps {
  x: number
  y: number
  items: Array<{ label: string; action: () => void; divider?: boolean }>
}

export function ContextMenu({ x, y, items }: ContextMenuProps) {
  return (
    <div
      className="fixed bg-[var(--macos-menu-bg)] macos-blur border border-black/10 rounded-lg shadow-lg py-1 z-[60] min-w-[200px]"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, index) =>
        item.divider ? (
          <div key={index} className="h-px bg-black/10 my-1" />
        ) : (
          <button
            key={index}
            className="w-full px-4 py-1.5 text-left text-sm hover:bg-blue-500 hover:text-white transition-colors"
            onClick={item.action}
          >
            {item.label}
          </button>
        ),
      )}
    </div>
  )
}
