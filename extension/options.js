// FR!sky Paperclip — options: mind picker + API keys + sidecar endpoint, chrome.storage.local only.
"use strict";

const els = {
  mindInputs: Array.from(document.querySelectorAll('input[name="mind"]')),
  key: { xai: document.getElementById("xai-key"), openai: document.getElementById("openai-key") },
  blocks: { xai: document.getElementById("xai-block"), openai: document.getElementById("openai-block") },
  keyFlag: document.getElementById("key-flag"),
  sidecar: document.getElementById("sidecar"),
  save: document.getElementById("save"),
  status: document.getElementById("status"),
};

function currentMind() {
  const checked = document.querySelector('input[name="mind"]:checked');
  return checked && checked.value === "openai" ? "openai" : "xai";
}

function onMindChange(ev) {
  const mind = ev && ev.target && ev.target.value === "openai" ? "openai" : currentMind();
  showMindBlock(mind);
  els.keyFlag.hidden = true;
}

function signCard(mind, hasKey) {
  const card = document.querySelector(`.mind-card[data-mind="${mind}"]`);
  if (card) card.classList.toggle("signed", !!hasKey);
}

function refreshSigned() {
  signCard("xai", els.key.xai.value.trim());
  signCard("openai", els.key.openai.value.trim());
}

function showMindBlock(mind) {
  els.blocks.xai.hidden = mind !== "xai";
  els.blocks.openai.hidden = mind !== "openai";
}


async function load() {
  const got = await chrome.storage.local.get(["xaiKey", "openaiKey", "mind", "sidecarEndpoint"]);
  const mind = got.mind === "openai" ? "openai" : "xai";
  const radio = document.querySelector(`input[name="mind"][value="${mind}"]`);
  if (radio) radio.checked = true;
  if (got.xaiKey) els.key.xai.value = got.xaiKey;
  if (got.openaiKey) els.key.openai.value = got.openaiKey;
  showMindBlock(mind);
  refreshSigned();
  els.keyFlag.hidden = !(mind === "openai" ? got.openaiKey : got.xaiKey);
  els.sidecar.value = got.sidecarEndpoint || "http://127.0.0.1:7429";
}

async function onSave() {
  const mind = currentMind();
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
for (const r of els.mindInputs) r.addEventListener("change", onMindChange);
els.key.xai.addEventListener("input", () => { els.keyFlag.hidden = true; refreshSigned(); });
els.key.openai.addEventListener("input", () => { els.keyFlag.hidden = true; refreshSigned(); });
load();
