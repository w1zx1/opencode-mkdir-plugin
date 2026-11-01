import { Plugin } from "@opencode/plugin/tui"
import { mkdir } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

function expandHome(value: string) {
  if (value === "~") return os.homedir()
  if (value.startsWith("~/") || value.startsWith("~\\")) {
    return path.join(os.homedir(), value.slice(2))
  }
  return value
}

function unquote(value: string) {
  const trimmed = value.trim()
  const first = trimmed[0]
  const last = trimmed[trimmed.length - 1]
  if (trimmed.length >= 2 && (first === '"' || first === "'") && first === last) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

export default Plugin.define({
  id: "mkdir",
  setup(context) {
    context.keymap.layer(() => ({
      mode: "global",
      commands: [
        {
          id: "mkdir",
          title: "Create directory and move into it",
          description: "Create directory and move into it",
          group: "Directory",
          palette: true,
          suggested: true,
          slash: { name: "mkdir", arguments: true },
          run: async (input) => {
            const name = unquote(input ?? "")

            if (!name) {
              context.ui.toast.show({
                title: "mkdir",
                message: "Usage: /mkdir <directory>",
                variant: "warning",
              })
              return
            }

            // Prefer the active session's directory, then the TUI's selected
            // location. This mirrors how the built-in /cd resolves paths.
            const route = context.ui.router.current()
            const sessionID = route.type === "session" ? route.sessionID : undefined

            if (sessionID) {
              await context.data.session.sync(sessionID).catch(() => {})
            }

            const base =
              (sessionID ? context.data.session.get(sessionID)?.location.directory : undefined) ??
              context.location?.directory ??
              context.data.location.default().directory

            const target = path.resolve(base, expandHome(name))
            const display = context.ui.format.path(target)

            try {
              await mkdir(target, { recursive: true })
            } catch (error) {
              context.ui.toast.show({
                title: "mkdir failed",
                message: error instanceof Error ? error.message : String(error),
                variant: "error",
                duration: 6000,
              })
              return
            }

            context.ui.toast.show({
              title: "mkdir",
              message: `Created ${display}`,
              variant: "success",
              duration: 2000,
            })

            // Reuse the built-in session.cd command so moving an active session
            // or the TUI location follows exactly the same logic as /cd.
            context.keymap.dispatch("session.cd", target)
          },
        },
      ],
    }))
  },
})
