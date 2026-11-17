"use strict";

const productSearch = document.getElementById("productSearch");
const productLocation = document.getElementById("productLocation");
const productSort = document.getElementById("productSort");
const productGrid = document.getElementById("productGrid");
const catalogStatus = document.getElementById("catalogStatus");
const catalogProductCount = document.getElementById("catalogProductCount");
const catalogPhotoCount = document.getElementById("catalogPhotoCount");
const catalogUnitCount = document.getElementById("catalogUnitCount");
const catalogPhotoEstimatedValue = document.getElementById("catalogPhotoEstimatedValue");
const downloadNoPhotoReport = document.getElementById("downloadNoPhotoReport");
const numberFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const currencyFormat = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});
const csvNumberFormat = new Intl.NumberFormat("pt-BR", {
  useGrouping: false,
  maximumFractionDigits: 2
});

let products = [];

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  element.textContent = text;
  return element;
}

function formatQuantity(quantity) {
  return numberFormat.format(quantity || 0);
}

function photoUrl(filePath) {
  const encodedPath = filePath.split("/").map(encodeURIComponent).join("/");
  return `/Fotos%20Vending%20Machine/${encodedPath}`;
}

function appendFact(list, label, value) {
  const item = document.createElement("div");
  item.append(
    createTextElement("dt", "", label),
    createTextElement("dd", "", value)
  );
  list.append(item);
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const heading = document.createElement("header");
  heading.className = "product-card-heading";
  heading.append(
    createTextElement("span", "product-code", product.code),
    createTextElement("h3", "", product.name)
  );
  card.append(heading);

  const gallery = document.createElement("div");
  gallery.className = "product-gallery";
  if (product.images.length) {
    for (const filePath of product.images) {
      const figure = document.createElement("figure");
      figure.className = "product-photo";
      const link = document.createElement("a");
      link.href = photoUrl(filePath);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const image = document.createElement("img");
      image.src = photoUrl(filePath);
      image.alt = `${product.name} — código ${product.code}`;
      image.loading = "lazy";
      image.addEventListener("error", () => {
        figure.replaceChildren(createTextElement("div", "product-no-photo", "Imagem indisponível"));
      }, { once: true });
      link.append(image);
      figure.append(
        link,
        createTextElement("figcaption", "", filePath.split("/").pop())
      );
      gallery.append(figure);
    }
  } else {
    const placeholder = createTextElement("div", "product-no-photo", "");
    placeholder.append(
      createTextElement("strong", "", "Foto não encontrada"),
      document.createTextNode(`Nenhuma foto começa com o código ${product.code}.`)
    );
    gallery.append(placeholder);
  }
  card.append(gallery);

  const facts = document.createElement("dl");
  facts.className = "product-facts";
  appendFact(facts, "Preço de venda", currencyFormat.format(product.price));
  appendFact(facts, "Estoque total", formatQuantity(product.quantity));
  appendFact(facts, "Valor estimado", currencyFormat.format(product.estimatedValue));
  card.append(facts);

  const attributes = document.createElement("p");
  attributes.className = "product-attributes";
  for (const [label, value] of [
    ["Cor", product.color],
    ["Tamanho", product.size],
    ["Variação", product.variation]
  ]) {
    if (value) {
      attributes.append(createTextElement("span", "", `${label}: ${value}`));
    }
  }
  card.append(attributes);

  const stock = document.createElement("section");
  stock.className = "product-stock";
  stock.append(createTextElement("p", "product-stock-title", "Quantidade por local"));
  const stockList = document.createElement("ul");
  for (const [location, quantity] of Object.entries(product.stocks)) {
    const row = document.createElement("li");
    row.append(
      createTextElement("span", "", location),
      createTextElement("strong", "", formatQuantity(quantity))
    );
    stockList.append(row);
  }
  stock.append(stockList);
  card.append(stock);
  return card;
}

