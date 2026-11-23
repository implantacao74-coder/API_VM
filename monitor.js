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
    body: { infoList: [{ inventoryId: "ID_DO_ESTOQUE", count: 0 }] },
    description: "Corpo: infoList aceita um ou mais itens; inventoryId é o campo id retornado ao listar o estoque e count é a quantidade física atual (zero é válido).",
    risky: "Esta operação altera o estoque registrado. Substitua ID_DO_ESTOQUE pelo id do canal e count pela contagem física conferida. Count zero zera o estoque desse item."
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
    method: "POST",
    path: "/api/luobo-machine-api/api/v1/order/list",
    query: { pageNo: 1, pageSize: 50 },
    body: {},
    description: "Lista pedidos. A API exige um corpo JSON para os filtros opcionais device, orderNo, createTimeStart e createTimeEnd (YYYY-MM-DD); paginação enviada na query."
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

const RESULT_FIELD_LABELS = {
  cargoPassageId: "ID do canal",
  cargoPassageList: "Canais de estoque",
  cargoPassageNo: "Número do canal",
  capacity: "Capacidade",
  categoryName: "Categoria",
  code: "Código",
  count: "Quantidade",
  createTime: "Criado em",
  currentInventoryCount: "Unidades disponíveis",
  data: "Dados",
  device: "Dispositivo",
  deviceId: "ID do dispositivo",
  deviceName: "Nome do dispositivo",
  deviceUuid: "UUID do dispositivo",
  deviceVersion: "Versão do dispositivo",
  endDate: "Data final",
  endTime: "Horário final",
  id: "ID",
  infoList: "Itens atualizados",
  inventoryId: "ID do estoque",
  list: "Itens",
  mainOpen: "Porta principal",
  message: "Mensagem",
  msg: "Mensagem",
  name: "Nome",
  orderNo: "Número do pedido",
  orderAmount: "Valor da venda",
  totalAmount: "Valor total",
  totalMoney: "Valor total",
  totalPrice: "Valor total",
  actualAmount: "Valor pago",
  pageNo: "Página",
  pageSize: "Itens por página",
  payStatus: "Estado do pagamento",
  payTime: "Pago em",
  payAmount: "Valor pago",
  actualAmount: "Valor pago",
  amount: "Valor da venda",
  orderAmount: "Valor da venda",
  price: "Preço unitário",
  returnMoney: "Valor reembolsado",
  salePrice: "Preço de venda",
  totalAmount: "Valor total",
  totalMoney: "Valor total",
  totalPrice: "Valor total",
  productName: "Produto",
  quantity: "Quantidade",
  records: "Registros",
  result: "Resultado",
  rows: "Itens",
  rule: "Regra",
  startDate: "Data inicial",
  startTime: "Horário inicial",
  status: "Estado",
  strength4g: "Sinal 4G",
  strengthWifi: "Sinal Wi-Fi",
  subOpen: "Porta secundária",
  total: "Total",
  totalCount: "Total de registros",
  totalInventoryCount: "Estoque total registrado",
  type: "Tipo",
  vendorId: "ID da dispensação"
};

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
const replenishmentDeviceSelect = document.getElementById("replenishmentDeviceSelect");
const refreshReplenishmentBtn = document.getElementById("refreshReplenishmentBtn");
const printReplenishmentBtn = document.getElementById("printReplenishmentBtn");
const replenishmentStatus = document.getElementById("replenishmentStatus");
const replenishmentMachineDetails = document.getElementById("replenishmentMachineDetails");
const replenishmentReport = document.getElementById("replenishmentReport");
const vendDeviceSelect = document.getElementById("vendDeviceSelect");
const loadVendChannelsBtn = document.getElementById("loadVendChannelsBtn");
const selectAllVendChannelsBtn = document.getElementById("selectAllVendChannelsBtn");
const clearVendChannelsBtn = document.getElementById("clearVendChannelsBtn");
const vendChannelStatus = document.getElementById("vendChannelStatus");
const vendChannelList = document.getElementById("vendChannelList");
const runVendBtn = document.getElementById("runVendBtn");
const vendStatus = document.getElementById("vendStatus");
const vendOutput = document.getElementById("vendOutput");
const refreshSalesBtn = document.getElementById("refreshSalesBtn");
const salesStartDate = document.getElementById("salesStartDate");
const salesEndDate = document.getElementById("salesEndDate");
const applySalesPeriodBtn = document.getElementById("applySalesPeriodBtn");
const salesStatus = document.getElementById("salesStatus");
const salesTotal = document.getElementById("salesTotal");
const salesPaid = document.getElementById("salesPaid");
const salesRefunded = document.getElementById("salesRefunded");
const salesDevices = document.getElementById("salesDevices");
const latestSalesList = document.getElementById("latestSalesList");
const periodSalesList = document.getElementById("periodSalesList");
const refreshAbcBtn = document.getElementById("refreshAbcBtn");
const abcStatus = document.getElementById("abcStatus");
const abcOrderCount = document.getElementById("abcOrderCount");
const abcRevenueTotal = document.getElementById("abcRevenueTotal");
const abcProductCount = document.getElementById("abcProductCount");
const abcReport = document.getElementById("abcReport");
const abcChart = document.getElementById("abcChart");
const deviceRows = document.getElementById("deviceRows");
const deviceStatus = document.getElementById("deviceStatus");
const refreshDevicesBtn = document.getElementById("refreshDevicesBtn");
const refreshInterval = document.getElementById("refreshInterval");
const previousPageBtn = document.getElementById("previousPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const devicePageLabel = document.getElementById("devicePageLabel");
const inventoryDialog = document.getElementById("inventoryDialog");
const inventoryTitle = document.getElementById("inventoryTitle");
const inventoryDeviceLabel = document.getElementById("inventoryDeviceLabel");
const inventoryStatus = document.getElementById("inventoryStatus");
const inventorySummary = document.getElementById("inventorySummary");
const inventoryListedCount = document.getElementById("inventoryListedCount");
const inventoryCurrentTotal = document.getElementById("inventoryCurrentTotal");
const inventoryCapacityTotal = document.getElementById("inventoryCapacityTotal");
const inventoryCards = document.getElementById("inventoryCards");
const closeInventoryBtn = document.getElementById("closeInventoryBtn");
const token = sessionStorage.getItem("feigeAuthToken") || "";
refreshDevicesBtn.textContent = token ? "Monitorar" : "Autenticar";

let refreshTimer;
let isRefreshing = false;
let replenishmentRequestId = 0;
let replenishmentDeviceRecords = [];
let hasReplenishmentReport = false;
let replenishmentGeneratedAt = "";
let vendChannelRequestId = 0;
let isDispensing = false;
let isLoadingSales = false;
let salesRefreshTimer;
let abcRefreshTimer;
let lastSalesRefreshAt;
let isLoadingAbc = false;
let devicePage = 1;
const devicePageSize = 50;
const SALES_TIME_ZONE = "Etc/GMT+3";
const CHINA_UTC_OFFSET = "+08:00";

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
  queryInput.disabled = false;
  bodyInput.disabled = tool.body === null;
}

function resultLabel(key) {
  return RESULT_FIELD_LABELS[key] || key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (character) => character.toLocaleUpperCase());
}

function resultValue(key, value, toolId) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";

  if (toolId === "orders" && ["createTime", "payTime", "refundTime"].includes(key)) {
    return formatSaleDateTime(value);
  }
  if (toolId === "orders" && [
    "actualAmount", "amount", "orderAmount", "payAmount", "price", "returnMoney",
    "productTotalMoney", "salePrice", "totalAmount", "totalMoney", "totalPrice"
  ].includes(key)) {
    return formatSaleAmount(parseSaleAmount(value));
  }
  if (["mainOpen", "subOpen"].includes(key) && [0, 1].includes(Number(value))) {
    return Number(value) === 1 ? "Aberta" : "Fechada";
  }
  if (key === "status") {
    if (toolId === "devices") return Number(value) === 1 ? "Online" : Number(value) === 2 ? "Offline" : String(value);
    if (toolId === "inventory") return Number(value) === 2 ? "Listado" : Number(value) === 1 ? "Desativado" : String(value);
    if (["coupons", "coupon-code"].includes(toolId)) return Number(value) === 1 ? "Não utilizado" : Number(value) === 2 ? "Utilizado" : String(value);
  }
  if (key === "payStatus" && toolId === "orders") {
    return Number(value) === 2 ? "Pagamento concluído" : Number(value) === 3 ? "Reembolsado" : String(value);
  }
  if (typeof value === "number" && !/(^id$|Id$|Uuid$|No$|Code$)/i.test(key)) {
    return value.toLocaleString("pt-BR");
  }
  return String(value);
}

function createResultElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function formatResultCell(value, toolId, key = "") {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.length ? `${value.length} itens` : "Nenhum item";
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => `${resultLabel(key)}: ${resultValue(key, item, toolId)}`)
      .join(" · ");
  }
  return resultValue(key, value, toolId);
}

function renderResultTable(parent, records, toolId) {
  if (records.length === 0) {
    parent.appendChild(createResultElement("p", "result-empty", "Nenhum registro encontrado."));
    return;
  }

  const columns = [...new Set(records.flatMap((record) => Object.keys(record)))];
  const wrapper = createResultElement("div", "result-table-wrap");
  const table = createResultElement("table", "result-table");
  const head = document.createElement("thead");
  const headerRow = document.createElement("tr");
  for (const column of columns) {
    headerRow.appendChild(createResultElement("th", "", resultLabel(column)));
  }
  head.appendChild(headerRow);
  table.appendChild(head);

  const body = document.createElement("tbody");
  for (const record of records) {
    const row = document.createElement("tr");
    for (const column of columns) {
      const cell = document.createElement("td");
      cell.textContent = formatResultCell(record[column], toolId, column);
      row.appendChild(cell);
    }
    body.appendChild(row);
  }
  table.appendChild(body);
  wrapper.appendChild(table);
  parent.appendChild(wrapper);
}

function renderResultValue(parent, label, value, toolId, depth = 0) {
  const section = createResultElement("section", "result-section");
  if (label) section.appendChild(createResultElement("h3", "result-section-title", label));

  if (Array.isArray(value)) {
    if (value.length > 0 && value.every((item) => item && typeof item === "object" && !Array.isArray(item))) {
      renderResultTable(section, value, toolId);
    } else if (value.length > 0) {
      const list = createResultElement("ul", "result-list");
      for (const item of value) {
        list.appendChild(createResultElement("li", "", formatResultCell(item, toolId)));
      }
      section.appendChild(list);
    } else {
      section.appendChild(createResultElement("p", "result-empty", "Nenhum item encontrado."));
    }
  } else if (value && typeof value === "object") {
    if (depth >= 4) {
      section.appendChild(createResultElement("p", "result-value", "Dados adicionais"));
    } else {
      const fields = createResultElement("dl", "result-fields");
      for (const [key, item] of Object.entries(value)) {
        if (item && typeof item === "object") {
          renderResultValue(section, resultLabel(key), item, toolId, depth + 1);
        } else {
          const field = createResultElement("div", "result-field");
          field.append(
            createResultElement("dt", "", resultLabel(key)),
            createResultElement("dd", "", resultValue(key, item, toolId))
          );
          fields.appendChild(field);
        }
      }
      if (fields.childElementCount) section.appendChild(fields);
      if (!section.childElementCount) section.appendChild(createResultElement("p", "result-empty", "Sem dados para exibir."));
    }
  } else {
    section.appendChild(createResultElement("p", "result-value", resultValue("", value, toolId)));
  }

  parent.appendChild(section);
}

function renderToolResult(tool, response, payload, apiPath, succeeded, output = toolOutput) {
  output.replaceChildren();
  const header = createResultElement("div", "result-header");
  header.append(
    createResultElement("h3", "result-title", tool.label),
    createResultElement("span", `result-status ${succeeded ? "success" : "error"}`, succeeded ? "Concluída" : "Falha")
  );
  output.appendChild(header);

  const apiMessage = payload && typeof payload === "object" ? payload.msg || payload.message : "";
  const message = succeeded ? "Operação concluída com sucesso." : apiMessage || `A operação falhou (HTTP ${response.status}).`;
  output.appendChild(createResultElement("p", `result-message ${succeeded ? "" : "error"}`, message));

  const metadata = createResultElement("dl", "result-meta");
  for (const [label, value] of [["HTTP", `${response.status} ${response.statusText || ""}`.trim()], ["Código da API", payload?.code ?? "—"]]) {
    const item = createResultElement("div", "result-meta-item");
    item.append(createResultElement("dt", "", label), createResultElement("dd", "", String(value)));
    metadata.appendChild(item);
  }
  output.appendChild(metadata);

  const resultData = payload && typeof payload === "object" && Object.hasOwn(payload, "data")
    ? payload.data
    : payload;
  renderResultValue(output, "Dados retornados", resultData, tool.id);

  const rawDetails = createResultElement("details", "result-raw");
  rawDetails.appendChild(createResultElement("summary", "", "Ver resposta original"));
  rawDetails.appendChild(createResultElement("pre", "", JSON.stringify({ path: apiPath, payload }, null, 2)));
  output.appendChild(rawDetails);
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

function formatLocalDate(date) {
  return formatGmtMinus3Date(date);
}

function formatGmtMinus3Date(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SALES_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatGmtMinus3DateTime(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: SALES_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "short"
  }).format(date);
}

