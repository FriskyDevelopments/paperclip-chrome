// FR!sky Paperclip — options: mind picker + API keys + sidecar endpoint, chrome.storage.local only.
"use strict";

const MINDS = { xai: "xaiKey", openai: "openaiKey" };

const els = {
  mind: document.getElementById("mind"),
  key: { xai: document.getElementById("xai-key"), openai: document.getElementById("openai-key") },
  keyFlag: document.getElementById("key-flag"),
  sidecar: document.getElementById("sidecar"),
  save: document.getElementById("save"),
  status: document.getElementById("status"),
};

async function load() {
  const got = await chrome.storage.local.get(["xaiKey", "openaiKey", "mind", "sidecarEndpoint"]);
  const mind = got.mind === "openai" ? "openai" : "xai";
  els.mind.value = mind;
  if (got.xaiKey) els.key.xai.value = got.xaiKey;
  if (got.openaiKey) els.key.openai.value = got.openaiKey;
  els.keyFlag.hidden = !(mind === "openai" ? got.openaiKey : got.xaiKey);
  els.sidecar.value = got.sidecarEndpoint || "http://127.0.0.1:7429";
}

async function onSave() {
  const mind = els.mind.value === "openai" ? "openai" : "xai";
  const xaiKey = els.key.xai.value.trim();
  const openaiKey = els.key.openai.value.trim();
  const sidecar = els.sidecar.value.trim() || "http://127.0.0.1:7429";
  await chrome.storage.local.set({ xaiKey, openaiKey, mind, sidecarEndpoint: sidecar });
  els.keyFlag.hidden = !((mind === "openai" ? openaiKey : xaiKey));
  try {
    await chrome.permissions.request({ origins: ["http://127.0.0.1:7429/*", "https://api.x.ai/*", "https://api.openai.com/*"] });
  } catch (_) { /* optional grants can be refused; the panel still works without */ }
  els.status.textContent = "Saved.";
  setTimeout(() => { els.status.textContent = ""; }, 2500);
}

els.save.addEventListener("click", onSave);
els.mind.addEventListener("change", () => { els.keyFlag.hidden = true; });
els.key.xai.addEventListener("input", () => { els.keyFlag.hidden = true; });
els.key.openai.addEventListener("input", () => { els.keyFlag.hidden = true; });
load();
