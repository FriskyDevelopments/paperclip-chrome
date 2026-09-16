// FR!sky Paperclip — MV3 service worker. Stateless by design.
const MENU_ID = "paperclip-desk";

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(() => {});
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Open Paperclip desk",
      contexts: ["all"],
    });
  });
});

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {});
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MENU_ID && tab) {
    chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {});
  }
});
