# Testador da API Feige

Ferramentas no navegador para autenticar na API Feige, enviar requisições, monitorar máquinas de venda automática e executar diagnósticos de conectividade.

> [!NOTE]
> O backend local usa módulos nativos do Node.js 18 ou superior. Não é necessário instalar pacotes.

## Conteúdo

- [Início rápido](#início-rápido)
- [Aplicativo web](#aplicativo-web)
- [Testador interativo no terminal](#testador-interativo-no-terminal)
- [Página de monitoração](#página-de-monitoração)
- [Diagnósticos](#diagnósticos)
- [Referência da API do sistema Vending](#referência-da-api-do-sistema-vending)
  - [Autenticação](#autenticação)
  - [Dispositivos e estoque](#dispositivos-e-estoque)
  - [Produtos](#produtos)
  - [Controle de dispositivos](#controle-de-dispositivos)
  - [Pedidos](#pedidos)
  - [Cupons](#cupons)
  - [Callback da API](#callback-da-api)

## Início rápido

### Requisitos

- Windows PowerShell
- Node.js 18 ou superior
- Chave da API Feige e segredo do aplicativo

### Configurar as credenciais

Execute o script de configuração e informe a chave e o segredo do aplicativo quando solicitado:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup-credentials.ps1
```

A alteração da política de execução se aplica somente ao processo atual do PowerShell. Ela não é salva na máquina nem no perfil do usuário.

> [!WARNING]
> O arquivo `credentials.json` armazena as credenciais em texto simples. Ele é excluído do Git, mas qualquer pessoa com acesso ao arquivo pode lê-las. Se o arquivo já existir, o script de configuração solicitará confirmação antes de substituí-lo.

### Iniciar o aplicativo

Para iniciar o backend e abrir o aplicativo automaticamente:

```powershell
.\open-tester.ps1
```

O script verifica se o backend já está em execução. Se necessário, inicia o backend Node.js em segundo plano, aguarda uma resposta e abre <http://127.0.0.1:8000>. A saída da inicialização é salva em `logs\backend.log` e `logs\backend-error.log`.
Os eventos do aplicativo são gravados como texto simples em `logs\app-events.txt`. O registro inclui resultados da autenticação e caminhos, métodos, códigos de status e duração das requisições à API; tokens e corpos de requisição/resposta não são registrados. Ao atingir 100 MiB, o registrador trunca o conteúdo anterior e mantém um marcador de truncamento junto do evento mais recente.

Para iniciar somente o backend:

```powershell
.\start.ps1
```

## Aplicativo web

O aplicativo autentica por meio do backend local na porta `8000`. Somente origens locais compatíveis são aceitas; origens acessíveis pela rede e outras portas são rejeitadas intencionalmente.

- Endpoint de autenticação: `https://veda.figeth.com/api/auth/apply`
- URL base da API protegida: `https://veda.figeth.com/api/luobo-machine-api`
- Catálogo de produtos: abra `products.html` para consultar a planilha de estoque, com fotos associadas pelo código do produto.
- As credenciais são lidas pelo backend e não são enviadas nem armazenadas no navegador.
- O token de acesso permanece na sessão atual do navegador e é removido quando ela termina.
- As requisições à API passam pelo backend local para contornar as restrições de CORS do navegador.

Depois de autenticar, carregue uma coleção do Postman colando o JSON, selecionando um arquivo JSON ou escolhendo **Collection Feige**. Revise as requisições importadas antes de enviá-las, especialmente as que alteram dados ou controlam equipamentos.

Depois que uma requisição for concluída, selecione **Visualizar em HTML** para abrir a resposta formatada. O visualizador lê o resultado mais recente da sessão atual do navegador e oculta campos confidenciais, como tokens e segredos.

### Iniciar o backend pelo navegador

Para permitir que o botão **Autenticar e abrir sessão** inicie o backend quando ele ainda não estiver em execução, instale uma vez o manipulador de protocolo do Windows:

```powershell
.\install-protocol.ps1
```

Quando você clicar em autenticar com o backend parado, o navegador solicitará permissão para abrir o Testador da API Feige. Autorize: o backend será iniciado em segundo plano e a página tentará autenticar novamente. Nenhuma janela do PowerShell ficará aberta. Esse recurso também funciona com o Live Server do VS Code em <http://127.0.0.1:5500>.

Para remover o manipulador de protocolo:

```powershell
.\uninstall-protocol.ps1
```

## Testador interativo no terminal

Execute o testador de terminal pelo PowerShell:

```powershell
.\api-terminal-test.ps1
```

O script autentica usando `credentials.json` e solicita os parâmetros necessários para a operação selecionada. Ele inclui operações integradas de monitoração e teste, além de uma opção de chamada personalizada limitada aos caminhos da API Feige.

As respostas são exibidas com rótulos e registros legíveis, e o status HTTP é mostrado separadamente. O JSON bruto não é exibido. Tokens e campos secretos são ocultados.

> [!WARNING]
> Alterações de estoque, criação de cupons, testes de canais, dispensação de produtos e controles das portas dos armários exigem que você digite `EXECUTAR` antes do envio. Operações físicas podem acionar equipamentos. Use somente dispositivos e contas que você tenha autorização para operar.

Para gerar cupons, informe os IDs dos dispositivos e produtos ou digite explicitamente `TODOS` para aplicar o escopo selecionado a todos os dispositivos ou produtos.

As requisições à API feitas por esse script são enviadas diretamente para `https://veda.figeth.com`.

## Página de monitoração

Depois de autenticar, abra `monitor.html` na mesma origem. A página inclui status dos dispositivos e controles de atualização, estoque, produtos, dispensação, portas dos armários, pedidos e cupons.

### Relatório de reposição

Na parte superior da página de monitoração, selecione uma máquina para gerar um relatório de reposição por canal. Ele mostra o código de barras de cada produto, a quantidade máxima (`capacity`, usando `totalInventoryCount` como alternativa), a quantidade atual e quantas unidades faltam para completar cada canal. A quantidade necessária é `max(0, máximo - atual)`; quantidades ausentes são exibidas como indisponíveis. O alarme de estoque baixo verifica todos os dispositivos e lista os canais com produto cadastrado e de 0 a 5 unidades disponíveis. A verificação é executada ao carregar a página, a cada cinco minutos ou ao selecionar **Verificar todas as máquinas**. Se a consulta de estoque falhar, o status informa que a verificação foi incompleta. Use **Atualizar relatório** para consultar novamente a máquina selecionada. **Imprimir / salvar PDF** abre a caixa de impressão do navegador; escolha **Salvar como PDF** (ou a opção equivalente) para criar o arquivo. O layout de impressão contém somente o relatório e os detalhes da máquina selecionada.

### Dispensação de produtos

O primeiro painel orienta a operação de dispensação física:

1. Selecione um dispositivo.
2. Carregue os canais de estoque cadastrados nele.
3. Selecione um ou mais canais.
4. Confirme a operação antes de enviá-la.

A resposta inclui o ID da tarefa de dispensação, que pode ser usado para consultar o resultado.

### Relatório de vendas

O relatório mostra os 10 pedidos mais recentes sem filtro de data e, separadamente, uma lista paginada para o período selecionado, incluindo as datas inicial e final. O período padrão é de 24 horas.

- Selecione **Buscar período** para aplicar o intervalo de datas.
- O relatório é atualizado automaticamente a cada cinco minutos.
- Selecione **Atualizar agora** para atualizar ambas as seções imediatamente.
- Horários sem fuso explícito são interpretados como horário padrão da China (UTC+8) e exibidos no fuso fixo GMT−3. Horários com deslocamento explícito são convertidos a partir desse fuso.
- Pedidos sem horário de pagamento válido são omitidos dos resultados do período, e essa informação é exibida no status.

### Curva ABC de vendas

O relatório de vendas pela Curva ABC, próximo à parte inferior da página de monitoração, analisa os últimos 30 dias até o momento da consulta. Ele percorre as páginas de pedidos, considera os pedidos com pagamento concluído (`payStatus = 2`) e classifica os produtos pela receita de cada item. A tabela inclui o código de barras de cada produto, localizado nos canais de estoque dos dispositivos pelo ID do produto ou por um nome sem ambiguidades. A classe A representa aproximadamente os primeiros 80% da receita acumulada; a B vai até cerca de 95%; e a C corresponde ao restante. O produto que ultrapassa um limite completa a classe correspondente. Itens sem dados suficientes de produto ou receita são excluídos e informados no status. Depois da tabela detalhada, um gráfico de Pareto exibe barras de receita por produto e uma linha de receita acumulada. O relatório é atualizado a cada cinco minutos ou sob demanda.

Depois do relatório ABC, o monitor de tentativas de compra lista todos os pedidos retornados nos últimos 30 dias, independentemente do `payStatus`. A lista é atualizada a cada cinco minutos ou sob demanda. O manual da Feige define `2` como pagamento concluído e `3` como reembolsado; confirme com a Feige o significado dos demais códigos de status. Tentativas que não geram um pedido não ficam visíveis no endpoint de listagem de pedidos.

### Catálogo de produtos

Abra `products.html` para pesquisar por código, nome ou variação os produtos da planilha `Fotos Vending Machine\relatorio-estoque-por-local-2026-11-17-1109 (1).xlsx` e filtrar por local de estoque. O catálogo exibe somente variações associadas a uma foto ou vídeo. Use o seletor ao lado de **Lista de produtos** para ordenar de forma decrescente por preço de venda, quantidade em estoque ou valor estimado. O catálogo mostra cor, tamanho, variação, preço de venda, valor estimado do estoque e quantidade por local; o resumo inclui o valor estimado total dos produtos que têm fotos correspondentes. Os arquivos de imagem e vídeo são associados pelo código do produto no início do nome do arquivo. **Baixar relatório de produtos sem foto** exporta todos os produtos sem imagem correspondente. **Baixar relatório de produtos com foto e/ou vídeo** exporta os produtos com pelo menos uma foto ou vídeo correspondente, em colunas separadas com links absolutos para cada tipo de mídia. Ambos os botões baixam planilhas CSV em UTF-8 com detalhes dos produtos e quantidades em estoque por local, compatíveis com o Excel. O arquivo `products.json` gerado contém os dados consolidados da planilha e os caminhos das mídias. Os links de mídia são servidos somente a partir do diretório `Fotos Vending Machine` e apenas para os formatos de imagem e MP4 compatíveis.

### Testes de equipamento e estoque

Abra `monitor-tests.html` ou selecione **Testes** na navegação da página de monitoração para testar canais de produtos e consultar o resultado de uma tarefa de teste. Os testes podem acionar o equipamento e exigem confirmação explícita.

Selecione **Estoque** ao lado de um dispositivo para abrir uma visualização do estoque com canais cadastrados, unidades disponíveis, capacidade e barras de nível de estoque. O JSON da resposta não é exibido.

> [!IMPORTANT]
> Alterações de estoque, dispensação, controles de portas e geração de cupons exigem confirmação explícita. A integração de callback é recebida por comunicação servidor a servidor; ela não é uma operação iniciada pela página de monitoração.

## Diagnósticos

### Diagnóstico de autenticação

O diagnóstico de autenticação usa `curl.exe` pelo PowerShell, em vez do navegador. Isso permite inspecionar diretamente o status HTTP e a resposta da API, sem as restrições de CORS aplicadas pelo navegador.

Execute-o com:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\auth-test.ps1
```

O script lê o mesmo arquivo `credentials.json` usado pelo backend. As credenciais são enviadas no corpo JSON de `POST https://veda.figeth.com/api/auth/apply`, e não nos argumentos de linha de comando do curl. Antes da requisição, o script envia uma solicitação de preflight `OPTIONS` usando a origem configurada e registra o status e os cabeçalhos CORS.

Para usar outra URL, origem ou caminho de log:

```powershell
.\auth-test.ps1 `
  -BaseUrl "https://server.example/api" `
  -Origin "http://127.0.0.1:5500" `
  -LogPath ".\logs\auth-test.jsonl"
```

O log JSONL é gravado em `logs\auth-test.jsonl`. Os nomes dos campos do log e as mensagens de erro geradas pelo script permanecem em inglês. Cada entrada inclui os comandos `curlCommands.preflight` e `curlCommands.authentication` usados no teste. O corpo do comando de autenticação é ocultado; substitua os marcadores localmente para reproduzi-lo.

Segredos, chaves e tokens são ocultados. O token nunca é exibido nem salvo; o log informa somente se ele foi recebido. O corpo da resposta da API é preservado para diagnóstico e pode conter texto no idioma retornado pela API.

Códigos de saída:

| Código | Significado |
|---:|---|
| `0` | Autenticação e preflight concluídos com sucesso |
| `1` | Falha de transporte do curl |
| `2` | Resposta HTTP malsucedida ou token ausente |
| `3` | A API não autorizou o preflight para a origem solicitada |

### Teste de conectividade com JSONPlaceholder

Use este teste para verificar o `curl.exe` independentemente da API Feige:

```powershell
.\jsonplaceholder-test.ps1
```

O script envia `GET /posts/1` (espera HTTP `200`) e `POST /posts` (espera HTTP `201`) para `https://jsonplaceholder.typicode.com`. Os resultados são acrescentados em inglês a `logs\jsonplaceholder-test.jsonl`. Cada entrada do log inclui um `curlCommand` pronto para o PowerShell que reproduz a requisição. Nenhuma credencial Feige é usada.

### Limitação de CORS

O `curl.exe` não aplica as regras de CORS. O preflight explícito permite inspecionar a resposta `OPTIONS` do servidor, mas somente o navegador aplica a política de CORS. Uma autenticação bem-sucedida confirma a conectividade e o comportamento HTTP da API; o log também registra se a resposta do preflight contém os cabeçalhos esperados para a origem solicitada.

## Referência da API do sistema Vending

### Autenticação

Esta referência foi transcrita de `Vending_System_API_Documentation_EN (2).docx` (versão `1.21`).

Substitua `https://xxx.xxx.xxx` pelo host da API e acrescente `/prod-api` quando necessário na sua implantação. Salvo indicação em contrário, as rotas protegidas exigem o token de acesso obtido por `POST /auth/apply`, enviado no cabeçalho `Authorization` da requisição.

Crie um AppKey e um AppSecret no console de administração, em **Informações pessoais > Configuração do desenvolvedor**.

#### Obter um token de autenticação

`POST /auth/apply` (não exige token)

| Campo | Local | Tipo | Obrigatório | Descrição |
|---|---|---|---|---|
| `appKey` | Corpo JSON | Texto | Sim | Chave do aplicativo |
| `appSecret` | Corpo JSON | Texto | Sim | Segredo do aplicativo |

Exemplo de resposta:

```json
{
  "code": 200,
  "msg": null,
  "data": {
    "access_token": "<access_token>",
    "expires_in": 720
  }
}
```

`expires_in` é o tempo de validade do token, em minutos.

### Dispositivos e estoque

#### Listar dispositivos

`POST /api/v1/device/list`

| Campo | Local | Tipo | Obrigatório | Descrição |
|---|---|---|---|---|
| `pageNo` | Consulta | Inteiro | Sim | Número da página |
| `pageSize` | Consulta | Inteiro | Sim | Quantidade de itens por página |
| `deviceName` | Corpo JSON | Texto | Não | Palavra-chave para pesquisar o nome do dispositivo |
| `status` | Corpo JSON | Inteiro | Não | `1` = online; `2` = offline |

A resposta contém a lista paginada `result.records`. Os campos de dispositivo documentados pela API incluem `id`, `deviceUuid`, `deviceName`, `language`, `sim`, `strength4g`, `strengthWifi`, `status`, `deviceVersion` e `timeZoneId`.

#### Listar o estoque de um dispositivo

`POST /api/v1/deviceInventory/list`

| Campo | Local | Tipo | Obrigatório | Descrição |
|---|---|---|---|---|
| `deviceId` | Consulta | Inteiro longo | Sim | ID do dispositivo |

A resposta contém `result.cargoPassageList`. Os campos de estoque incluem `id` (ID do estoque), `categoryLevel` (`1` = categoria principal, `2` = subcategoria), `productCategoryId`, `categoryName`, `productId`, `productName`, `boardNo`, `cargoPassageId`, `cargoPassageNo`, `totalInventoryCount`, `currentInventoryCount` e `status` (`1` = desativado, `2` = ativo).

#### Repor estoque

`POST /api/v1/deviceInventory/replenish`

| Campo | Local | Tipo | Obrigatório | Descrição |
|---|---|---|---|---|
| `infoList` | Corpo JSON | Lista | Sim | Atualizações das quantidades de estoque |
| `infoList[].inventoryId` | Corpo JSON | Texto | Sim | ID do estoque |
| `infoList[].count` | Corpo JSON | Inteiro | Sim | Quantidade em estoque após a contagem física |

#### Testar canais de produtos

`POST /api/v1/deviceInventory/testChannel`

| Campo | Local | Tipo | Obrigatório | Descrição |
|---|---|---|---|---|
| `deviceId` | Corpo JSON | Texto | Sim | ID do dispositivo |
| `ids` | Corpo JSON | Lista de textos | Sim | IDs dos estoques a testar |

A resposta `result` contém o ID da tarefa de teste.

#### Consultar resultados do teste de canais

`GET /api/v1/deviceInventory/getTestResult`

| Campo | Local | Tipo | Obrigatório | Descrição |
|---|---|---|---|---|
| `id` | Consulta | Texto | Sim | ID da tarefa de teste |

As entradas do resultado contêm `vendorResult`, `vendorResultText` e `inventoryId`.

### Produtos

#### Listar produtos

`GET /api/v1/productCategory/listPrivate`

| Campo | Local | Tipo | Obrigatório | Descrição |
|---|---|---|---|---|
| `pageNo` | Consulta | Inteiro | Sim | Número da página |
| `pageSize` | Consulta | Inteiro | Sim | Quantidade de itens por página |
| `name` | Consulta | Texto | Não | Pesquisa pelo nome do produto |

Os campos do produto incluem `id`, `name`, `imageUrl`, `costPrice`, `price`, `productCategoryId` e `productCategoryName`.

### Controle de dispositivos

#### Dispensar produtos pelos canais

`POST /api/v1/freeTier/vend`

| Campo | Local | Tipo | Obrigatório | Descrição |
|---|---|---|---|---|
| `deviceId` | Corpo JSON | Texto | Sim | ID do dispositivo |
| `cargoPassageIds` | Corpo JSON | Lista de textos | Sim | IDs dos canais de produtos |

A resposta `result` contém o ID da tarefa de dispensação.

#### Consultar resultados da dispensação

`GET /api/v1/freeTier/getVendorResult`

| Campo | Local | Tipo | Obrigatório | Descrição |
|---|---|---|---|---|
| `vendorId` | Consulta | Texto | Sim | ID da tarefa de dispensação |

As entradas do resultado contêm `vendorResult`, `vendorResultText` e `cargoPassageId`.

#### Abrir a porta do armário inteligente

`POST /api/v1/control/openDoor`

| Campo | Local | Tipo | Obrigatório | Descrição |
|---|---|---|---|---|
| `deviceId` | Corpo JSON | Texto | Sim | ID do dispositivo |
| `delayClose` | Corpo JSON | Inteiro | Não | Tempo até fechar, em milissegundos; o padrão é 3 segundos |

A resposta contém `testId`, o ID da tarefa.

#### Fechar a porta do armário inteligente

`POST /api/v1/control/closeDoor`

| Campo | Local | Tipo | Obrigatório | Descrição |
|---|---|---|---|---|
| `deviceId` | Corpo JSON | Texto | Sim | ID do dispositivo |

A resposta contém `testId`, o ID da tarefa.

#### Consultar o estado da porta do armário inteligente

`POST /api/v1/control/queryDoorStatus`

| Campo | Local | Tipo | Obrigatório | Descrição |
|---|---|---|---|---|
| `deviceId` | Corpo JSON | Texto | Sim | ID do dispositivo |

A resposta contém `mainOpen` e `subOpen`: `0` = fechada; `1` = aberta.

### Pedidos

#### Listar pedidos

`POST /api/v1/order/list`

| Campo | Local | Tipo | Obrigatório | Descrição |
|---|---|---|---|---|
| `pageNo` | Consulta | Inteiro | Sim | Número da página |
| `pageSize` | Consulta | Inteiro | Sim | Quantidade de itens por página |
| `device` | Corpo JSON | Texto | Não | UUID ou nome do dispositivo |
| `orderNo` | Corpo JSON | Texto | Não | Número do pedido |
| `createTimeStart` | Corpo JSON | Data | Não | Data inicial do pagamento; o padrão é hoje |
| `createTimeEnd` | Corpo JSON | Data | Não | Data final do pagamento; o padrão é hoje |

O corpo JSON é obrigatório; envie `{}` quando nenhum filtro for especificado.

Os registros de pedidos incluem `orderNo`, `orderItemList`, `payTime`, `payStatus`, `refundTime` e `returnMoney`. O manual define `payStatus` como `2` = pagamento concluído e `3` = reembolsado. Cada entrada de `orderItemList` pode incluir `takeStatus`, o resultado da dispensação.

### Cupons

#### Gerar códigos de cupom

`POST /api/v1/coupon/generate`

| Campo | Local | Tipo | Obrigatório | Descrição |
|---|---|---|---|---|
| `name` | Corpo JSON | Texto | Sim | Nome do cupom |
| `detail` | Corpo JSON | Texto | Não | Detalhes do cupom |
| `remark` | Corpo JSON | Texto | Não | Observações do cupom |
| `type` | Corpo JSON | Inteiro | Sim | `1` desconto por valor mínimo; `2` brinde por valor mínimo; `3` desconto percentual; `4` vale em dinheiro; `5` vale-resgate |
| `rule` | Corpo JSON | Texto | Sim | Detalhes da regra; o padrão é `"{}"` |
| `deviceIds` | Corpo JSON | Lista de inteiros longos | Não | IDs dos dispositivos; se omitido, aplica-se a todos |
| `productIds` | Corpo JSON | Lista de inteiros longos | Não | IDs dos produtos; se omitido, aplica-se a todos |
| `startDate` | Corpo JSON | Texto | Sim | Data inicial (`YYYY-MM-dd`) |
| `endDate` | Corpo JSON | Texto | Sim | Data final (`YYYY-MM-dd`) |
| `startTime` | Corpo JSON | Texto | Sim | Horário inicial (`HH:mm:ss`) |
| `endTime` | Corpo JSON | Texto | Sim | Horário final (`HH:mm:ss`) |
| `quantity` | Corpo JSON | Inteiro | Sim | Quantidade de códigos a gerar (`1`–`100`) |

A resposta `result` contém os códigos de cupom gerados.

#### Listar cupons

`POST /api/v1/coupon/list`

| Campo | Local | Tipo | Obrigatório | Descrição |
|---|---|---|---|---|
| `pageNo` | Consulta | Inteiro | Sim | Número da página |
| `pageSize` | Consulta | Inteiro | Sim | Quantidade de itens por página |
| `status` | Corpo JSON | Inteiro | Não | Estado de uso: `1` = não utilizado; `2` = utilizado |

#### Localizar cupom pelo código

`GET /api/v1/coupon/getByCode`

| Campo | Local | Tipo | Obrigatório | Descrição |
|---|---|---|---|---|
| `code` | Consulta | Texto | Sim | Código do cupom |

### Callback da API

A API envia uma requisição HTTP `POST` com `Content-Type: application/json` para a URL de callback configurada pelo solicitante. O conteúdo inclui:

| Campo | Descrição |
|---|---|
| `type` | `0` = teste; `1` = notificação de pedido |
| `timestamp` | Data e hora usadas na assinatura |
| `nonce` | Texto aleatório |
| `data` | Dados comerciais originais, codificados como uma string JSON |
| `dataHash` | Hash MD5 de `data`, em hexadecimal minúsculo |
| `sign` | Assinatura codificada em Base64 |

Verifique a assinatura usando a chave pública. O manual especifica que os campos, exceto `sign`, sejam concatenados em ordem crescente pelo nome da chave no formato `k=v&...`, assinados com `MD5withRSA` e então codificados em Base64.

Exemplo da string usada na assinatura:

```text
dataHash=e99a18c428cb38d5f260853678922e03&nonce=b1fc0c3eabc34f1f9a2d3f4c5e6a7b8c&timestamp=1686580000000&type=1
```

Se a verificação falhar, registre a falha e, opcionalmente, retorne um status HTTP diferente de 200 ou uma resposta de erro assinada. O manual determina que a assinatura da resposta de erro use a mesma chave privada.
