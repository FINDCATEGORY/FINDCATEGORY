"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

export function Terminal() {
  const [history, setHistory] = useState<string[]>([
    "Last login: " + new Date().toLocaleString(),
    "Welcome to macOS Terminal",
    "",
  ])
  const [currentCommand, setCurrentCommand] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim()
    const args = trimmedCmd.split(" ")
    const command = args[0]
    let output = ""

    switch (command) {
      case "ls":
        if (args.includes("-la") || args.includes("-l")) {
          output = `total 32
drwxr-xr-x  8 developer  staff   256 Dec 15 10:30 .
drwxr-xr-x  5 root       admin   160 Dec 10 09:00 ..
drwx------  3 developer  staff    96 Dec 15 10:30 Desktop
drwx------  4 developer  staff   128 Dec 14 15:20 Documents
drwx------  5 developer  staff   160 Dec 15 09:45 Downloads
drwx------  3 developer  staff    96 Dec 12 14:00 Music
drwx------  4 developer  staff   128 Dec 13 11:30 Pictures
drwx------  2 developer  staff    64 Dec 11 16:00 Videos`
        } else {
          output = "Desktop  Documents  Downloads  Music  Pictures  Videos"
        }
        break
      case "pwd":
        output = "/Users/developer"
        break
      case "whoami":
        output = "developer"
        break
      case "date":
        output = new Date().toString()
        break
      case "clear":
        setHistory([])
        return
      case "help":
        output =
          "Available commands:\n  ls [-la]     - list directory contents\n  pwd          - print working directory\n  whoami       - print current user\n  date         - display current date and time\n  clear        - clear terminal screen\n  cat <file>   - display file contents\n  echo <text>  - print text to terminal\n  mkdir <dir>  - create directory\n  touch <file> - create file\n  rm <file>    - remove file\n  cd <dir>     - change directory\n  git          - git commands\n  npm          - npm commands\n  node         - node.js\n  python       - python interpreter\n  neofetch     - system information\n  help         - show this help message"
        break
      case "cat":
        if (args[1]) {
          output = `Contents of ${args[1]}:\nThis is a sample file content.`
        } else {
          output = "cat: missing file operand"
        }
        break
      case "echo":
        output = args.slice(1).join(" ")
        break
      case "mkdir":
        if (args[1]) {
          output = `Directory '${args[1]}' created`
        } else {
          output = "mkdir: missing operand"
        }
        break
      case "touch":
        if (args[1]) {
          output = `File '${args[1]}' created`
        } else {
          output = "touch: missing file operand"
        }
        break
      case "rm":
        if (args[1]) {
          output = `File '${args[1]}' removed`
        } else {
          output = "rm: missing operand"
        }
        break
      case "cd":
        if (args[1]) {
          output = `Changed directory to ${args[1]}`
        } else {
          output = "cd: missing directory operand"
        }
        break
      case "python":
      case "python3":
        if (args.includes("--version") || args.includes("-V")) {
          output = "Python 3.11.5"
        } else {
          output = "Python 3.11.5\nType 'help' for more information."
        }
        break
      case "neofetch":
        output = `
                    ###                  developer@macOS
                  ####                   ----------------
                 ###                     OS: macOS Sonoma 14.0
         #######    #######              Host: MacBook Pro (16-inch, 2023)
       ######################            Kernel: Darwin 23.0.0
      #####################              Uptime: 2 days, 5 hours
      ####################               Shell: zsh 5.9
      ####################               Resolution: 3456x2234
      #####################              DE: Aqua
       ######################            WM: Quartz Compositor
        ####################             Terminal: Terminal.app
          ################               CPU: Apple M3 Max
             ####     ####                GPU: Apple M3 Max
                                          Memory: 8192MB / 36864MB
        `
        break
      case "git":
        if (args.includes("status")) {
          output =
            "On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean"
        } else if (args.includes("branch")) {
          output = "* main\n  develop\n  feature/new-ui"
        } else if (args.includes("log")) {
          output =
            "commit a1b2c3d (HEAD -> main)\nAuthor: Developer <dev@example.com>\nDate:   " +
            new Date().toDateString() +
            "\n\n    Initial commit"
        } else if (args.includes("clone")) {
          output =
            "Cloning into 'repository'...\nremote: Counting objects: 100, done.\nReceiving objects: 100% (100/100), done."
        } else if (args.includes("pull")) {
          output = "Already up to date."
        } else if (args.includes("push")) {
          output = "Everything up-to-date"
        } else {
          output =
            "usage: git [--version] [--help] [-C <path>] [-c <name>=<value>]\n           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]\n           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]\n           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]\n           <command> [<args>]"
        }
        break
      case "npm":
        if (args.includes("--version") || args.includes("-v")) {
          output = "10.2.4"
        } else if (args.includes("install") || args.includes("i")) {
          output = "added 245 packages in 3s"
        } else if (args.includes("start")) {
          output = "> dev\n> next dev\n\n   ▲ Next.js 14.0.0\n   - Local:        http://localhost:3000"
        } else {
          output = "npm v10.2.4\n\nUsage: npm <command>"
        }
        break
      case "node":
        if (args.includes("--version") || args.includes("-v")) {
          output = "v20.10.0"
        } else {
          output = "Welcome to Node.js v20.10.0\nType '.help' for more information."
        }
        break
      case "":
        break
      default:
        output = `zsh: command not found: ${command}`
    }

    setHistory([...history, `developer@macOS ~ % ${cmd}`, output])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentCommand.trim()) {
      executeCommand(currentCommand)
      setCurrentCommand("")
    }
  }

  return (
    <div
      ref={terminalRef}
      className="h-full bg-black text-green-400 font-mono text-xs md:text-sm p-4 overflow-auto cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {history.map((line, i) => (
        <div key={i} className="leading-relaxed whitespace-pre-wrap break-all">
          {line}
        </div>
      ))}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap">
        <span className="text-blue-400">developer@macOS</span>
        <span className="text-white">~</span>
        <span className="text-purple-400">%</span>
        <input
          ref={inputRef}
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          className="flex-1 min-w-[200px] bg-transparent outline-none text-green-400"
          autoFocus
        />
      </form>
    </div>
  )
}
