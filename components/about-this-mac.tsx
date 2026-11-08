"use client"

interface AboutThisMacProps {
  onClose: () => void
}

export function AboutThisMac({ onClose }: AboutThisMacProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] animate-fade-in p-4">
      <div className="bg-[#f5f5f7] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="relative bg-white p-6 sm:p-8 flex flex-col items-center border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 transition-all flex items-center justify-center"
            aria-label="Close"
          >
            <span className="text-[8px] text-red-900">✕</span>
          </button>

          <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 64 64" className="w-10 h-10 sm:w-12 sm:h-12" fill="white">
              <path d="M32 8C18.745 8 8 18.745 8 32s10.745 24 24 24 24-10.745 24-24S45.255 8 32 8zm0 40c-8.837 0-16-7.163-16-16s7.163-16 16-16 16 7.163 16 16-7.163 16-16 16z" />
              <circle cx="32" cy="32" r="8" />
            </svg>
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">MacBook Pro</h1>
          <p className="text-xs sm:text-sm text-gray-500">16-inch, 2021</p>
        </div>

        {/* System Info */}
        <div className="px-6 sm:px-8 py-4 sm:py-6 space-y-2 sm:space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Chip</span>
            <span className="font-medium text-gray-800">Apple M1 Pro</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Memory</span>
            <span className="font-medium text-gray-800">16 GB</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Startup disk</span>
            <span className="font-medium text-gray-800">Macintosh HD</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Serial number</span>
            <span className="font-medium text-gray-800 text-xs sm:text-sm">X02YZ1ZYZX</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">macOS</span>
            <span className="font-medium text-gray-800">Sequoia 15.0</span>
          </div>
        </div>

        {/* More Info Button */}
        <div className="px-6 sm:px-8 pb-4 sm:pb-6">
          <button className="w-full px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium border border-gray-300 text-sm">
            More Info...
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 pb-4 sm:pb-6 text-center">
          <p className="text-xs text-gray-500">Regulatory Certification</p>
          <p className="text-xs text-gray-500 mt-1">™ and © 1983-2024 Apple Inc.</p>
          <p className="text-xs text-gray-500">All Rights Reserved.</p>
        </div>
      </div>
    </div>
  )
}
