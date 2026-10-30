const API_TOOLS = [
  {
    group: "Dispositivos",
    id: "devices",
    label: "Listar dispositivos",
    method: "POST",
    path: "/api/luobo-machine-api/api/v1/device/list",
    query: { pageNo: 1, pageSize: 50 },
    body: {},
    description: "Lista dispositivos. Filtros opcionais no corpo: deviceName e status (1 online, 2 offline)."
  },
  {
    group: "Estoque",
    id: "inventory",
    label: "Listar estoque do dispositivo",
    method: "POST",
    path: "/api/luobo-machine-api/api/v1/deviceInventory/list",
    query: { deviceId: "" },
    body: {},
    description: "Consulta canais e quantidades de estoque. Query obrigatória: deviceId."
  },
  {
    group: "Estoque",
    id: "replenish",
    label: "Atualizar estoque",
    method: "POST",
    path: "/api/luobo-machine-api/api/v1/deviceInventory/replenish",
    query: {},
    body: { infoList: [{ inventoryId: "", count: 0 }] },
    description: "Atualiza contagens após inventário físico. Cada elemento de infoList exige inventoryId e count.",
    risky: "Esta operação altera o estoque registrado. Confirme os IDs e quantidades antes de executar."
  },
  {
    group: "Estoque",
    id: "channel-test",
    label: "Testar canais",
    method: "POST",
    path: "/api/luobo-machine-api/api/v1/deviceInventory/testChannel",
    query: {},
    body: { deviceId: "", ids: [""] },
    description: "Aciona um teste nos canais selecionados. Retorna um ID para consultar o resultado.",
    risky: "Esta operação aciona os canais do equipamento."
  },
  {
    group: "Estoque",
    id: "channel-result",
    label: "Consultar teste de canais",
    method: "GET",
    path: "/api/luobo-machine-api/api/v1/deviceInventory/getTestResult",
    query: { id: "" },
    body: null,
    description: "Consulta o resultado de teste pelo ID da tarefa."
  },
  {
    group: "Produtos",
    id: "products",
    label: "Listar produtos",
    method: "POST",
    path: "/api/luobo-machine-api/api/v1/productCategory/listPrivate",
    query: { pageNo: 1, pageSize: 50 },
    body: { name: "" },
    description: "Lista produtos com paginação. O filtro name é opcional."
  },
  {
    group: "Operação",
    id: "vend",
    label: "Dispensar produto",
    method: "POST",
    path: "/api/luobo-machine-api/api/v1/freeTier/vend",
    query: {},
    body: { deviceId: "", cargoPassageIds: [""] },
    description: "Solicita dispensação pelos canais indicados. Retorna o ID da tarefa.",
    risky: "Esta operação pode dispensar produtos fisicamente. Confirme o equipamento e os canais."
  },
  {
    group: "Operação",
    id: "vend-result",
    label: "Consultar resultado da dispensação",
    method: "GET",
    path: "/api/luobo-machine-api/api/v1/freeTier/getVendorResult",
    query: { vendorId: "" },
    body: null,
    description: "Consulta a tarefa de dispensação pelo vendorId."
  },
  {
    group: "Operação",
    id: "open-door",
    label: "Abrir porta",
    method: "POST",
    path: "/api/luobo-machine-api/api/v1/control/openDoor",
    query: {},
    body: { deviceId: "", delayClose: 3000 },
    description: "Abre a porta do smart cabinet. delayClose é informado em milissegundos.",
    risky: "Esta operação abre fisicamente a porta do equipamento."
  },
  {
    group: "Operação",
    id: "close-door",
    label: "Fechar porta",
    method: "POST",
    path: "/api/luobo-machine-api/api/v1/control/closeDoor",
    query: {},
    body: { deviceId: "" },
    description: "Solicita o fechamento da porta do smart cabinet.",
    risky: "Esta operação controla fisicamente a porta do equipamento."
  },
  {
    group: "Operação",
    id: "door-status",
    label: "Consultar estado da porta",
    method: "POST",
    path: "/api/luobo-machine-api/api/v1/control/queryDoorStatus",
    query: {},
    body: { deviceId: "" },
    description: "Consulta mainOpen e subOpen: 0 = fechada; 1 = aberta."
  },
  {
    group: "Pedidos",
    id: "orders",
    label: "Listar pedidos",
    method: "GET",
    path: "/api/luobo-machine-api/api/v1/order/list",
    query: { pageNo: 1, pageSize: 50 },
    body: null,
    description: "Lista pedidos. Filtros opcionais na query: device, orderNo, createTimeStart e createTimeEnd (YYYY-MM-DD)."
  },
  {
    group: "Cupons",
    id: "coupon-generate",
    label: "Gerar cupons",
    method: "POST",
    path: "/api/luobo-machine-api/api/v1/coupon/generate",
    query: {},
    body: {
      name: "",
      type: 1,
      rule: "{}",
      startDate: "",
      endDate: "",
      startTime: "00:00:00",
      endTime: "23:59:59",
      quantity: 1
    },
    description: "Gera de 1 a 100 códigos. Tipos: 1 desconto por valor mínimo, 2 brinde, 3 percentual, 4 valor em dinheiro, 5 resgate.",
    risky: "Esta operação cria cupons. Confira regras, datas, quantidade e escopo antes de executar. Se deviceIds ou productIds forem omitidos, a API pode aplicar o cupom a todos os dispositivos ou produtos."
  },
  {
    group: "Cupons",
    id: "coupons",
    label: "Listar cupons",
    method: "POST",
    path: "/api/luobo-machine-api/api/v1/coupon/list",
    query: { pageNo: 1, pageSize: 50 },
    body: {},
    description: "Lista cupons. Filtro opcional no corpo: status (1 não utilizado, 2 utilizado)."
  },
  {
    group: "Cupons",
    id: "coupon-code",
    label: "Consultar cupom por código",
    method: "GET",
    path: "/api/luobo-machine-api/api/v1/coupon/getByCode",
    query: { code: "" },
    body: null,
    description: "Consulta um cupom pelo código."
  }
];

