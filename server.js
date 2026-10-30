const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 8000);
const AUTH_URL = "https://veda.figeth.com/api/auth/apply";
const API_ORIGIN = "https://veda.figeth.com";
const ROOT = __dirname;
const ALLOWED_AUTH_ORIGINS = new Set([
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:8000",
  "http://localhost:8000"
]);
const STATIC_FILES = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
  ["/response-view.html", ["response-view.html", "text/html; charset=utf-8"]],
  ["/response-view.js", ["response-view.js", "text/javascript; charset=utf-8"]],
  ["/monitor.html", ["monitor.html", "text/html; charset=utf-8"]],
  ["/monitor.js", ["monitor.js", "text/javascript; charset=utf-8"]],
  ["/monitor-tests.html", ["monitor-tests.html", "text/html; charset=utf-8"]],
  ["/monitor-tests.js", ["monitor-tests.js", "text/javascript; charset=utf-8"]],
  ["/monitor.css", ["monitor.css", "text/css; charset=utf-8"]],
  ["/style.css", ["style.css", "text/css; charset=utf-8"]],
  ["/auth-test.html", ["auth-test.html", "text/html; charset=utf-8"]],
  ["/README.md", ["README.md", "text/markdown; charset=utf-8"]]
]);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

function getCorsHeaders(origin) {
  if (!ALLOWED_AUTH_ORIGINS.has(origin)) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin"
  };
}

function sendJson(response, statusCode, payload, origin) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...getCorsHeaders(origin)
  });
  response.end(JSON.stringify(payload));
}

function validateLocalRequest(request, response) {
  const allowedHosts = new Set([`${HOST}:${PORT}`, `localhost:${PORT}`]);
  if (!allowedHosts.has(request.headers.host)) {
    sendJson(response, 400, { message: "Invalid local host." });
    return false;
  }

  const origin = request.headers.origin;
  if (origin && !ALLOWED_AUTH_ORIGINS.has(origin)) {
    sendJson(response, 403, { message: "Cross-origin request is not allowed." });
    return false;
  }
  return true;
}

function handlePreflight(request, response) {
  if (!validateLocalRequest(request, response)) {
    return;
  }

  const origin = request.headers.origin;
  const requestedMethod = request.headers["access-control-request-method"];
  const requestedHeaders = (request.headers["access-control-request-headers"] || "")
    .split(",")
    .map((header) => header.trim().toLowerCase())
    .filter(Boolean);
  if (!origin || !ALLOWED_AUTH_ORIGINS.has(origin) || requestedMethod !== "POST" ||
      requestedHeaders.some((header) => header !== "content-type")) {
    sendJson(response, 403, { message: "Cross-origin request is not allowed." }, origin);
    return;
  }

  response.writeHead(204, {
    ...getCorsHeaders(origin),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600"
  });
  response.end();
}

async function readJsonBody(request, maximumBytes = 1024 * 1024) {
  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of request) {
    totalBytes += chunk.length;
    if (totalBytes > maximumBytes) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  if (totalBytes === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

async function authenticate(request, response) {
  const origin = request.headers.origin;
  if (!validateLocalRequest(request, response)) {
    return;
  }

  if ((request.headers["content-length"] && Number(request.headers["content-length"]) > 0) ||
      request.headers["transfer-encoding"]) {
    sendJson(response, 400, { message: "Authentication credentials are server-managed." }, origin);
    request.resume();
    return;
  }
  request.resume();

  const appKey = process.env.FEIGE_APP_KEY;
  const appSecret = process.env.FEIGE_APP_SECRET;
  if (!appKey || !appSecret) {
    sendJson(response, 500, { message: "Server credentials are not configured." }, origin);
    return;
  }

  try {
    const upstreamResponse = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appKey, appSecret }),
      signal: AbortSignal.timeout(30000)
    });
    const responseBody = await upstreamResponse.text();
    if (Buffer.byteLength(responseBody, "utf8") > 1024 * 1024) {
      sendJson(response, 502, { message: "Authentication server returned an oversized response." }, origin);
      return;
    }

    response.writeHead(upstreamResponse.status, {
      "Content-Type": upstreamResponse.headers.get("content-type") || "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...getCorsHeaders(origin)
    });
    response.end(responseBody);
  } catch {
    sendJson(response, 502, { message: "Could not reach the authentication server." }, origin);
  }
}

