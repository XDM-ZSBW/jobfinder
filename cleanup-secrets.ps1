#!/usr/bin/env pwsh
# Clean up temporary secret files
# Run this after deployment or anytime you want to ensure no secrets are lying around

$ErrorActionPreference = "Stop"

Write-Host "=== Cleaning up temporary secret files ===" -ForegroundColor Cyan
Write-Host ""

$secretFiles = @(
    "jwt.txt",
    "gemini.txt", 
    "dbpass.txt",
    "api-keys.txt",
    "*.key",
    "*.pem",
    "setup-vm.sh",
    "setup-vm-remote.sh",
    "fix-docker.sh",
    "vm-config.sh"
)

$found = 0
foreach ($pattern in $secretFiles) {
    $files = Get-ChildItem -Path . -Filter $pattern -File -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        Write-Host "Removing: $($file.Name)" -ForegroundColor Yellow
        Remove-Item $file.FullName -Force
        $found++
    }
}

# Check subdirectories for common secret files
$recursivePatterns = @("jwt.txt", "gemini.txt", "dbpass.txt", "*.credentials", "*.secrets")
foreach ($pattern in $recursivePatterns) {
    $files = Get-ChildItem -Path . -Filter $pattern -File -Recurse -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if ($file.FullName -notmatch "node_modules|\.git") {
            Write-Host "Removing: $($file.FullName)" -ForegroundColor Yellow
            Remove-Item $file.FullName -Force
            $found++
        }
    }
}

Write-Host ""
if ($found -eq 0) {
    Write-Host "✓ No temporary secret files found" -ForegroundColor Green
} else {
    Write-Host "✓ Cleaned up $found file(s)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Secure locations for credentials:" -ForegroundColor Cyan
Write-Host "  - Porkbun: $env:USERPROFILE\.porkbun\credentials.json" -ForegroundColor White
Write-Host "  - Google Cloud: Google Secret Manager (futurelink-private-112912460)" -ForegroundColor White
Write-Host ""
