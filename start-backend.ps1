$ErrorActionPreference = "Stop"

$healthUrl = "http://127.0.0.1:8000/api/health"
$serverScript = Join-Path $PSScriptRoot "server.js"
$logDirectory = Join-Path $PSScriptRoot "logs"
$outputLog = Join-Path $logDirectory "backend.log"
$errorLog = Join-Path $logDirectory "backend-error.log"

function Test-FeigeBackend {
  try {
    $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 2
    return $response.StatusCode -eq 200 -and $response.Content.Contains('"status":"ok"')
  } catch {
    return $false
  }
}

function Test-LocalPortOpen {
  $client = [System.Net.Sockets.TcpClient]::new()
  try {
    $connection = $client.BeginConnect("127.0.0.1", 8000, $null, $null)
    if (-not $connection.AsyncWaitHandle.WaitOne(500)) {
      return $false
    }

    $client.EndConnect($connection)
    return $true
  } catch [System.Net.Sockets.SocketException] {
    return $false
  } finally {
    $client.Dispose()
  }
}

if (Test-FeigeBackend) {
  return
}

if (Test-LocalPortOpen) {
  throw "A porta 8000 já está sendo usada por outro aplicativo."
}

if (-not (Test-Path -LiteralPath $logDirectory -PathType Container)) {
  New-Item -Path $logDirectory -ItemType Directory | Out-Null
}

. (Join-Path $PSScriptRoot "credentials.ps1")
$credentials = Get-FeigeCredentials
$previousAppKey = [Environment]::GetEnvironmentVariable("FEIGE_APP_KEY", "Process")
$previousAppSecret = [Environment]::GetEnvironmentVariable("FEIGE_APP_SECRET", "Process")

try {
  [Environment]::SetEnvironmentVariable("FEIGE_APP_KEY", $credentials.AppKey, "Process")
  [Environment]::SetEnvironmentVariable("FEIGE_APP_SECRET", $credentials.AppSecret, "Process")
  $nodePath = (Get-Command node.exe -ErrorAction Stop).Source
  $serverProcess = Start-Process -FilePath $nodePath `
    -ArgumentList "`"$serverScript`"" `
    -WorkingDirectory $PSScriptRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $outputLog `
    -RedirectStandardError $errorLog `
    -PassThru
} finally {
  [Environment]::SetEnvironmentVariable("FEIGE_APP_KEY", $previousAppKey, "Process")
  [Environment]::SetEnvironmentVariable("FEIGE_APP_SECRET", $previousAppSecret, "Process")
  $credentials = $null
}

$deadline = (Get-Date).AddSeconds(30)
while ((Get-Date) -lt $deadline) {
  Start-Sleep -Milliseconds 500
  if (Test-FeigeBackend) {
    return
  }

  if ($serverProcess.HasExited) {
    throw "O backend encerrou durante a inicialização. Consulte logs\backend-error.log."
  }
}

throw "O backend não respondeu em até 30 segundos. Consulte logs\backend.log e logs\backend-error.log."
