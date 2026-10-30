$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "credentials.ps1")
$credentials = Get-FeigeCredentials
$previousAppKey = [Environment]::GetEnvironmentVariable("FEIGE_APP_KEY", "Process")
$previousAppSecret = [Environment]::GetEnvironmentVariable("FEIGE_APP_SECRET", "Process")

try {
  [Environment]::SetEnvironmentVariable("FEIGE_APP_KEY", $credentials.AppKey, "Process")
  [Environment]::SetEnvironmentVariable("FEIGE_APP_SECRET", $credentials.AppSecret, "Process")
  & node (Join-Path $PSScriptRoot "server.js")
  if ($LASTEXITCODE -ne 0) {
    throw "The API tester server exited with code $LASTEXITCODE."
  }
} finally {
  [Environment]::SetEnvironmentVariable("FEIGE_APP_KEY", $previousAppKey, "Process")
  [Environment]::SetEnvironmentVariable("FEIGE_APP_SECRET", $previousAppSecret, "Process")
  $credentials = $null
}
