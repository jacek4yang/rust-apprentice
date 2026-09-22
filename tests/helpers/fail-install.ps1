param([string]$Installer, [string]$Target)
$ErrorActionPreference = 'Stop'
$script:Injected = $false
function Move-Item {
    param([string]$LiteralPath, [string]$Destination)
    if (-not $script:Injected -and $LiteralPath -match '[\\/]staged[\\/]rust-learn-continue$') {
        $script:Injected = $true
        throw 'Injected failure during the second skill switch'
    }
    Microsoft.PowerShell.Management\Move-Item -LiteralPath $LiteralPath -Destination $Destination
}
& $Installer -Target $Target
