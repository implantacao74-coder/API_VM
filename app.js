const defaultJson = JSON.stringify(
  {
    info: {
      name: "Feige Vending API – Charmô (testes)",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      description:
        "Rotas da documentação Feige. Itens [rota inferida] tiveram o prefixo /api/v1 deduzido. Rode 01 Auth primeiro (salva o token). Itens W* alteram dados; M* acionam motor."
    },
    item: [
      {
        name: "01 Auth – obter token",
        request: {
          method: "POST",
          header: [{ key: "Content-Type", value: "application/json" }],
          url: {
            raw: "{{baseUrl}}/auth/apply",
            host: ["{{baseUrl}}"],
            path: ["auth", "apply"],
            query: []
          },
          auth: { type: "noauth" },
          body: {
            mode: "raw",
            raw: '{\n  "appKey": "{{appKey}}",\n  "appSecret": "{{appSecret}}"\n}',
            options: { raw: { language: "json" } }
          }
        },
        event: [
          {
            listen: "test",
            script: {
              type: "text/javascript",
              exec: [
                "const j=pm.response.json();const d=j.data||j;if(d.access_token){pm.collectionVariables.set('token',d.access_token);}" 
              ]
            }
          }
        ]
      },
      {
        name: "02 Dispositivos – listar",
        request: {
          method: "POST",
          header: [{ key: "Content-Type", value: "application/json" }],
          url: {
            raw: "{{baseUrl}}/api/v1/device/list?pageNo=1&pageSize=20",
            host: ["{{baseUrl}}"],
            path: ["api", "v1", "device", "list"],
            query: [
              { key: "pageNo", value: "1" },
              { key: "pageSize", value: "20" }
            ]
          },
          auth: {
            type: "bearer",
            bearer: [{ key: "token", value: "{{token}}", type: "string" }]
          },
          body: { mode: "raw", raw: "{}", options: { raw: { language: "json" } } }
        }
      }
    ],
    variable: [
      { key: "baseUrl", value: "https://veda.figeth.com/prod-api" },
      { key: "appKey", value: "" },
      { key: "appSecret", value: "" },
      { key: "token", value: "" },
      { key: "deviceId", value: "" },
      { key: "inventoryId", value: "" },
      { key: "cargoPassageId", value: "" },
      { key: "taskId", value: "" },
      { key: "couponCode", value: "" }
    ]
  },
  null,
  2
);

const jsonInput = document.getElementById("jsonInput");
const fileInput = document.getElementById("fileInput");
const parseBtn = document.getElementById("parseBtn");
const loadSampleBtn = document.getElementById("loadSampleBtn");
const configSummary = document.getElementById("configSummary");
const variablesInput = document.getElementById("variablesInput");
const baseUrlInput = document.getElementById("baseUrlInput");
const endpointSelect = document.getElementById("endpointSelect");
const methodInput = document.getElementById("methodInput");
const pathInput = document.getElementById("pathInput");
const headersInput = document.getElementById("headersInput");
const bodyInput = document.getElementById("bodyInput");
const sendRequestBtn = document.getElementById("sendRequestBtn");
const responseOutput = document.getElementById("responseOutput");
const statusBadge = document.getElementById("statusBadge");
const loginScreen = document.getElementById("loginScreen");
const loginForm = document.getElementById("loginForm");
const authBaseUrlInput = document.getElementById("authBaseUrlInput");
const appKeyInput = document.getElementById("appKeyInput");
const appSecretInput = document.getElementById("appSecretInput");
const loginError = document.getElementById("loginError");
const loginBtn = document.getElementById("loginBtn");
const appShell = document.getElementById("appShell");
const logoutBtn = document.getElementById("logoutBtn");

let collectionData = null;
let endpoints = [];
let variables = {};
let sessionToken = sessionStorage.getItem("feigeAuthToken") || "";

function setStatus(type, text) {
  statusBadge.className = `status-badge ${type}`;
  statusBadge.textContent = text;
}

function parseJsonText(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`JSON inválido: ${error.message}`);
  }
}

function resolveTemplate(value, values) {
  if (typeof value !== "string") return value;

  return value.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(values, key) && values[key] !== "") {
      return String(values[key]);
    }
    return match;
  });
}

function flattenItems(items, parentName = "") {
  const result = [];

  items.forEach((item) => {
    if (Array.isArray(item.item)) {
      result.push(...flattenItems(item.item, item.name || parentName));
      return;
    }

    if (!item.request) return;

    const request = item.request;
    const method = (request.method || "GET").toUpperCase();
    const url = request.url || {};
    const query = Array.isArray(url.query)
      ? url.query.map((param) => ({
          key: param.key,
          value: param.value || ""
        }))
      : [];

    const headers = {};
    if (Array.isArray(request.header)) {
      request.header.forEach((header) => {
        headers[header.key] = header.value;
      });
    }

    let rawBody = null;
    if (request.body && request.body.mode === "raw" && typeof request.body.raw === "string") {
      rawBody = request.body.raw;
    }

    const endpoint = {
      name: item.name || parentName || `${method} request`,
      method,
      rawUrl: typeof url.raw === "string" ? url.raw : "",
      path: Array.isArray(url.path) ? `/${url.path.join("/")}` : "/",
      query,
      headers,
      body: rawBody,
      authType: request.auth && request.auth.type ? request.auth.type : "noauth",
      bearerToken: request.auth && request.auth.bearer && request.auth.bearer[0]
        ? request.auth.bearer[0].value
        : ""
    };

    result.push(endpoint);
  });

  return result;
}

