<#
.SYNOPSIS
Install or uninstall all three skills with rollback and recoverable backups.
#>
[CmdletBinding()]
param(
    [switch]$Uninstall,
    [string]$Target = (Join-Path $env:USERPROFILE '.claude\skills')
)
$ErrorActionPreference = 'Stop'
$Skills = @('rust-learn-init', 'rust-learn-continue', 'rust-learn-status')
$RepoDir = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$Target = [IO.Path]::GetFullPath($Target)
function Test-Within([string]$Child, [string]$Parent) {
    return $Child.Equals($Parent, [StringComparison]::OrdinalIgnoreCase) -or
        $Child.StartsWith($Parent.TrimEnd('\', '/') + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)
}
function Assert-NoLinks([string]$Path) {
    $cursor = $Path
    while ($cursor) {
        if (Test-Path -LiteralPath $cursor) {
            $item = Get-Item -LiteralPath $cursor -Force
            if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Linked path is not supported: $cursor" }
        }
        $parent = Split-Path -Parent $cursor
        if ($parent -eq $cursor) { break }
        $cursor = $parent
    }
}
function Assert-Skill([string]$Path, [string]$Name) {
    Assert-NoLinks $Path
    $entry = Join-Path $Path 'SKILL.md'
    if (-not (Test-Path -LiteralPath $entry -PathType Leaf)) { throw "Missing skill entrypoint: $entry" }
    if ([IO.File]::ReadAllText($entry) -notmatch "(?m)^name: $([regex]::Escape($Name))\r?$") { throw "Unexpected skill identity: $entry" }
    $linked = Get-ChildItem -LiteralPath $Path -Recurse -Force | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }
    if ($linked) { throw "Skill contains linked files: $Path" }
}
if ($Target -eq [IO.Path]::GetPathRoot($Target)) { throw 'A filesystem root cannot be an installation target.' }
if ((Test-Within $Target $RepoDir) -or (Test-Within $RepoDir $Target)) { throw 'Installation target must not overlap the source checkout.' }
Assert-NoLinks $Target
foreach ($skill in $Skills) {
    $destination = Join-Path $Target $skill
    if (Test-Path -LiteralPath $destination) { Assert-Skill $destination $skill }
    if (-not $Uninstall) { Assert-Skill (Join-Path $RepoDir "skills\$skill") $skill }
}
if ($Uninstall -and -not (Test-Path -LiteralPath $Target)) { Write-Host 'Nothing installed.'; return }
[IO.Directory]::CreateDirectory($Target) | Out-Null
$TransactionParent = Split-Path -Parent $Target
$Transaction = Join-Path $TransactionParent ('.rust-apprentice-backup-' + [guid]::NewGuid().ToString('N'))
if (-not (Test-Within $Transaction $TransactionParent)) { throw 'Invalid transaction path.' }
[IO.Directory]::CreateDirectory((Join-Path $Transaction 'old')) | Out-Null
[IO.Directory]::CreateDirectory((Join-Path $Transaction 'staged')) | Out-Null
$MovedOld = @()
$Installed = @()
try {
    if (-not $Uninstall) {
        foreach ($skill in $Skills) {
            $source = Join-Path $RepoDir "skills\$skill"
            $staged = Join-Path $Transaction "staged\$skill"
            Copy-Item -LiteralPath $source -Destination $staged -Recurse
            Assert-Skill $staged $skill
            foreach ($file in Get-ChildItem -LiteralPath $source -File -Recurse -Force) {
                $relative = $file.FullName.Substring($source.Length).TrimStart('\', '/')
                $copied = Join-Path $staged $relative
                if ((Get-FileHash -LiteralPath $file.FullName).Hash -ne (Get-FileHash -LiteralPath $copied).Hash) { throw "Copy verification failed: $relative" }
            }
        }
    }
    foreach ($skill in $Skills) {
        $destination = Join-Path $Target $skill
        if (Test-Path -LiteralPath $destination) {
            Move-Item -LiteralPath $destination -Destination (Join-Path $Transaction "old\$skill")
            $MovedOld += $skill
        }
        if (-not $Uninstall) {
            Move-Item -LiteralPath (Join-Path $Transaction "staged\$skill") -Destination $destination
            $Installed += $skill
        }
    }
} catch {
    $failure = $_
    foreach ($skill in $Installed) {
        Move-Item -LiteralPath (Join-Path $Target $skill) -Destination (Join-Path $Transaction "staged\$skill")
    }
    foreach ($skill in $MovedOld) {
        Move-Item -LiteralPath (Join-Path $Transaction "old\$skill") -Destination (Join-Path $Target $skill)
    }
    throw "Installation failed; previous skills restored. Recovery files: $Transaction. Cause: $failure"
}
if ($Uninstall) { Write-Host "Uninstalled the three skills. Recoverable copies: $Transaction\old" }
else { Write-Host "Installed the three skills. Previous versions: $Transaction\old"; Write-Host 'In Claude Code, run: /rust-learn-init' }
Write-Host 'Learning workspaces and unrelated skills were not modified.'
