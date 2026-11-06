$ErrorActionPreference = "Stop"

$apiOrigin = "https://veda.figeth.com"
$apiBasePath = "/api/luobo-machine-api"
. (Join-Path $PSScriptRoot "credentials.ps1")

function Read-RequiredValue {
  param([string]$Prompt)

  while ($true) {
    $value = (Read-Host $Prompt).Trim()
    if ($value) {
      return $value
    }
    Write-Host "Este campo é obrigatório." -ForegroundColor Yellow
  }
}

function Read-OptionalValue {
  param(
    [string]$Prompt,
    [string]$Default = ""
  )

  $value = Read-Host "$Prompt$(if ($Default) { " [$Default]" })"
  if ([string]::IsNullOrWhiteSpace($value)) {
    return $Default
  }
  return $value.Trim()
}

function Read-IntegerValue {
  param(
    [string]$Prompt,
    [int]$Default,
    [int]$Minimum = 1,
    [int]$Maximum = 2147483647
  )

  while ($true) {
    $inputValue = Read-OptionalValue -Prompt $Prompt -Default ([string]$Default)
    $number = 0
    if ([int]::TryParse($inputValue, [ref]$number) -and $number -ge $Minimum -and $number -le $Maximum) {
      return $number
    }
    Write-Host "Informe um número inteiro entre $Minimum e $Maximum." -ForegroundColor Yellow
  }
}

function Read-OptionalInteger {
  param(
    [string]$Prompt,
    [int]$Minimum = 0,
    [int]$Maximum = 2147483647
  )

  while ($true) {
    $inputValue = Read-Host "$Prompt (Enter para omitir)"
    if ([string]::IsNullOrWhiteSpace($inputValue)) {
      return $null
    }

    $number = 0
    if ([int]::TryParse($inputValue, [ref]$number) -and $number -ge $Minimum -and $number -le $Maximum) {
      return $number
    }
    Write-Host "Informe um número inteiro entre $Minimum e $Maximum ou pressione Enter." -ForegroundColor Yellow
  }
}

function Read-CommaSeparatedValues {
  param([string]$Prompt)

  while ($true) {
    $inputValue = Read-RequiredValue $Prompt
    $values = @($inputValue -split "[,;]" | ForEach-Object { $_.Trim() } | Where-Object { $_ })
    if ($values.Count -gt 0) {
      return ,$values
    }
  }
}

function Read-OptionalDate {
  param([string]$Prompt)

  while ($true) {
    $value = Read-Host "$Prompt (AAAA-MM-DD; Enter para omitir)"
    if ([string]::IsNullOrWhiteSpace($value)) {
      return $null
    }

    $parsedDate = [datetime]::MinValue
    if ([datetime]::TryParseExact(
        $value.Trim(),
        "yyyy-MM-dd",
        [Globalization.CultureInfo]::InvariantCulture,
        [Globalization.DateTimeStyles]::None,
        [ref]$parsedDate
      )) {
      return $value.Trim()
    }
    Write-Host "Use o formato AAAA-MM-DD." -ForegroundColor Yellow
  }
}

function Read-JsonObject {
  param(
    [string]$Prompt,
    [switch]$Optional
  )

  while ($true) {
    $value = Read-Host $Prompt
    if ([string]::IsNullOrWhiteSpace($value) -and $Optional) {
      return $null
    }
    if ([string]::IsNullOrWhiteSpace($value)) {
      Write-Host "Informe um objeto JSON. Exemplo: {}" -ForegroundColor Yellow
      continue
    }

    try {
      $parsed = ConvertFrom-Json -InputObject $value -ErrorAction Stop
      if ($parsed -is [System.Collections.IDictionary] -or
          $parsed -is [System.Management.Automation.PSCustomObject]) {
        return $parsed
      }
      Write-Host "O JSON precisa ser um objeto (não uma lista ou valor simples)." -ForegroundColor Yellow
    } catch {
      Write-Host "JSON inválido: $($_.Exception.Message)" -ForegroundColor Yellow
    }
  }
}

