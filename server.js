const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 8000);
const AUTH_URL = "https://veda.figeth.com/api/auth/apply";
const ROOT = __dirname;
const STATIC_FILES = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
  ["/style.css", ["style.css", "text/css; charset=utf-8"]],
  ["/auth-test.html", ["auth-test.html", "text/html; charset=utf-8"]],
  ["/README.md", ["README.md", "text/markdown; charset=utf-8"]]
]);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

async function authenticate(request, response) {
  const allowedHosts = new Set([`${HOST}:${PORT}`, `localhost:${PORT}`]);
  if (!allowedHosts.has(request.headers.host)) {
    sendJson(response, 400, { message: "Invalid local host." });
    return;
  }

  const origin = request.headers.origin;
  if (origin && origin !== `http://${request.headers.host}`) {
    sendJson(response, 403, { message: "Cross-origin authentication is not allowed." });
    return;
  }

  if ((request.headers["content-length"] && Number(request.headers["content-length"]) > 0) ||
      request.headers["transfer-encoding"]) {
    sendJson(response, 400, { message: "Authentication credentials are server-managed." });
    request.resume();
    return;
  }
  request.resume();

  const appKey = process.env.FEIGE_APP_KEY;
  const appSecret = process.env.FEIGE_APP_SECRET;
  if (!appKey || !appSecret) {
    sendJson(response, 500, { message: "Protected server credentials are not configured." });
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
      sendJson(response, 502, { message: "Authentication server returned an oversized response." });
      return;
    }

    response.writeHead(upstreamResponse.status, {
      "Content-Type": upstreamResponse.headers.get("content-type") || "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    });
    response.end(responseBody);
  } catch {
    sendJson(response, 502, { message: "Could not reach the authentication server." });
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
    if (request.method !== "POST") {
      response.writeHead(405, { Allow: "POST", "Cache-Control": "no-store" });
      response.end();
      return;
    }
    await authenticate(request, response);
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
