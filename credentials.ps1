function Get-FeigeCredentials {
  $credentialPath = Join-Path $PSScriptRoot "credentials.json"
  if (-not (Test-Path -LiteralPath $credentialPath -PathType Leaf)) {
    throw "Credentials file was not found. Run .\setup-credentials.ps1 first."
  }

  try {
    $credentials = Get-Content -LiteralPath $credentialPath -Raw | ConvertFrom-Json
    if ([string]::IsNullOrWhiteSpace($credentials.AppKey) -or
        [string]::IsNullOrWhiteSpace($credentials.AppSecret)) {
      throw "The credentials file is incomplete."
    }

    return [pscustomobject]@{
      AppKey = [string]$credentials.AppKey
      AppSecret = [string]$credentials.AppSecret
    }
  } catch {
    throw "Could not read credentials.json. Run .\setup-credentials.ps1 to recreate it."
  }
}