function Read-ScopeIds {
  param([string]$ScopeName)

  while ($true) {
    $value = Read-Host "IDs de $ScopeName separados por vírgula; digite TODOS para aplicar a todos"
    if ([string]::IsNullOrWhiteSpace($value)) {
      Write-Host "Informe IDs ou digite TODOS explicitamente." -ForegroundColor Yellow
      continue
    }
    if ($value.Trim() -ieq "TODOS") {
      return @{ All = $true; Ids = @() }
    }

    $ids = @($value -split "[,;]" | ForEach-Object { $_.Trim() } | Where-Object { $_ })
    if ($ids.Count -gt 0 -and @($ids | Where-Object { $_ -notmatch '^\d+$' }).Count -eq 0) {
      return @{ All = $false; Ids = @($ids | ForEach-Object { [long]$_ }) }
    }
    Write-Host "Use IDs numéricos separados por vírgula, ou digite TODOS." -ForegroundColor Yellow
  }
}

function Confirm-Operation {
  param(
    [string]$Description,
    [string]$TypedConfirmation
  )

  Write-Host ""
  Write-Host $Description -ForegroundColor Yellow
  $confirmation = Read-Host "Para confirmar, digite $TypedConfirmation"
  return $confirmation -ceq $TypedConfirmation
}

function ConvertTo-SafeJsonText {
  param([string]$Text)

  $safeText = [regex]::Replace(
    $Text,
    '(?i)("(?:app.?secret|app.?key|access.?token|refresh.?token|authorization)"\s*:\s*")[^"]*(")',
    '${1}[REDACTED]${2}'
  )
  return [regex]::Replace($safeText, '(?i)(Bearer\s+)[A-Za-z0-9._~+/-]+=*', '${1}[REDACTED]')
}

function Get-ReadableLabel {
  param([string]$Name)

  $labels = @{
    code = "Código da API"
    msg = "Mensagem"
    message = "Mensagem"
    data = "Dados"
    result = "Resultado"
    records = "Registros"
    list = "Lista"
    rows = "Linhas"
    total = "Total"
    totalCount = "Total de registros"
    pageNo = "Página"
    pageSize = "Itens por página"
    deviceId = "ID do dispositivo"
    deviceName = "Nome do dispositivo"
    deviceUuid = "UUID do dispositivo"
    inventoryId = "ID do inventário"
    cargoPassageId = "ID do canal"
    cargoPassageNo = "Número do canal"
    productId = "ID do produto"
    productName = "Nome do produto"
    currentInventoryCount = "Estoque atual"
    totalInventoryCount = "Capacidade total"
    status = "Status"
    name = "Nome"
    price = "Preço"
    costPrice = "Preço de custo"
    orderNo = "Número do pedido"
    payStatus = "Status do pagamento"
    payTime = "Data do pagamento"
    vendorId = "ID da dispensação"
    testId = "ID da tarefa"
    testResult = "Resultado do teste"
    vendorResult = "Resultado da dispensação"
    vendorResultText = "Detalhe do resultado"
    mainOpen = "Porta principal aberta"
    subOpen = "Porta interna aberta"
    couponCode = "Código do cupom"
    type = "Tipo"
    quantity = "Quantidade"
    startDate = "Data inicial"
    endDate = "Data final"
    startTime = "Horário inicial"
    endTime = "Horário final"
    expires_in = "Validade do token (minutos)"
    success = "Sucesso"
  }

  if ($labels.ContainsKey($Name)) {
    return $labels[$Name]
  }
  $readable = [regex]::Replace($Name.Replace("_", " "), '([a-z0-9])([A-Z])', '$1 $2')
  return (Get-Culture).TextInfo.ToTitleCase($readable)
}

