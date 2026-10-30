const loginNotice = document.getElementById("loginNotice");
const testsContent = document.getElementById("testsContent");
const channelTestForm = document.getElementById("channelTestForm");
const deviceIdInput = document.getElementById("deviceIdInput");
const channelIdsInput = document.getElementById("channelIdsInput");
const runChannelTestBtn = document.getElementById("runChannelTestBtn");
const channelTestStatus = document.getElementById("channelTestStatus");
const channelTestOutput = document.getElementById("channelTestOutput");
const channelResultForm = document.getElementById("channelResultForm");
const taskIdInput = document.getElementById("taskIdInput");
const getChannelResultBtn = document.getElementById("getChannelResultBtn");
const channelResultStatus = document.getElementById("channelResultStatus");
const channelResultOutput = document.getElementById("channelResultOutput");
const token = sessionStorage.getItem("feigeAuthToken") || "";

const CHANNEL_TEST_PATH = "/api/luobo-machine-api/api/v1/deviceInventory/testChannel";
const CHANNEL_RESULT_PATH = "/api/luobo-machine-api/api/v1/deviceInventory/getTestResult";

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

async function callApi(path, method, body) {
  if (!token) {
    throw new Error("Sessão não encontrada. Entre pelo API Tester e autentique-se novamente.");
  }

  const response = await fetch(getLocalBackendEndpoint("/api/proxy"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path,
      method,
      ...(body === undefined ? {} : { body }),
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
  return { response, payload };
}

function apiSucceeded(response, payload) {
  const apiCode = payload && typeof payload === "object" ? Number(payload.code) : undefined;
  return response.ok && (!Number.isFinite(apiCode) || apiCode === 200);
}

function getTaskId(payload) {
  const candidates = [
    payload?.result,
    payload?.data?.result,
    payload?.data?.testId,
    payload?.testId
  ];
  const taskId = candidates.find((candidate) =>
    typeof candidate === "string" || typeof candidate === "number"
  );
  return taskId === undefined ? "" : String(taskId);
}

async function runChannelTest(event) {
  event.preventDefault();
  const deviceId = deviceIdInput.value.trim();
  const ids = channelIdsInput.value.split(/[,\r\n]+/).map((id) => id.trim()).filter(Boolean);
  if (!deviceId || ids.length === 0) {
    setStatus(channelTestStatus, "Informe o ID do dispositivo e ao menos um ID de canal.", "error");
    return;
  }

  const confirmation = [
    "O teste pode acionar fisicamente o equipamento.",
    "",
    `Dispositivo: ${deviceId}`,
    `Canais: ${ids.join(", ")}`,
    "",
    "Deseja continuar?"
  ].join("\n");
  if (!window.confirm(confirmation)) return;

  runChannelTestBtn.disabled = true;
  setStatus(channelTestStatus, "Executando teste...");
  channelTestOutput.textContent = "Enviando requisição...";
  try {
    const { response, payload } = await callApi(CHANNEL_TEST_PATH, "POST", { deviceId, ids });
    const result = {
      operation: "Testar canais",
      method: "POST",
      path: CHANNEL_TEST_PATH,
      httpStatus: response.status,
      apiCode: payload && typeof payload === "object" ? payload.code : undefined,
      ok: apiSucceeded(response, payload),
      data: payload
    };
    channelTestOutput.textContent = JSON.stringify(result, null, 2);
    if (!result.ok) {
      setStatus(channelTestStatus, payload?.msg || payload?.message || `Falha (HTTP ${response.status}).`, "error");
      return;
    }

    const taskId = getTaskId(payload);
    if (taskId) taskIdInput.value = taskId;
    setStatus(channelTestStatus, taskId ? `Teste iniciado. ID da tarefa: ${taskId}` : "Teste solicitado.", "success");
  } catch (error) {
    channelTestOutput.textContent = `Erro: ${error.message}`;
    setStatus(channelTestStatus, error.message, "error");
  } finally {
    runChannelTestBtn.disabled = false;
  }
}

async function getChannelResult(event) {
  event.preventDefault();
  const taskId = taskIdInput.value.trim();
  if (!taskId) {
    setStatus(channelResultStatus, "Informe o ID da tarefa.", "error");
    return;
  }

  getChannelResultBtn.disabled = true;
  setStatus(channelResultStatus, "Consultando resultado...");
  channelResultOutput.textContent = "Enviando requisição...";
  try {
    const query = new URLSearchParams({ id: taskId });
    const path = `${CHANNEL_RESULT_PATH}?${query.toString()}`;
    const { response, payload } = await callApi(path, "GET");
    const result = {
      operation: "Consultar teste de canais",
      method: "GET",
      path,
      httpStatus: response.status,
      apiCode: payload && typeof payload === "object" ? payload.code : undefined,
      ok: apiSucceeded(response, payload),
      data: payload
    };
    channelResultOutput.textContent = JSON.stringify(result, null, 2);
    if (!result.ok) {
      setStatus(channelResultStatus, payload?.msg || payload?.message || `Falha (HTTP ${response.status}).`, "error");
    } else {
      setStatus(channelResultStatus, "Resultado consultado.", "success");
    }
  } catch (error) {
    channelResultOutput.textContent = `Erro: ${error.message}`;
    setStatus(channelResultStatus, error.message, "error");
  } finally {
    getChannelResultBtn.disabled = false;
  }
}

channelTestForm.addEventListener("submit", runChannelTest);
channelResultForm.addEventListener("submit", getChannelResult);

if (!token) {
  testsContent.hidden = true;
  loginNotice.hidden = false;
}
