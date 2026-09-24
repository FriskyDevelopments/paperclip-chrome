# Permission justifications — FR!sky Paperclip (Chrome Web Store review)

## Permissions

### sidePanel
The product is the desk itself: a side panel where the user types a task, stamps/arm's the agent's hands, halts, and watches the run log. The side panel is the entire UI surface.

### activeTab
Tools like read_tab, click, and type_text act on the tab the user is currently looking at. activeTab grants temporary access to that tab only, and only in response to the user's run — no broad host access to every site.

### scripting
chrome.scripting.executeScript is how read_tab extracts the page's visible text and how the click/type_text tools act inside the page after a human stamp. Injection only happens on the active tab during a user-initiated run.

### contextMenus
Adds a single "Open Paperclip desk" context-menu entry so the panel can be opened from a right-click anywhere. It opens the side panel; it reads no page data.

### storage
chrome.storage.local holds the user's API keys (xAI, OpenAI), the chosen mind, and the sidecar endpoint. All stay on the machine; nothing is synced or transmitted to Frisky.

### nativeMessaging
Fallback channel to the optional Clip sidecar: if the local HTTP endpoint is unreachable, the desk asks the native host com.friskydev.paperclip for a page snapshot. Runs only when the user runs the loop.

## Optional host permissions

### http://127.0.0.1:7429/*
The optional Clip sidecar is a local helper the user runs on their own machine. The desk POSTs to /snapshot to get a fuller page snapshot. Localhost only; nothing leaves the machine on this channel. Requested at runtime with the user's consent.

### https://api.x.ai/*
The planning loop calls the xAI chat completions API with the user's own key when Grok is the chosen mind. Page content and the task are sent here — and only here — when the user presses RUN. Requested at runtime with the user's consent.

### https://api.openai.com/*
The planning loop calls the OpenAI chat completions API with the user's own key when GPT is the chosen mind. Page content and the task are sent here — and only here — when the user presses RUN. Requested at runtime with the user's consent.

### https://api.apify.com/*
The scrape tool calls the Apify Website Content Crawler (`apify~website-content-crawler`, run-sync endpoint) with the user's own token. Only the crawled page's URL and markdown come back — and only when the model explicitly calls scrape during a run. Requested at runtime with the user's consent.

## Required disclosures

### Remote code
None. FR!sky Paperclip ships no remotely hosted code. All JavaScript is bundled in the extension package and executes locally. The only remote calls are data calls to the chosen mind's API (xAI or OpenAI), the Apify crawl API when the model calls scrape, and the user's localhost sidecar.

### Data usage
- Each API key is stored locally (chrome.storage.local) and sent only to its own endpoint.
- Page content (visible text or sidecar snapshot) is sent only to the chosen mind's API, only when the user explicitly runs the loop. It is prefixed as untrusted data in the prompt.
- Crawled page markdown from Apify is prefixed as untrusted data and sent only to the chosen mind's API, only when the model calls scrape.
- Nothing is sent to Frisky Developments servers. No accounts, no analytics, no telemetry, no data sale or sharing.
- The extension does not collect browsing history; it touches only the active tab, only during a user-initiated run.