function Write-HumanReadableValue {
  param(
    [string]$Label,
    [AllowNull()]
    [object]$Value,
    [int]$Indent = 0
  )

  $prefix = " " * $Indent
  if ($null -eq $Value) {
    Write-Host "$prefix${Label}: (sem dados)"
    return
  }

  if ($Value -is [string] -or $Value -is [ValueType]) {
    $displayValue = if ($Value -is [bool]) {
      if ($Value) { "Sim" } else { "Não" }
    } else {
      ConvertTo-SafeJsonText ([string]$Value)
    }
    Write-Host "$prefix${Label}: $displayValue"
    return
  }

  if ($Value -is [System.Collections.IDictionary]) {
    $properties = @(
      foreach ($key in $Value.Keys) {
        [pscustomobject]@{ Name = [string]$key; Value = $Value[$key] }
      }
    )
  } elseif ($Value -is [System.Collections.IEnumerable]) {
    $items = @($Value)
    if ($items.Count -eq 0) {
      Write-Host "$prefix${Label}: nenhum registro"
      return
    }

    Write-Host "$prefix${Label} ($($items.Count)):"
    for ($index = 0; $index -lt $items.Count; $index++) {
      $item = $items[$index]
      if ($item -is [string] -or $item -is [ValueType]) {
        $displayItem = ConvertTo-SafeJsonText ([string]$item)
        Write-Host "$prefix  - $displayItem"
      } else {
        Write-Host "$prefix  Registro $($index + 1):"
        Write-HumanReadableValue -Label "" -Value $item -Indent ($Indent + 4)
      }
    }
    return
  } else {
    $properties = @(
      foreach ($property in $Value.PSObject.Properties) {
        [pscustomobject]@{ Name = $property.Name; Value = $property.Value }
      }
    )
  }

  foreach ($property in $properties) {
    $propertyLabel = Get-ReadableLabel $property.Name
    if ($property.Name -match '(?i)(secret|token|authorization|app.?key)') {
      Write-Host "$prefix${propertyLabel}: [OCULTO]"
    } elseif ($null -eq $property.Value -or
        $property.Value -is [string] -or $property.Value -is [ValueType]) {
      Write-HumanReadableValue -Label $propertyLabel -Value $property.Value -Indent $Indent
    } else {
      Write-Host "$prefix${propertyLabel}:"
      Write-HumanReadableValue -Label $propertyLabel -Value $property.Value -Indent ($Indent + 2)
    }
  }
}

function Invoke-FeigeRequest {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [Parameter(Mandatory = $true)]
    [ValidateSet("GET", "POST", "PUT", "PATCH", "DELETE")]
    [string]$Method,
    [hashtable]$Query = @{},
    [AllowNull()]
    [object]$Body,
    [switch]$NoToken,
    [switch]$PassResult
  )

  if (-not $NoToken -and [string]::IsNullOrWhiteSpace($script:accessToken)) {
    throw "Não há token de sessão. Autentique-se novamente."
  }

  $queryParts = @(
    foreach ($key in $Query.Keys) {
      $value = $Query[$key]
      if ($null -ne $value -and -not [string]::IsNullOrWhiteSpace([string]$value)) {
        "{0}={1}" -f [uri]::EscapeDataString([string]$key), [uri]::EscapeDataString([string]$value)
      }
    }
  )
  $uri = "$apiOrigin$Path"
  if ($queryParts.Count -gt 0) {
    $uri += "?" + ($queryParts -join "&")
  }

  $requestParameters = @{
    Uri = $uri
    Method = $Method
    UseBasicParsing = $true
    TimeoutSec = 30
    ErrorAction = "Stop"
  }
  if (-not $NoToken) {
    $requestParameters.Headers = @{ Authorization = "Bearer $script:accessToken" }
  }
  if ($Method -notin @("GET", "DELETE") -and $null -ne $Body) {
    $requestParameters.ContentType = "application/json; charset=utf-8"
    $requestParameters.Body = ConvertTo-Json -InputObject $Body -Depth 30 -Compress
  }

  $httpStatus = 0
  $responseText = ""
  try {
    $response = Invoke-WebRequest @requestParameters
    $httpStatus = [int]$response.StatusCode
    $responseText = [string]$response.Content
  } catch {
    $webResponse = $_.Exception.Response
    if (-not $webResponse) {
      throw "Falha de comunicação com a API: $($_.Exception.Message)"
    }

    $httpStatus = [int]$webResponse.StatusCode
    $stream = $webResponse.GetResponseStream()
    if ($stream) {
      $reader = [System.IO.StreamReader]::new($stream)
      try {
        $responseText = $reader.ReadToEnd()
      } finally {
        $reader.Dispose()
      }
    }
  }

  $result = [ordered]@{
    method = $Method
    url = $uri
    httpStatus = $httpStatus
  }
  if ($responseText) {
    try {
      $result.data = ConvertFrom-Json -InputObject $responseText -ErrorAction Stop
    } catch {
      $result.data = $responseText
    }
  } else {
    $result.data = $null
  }

  Write-Host ""
  Write-Host "=== Resposta da API ===" -ForegroundColor Cyan
  Write-Host "Método: $Method"
  Write-Host "Recurso: $Path"
  Write-Host "Status HTTP: $httpStatus"
  Write-HumanReadableValue -Label "Resposta" -Value $result.data
  $apiCode = $null
  if ($result.data -and $result.data.PSObject.Properties["code"]) {
    $apiCode = [string]$result.data.code
  }
  if ($httpStatus -lt 200 -or $httpStatus -ge 300 -or ($apiCode -and $apiCode -ne "200")) {
    Write-Host "A chamada retornou uma falha HTTP/API." -ForegroundColor Red
  } else {
    Write-Host "Chamada concluída." -ForegroundColor Green
  }
  if ($PassResult) {
    return $result
  }
}

