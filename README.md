# Feige API Tester

Browser-based tools for authenticating with the Feige API, sending requests, monitoring vending machines, and running connectivity diagnostics.

> [!NOTE]
> The local backend uses built-in modules from Node.js 18 or newer. No package installation is required.

## Contents

- [Quick start](#quick-start)
- [Web application](#web-application)
- [Interactive terminal tester](#interactive-terminal-tester)
- [Monitoring page](#monitoring-page)
- [Diagnostics](#diagnostics)
- [Vending System API reference](#vending-system-api-reference)
  - [Authentication](#authentication)
  - [Devices and inventory](#devices-and-inventory)
  - [Products](#products)
  - [Device control](#device-control)
  - [Orders](#orders)
  - [Coupons](#coupons)
  - [API callback](#api-callback)

## Quick start

### Requirements

- Windows PowerShell
- Node.js 18 or newer
- Feige API App Key and App Secret

### Configure credentials

Run the setup script and enter the App Key and App Secret when prompted:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup-credentials.ps1
```

The execution-policy change applies only to the current PowerShell process. It is not saved to the machine or user profile.

> [!WARNING]
> `credentials.json` stores credentials as plain text. The file is excluded from Git, but anyone with access to it can read the credentials. If it already exists, the setup script asks for confirmation before replacing it.

### Start the application

To start the backend and open the application automatically:

```powershell
.\open-tester.ps1
```

The script checks whether the backend is already running. If needed, it starts the Node.js backend in the background, waits for it to respond, and opens <http://127.0.0.1:8000>. Startup output is saved to `logs\backend.log` and `logs\backend-error.log`.

To start only the backend:

```powershell
.\start.ps1
```

## Web application

The application authenticates through the local backend on port `8000`. Only supported local origins are accepted; network-accessible origins and other ports are intentionally rejected.

- Authentication endpoint: `https://veda.figeth.com/api/auth/apply`
- Protected API base URL: `https://veda.figeth.com/api/luobo-machine-api`
- Product catalog: open `products.html` to browse the inventory spreadsheet with product photos matched by product code.
- Credentials are read by the backend and are not sent to or stored in the browser.
- The access token stays in the current browser session and is removed when that session ends.
- API requests pass through the local backend to avoid browser CORS restrictions.

After authenticating, load a Postman collection by pasting its JSON, selecting a JSON file, or choosing **Collection Feige**. Review imported requests before sending them, especially requests that change data or control equipment.

After a request completes, select **Visualizar em HTML** to open a formatted response. The viewer reads the latest result from the current browser session and redacts sensitive fields such as tokens and secrets.

### Start the backend from the browser

To let the **Autenticar e abrir sessão** button start the backend when it is not already running, install the Windows protocol handler once:

```powershell
.\install-protocol.ps1
```

When authentication is clicked while the backend is stopped, the browser asks permission to open the Feige API Tester. Allow it; the backend starts in the background and the page retries authentication. No PowerShell window remains open. This also works with VS Code Live Server at <http://127.0.0.1:5500>.

To remove the protocol handler:

```powershell
.\uninstall-protocol.ps1
```

## Interactive terminal tester

Run the terminal tester from PowerShell:

```powershell
.\api-terminal-test.ps1
```

The script authenticates with `credentials.json` and prompts for the parameters required by the selected operation. It includes the built-in monitoring and test operations, plus a custom-call option limited to the Feige API path.

Responses are shown as readable labels and records, with the HTTP status displayed separately. They are not dumped as JSON. Tokens and secret fields are hidden.

> [!WARNING]
> Stock changes, coupon creation, channel tests, product dispensing, and cabinet-door controls require typing `EXECUTAR` before sending. Physical operations may activate equipment. Use only with devices and accounts you are authorized to operate.

For coupon generation, enter device and product IDs or explicitly type `TODOS` to apply the selected scope to all devices or products.

API requests from this script are sent directly to `https://veda.figeth.com`.

## Monitoring page

Open `monitor.html` from the same origin after authenticating. The page includes device status and refresh controls, inventory, products, dispensing, cabinet doors, orders, and coupons.

### Replenishment report

At the top of the monitoring page, select a machine to generate a per-channel replenishment report. It shows the machine details, maximum quantity (`capacity`, falling back to `totalInventoryCount`), current quantity, and number needed to refill each channel. The needed quantity is `max(0, maximum - current)`; missing quantities are displayed as unavailable. Use **Atualizar relatório** to query the selected machine again. **Imprimir / salvar PDF** opens the browser's print dialog; choose **Save as PDF** (or the equivalent option in your browser) to create the PDF. The print layout contains only the report and its machine details.

### Product dispensing

The first panel guides the physical dispensing operation:

1. Select a device.
2. Load its listed stock channels.
3. Select one or more channels.
4. Confirm the operation before sending it.

The response includes the dispensing task ID, which can be used to query its result.

### Sales report

The report shows the 10 most recent orders without a date filter and a separate, paginated list for the selected inclusive date range. The default range is the last 24 hours.

- Select **Buscar período** to apply the date range.
- The report refreshes automatically every five minutes.
- Select **Atualizar agora** to refresh both sections immediately.
- Timestamps without an explicit time zone are interpreted as China Standard Time (UTC+8) and displayed in fixed GMT-3. Timestamps with an explicit offset are converted from that offset.
- Orders without a valid payment time are omitted from period results and reported in the status.

### ABC sales curve

The ABC sales report appears at the bottom of the monitoring page and analyzes the rolling 30 days through the time of the query. It paginates through orders, filters to payment-completed orders (`payStatus = 2`), and ranks products by line-item revenue. Class A covers approximately the first 80% of cumulative revenue, B through approximately 95%, and C the remainder; the product that crosses a threshold completes that class. Items without enough product or revenue data are excluded and reported in the status. A Pareto chart follows the detailed table, with bars for product revenue and a cumulative-revenue line. The report refreshes every five minutes or on demand.

### Product catalog

Open `products.html` to search products from `Fotos Vending Machine\relatorio-estoque-por-local-2026-11-17-1109 (1).xlsx` by code, name, or variation and filter by stock location. Use the selector beside **Lista de produtos** to sort in descending order by sale price, stock quantity, or estimated value. The catalog shows color, size, variation, sale price, estimated stock value, and quantity by location; its summary includes the total estimated value of products with matched photos. Image files are matched by the product code at the beginning of their filename; products with no matching image remain listed with a placeholder. **Baixar relatório de produtos sem foto** exports every product without a matched image to a UTF-8 CSV spreadsheet, including product details and stock quantities by location; the file opens in Excel. The generated `products.json` contains the consolidated spreadsheet data. Product photos are served only from the `Fotos Vending Machine` directory and only for supported image types.

### Equipment tests and inventory

Open `monitor-tests.html` or select **Testes** in the monitoring navigation to test product channels and query a test task's result. Testing channels may activate the equipment and requires explicit confirmation.

Select **Estoque** beside a device to open a visual inventory view with listed channels, available units, capacity, and stock-level bars. The response JSON is not shown.

> [!IMPORTANT]
> Stock changes, dispensing, door controls, and coupon generation require explicit confirmation. The callback integration is inbound server-to-server; it is not an operation initiated by the monitoring page.

## Diagnostics

### Authentication diagnostic

The authentication diagnostic uses `curl.exe` from PowerShell rather than the browser. It allows direct inspection of the HTTP status and API response without browser-enforced CORS.

Run it with:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\auth-test.ps1
```

The script reads the same `credentials.json` file as the backend. Credentials are sent in the JSON body of `POST https://veda.figeth.com/api/auth/apply`, not in curl's command-line arguments. Before the request, the script sends an `OPTIONS` preflight using the configured origin and records the status and CORS headers.

To use a different URL, origin, or log path:

```powershell
.\auth-test.ps1 `
  -BaseUrl "https://server.example/api" `
  -Origin "http://127.0.0.1:5500" `
  -LogPath ".\logs\auth-test.jsonl"
```

The JSONL log is written to `logs\auth-test.jsonl`. Log field names and script-generated error messages are in English. Each entry includes the `curlCommands.preflight` and `curlCommands.authentication` commands used for the test. The authentication command's body is redacted; replace the placeholders locally to replay it.

Secrets, keys, and tokens are redacted. The token is never printed or saved; the log only reports whether it was received. The API response body is preserved for diagnosis and may contain text in the language returned by the API.

Exit codes:

| Code | Meaning |
|---:|---|
| `0` | Authentication and preflight succeeded |
| `1` | curl transport failure |
| `2` | Unsuccessful HTTP response or missing token |
| `3` | The API did not allow the preflight for the requested origin |

### JSONPlaceholder connectivity test

Use this test to check `curl.exe` independently from the Feige API:

```powershell
.\jsonplaceholder-test.ps1
```

The script sends `GET /posts/1` (expects HTTP `200`) and `POST /posts` (expects HTTP `201`) to `https://jsonplaceholder.typicode.com`. Results are appended in English to `logs\jsonplaceholder-test.jsonl`. Each log entry includes a PowerShell-ready `curlCommand` that reproduces the request. No Feige credentials are used.

### CORS limitation

`curl.exe` does not enforce CORS. The explicit preflight lets you inspect the server's `OPTIONS` response, but only a browser enforces CORS policy. Successful authentication confirms connectivity and the API's HTTP behavior; the log separately records whether the preflight response has the expected headers for the requested origin.

## Vending System API reference

### Authentication

This reference was transcribed from `Vending_System_API_Documentation_EN (2).docx` (version `1.21`).

Replace `https://xxx.xxx.xxx` with the API host and append `/prod-api` when required by your deployment. Unless otherwise stated, protected endpoints require the access token obtained from `POST /auth/apply` in the `Authorization` request header.

Create an AppKey and AppSecret in the administration console under **Personal Information > Developer Configuration**.

#### Obtain an authentication token

`POST /auth/apply` (does not require a token)

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `appKey` | JSON body | String | Yes | Application key |
| `appSecret` | JSON body | String | Yes | Application secret |

Example response:

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

`expires_in` is the token lifetime in minutes.

### Devices and inventory

#### List devices

`POST /api/v1/device/list`

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `pageNo` | Query | Integer | Yes | Page number |
| `pageSize` | Query | Integer | Yes | Page size |
| `deviceName` | JSON body | String | No | Device-name search keyword |
| `status` | JSON body | Integer | No | `1` = online; `2` = offline |

The response contains a paginated `result.records` list. Device fields documented by the API include `id`, `deviceUuid`, `deviceName`, `language`, `sim`, `strength4g`, `strengthWifi`, `status`, `deviceVersion`, and `timeZoneId`.

#### List device inventory

`POST /api/v1/deviceInventory/list`

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `deviceId` | Query | Long | Yes | Device ID |

The response contains `result.cargoPassageList`. Inventory fields include `id` (inventory ID), `categoryLevel` (`1` = parent, `2` = subcategory), `productCategoryId`, `categoryName`, `productId`, `productName`, `boardNo`, `cargoPassageId`, `cargoPassageNo`, `totalInventoryCount`, `currentInventoryCount`, and `status` (`1` = delisted, `2` = listed).

#### Replenish inventory

`POST /api/v1/deviceInventory/replenish`

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `infoList` | JSON body | Array | Yes | Inventory count updates |
| `infoList[].inventoryId` | JSON body | String | Yes | Inventory ID |
| `infoList[].count` | JSON body | Integer | Yes | Inventory count after stocktaking |

#### Test product channels

`POST /api/v1/deviceInventory/testChannel`

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `deviceId` | JSON body | String | Yes | Device ID |
| `ids` | JSON body | String array | Yes | Inventory IDs to test |

The response `result` is the test task ID.

#### Get product-channel test results

`GET /api/v1/deviceInventory/getTestResult`

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `id` | Query | String | Yes | Test task ID |

The result entries contain `vendorResult`, `vendorResultText`, and `inventoryId`.

### Products

#### List products

`POST /api/v1/productCategory/listPrivate`

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `pageNo` | Query | Integer | Yes | Page number |
| `pageSize` | Query | Integer | Yes | Page size |
| `name` | JSON body | String | No | Product-name search |

Product fields include `id`, `name`, `imageUrl`, `costPrice`, `price`, `productCategoryId`, and `productCategoryName`.

### Device control

#### Dispense from product channels

`POST /api/v1/freeTier/vend`

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `deviceId` | JSON body | String | Yes | Device ID |
| `cargoPassageIds` | JSON body | List of strings | Yes | Product-channel IDs |

The response `result` is the dispensing task ID.

#### Get dispensing results

`GET /api/v1/freeTier/getVendorResult`

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `vendorId` | Query | String | Yes | Dispensing task ID |

The result entries contain `vendorResult`, `vendorResultText`, and `cargoPassageId`.

#### Open smart cabinet door

`POST /api/v1/control/openDoor`

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `deviceId` | JSON body | String | Yes | Device ID |
| `delayClose` | JSON body | Integer | No | Open delay in milliseconds; defaults to 3 seconds |

The response contains `testId`, the task ID.

#### Close smart cabinet door

`POST /api/v1/control/closeDoor`

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `deviceId` | JSON body | String | Yes | Device ID |

The response contains `testId`, the task ID.

#### Query smart cabinet door status

`POST /api/v1/control/queryDoorStatus`

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `deviceId` | JSON body | String | Yes | Device ID |

The response contains `mainOpen` and `subOpen`: `0` = closed, `1` = open.

### Orders

#### List orders

`POST /api/v1/order/list`

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `pageNo` | Query | Integer | Yes | Page number |
| `pageSize` | Query | Integer | Yes | Page size |
| `device` | JSON body | String | No | Device UUID or device name |
| `orderNo` | JSON body | String | No | Order number |
| `createTimeStart` | JSON body | Date | No | Payment start time; defaults to today |
| `createTimeEnd` | JSON body | Date | No | Payment end time; defaults to today |

The JSON body is required; send `{}` when no filters are specified.

Order records include `orderNo`, `orderItemList`, `payTime`, `payStatus`, `refundTime`, and `returnMoney`. The manual documents `payStatus` as `2` = successful and `3` = refunded. Each `orderItemList` entry may include `takeStatus`, the dispensing result.

### Coupons

#### Generate coupon codes

`POST /api/v1/coupon/generate`

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `name` | JSON body | String | Yes | Coupon name |
| `detail` | JSON body | String | No | Coupon details |
| `remark` | JSON body | String | No | Coupon remarks |
| `type` | JSON body | Integer | Yes | `1` minimum-spend discount; `2` minimum-spend gift; `3` percentage discount; `4` cash voucher; `5` redemption voucher |
| `rule` | JSON body | String | Yes | Rule details; defaults to `"{}"` |
| `deviceIds` | JSON body | List of longs | No | Device IDs; omitted means all devices |
| `productIds` | JSON body | List of longs | No | Product IDs; omitted means all products |
| `startDate` | JSON body | String | Yes | Start date (`YYYY-MM-dd`) |
| `endDate` | JSON body | String | Yes | End date (`YYYY-MM-dd`) |
| `startTime` | JSON body | String | Yes | Start time (`HH:mm:ss`) |
| `endTime` | JSON body | String | Yes | End time (`HH:mm:ss`) |
| `quantity` | JSON body | Integer | Yes | Number of codes to generate (`1`–`100`) |

The response `result` contains the generated coupon codes.

#### List coupons

`POST /api/v1/coupon/list`

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `pageNo` | Query | Integer | Yes | Page number |
| `pageSize` | Query | Integer | Yes | Page size |
| `status` | JSON body | Integer | No | Usage status: `1` = unused, `2` = used |

#### Find coupon by code

`GET /api/v1/coupon/getByCode`

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `code` | Query | String | Yes | Coupon code |

### API callback

The API sends an HTTP `POST` with `Content-Type: application/json` to the callback URL configured by the caller. The payload includes:

| Field | Description |
|---|---|
| `type` | `0` = test; `1` = order notification |
| `timestamp` | Timestamp used for signing |
| `nonce` | Random string |
| `data` | Original business data, encoded as a JSON string |
| `dataHash` | Lowercase hexadecimal MD5 digest of `data` |
| `sign` | Base64-encoded signature |

Verify the signature with the public key. The manual specifies signing the fields excluding `sign`, concatenated in ascending key-name order as `k=v&...`, using `MD5withRSA`, then Base64-encoding the signature.

Example signing string:

```text
dataHash=e99a18c428cb38d5f260853678922e03&nonce=b1fc0c3eabc34f1f9a2d3f4c5e6a7b8c&timestamp=1686580000000&type=1
```

If verification fails, log the failure and optionally return a non-200 HTTP status or a signed error response. The manual says the error response signature must use the same private key.
