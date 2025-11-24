#!/usr/bin/env pwsh
# Update jobmatch.zip DNS to point to new VM

$ErrorActionPreference = "Stop"

# Load credentials
$creds = Get-Content $env:USERPROFILE\.porkbun\credentials.json | ConvertFrom-Json
$domain = "jobmatch.zip"
$newIP = "136.115.106.188"

Write-Host "=== Updating DNS for $domain ===" -ForegroundColor Cyan
Write-Host "New IP: $newIP" -ForegroundColor Green
Write-Host ""

# Fetch existing records
Write-Host "[1/4] Fetching current DNS records..." -ForegroundColor Yellow
$retrieveBody = @{
    apikey = $creds.api_key
    secretapikey = $creds.secret_key
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://porkbun.com/api/json/v3/dns/retrieve/$domain" `
        -Method Post `
        -Body $retrieveBody `
        -ContentType "application/json"
    
    if ($response.status -eq "SUCCESS") {
        Write-Host "✓ Current records retrieved" -ForegroundColor Green
        $aRecords = $response.records | Where-Object { $_.type -eq "A" }
        Write-Host "Found $($aRecords.Count) A records:" -ForegroundColor White
        $aRecords | ForEach-Object { Write-Host "  - $($_.name) -> $($_.content)" }
    } else {
        Write-Host "✗ Error: $($response.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ API Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure API access is enabled for $domain:" -ForegroundColor Yellow
    Write-Host "  1. Go to https://porkbun.com/account/domainsSpeedy" -ForegroundColor White
    Write-Host "  2. Click on $domain" -ForegroundColor White
    Write-Host "  3. Enable API Access" -ForegroundColor White
    exit 1
}

Write-Host ""

# Delete existing A records for @ and www
Write-Host "[2/4] Removing old A records..." -ForegroundColor Yellow
$recordsToDelete = $aRecords | Where-Object { $_.name -in @("jobmatch.zip", "www.jobmatch.zip") }

foreach ($record in $recordsToDelete) {
    $deleteBody = @{
        apikey = $creds.api_key
        secretapikey = $creds.secret_key
    } | ConvertTo-Json
    
    try {
        $deleteResponse = Invoke-RestMethod `
            -Uri "https://porkbun.com/api/json/v3/dns/delete/$domain/$($record.id)" `
            -Method Post `
            -Body $deleteBody `
            -ContentType "application/json"
        
        if ($deleteResponse.status -eq "SUCCESS") {
            Write-Host "  ✓ Deleted: $($record.name) ($($record.content))" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ⚠ Could not delete $($record.name): $_" -ForegroundColor Yellow
    }
}

Write-Host ""

# Create new A record for @ (root domain)
Write-Host "[3/4] Creating A record for @ (root domain)..." -ForegroundColor Yellow
$rootBody = @{
    apikey = $creds.api_key
    secretapikey = $creds.secret_key
    name = ""
    type = "A"
    content = $newIP
    ttl = "600"
} | ConvertTo-Json

try {
    $rootResponse = Invoke-RestMethod `
        -Uri "https://porkbun.com/api/json/v3/dns/create/$domain" `
        -Method Post `
        -Body $rootBody `
        -ContentType "application/json"
    
    if ($rootResponse.status -eq "SUCCESS") {
        Write-Host "  ✓ Created: jobmatch.zip -> $newIP" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Error: $($rootResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ Error: $_" -ForegroundColor Red
}

Write-Host ""

# Create new A record for www
Write-Host "[4/4] Creating A record for www..." -ForegroundColor Yellow
$wwwBody = @{
    apikey = $creds.api_key
    secretapikey = $creds.secret_key
    name = "www"
    type = "A"
    content = $newIP
    ttl = "600"
} | ConvertTo-Json

try {
    $wwwResponse = Invoke-RestMethod `
        -Uri "https://porkbun.com/api/json/v3/dns/create/$domain" `
        -Method Post `
        -Body $wwwBody `
        -ContentType "application/json"
    
    if ($wwwResponse.status -eq "SUCCESS") {
        Write-Host "  ✓ Created: www.jobmatch.zip -> $newIP" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Error: $($wwwResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== DNS Update Complete! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "New DNS records:" -ForegroundColor Yellow
Write-Host "  jobmatch.zip     A  $newIP" -ForegroundColor White
Write-Host "  www.jobmatch.zip A  $newIP" -ForegroundColor White
Write-Host ""
Write-Host "Note: DNS propagation can take 5-60 minutes" -ForegroundColor Gray
Write-Host ""
Write-Host "Verify with:" -ForegroundColor Yellow
Write-Host "  nslookup jobmatch.zip" -ForegroundColor White
Write-Host "  nslookup www.jobmatch.zip" -ForegroundColor White
Write-Host ""
