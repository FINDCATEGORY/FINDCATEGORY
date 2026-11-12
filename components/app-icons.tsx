export const FinderIcon = () => (
  <div className="w-full h-full rounded-[22%] overflow-hidden">
    <img
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images-GffQFvnmGS4oNDht4LFcZ2BqkEsK2D.jpg"
      alt="Finder"
      className="w-full h-full object-cover"
    />
  </div>
)

export const SafariIcon = () => (
  <div className="w-full h-full rounded-[22%] overflow-hidden">
    <img
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images-V4Q21hXOK9GNFULWIvh5QmeJfVBfSO.jpg"
      alt="Safari"
      className="w-full h-full object-cover"
    />
  </div>
)

export const MessagesIcon = () => (
  <div className="w-full h-full rounded-[22%] bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
    <svg viewBox="0 0 64 64" className="w-3/4 h-3/4" fill="white">
      <path d="M32 8C18.745 8 8 17.523 8 29.333c0 6.4 3.2 12.134 8.267 16.134v8.8l8.533-4.667c2.4.8 4.933 1.2 7.2 1.2 13.255 0 24-9.523 24-21.333S45.255 8 32 8z" />
    </svg>
  </div>
)

export const SoundIcon = () => (
  <div className="w-full h-full rounded-[22%] overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500 flex items-center justify-center shadow-inner relative">
    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-[22%]" />
    <div className="relative flex items-center justify-center text-white drop-shadow-md">
      <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07l-1.41-1.41a3 3 0 0 0 0-4.24l1.41-1.42zM19.07 4.93a10 10 0 0 1 0 14.14l-1.41-1.41a8 8 0 0 0 0-11.31l1.41-1.42z" />
      </svg>
    </div>
  </div>
)

export const MusicIcon = SoundIcon


export const NotesIcon = () => (
  <div className="w-full h-full rounded-[22%] overflow-hidden">
    <img
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/notes_macos_bigsur_icon_189901-y0UlhiIg1eRRO2QrupDcgrpio0AqcE.png"
      alt="Notes"
      className="w-full h-full object-cover"
    />
  </div>
)

export const TerminalIcon = () => (
  <div className="w-full h-full rounded-[22%] overflow-hidden">
    <img
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/terminal-2021-06-03-cP8LONJhjquJOgYKNSOIWIy2pZuqxT.webp"
      alt="Terminal"
      className="w-full h-full object-cover"
    />
  </div>
)

export const SettingsIcon = () => (
  <div className="w-full h-full rounded-[22%] overflow-hidden">
    <img
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2b78f13e-cbc8-4e7f-95ad-c00d7c135305-cover-gvYiSJ6pKiss5jkFyGibVGT51FcY3N.png"
      alt="Settings"
      className="w-full h-full object-cover"
    />
  </div>
)

export const LaunchpadIcon = () => (
  <div className="w-full h-full rounded-[22%] bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center p-2 shadow-lg">
    <div className="grid grid-cols-3 gap-1 w-full h-full">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="bg-white rounded-sm" />
      ))}
    </div>
  </div>
)

export const FolderIcon = () => (
  <div className="w-full h-full rounded-[22%] overflow-hidden">
    <img src="https://blob.v0.app/your-folder-image-url.jpg" alt="Folder" className="w-full h-full object-cover" />
  </div>
)

export const DocumentsIcon = () => (
  <div className="w-full h-full rounded-[22%] overflow-hidden">
    <img
      src="https://blob.v0.app/your-documents-image-url.jpg"
      alt="Documents"
      className="w-full h-full object-cover"
    />
  </div>
)

export const DownloadsIcon = () => (
  <div className="w-full h-full rounded-[22%] bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center shadow-lg overflow-hidden">
    <svg viewBox="0 0 64 64" className="w-3/4 h-3/4" fill="white">
      <path d="M8 16c0-2.21 1.79-4 4-4h16l4 4h20c2.21 0 4 1.79 4 4v28c0 2.21-1.79 4-4 4H12c-2.21 0-4-1.79-4-4V16z" />
    </svg>
  </div>
)
