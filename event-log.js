"use strict";

const fs = require("node:fs");
const path = require("node:path");

const LOG_DIRECTORY = path.join(__dirname, "logs");
const LOG_FILE = path.join(LOG_DIRECTORY, "app-events.txt");
const MAX_LOG_BYTES = 100 * 1024 * 1024;
let writeQueue = Promise.resolve();

function formatValue(value, key) {
  if (/token|secret|password|authorization|credential|body/i.test(key)) {
    return JSON.stringify("[REDACTED]");
  }
  return JSON.stringify(String(value ?? "").replace(/[\r\n\t]/g, " ").slice(0, 256));
}

function formatLine(event, details) {
  const fields = Object.entries(details || {})
    .slice(0, 20)
    .map(([key, value]) => {
      const safeKey = key.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 48);
      return safeKey ? `${safeKey}=${formatValue(value, safeKey)}` : "";
    })
    .filter(Boolean);
  return `${new Date().toISOString()} event=${formatValue(event, "event")} ${fields.join(" ")}\n`;
}

async function appendBoundedLine(line) {
  await fs.promises.mkdir(LOG_DIRECTORY, { recursive: true });

  let currentSize = 0;
  try {
    currentSize = (await fs.promises.stat(LOG_FILE)).size;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  if (currentSize + Buffer.byteLength(line, "utf8") <= MAX_LOG_BYTES) {
    await fs.promises.appendFile(LOG_FILE, line, "utf8");
    return;
  }

  const marker = formatLine("log.truncated", {
    reason: "size_limit",
    maxBytes: MAX_LOG_BYTES
  });
  const replacement = `${marker}${line}`;
  await fs.promises.writeFile(
    LOG_FILE,
    Buffer.byteLength(replacement, "utf8") <= MAX_LOG_BYTES ? replacement : marker,
    "utf8"
  );
}

function logEvent(event, details = {}) {
  const line = formatLine(event, details);
  writeQueue = writeQueue
    .then(() => appendBoundedLine(line))
    .catch((error) => {
      console.error("[event-log] Could not write logs/app-events.txt:", error.message);
    });
  return writeQueue;
}

module.exports = { logEvent, LOG_FILE, MAX_LOG_BYTES };