const monitorContent = document.getElementById("monitorContent");
const loginNotice = document.getElementById("loginNotice");
const toolSelect = document.getElementById("toolSelect");
const toolDescription = document.getElementById("toolDescription");
const toolWarning = document.getElementById("toolWarning");
const queryInput = document.getElementById("queryInput");
const bodyInput = document.getElementById("bodyInput");
const runToolBtn = document.getElementById("runToolBtn");
const toolStatus = document.getElementById("toolStatus");
const toolOutput = document.getElementById("toolOutput");
const deviceRows = document.getElementById("deviceRows");
const deviceStatus = document.getElementById("deviceStatus");
const refreshDevicesBtn = document.getElementById("refreshDevicesBtn");
const refreshInterval = document.getElementById("refreshInterval");
const previousPageBtn = document.getElementById("previousPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const devicePageLabel = document.getElementById("devicePageLabel");
const token = sessionStorage.getItem("feigeAuthToken") || "";

let refreshTimer;
let isRefreshing = false;
let devicePage = 1;
const devicePageSize = 50;

function getLocalBackendEndpoint(route) {
  const { hostname, port, protocol } = window.location;
  const isLoopbackHost = hostname === "localhost" || hostname === "127.0.0.1";
  if (protocol !== "http:" || !isLoopbackHost) {
    throw new Error("Abra esta página em http://127.0.0.1:8000 ou no Live Server em http://127.0.0.1:5500.");
  }
  if (port === "8000") return route;
  if (port === "5500") return `http://127.0.0.1:8000${route}`;
  throw new Error("Use a porta 8000 do backend ou a porta 5500 do Live Server.");
}

function setStatus(element, message, type = "") {
  element.textContent = message;
  element.className = `monitor-status ${type}`.trim();
}

function getTool(id) {
  return API_TOOLS.find((tool) => tool.id === id);
}

function setupToolOptions() {
  const groups = new Map();
  for (const tool of API_TOOLS) {
    if (!groups.has(tool.group)) {
      const optionGroup = document.createElement("optgroup");
      optionGroup.label = tool.group;
      groups.set(tool.group, optionGroup);
      toolSelect.appendChild(optionGroup);
    }

    const option = document.createElement("option");
    option.value = tool.id;
    option.textContent = `${tool.method} ${tool.label}`;
    groups.get(tool.group).appendChild(option);
  }
  toolSelect.value = "devices";
  updateToolForm();
}

function updateToolForm() {
  const tool = getTool(toolSelect.value);
  if (!tool) return;

  toolDescription.textContent = `${tool.method} ${tool.path} — ${tool.description}`;
  toolWarning.hidden = !tool.risky;
  toolWarning.textContent = tool.risky || "";
  queryInput.value = JSON.stringify(tool.query, null, 2);
  bodyInput.value = tool.body === null ? "" : JSON.stringify(tool.body, null, 2);
  queryInput.disabled = Object.keys(tool.query).length === 0;
  bodyInput.disabled = tool.body === null;
}

function queryString(query) {
  const parameters = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      parameters.set(key, String(value));
    }
  }
  return parameters.toString();
}