function getVariablesFromCollection(parsedCollection) {
  const nextVars = {};

  if (Array.isArray(parsedCollection.variable)) {
    parsedCollection.variable.forEach((variable) => {
      nextVars[variable.key] = variable.value ?? "";
    });
  }

  return nextVars;
}

function showConfigSummary(parsedCollection) {
  if (!parsedCollection || typeof parsedCollection !== "object") {
    configSummary.textContent = "JSON não reconhecido.";
    return;
  }

  const collectionName = parsedCollection.info && parsedCollection.info.name ? parsedCollection.info.name : "Collection";
  const total = Array.isArray(parsedCollection.item) ? flattenItems(parsedCollection.item).length : 0;
  configSummary.textContent = `${collectionName} • ${total} endpoints carregados.`;
}

function hydrateEndpoint(endpoint) {
  if (!endpoint) return;

  const resolvedBody = endpoint.body ? resolveTemplate(endpoint.body, variables) : "";
  const resolvedPath = endpoint.rawUrl ? resolveTemplate(endpoint.rawUrl, variables) : endpoint.path;
  const resolvedHeaders = {};

  Object.entries(endpoint.headers || {}).forEach(([key, value]) => {
    resolvedHeaders[key] = resolveTemplate(value, variables);
  });

  methodInput.value = endpoint.method || "GET";
  pathInput.value = endpoint.path || resolvedPath || "/";
  headersInput.value = JSON.stringify(resolvedHeaders, null, 2);

  if (resolvedBody && resolvedBody.trim().startsWith("{")) {
    try {
      bodyInput.value = JSON.stringify(JSON.parse(resolvedBody), null, 2);
    } catch (error) {
      bodyInput.value = resolvedBody;
    }
  } else {
    bodyInput.value = resolvedBody || "";
  }
}

function renderEndpointList() {
  endpointSelect.innerHTML = "";

  endpoints.forEach((endpoint, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${endpoint.method} ${endpoint.path || "/"}`;
    endpointSelect.appendChild(option);
  });

  if (endpoints.length > 0) {
    endpointSelect.value = "0";
    hydrateEndpoint(endpoints[0]);
  }
}

function loadFromJsonText() {
  try {
    const parsedCollection = parseJsonText(jsonInput.value);
    if (!parsedCollection || typeof parsedCollection !== "object") {
      throw new Error("O JSON precisa ser um objeto.");
    }

    if (!Array.isArray(parsedCollection.item)) {
      throw new Error("A collection do Postman precisa conter um array 'item'.");
    }

    collectionData = parsedCollection;
    variables = getVariablesFromCollection(parsedCollection);
    if (sessionToken) {
      variables.token = sessionToken;
    }
    variablesInput.value = JSON.stringify(variables, null, 2);
    endpoints = flattenItems(parsedCollection.item);
    baseUrlInput.value = variables.baseUrl || "";

    showConfigSummary(parsedCollection);
    renderEndpointList();
    setStatus("idle", "Carregado");
    responseOutput.textContent = "Collection carregada com sucesso. Pronto para testar as rotas da Feige.";
  } catch (error) {
    setStatus("error", "Erro");
    responseOutput.textContent = error.message;
  }
}

function readJsonField(field) {
  const raw = field.trim();
  if (!raw) return {};
  return parseJsonText(raw);
}

function getEffectiveVariables() {
  try {
    variables = parseJsonText(variablesInput.value || "{}");
  } catch (error) {
    throw new Error(`Variáveis inválidas: ${error.message}`);
  }

  return variables;
}

function buildRequestUrl(baseUrl, path, queryParams) {
  const cleanBase = baseUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const query = (queryParams || [])
    .map((param) => {
      const key = resolveTemplate(param.key, variables);
      const value = resolveTemplate(param.value, variables);
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join("&");

  return query ? `${cleanBase}${cleanPath}?${query}` : `${cleanBase}${cleanPath}`;
}

function showAuthenticatedApp() {
  loginScreen.hidden = true;
  appShell.hidden = false;
  authBaseUrlInput.value = baseUrlInput.value || authBaseUrlInput.value;
}

function closeSession() {
  sessionToken = "";
  sessionStorage.removeItem("feigeAuthToken");
  variables = { ...variables, token: "" };
  variablesInput.value = JSON.stringify(variables, null, 2);
  appShell.hidden = true;
  loginScreen.hidden = false;
  appKeyInput.value = "";
  appSecretInput.value = "";
  loginError.hidden = true;
  loginError.textContent = "";
}

async function authenticate(event) {
  event.preventDefault();
  loginError.hidden = true;
  loginBtn.disabled = true;
  loginBtn.textContent = "Autenticando...";

  try {
    const baseUrl = authBaseUrlInput.value.trim().replace(/\/$/, "");
    const response = await fetch(`${baseUrl}/auth/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appKey: appKeyInput.value.trim(),
        appSecret: appSecretInput.value
      })
    });
    const responseText = await response.text();
    let payload;

    try {
      payload = responseText ? JSON.parse(responseText) : {};
    } catch (error) {
      throw new Error(`Resposta de autenticação inválida (HTTP ${response.status}).`);
    }

    if (!response.ok) {
      throw new Error(payload.message || payload.msg || `Autenticação recusada (HTTP ${response.status}).`);
    }

    const token = payload.data?.access_token || payload.access_token;
    if (typeof token !== "string" || !token.trim()) {
      throw new Error("A resposta não contém um access_token válido.");
    }

    sessionToken = token.trim();
    sessionStorage.setItem("feigeAuthToken", sessionToken);
    baseUrlInput.value = baseUrl;
    variables = { ...variables, baseUrl, token: sessionToken };
    variablesInput.value = JSON.stringify(variables, null, 2);
    appSecretInput.value = "";
    showAuthenticatedApp();
  } catch (error) {
    loginError.textContent = error.message;
    loginError.hidden = false;
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Autenticar e abrir sessão";
  }
}

