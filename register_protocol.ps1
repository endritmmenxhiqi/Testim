$currentDir = Get-Location
$exePath = "$currentDir\lockdown-client\bin\Debug\net8.0-windows\LockdownBrowser.exe"

# Check if file exists, if not try Release folder
if (-not (Test-Path $exePath)) {
    $exePath = "$currentDir\lockdown-client\bin\Release\net8.0-windows\LockdownBrowser.exe"
}

if (-not (Test-Path $exePath)) {
    Write-Host "ERROR: LockdownBrowser.exe not found! Please BUILD the project in Visual Studio first." -ForegroundColor Red
    exit
}

Write-Host "Found App at: $exePath" -ForegroundColor Green

# Register Protocol
$registryPath = "HKCU:\Software\Classes\seb"
New-Item -Path $registryPath -Force | Out-Null
New-ItemProperty -Path $registryPath -Name "(default)" -Value "URL:SEB Protocol" -PropertyType String -Force | Out-Null
New-ItemProperty -Path $registryPath -Name "URL Protocol" -Value "" -PropertyType String -Force | Out-Null

$commandPath = "$registryPath\shell\open\command"
New-Item -Path $commandPath -Force | Out-Null
New-ItemProperty -Path $commandPath -Name "(default)" -Value "`"$exePath`" `"%1`"" -PropertyType String -Force | Out-Null

Write-Host "SUCCESS! Protocol 'seb://' registered." -ForegroundColor Cyan
Write-Host "You can now click 'Launch Secure Browser' on the website." -ForegroundColor Cyan
