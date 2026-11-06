$ErrorActionPreference = "Stop"

$url = "http://127.0.0.1:8000"
& (Join-Path $PSScriptRoot "start-backend.ps1")

Start-Process $url
