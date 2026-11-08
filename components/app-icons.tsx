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

export const CalendarIcon = () => {
  const today = new Date().getDate()
  return (
    <div className="w-full h-full rounded-[22%] bg-white flex flex-col overflow-hidden shadow-lg">
      <div className="h-1/4 bg-gradient-to-b from-red-500 to-red-600" />
      <div className="flex-1 flex items-center justify-center">
        <span className="text-3xl md:text-4xl font-bold text-gray-800">{today}</span>
      </div>
    </div>
  )
}

export const PhotosIcon = () => (
  <div className="w-full h-full rounded-[22%] overflow-hidden">
    <img
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/493155-vxGeIhTw0EvXAZbKcAyW67QfvNVrfq.webp"
      alt="Photos"
      className="w-full h-full object-cover"
    />
  </div>
)

export const MusicIcon = () => (
  <div className="w-full h-full rounded-[22%] overflow-hidden">
    <img
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images-vvoaxB7U9YJzKLYcq9aiQZVl3SnXd1.jpg"
      alt="Music"
      className="w-full h-full object-cover"
    />
  </div>
)

export const NotesIcon = () => (
  <div className="w-full h-full rounded-[22%] overflow-hidden">
    <img
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/notes_macos_bigsur_icon_189901-y0UlhiIg1eRRO2QrupDcgrpio0AqcE.png"
      alt="Notes"
      className="w-full h-full object-cover"
    />
  </div>
)

export const VSCodeIcon = () => (
  <div className="w-full h-full rounded-[22%] bg-[#1e1e1e] flex items-center justify-center overflow-hidden">
    <img
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3v8w7AQLA19COX4w3UYNrr8IjY3s2S.png"
      alt="VS Code"
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

export const DockerIcon = () => (
  <div className="w-full h-full rounded-[22%] overflow-hidden">
    <img
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/docker_macos_bigsur_icon_190231-7zOXNNfnYBISTonAUXcB5M7GL8xaXD.png"
      alt="Docker"
      className="w-full h-full object-cover"
    />
  </div>
)

export const GitIcon = () => (
  <div className="w-full h-full rounded-[22%] overflow-hidden">
    <img
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images-paMp389RC6z0xNSQzqWkrJf2znOiY5.png"
      alt="Git"
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