async function sendRequest() {
  try {
    const currentVariables = getEffectiveVariables();
    const method = methodInput.value;
    const rawPath = pathInput.value.trim();
    const baseUrl = (baseUrlInput.value || currentVariables.baseUrl || "").trim();
    const headers = readJsonField(headersInput.value);
    const bodyText = bodyInput.value.trim();

    if (!baseUrl) {
      throw new Error("Defina a baseUrl antes de enviar a requisição.");
    }

    const url = buildRequestUrl(
      resolveTemplate(baseUrl, currentVariables),
      resolveTemplate(rawPath, currentVariables),
      []
    );

    let body = undefined;
    if (method !== "GET" && method !== "DELETE" && bodyText) {
      body = JSON.parse(resolveTemplate(bodyText, currentVariables));
    }

    const requestHeaders = { ...headers };
    const tokenValue = resolveTemplate(currentVariables.token || "", currentVariables);
    if (tokenValue) {
      requestHeaders.Authorization = `Bearer ${tokenValue}`;
    }

    const options = {
      method,
      headers: requestHeaders
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    setStatus("idle", "Enviando");
    responseOutput.textContent = "Enviando requisição...";

    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type") || "";
    let payload;

    if (contentType.includes("application/json")) {
      payload = await response.json();
    } else {
      payload = await response.text();
    }

    const result = {
      status: response.status,
      ok: response.ok,
      url,
      data: payload
    };

    setStatus(response.ok ? "success" : "error", `HTTP ${response.status}`);
    responseOutput.textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    setStatus("error", "Falha");
    responseOutput.textContent = `Erro na requisição: ${error.message}`;
  }
}

endpointSelect.addEventListener("change", (event) => {
  const index = Number(event.target.value);
  if (endpoints[index]) hydrateEndpoint(endpoints[index]);
});

loginForm.addEventListener("submit", authenticate);
logoutBtn.addEventListener("click", closeSession);
parseBtn.addEventListener("click", loadFromJsonText);
loadSampleBtn.addEventListener("click", () => {
  jsonInput.value = defaultJson;
  loadFromJsonText();
});

variablesInput.addEventListener("change", () => {
  try {
    const parsed = parseJsonText(variablesInput.value || "{}");
    variables = parsed;
    if (collectionData) {
      showConfigSummary(collectionData);
    }

    if (baseUrlInput.value === "") {
      baseUrlInput.value = variables.baseUrl || "";
    }

    if (endpoints.length > 0) {
      hydrateEndpoint(endpoints[Number(endpointSelect.value)] || endpoints[0]);
    }
  } catch (error) {
    responseOutput.textContent = `Variáveis inválidas: ${error.message}`;
  }
});

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const content = await file.text();
    jsonInput.value = content;
    loadFromJsonText();
  } catch (error) {
    responseOutput.textContent = `Erro ao ler arquivo: ${error.message}`;
  }
});

sendRequestBtn.addEventListener("click", sendRequest);
jsonInput.value = defaultJson;
loadFromJsonText();
authBaseUrlInput.value = variables.baseUrl || authBaseUrlInput.value;

if (sessionToken) {
  showAuthenticatedApp();
}
