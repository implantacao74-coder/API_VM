$ErrorActionPreference = "Stop"

$credentialPath = Join-Path $PSScriptRoot "credentials.json"

if (Test-Path -LiteralPath $credentialPath) {
  $replace = Read-Host "Credentials file already exists. Replace it? (y/N)"
  if ($replace -notin @("y", "Y")) {
    Write-Host "Existing credentials were kept."
    return
  }
}

$appKey = Read-Host "App Key" -AsSecureString
$appSecret = Read-Host "App Secret" -AsSecureString
if ($appKey.Length -eq 0 -or $appSecret.Length -eq 0) {
  throw "App Key and App Secret are required."
}

$plainAppKeyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($appKey)
$plainAppSecretPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($appSecret)
try {
  $plainCredentials = [ordered]@{
    AppKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($plainAppKeyPointer)
    AppSecret = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($plainAppSecretPointer)
  }
  $json = ConvertTo-Json -InputObject $plainCredentials -Compress
  [IO.File]::WriteAllText($credentialPath, $json, (New-Object Text.UTF8Encoding($false)))
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($plainAppKeyPointer)
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($plainAppSecretPointer)
  $plainCredentials = $null
}

Write-Host "Credentials saved as plain text in credentials.json (not encrypted; do not share or commit this file)."