function parseSaleDateTime(value) {
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value : null;
  if (typeof value === "number") {
    const timestamp = Math.abs(value) < 1_000_000_000_000 ? value * 1000 : value;
    const date = new Date(timestamp);
    return Number.isFinite(date.getTime()) ? date : null;
  }
  if (typeof value !== "string" || !value.trim()) return null;

  const timestamp = value.trim();
  const compactTimestamp = timestamp.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (compactTimestamp) {
    const [, year, month, day, hour, minute, second] = compactTimestamp;
    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}${CHINA_UTC_OFFSET}`);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(timestamp)) {
    const date = new Date(timestamp);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  const localTimestamp = timestamp.match(/^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2})(?::(\d{2})(\.\d+)?)?)?$/);
  if (!localTimestamp) return null;
  const [, datePart, hourMinute = "00:00", seconds = "00", fraction = ""] = localTimestamp;
  const milliseconds = fraction ? `.${fraction.slice(1).padEnd(3, "0").slice(0, 3)}` : "";
  const date = new Date(`${datePart}T${hourMinute}:${seconds}${milliseconds}${CHINA_UTC_OFFSET}`);
  return Number.isFinite(date.getTime()) ? date : null;
}

function formatSaleDateTime(value) {
  const date = parseSaleDateTime(value);
  return date ? formatGmtMinus3DateTime(date) : "—";
}

function dateInputToGmtMinus3Boundary(value, isEnd = false) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, isEnd ? 26 : 3, isEnd ? 59 : 0, isEnd ? 59 : 0, isEnd ? 999 : 0));
}

function addCalendarDays(value, days) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function findOrderTotalCount(payload) {
  let current = payload;
  for (let depth = 0; depth < 5; depth += 1) {
    if (!current || typeof current !== "object") break;
    const total = Number(current.totalCount ?? current.total);
    if (Number.isFinite(total) && total >= 0) return total;
    if (current.result !== undefined) current = current.result;
    else if (current.data !== undefined) current = current.data;
    else break;
  }
  return undefined;
}

function getSaleDevice(order) {
  const device = order.device;
  if (device && typeof device === "object") {
    return device.deviceName || device.name || device.deviceUuid || device.id || "Máquina não identificada";
  }
  return order.deviceName || (typeof device === "string" ? device : "") ||
    order.deviceUuid || "Máquina não identificada";
}

function parseSaleAmount(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const normalized = value.trim().replace(/R\$/gi, "").replace(/\s+/g, "");
  if (!normalized) return null;

  const brazilianNumber = normalized.match(/^([+-]?)(?:(\d{1,3}(?:\.\d{3})+)|(\d+))(?:,(\d{1,2}))?$/);
  if (brazilianNumber) {
    const integerPart = (brazilianNumber[2] || brazilianNumber[3]).replace(/\./g, "");
    const decimalPart = brazilianNumber[4] || "0";
    const amount = Number(`${brazilianNumber[1]}${integerPart}.${decimalPart}`);
    return Number.isFinite(amount) ? amount : null;
  }

  const decimalDotNumber = normalized.match(/^([+-]?\d+)\.(\d{1,2})$/);
  if (decimalDotNumber) {
    const amount = Number(normalized);
    return Number.isFinite(amount) ? amount : null;
  }
  return null;
}

const SALE_AMOUNT_KEYS = [
  "actualAmount", "payAmount", "orderAmount", "productTotalMoney",
  "totalAmount", "totalMoney", "totalPrice", "amount", "price", "salePrice"
];

function isAmountInMinorUnits(amount, majorAmount) {
  return Number.isInteger(amount) && amount > 0 &&
    Math.abs(amount / 100 - Math.round(majorAmount * 100) / 100) < 0.005;
}

function getSaleItemAmount(item, quantityOverride) {
  if (!item || typeof item !== "object") return null;
  const nestedProduct = item.product && typeof item.product === "object" && !Array.isArray(item.product)
    ? item.product
    : {};
  const lineAmount = parseSaleAmount(
    item.totalAmount ?? item.totalMoney ?? item.productTotalMoney ?? item.totalPrice ??
    item.amount ?? item.payAmount ?? item.actualAmount
  );
  let unitPrice = parseSaleAmount(item.price ?? item.salePrice ?? item.unitPrice);
  const costPrice = parseSaleAmount(item.costPrice ?? nestedProduct.costPrice);
  const quantityValue = item.quantity ?? item.count ?? quantityOverride;
  const quantity = quantityValue === null || quantityValue === undefined || quantityValue === ""
    ? null
    : Number(quantityValue);
  // Equal cost and sale prices hide the scale ratio, so the line total and quantity must corroborate it.
  const amountsShareMinorUnitScale = Number.isInteger(unitPrice) && unitPrice >= 100 &&
    costPrice === unitPrice && Number.isFinite(quantity) && quantity > 0 &&
    lineAmount === unitPrice * quantity;
  if (unitPrice !== null && costPrice !== null && costPrice > 0 &&
      ((unitPrice / costPrice >= 100 && unitPrice / 100 >= costPrice) ||
       amountsShareMinorUnitScale)) {
    unitPrice /= 100;
  }
  const hasCalculatedAmount = unitPrice !== null && Number.isFinite(quantity) && quantity >= 0;
  const calculatedAmount = hasCalculatedAmount ? unitPrice * quantity : null;

  if (lineAmount !== null) {
    return calculatedAmount !== null && isAmountInMinorUnits(lineAmount, calculatedAmount)
      ? calculatedAmount
      : lineAmount;
  }
  return calculatedAmount;
}

function getSaleItemsAmount(order) {
  if (!Array.isArray(order.orderItemList) || order.orderItemList.length === 0) return null;
  let total = 0;
  for (const item of order.orderItemList) {
    const amount = getSaleItemAmount(item);
    if (amount === null) return null;
    total += amount;
  }
  return total;
}

function getSaleAmount(order) {
  const itemsAmount = getSaleItemsAmount(order);
  const amounts = SALE_AMOUNT_KEYS
    .map((key) => parseSaleAmount(order[key]))
    .filter((amount) => amount !== null);

  for (const amount of amounts) {
    if (itemsAmount !== null && isAmountInMinorUnits(amount, itemsAmount)) {
      return amount / 100;
    }
    for (const otherAmount of amounts) {
      if (isAmountInMinorUnits(amount, otherAmount)) {
        return otherAmount;
      }
    }
  }

  for (const key of SALE_AMOUNT_KEYS) {
    const amount = parseSaleAmount(order[key]);
    if (amount !== null) {
      return amount;
    }
  }

  return itemsAmount;
}

function normalizeSaleAmountFields(record, referenceAmount) {
  if (!record || typeof record !== "object" || referenceAmount === null) return record;
  const normalized = { ...record };
  for (const key of SALE_AMOUNT_KEYS) {
    const amount = parseSaleAmount(record[key]);
    if (amount !== null && isAmountInMinorUnits(amount, referenceAmount)) {
      normalized[key] = amount / 100;
    }
  }
  if (Array.isArray(record.orderItemList)) {
    normalized.orderItemList = record.orderItemList.map((item) =>
      normalizeSaleAmountFields(item, getSaleItemAmount(item))
    );
  }
  return normalized;
}

function formatSaleAmount(amount) {
  if (amount === null) return "Valor não informado";
  return `${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}R$`;
}

function normalizeSales(records) {
  const sales = [];
  let missingPaymentTimeCount = 0;
  for (const order of records) {
    const payTime = parseSaleDateTime(order.payTime);
    if (!payTime || !Number.isFinite(payTime.getTime())) {
      missingPaymentTimeCount += 1;
      continue;
    }
    sales.push({ order, payTime });
  }
  sales.sort((left, right) => right.payTime - left.payTime);
  return { sales, missingPaymentTimeCount };
}

function appendSaleCards(parent, sales, emptyMessage) {
  parent.replaceChildren();
  if (sales.length === 0) {
    parent.appendChild(createResultElement("p", "sales-empty", emptyMessage));
    return;
  }
  for (const { order, payTime } of sales) {
    const card = createResultElement("details", "sales-card");
    const summary = document.createElement("summary");
    const heading = createResultElement("span", "sales-order-heading");
    heading.append(
      createResultElement("strong", "", `Pedido ${order.orderNo || order.id || "sem número"}`),
      createResultElement("span", "", getSaleDevice(order)),
      createResultElement("span", "sales-order-amount", formatSaleAmount(getSaleAmount(order))),
      createResultElement("time", "", formatSaleDateTime(payTime))
    );
    const status = Number(order.payStatus);
    const statusLabel = status === 2 ? "Pagamento concluído" : status === 3 ? "Reembolsado" : `Status ${order.payStatus ?? "desconhecido"}`;
    summary.append(heading, createResultElement("span", `sales-order-status ${status === 2 ? "paid" : status === 3 ? "refunded" : ""}`.trim(), statusLabel));
    card.appendChild(summary);

    const details = createResultElement("div", "sales-order-details");
    const amount = getSaleItemsAmount(order);
    renderResultValue(
      details,
      "Detalhes da venda",
      normalizeSaleAmountFields(order, amount),
      "orders"
    );
    card.appendChild(details);
    parent.appendChild(card);
  }
}

function renderLatestSales(records) {
  const { sales } = normalizeSales(records);
  appendSaleCards(
    latestSalesList,
    sales.slice(0, 10),
    "Nenhuma venda recente com horário de pagamento disponível."
  );
  return Math.min(sales.length, 10);
}

function renderPeriodSales(records, startTime, endTime) {
  const { sales: allSales, missingPaymentTimeCount } = normalizeSales(records);
  const sales = allSales.filter(({ payTime }) => payTime >= startTime && payTime <= endTime);
  salesTotal.textContent = sales.length.toLocaleString("pt-BR");
  salesPaid.textContent = sales.filter(({ order }) => Number(order.payStatus) === 2).length.toLocaleString("pt-BR");
  salesRefunded.textContent = sales.filter(({ order }) => Number(order.payStatus) === 3).length.toLocaleString("pt-BR");
  salesDevices.textContent = new Set(sales.map(({ order }) => getSaleDevice(order))).size.toLocaleString("pt-BR");
  appendSaleCards(periodSalesList, sales, "Nenhuma venda encontrada no período selecionado.");
  return { count: sales.length, missingPaymentTimeCount };
}

function getAbcItemQuantity(item) {
  const value = item.quantity ?? item.count ?? item.productCount ?? item.productNum ?? item.buyCount;
  if (value === null || value === undefined || value === "") return null;
  const quantity = Number(value);
  return Number.isFinite(quantity) && quantity >= 0 ? quantity : null;
}

function getAbcItemRevenue(item, quantity) {
  return getSaleItemAmount(item, quantity);
}

function aggregateAbcProducts(orders, startTime, endTime) {
  const products = new Map();
  let paidOrderCount = 0;
  let skippedItemCount = 0;
  let skippedOrderCount = 0;

  for (const order of orders) {
    const payTime = parseSaleDateTime(order.payTime);
    if (!payTime || payTime < startTime || payTime > endTime || Number(order.payStatus) !== 2) continue;

    paidOrderCount += 1;
    if (!Array.isArray(order.orderItemList) || order.orderItemList.length === 0) {
      skippedOrderCount += 1;
      continue;
    }

    for (const item of order.orderItemList) {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        skippedItemCount += 1;
        continue;
      }

      const nestedProduct = item.product && typeof item.product === "object" ? item.product : {};
      const productId = item.productId ?? item.goodsId ?? nestedProduct.id;
      const productName = item.productName || item.goodsName || nestedProduct.name || item.name || item.title;
      if ((productId === undefined || productId === null || String(productId).trim() === "") &&
          (typeof productName !== "string" || !productName.trim())) {
        skippedItemCount += 1;
        continue;
      }

      const quantity = getAbcItemQuantity(item);
      const revenue = getAbcItemRevenue(item, quantity);
      if (revenue === null || revenue < 0) {
        skippedItemCount += 1;
        continue;
      }

      const identity = productId !== undefined && productId !== null && String(productId).trim() !== ""
        ? `id:${productId}`
        : `name:${productName.trim().toLocaleLowerCase()}`;
      const product = products.get(identity) || {
        name: typeof productName === "string" && productName.trim()
          ? productName.trim()
          : `Produto ${productId}`,
        quantity: 0,
        quantityComplete: true,
        revenue: 0
      };
      if (quantity === null) {
        product.quantityComplete = false;
      } else {
        product.quantity += quantity;
      }
      product.revenue += revenue;
      products.set(identity, product);
    }
  }

  const sortedProducts = [...products.values()].sort((left, right) =>
    right.revenue - left.revenue || left.name.localeCompare(right.name, "pt-BR")
  );
  const totalRevenue = sortedProducts.reduce((total, product) => total + product.revenue, 0);
  let cumulativeRevenue = 0;
  for (const product of sortedProducts) {
    const previousShare = totalRevenue > 0 ? cumulativeRevenue / totalRevenue : 1;
    cumulativeRevenue += product.revenue;
    product.share = totalRevenue > 0 ? product.revenue / totalRevenue : 0;
    product.cumulativeShare = totalRevenue > 0 ? cumulativeRevenue / totalRevenue : 0;
    product.category = previousShare < 0.8 ? "A" : previousShare < 0.95 ? "B" : "C";
  }

  return { products: sortedProducts, totalRevenue, paidOrderCount, skippedItemCount, skippedOrderCount };
}

function renderAbcReport(summary) {
  abcOrderCount.textContent = summary.paidOrderCount.toLocaleString("pt-BR");
  abcRevenueTotal.textContent = formatSaleAmount(summary.totalRevenue);
  abcProductCount.textContent = summary.products.length.toLocaleString("pt-BR");
  abcReport.replaceChildren();

  if (summary.products.length === 0) {
    abcReport.appendChild(
      createResultElement("p", "result-empty", "Nenhum item de produto foi encontrado em pedidos pagos no período.")
    );
    abcChart.replaceChildren(
      createResultElement("p", "result-empty", "Sem dados suficientes para gerar o gráfico.")
    );
    return;
  }

  const table = createResultElement("table", "result-table abc-table");
  const head = document.createElement("thead");
  const headerRow = document.createElement("tr");
  for (const label of ["Produto", "Quantidade vendida", "Faturamento", "% do faturamento", "% acumulado", "Classe"]) {
    headerRow.appendChild(createResultElement("th", "", label));
  }
  head.appendChild(headerRow);
  table.appendChild(head);

  const body = document.createElement("tbody");
  for (const product of summary.products) {
    const row = document.createElement("tr");
    const values = [
      product.name,
      product.quantityComplete ? product.quantity.toLocaleString("pt-BR") : "—",
      formatSaleAmount(product.revenue),
      `${(product.share * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`,
      `${(product.cumulativeShare * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`,
      product.category
    ];
    for (const value of values) {
      row.appendChild(createResultElement("td", "", value));
    }
    row.lastElementChild.className = `abc-class abc-class-${product.category.toLowerCase()}`;
    body.appendChild(row);
  }
  table.appendChild(body);
  abcReport.appendChild(table);
  renderAbcChart(summary.products);
}

function renderAbcChart(products) {
  const namespace = "http://www.w3.org/2000/svg";
  const chartHeight = 360;
  const margins = { top: 24, right: 58, bottom: 62, left: 62 };
  const chartWidth = Math.max(900, products.length * 18 + margins.left + margins.right);
  const plotWidth = chartWidth - margins.left - margins.right;
  const plotHeight = chartHeight - margins.top - margins.bottom;
  const plotBottom = margins.top + plotHeight;
  const maxRevenue = products.reduce((maximum, product) => Math.max(maximum, product.revenue), 0);
  const svg = document.createElementNS(namespace, "svg");
  svg.classList.add("abc-chart");
  svg.setAttribute("viewBox", `0 0 ${chartWidth} ${chartHeight}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `Curva ABC de ${products.length} produtos, ordenados por faturamento`);
  svg.style.width = `${chartWidth}px`;

  const addElement = (tag, attributes, text) => {
    const element = document.createElementNS(namespace, tag);
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value));
    if (text !== undefined) element.textContent = text;
    svg.appendChild(element);
    return element;
  };
  const yForShare = (share) => margins.top + plotHeight * (1 - share);

  for (const share of [0, 0.5, 1]) {
    const y = yForShare(share);
    addElement("line", {
      x1: margins.left,
      x2: margins.left + plotWidth,
      y1: y,
      y2: y,
      class: "abc-chart-grid"
    });
    addElement("text", {
      x: margins.left - 10,
      y: y + 4,
      "text-anchor": "end",
      class: "abc-chart-axis-label"
    }, `${Math.round(share * 100)}%`);
  }

  const step = plotWidth / products.length;
  const points = [];
  products.forEach((product, index) => {
    const x = margins.left + step * index + step / 2;
    const barHeight = maxRevenue > 0 ? (product.revenue / maxRevenue) * plotHeight : 0;
    const barWidth = Math.max(1, step * 0.68);
    const bar = addElement("rect", {
      x: x - barWidth / 2,
      y: plotBottom - barHeight,
      width: barWidth,
      height: barHeight,
      class: `abc-chart-bar abc-chart-bar-${product.category.toLowerCase()}`
    });
    const tooltip = document.createElementNS(namespace, "title");
    tooltip.textContent = `${product.name} · ${formatSaleAmount(product.revenue)} · ${(product.cumulativeShare * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}% acumulado · Classe ${product.category}`;
    bar.appendChild(tooltip);
    points.push(`${x},${yForShare(product.cumulativeShare)}`);
  });

  addElement("polyline", {
    points: points.join(" "),
    class: "abc-chart-cumulative"
  });

  for (const share of [0.8, 0.95]) {
    const y = yForShare(share);
    addElement("line", {
      x1: margins.left,
      x2: margins.left + plotWidth,
      y1: y,
      y2: y,
      class: "abc-chart-threshold"
    });
    addElement("text", {
      x: margins.left + plotWidth + 10,
      y: y + 4,
      "text-anchor": "start",
      class: "abc-chart-axis-label"
    }, `${Math.round(share * 100)}%`);
  }

  for (const share of [0, 0.5, 1]) {
    addElement("text", {
      x: margins.left + plotWidth + 10,
      y: yForShare(share) + 4,
      "text-anchor": "start",
      class: "abc-chart-axis-label"
    }, `${Math.round(share * 100)}%`);
  }

  addElement("text", {
    x: chartWidth - 8,
    y: margins.top - 10,
    "text-anchor": "end",
    class: "abc-chart-axis-title"
  }, "Acumulado");
  addElement("text", {
    x: 14,
    y: margins.top + plotHeight / 2,
    "text-anchor": "middle",
    class: "abc-chart-axis-title",
    transform: `rotate(-90 14 ${margins.top + plotHeight / 2})`
  }, "Faturamento (% do produto líder)");

  const rankLabels = [...new Set([1, Math.ceil(products.length / 2), products.length])];
  for (const rank of rankLabels) {
    const x = margins.left + step * (rank - 0.5);
    addElement("text", {
      x,
      y: plotBottom + 20,
      "text-anchor": "middle",
      class: "abc-chart-axis-label"
    }, String(rank));
  }
  addElement("text", {
    x: margins.left + plotWidth / 2,
    y: chartHeight - 8,
    "text-anchor": "middle",
    class: "abc-chart-axis-title"
  }, "Produtos em ordem decrescente de faturamento (posição no ranking)");

  abcChart.replaceChildren(svg);
}

async function refreshAbcReport() {
  if (isLoadingAbc) return;
  isLoadingAbc = true;
  refreshAbcBtn.disabled = true;
  abcReport.replaceChildren(createResultElement("p", "result-placeholder", "Consultando vendas dos últimos 30 dias..."));
  setStatus(abcStatus, "Consultando pedidos pagos para montar a curva ABC...");

  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000);
  const queryStart = formatGmtMinus3Date(startTime);
  const queryEnd = formatGmtMinus3Date(endTime);
  const pageSize = 200;
  const orders = [];

  try {
    const tool = getTool("orders");
    for (let pageNo = 1; ; pageNo += 1) {
      setStatus(abcStatus, pageNo === 1
        ? "Consultando pedidos dos últimos 30 dias..."
        : `Consultando página ${pageNo} de pedidos...`);
      const { response, payload } = await callApi(tool, {
        pageNo,
        pageSize
      }, {
        createTimeStart: queryStart,
        createTimeEnd: addCalendarDays(queryEnd, 1)
      });
      const apiCode = payload && typeof payload === "object" ? Number(payload.code) : undefined;
      if (!response.ok || (Number.isFinite(apiCode) && apiCode !== 200)) {
        throw new Error(payload?.msg || payload?.message || `Falha ao consultar pedidos (HTTP ${response.status}, página ${pageNo}).`);
      }

      const records = extractRecords(payload);
      orders.push(...records);
      const totalCount = findOrderTotalCount(payload);
      if (records.length === 0 ||
        (totalCount !== undefined && pageNo * pageSize >= totalCount) ||
        (totalCount === undefined && records.length < pageSize)) {
        break;
      }
      if (pageNo >= 1000) {
        throw new Error("A consulta da curva ABC ultrapassou 1.000 páginas.");
      }
    }

    const summary = aggregateAbcProducts(orders, startTime, endTime);
    renderAbcReport(summary);
    const skippedLabel = summary.skippedItemCount || summary.skippedOrderCount
      ? ` ${summary.skippedItemCount.toLocaleString("pt-BR")} item(ns) e ${summary.skippedOrderCount.toLocaleString("pt-BR")} pedido(s) sem detalhes suficientes foram desconsiderados.`
      : "";
    setStatus(
      abcStatus,
      `Período: ${formatGmtMinus3Date(startTime)} a ${formatGmtMinus3Date(endTime)} (GMT−3). Classificação por faturamento; os itens que cruzam cada limite permanecem na classe que completa a faixa.${skippedLabel}`,
      "success"
    );
  } catch (error) {
    abcReport.replaceChildren(createResultElement("p", "result-message error", `Não foi possível gerar a curva ABC: ${error.message}`));
    setStatus(abcStatus, error.message, "error");
  } finally {
    isLoadingAbc = false;
    refreshAbcBtn.disabled = false;
  }
}

