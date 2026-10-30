# Feige API Tester

This project contains a browser-based interface for authenticating with the Feige API and sending requests from a Postman collection, plus PowerShell scripts for command-line connectivity tests. The local backend uses Node.js 18 or newer built-ins; no package installation is required.

## Run the web app

Use Windows PowerShell to create the local credentials file. Enter the App Key and App Secret when prompted:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup-credentials.ps1
```

The execution policy change applies only to the current PowerShell process. It is not saved to the machine or user profile.

The plain-text `credentials.json` file is excluded from Git and does not require administrator privileges. It is not encrypted, so anyone with access to the file can read the credentials. To start the app, run:

```powershell
.\start.ps1
```

Open <http://127.0.0.1:8000>. Keep the backend running while using the app. If you prefer VS Code Live Server on port 5500, start the backend in another PowerShell window first, then open `http://127.0.0.1:5500`; the page sends authentication to the backend on port 8000. Other ports and network-accessible origins are intentionally rejected. Authentication uses `https://veda.figeth.com/api/auth/apply`; protected API operations use the separate base URL `https://veda.figeth.com/api/luobo-machine-api`. The backend reads credentials from `credentials.json`; the App Key and App Secret are not sent to or stored in the browser. After authentication, the app uses the returned token for API calls. Load a Postman collection by pasting its JSON, choosing a JSON file, or clicking **Collection Feige**.

The access token is kept in the current browser session and removed when you end the session. Review imported requests before sending them, especially requests that change data or control devices. API calls go through the local backend to avoid browser CORS restrictions.

## Monitoring page

Open `monitor.html` from the same origin after authenticating. The page includes device status and refresh controls plus all client operations documented below for inventory, products, dispensing, cabinet doors, orders, and coupons. API calls go through the local backend to avoid browser CORS restrictions. Stock changes, dispensing, door controls, and coupon generation require an explicit confirmation. The callback integration is inbound server-to-server and is documented separately; it is not an operation the browser can initiate.

## Command-line authentication diagnostic

The authentication diagnostic runs through `curl.exe` in PowerShell, not through the browser. This allows direct inspection of the HTTP status and API response without browser-enforced CORS.

## Run

Open PowerShell in this folder and run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\auth-test.ps1
```

The script reads the same `credentials.json` file as the web backend. It sends credentials in the JSON body of `POST https://veda.figeth.com/api/auth/apply`, not in curl's command-line arguments. Before the POST, the script sends an `OPTIONS` preflight using the configured origin and records the status and CORS headers.

To use a different URL, origin, or log path:

```powershell
.\auth-test.ps1 -BaseUrl "https://server.example/api" -Origin "http://127.0.0.1:5500" -LogPath ".\logs\auth-test.jsonl"
```

The JSONL log is written to `logs\auth-test.jsonl`. Log field names and script-generated error messages are in English. Each entry includes the `curlCommands.preflight` and `curlCommands.authentication` commands used for the test. The authentication command's body is redacted; replace the placeholders locally to replay it. Secrets, keys, and tokens are redacted; the token is never printed or saved, only reported as received or missing. The API response body is preserved for diagnosis and may contain text in the language returned by the API.

The script exits with code `0` when authentication and preflight succeed, `1` for curl transport failures, `2` for an unsuccessful HTTP response or a missing token, and `3` when the API does not allow the preflight for the requested origin.

## JSONPlaceholder connectivity test

To test `curl.exe` independently from the Feige API, run:

```powershell
.\jsonplaceholder-test.ps1
```

The script sends `GET /posts/1` (expects HTTP 200) and `POST /posts` (expects HTTP
201) to `https://jsonplaceholder.typicode.com`. Results are appended in English to
`logs\jsonplaceholder-test.jsonl`. Each log entry includes a PowerShell-ready
`curlCommand` that reproduces the request. No Feige credentials are used.

## CORS limitation