function renderProducts() {
  const query = normalizeText(productSearch.value.trim());
  const selectedLocation = productLocation.value;
  const filtered = products.filter((product) => {
    if (selectedLocation && !Object.hasOwn(product.stocks, selectedLocation)) {
      return false;
    }
    if (!query) {
      return true;
    }

    const searchable = [
      product.code,
      product.name,
      product.color,
      product.size,
      product.variation,
      ...Object.keys(product.stocks),
      ...product.images.map((image) => image.split("/").pop())
    ].map(normalizeText).join(" ");
    return searchable.includes(query);
  });
  const sortBy = productSort.value;
  filtered.sort((a, b) =>
    Number(b[sortBy]) - Number(a[sortBy]) || a.code.localeCompare(b.code, "pt-BR")
  );

  productGrid.replaceChildren();
  if (!filtered.length) {
    productGrid.append(createTextElement("p", "product-empty", "Nenhum produto corresponde aos filtros."));
  } else {
    const cards = document.createDocumentFragment();
    for (const product of filtered) {
      cards.append(createProductCard(product));
    }
    productGrid.append(cards);
  }

  const withPhotos = filtered.filter((product) => product.images.length).length;
  catalogStatus.textContent =
    `Exibindo ${filtered.length} de ${products.length} variações; ${withPhotos} com foto e ${filtered.length - withPhotos} sem foto correspondente.`;
}

function populateLocations() {
  const locations = new Set();
  for (const product of products) {
    for (const location of Object.keys(product.stocks)) {
      locations.add(location);
    }
  }
  for (const location of [...locations].sort((a, b) => a.localeCompare(b, "pt-BR"))) {
    const option = document.createElement("option");
    option.value = location;
    option.textContent = location;
    productLocation.append(option);
  }
}

function csvText(value) {
  const text = String(value || "");
  const safeText = /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}

function csvNumber(value) {
  return csvNumberFormat.format(Number(value) || 0);
}

function downloadMissingPhotoReport() {
  const missingPhotoProducts = products
    .filter((product) => product.images.length === 0)
    .sort((a, b) =>
      Number(b.price) - Number(a.price) || a.code.localeCompare(b.code, "pt-BR")
    );
  const locations = [...new Set(products.flatMap((product) => Object.keys(product.stocks)))]
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
  const headers = [
    "Código",
    "Produto",
    "Cor",
    "Tamanho",
    "Variação",
    "Preço de venda (R$)",
    "Quantidade total",
    "Valor estimado (R$)",
    ...locations
  ].map(csvText);
  const rows = missingPhotoProducts.map((product) => [
    csvText(product.code),
    csvText(product.name),
    csvText(product.color),
    csvText(product.size),
    csvText(product.variation),
    csvNumber(product.price),
    csvNumber(product.quantity),
    csvNumber(product.estimatedValue),
    ...locations.map((location) => csvNumber(product.stocks[location]))
  ]);
  const csv = `\uFEFF${[headers, ...rows].map((row) => row.join(";")).join("\r\n")}`;
  const objectUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const downloadLink = document.createElement("a");
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
  downloadLink.href = objectUrl;
  downloadLink.download = `relatorio-produtos-sem-foto-${date}.csv`;
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  catalogStatus.textContent = `Relatório baixado com ${missingPhotoProducts.length} produtos sem foto.`;
}

async function loadProducts() {
  try {
    const response = await fetch("products.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Não foi possível carregar o catálogo (HTTP ${response.status}).`);
    }
    const data = await response.json();
    if (!Array.isArray(data) || data.some((product) =>
      !product || typeof product.code !== "string" ||
      typeof product.name !== "string" || !product.stocks ||
      !Array.isArray(product.images)
    )) {
      throw new Error("O arquivo do catálogo contém dados inválidos.");
    }

    products = data;
    catalogProductCount.textContent = numberFormat.format(products.length);
    catalogPhotoCount.textContent = numberFormat.format(
      products.filter((product) => product.images.length).length
    );
    catalogUnitCount.textContent = numberFormat.format(
      products.reduce((sum, product) => sum + (Number(product.quantity) || 0), 0)
    );
    const photoEstimatedCents = products.reduce((sum, product) =>
      sum + (product.images.length ? Math.round((Number(product.estimatedValue) || 0) * 100) : 0), 0
    );
    catalogPhotoEstimatedValue.textContent = currencyFormat.format(photoEstimatedCents / 100);
    populateLocations();
    downloadNoPhotoReport.disabled = false;
    renderProducts();
  } catch (error) {
    catalogStatus.classList.add("error");
    catalogStatus.textContent = error.message || "Falha ao carregar o catálogo.";
  }
}

productSearch.addEventListener("input", renderProducts);
productLocation.addEventListener("change", renderProducts);
productSort.addEventListener("change", renderProducts);
downloadNoPhotoReport.addEventListener("click", downloadMissingPhotoReport);
loadProducts();
