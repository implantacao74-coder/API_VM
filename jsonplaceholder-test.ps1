param(
  [string]$BaseUrl = "https://jsonplaceholder.typicode.com",
  [string]$LogPath = (Join-Path $PSScriptRoot "logs\jsonplaceholder-test.jsonl"),
  [ValidateRange(1, 300)]
  [int]$TimeoutSeconds = 30
)

$ErrorActionPreference = "Stop"

$curlCommand = Get-Command "curl.exe" -ErrorAction SilentlyContinue
if (-not $curlCommand) {
  throw "curl.exe was not found in PATH. Install curl or add it to PATH."
}

try {
  $baseUri = [Uri]$BaseUrl
} catch {
  throw "Invalid BaseUrl: provide an absolute HTTP or HTTPS URL."
}

if (-not $baseUri.IsAbsoluteUri -or $baseUri.Scheme -notin @("http", "https") -or
    $baseUri.Query -or $baseUri.Fragment -or $baseUri.UserInfo) {
  throw "Invalid BaseUrl: provide an absolute HTTP or HTTPS URL without credentials, query, or fragment."
}

function ConvertTo-PowerShellLiteral {
  param([string]$Value)

  return "'" + $Value.Replace("'", "''") + "'"
}

function New-CurlDisplayCommand {
  param(
    [string]$Method,
    [string]$Endpoint,
    [AllowNull()]
    [string]$Body
  )

  $parts = @(
    "curl.exe",
    "--request",
    (ConvertTo-PowerShellLiteral -Value $Method)
  )
  if ($Body) {
    $parts += @(
      "--header",
      (ConvertTo-PowerShellLiteral -Value "Content-Type: application/json"),
      "--data-raw",
      (ConvertTo-PowerShellLiteral -Value $Body)
    )
  }
  $parts += @("--url", (ConvertTo-PowerShellLiteral -Value $Endpoint))
  return $parts -join " "
}

$base = $BaseUrl.TrimEnd("/")
$requests = @(
  [PSCustomObject]@{
    Name = "GetPost"
    Method = "GET"
    Path = "/posts/1"
    ExpectedStatus = 200
    Body = $null
  },
  [PSCustomObject]@{
    Name = "CreatePost"
    Method = "POST"
    Path = "/posts"
    ExpectedStatus = 201
    Body = '{"title":"curl test","body":"JSONPlaceholder test request","userId":1}'
  }
)

$temporaryDirectory = Join-Path ([IO.Path]::GetTempPath()) ("jsonplaceholder-" + [Guid]::NewGuid().ToString("N"))
$null = New-Item -ItemType Directory -Path $temporaryDirectory
$logDirectory = Split-Path -Parent $LogPath
if ($logDirectory -and -not (Test-Path -LiteralPath $logDirectory)) {
  New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
}

$allPassed = $true

try {
  foreach ($request in $requests) {
    $startedAt = [DateTime]::UtcNow
    $stopwatch = [Diagnostics.Stopwatch]::StartNew()
    $responseFile = Join-Path $temporaryDirectory "$($request.Name)-response.json"
    $stderrFile = Join-Path $temporaryDirectory "$($request.Name)-curl-error.txt"
    $requestBodyFile = Join-Path $temporaryDirectory "$($request.Name)-request.json"
    $endpoint = $base + $request.Path
    $curlDisplayCommand = New-CurlDisplayCommand `
      -Method $request.Method `
      -Endpoint $endpoint `
      -Body $request.Body

    $curlArguments = @(
      "--silent",
      "--show-error",
      "--request", $request.Method,
      "--output", $responseFile,
      "--write-out", "%{http_code}",
      "--connect-timeout", "10",
      "--max-time", [string]$TimeoutSeconds
    )

    if ($request.Body) {
      [IO.File]::WriteAllText($requestBodyFile, $request.Body, (New-Object Text.UTF8Encoding($false)))
      $curlArguments += @(
        "--header", "Content-Type: application/json",
        "--data-binary", "@$requestBodyFile"
      )
    }

    $curlArguments += $endpoint
    $statusOutput = & $curlCommand.Source @curlArguments 2> $stderrFile
    $curlExitCode = $LASTEXITCODE
    $stopwatch.Stop()

    $httpStatus = $null
    if ($statusOutput -match '^\d{3}$') {
      $httpStatus = [int]$statusOutput
    }

    $responseText = $null
    if (Test-Path -LiteralPath $responseFile) {
      $responseText = [IO.File]::ReadAllText($responseFile)
    }

    $responseData = $responseText
    if (-not [string]::IsNullOrWhiteSpace($responseText)) {
      try {
        $responseData = ConvertFrom-Json -InputObject $responseText
      } catch {
        $responseData = $responseText
      }
    }

    $curlError = $null
    if ($curlExitCode -ne 0) {
      $curlError = "curl.exe request failed with exit code $curlExitCode."
    }

    $passed = $curlExitCode -eq 0 -and $httpStatus -eq $request.ExpectedStatus
    if (-not $passed) {
      $allPassed = $false
    }

    $logEntry = [ordered]@{
      timestamp = $startedAt.ToString("o")
      test = $request.Name
      method = $request.Method
      endpoint = $endpoint
      curlCommand = $curlDisplayCommand
      expectedStatus = $request.ExpectedStatus
      httpStatus = $httpStatus
      curlExitCode = $curlExitCode
      durationMs = [int]$stopwatch.ElapsedMilliseconds
      passed = $passed
      response = $responseData
      error = $curlError
    }
    $jsonLine = ConvertTo-Json -InputObject $logEntry -Depth 20 -Compress
    [IO.File]::AppendAllText($LogPath, $jsonLine + [Environment]::NewLine, (New-Object Text.UTF8Encoding($false)))

    Write-Host "$($request.Name): HTTP $httpStatus (expected $($request.ExpectedStatus)); passed: $passed"
    Write-Host "curl command: $curlDisplayCommand"
    if ($responseText) {
      Write-Host "Response: $($responseText.Trim())"
    }
    if ($curlError) {
      Write-Host "Error: $curlError" -ForegroundColor Red
    }
  }

  Write-Host "Log file: $([IO.Path]::GetFullPath($LogPath))"
  if (-not $allPassed) {
    exit 1
  }
} finally {
  if (Test-Path -LiteralPath $temporaryDirectory) {
    Remove-Item -LiteralPath $temporaryDirectory -Recurse -Force
  }
}
