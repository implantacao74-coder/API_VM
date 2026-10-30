param(
  [string]$BaseUrl = "https://veda.figeth.com/api",
  [string]$Origin = "http://179.145.31.219:5500",
  [string]$LogPath = (Join-Path $PSScriptRoot "logs\auth-test.jsonl"),
  [ValidateRange(1, 300)]
  [int]$TimeoutSeconds = 30
)

$ErrorActionPreference = "Stop"

function ConvertTo-PlainText {
  param([Security.SecureString]$Value)

  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  }
}

function Protect-Text {
  param(
    [AllowNull()]
    [string]$Text,
    [string[]]$Secrets
  )

  if ($null -eq $Text) {
    return $null
  }

  $safeText = $Text
  foreach ($secret in $Secrets) {
    if (-not [string]::IsNullOrEmpty($secret)) {
      $safeText = $safeText.Replace($secret, "[REDACTED]")
    }
  }

  $safeText = [regex]::Replace(
    $safeText,
    '(?i)("?(?:app.?secret|app.?key|access.?token|refresh.?token|authorization)"?\s*:\s*"?)[^",}\s]+',
    '$1[REDACTED]'
  )
  return [regex]::Replace($safeText, '(?i)Bearer\s+[A-Za-z0-9._~+/-]+=*', 'Bearer [REDACTED]')
}

function Protect-Object {
  param(
    [AllowNull()]
    [object]$Value,
    [string[]]$Secrets
  )

  if ($null -eq $Value) {
    return $null
  }

  if ($Value -is [string]) {
    return Protect-Text -Text $Value -Secrets $Secrets
  }

  if ($Value -is [System.Collections.IDictionary]) {
    $safeObject = [ordered]@{}
    foreach ($key in $Value.Keys) {
      if ([string]$key -match '(?i)(secret|token|authorization|app.?key)') {
        $safeObject[$key] = "[REDACTED]"
      } else {
        $safeObject[$key] = Protect-Object -Value $Value[$key] -Secrets $Secrets
      }
    }
    return $safeObject
  }

  if ($Value -is [System.Management.Automation.PSCustomObject]) {
    $safeObject = [ordered]@{}
    foreach ($property in $Value.PSObject.Properties) {
      if ($property.Name -match '(?i)(secret|token|authorization|app.?key)') {
        $safeObject[$property.Name] = "[REDACTED]"
      } else {
        $safeObject[$property.Name] = Protect-Object -Value $property.Value -Secrets $Secrets
      }
    }
    return $safeObject
  }

  if ($Value -is [array]) {
    $safeArray = @()
    foreach ($item in $Value) {
      $safeArray += ,(Protect-Object -Value $item -Secrets $Secrets)
    }
    return ,$safeArray
  }

  return $Value
}

function Write-RunLog {
  param([object]$Entry)

  $logDirectory = Split-Path -Parent $LogPath
  if ($logDirectory -and -not (Test-Path -LiteralPath $logDirectory)) {
    New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
  }

  $jsonLine = ConvertTo-Json -InputObject $Entry -Depth 20 -Compress
  [IO.File]::AppendAllText($LogPath, $jsonLine + [Environment]::NewLine, (New-Object Text.UTF8Encoding($false)))
}

function Get-SafeResponseHeaders {
  param([string]$HeaderText)

  $safeHeaders = [ordered]@{}
  $allowedHeaders = @(
    "content-type",
    "date",
    "server",
    "access-control-allow-origin",
    "access-control-allow-methods",
    "access-control-allow-headers",
    "vary"
  )

  foreach ($line in ($HeaderText -split "`r?`n")) {
    if ($line -match '^([^:]+):\s*(.*)$') {
      $name = $matches[1].Trim().ToLowerInvariant()
      if ($allowedHeaders -contains $name) {
        $safeHeaders[$name] = $matches[2].Trim()
      }
    }
  }

  return $safeHeaders
}

function ConvertTo-PowerShellLiteral {
  param([string]$Value)

  return "'" + $Value.Replace("'", "''") + "'"
}

$curlCommand = Get-Command "curl.exe" -ErrorAction SilentlyContinue
if (-not $curlCommand) {
  throw "curl.exe was not found in PATH. Install curl or add it to PATH."
}

