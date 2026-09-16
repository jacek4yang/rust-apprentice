<#
.SYNOPSIS
    Install the rust-apprentice skills into the personal Claude Code skills directory.

.DESCRIPTION
    Copies the two skill directories from this checkout into $env:USERPROFILE\.claude\skills. Nothing else on
    the system is modified, and your learning workspace is never touched.

.PARAMETER Uninstall
    Remove the two skills instead of installing them.

.PARAMETER Target
    Override the skills directory. Defaults to $env:USERPROFILE\.claude\skills.

.EXAMPLE
    .\scripts\install.ps1
    .\scripts\install.ps1 -Uninstall
#>

[CmdletBinding()]
param(
    [switch]$Uninstall,
    [string]$Target = (Join-Path $env:USERPROFILE ".claude\skills")
)

$ErrorActionPreference = "Stop"

$Skills = @("rust-learn-init", "rust-learn-continue", "rust-learn-status")
$RepoDir = Split-Path -Parent $PSScriptRoot

if ($Uninstall) {
    foreach ($skill in $Skills) {
        $path = Join-Path $Target $skill
        if (Test-Path $path) {
            Remove-Item -Recurse -Force $path
            Write-Host "Removed $path"
        } else {
            Write-Host "Not installed: $path"
        }
    }
    Write-Host "Done. Your learning workspace was not touched."
    exit 0
}

foreach ($skill in $Skills) {
    $source = Join-Path $RepoDir "skills\$skill\SKILL.md"
    if (-not (Test-Path $source)) {
        Write-Error "Cannot find skills\$skill\SKILL.md - run this script from a checkout of the repository."
    }
}

New-Item -ItemType Directory -Force -Path $Target | Out-Null

foreach ($skill in $Skills) {
    $destination = Join-Path $Target $skill
    if (Test-Path $destination) { Remove-Item -Recurse -Force $destination }
    Copy-Item -Recurse -Path (Join-Path $RepoDir "skills\$skill") -Destination $destination
    Write-Host "Installed $destination"
}

Write-Host ""
Write-Host "In Claude Code, run: /rust-learn-init"
