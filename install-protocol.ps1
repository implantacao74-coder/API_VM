$ErrorActionPreference = "Stop"

$protocolKey = "HKCU:\Software\Classes\feige-tester"
$commandKey = Join-Path $protocolKey "shell\open\command"
$handlerScript = Join-Path $PSScriptRoot "start-backend.ps1"
$powershellPath = (Get-Command powershell.exe -ErrorAction Stop).Source
$handlerCommand = "`"$powershellPath`" -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$handlerScript`""

if (Test-Path $protocolKey) {
  $registeredCommand = $null
  if (Test-Path $commandKey) {
    $registeredCommand = (Get-Item $commandKey).GetValue("")
  }
  if ($registeredCommand -and $registeredCommand -ne $handlerCommand) {
    throw "O protocolo feige-tester já está registrado por outro comando; nenhuma alteração foi feita."
  }
}

New-Item -Path $protocolKey -Force | Out-Null
Set-Item -Path $protocolKey -Value "URL:Feige API Tester"
New-ItemProperty -Path $protocolKey -Name "URL Protocol" -Value "" -PropertyType String -Force | Out-Null
New-Item -Path $commandKey -Force | Out-Null
Set-Item -Path $commandKey -Value $handlerCommand

Write-Output "Protocolo feige-tester instalado para este usuário."
Write-Output "Ao autenticar, confirme a abertura do Feige API Tester se o navegador solicitar."
