const emptyResponse = document.getElementById("emptyResponse");
const responseContent = document.getElementById("responseContent");
const httpStatusValue = document.getElementById("httpStatusValue");
const responseOutcome = document.getElementById("responseOutcome");
const responseMethod = document.getElementById("responseMethod");
const responseApiCode = document.getElementById("responseApiCode");
const responseUrl = document.getElementById("responseUrl");
const responseData = document.getElementById("responseData");
const rawResponse = document.getElementById("rawResponse");
const toggleRawResponse = document.getElementById("toggleRawResponse");

function makeElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function formatValue(value) {
  if (value === null) return "null";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function renderArray(values) {
  if (values.length === 0) {
    return makeElement("p", "response-empty-value", "A lista retornada está vazia.");
  }

  if (values.every((value) => value && typeof value === "object" && !Array.isArray(value))) {
    const columnSet = new Set();
    for (const value of values.slice(0, 100)) {
      Object.keys(value).forEach((key) => columnSet.add(key));
    }
    const columns = [...columnSet].slice(0, 12);
    const wrapper = makeElement("div", "response-table-wrap");
    const table = makeElement("table", "response-table");
    const head = document.createElement("thead");
    const headerRow = document.createElement("tr");
    for (const column of columns) {
      headerRow.appendChild(makeElement("th", "", column));
    }
    head.appendChild(headerRow);
    table.appendChild(head);

    const body = document.createElement("tbody");
    for (const row of values.slice(0, 100)) {
      const tableRow = document.createElement("tr");
      for (const column of columns) {
        const cell = makeElement("td");
        cell.dataset.label = column;
        const cellContent = makeElement("span", "response-cell-value", formatValue(row[column]));
        cell.appendChild(cellContent);
        tableRow.appendChild(cell);
      }
      body.appendChild(tableRow);
    }
    table.appendChild(body);
    wrapper.appendChild(table);

    if (values.length > 100) {
      wrapper.appendChild(makeElement("p", "response-truncation-note", `Exibindo 100 de ${values.length} itens.`));
    }
    if (columnSet.size > 12) {
      wrapper.appendChild(makeElement("p", "response-truncation-note", "Exibindo as primeiras 12 colunas."));
    }
    return wrapper;
  }

  const list = makeElement("ul", "response-list");
  for (const value of values.slice(0, 100)) {
    const item = document.createElement("li");
    item.textContent = formatValue(value);
    list.appendChild(item);
  }
  if (values.length > 100) {
    list.appendChild(makeElement("li", "response-truncation-note", `Exibindo 100 de ${values.length} itens.`));
  }
  return list;
}

function renderObject(value) {
  const grid = makeElement("div", "response-fields");
  const entries = Object.entries(value);
  if (entries.length === 0) {
    grid.appendChild(makeElement("p", "response-empty-value", "O objeto retornado está vazio."));
    return grid;
  }

  for (const [key, entry] of entries.slice(0, 100)) {
    const card = makeElement("article", "response-field");
    card.appendChild(makeElement("h3", "response-field-label", key));
    if (Array.isArray(entry)) {
      card.appendChild(renderArray(entry));
    } else if (entry && typeof entry === "object") {
      const details = document.createElement("details");
      details.className = "response-nested";
      details.appendChild(makeElement("summary", "", "Expandir objeto"));
      details.appendChild(renderObject(entry));
      card.appendChild(details);
    } else {
      card.appendChild(makeElement("p", "response-field-value", formatValue(entry)));
    }
    grid.appendChild(card);
  }

  if (entries.length > 100) {
    grid.appendChild(makeElement("p", "response-truncation-note", `Exibindo 100 de ${entries.length} campos.`));
  }
  return grid;
}

function renderPayload(value) {
  if (Array.isArray(value)) return renderArray(value);
  if (value && typeof value === "object") return renderObject(value);
  return makeElement("p", "response-field-value", formatValue(value));
}

function initializeViewer() {
  const rawResult = sessionStorage.getItem("feigeLastApiResponse");
  if (!rawResult) {
    emptyResponse.hidden = false;
    return;
  }

  let result;
  try {
    result = JSON.parse(rawResult);
  } catch {
    emptyResponse.hidden = false;
    return;
  }

  responseContent.hidden = false;
  httpStatusValue.textContent = result.status ? String(result.status) : "Falha local";
  responseOutcome.textContent = result.ok ? "Sucesso" : "Falha";
  responseOutcome.classList.toggle("is-success", Boolean(result.ok));
  responseOutcome.classList.toggle("is-error", !result.ok);
  responseMethod.textContent = result.method || "—";
  responseApiCode.textContent = result.apiCode === undefined ? "—" : String(result.apiCode);
  responseUrl.textContent = result.url || "—";
  responseUrl.title = result.url || "";
  responseData.appendChild(renderPayload(result.data));
  rawResponse.textContent = JSON.stringify(result.data, null, 2);
}

toggleRawResponse.addEventListener("click", () => {
  const isExpanded = toggleRawResponse.getAttribute("aria-expanded") === "true";
  toggleRawResponse.setAttribute("aria-expanded", String(!isExpanded));
  toggleRawResponse.textContent = isExpanded ? "Ver JSON" : "Ver demonstração";
  responseData.hidden = !isExpanded;
  rawResponse.hidden = isExpanded;
});

initializeViewer();