async function refreshSalesReport() {
  if (isLoadingSales) return;
  isLoadingSales = true;
  refreshSalesBtn.disabled = true;
  applySalesPeriodBtn.disabled = true;
  setStatus(salesStatus, "Consultando vendas de todas as máquinas...");

  const queryStart = salesStartDate.value;
  const queryEnd = salesEndDate.value;
  if (!queryStart || !queryEnd || queryStart > queryEnd) {
    setStatus(salesStatus, "Informe um período válido: a data inicial deve ser anterior ou igual à data final.", "error");
    isLoadingSales = false;
    refreshSalesBtn.disabled = false;
    applySalesPeriodBtn.disabled = false;
    return;
  }
  const startTime = dateInputToGmtMinus3Boundary(queryStart);
  const endTime = dateInputToGmtMinus3Boundary(queryEnd, true);
  const pageSize = 200;
  let periodOrders = [];
  let missingPaymentTimeCount = 0;

  try {
    const tool = getTool("orders");
    setStatus(salesStatus, "Consultando as 10 vendas mais recentes...");
    const { response: latestResponse, payload: latestPayload } = await callApi(
      tool,
      { pageNo: 1, pageSize },
      {}
    );
    const latestApiCode = latestPayload && typeof latestPayload === "object" ? Number(latestPayload.code) : undefined;
    if (!latestResponse.ok || (Number.isFinite(latestApiCode) && latestApiCode !== 200)) {
      const message = latestPayload?.msg || latestPayload?.message || `Falha ao consultar as vendas mais recentes (HTTP ${latestResponse.status}).`;
      throw new Error(message);
    }
    renderLatestSales(extractRecords(latestPayload));

    for (let pageNo = 1; ; pageNo += 1) {
      setStatus(salesStatus, pageNo === 1
        ? "Consultando vendas do período..."
        : `Consultando página ${pageNo} do período...`);
      const { response, payload } = await callApi(tool, {
        pageNo,
        pageSize
      }, {
        createTimeStart: queryStart,
        createTimeEnd: addCalendarDays(queryEnd, 1)
      });
      const apiCode = payload && typeof payload === "object" ? Number(payload.code) : undefined;
      if (!response.ok || (Number.isFinite(apiCode) && apiCode !== 200)) {
        const message = payload?.msg || payload?.message || `Falha ao consultar vendas do período (HTTP ${response.status}).`;
        throw new Error(`${message} (página ${pageNo}).`);
      }

      const records = extractRecords(payload);
      periodOrders.push(...records);
      const totalCount = findOrderTotalCount(payload);
      if (records.length === 0 ||
        (totalCount !== undefined && pageNo * pageSize >= totalCount) ||
        (totalCount === undefined && records.length < pageSize)) {
        break;
      }
      if (pageNo >= 1000) {
        throw new Error("A consulta ultrapassou 1.000 páginas; revise o período ou a paginação da API.");
      }
    }

    const periodResult = renderPeriodSales(periodOrders, startTime, endTime);
    missingPaymentTimeCount = periodResult.missingPaymentTimeCount;
    const intervalLabel = `${formatGmtMinus3Date(startTime)} a ${formatGmtMinus3Date(endTime)}`;
    const omittedLabel = missingPaymentTimeCount
      ? ` ${missingPaymentTimeCount.toLocaleString("pt-BR")} pedido(s) sem horário de pagamento válido foram ignorados.`
      : "";
    setStatus(
      salesStatus,
      `Atualizado às ${formatGmtMinus3DateTime(new Date())}. Últimas 10 vendas sem limite de data; período consultado (GMT−3): ${intervalLabel}.${omittedLabel}`,
      missingPaymentTimeCount ? "" : "success"
    );
    lastSalesRefreshAt = new Date();
  } catch (error) {
    const previousDataLabel = lastSalesRefreshAt
      ? ` Os dados exibidos são da última atualização válida às ${formatGmtMinus3DateTime(lastSalesRefreshAt)}.`
      : "";
    setStatus(salesStatus, `${error.message}${previousDataLabel}`, "error");
  } finally {
    isLoadingSales = false;
    refreshSalesBtn.disabled = false;
    applySalesPeriodBtn.disabled = false;
  }
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
    row.deviceRecord = device;
    const status = Number(device.status);
    const values = [
      ["Dispositivo", device.deviceName || "—"],
      ["ID", device.id ?? device.deviceUuid ?? "—"]
    ];
    for (const [label, value] of values) {
      const cell = document.createElement("td");
      cell.dataset.label = label;
      cell.textContent = String(value);
      row.appendChild(cell);
    }

    const stateCell = document.createElement("td");
    stateCell.dataset.label = "Estado";
    const state = document.createElement("span");
    state.className = `device-state ${status === 1 ? "online" : status === 2 ? "offline" : ""}`.trim();
    state.textContent = status === 1 ? "Online" : status === 2 ? "Offline" : String(device.status ?? "Desconhecido");
    stateCell.appendChild(state);
    row.appendChild(stateCell);

    const signalCell = document.createElement("td");
    signalCell.dataset.label = "Sinal";
    signalCell.textContent = `4G: ${device.strength4g ?? "—"} / Wi-Fi: ${device.strengthWifi ?? "—"}`;
    row.appendChild(signalCell);

    const versionCell = document.createElement("td");
    versionCell.dataset.label = "Versão";
    versionCell.textContent = String(device.deviceVersion ?? "—");
    row.appendChild(versionCell);

    const actionsCell = document.createElement("td");
    actionsCell.dataset.label = "Ações";
    actionsCell.append(
      makeDeviceAction("Estoque", "inventory", "deviceId", device.id),
      makeDeviceAction("Porta", "door-status", "deviceId", device.id)
    );
    row.appendChild(actionsCell);
    deviceRows.appendChild(row);
  }
}