`curl.exe` does not enforce CORS. The explicit preflight lets you inspect the server's `OPTIONS` response, but only a browser enforces the CORS policy. Successful authentication confirms connectivity and the API's HTTP behavior; the log separately records whether the preflight response has the expected headers for the requested origin.

## Vending System API manual (version 1.21)

This reference was transcribed from `Vending_System_API_Documentation_EN (2).docx`.
Replace `https://xxx.xxx.xxx` with the API host and append `/prod-api` when required by
your deployment. Unless otherwise stated, protected endpoints require the access token
obtained from `POST /auth/apply` in the `Authorization` request header.

### Authentication

Create an AppKey and AppSecret in the administration console under **Personal
Information > Developer Configuration**.

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

### Device information

#### List devices

`POST /api/v1/device/list`

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `pageNo` | Query | Integer | Yes | Page number |
| `pageSize` | Query | Integer | Yes | Page size |
| `deviceName` | JSON body | String | No | Device-name search keyword |
| `status` | JSON body | Integer | No | `1` = online; `2` = offline |

The response contains a paginated `result.records` list. Device fields documented by
the API include `id`, `deviceUuid`, `deviceName`, `language`, `sim`, `strength4g`,
`strengthWifi`, `status`, `deviceVersion`, and `timeZoneId`.

#### List device inventory

`POST /api/v1/deviceInventory/list`

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `deviceId` | Query | Long | Yes | Device ID |

The response contains `result.cargoPassageList`. Inventory fields include `id`
(inventory ID), `categoryLevel` (`1` = parent, `2` = subcategory),
`productCategoryId`, `categoryName`, `productId`, `productName`, `boardNo`,
`cargoPassageId`, `cargoPassageNo`, `totalInventoryCount`,
`currentInventoryCount`, and `status` (`1` = delisted, `2` = listed).

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

### Product management

#### List products

`POST /api/v1/productCategory/listPrivate`

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `pageNo` | Query | Integer | Yes | Page number |
| `pageSize` | Query | Integer | Yes | Page size |
| `name` | JSON body | String | No | Product-name search |

Product fields include `id`, `name`, `imageUrl`, `costPrice`, `price`,
`productCategoryId`, and `productCategoryName`.

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

`GET /api/v1/order/list`

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| `pageNo` | Query | Integer | Yes | Page number |
| `pageSize` | Query | Integer | Yes | Page size |
| `device` | JSON body | String | No | Device UUID or device name |
| `orderNo` | JSON body | String | No | Order number |
| `createTimeStart` | JSON body | Date | No | Payment start time; defaults to today |
| `createTimeEnd` | JSON body | Date | No | Payment end time; defaults to today |

Order records include `orderNo`, `orderItemList`, `payTime`, `payStatus`,
`refundTime`, and `returnMoney`. The manual documents `payStatus` as `2` = successful
and `3` = refunded. Each `orderItemList` entry may include `takeStatus`, the dispensing
result.

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

The API sends an HTTP `POST` with `Content-Type: application/json` to the callback URL
configured by the caller. The payload includes:

| Field | Description |
|---|---|
| `type` | `0` = test; `1` = order notification |
| `timestamp` | Timestamp used for signing |
| `nonce` | Random string |
| `data` | Original business data, encoded as a JSON string |
| `dataHash` | Lowercase hexadecimal MD5 digest of `data` |
| `sign` | Base64-encoded signature |

Verify the signature with the public key. The manual specifies signing the fields
excluding `sign`, concatenated in ascending key-name order as `k=v&...`, using
MD5withRSA, then Base64-encoding the signature. Its example signing string is:

```text
dataHash=e99a18c428cb38d5f260853678922e03&nonce=b1fc0c3eabc34f1f9a2d3f4c5e6a7b8c&timestamp=1686580000000&type=1
```

If verification fails, log the failure and optionally return a non-200 HTTP status or
a signed error response. The manual says the error response signature must use the
same private key.
