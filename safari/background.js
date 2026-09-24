// Safari port of background.js; diffs: no sidePanel (guarded via `?.`), contextMenus guarded, action.onClicked is a no-op fallback (Safari opens default_popup automatically).
// FR!sky Paperclip — MV3 service worker. Stateless by design.
const MENU_ID = "paperclip-desk";

chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch(() => {});
  }
  if (chrome.contextMenus) {
    try {
      chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
          id: MENU_ID,
          title: "Open Paperclip desk",
          contexts: ["all"],
        });
      });
    } catch (_) { /* context menus unavailable; popup is the entry point */ }
  }
});

// Safari opens action.default_popup on toolbar click, so this only fires where
// no popup is bound. Keep it as a best-effort fallback that degrades silently.
if (chrome.action && chrome.action.onClicked) {
  chrome.action.onClicked.addListener((tab) => {
    try {
      if (chrome.sidePanel && chrome.sidePanel.open && tab && tab.windowId != null) {
        chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {});
      }
    } catch (_) { /* Safari popup build: nothing to do */ }
  });
}

if (chrome.contextMenus && chrome.contextMenus.onClicked) {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === MENU_ID && tab) {
      try {
        if (chrome.sidePanel && chrome.sidePanel.open && tab.windowId != null) {
          chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {});
        }
      } catch (_) { /* Safari popup build: nothing to do */ }
    }
  });
}