function Connect-FeigeApi {
  $credentials = Get-FeigeCredentials
  $script:accessToken = $null
  $result = Invoke-FeigeRequest -Path "/api/auth/apply" -Method "POST" -Body @{
    appKey = $credentials.AppKey
    appSecret = $credentials.AppSecret
  } -NoToken -PassResult

  $response = $result.data
  if ($response -is [string]) {
    throw "A resposta de autenticação não é JSON válido."
  }
  if ($response.code -and [string]$response.code -ne "200") {
    throw "Autenticação recusada: $($response.msg)"
  }

  $token = $response.data.access_token
  if (-not $token) {
    $token = $response.access_token
  }
  if ([string]::IsNullOrWhiteSpace([string]$token)) {
    throw "A resposta da autenticação não contém access_token."
  }

  $script:accessToken = [string]$token
  Write-Host "Autenticação concluída; token mantido apenas em memória." -ForegroundColor Green
}

function Get-ApiRequestDefinition {
  param([string]$Action)

  $query = @{}
  $body = $null
  $method = "POST"
  $path = ""
  $warning = $null

  switch ($Action) {
    "1" {
      $path = "$apiBasePath/api/v1/device/list"
      $query = @{}
      $pageNo = Read-IntegerValue "Página" 1
      $pageSize = Read-IntegerValue "Itens por página" 50
      $body = @{}
      $deviceName = Read-OptionalValue "Nome do dispositivo (opcional)"
      if ($deviceName) { $body.deviceName = $deviceName }
      $status = Read-OptionalInteger "Status (1 online, 2 offline)" 1 2
      if ($null -ne $status) { $body.status = $status }
      $query = @{ pageNo = $pageNo; pageSize = $pageSize }
    }
    "2" {
      $path = "$apiBasePath/api/v1/deviceInventory/list"
      $query = @{ deviceId = Read-RequiredValue "ID do dispositivo" }
      $body = @{}
    }
    "3" {
      $path = "$apiBasePath/api/v1/deviceInventory/replenish"
      $entries = @()
      do {
        $inventoryId = Read-RequiredValue "ID do inventário"
        $count = Read-IntegerValue "Quantidade atual (pode ser zero)" 0 0
        $entries += @{ inventoryId = $inventoryId; count = $count }
        $more = Read-Host "Adicionar outro item? (s/N)"
      } while ($more -match '^(?i:s|sim|y|yes)$')
      $body = @{ infoList = $entries }
      $warning = "Esta chamada altera o estoque registrado."
    }
    "4" {
      $path = "$apiBasePath/api/v1/deviceInventory/testChannel"
      $deviceId = Read-RequiredValue "ID do dispositivo"
      $ids = Read-CommaSeparatedValues "IDs dos canais para testar (separados por vírgula)"
      $body = @{ deviceId = $deviceId; ids = $ids }
      $warning = "O teste pode acionar fisicamente canais do equipamento."
    }
    "5" {
      $method = "GET"
      $path = "$apiBasePath/api/v1/deviceInventory/getTestResult"
      $query = @{ id = Read-RequiredValue "ID da tarefa de teste" }
    }
    "6" {
      $path = "$apiBasePath/api/v1/productCategory/listPrivate"
      $pageNo = Read-IntegerValue "Página" 1
      $pageSize = Read-IntegerValue "Itens por página" 50
      $query = @{ pageNo = $pageNo; pageSize = $pageSize }
      $body = @{}
      $name = Read-OptionalValue "Nome do produto (opcional)"
      if ($name) { $body.name = $name }
    }
    "7" {
      $path = "$apiBasePath/api/v1/freeTier/vend"
      $deviceId = Read-RequiredValue "ID do dispositivo"
      $ids = Read-CommaSeparatedValues "IDs dos canais para dispensar (separados por vírgula)"
      $body = @{ deviceId = $deviceId; cargoPassageIds = $ids }
      $warning = "Esta chamada pode dispensar produtos fisicamente."
    }
    "8" {
      $method = "GET"
      $path = "$apiBasePath/api/v1/freeTier/getVendorResult"
      $query = @{ vendorId = Read-RequiredValue "ID da tarefa de dispensação (vendorId)" }
    }
    "9" {
      $path = "$apiBasePath/api/v1/control/openDoor"
      $deviceId = Read-RequiredValue "ID do dispositivo"
      $delay = Read-IntegerValue "Atraso para fechar em milissegundos" 3000 0
      $body = @{ deviceId = $deviceId; delayClose = $delay }
      $warning = "Esta chamada abre fisicamente a porta do equipamento."
    }
    "10" {
      $path = "$apiBasePath/api/v1/control/closeDoor"
      $body = @{ deviceId = Read-RequiredValue "ID do dispositivo" }
      $warning = "Esta chamada controla fisicamente a porta do equipamento."
    }
    "11" {
      $path = "$apiBasePath/api/v1/control/queryDoorStatus"
      $body = @{ deviceId = Read-RequiredValue "ID do dispositivo" }
    }
    "12" {
      $method = "GET"
      $path = "$apiBasePath/api/v1/order/list"
      $query = @{
        pageNo = Read-IntegerValue "Página" 1
        pageSize = Read-IntegerValue "Itens por página" 50 1 200
      }
      foreach ($filter in @("device", "orderNo", "createTimeStart", "createTimeEnd")) {
        $value = if ($filter -match "createTime") {
          Read-OptionalDate $filter
        } else {
          Read-OptionalValue "$filter (opcional)"
        }
        if ($value) { $query[$filter] = $value }
      }
    }
    "13" {
      $path = "$apiBasePath/api/v1/coupon/generate"
      $name = Read-RequiredValue "Nome do cupom"
      $type = Read-IntegerValue "Tipo (1 a 5: desconto mínimo, brinde, percentual, dinheiro, resgate)" 1 1 5
      $rule = Read-OptionalValue 'Regra em JSON (ex.: {"amount":10})' "{}"
      try {
        $null = ConvertFrom-Json -InputObject $rule -ErrorAction Stop
      } catch {
        throw "A regra precisa conter JSON válido."
      }
      $startDate = Read-RequiredValue "Data inicial (AAAA-MM-DD)"
      $endDate = Read-RequiredValue "Data final (AAAA-MM-DD)"
      $parsedStartDate = [datetime]::MinValue
      $parsedEndDate = [datetime]::MinValue
      $dateFormat = "yyyy-MM-dd"
      $dateCulture = [Globalization.CultureInfo]::InvariantCulture
      $dateStyles = [Globalization.DateTimeStyles]::None
      if (-not [datetime]::TryParseExact($startDate, $dateFormat, $dateCulture, $dateStyles, [ref]$parsedStartDate) -or
          -not [datetime]::TryParseExact($endDate, $dateFormat, $dateCulture, $dateStyles, [ref]$parsedEndDate)) {
        throw "Data inválida: use o formato AAAA-MM-DD."
      }
      if ($parsedStartDate -gt $parsedEndDate) {
        throw "A data inicial não pode ser posterior à data final."
      }
      $startTime = Read-OptionalValue "Horário inicial (HH:mm:ss)" "00:00:00"
      $endTime = Read-OptionalValue "Horário final (HH:mm:ss)" "23:59:59"
      $parsedStartTime = [datetime]::MinValue
      $parsedEndTime = [datetime]::MinValue
      if (-not [datetime]::TryParseExact($startTime, "HH:mm:ss", $dateCulture, $dateStyles, [ref]$parsedStartTime) -or
          -not [datetime]::TryParseExact($endTime, "HH:mm:ss", $dateCulture, $dateStyles, [ref]$parsedEndTime)) {
        throw "Horário inválido: use o formato HH:mm:ss."
      }
      $quantity = Read-IntegerValue "Quantidade de códigos (1 a 100)" 1 1 100
      $deviceScope = Read-ScopeIds "dispositivos"
      $productScope = Read-ScopeIds "produtos"
      $body = @{
        name = $name
        type = $type
        rule = $rule
        startDate = $startDate
        endDate = $endDate
        startTime = $startTime
        endTime = $endTime
        quantity = $quantity
      }
      if (-not $deviceScope.All) { $body.deviceIds = $deviceScope.Ids }
      if (-not $productScope.All) { $body.productIds = $productScope.Ids }
      $warning = "Esta chamada cria cupons. Escopo: dispositivos $(if ($deviceScope.All) { 'TODOS' } else { $deviceScope.Ids -join ', ' }); produtos $(if ($productScope.All) { 'TODOS' } else { $productScope.Ids -join ', ' })."
    }
    "14" {
      $path = "$apiBasePath/api/v1/coupon/list"
      $query = @{
        pageNo = Read-IntegerValue "Página" 1
        pageSize = Read-IntegerValue "Itens por página" 50
      }
      $body = @{}
      $status = Read-OptionalInteger "Status do cupom (1 não utilizado, 2 utilizado)" 1 2
      if ($null -ne $status) { $body.status = $status }
    }
    "15" {
      $method = "GET"
      $path = "$apiBasePath/api/v1/coupon/getByCode"
      $query = @{ code = Read-RequiredValue "Código do cupom" }
    }
    "16" {
      $method = (Read-RequiredValue "Método (GET, POST, PUT, PATCH ou DELETE)").ToUpperInvariant()
      if ($method -notin @("GET", "POST", "PUT", "PATCH", "DELETE")) {
        throw "Método HTTP não suportado."
      }
      $customPath = Read-RequiredValue "Caminho relativo iniciado por /api/luobo-machine-api/api/"
      if (-not $customPath.StartsWith("$apiBasePath/api/", [StringComparison]::Ordinal) -or
          $customPath.StartsWith("//") -or $customPath.Contains("\")) {
        throw "O caminho precisa ser relativo e permanecer dentro da API Feige configurada."
      }
      $path = $customPath.Split("?")[0]
      if ($customPath.Contains("?")) {
        $query = @{}
        foreach ($part in $customPath.Split("?", 2)[1].Split("&")) {
          if (-not $part) { continue }
          $pieces = $part.Split("=", 2)
          $key = [uri]::UnescapeDataString($pieces[0])
          $value = if ($pieces.Count -gt 1) { [uri]::UnescapeDataString($pieces[1]) } else { "" }
          $query[$key] = $value
        }
      } else {
        $query = @{}
      }
      if ($method -notin @("GET", "DELETE")) {
        $body = Read-JsonObject "Corpo JSON (objeto) ou Enter para enviar sem corpo" -Optional
      }
      $warning = "Confira o método, caminho e dados da chamada personalizada antes de executar."
    }
  }

  return @{
    Method = $method
    Path = $path
    Query = $query
    Body = $body
    Warning = $warning
  }
}

try {
  Connect-FeigeApi
} catch {
  Write-Host "Não foi possível autenticar: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "Confirme credentials.json e execute .\setup-credentials.ps1 se necessário."
  exit 1
}

while ($true) {
  Write-Host ""
  Write-Host "=== Feige API - Testes pelo terminal ===" -ForegroundColor Cyan
  Write-Host " 1. Listar dispositivos"
  Write-Host " 2. Consultar estoque"
  Write-Host " 3. Atualizar estoque"
  Write-Host " 4. Testar canais do dispositivo"
  Write-Host " 5. Consultar resultado do teste de canais"
  Write-Host " 6. Listar produtos"
  Write-Host " 7. Dispensar produto"
  Write-Host " 8. Consultar resultado da dispensação"
  Write-Host " 9. Abrir porta"
  Write-Host "10. Fechar porta"
  Write-Host "11. Consultar estado da porta"
  Write-Host "12. Listar pedidos"
  Write-Host "13. Gerar cupons"
  Write-Host "14. Listar cupons"
  Write-Host "15. Consultar cupom por código"
  Write-Host "16. Chamada personalizada da API Feige"
  Write-Host "17. Renovar autenticação"
  Write-Host " 0. Sair"

  $action = (Read-Host "Selecione uma operação").Trim()
  if ($action -eq "0") {
    break
  }
  if ($action -eq "17") {
    try {
      Connect-FeigeApi
    } catch {
      Write-Host "Falha na autenticação: $($_.Exception.Message)" -ForegroundColor Red
    }
    continue
  }
  if ($action -notin @("1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16")) {
    Write-Host "Opção inválida." -ForegroundColor Yellow
    continue
  }

  try {
    $request = Get-ApiRequestDefinition -Action $action
    if ($request.Warning) {
      $confirmationText = "EXECUTAR"
      if (-not (Confirm-Operation -Description $request.Warning -TypedConfirmation $confirmationText)) {
        Write-Host "Chamada cancelada." -ForegroundColor Yellow
        continue
      }
    }

    Invoke-FeigeRequest -Path $request.Path -Method $request.Method -Query $request.Query -Body $request.Body
  } catch {
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
  }
}
