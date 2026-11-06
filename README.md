# opencode-mkdir-plugin

An OpenCode V2 TUI plugin that adds a `/mkdir` command. It creates a directory inside the current working directory and immediately switches OpenCode into it, so a new project folder can be scaffolded in a single step.

```
/cd ~/Downloads
/mkdir opencode-foo-plugin
```

`~/Downloads/opencode-foo-plugin` is created and becomes the active working directory.

## Requirements

- OpenCode `2.2.5` or newer
- Node.js 18+

## Installation

### Windows

```powershell
.\install.ps1
```

The script copies the plugin into `%USERPROFILE%\.config\opencode\plugins\opencode-mkdir-plugin`, where OpenCode discovers plugins automatically. Restart OpenCode or run `/reload` in the TUI to load it.

To remove the installed copy:

```powershell
.\install.ps1 -Uninstall
```

### Other platforms

Point `cli.json` at the plugin directory:

```json
{
  "plugins": ["/absolute/path/to/opencode-mkdir-plugin"]
}
```

Only one installation method should be active at a time — registering the plugin both through the script and through `cli.json` makes `/mkdir` appear twice.

## Usage

```
/mkdir <path>
```

Examples:

```
/mkdir my-project
/mkdir packages/core
/mkdir ~/projects/new-app
/mkdir "folder with spaces"
```

The path may be absolute or relative to the current working directory. A leading `~` expands to the user's home directory. Quotes around a path are optional and are stripped.

## Behavior

- Registers a global slash command `/mkdir`. It is intentionally not added to the `Ctrl+P` command palette.
- Resolves the base directory from the active session's directory; if there is no active session, it uses the TUI's current location (the directory selected via `/cd`).
- Creates missing parent directories as needed (`mkdir -p` semantics).
- Dispatches the built-in `session.cd` command for the target path, so the switch follows exactly the same logic as the native `/cd`: the location changes on the home screen, and an open session is moved to the new directory.
- Reports the result through a toast: success with the formatted path, a warning on missing arguments, and an error with the underlying message on filesystem failures.

## Notes

The built-in `/cd` offers directory autocomplete. If the suggestion list is open after typing a path, `Enter` may accept a suggestion instead of running the command; press `Esc` and then `Enter`. `/mkdir` itself has no autocomplete, so this does not affect it.

## License

MIT