async function proxyApiRequest(request, response) {
  const origin = request.headers.origin;
  if (!validateLocalRequest(request, response)) {
    return;
  }

  let input;
  try {
    input = await readJsonBody(request);
  } catch (error) {
    sendJson(response, error.statusCode || 400, { message: error.message }, origin);
    return;
  }

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    sendJson(response, 400, { message: "Request body must be a JSON object." }, origin);
    return;
  }

  if (typeof input.path !== "string" || !input.path.startsWith("/api/") ||
      input.path.startsWith("//") || input.path.includes("\\") ||
      typeof input.token !== "string" || !input.token.trim()) {
    sendJson(response, 400, { message: "A relative /api path and access token are required." }, origin);
    return;
  }

  const method = typeof input.method === "string" ? input.method.toUpperCase() : "";
  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    sendJson(response, 400, { message: "Unsupported API method." }, origin);
    return;
  }

  let targetUrl;
  try {
    targetUrl = new URL(input.path, API_ORIGIN);
  } catch {
    sendJson(response, 400, { message: "Invalid API path." }, origin);
    return;
  }
  if (targetUrl.origin !== API_ORIGIN || !targetUrl.pathname.startsWith("/api/")) {
    sendJson(response, 400, { message: "Only the configured Feige API is available." }, origin);
    return;
  }

  const hasBody = method !== "GET" && input.body !== undefined;
  if (hasBody && Buffer.byteLength(JSON.stringify(input.body), "utf8") > 1024 * 1024) {
    sendJson(response, 413, { message: "API request body is too large." }, origin);
    return;
  }

  const forwardedHeaders = {};
  if (input.headers !== undefined) {
    if (!input.headers || typeof input.headers !== "object" || Array.isArray(input.headers)) {
      sendJson(response, 400, { message: "API headers must be a JSON object." }, origin);
      return;
    }
    for (const [name, value] of Object.entries(input.headers)) {
      if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name) || typeof value !== "string" ||
          /^(authorization|host|cookie|content-length|origin)$/i.test(name)) {
        sendJson(response, 400, { message: `Invalid or restricted API header: ${name}.` }, origin);
        return;
      }
      forwardedHeaders[name] = value;
    }
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method,
      headers: {
        ...forwardedHeaders,
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${input.token.trim()}`,
      },
      ...(hasBody ? { body: JSON.stringify(input.body) } : {}),
      signal: AbortSignal.timeout(30000)
    });
    const responseBody = await upstreamResponse.text();
    if (Buffer.byteLength(responseBody, "utf8") > 2 * 1024 * 1024) {
      sendJson(response, 502, { message: "API returned an oversized response." }, origin);
      return;
    }

    response.writeHead(upstreamResponse.status, {
      "Content-Type": upstreamResponse.headers.get("content-type") || "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...getCorsHeaders(origin)
    });
    response.end(responseBody);
  } catch {
    sendJson(response, 502, { message: "Could not reach the Feige API." }, origin);
  }
}

const server = http.createServer(async (request, response) => {
  let requestUrl;
  try {
    requestUrl = new URL(request.url, `http://${request.headers.host || `${HOST}:${PORT}`}`);
  } catch {
    response.writeHead(400);
    response.end("Invalid request URL");
    return;
  }
  if (requestUrl.pathname === "/api/authenticate") {
    if (request.method === "OPTIONS") {
      handlePreflight(request, response);
      return;
    }

    if (request.method !== "POST") {
      response.writeHead(405, { Allow: "POST", "Cache-Control": "no-store" });
      response.end();
      return;
    }
    await authenticate(request, response);
    return;
  }

  if (requestUrl.pathname === "/api/proxy") {
    if (request.method === "OPTIONS") {
      handlePreflight(request, response);
      return;
    }
    if (request.method !== "POST") {
      response.writeHead(405, { Allow: "POST, OPTIONS", "Cache-Control": "no-store" });
      response.end();
      return;
    }
    await proxyApiRequest(request, response);
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  const asset = STATIC_FILES.get(requestUrl.pathname);
  if (!asset) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  const filePath = path.join(ROOT, asset[0]);
  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(500);
      response.end("Could not read application file.");
      return;
    }

    response.writeHead(200, {
      "Content-Type": asset[1],
      "X-Content-Type-Options": "nosniff"
    });
    response.end(request.method === "HEAD" ? undefined : content);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Feige API Tester available at http://${HOST}:${PORT}`);
});