async function callApi(tool, query, body) {
  if (!token) {
    throw new Error("Sessão não encontrada. Entre pelo API Tester e autentique-se novamente.");
  }

  const queryText = queryString(query);
  const apiPath = `${tool.path}${queryText ? `?${queryText}` : ""}`;
  const response = await fetch(getLocalBackendEndpoint("/api/proxy"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: apiPath,
      method: tool.method,
      ...(tool.method === "GET" || body === undefined ? {} : { body }),
      token
    })
  });

  const responseText = await response.text();
  let payload;
  try {
    payload = responseText ? JSON.parse(responseText) : {};
  } catch {
    payload = responseText;
  }
  return { response, payload, apiPath };
}

function extractRecords(payload) {
  let current = payload;
  for (let depth = 0; depth < 5; depth += 1) {
    if (!current || typeof current !== "object") break;
    if (Array.isArray(current)) return current;
    if (Array.isArray(current.records)) return current.records;
    if (Array.isArray(current.list)) return current.list;
    if (Array.isArray(current.rows)) return current.rows;
    if (current.result !== undefined) {
      current = current.result;
    } else if (current.data !== undefined) {
      current = current.data;
    } else {
      break;
    }
  }
  return [];
}

function renderDevices(records) {
  const onlineCount = records.filter((device) => Number(device.status) === 1).length;
  const offlineCount = records.filter((device) => Number(device.status) === 2).length;
  document.getElementById("deviceCount").textContent = String(records.length);
  document.getElementById("onlineCount").textContent = String(onlineCount);
  document.getElementById("offlineCount").textContent = String(offlineCount);
  document.getElementById("lastUpdated").textContent = new Date().toLocaleTimeString();
  deviceRows.replaceChildren();

  if (records.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.className = "empty-state";
    cell.textContent = "A API não retornou dispositivos para esta página.";
    row.appendChild(cell);
    deviceRows.appendChild(row);
    return;
  }

  for (const device of records) {
    const row = document.createElement("tr");
    const status = Number(device.status);
    const values = [
      device.deviceName || "—",
      device.id ?? device.deviceUuid ?? "—"
    ];
    for (const value of values) {
      const cell = document.createElement("td");
      cell.textContent = String(value);
      row.appendChild(cell);
    }

    const stateCell = document.createElement("td");
    const state = document.createElement("span");
    state.className = `device-state ${status === 1 ? "online" : status === 2 ? "offline" : ""}`.trim();
    state.textContent = status === 1 ? "Online" : status === 2 ? "Offline" : String(device.status ?? "Desconhecido");
    stateCell.appendChild(state);
    row.appendChild(stateCell);

    const signalCell = document.createElement("td");
    signalCell.textContent = `4G: ${device.strength4g ?? "—"} / Wi-Fi: ${device.strengthWifi ?? "—"}`;
    row.appendChild(signalCell);

    const versionCell = document.createElement("td");
    versionCell.textContent = String(device.deviceVersion ?? "—");
    row.appendChild(versionCell);

    const actionsCell = document.createElement("td");
    actionsCell.append(
      makeDeviceAction("Estoque", "inventory", "deviceId", device.id),
      makeDeviceAction("Porta", "door-status", "deviceId", device.id)
    );
    row.appendChild(actionsCell);
    deviceRows.appendChild(row);
  }
}

function makeDeviceAction(label, toolId, queryKey, value) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary device-action";
  button.textContent = label;
  button.disabled = value === undefined || value === null;
  button.addEventListener("click", () => {
    toolSelect.value = toolId;
    updateToolForm();
    const query = JSON.parse(queryInput.value || "{}");
    const body = JSON.parse(bodyInput.value || "{}");
    if (getTool(toolId).query[queryKey] !== undefined) {
      query[queryKey] = String(value);
      queryInput.value = JSON.stringify(query, null, 2);
    } else {
      body[queryKey] = String(value);
      bodyInput.value = JSON.stringify(body, null, 2);
    }
    document.getElementById("toolSelect").scrollIntoView({ behavior: "smooth", block: "center" });
  });
  return button;
}

