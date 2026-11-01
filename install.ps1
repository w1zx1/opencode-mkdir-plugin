<#
.SYNOPSIS
    Installs the opencode-mkdir-plugin into the global OpenCode plugin directory.

.DESCRIPTION
    Copies the plugin to %USERPROFILE%\.config\opencode\plugins\opencode-mkdir-plugin,
    where OpenCode v2 discovers plugins automatically.

.PARAMETER Uninstall
    Removes the installed copy of the plugin.

.EXAMPLE
    .\install.ps1

.EXAMPLE
    .\install.ps1 -Uninstall
#>
[CmdletBinding()]
param(
    [switch]$Uninstall
)

$ErrorActionPreference = "Stop"

$target = Join-Path $env:USERPROFILE ".config\opencode\plugins\opencode-mkdir-plugin"

if ($Uninstall) {
    if (Test-Path $target) {
        Remove-Item -Recurse -Force $target
        Write-Host "Removed $target"
    } else {
        Write-Host "Nothing to remove: $target does not exist"
    }
    Write-Host "Reload OpenCode with /reload, or run: opencode service restart"
    return
}

if (-not (Test-Path (Join-Path $PSScriptRoot "src\tui.ts"))) {
    throw "src\tui.ts not found next to this script. Run install.ps1 from the plugin directory."
}

New-Item -ItemType Directory -Force -Path $target | Out-Null

Copy-Item -Recurse -Force (Join-Path $PSScriptRoot "src") $target
Copy-Item -Force (Join-Path $PSScriptRoot "package.json") $target
Copy-Item -Force (Join-Path $PSScriptRoot "README.md") $target

Write-Host "Installed to $target"

# A plugin loaded from the global plugins directory must not also be listed in
# cli.json, otherwise OpenCode registers it twice.
$cliJson = Join-Path $env:USERPROFILE ".config\opencode\cli.json"
if (Test-Path $cliJson) {
    $config = (Get-Content -Raw $cliJson) -replace '\\', '/'
    $source = $PSScriptRoot -replace '\\', '/'
    if ($config.ToLowerInvariant().Contains($source.ToLowerInvariant())) {
        Write-Warning "cli.json still references $source."
        Write-Warning "Remove that entry from the plugins list to avoid loading the plugin twice."
    }
}

Write-Host "Reload OpenCode with /reload, or run: opencode service restart"
