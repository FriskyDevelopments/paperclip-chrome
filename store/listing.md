# Chrome Web Store listing — FR!sky Paperclip

## Name
FR!sky Paperclip

## Summary (≤132 chars)
The agent desk in Chrome. Grok plans up to 12 steps. Clip clicks only after you stamp. Halt anytime.

(128 chars)

## Category
Productivity

## Language
English

## Full description

FR!sky Paperclip is the agent desk that lives in your Chrome side panel.

Not Claude-in-Chrome. Not a grok.com bookmark.

HOW IT WORKS
• Type a task. Grok (grok-4-fast via the xAI API) plans and acts in up to 12 steps.
• Clip can read the active tab and snapshot the page for free.
• HANDS actions — navigate, click, type — only run while you've pressed STAMP.
• Press HALT and everything stops, instantly. Halt also disarms the hands.
• Page content is treated as untrusted data, never as instructions.

SAFETY BY DESIGN
• Stamp arms Clip's hands. Halt stops everything.
• Unstamped HANDS calls are blocked and reported in the log.
• Max 12 steps per run — the loop can't spin forever.
• Every step, tool call, and result is visible in the desk log.

YOUR KEY, YOUR MACHINE
• Bring your own xAI API key. It's stored in chrome.storage.local.
• Your key never leaves this machine. Page content goes to api.x.ai only when you press RUN.
• No accounts. No analytics. Nothing sent to Frisky servers.

OPTIONAL CLIP SIDECAR
• Point the desk at a local Clip sidecar on http://127.0.0.1:7429 for fuller page snapshots.
• Falls back to the native messaging host com.friskydev.paperclip, then degrades gracefully to read_tab.

PRICING
$19 launch / $29 on Whop. Already included in the $49 FR!sky kit.
https://friskydevelopments.github.io/paperclip-chrome/