async function refreshDevices() {
  if (isRefreshing) return;
  isRefreshing = true;
  refreshDevicesBtn.disabled = true;
  setStatus(deviceStatus, "Consultando dispositivos...");
  try {
    const tool = getTool("devices");
    const query = { ...tool.query, pageNo: devicePage, pageSize: devicePageSize };
    const { response, payload } = await callApi(tool, query, tool.body);
    const apiCode = payload && typeof payload === "object" ? payload.code : undefined;
    if (!response.ok || (typeof apiCode === "number" && apiCode !== 200)) {
      throw new Error(payload.msg || payload.message || `Falha ao consultar dispositivos (HTTP ${response.status}).`);
    }
    const records = extractRecords(payload);
    renderDevices(records);
    previousPageBtn.disabled = devicePage <= 1;
    nextPageBtn.disabled = records.length < devicePageSize;
    devicePageLabel.textContent = `Página ${devicePage}`;
    setStatus(deviceStatus, `Atualizado às ${new Date().toLocaleTimeString()} (até ${devicePageSize} registros por página).`, "success");
  } catch (error) {
    setStatus(deviceStatus, error.message, "error");
  } finally {
    isRefreshing = false;
    refreshDevicesBtn.disabled = false;
  }
}

function configureRefresh() {
  if (refreshTimer) {
    window.clearInterval(refreshTimer);
    refreshTimer = undefined;
  }
  const seconds = Number(refreshInterval.value);
  if (seconds > 0) {
    refreshTimer = window.setInterval(refreshDevices, seconds * 1000);
  }
}

async function runTool() {
  const tool = getTool(toolSelect.value);
  if (!tool) return;

  let query;
  let body;
  try {
    query = queryInput.value.trim() ? JSON.parse(queryInput.value) : {};
    if (!query || Array.isArray(query) || typeof query !== "object") {
      throw new Error("Os parâmetros de URL precisam ser um objeto JSON.");
    }
    body = bodyInput.disabled || !bodyInput.value.trim() ? undefined : JSON.parse(bodyInput.value);
  } catch (error) {
    setStatus(toolStatus, `JSON inválido: ${error.message}`, "error");
    return;
  }

  if (tool.risky && !window.confirm(`${tool.risky}\n\nDeseja continuar?`)) {
    return;
  }

  runToolBtn.disabled = true;
  setStatus(toolStatus, "Executando...");
  toolOutput.textContent = "Enviando requisição...";
  try {
    const { response, payload, apiPath } = await callApi(tool, query, body);
    const apiCode = payload && typeof payload === "object" ? payload.code : undefined;
    const apiSuccess = typeof apiCode !== "number" || apiCode === 200;
    const result = {
      operation: tool.label,
      method: tool.method,
      path: apiPath,
      httpStatus: response.status,
      apiCode,
      ok: response.ok && apiSuccess,
      data: payload
    };
    toolOutput.textContent = JSON.stringify(result, null, 2);
    if (!response.ok || !apiSuccess) {
      setStatus(toolStatus, payload.msg || payload.message || `Falha (HTTP ${response.status}).`, "error");
    } else {
      setStatus(toolStatus, "Operação concluída.", "success");
      if (tool.id === "devices") renderDevices(extractRecords(payload));
    }
  } catch (error) {
    toolOutput.textContent = `Erro: ${error.message}`;
    setStatus(toolStatus, error.message, "error");
  } finally {
    runToolBtn.disabled = false;
  }
}

toolSelect.addEventListener("change", updateToolForm);
runToolBtn.addEventListener("click", runTool);
refreshDevicesBtn.addEventListener("click", refreshDevices);
refreshInterval.addEventListener("change", configureRefresh);
previousPageBtn.addEventListener("click", () => {
  if (devicePage > 1) {
    devicePage -= 1;
    refreshDevices();
  }
});
nextPageBtn.addEventListener("click", () => {
  if (!nextPageBtn.disabled) {
    devicePage += 1;
    refreshDevices();
  }
});

setupToolOptions();
if (!token) {
  monitorContent.hidden = true;
  loginNotice.hidden = false;
} else {
  refreshDevices();
}