try {
  $baseUri = [Uri]$BaseUrl
} catch {
  throw "Invalid BaseUrl: provide an absolute HTTP or HTTPS URL."
}

if (-not $baseUri.IsAbsoluteUri -or $baseUri.Scheme -notin @("http", "https")) {
  throw "Invalid BaseUrl: provide an absolute HTTP or HTTPS URL."
}
if ($baseUri.Query -or $baseUri.Fragment -or $baseUri.UserInfo) {
  throw "BaseUrl must not contain a query string, fragment, or credentials."
}

$originUri = $null
try {
  $originUri = [Uri]$Origin
} catch {
  throw "Invalid Origin: provide an HTTP or HTTPS origin."
}
if (-not $originUri.IsAbsoluteUri -or $originUri.Scheme -notin @("http", "https") -or
    $originUri.AbsolutePath -ne "/" -or $originUri.Query -or $originUri.Fragment -or $originUri.UserInfo) {
  throw "Origin must contain only a scheme, host, and optional port."
}
$Origin = $originUri.GetLeftPart([UriPartial]::Authority)

$endpoint = $BaseUrl.TrimEnd("/") + "/auth/apply"
$preflightCurlCommand = @(
  "curl.exe",
  "--silent",
  "--show-error",
  "--request", (ConvertTo-PowerShellLiteral -Value "OPTIONS"),
  "--header", (ConvertTo-PowerShellLiteral -Value "Origin: $Origin"),
  "--header", (ConvertTo-PowerShellLiteral -Value "Access-Control-Request-Method: POST"),
  "--header", (ConvertTo-PowerShellLiteral -Value "Access-Control-Request-Headers: content-type"),
  "--connect-timeout", "10",
  "--max-time", [string]$TimeoutSeconds,
  "--url", (ConvertTo-PowerShellLiteral -Value $endpoint)
) -join " "
$redactedRequestBody = '{"appKey":"[REDACTED]","appSecret":"[REDACTED]"}'
$authenticationCurlCommand = @(
  "curl.exe",
  "--silent",
  "--show-error",
  "--request", (ConvertTo-PowerShellLiteral -Value "POST"),
  "--header", (ConvertTo-PowerShellLiteral -Value "Content-Type: application/json"),
  "--data-raw", (ConvertTo-PowerShellLiteral -Value $redactedRequestBody),
  "--connect-timeout", "10",
  "--max-time", [string]$TimeoutSeconds,
  "--url", (ConvertTo-PowerShellLiteral -Value $endpoint)
) -join " "
$appKey = Read-Host "Enter App Key"
$secureSecret = Read-Host "Enter App Secret" -AsSecureString
$appSecret = ConvertTo-PlainText -Value $secureSecret

if ([string]::IsNullOrWhiteSpace($appKey) -or [string]::IsNullOrEmpty($appSecret)) {
  $appSecret = $null
  throw "App Key and App Secret are required."
}

$temporaryDirectory = Join-Path ([IO.Path]::GetTempPath()) ("feige-auth-" + [Guid]::NewGuid().ToString("N"))
$null = New-Item -ItemType Directory -Path $temporaryDirectory
$requestFile = Join-Path $temporaryDirectory "request.json"
$responseFile = Join-Path $temporaryDirectory "response.json"
$headersFile = Join-Path $temporaryDirectory "response-headers.txt"
$stderrFile = Join-Path $temporaryDirectory "curl-error.txt"
$preflightHeadersFile = Join-Path $temporaryDirectory "preflight-headers.txt"
$preflightStderrFile = Join-Path $temporaryDirectory "preflight-error.txt"
$secrets = @($appKey, $appSecret)
$startedAt = [DateTime]::UtcNow
$stopwatch = [Diagnostics.Stopwatch]::StartNew()
$curlExitCode = $null
$httpStatus = $null
$responseBody = $null
$responseHeaders = [ordered]@{}
$preflightStatus = $null
$preflightCurlExitCode = $null
$preflightHeaders = [ordered]@{}
$preflightAllowed = $false
$preflightError = $null
$tokenReceived = $false
$errorMessage = $null

