# Privacy Policy — FR!sky Paperclip

Effective date: 2026-09-16
Contact: founder@friskydev.com

FR!sky Paperclip ("the extension") is an agent desk for Chrome built by Frisky Developments. This policy covers everything the extension touches.

## Your mind's API key

You pick the mind — Grok (xAI) or GPT (OpenAI) — and bring your own API key for it. It is stored in `chrome.storage.local` on your machine. It is transmitted only to that mind's API endpoint to authenticate your requests, and only when you press RUN. It is never sent to Frisky Developments or any third party.

## Page content

When you run the loop, the extension may read the visible text of your active tab (or request a snapshot from your local Clip sidecar) and include it in the prompt sent to your mind's API. This happens only on an explicit run that you start. Page content is treated as untrusted data inside the prompt. It is never sent anywhere else.

## Apify scrape token

The optional `scrape` tool needs your own Apify API token. It lives in `chrome.storage.local` and is sent only to `api.apify.com` to run the Website Content Crawler, and only when the model calls scrape during a run. Crawled pages are treated as untrusted data.

## Local sidecar

If you run the optional Clip sidecar, the extension talks to it on `http://127.0.0.1:7429` or via the native messaging host `com.friskydev.paperclip`. That traffic never leaves your machine.

## What we don't do

- No accounts, no sign-in.
- No analytics, no telemetry, no crash reporting.
- No cookies, no tracking pixels, no fingerprinting.
- No browsing-history collection. The extension touches only the active tab, only during a run you start.
- No data sale, no data sharing, no advertising.

## Data retention

We hold nothing. All state (your key, the sidecar endpoint, the on-screen log) lives in your browser and disappears when you clear it or uninstall the extension.

## Changes

If this policy changes, the change ships with a new extension version and is visible in this repository.

## Contact

Questions: founder@friskydev.com