function findInventoryRecords(payload) {
  let current = payload;
  for (let depth = 0; depth < 5; depth += 1) {
    if (!current || typeof current !== "object") break;
    if (Array.isArray(current.cargoPassageList)) return current.cargoPassageList;
    if (Array.isArray(current.records)) return current.records;
    if (Array.isArray(current.list)) return current.list;
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

function updateVendDeviceOptions(records) {
  const selectedDeviceId = vendDeviceSelect.value;
  vendDeviceSelect.replaceChildren(createResultElement("option", "", "Selecione um equipamento"));
  for (const device of records) {
    const deviceId = device.id ?? device.deviceUuid;
    if (deviceId === undefined || deviceId === null || String(deviceId).trim() === "") continue;
    const state = Number(device.status) === 1 ? "Online" : Number(device.status) === 2 ? "Offline" : "Estado desconhecido";
    const name = device.deviceName || "Dispositivo sem nome";
    const option = createResultElement("option", "", `${name} · ${state} · ID ${deviceId}`);
    option.value = String(deviceId);
    vendDeviceSelect.appendChild(option);
  }
  vendDeviceSelect.disabled = vendDeviceSelect.options.length <= 1;
  if ([...vendDeviceSelect.options].some((option) => option.value === selectedDeviceId)) {
    vendDeviceSelect.value = selectedDeviceId;
  } else if (selectedDeviceId) {
    vendChannelRequestId += 1;
    vendChannelList.replaceChildren(createResultElement("p", "dispense-empty", "Selecione um equipamento e carregue os canais."));
    setStatus(vendChannelStatus, "A seleção de equipamento mudou. Escolha um equipamento para continuar.");
  }
  loadVendChannelsBtn.disabled = !vendDeviceSelect.value;
  updateVendSelectionState();
}

function updateReplenishmentDeviceOptions(records) {
  replenishmentDeviceRecords = records;
  const selectedDeviceId = replenishmentDeviceSelect.value;
  replenishmentDeviceSelect.replaceChildren(createResultElement("option", "", "Selecione uma máquina"));
  for (const device of records) {
    const deviceId = device.id ?? device.deviceUuid;
    if (deviceId === undefined || deviceId === null || String(deviceId).trim() === "") continue;
    const name = device.deviceName || "Máquina sem nome";
    const option = createResultElement("option", "", `${name} · ID ${deviceId}`);
    option.value = String(deviceId);
    replenishmentDeviceSelect.appendChild(option);
  }
  replenishmentDeviceSelect.disabled = replenishmentDeviceSelect.options.length <= 1;
  if ([...replenishmentDeviceSelect.options].some((option) => option.value === selectedDeviceId)) {
    replenishmentDeviceSelect.value = selectedDeviceId;
    renderReplenishmentMachineDetails(getSelectedReplenishmentDevice(), replenishmentGeneratedAt);
  } else {
    replenishmentDeviceSelect.value = "";
    replenishmentRequestId += 1;
    hasReplenishmentReport = false;
    replenishmentGeneratedAt = "";
    printReplenishmentBtn.disabled = true;
    replenishmentMachineDetails.replaceChildren();
    replenishmentMachineDetails.hidden = true;
    replenishmentReport.replaceChildren(
      createResultElement("p", "result-placeholder", "Selecione uma máquina para gerar o relatório.")
    );
    setStatus(replenishmentStatus, "Selecione uma máquina para consultar as reposições.");
  }
  refreshReplenishmentBtn.disabled = !replenishmentDeviceSelect.value;
}

function getSelectedReplenishmentDevice() {
  return replenishmentDeviceRecords.find((device) =>
    String(device.id ?? device.deviceUuid ?? "") === replenishmentDeviceSelect.value
  );
}

function renderReplenishmentMachineDetails(device, generatedAt) {
  replenishmentMachineDetails.replaceChildren();
  if (!device) {
    replenishmentMachineDetails.hidden = true;
    return;
  }

  const status = Number(device.status) === 1
    ? "Online"
    : Number(device.status) === 2
      ? "Offline"
      : device.status ?? "Desconhecido";
  const fields = [
    ["Máquina", device.deviceName || "Máquina sem nome"],
    ["ID", device.id ?? device.deviceUuid ?? "—"],
    ...(device.deviceUuid && String(device.deviceUuid) !== String(device.id ?? device.deviceUuid)
      ? [["UUID", device.deviceUuid]]
      : []),
    ["Estado", status],
    ...(device.deviceVersion ? [["Versão", device.deviceVersion]] : []),
    ...(generatedAt ? [["Consulta realizada em", generatedAt]] : [])
  ];

  for (const [label, value] of fields) {
    replenishmentMachineDetails.append(
      createResultElement("dt", "", label),
      createResultElement("dd", "", String(value))
    );
  }
  replenishmentMachineDetails.hidden = false;
}

function updateVendSelectionState() {
  const selectableChannels = [...vendChannelList.querySelectorAll('input[type="checkbox"]:not(:disabled)')];
  const selectedChannels = selectableChannels.filter((checkbox) => checkbox.checked);
  const hasChannels = selectableChannels.length > 0;
  selectAllVendChannelsBtn.disabled = !hasChannels || selectedChannels.length === selectableChannels.length;
  clearVendChannelsBtn.disabled = selectedChannels.length === 0;
  runVendBtn.disabled = isDispensing || !vendDeviceSelect.value || selectedChannels.length === 0;
}

function renderVendChannels(records) {
  vendChannelList.replaceChildren();
  const listedChannels = records.filter((record) => Number(record.status) === 2);
  if (listedChannels.length === 0) {
    vendChannelList.appendChild(createResultElement("p", "dispense-empty", "Nenhum canal listado foi encontrado para este equipamento."));
    setStatus(vendChannelStatus, "Não há canais disponíveis para dispensação.", "error");
    updateVendSelectionState();
    return;
  }

  for (const record of listedChannels) {
    const channelId = record.cargoPassageId;
    const channelNumber = record.cargoPassageNo ?? channelId ?? record.id ?? "Sem identificação";
    const label = document.createElement("label");
    label.className = "dispense-channel-option";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = channelId === undefined || channelId === null ? "" : String(channelId);
    checkbox.disabled = channelId === undefined || channelId === null || String(channelId).trim() === "";
    checkbox.addEventListener("change", updateVendSelectionState);

    const details = document.createElement("span");
    details.className = "dispense-channel-details";
    details.appendChild(createResultElement("strong", "", record.productName || record.categoryName || `Canal ${channelNumber}`));
    details.appendChild(createResultElement("span", "", `Canal ${channelNumber} · Estoque: ${formatInventoryCount(record.currentInventoryCount)}`));
    if (checkbox.disabled) {
      details.appendChild(createResultElement("span", "dispense-channel-warning", "ID do canal não retornado pela API"));
    }

    label.append(checkbox, details);
    vendChannelList.appendChild(label);
  }
  const enabledCount = vendChannelList.querySelectorAll('input[type="checkbox"]:not(:disabled)').length;
  setStatus(
    vendChannelStatus,
    enabledCount ? `${enabledCount} canal(is) listado(s). Marque os canais que deseja dispensar.` : "Os canais listados não têm um ID válido para dispensação.",
    enabledCount ? "" : "error"
  );
  updateVendSelectionState();
}

async function loadVendChannels() {
  const deviceId = vendDeviceSelect.value;
  if (!deviceId) {
    setStatus(vendChannelStatus, "Selecione um equipamento antes de carregar os canais.", "error");
    return;
  }

  const requestId = ++vendChannelRequestId;
  loadVendChannelsBtn.disabled = true;
  vendChannelList.replaceChildren(createResultElement("p", "dispense-empty", "Consultando canais do equipamento..."));
  setStatus(vendChannelStatus, "Consultando canais...");
  updateVendSelectionState();

  try {
    const inventoryTool = getTool("inventory");
    const { response, payload } = await callApi(
      inventoryTool,
      { deviceId },
      inventoryTool.body
    );
    const apiCode = payload && typeof payload === "object" ? Number(payload.code) : undefined;
    if (!response.ok || (Number.isFinite(apiCode) && apiCode !== 200)) {
      throw new Error(payload?.msg || payload?.message || `Falha ao consultar canais (HTTP ${response.status}).`);
    }
    if (requestId !== vendChannelRequestId || deviceId !== vendDeviceSelect.value) return;
    renderVendChannels(findInventoryRecords(payload));
  } catch (error) {
    if (requestId !== vendChannelRequestId) return;
    vendChannelList.replaceChildren(createResultElement("p", "dispense-empty", "Não foi possível carregar os canais."));
    setStatus(vendChannelStatus, error.message, "error");
    updateVendSelectionState();
  } finally {
    if (requestId === vendChannelRequestId) {
      loadVendChannelsBtn.disabled = !vendDeviceSelect.value;
    }
  }
}

async function runVend() {
  const selectedChannels = [...vendChannelList.querySelectorAll('input[type="checkbox"]:checked:not(:disabled)')];
  const cargoPassageIds = selectedChannels.map((checkbox) => checkbox.value);
  if (!vendDeviceSelect.value || cargoPassageIds.length === 0) {
    setStatus(vendStatus, "Selecione um equipamento e pelo menos um canal.", "error");
    return;
  }

  const deviceLabel = vendDeviceSelect.selectedOptions[0]?.textContent || vendDeviceSelect.value;
  const channelsLabel = selectedChannels.map((checkbox) =>
    checkbox.closest(".dispense-channel-option")?.querySelector(".dispense-channel-details strong")?.textContent || checkbox.value
  ).join(", ");
  const warning = `Esta ação pode dispensar produtos fisicamente.\n\nEquipamento: ${deviceLabel}\nCanais: ${channelsLabel}\n\nConfirme que o equipamento e os produtos estão corretos.`;
  if (!window.confirm(warning)) return;

  isDispensing = true;
  runVendBtn.disabled = true;
  setStatus(vendStatus, "Enviando solicitação de dispensação...");
  vendOutput.replaceChildren(createResultElement("p", "result-placeholder", "Enviando solicitação..."));
  try {
    const tool = getTool("vend");
    const { response, payload, apiPath } = await callApi(tool, {}, {
      deviceId: vendDeviceSelect.value,
      cargoPassageIds
    });
    const apiCode = payload && typeof payload === "object" ? Number(payload.code) : undefined;
    const succeeded = response.ok && (!Number.isFinite(apiCode) || apiCode === 200);
    renderToolResult(tool, response, payload, apiPath, succeeded, vendOutput);
    if (succeeded) {
      setStatus(vendStatus, "Solicitação enviada. Consulte o resultado usando o ID da tarefa.", "success");
    } else {
      setStatus(vendStatus, payload?.msg || payload?.message || `Falha ao solicitar dispensação (HTTP ${response.status}).`, "error");
    }
  } catch (error) {
    vendOutput.replaceChildren(createResultElement("p", "result-message error", `Erro: ${error.message}`));
    setStatus(vendStatus, error.message, "error");
  } finally {
    isDispensing = false;
    updateVendSelectionState();
  }
}

function formatInventoryCount(value) {
  const count = Number(value);
  return Number.isFinite(count) ? count.toLocaleString() : "—";
}

function getInventoryCount(value) {
  if (value === null || value === undefined || value === "") return null;
  const count = Number(value);
  return Number.isFinite(count) ? count : null;
}

function renderReplenishmentReport(records) {
  replenishmentReport.replaceChildren();
  const table = createResultElement("table", "result-table replenishment-table");
  const head = document.createElement("thead");
  const headerRow = document.createElement("tr");
  for (const heading of [
    "Mola / canaleta",
    "Produto",
    "Barcode",
    "Quantidade Máxima",
    "Quantidade na máquina",
    "Quantidade necessária para reposição"
  ]) {
    headerRow.appendChild(createResultElement("th", "", heading));
  }
  head.appendChild(headerRow);
  table.appendChild(head);

  const body = document.createElement("tbody");
  if (records.length === 0) {
    const row = document.createElement("tr");
    const cell = createResultElement("td", "result-empty", "A API não retornou canais de estoque para esta máquina.");
    cell.colSpan = 6;
    row.appendChild(cell);
    body.appendChild(row);
  }

  for (const record of records) {
    const maximum = getInventoryCount(record.capacity ?? record.totalInventoryCount);
    const current = getInventoryCount(record.currentInventoryCount);
    const replenishment = maximum !== null && current !== null
      ? Math.max(0, maximum - current)
      : null;
    const channel = record.cargoPassageNo ?? record.cargoPassageId ?? record.id ?? "—";
    const values = [
      channel,
      record.productName || record.categoryName || "—",
      record.barcode ?? "—",
      maximum === null ? "—" : maximum.toLocaleString("pt-BR"),
      current === null ? "—" : current.toLocaleString("pt-BR"),
      replenishment === null ? "—" : replenishment.toLocaleString("pt-BR")
    ];
    const row = document.createElement("tr");
    for (const value of values) {
      row.appendChild(createResultElement("td", "", String(value)));
    }
    body.appendChild(row);
  }
  table.appendChild(body);
  replenishmentReport.appendChild(table);
}

async function loadReplenishmentReport() {
  const deviceId = replenishmentDeviceSelect.value;
  if (!deviceId) {
    setStatus(replenishmentStatus, "Selecione uma máquina para consultar as reposições.", "error");
    return;
  }

  const requestId = ++replenishmentRequestId;
  hasReplenishmentReport = false;
  replenishmentGeneratedAt = "";
  printReplenishmentBtn.disabled = true;
  renderReplenishmentMachineDetails(getSelectedReplenishmentDevice());
  refreshReplenishmentBtn.disabled = true;
  replenishmentReport.replaceChildren(
    createResultElement("p", "result-placeholder", "Consultando estoque da máquina...")
  );
  setStatus(replenishmentStatus, "Consultando canais e quantidades...");

  try {
    const inventoryTool = getTool("inventory");
    const { response, payload } = await callApi(inventoryTool, { deviceId }, inventoryTool.body);
    const apiCode = payload && typeof payload === "object" ? Number(payload.code) : undefined;
    if (!response.ok || (Number.isFinite(apiCode) && apiCode !== 200)) {
      throw new Error(payload?.msg || payload?.message || `Falha ao consultar estoque (HTTP ${response.status}).`);
    }
    if (requestId !== replenishmentRequestId || deviceId !== replenishmentDeviceSelect.value) return;

    const records = findInventoryRecords(payload);
    renderReplenishmentReport(records);
    replenishmentGeneratedAt = new Date().toLocaleString("pt-BR");
    renderReplenishmentMachineDetails(getSelectedReplenishmentDevice(), replenishmentGeneratedAt);
    hasReplenishmentReport = records.length > 0;
    printReplenishmentBtn.disabled = !hasReplenishmentReport;
    setStatus(
      replenishmentStatus,
      records.length
        ? `Relatório atualizado às ${new Date().toLocaleTimeString()}. A reposição é calculada como quantidade máxima menos estoque atual, limitada a zero.`
        : "Nenhum canal de estoque foi retornado para esta máquina.",
      "success"
    );
  } catch (error) {
    if (requestId !== replenishmentRequestId) return;
    hasReplenishmentReport = false;
    replenishmentGeneratedAt = "";
    printReplenishmentBtn.disabled = true;
    renderReplenishmentMachineDetails(getSelectedReplenishmentDevice());
    replenishmentReport.replaceChildren(
      createResultElement("p", "result-message error", `Não foi possível gerar o relatório: ${error.message}`)
    );
    setStatus(replenishmentStatus, error.message, "error");
  } finally {
    if (requestId === replenishmentRequestId) {
      refreshReplenishmentBtn.disabled = !replenishmentDeviceSelect.value;
    }
  }
}

function handleReplenishmentDeviceChange() {
  hasReplenishmentReport = false;
  replenishmentGeneratedAt = "";
  printReplenishmentBtn.disabled = true;
  refreshReplenishmentBtn.disabled = !replenishmentDeviceSelect.value;
  renderReplenishmentMachineDetails(getSelectedReplenishmentDevice());
  if (!replenishmentDeviceSelect.value) {
    replenishmentRequestId += 1;
    replenishmentReport.replaceChildren(
      createResultElement("p", "result-placeholder", "Selecione uma máquina para gerar o relatório.")
    );
    setStatus(replenishmentStatus, "Selecione uma máquina para consultar as reposições.");
    return;
  }
  loadReplenishmentReport();
}

function renderInventory(records) {
  inventoryCards.replaceChildren();
  inventorySummary.hidden = false;

  const listedRecords = records.filter((record) => Number(record.status) === 2);
  const currentTotal = listedRecords.reduce((sum, record) => {
    const count = Number(record.currentInventoryCount);
    return sum + (Number.isFinite(count) ? count : 0);
  }, 0);
  const capacityTotal = listedRecords.reduce((sum, record) => {
    const count = Number(record.capacity ?? record.totalInventoryCount);
    return sum + (Number.isFinite(count) ? count : 0);
  }, 0);

  inventoryListedCount.textContent = listedRecords.length.toLocaleString();
  inventoryCurrentTotal.textContent = currentTotal.toLocaleString();
  inventoryCapacityTotal.textContent = capacityTotal.toLocaleString();

  if (records.length === 0) {
    const empty = document.createElement("p");
    empty.className = "inventory-empty";
    empty.textContent = "A API não retornou canais de estoque para este dispositivo.";
    inventoryCards.appendChild(empty);
    return;
  }

  for (const record of records) {
    const currentCount = Number(record.currentInventoryCount);
    const capacity = Number(record.capacity ?? record.totalInventoryCount);
    const hasCounts = Number.isFinite(currentCount) && Number.isFinite(capacity);
    const percentage = hasCounts && capacity > 0
      ? Math.min(100, Math.max(0, (currentCount / capacity) * 100))
      : 0;
    const channelStatus = Number(record.status);
    const isListed = channelStatus === 2;
    const channelName = record.cargoPassageNo ?? record.cargoPassageId ?? record.id;

    const card = document.createElement("article");
    card.className = "inventory-card";

    const heading = document.createElement("div");
    heading.className = "inventory-card-heading";
    const productDetails = document.createElement("div");
    productDetails.className = "inventory-product-details";
    const product = document.createElement("h3");
    product.textContent = record.productName || record.categoryName ||
      (channelName === undefined || channelName === null ? "Canal sem identificação" : `Canal ${channelName}`);
    productDetails.appendChild(product);
    if ((record.productName || record.categoryName) && channelName !== undefined && channelName !== null) {
      const channel = document.createElement("p");
      channel.textContent = `Canal ${channelName}`;
      productDetails.appendChild(channel);
    }
    heading.appendChild(productDetails);

    const status = document.createElement("span");
    status.className = `inventory-state ${isListed ? "listed" : "delisted"}`;
    status.textContent = isListed ? "Listado" : channelStatus === 1 ? "Desativado" : "Status desconhecido";
    heading.appendChild(status);
    card.appendChild(heading);

    const counts = document.createElement("div");
    counts.className = "inventory-counts";
    const current = document.createElement("strong");
    current.textContent = formatInventoryCount(record.currentInventoryCount);
    const capacityLabel = document.createElement("span");
    capacityLabel.textContent = `disponíveis · capacidade ${formatInventoryCount(record.capacity ?? record.totalInventoryCount)}`;
    counts.append(current, capacityLabel);
    card.appendChild(counts);

    const registered = document.createElement("p");
    registered.className = "inventory-registered-count";
    registered.textContent = `Estoque total registrado: ${formatInventoryCount(record.totalInventoryCount)}`;
    card.appendChild(registered);

    const meter = document.createElement("div");
    meter.className = "inventory-meter";
    meter.setAttribute("role", "progressbar");
    meter.setAttribute("aria-label", `Estoque de ${product.textContent}`);
    meter.setAttribute("aria-valuemin", "0");
    meter.setAttribute("aria-valuemax", hasCounts ? String(Math.max(capacity, 0)) : "0");
    meter.setAttribute("aria-valuenow", hasCounts ? String(Math.max(currentCount, 0)) : "0");
    const fill = document.createElement("span");
    fill.style.width = `${percentage}%`;
    if (percentage <= 20) fill.classList.add("low");
    meter.appendChild(fill);
    card.appendChild(meter);

    if (record.categoryName && record.categoryName !== product.textContent) {
      const category = document.createElement("p");
      category.className = "inventory-category";
      category.textContent = record.categoryName;
      card.appendChild(category);
    }
    inventoryCards.appendChild(card);
  }
}

async function showDeviceInventory(device) {
  inventoryTitle.textContent = "Estoque do dispositivo";
  inventoryDeviceLabel.textContent = `${device.deviceName || "Dispositivo"} · ID ${device.id ?? device.deviceUuid ?? "—"}`;
  inventoryCards.replaceChildren();
  inventorySummary.hidden = true;
  setStatus(inventoryStatus, "Consultando estoque...");
  if (!inventoryDialog.open) inventoryDialog.showModal();

  const inventoryTool = getTool("inventory");
  try {
    const { response, payload } = await callApi(
      inventoryTool,
      { deviceId: String(device.id ?? device.deviceUuid ?? "") },
      inventoryTool.body
    );
    const apiCode = payload && typeof payload === "object" ? Number(payload.code) : undefined;
    if (!response.ok || (Number.isFinite(apiCode) && apiCode !== 200)) {
      throw new Error(payload?.msg || payload?.message || `Falha ao consultar estoque (HTTP ${response.status}).`);
    }

    const records = findInventoryRecords(payload);
    renderInventory(records);
    setStatus(inventoryStatus, `Estoque atualizado às ${new Date().toLocaleTimeString()}.`, "success");
  } catch (error) {
    setStatus(inventoryStatus, error.message, "error");
  }
}

function makeDeviceAction(label, toolId, queryKey, value) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary device-action";
  button.textContent = label;
  button.disabled = value === undefined || value === null;
  button.addEventListener("click", () => {
    const device = button.closest("tr")?.deviceRecord;
    if (toolId === "inventory" && device) {
      showDeviceInventory(device);
      return;
    }

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
    updateVendDeviceOptions(records);
    updateReplenishmentDeviceOptions(records);
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
  toolOutput.replaceChildren(createResultElement("p", "result-placeholder", "Enviando requisição..."));
  try {
    const { response, payload, apiPath } = await callApi(tool, query, body);
    const apiCode = payload && typeof payload === "object" ? payload.code : undefined;
    const apiSuccess = typeof apiCode !== "number" || apiCode === 200;
    const succeeded = response.ok && apiSuccess;
    renderToolResult(tool, response, payload, apiPath, succeeded);
    if (!succeeded) {
      setStatus(toolStatus, payload.msg || payload.message || `Falha (HTTP ${response.status}).`, "error");
    } else {
      setStatus(toolStatus, "Operação concluída.", "success");
      if (tool.id === "devices") renderDevices(extractRecords(payload));
    }
  } catch (error) {
    toolOutput.replaceChildren(createResultElement("p", "result-message error", `Erro: ${error.message}`));
    setStatus(toolStatus, error.message, "error");
  } finally {
    runToolBtn.disabled = false;
  }
}

toolSelect.addEventListener("change", updateToolForm);
replenishmentDeviceSelect.addEventListener("change", handleReplenishmentDeviceChange);
refreshReplenishmentBtn.addEventListener("click", loadReplenishmentReport);
printReplenishmentBtn.addEventListener("click", () => {
  if (hasReplenishmentReport) window.print();
});
runToolBtn.addEventListener("click", runTool);
refreshSalesBtn.addEventListener("click", refreshSalesReport);
applySalesPeriodBtn.addEventListener("click", refreshSalesReport);
refreshAbcBtn.addEventListener("click", refreshAbcReport);
vendDeviceSelect.addEventListener("change", () => {
  vendChannelRequestId += 1;
  vendChannelList.replaceChildren(createResultElement("p", "dispense-empty", "Carregue os canais do equipamento selecionado."));
  setStatus(vendChannelStatus, "Selecione “Carregar canais” para consultar os produtos.");
  setStatus(vendStatus, "Aguardando seleção.");
  loadVendChannelsBtn.disabled = !vendDeviceSelect.value;
  updateVendSelectionState();
});
loadVendChannelsBtn.addEventListener("click", loadVendChannels);
selectAllVendChannelsBtn.addEventListener("click", () => {
  vendChannelList.querySelectorAll('input[type="checkbox"]:not(:disabled)').forEach((checkbox) => {
    checkbox.checked = true;
  });
  updateVendSelectionState();
});
clearVendChannelsBtn.addEventListener("click", () => {
  vendChannelList.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.checked = false;
  });
  updateVendSelectionState();
});
runVendBtn.addEventListener("click", runVend);
closeInventoryBtn.addEventListener("click", () => inventoryDialog.close());
inventoryDialog.addEventListener("click", (event) => {
  if (event.target === inventoryDialog) inventoryDialog.close();
});
refreshDevicesBtn.addEventListener("click", () => {
  if (!token) {
    window.location.href = "index.html";
    return;
  }
  refreshDevices();
});
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
const defaultSalesEndDate = new Date();
const defaultSalesStartDate = new Date(defaultSalesEndDate.getTime() - 24 * 60 * 60 * 1000);
salesStartDate.value = formatLocalDate(defaultSalesStartDate);
salesEndDate.value = formatLocalDate(defaultSalesEndDate);
if (!token) {
  monitorContent.hidden = true;
  loginNotice.hidden = false;
} else {
  refreshDevices();
  refreshSalesReport();
  refreshAbcReport();
  salesRefreshTimer = window.setInterval(refreshSalesReport, 5 * 60 * 1000);
  abcRefreshTimer = window.setInterval(refreshAbcReport, 5 * 60 * 1000);
}