try {
  $preflightArguments = @(
    "--silent",
    "--show-error",
    "--request", "OPTIONS",
    "--header", "Origin: $Origin",
    "--header", "Access-Control-Request-Method: POST",
    "--header", "Access-Control-Request-Headers: content-type",
    "--dump-header", $preflightHeadersFile,
    "--output", (Join-Path $temporaryDirectory "preflight-response.txt"),
    "--write-out", "%{http_code}",
    "--connect-timeout", "10",
    "--max-time", [string]$TimeoutSeconds,
    $endpoint
  )
  $preflightOutput = & $curlCommand.Source @preflightArguments 2> $preflightStderrFile
  $preflightCurlExitCode = $LASTEXITCODE
  if ($preflightOutput -match '^\d{3}$') {
    $preflightStatus = [int]$preflightOutput
  }
  if (Test-Path -LiteralPath $preflightHeadersFile) {
    $preflightHeaders = Get-SafeResponseHeaders -HeaderText ([IO.File]::ReadAllText($preflightHeadersFile))
  }
  if (Test-Path -LiteralPath $preflightStderrFile) {
    $preflightStderr = [IO.File]::ReadAllText($preflightStderrFile).Trim()
    if (-not [string]::IsNullOrWhiteSpace($preflightStderr) -and $preflightCurlExitCode -ne 0) {
      $preflightError = "curl.exe preflight request failed with exit code $preflightCurlExitCode."
    }
  }
  $allowedOrigin = $preflightHeaders["access-control-allow-origin"]
  $allowedMethods = $preflightHeaders["access-control-allow-methods"]
  $allowedHeaders = $preflightHeaders["access-control-allow-headers"]
  $originAllowed = $allowedOrigin -eq "*" -or $allowedOrigin -eq $Origin
  $methodAllowed = @($allowedMethods -split "\s*,\s*") -contains "POST"
  $contentTypeAllowed = @($allowedHeaders -split "\s*,\s*") -contains "content-type" -or $allowedHeaders -eq "*"
  $preflightAllowed = $preflightCurlExitCode -eq 0 -and
    $preflightStatus -ge 200 -and $preflightStatus -lt 300 -and
    $originAllowed -and $methodAllowed -and $contentTypeAllowed

  $requestJson = ConvertTo-Json -InputObject @{
    appKey = $appKey
    appSecret = $appSecret
  } -Compress
  [IO.File]::WriteAllText($requestFile, $requestJson, (New-Object Text.UTF8Encoding($false)))

  $curlArguments = @(
    "--silent",
    "--show-error",
    "--request", "POST",
    "--header", "Content-Type: application/json",
    "--data-binary", "@$requestFile",
    "--dump-header", $headersFile,
    "--output", $responseFile,
    "--write-out", "%{http_code}",
    "--connect-timeout", "10",
    "--max-time", [string]$TimeoutSeconds,
    $endpoint
  )
  $statusOutput = & $curlCommand.Source @curlArguments 2> $stderrFile
  $curlExitCode = $LASTEXITCODE
  $stopwatch.Stop()

  if ($statusOutput -match '^\d{3}$') {
    $httpStatus = [int]$statusOutput
  }
  if (Test-Path -LiteralPath $responseFile) {
    $responseBody = [IO.File]::ReadAllText($responseFile)
  }
  if (Test-Path -LiteralPath $headersFile) {
    $responseHeaders = Get-SafeResponseHeaders -HeaderText ([IO.File]::ReadAllText($headersFile))
  }

  $parsedResponse = $null
  if (-not [string]::IsNullOrWhiteSpace($responseBody)) {
    try {
      $parsedResponse = ConvertFrom-Json -InputObject $responseBody
    } catch {
      $parsedResponse = $null
    }
  }

  if ($parsedResponse) {
    $token = $null
    if ($parsedResponse.data -and $parsedResponse.data.access_token) {
      $token = [string]$parsedResponse.data.access_token
    } elseif ($parsedResponse.access_token) {
      $token = [string]$parsedResponse.access_token
    }
    $tokenReceived = -not [string]::IsNullOrWhiteSpace($token)
    $safeResponse = Protect-Object -Value $parsedResponse -Secrets $secrets
    $safeResponseJson = ConvertTo-Json -InputObject $safeResponse -Depth 20 -Compress
  } else {
    $safeResponseJson = Protect-Text -Text $responseBody -Secrets $secrets
    if ($safeResponseJson -and $safeResponseJson.Length -gt 10000) {
      $safeResponseJson = $safeResponseJson.Substring(0, 10000) + "[TRUNCATED]"
    }
  }

  if ($curlExitCode -ne 0) {
    $errorMessage = "curl.exe request failed with exit code $curlExitCode."
  }

  $logEntry = [ordered]@{
    timestamp = $startedAt.ToString("o")
    client = "curl"
    method = "POST"
    endpoint = $endpoint
    curlCommands = [ordered]@{
      preflight = $preflightCurlCommand
      authentication = $authenticationCurlCommand
      authenticationBodyNote = "Credentials are redacted; replace placeholders to replay."
    }
    preflight = [ordered]@{
      origin = $Origin
      method = "OPTIONS"
      curlExitCode = $preflightCurlExitCode
      httpStatus = $preflightStatus
      allowed = $preflightAllowed
      responseHeaders = $preflightHeaders
      error = $preflightError
    }
    durationMs = [int]$stopwatch.ElapsedMilliseconds
    curlExitCode = $curlExitCode
    httpStatus = $httpStatus
    accessTokenReceived = $tokenReceived
    responseHeaders = $responseHeaders
    responseBody = $safeResponseJson
    error = $errorMessage
  }
  Write-RunLog -Entry $logEntry

  if ($curlExitCode -eq 0) {
    Write-Host "HTTP status: $httpStatus"
    Write-Host "CORS preflight: HTTP $preflightStatus; allowed for the requested origin: $preflightAllowed"
    Write-Host "Preflight curl: $preflightCurlCommand"
    Write-Host "Authentication curl (credentials redacted): $authenticationCurlCommand"
    Write-Host "Duration: $($stopwatch.ElapsedMilliseconds) ms"
    Write-Host "access_token received: $tokenReceived"
    Write-Host "Log file: $([IO.Path]::GetFullPath($LogPath))"
    Write-Host "API response (sensitive fields redacted):"
    if ($safeResponseJson) {
      Write-Host $safeResponseJson
    } else {
      Write-Host "(empty response)"
    }
    Write-Host "Note: curl does not enforce CORS; this run tests connectivity and the HTTP response, not browser access."
    if (-not $httpStatus -or $httpStatus -lt 200 -or $httpStatus -ge 300 -or -not $tokenReceived) {
      exit 2
    }
    if (-not $preflightAllowed) {
      exit 3
    }
  } else {
    Write-Host "curl.exe failed ($curlExitCode): $errorMessage" -ForegroundColor Red
    Write-Host "Log file: $([IO.Path]::GetFullPath($LogPath))"
    exit 1
  }
} catch {
  $stopwatch.Stop()
  $errorMessage = "Authentication test failed due to a local script or logging error."
  $logEntry = [ordered]@{
    timestamp = $startedAt.ToString("o")
    client = "curl"
    method = "POST"
    endpoint = $endpoint
    curlCommands = [ordered]@{
      preflight = $preflightCurlCommand
      authentication = $authenticationCurlCommand
      authenticationBodyNote = "Credentials are redacted; replace placeholders to replay."
    }
    preflight = [ordered]@{
      origin = $Origin
      method = "OPTIONS"
      curlExitCode = $preflightCurlExitCode
      httpStatus = $preflightStatus
      allowed = $preflightAllowed
      responseHeaders = $preflightHeaders
      error = $preflightError
    }
    durationMs = [int]$stopwatch.ElapsedMilliseconds
    curlExitCode = $curlExitCode
    httpStatus = $httpStatus
    accessTokenReceived = $false
    responseHeaders = $responseHeaders
    responseBody = $null
    error = $errorMessage
  }
  Write-RunLog -Entry $logEntry
  Write-Host "$errorMessage $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "Log file: $([IO.Path]::GetFullPath($LogPath))"
  exit 1
} finally {
  $appKey = $null
  $appSecret = $null
  $secrets = $null
  $secureSecret = $null
  $requestJson = $null
  $requestBody = $null
  $responseBody = $null
  if (Test-Path -LiteralPath $temporaryDirectory) {
    Remove-Item -LiteralPath $temporaryDirectory -Recurse -Force
  }
}
