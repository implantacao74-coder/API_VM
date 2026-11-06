$ErrorActionPreference = "Stop"

$protocolKey = "HKCU:\Software\Classes\feige-tester"
$commandKey = Join-Path $protocolKey "shell\open\command"
$handlerScript = Join-Path $PSScriptRoot "start-backend.ps1"

if (-not (Test-Path $protocolKey)) {
  Write-Output "O protocolo feige-tester não está instalado."
  return
}

$registeredCommand = $null
if (Test-Path $commandKey) {
  $registeredCommand = (Get-Item $commandKey).GetValue("")
}
if (-not $registeredCommand -or $registeredCommand -notlike "*$handlerScript*") {
  throw "O protocolo feige-tester aponta para outro comando; nenhuma alteração foi feita."
}

Remove-Item -LiteralPath $protocolKey -Recurse -Force
Write-Output "Protocolo feige-tester removido."
