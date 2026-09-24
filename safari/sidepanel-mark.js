// Safari port of sidepanel-mark.js; diffs: none (presentational only).
// FR!sky Paperclip — presentational only: tints the "[UNTRUSTED PAGE CONTENT]"
// marker inside desk-log rows. No logic, no behavior changes to the loop.
"use strict";

(function () {
  const MARKER = "[UNTRUSTED PAGE CONTENT]";
  const log = document.getElementById("log");
  if (!log) return;

  function tint(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const i = node.data.indexOf(MARKER);
      if (i === -1) return;
      const after = node.splitText(i);
      after.splitText(MARKER.length);
      const span = document.createElement("span");
      span.className = "untrusted";
      span.textContent = MARKER;
      node.parentNode.replaceChild(span, after);
    } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains("untrusted")) {
      Array.from(node.childNodes).forEach(tint);
    }
  }

  new MutationObserver((mutations) => {
    for (const m of mutations) m.addedNodes.forEach(tint);
  }).observe(log, { childList: true, subtree: true });
})();
