// FR!sky Paperclip — options: xAI key + sidecar endpoint, chrome.storage.local only.
"use strict";

const els = {
  key: document.getElementById("xai-key"),
  keyFlag: document.getElementById("key-flag"),
  sidecar: document.getElementById("sidecar"),
  save: document.getElementById("save"),
  status: document.getElementById("status"),
};

async function load() {
  const got = await chrome.storage.local.get(["xaiKey", "sidecarEndpoint"]);
  if (got.xaiKey) {
    els.key.value = got.xaiKey;
    els.keyFlag.hidden = false;
  }
  els.sidecar.value = got.sidecarEndpoint || "http://127.0.0.1:7429";
}

async function onSave() {
  const key = els.key.value.trim();
  const sidecar = els.sidecar.value.trim() || "http://127.0.0.1:7429";
  await chrome.storage.local.set({ xaiKey: key, sidecarEndpoint: sidecar });
  els.keyFlag.hidden = !key;
  try {
    await chrome.permissions.request({ origins: ["http://127.0.0.1:7429/*", "https://api.x.ai/*"] });
  } catch (_) { /* optional grants can be refused; the panel still works without */ }
  els.status.textContent = "Saved.";
  setTimeout(() => { els.status.textContent = ""; }, 2500);
}

els.save.addEventListener("click", onSave);
els.key.addEventListener("input", () => { els.keyFlag.hidden = true; });
load();
